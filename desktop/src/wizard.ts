// @spec DI-040 / DI-041 / DI-042 — first-run runtime wizard
//
// A native, desktop-owned picker shown when no runtime mode has been chosen yet
// (and reachable later via the tray). It always asks where the Agent Server
// should run, recommends — but does not silently default to — a mode based on
// detected prerequisites, and surfaces a security note for `direct`. Keeping it
// native means the shared web frontend stays untouched.

import { join } from "node:path";

import { BrowserWindow } from "electron";

import type { PrereqStatus, RuntimeMode } from "./types";

interface ModeCard {
  mode: RuntimeMode;
  title: string;
  blurb: string;
  available: boolean;
  note: string;
}

function cardsFor(prereqs: PrereqStatus): ModeCard[] {
  return [
    {
      mode: "direct",
      title: "On this computer",
      blurb:
        "Runs the Agent Server directly on your machine. Fastest, full file access.",
      available: prereqs.uv,
      note: prereqs.uv
        ? "Heads up: the agent can read/write files and run commands on your computer."
        : "Requires uv (bundled build provides it).",
    },
    {
      mode: "docker",
      title: "In Docker",
      blurb:
        "Runs the Agent Server in a sandboxed container. Safer isolation from your machine.",
      available: prereqs.dockerRunning,
      note: prereqs.docker
        ? prereqs.dockerRunning
          ? "Docker is running."
          : "Docker is installed but not running — start Docker Desktop first."
        : "Requires Docker Desktop.",
    },
    {
      mode: "remote",
      title: "Remote server",
      blurb:
        "Connect to an Agent Server you run elsewhere (another machine, VM, or server).",
      available: true,
      note: "You'll add the server URL in the app after this.",
    },
    {
      mode: "cloud",
      title: "Cloud",
      blurb: "Connect to a hosted Agent Server backend.",
      available: true,
      note: "You'll sign in / add the backend in the app after this.",
    },
  ];
}

function renderHtml(prereqs: PrereqStatus): string {
  const cards = cardsFor(prereqs);
  const cardHtml = cards
    .map((c) => {
      const disabled = c.available ? "" : "disabled";
      const cls = c.available ? "card" : "card disabled";
      return `<button class="${cls}" ${disabled} data-mode="${c.mode}">
        <div class="title">${esc(c.title)}</div>
        <div class="blurb">${esc(c.blurb)}</div>
        <div class="note">${esc(c.note)}</div>
      </button>`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>Choose where the agent runs</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; background:#0b0b0d; color:#e8e8ea;
    font-family:-apple-system,Segoe UI,Roboto,sans-serif; padding:40px 32px; }
  h1 { font-size:20px; margin:0 0 6px; }
  p.sub { font-size:13px; color:#9b9ba6; margin:0 0 26px; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; max-width:720px; }
  .card { text-align:left; padding:18px; border-radius:12px; border:1px solid #2a2a31;
    background:#141418; color:#e8e8ea; cursor:pointer; transition:border-color .15s, background .15s; }
  .card:hover:not(.disabled) { border-color:#7c8cff; background:#181826; }
  .card.disabled { opacity:.5; cursor:not-allowed; }
  .card .title { font-size:15px; font-weight:600; margin-bottom:6px; }
  .card .blurb { font-size:12.5px; color:#c7c7d2; line-height:1.45; margin-bottom:8px; }
  .card .note { font-size:11.5px; color:#8a8a96; line-height:1.4; }
  .err { color:#ff8a8a; font-size:12px; margin-top:16px; min-height:16px; }
</style></head>
<body>
  <h1>Where should the agent run?</h1>
  <p class="sub">You can change this later from the menu-bar icon.</p>
  <div class="grid">${cardHtml}</div>
  <div class="err" id="err"></div>
  <script>
    const err = document.getElementById('err');
    document.querySelectorAll('.card[data-mode]').forEach((el) => {
      el.addEventListener('click', async () => {
        if (el.hasAttribute('disabled')) return;
        const mode = el.getAttribute('data-mode');
        document.querySelectorAll('.card').forEach((c) => c.setAttribute('disabled',''));
        err.textContent = '';
        try {
          await window.agentCanvasDesktop.runtime.setMode(mode);
          await window.agentCanvasDesktop.wizard.complete(mode);
        } catch (e) {
          err.textContent = 'Could not start: ' + (e && e.message ? e.message : e);
          document.querySelectorAll('.card[data-mode]').forEach((c) => {
            if (!c.classList.contains('disabled')) c.removeAttribute('disabled');
          });
        }
      });
    });
  </script>
</body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function createWizardWindow(prereqs: PrereqStatus): BrowserWindow {
  const win = new BrowserWindow({
    width: 780,
    height: 540,
    resizable: false,
    title: "Agent Canvas — Setup",
    backgroundColor: "#0b0b0d",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  void win.loadURL(renderHtml(prereqs));
  return win;
}
