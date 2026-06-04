// @spec DI-050 / DI-052 — menu-bar / system-tray resident
//
// The app lives in the tray; the window is just a view onto the local stack.
// The menu reflects live supervisor status and offers start/stop/restart plus
// quick access to the window and logs.

import { join } from "node:path";

import { Menu, nativeImage, Tray, type NativeImage } from "electron";

import type { Supervisor } from "./supervisor";
import type { StackStatus } from "./types";

// Resolves at runtime to desktop/assets (dev) or app.asar/assets (packaged),
// since this file lives in dist/ in both layouts.
function assetPath(name: string): string {
  return join(__dirname, "..", "assets", name);
}

/**
 * Menu-bar icon. On macOS use the monochrome OpenHands mark as a template image
 * so the OS recolors it for light/dark menu bars; elsewhere use the color icon.
 */
function trayImage(): NativeImage {
  if (process.platform === "darwin") {
    const img = nativeImage.createFromPath(assetPath("trayTemplate.png"));
    if (!img.isEmpty()) {
      img.setTemplateImage(true);
      return img;
    }
  }
  const color = nativeImage.createFromPath(assetPath("icon.png"));
  return color.isEmpty() ? nativeImage.createEmpty() : color;
}

export interface TrayActions {
  openWindow: () => void;
  switchRuntime: () => void;
  openLogs: () => void;
  quit: () => void;
}

export function createTray(
  supervisor: Supervisor,
  actions: TrayActions,
): Tray {
  const tray = new Tray(trayImage());

  const rebuild = (status: StackStatus): void => {
    tray.setToolTip(`Agent Canvas — ${status.state}`);
    tray.setContextMenu(buildMenu(status, supervisor, actions));
  };

  rebuild(supervisor.getStatus());
  supervisor.on("statusChanged", rebuild);
  tray.on("click", actions.openWindow);
  return tray;
}

function buildMenu(
  status: StackStatus,
  supervisor: Supervisor,
  actions: TrayActions,
): Menu {
  const running = status.state === "running";
  const starting = status.state === "starting";
  const stoppable = running || starting || status.state === "degraded";

  return Menu.buildFromTemplate([
    {
      label: `Status: ${status.state} (${status.mode})`,
      enabled: false,
    },
    { type: "separator" },
    { label: "Open Agent Canvas", click: actions.openWindow },
    { type: "separator" },
    {
      label: "Start",
      enabled: status.state === "stopped" || status.state === "error",
      click: () => {
        void supervisor.start();
      },
    },
    {
      label: "Stop",
      enabled: stoppable,
      click: () => {
        void supervisor.stop();
      },
    },
    {
      label: "Restart",
      enabled: running || status.state === "degraded",
      click: () => {
        void supervisor.restart();
      },
    },
    { type: "separator" },
    { label: "Switch Runtime…", click: actions.switchRuntime },
    { label: "Open Logs", click: actions.openLogs },
    { type: "separator" },
    { label: "Quit Agent Canvas", click: actions.quit },
  ]);
}
