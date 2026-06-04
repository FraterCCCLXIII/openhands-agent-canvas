// @spec DI-011 / DI-020 / DI-062 / DI-090 / DI-092 — stack supervisor
//
// Reuses the existing launcher (bin/agent-canvas.mjs) rather than duplicating
// process management (DI-011). The launcher is run via the Electron binary in
// Node mode (ELECTRON_RUN_AS_NODE=1), so a packaged app needs no separate Node
// install. Docker mode shells `docker run` against the all-in-one image.
//
// NOTE (DI-010): the spec's end-state is an in-process embeddable `main()` that
// returns a handle. For the POC we supervise the launcher as a child process —
// it fully reuses the existing supervisor and isolates a stack crash from the
// Electron main process. Swapping to the in-process handle is a later refinement.

import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { EventEmitter } from "node:events";
import { existsSync, readFileSync } from "node:fs";
import { get as httpGet } from "node:http";
import * as net from "node:net";
import { homedir } from "node:os";

import { logStack, log } from "./logger";
import {
  getBuildDir,
  getDefaultsConfigPath,
  getLauncherBin,
  getResourceRoot,
} from "./paths";
import {
  getMode,
  getProjectsDir,
  inferInitialMode,
  detectPrereqs,
} from "./runtime";
import type { RuntimeMode, StackStatus, StartOptions } from "./types";

const DOCKER_CONTAINER_NAME = "agent-canvas-desktop";
const PREFERRED_PORT = 8000;
const READY_TIMEOUT_MS = 150_000; // generous: first-run uvx fetch / image pull
const MAX_CRASH_RESTARTS = 3;

function tryPort(port: number, host = "127.0.0.1"): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen(port, host, () => server.close(() => resolve(true)));
  });
}

async function findFreePort(preferred: number): Promise<number> {
  if (await tryPort(preferred)) return preferred;
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : preferred;
      server.close(() => resolve(port));
    });
  });
}

function probeUrl(url: string, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const req = httpGet(url, (res) => {
      res.resume();
      resolve((res.statusCode ?? 500) < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Detect an agent-canvas stack already serving on `port` by probing the
 * agent-server `/server_info` route through the ingress. A plain 200 from `/`
 * is not enough (could be any web server), so we require the API route. (DI-061)
 */
function isAgentCanvasIngress(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = httpGet(
      `http://127.0.0.1:${port}/server_info`,
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      },
    );
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function readDockerImageRef(): string {
  let image = "ghcr.io/openhands/agent-canvas";
  let version = "latest";
  try {
    const defaults = JSON.parse(readFileSync(getDefaultsConfigPath(), "utf8"));
    image = defaults?.images?.agentCanvas ?? image;
  } catch {
    /* use fallback */
  }
  try {
    const pkg = JSON.parse(
      readFileSync(`${getResourceRoot()}/package.json`, "utf8"),
    );
    if (pkg?.version) version = pkg.version; // DI-071: tag tracks shell version
  } catch {
    /* use fallback */
  }
  return `${image}:${version}`;
}

export class Supervisor extends EventEmitter {
  private status: StackStatus = {
    mode: "direct",
    state: "stopped",
    url: null,
  };

  private child: ChildProcess | null = null;

  private usingDocker = false;

  /** True when we attached to a stack we did not start (DI-061). */
  private reusing = false;

  private stopping = false;

  private crashRestarts = 0;

  /** Set once the ingress has answered at least once for this run. */
  private everReady = false;

  /** Captured failure detail when the stack exits before becoming ready. */
  private startupError: string | null = null;

  /** Ring buffer of the child's most recent stderr/stdout lines. */
  private readonly recentLines: string[] = [];

  getStatus(): StackStatus {
    return { ...this.status };
  }

  private setStatus(patch: Partial<StackStatus>): void {
    this.status = { ...this.status, ...patch };
    this.emit("statusChanged", this.getStatus());
  }

  private resolveMode(opts?: StartOptions): RuntimeMode {
    return opts?.mode ?? getMode() ?? inferInitialMode(detectPrereqs());
  }

  async start(opts?: StartOptions): Promise<StackStatus> {
    if (this.status.state === "running" || this.status.state === "starting") {
      return this.getStatus();
    }
    this.stopping = false;
    this.crashRestarts = 0;
    this.everReady = false;
    this.startupError = null;
    this.recentLines.length = 0;
    this.reusing = false;

    const mode = this.resolveMode(opts);
    const preferred = opts?.port ?? PREFERRED_PORT;

    // @spec DI-061 — reuse an agent-canvas stack already running on this
    // machine instead of starting (and colliding with) a second one.
    if (await isAgentCanvasIngress(preferred)) {
      this.reusing = true;
      const url = `http://127.0.0.1:${preferred}/`;
      this.everReady = true;
      this.setStatus({
        mode,
        state: "running",
        url,
        message: "Connected to the agent-canvas stack already running here.",
      });
      log("info", `Reusing existing stack at ${url}`);
      return this.getStatus();
    }

    if (mode !== "docker" && !existsSync(getBuildDir())) {
      this.setStatus({
        mode,
        state: "error",
        url: null,
        message:
          "Frontend build not found. Run `npm run build` in the repo root.",
      });
      return this.getStatus();
    }

    const port = await findFreePort(preferred);
    const url = `http://127.0.0.1:${port}/`;
    this.setStatus({ mode, state: "starting", url, message: "Starting…" });

    if (mode === "docker") {
      this.startDocker(port);
    } else {
      this.startLauncher(mode, port);
    }

    const ready = await this.waitForReady(url);
    if (ready) {
      this.everReady = true;
      this.crashRestarts = 0;
      this.setStatus({ state: "running", message: undefined });
    } else if (this.startupError) {
      this.setStatus({ state: "error", message: this.startupError });
    } else if (!this.stopping) {
      this.setStatus({
        state: "degraded",
        message: `Stack did not become ready at ${url} in time.`,
      });
    }
    return this.getStatus();
  }

  private startLauncher(mode: RuntimeMode, port: number): void {
    this.usingDocker = false;
    // direct → full stack; remote/cloud → frontend only (connect to a backend
    // configured in the in-app backend registry).
    const modeArgs = mode === "direct" ? [] : ["--frontend-only"];
    const args = [getLauncherBin(), "--port", String(port), ...modeArgs];

    log("info", `Launching stack (mode=${mode}, port=${port})`);
    this.child = spawn(process.execPath, args, {
      cwd: getResourceRoot(),
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    this.wireChild(mode, port);
  }

  private startDocker(port: number): void {
    this.usingDocker = true;
    const image = readDockerImageRef();
    // Best-effort cleanup of a stale container from a previous run.
    spawnSync("docker", ["rm", "-f", DOCKER_CONTAINER_NAME], {
      stdio: "ignore",
    });

    const projectsDir = getProjectsDir();
    const args = [
      "run",
      "--rm",
      "--name",
      DOCKER_CONTAINER_NAME,
      "-p",
      `${port}:8000`,
      "-v",
      `${homedir()}/.openhands:/home/openhands/.openhands`,
      ...(projectsDir ? ["-v", `${projectsDir}:/projects`] : []),
      image,
    ];

    log("info", `docker run ${image} (port=${port})`);
    this.child = spawn("docker", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
    this.wireChild("docker", port);
  }

  private wireChild(mode: RuntimeMode, port: number): void {
    const child = this.child;
    if (!child) return;

    const capture = (buf: Buffer): void => {
      const text = buf.toString().trimEnd();
      logStack(text);
      for (const line of text.split("\n")) {
        if (!line.trim()) continue;
        this.recentLines.push(line);
        if (this.recentLines.length > 40) this.recentLines.shift();
      }
    };
    child.stdout?.on("data", capture);
    child.stderr?.on("data", capture);

    child.on("exit", (code, signal) => {
      this.child = null;
      if (this.stopping) {
        this.setStatus({ state: "stopped", url: null });
        return;
      }
      log("warn", `stack exited (code=${code}, signal=${signal})`);

      // Startup failure (never became ready): a port conflict or bad config —
      // retrying is futile, so surface the captured reason and stop. (DI-013)
      if (!this.everReady) {
        this.startupError = this.summarizeFailure(code);
        this.setStatus({ state: "error", message: this.startupError });
        return;
      }

      // Genuine crash after running: attempt bounded backoff restart (DI-090).
      this.emit("serviceExited", { code, signal, mode });
      void this.handleCrash(mode, port);
    });
  }

  private summarizeFailure(code: number | null): string {
    const fatal = this.recentLines.find((l) => /fatal|error|in use/i.test(l));
    const tail = fatal ?? this.recentLines[this.recentLines.length - 1];
    const base = tail
      ? tail.replace(/\u001b\[[0-9;]*m/g, "").trim()
      : `Stack exited with code ${code ?? "unknown"}.`;
    return base;
  }

  private async handleCrash(mode: RuntimeMode, port: number): Promise<void> {
    // @spec DI-090 — capped exponential backoff, then surface an error.
    if (this.crashRestarts >= MAX_CRASH_RESTARTS) {
      this.setStatus({
        state: "error",
        message: "Stack crashed repeatedly. See logs.",
      });
      return;
    }
    this.crashRestarts += 1;
    const backoff = 2000 * 2 ** (this.crashRestarts - 1);
    this.setStatus({
      state: "degraded",
      message: `Restarting (attempt ${this.crashRestarts}/${MAX_CRASH_RESTARTS})…`,
    });
    await delay(backoff);
    if (this.stopping) return;
    if (mode === "docker") this.startDocker(port);
    else this.startLauncher(mode, port);
    const url = `http://127.0.0.1:${port}/`;
    if (await this.waitForReady(url)) {
      this.setStatus({ state: "running", message: undefined });
    }
  }

  private async waitForReady(url: string): Promise<boolean> {
    const deadline = Date.now() + READY_TIMEOUT_MS;
    while (Date.now() < deadline) {
      if (this.stopping || this.startupError) return false;
      if (await probeUrl(url)) return true;
      await delay(750);
    }
    return false;
  }

  async stop(): Promise<StackStatus> {
    this.stopping = true;
    // @spec DI-061 — never tear down a stack we merely attached to.
    if (this.reusing) {
      this.reusing = false;
      this.setStatus({ state: "stopped", url: null, message: undefined });
      return this.getStatus();
    }
    if (this.usingDocker) {
      spawnSync("docker", ["stop", "-t", "5", DOCKER_CONTAINER_NAME], {
        stdio: "ignore",
      });
    }
    const child = this.child;
    if (child && child.pid) {
      child.kill("SIGTERM");
      const killed = await waitForExit(child, 8000);
      if (!killed) child.kill("SIGKILL");
    }
    this.child = null;
    this.setStatus({ state: "stopped", url: null, message: undefined });
    return this.getStatus();
  }

  async restart(opts?: StartOptions): Promise<StackStatus> {
    await this.stop();
    return this.start(opts);
  }

  isLocalStackRunning(): boolean {
    return (
      this.status.state === "running" &&
      (this.status.mode === "direct" || this.status.mode === "docker")
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForExit(child: ChildProcess, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(false);
      }
    }, timeoutMs);
    child.once("exit", () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(true);
      }
    });
  });
}
