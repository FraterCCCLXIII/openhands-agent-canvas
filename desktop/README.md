# Agent Canvas — Desktop (Electron) POC

An Electron shell that wraps the existing agent-canvas frontend and **supervises
the agent-canvas stack** so a user can run the whole thing without touching a
terminal. The user chooses *where the Agent Server runs* — directly on the
laptop, in Docker, or against a remote/cloud backend.

This is an isolated workspace: it has its own `package.json` / `node_modules`
and is **not** part of the root build, typecheck, lint, or test runs (the root
`tsconfig.json` and `eslint.config.js` exclude `desktop/`). It reuses the repo's
existing launcher, scripts, and static build rather than reimplementing them.

See [`../specs/desktop-installer.md`](../specs/desktop-installer.md) for the full
design (the `DI-NNN` items referenced throughout the source).

## How it works

```
┌─────────────────────────── Electron main process ───────────────────────────┐
│  main.ts        app lifecycle, single-instance lock, hardened BrowserWindow   │
│  supervisor.ts  starts/stops the stack, port pick, readiness poll, backoff    │
│  runtime.ts     runtime-mode persistence + prerequisite (uv/docker) detection │
│  ipc.ts         enumerated IPC handlers + event broadcast                      │
│  tray.ts        menu-bar / system-tray menu (status, start/stop, logs, quit)  │
│  paths/logger   resource + state path resolution, disk logging                │
└───────────────────────────────────────────────────────────────────────────────┘
        │ spawns                                  ▲ contextBridge
        ▼                                         │ window.agentCanvasDesktop
  bin/agent-canvas.mjs  ── ingress :PORT ──►  BrowserWindow loads http://127.0.0.1:PORT
  (the existing launcher, run via ELECTRON_RUN_AS_NODE)
```

**Supervision approach (POC).** Instead of importing the launcher in-process
(spec end-state DI-010), the supervisor runs `bin/agent-canvas.mjs` as a child
process using the Electron binary in Node mode (`ELECTRON_RUN_AS_NODE=1`). This:

- fully reuses the existing stack supervisor (no duplicated process logic — DI-011),
- needs **no separate Node install** in a packaged app (Electron ships Node),
- isolates a stack crash from the Electron main process.

The window then loads the local ingress URL, so all existing proxying,
WebSocket, API-key injection, and routing keep working unchanged (DI-012).

### Runtime modes (`runtime.ts` / `supervisor.ts`)

| Mode     | What the supervisor does                                             |
| -------- | ------------------------------------------------------------------- |
| `direct` | `bin/agent-canvas.mjs` full stack (agent-server + automation + UI)  |
| `docker` | `docker run` the all-in-one `ghcr.io/openhands/agent-canvas` image  |
| `remote` | `bin/agent-canvas.mjs --frontend-only`; connect a backend in-app    |
| `cloud`  | `bin/agent-canvas.mjs --frontend-only`; connect a backend in-app    |

The chosen mode is persisted to `~/.openhands/agent-canvas/desktop-runtime.json`
and survives restarts. Until the dedicated first-run wizard ships (Phase 2,
DI-040), the initial mode is inferred from detected prerequisites: `direct` if
`uv` is present, else `docker` if the daemon is running, else `remote`.

## Prerequisites (dev)

- A built frontend at the repo root: run `npm run build` in the repo root first.
- For `direct` mode: [`uv`](https://docs.astral.sh/uv/) on `PATH`.
- For `docker` mode: Docker daemon running.

## Develop / run

```bash
cd desktop
npm install        # first time only
npm start          # builds (tsc + esbuild preload) then launches Electron
```

Other scripts:

- `npm run typecheck` — type-check the main + preload sources.
- `npm run build` — compile `src/` → `dist/` and bundle the sandboxed preload.
- `npm run dist` — `electron-builder` packaging (Phase 3; config-only for now).

Logs are written to `~/.openhands/agent-canvas/logs/` (`desktop.log`,
`stack.log`) and are reachable from the tray's **Open Logs** item.

## Security (DI-080..DI-085)

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- The preload is **bundled** (esbuild) into a single self-contained CJS file so
  it works under `sandbox: true` (relative `require`s are unavailable there).
- The renderer only sees a typed `window.agentCanvasDesktop` bridge over an
  enumerated set of IPC channels (`src/types.ts`); event subscriptions are
  restricted to an allow-list. No raw `ipcRenderer` is exposed.
- External links open in the OS browser; in-app navigation is constrained to the
  local ingress origin.

## Not yet implemented (tracked in the spec)

- In-process embeddable launcher handle (DI-010) — POC uses subprocess instead.
- First-run runtime wizard UI (DI-040) — interim default inference in `runtime.ts`.
- Bundled `uv` binary (DI-030) — POC relies on system `uv`.
- Auto-update (DI-004/DI-073), code-signing/notarization, icons/branding (DI-094).
- Packaged-path resource resolution is sketched in `paths.ts` but only the dev
  path is exercised so far.
