// @spec DI-011 / DI-091 — resource + state path resolution
//
// Resolves where the bundled launcher/scripts/build live (dev vs packaged) and
// the shared `~/.openhands/agent-canvas` state directory. Keeping this in one
// place avoids hardcoded paths scattered across the main process.

import { app } from "electron";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

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
