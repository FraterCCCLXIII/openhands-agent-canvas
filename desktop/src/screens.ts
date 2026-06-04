// Pure renderers for the desktop-owned HTML screens. Kept free of Electron/window
// or process side effects so they can be unit-tested and previewed in isolation;
// `main.ts` / `wizard.ts` wrap these in `toDataUrl` and load them into a window.

import type { PrereqStatus, RuntimeMode, StackStatus } from "./types";
import {
  escapeHtml,
  LINE_LOADER_CSS,
  logoSvg,
  THEME_CSS,
} from "./ui-theme";

export function loadingPageHtml(status: StackStatus): string {
  const isError = status.state === "error";
  const title = isError ? "Couldn’t start the stack" : "Starting Agent Canvas";
  const detail =
    status.message ??
    (isError
      ? "See the logs for details."
      : "Preparing the agent stack. This can take a minute…");
  const loader = isError ? "" : '<div class="line-loader"></div>';
  const actions = isError
    ? `<div class="actions">
        <button class="primary" onclick="agentCanvasDesktop&&agentCanvasDesktop.stack.restart()">Retry</button>
        <button onclick="agentCanvasDesktop&&agentCanvasDesktop.logs.open()">Open logs</button>
      </div>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8" />
<title>Agent Canvas</title>
<style>
  ${THEME_CSS}
  ${LINE_LOADER_CSS}
  body { height:100vh; display:flex; align-items:center; justify-content:center; }
  .wrap { display:flex; flex-direction:column; align-items:center; text-align:center;
    max-width:460px; padding:32px; gap:18px; }
  .logo { width:72px; color:var(--white); }
  .logo svg { width:100%; height:auto; display:block; }
  h1 { font-size:16px; font-weight:600; margin:0; }
  h1.error { color:var(--danger); }
  p { font-size:13px; color:var(--muted); margin:0; line-height:1.5; word-break:break-word; }
  .actions { display:flex; gap:8px; margin-top:4px; }
  button { font:inherit; font-size:13px; padding:8px 16px; border-radius:var(--radius);
    border:1px solid var(--border); background:var(--surface-raised); color:var(--foreground);
    cursor:pointer; transition:border-color .15s, background .15s; }
  button:hover { border-color:rgba(255,255,255,.4); }
  button.primary { background:var(--primary); border-color:var(--primary); color:var(--background);
    font-weight:600; }
  button.primary:hover { filter:brightness(1.06); border-color:var(--primary); }
</style></head>
<body>
  <div class="wrap">
    <div class="logo">${logoSvg()}</div>
    ${loader}
    <h1${isError ? ' class="error"' : ""}>${escapeHtml(title)}</h1>
    <p>${escapeHtml(detail)}</p>
    ${actions}
  </div>
</body></html>`;
}

interface ModeCard {
  mode: RuntimeMode;
  title: string;
  blurb: string;
  available: boolean;
  recommended: boolean;
  note: string;
}

/**
 * Recommend (but never silently default to) the safest available mode: Docker
 * isolation when it's running, otherwise on-device when uv is present, otherwise
 * remote.
 */
function recommendedMode(prereqs: PrereqStatus): RuntimeMode {
  if (prereqs.dockerRunning) return "docker";
  if (prereqs.uv) return "direct";
  return "remote";
}

function cardsFor(prereqs: PrereqStatus): ModeCard[] {
  const recommended = recommendedMode(prereqs);
  const cards: Omit<ModeCard, "recommended">[] = [
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
  return cards.map((c) => ({
    ...c,
    recommended: c.available && c.mode === recommended,
  }));
}

export function wizardPageHtml(prereqs: PrereqStatus): string {
  const cardHtml = cardsFor(prereqs)
    .map((c) => {
      const cls = c.available ? "card" : "card disabled";
      const badge = c.recommended
        ? '<span class="badge">Recommended</span>'
        : "";
      return `<button class="${cls}" ${c.available ? "" : "disabled"} data-mode="${c.mode}">
        ${badge}
        <div class="title">${escapeHtml(c.title)}</div>
        <div class="blurb">${escapeHtml(c.blurb)}</div>
        <div class="note">${escapeHtml(c.note)}</div>
      </button>`;
    })
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8" />
<title>Choose where the agent runs</title>
<style>
  ${THEME_CSS}
  body { min-height:100vh; padding:36px 32px 32px; }
  .head { display:flex; align-items:center; gap:14px; margin-bottom:22px; }
  .logo { width:38px; color:var(--white); flex:0 0 auto; }
  .logo svg { width:100%; height:auto; display:block; }
  h1 { font-size:20px; font-weight:600; margin:0 0 4px; }
  p.sub { font-size:13px; color:var(--muted); margin:0; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; max-width:720px; }
  .card { position:relative; text-align:left; padding:18px; border-radius:12px;
    border:1px solid var(--border-subtle); background:var(--surface); color:var(--foreground);
    cursor:pointer; transition:border-color .15s, background .15s, transform .05s; }
  .card:hover:not(.disabled) { border-color:rgba(255,255,255,.4); background:var(--surface-raised); }
  .card:active:not(.disabled) { transform:translateY(1px); }
  .card.disabled { opacity:.45; cursor:not-allowed; }
  .card .title { font-size:15px; font-weight:600; margin-bottom:6px; }
  .card .blurb { font-size:12.5px; color:var(--text-secondary); line-height:1.45; margin-bottom:8px; }
  .card .note { font-size:11.5px; color:var(--text-dim); line-height:1.4; }
  .badge { position:absolute; top:14px; right:14px; font-size:10px; font-weight:600;
    letter-spacing:.04em; text-transform:uppercase; color:var(--primary);
    border:1px solid color-mix(in srgb, var(--primary) 50%, transparent);
    border-radius:999px; padding:2px 8px; }
  .err { color:var(--danger); font-size:12px; margin-top:18px; min-height:16px; }
</style></head>
<body>
  <div class="head">
    <div class="logo">${logoSvg()}</div>
    <div>
      <h1>Where should the agent run?</h1>
      <p class="sub">You can change this later from the menu-bar icon.</p>
    </div>
  </div>
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
}
