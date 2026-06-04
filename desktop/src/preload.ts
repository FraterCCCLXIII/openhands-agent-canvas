// @spec DI-081 / DI-084 — sandboxed preload bridge
//
// Exposes a single typed `window.agentCanvasDesktop` via contextBridge. No raw
// ipcRenderer reaches the renderer; event subscriptions are restricted to an
// allow-list of channels. This file is bundled (esbuild) into a single
// self-contained CJS module so it works under `sandbox: true`, where relative
// requires are unavailable.

import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import {
  DESKTOP_BRIDGE_GLOBAL,
  IPC,
  type DesktopBridge,
  type RuntimeMode,
  type StartOptions,
} from "./types";

const ALLOWED_EVENTS = new Set<string>([
  IPC.evtStackStatusChanged,
  IPC.evtServiceExited,
  IPC.evtUpdateAvailable,
  IPC.evtUpdateDownloaded,
  IPC.evtPrereqsChanged,
]);

const bridge: DesktopBridge = {
  stack: {
    getStatus: () => ipcRenderer.invoke(IPC.stackGetStatus),
    start: (opts?: StartOptions) => ipcRenderer.invoke(IPC.stackStart, opts),
    stop: () => ipcRenderer.invoke(IPC.stackStop),
    restart: (opts?: StartOptions) =>
      ipcRenderer.invoke(IPC.stackRestart, opts),
  },
  runtime: {
    getMode: () => ipcRenderer.invoke(IPC.runtimeGetMode),
    setMode: (mode: RuntimeMode) =>
      ipcRenderer.invoke(IPC.runtimeSetMode, mode),
    detectPrereqs: () => ipcRenderer.invoke(IPC.runtimeDetectPrereqs),
  },
  wizard: {
    complete: (mode: RuntimeMode) =>
      ipcRenderer.invoke(IPC.wizardComplete, mode),
  },
  dialog: {
    pickFolder: () => ipcRenderer.invoke(IPC.dialogPickFolder),
  },
  logs: {
    getPath: () => ipcRenderer.invoke(IPC.logsGetPath),
    open: () => ipcRenderer.invoke(IPC.logsOpen),
  },
  system: {
    openFullDiskAccess: () => ipcRenderer.invoke(IPC.systemOpenFullDiskAccess),
  },
  app: {
    getVersion: () => ipcRenderer.invoke(IPC.appGetVersion),
    checkForUpdates: () => ipcRenderer.invoke(IPC.appCheckForUpdates),
  },
  on: (channel: string, listener: (payload: unknown) => void) => {
    if (!ALLOWED_EVENTS.has(channel)) {
      throw new Error(`Unknown desktop event channel: ${channel}`);
    }
    const wrapped = (_e: IpcRendererEvent, payload: unknown): void =>
      listener(payload);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
};

contextBridge.exposeInMainWorld(DESKTOP_BRIDGE_GLOBAL, bridge);
