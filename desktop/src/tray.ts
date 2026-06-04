// @spec DI-050 / DI-052 — menu-bar / system-tray resident
//
// The app lives in the tray; the window is just a view onto the local stack.
// The menu reflects live supervisor status and offers start/stop/restart plus
// quick access to the window and logs.

import { Menu, nativeImage, Tray } from "electron";

import type { Supervisor } from "./supervisor";
import type { StackStatus } from "./types";

export interface TrayActions {
  openWindow: () => void;
  openLogs: () => void;
  quit: () => void;
}

export function createTray(
  supervisor: Supervisor,
  actions: TrayActions,
): Tray {
  // No bundled icon yet (DI-094 / assets are Phase 3). Use an empty image and a
  // short title on macOS so the menu-bar entry is still clickable.
  const tray = new Tray(nativeImage.createEmpty());
  if (process.platform === "darwin") tray.setTitle("AC");

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
    { label: "Open Logs", click: actions.openLogs },
    { type: "separator" },
    { label: "Quit Agent Canvas", click: actions.quit },
  ]);
}
