// @spec DI-011 / DI-091 — resource + state path resolution
//
// Resolves where the bundled launcher/scripts/build live (dev vs packaged) and
// the shared `~/.openhands/agent-canvas` state directory. Keeping this in one
// place avoids hardcoded paths scattered across the main process.

import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

import { app } from "electron";

/**
 * Root that contains `bin/`, `scripts/`, `build/`, `config/`, `tools/`.
 *
 * - Dev: this file compiles to `desktop/dist/paths.js`, so the repo root is two
 *   levels up.
 * - Packaged: electron-builder copies those dirs into `process.resourcesPath`
 *   via `extraResources` (see electron-builder.yml).
 */
export function getResourceRoot(): string {
  if (app.isPackaged) return process.resourcesPath;
  return resolve(__dirname, "..", "..");
}

export function getLauncherBin(): string {
  return join(getResourceRoot(), "bin", "agent-canvas.mjs");
}

export function getBuildDir(): string {
  return join(getResourceRoot(), "build");
}

/** `~/.openhands/agent-canvas` — shared with the CLI and Docker stacks. */
export function getStateDir(): string {
  return join(homedir(), ".openhands", "agent-canvas");
}

export function getLogsDir(): string {
  return join(getStateDir(), "logs");
}

/** Where the desktop runtime-mode selection is persisted (DI-021). */
export function getRuntimeConfigPath(): string {
  return join(getStateDir(), "desktop-runtime.json");
}

/** Root config/defaults.json (version pins, image name) — DI-071. */
export function getDefaultsConfigPath(): string {
  return join(getResourceRoot(), "config", "defaults.json");
}

/**
 * Directory containing the bundled `uv`/`uvx` binaries for this platform, or
 * `null` when none is bundled (dev without `npm run fetch-uv`). Packaged builds
 * place them under `resources/uv/<platform>-<arch>/` via electron-builder
 * `extraResources`; dev reads `desktop/vendor/uv/<platform>-<arch>/`. (DI-030)
 */
export function getBundledUvDir(): string | null {
  const key = `${process.platform}-${process.arch}`;
  const dir = app.isPackaged
    ? join(process.resourcesPath, "uv", key)
    : resolve(__dirname, "..", "vendor", "uv", key);
  const uvName = process.platform === "win32" ? "uv.exe" : "uv";
  return existsSync(join(dir, uvName)) ? dir : null;
}
