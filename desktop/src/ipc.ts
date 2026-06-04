// @spec DI-082 / DI-083 / DI-085 — main-side IPC handlers
//
// Registers exactly the enumerated command channels and forwards supervisor
// events to every renderer. No generic passthrough; no extra privilege beyond
// what the page already holds.

import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";

import { logsDir } from "./logger";
import { detectPrereqs, getMode, setMode } from "./runtime";
import type { Supervisor } from "./supervisor";
import { IPC, type RuntimeMode, type StartOptions } from "./types";

type WindowGetter = () => BrowserWindow | null;

export function registerIpc(
  supervisor: Supervisor,
  getWindow: WindowGetter,
): void {
  // ── Commands: renderer -> main ────────────────────────────────────────────
  ipcMain.handle(IPC.stackGetStatus, () => supervisor.getStatus());
  ipcMain.handle(IPC.stackStart, (_e, opts: StartOptions | undefined) =>
    supervisor.start(opts),
  );
  ipcMain.handle(IPC.stackStop, () => supervisor.stop());
  ipcMain.handle(IPC.stackRestart, (_e, opts: StartOptions | undefined) =>
    supervisor.restart(opts),
  );

  ipcMain.handle(IPC.runtimeGetMode, () => getMode());
  ipcMain.handle(IPC.runtimeSetMode, (_e, mode: RuntimeMode) => {
    setMode(mode);
  });
  ipcMain.handle(IPC.runtimeDetectPrereqs, () => detectPrereqs());

  ipcMain.handle(IPC.dialogPickFolder, async () => {
    const win = getWindow();
    const opts = {
      properties: ["openDirectory", "createDirectory"] as Array<
        "openDirectory" | "createDirectory"
      >,
    };
    const result = win
      ? await dialog.showOpenDialog(win, opts)
      : await dialog.showOpenDialog(opts);
    return result.canceled || result.filePaths.length === 0
      ? null
      : result.filePaths[0];
  });

  ipcMain.handle(IPC.logsGetPath, () => logsDir());
  ipcMain.handle(IPC.logsOpen, async () => {
    await shell.openPath(logsDir());
  });

  ipcMain.handle(IPC.appGetVersion, () => app.getVersion());
  ipcMain.handle(IPC.appCheckForUpdates, () => ({
    available: false,
    message: "Auto-update ships in Phase 3 (DI-004).",
  }));

  // ── Events: main -> renderer ──────────────────────────────────────────────
  const broadcast = (channel: string, payload: unknown): void => {
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send(channel, payload);
    }
  };

  supervisor.on("statusChanged", (status) =>
    broadcast(IPC.evtStackStatusChanged, status),
  );
  supervisor.on("serviceExited", (info) =>
    broadcast(IPC.evtServiceExited, info),
  );
}
