// @spec DI-051 / DI-060 / DI-080 — Electron main process
//
// Owns app lifecycle, the single hardened BrowserWindow, the tray, and the
// supervisor. Window-close keeps the app resident in the tray; quitting stops
// the stack gracefully first.

import { mkdirSync } from "node:fs";
import { join } from "node:path";

import {
  app,
  BrowserWindow,
  ipcMain,
  nativeImage,
  shell,
  type Tray,
} from "electron";

import { registerIpc } from "./ipc";
import { log, logsDir } from "./logger";
import { getStateDir } from "./paths";
import { detectPrereqs, getMode, setMode } from "./runtime";
import { Supervisor } from "./supervisor";
import { createTray } from "./tray";
import { loadingPageHtml } from "./screens";
import { IPC, type RuntimeMode, type StackStatus } from "./types";
import { APP_BACKGROUND, toDataUrl } from "./ui-theme";
import { createWizardWindow } from "./wizard";

// Display name for the dock/app menu. Packaged builds get this from
// electron-builder `productName`; in dev the binary is "Electron", so set it at
// runtime (must happen before app is ready) so the dock/menu read correctly.
const APP_NAME = "OpenHands";
app.setName(APP_NAME);

// @spec DI-090 — GPU mitigation. The Electron GPU process emits "Invalid
// mailbox" / "ProduceOverlay" errors on some macOS setups and crashes the
// renderer when canvas/WebGL-heavy views (xterm, Monaco) mount. Software
// compositing trades a little perf for stability; revisit per-platform later.
app.disableHardwareAcceleration();

const supervisor = new Supervisor();
let mainWindow: BrowserWindow | null = null;
let wizardWindow: BrowserWindow | null = null;
let wizardCompleted = false;
let tray: Tray | null = null;
let isQuitting = false;
let cleanupDone = false;
let rendererReloads = 0;
const MAX_RENDERER_RELOADS = 3;

function getWindow(): BrowserWindow | null {
  return mainWindow;
}

function loadingPage(status: StackStatus): string {
  return toDataUrl(loadingPageHtml(status));
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
    backgroundColor: APP_BACKGROUND,
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

  // @spec DI-090 — capture renderer crashes and recover with a bounded reload
  // instead of leaving the user staring at a dead window.
  mainWindow.webContents.on("render-process-gone", (_event, details) => {
    log(
      "error",
      `renderer gone: reason=${details.reason} exitCode=${details.exitCode}`,
    );
    if (details.reason === "clean-exit" || !mainWindow) return;
    if (rendererReloads >= MAX_RENDERER_RELOADS) {
      log("error", "renderer crashed too many times; not reloading.");
      return;
    }
    rendererReloads += 1;
    setTimeout(() => {
      mainWindow?.webContents.reload();
    }, 600);
  });
  mainWindow.webContents.on("unresponsive", () => {
    log("warn", "renderer unresponsive");
  });
  mainWindow.webContents.on("responsive", () => {
    log("info", "renderer responsive again");
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

// @spec DI-040 — always-ask runtime wizard (first run + tray "Switch Runtime").
function showWizard(): void {
  if (wizardWindow) {
    wizardWindow.focus();
    return;
  }
  wizardWindow = createWizardWindow(detectPrereqs());
  wizardWindow.on("closed", () => {
    wizardWindow = null;
    // Closing the first-run wizard without a choice (and no main window yet)
    // means there's nothing to do — exit rather than linger invisibly.
    if (!wizardCompleted && !mainWindow) {
      isQuitting = true;
      app.quit();
    }
  });
}

async function onWizardComplete(mode: RuntimeMode): Promise<void> {
  wizardCompleted = true;
  setMode(mode);
  log("info", `Runtime selected: ${mode}`);
  const switching = supervisor.getStatus().state === "running";
  createWindow();
  if (wizardWindow) {
    wizardWindow.close();
    wizardWindow = null;
  }
  if (switching) await supervisor.restart({ mode });
  else await supervisor.start({ mode });
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

  // Dock/app icon. Packaged builds embed the .icns via electron-builder, but
  // `electron .` in dev shows the default icon, so set it explicitly here.
  if (process.platform === "darwin" && app.dock) {
    const dockIcon = nativeImage.createFromPath(
      join(__dirname, "..", "assets", "icon.png"),
    );
    if (!dockIcon.isEmpty()) app.dock.setIcon(dockIcon);
  }

  app.on("child-process-gone", (_event, details) => {
    log(
      "warn",
      `child-process-gone: type=${details.type} reason=${details.reason}`,
    );
  });

  registerIpc(supervisor, getWindow);
  ipcMain.handle(IPC.wizardComplete, (_event, mode: RuntimeMode) =>
    onWizardComplete(mode),
  );
  supervisor.on("statusChanged", onStatusForWindow);

  tray = createTray(supervisor, {
    openWindow: createWindow,
    switchRuntime: showWizard,
    openLogs: () => {
      void shell.openPath(logsDir());
    },
    quit: () => {
      isQuitting = true;
      app.quit();
    },
  });

  // @spec DI-040 — always ask on first run; otherwise honor the saved choice.
  if (getMode()) {
    createWindow();
    supervisor.start().catch((err) => {
      log("error", `initial start failed: ${String(err)}`);
    });
  } else {
    showWizard();
  }
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
