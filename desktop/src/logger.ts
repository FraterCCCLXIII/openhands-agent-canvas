// @spec DI-091 — logging to disk
//
// Minimal append logger with naive size-based rotation. Writes both a desktop
// log (app lifecycle) and a stack log (supervised child output) under
// ~/.openhands/agent-canvas/logs so the tray "Open logs" action has something
// to reveal.

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  renameSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

import { getLogsDir } from "./paths";

const MAX_BYTES = 5 * 1024 * 1024; // rotate at ~5 MB

function ensureLogsDir(): string {
  const dir = getLogsDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function rotateIfNeeded(file: string): void {
  try {
    if (existsSync(file) && statSync(file).size > MAX_BYTES) {
      renameSync(file, `${file}.1`);
    }
  } catch {
    // Best-effort; never let logging break the app.
  }
}

function write(fileName: string, line: string): void {
  try {
    const dir = ensureLogsDir();
    const file = join(dir, fileName);
    rotateIfNeeded(file);
    appendFileSync(file, line.endsWith("\n") ? line : `${line}\n`);
  } catch {
    // Swallow — logging must never crash the supervisor.
  }
}

type Level = "info" | "warn" | "error";

function stamp(level: Level, msg: string): string {
  return `${new Date().toISOString()} [${level}] ${msg}`;
}

/** App-lifecycle logging (also echoed to stdout for `npm start`). */
export function log(level: Level, msg: string): void {
  const line = stamp(level, msg);
  // eslint-disable-next-line no-console
  (level === "error" ? console.error : console.log)(line);
  write("desktop.log", line);
}

/** Raw child-process output from the supervised stack. */
export function logStack(line: string): void {
  write("stack.log", line);
}

export function logsDir(): string {
  return ensureLogsDir();
}
