// @spec DI-051 / DI-060 / DI-080 — Electron main process
//
// Owns app lifecycle, the single hardened BrowserWindow, the tray, and the
// supervisor. Window-close keeps the app resident in the tray; quitting stops
// the stack gracefully first.

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { app, BrowserWindow, shell, type Tray } from "electron";

import { registerIpc } from "./ipc";
import { log, logsDir } from "./logger";
import { getStateDir } from "./paths";
import { Supervisor } from "./supervisor";
import { createTray } from "./tray";
import type { StackStatus } from "./types";

const supervisor = new Supervisor();
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let cleanupDone = false;

function getWindow(): BrowserWindow | null {
  return mainWindow;
}

function loadingPage(status: StackStatus): string {
  const detail =
    status.message ?? "Preparing the agent stack. This can take a minute…";
  const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>Agent Canvas</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; height:100vh; display:flex; align-items:center; justify-content:center;
    font-family:-apple-system,Segoe UI,Roboto,sans-serif; background:#0b0b0d; color:#e8e8ea; }
  .card { text-align:center; max-width:420px; padding:32px; }
  .spinner { width:28px; height:28px; margin:0 auto 18px; border:3px solid #2a2a31;
    border-top-color:#7c8cff; border-radius:50%; animation:spin 0.9s linear infinite; }
  h1 { font-size:18px; font-weight:600; margin:0 0 8px; }
  p { font-size:13px; color:#9b9ba6; margin:0; line-height:1.5; }
  @keyframes spin { to { transform:rotate(360deg); } }
</style></head>
<body><div class="card"><div class="spinner"></div>
<h1>Starting Agent Canvas</h1><p>${escapeHtml(detail)}</p></div></body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function currentOrigin(): string | null {
  const { url } = supervisor.getStatus();
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function createWindow(): void {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 940,
    minHeight: 600,
    title: "Agent Canvas",
    backgroundColor: "#0b0b0d",
    show: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  // @spec DI-080 — external links open in the OS browser; in-app navigation is
  // restricted to the local ingress origin.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const origin = currentOrigin();
    if (origin && url.startsWith(origin)) return;
    if (url.startsWith("data:")) return;
    event.preventDefault();
    void shell.openExternal(url);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const status = supervisor.getStatus();
  void mainWindow.loadURL(
    status.state === "running" && status.url
      ? status.url
      : loadingPage(status),
  );
}

function onStatusForWindow(status: StackStatus): void {
  if (!mainWindow) return;
  const current = mainWindow.webContents.getURL();
  const onSplash = !current.startsWith("http");
  if (status.state === "running" && status.url && onSplash) {
    void mainWindow.loadURL(status.url);
  } else if (onSplash) {
    void mainWindow.loadURL(loadingPage(status));
  }
}

async function gracefulQuit(): Promise<void> {
  if (cleanupDone) return;
  cleanupDone = true;
  log("info", "Shutting down stack…");
  try {
    await supervisor.stop();
  } catch (err) {
    log("error", `stop failed: ${String(err)}`);
  }
  tray?.destroy();
  app.quit();
}

async function init(): Promise<void> {
  mkdirSync(getStateDir(), { recursive: true });
  mkdirSync(logsDir(), { recursive: true });
  log("info", `Agent Canvas desktop ${app.getVersion()} starting`);

  registerIpc(supervisor, getWindow);
  supervisor.on("statusChanged", onStatusForWindow);

  tray = createTray(supervisor, {
    openWindow: createWindow,
    openLogs: () => {
      void shell.openPath(logsDir());
    },
    quit: () => {
      isQuitting = true;
      app.quit();
    },
  });

  createWindow();

  // @spec DI-040 (interim) — mode is resolved inside the supervisor
  // (persisted choice, else inferred from prerequisites). The dedicated
  // first-run runtime wizard replaces this default in Phase 2.
  supervisor.start().catch((err) => {
    log("error", `initial start failed: ${String(err)}`);
  });
}

// @spec DI-060 — single-instance lock; a second launch focuses the window.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    createWindow();
  });

  app.whenReady().then(init, (err) => {
    log("error", `init failed: ${String(err)}`);
  });

  app.on("activate", () => {
    createWindow();
  });

  // @spec DI-051 — window close keeps the app alive in the tray.
  app.on("window-all-closed", () => {
    if (isQuitting) app.quit();
  });

  app.on("before-quit", (event) => {
    isQuitting = true;
    if (cleanupDone) return;
    event.preventDefault();
    void gracefulQuit();
  });
}
