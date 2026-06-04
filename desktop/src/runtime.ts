// @spec DI-021 / DI-041 — runtime-mode persistence + prerequisite detection
//
// The chosen runtime (direct / docker / remote / cloud) is persisted under the
// shared state dir so it survives restarts and can be changed later. Prereq
// detection feeds the first-run wizard's recommend-don't-default behavior.

import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import { getRuntimeConfigPath } from "./paths";
import type { PrereqStatus, RuntimeMode } from "./types";

const VALID_MODES: readonly RuntimeMode[] = [
  "direct",
  "docker",
  "remote",
  "cloud",
];

interface RuntimeConfig {
  mode?: RuntimeMode;
  /** Optional host-side directory the agent may access (Docker mount, etc.). */
  projectsDir?: string;
  /** Last backend version that started successfully (DI-072). */
  lastGoodBackendVersion?: string;
}

function readConfig(): RuntimeConfig {
  try {
    const raw = readFileSync(getRuntimeConfigPath(), "utf8");
    const parsed = JSON.parse(raw) as RuntimeConfig;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeConfig(config: RuntimeConfig): void {
  const file = getRuntimeConfigPath();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
}

export function getMode(): RuntimeMode | null {
  const { mode } = readConfig();
  return mode && VALID_MODES.includes(mode) ? mode : null;
}

export function setMode(mode: RuntimeMode): void {
  if (!VALID_MODES.includes(mode)) {
    throw new Error(`Invalid runtime mode: ${mode}`);
  }
  writeConfig({ ...readConfig(), mode });
}

export function getProjectsDir(): string | undefined {
  return readConfig().projectsDir;
}

export function rememberGoodBackendVersion(version: string): void {
  writeConfig({ ...readConfig(), lastGoodBackendVersion: version });
}

function commandExists(cmd: string): boolean {
  const probe =
    process.platform === "win32"
      ? spawnSync("where", [cmd], { stdio: "ignore" })
      : spawnSync("sh", ["-c", `command -v ${cmd}`], { stdio: "ignore" });
  return probe.status === 0;
}

/** @spec DI-041 — detect what the wizard can offer. */
export function detectPrereqs(): PrereqStatus {
  const uv = commandExists("uv") || commandExists("uvx");
  const docker = commandExists("docker");
  let dockerRunning = false;
  if (docker) {
    const info = spawnSync("docker", ["info"], {
      stdio: "ignore",
      timeout: 5000,
    });
    dockerRunning = info.status === 0;
  }
  return { uv, docker, dockerRunning };
}

/**
 * Best initial mode when the user has not chosen one yet. The first-run wizard
 * (DI-040) will replace this with an explicit choice; until that ships we pick a
 * mode that actually works on this machine so the POC isn't dead on arrival.
 */
export function inferInitialMode(prereqs: PrereqStatus): RuntimeMode {
  if (prereqs.uv) return "direct";
  if (prereqs.dockerRunning) return "docker";
  // No local runtime available: serve the UI only and let the user connect to a
  // remote/cloud backend from the in-app backend registry.
  return "remote";
}
