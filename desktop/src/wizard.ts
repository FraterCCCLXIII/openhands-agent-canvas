// @spec DI-040 / DI-041 / DI-042 — first-run runtime wizard
//
// A native, desktop-owned picker shown when no runtime mode has been chosen yet
// (and reachable later via the tray). It always asks where the Agent Server
// should run, recommends — but does not silently default to — a mode based on
// detected prerequisites, and surfaces a security note for `direct`. Keeping it
// native means the shared web frontend stays untouched. The page markup lives in
// `screens.ts` (pure renderer); this module only owns the window.

import { join } from "node:path";

import { BrowserWindow } from "electron";

import { wizardPageHtml } from "./screens";
import type { PrereqStatus } from "./types";
import { APP_BACKGROUND, toDataUrl } from "./ui-theme";

export function createWizardWindow(prereqs: PrereqStatus): BrowserWindow {
  const win = new BrowserWindow({
    width: 780,
    height: 540,
    resizable: false,
    title: "Agent Canvas — Setup",
    backgroundColor: APP_BACKGROUND,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  void win.loadURL(toDataUrl(wizardPageHtml(prereqs)));
  return win;
}
