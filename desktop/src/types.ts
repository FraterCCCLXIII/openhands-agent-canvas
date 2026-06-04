// @spec DI-082 / DI-083 — IPC contract (shared by main + preload)
//
// Single source of truth for runtime modes, status shapes, and IPC channel
// names. Imported by both the Electron main process and the sandboxed preload,
// so it must stay dependency-free (no electron / node imports).

/** Where the Agent Server executes. See specs/desktop-installer.md. */
export type RuntimeMode = "direct" | "docker" | "remote" | "cloud";

export type StackState =
  | "stopped"
  | "starting"
  | "running"
  | "degraded"
  | "error";

export interface StackStatus {
  mode: RuntimeMode;
  state: StackState;
  /** Ingress URL the renderer should load, once running. */
  url: string | null;
  /** Human-readable detail for the current state (errors, progress, …). */
  message?: string;
}

export interface PrereqStatus {
  /** `uv`/`uvx` available on PATH (or bundled). Required for `direct` mode. */
  uv: boolean;
  /** `docker` CLI present. Required for `docker` mode. */
  docker: boolean;
  /** Docker daemon actually responding (`docker info`). */
  dockerRunning: boolean;
}

export interface StartOptions {
  mode?: RuntimeMode;
  /** Preferred ingress port; a free port near it is used if busy (DI-062). */
  port?: number;
}

/**
 * IPC channel identifiers. Commands are `invoke`/`handle`; events are
 * `send`/`on`. The bridge (preload) exposes a typed wrapper over exactly these
 * channels — no generic passthrough (DI-081/DI-082/DI-083).
 */
export const IPC = {
  // commands: renderer -> main
  stackGetStatus: "stack:getStatus",
  stackStart: "stack:start",
  stackStop: "stack:stop",
  stackRestart: "stack:restart",
  runtimeGetMode: "runtime:getMode",
  runtimeSetMode: "runtime:setMode",
  runtimeDetectPrereqs: "runtime:detectPrereqs",
  wizardComplete: "wizard:complete",
  dialogPickFolder: "dialog:pickFolder",
  logsGetPath: "logs:getPath",
  logsOpen: "logs:open",
  systemOpenFullDiskAccess: "system:openFullDiskAccess",
  appGetVersion: "app:getVersion",
  appCheckForUpdates: "app:checkForUpdates",

  // events: main -> renderer
  evtStackStatusChanged: "evt:stack:statusChanged",
  evtServiceExited: "evt:service:exited",
  evtUpdateAvailable: "evt:update:available",
  evtUpdateDownloaded: "evt:update:downloaded",
  evtPrereqsChanged: "evt:prereqs:changed",
} as const;

/** Name of the global the preload exposes on `window` (DI-081/DI-084). */
export const DESKTOP_BRIDGE_GLOBAL = "agentCanvasDesktop";

/** Shape exposed as `window.agentCanvasDesktop` to the renderer. */
export interface DesktopBridge {
  stack: {
    getStatus(): Promise<StackStatus>;
    start(opts?: StartOptions): Promise<StackStatus>;
    stop(): Promise<StackStatus>;
    restart(opts?: StartOptions): Promise<StackStatus>;
  };
  runtime: {
    getMode(): Promise<RuntimeMode | null>;
    setMode(mode: RuntimeMode): Promise<void>;
    detectPrereqs(): Promise<PrereqStatus>;
  };
  wizard: {
    /** Persist the chosen mode and proceed to launch the stack + main window. */
    complete(mode: RuntimeMode): Promise<void>;
  };
  dialog: {
    pickFolder(): Promise<string | null>;
  };
  logs: {
    getPath(): Promise<string>;
    open(): Promise<void>;
  };
  system: {
    /**
     * Open the OS privacy pane where the user grants the app filesystem access
     * (macOS: Full Disk Access). No-op / resolves false on platforms without one.
     */
    openFullDiskAccess(): Promise<boolean>;
  };
  app: {
    getVersion(): Promise<string>;
    checkForUpdates(): Promise<{ available: boolean; message: string }>;
  };
  /** Subscribe to a main->renderer event. Returns an unsubscribe function. */
  on(channel: string, listener: (payload: unknown) => void): () => void;
}
