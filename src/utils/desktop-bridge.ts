// Optional bridge to the Electron desktop wrapper (`@openhands/agent-canvas-desktop`).
// In the web/standalone build this global is absent, so every accessor is
// null-safe and callers must treat desktop features as progressive enhancement.

const DESKTOP_BRIDGE_GLOBAL = "agentCanvasDesktop";

interface DesktopBridge {
  system?: {
    openFullDiskAccess?: () => Promise<boolean>;
  };
}

function getDesktopBridge(): DesktopBridge | null {
  if (typeof window === "undefined") return null;
  const bridge = (window as unknown as Record<string, unknown>)[
    DESKTOP_BRIDGE_GLOBAL
  ];
  return bridge && typeof bridge === "object"
    ? (bridge as DesktopBridge)
    : null;
}

/** True when running inside the Electron desktop shell. */
export function isDesktopApp(): boolean {
  return getDesktopBridge() !== null;
}

/**
 * Ask the desktop shell to open the OS pane for granting filesystem access
 * (macOS Full Disk Access). Resolves false when unavailable or unsupported.
 */
export async function openFullDiskAccessSettings(): Promise<boolean> {
  const fn = getDesktopBridge()?.system?.openFullDiskAccess;
  if (!fn) return false;
  try {
    return await fn();
  } catch {
    return false;
  }
}
