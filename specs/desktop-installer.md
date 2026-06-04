# Desktop Installer & Electron Wrapper Specs

> Status: **Planning** — nothing in this document is implemented yet. All spec
> items are unchecked. Spec IDs are stable; never renumber. Tag implementation
> code/tests with `// @spec DI-NNN — Short title` when work lands.

## Goal

Let a non-technical user **download and run agent-canvas without a terminal,
without `git`, and without manually installing prerequisites**, while still
letting them choose *where the Agent Server runs* — directly on the laptop, in
a Docker sandbox, on a remote VM, or in the cloud — either at first launch or
later from Settings.

The vehicle is an **Electron desktop app** whose **main process becomes the
stack supervisor**, reusing the existing launcher logic instead of
reimplementing it.

## Non-goals

- Replacing the existing npm (`npx @openhands/agent-canvas`) or Docker
  (`ghcr.io/openhands/agent-canvas`) distribution paths. The desktop app is an
  *additional* channel; CLI/Docker users keep their workflows.
- Bundling a full embedded Python toolchain in v1 (tracked as a later phase).
- Mobile / web-hosted packaging.

---

## Architecture overview

```
Electron App (signed, auto-updating)
├── Main process  = Stack Supervisor  (reuses dev-with-automation main())
│     ├── Runtime Manager  → direct | docker | remote | cloud
│     ├── Prereq detector  → uv (bundled), Docker (docker info)
│     └── Ingress/static-server (serves build/, proxies /api, /sockets, WS)
└── Renderer      = existing React frontend, loaded from http://localhost:<port>
```

Key reuse points (already in the repo):

- `scripts/dev-with-automation.mjs::main()` — already exported and
  parameterized (`staticMode`, `staticDir`, `isPublic`, ports). Becomes the
  embeddable supervisor after a small refactor (DI-010).
- `scripts/static-server.mjs` — serves `build/`, injects the session key into
  `index.html` (`makeConfigInjectionScript`), and proxies `/api`, `/sockets`,
  `/server_info`, WebSockets. Loading the renderer from
  `http://localhost:<port>` keeps all auth/proxy/WS behavior unchanged.
- `scripts/dev-safe.mjs::buildAgentServerCommand()` — already supports
  `OH_AGENT_SERVER_*` overrides; extended to accept a bundled-`uv` path (DI-031).
- Backend registry (`src/api/backend-registry/*`, kinds `local | cloud`) +
  `manage-backends-modal.tsx` + `use-backends-health.ts` +
  `api-key-entry-screen.tsx` — the in-app machinery for connecting to / switching
  between Agent Servers already exists.
- `src/components/features/onboarding/onboarding-modal.tsx` — the 4-step
  first-run flow; gains a "choose runtime" step (DI-040).

### Runtime targets

| Mode | Agent Server runs | Isolation | App responsibility |
|---|---|---|---|
| **direct** | host process via bundled `uvx` | none (full FS access) | spawn + supervise |
| **docker** | container (all-in-one image) | sandboxed | `docker run` / `docker stop` + supervise |
| **remote** | another machine | depends | register host+key only (connect) |
| **cloud** | OpenHands cloud | sandboxed | register `cloud` backend (connect) |

Decision: per product direction, the first-run wizard **always asks** — there is
no preset default runtime (DI-040). The wizard *recommends* based on detected
prerequisites but never auto-selects.

Scope decision: **v1 ships all four runtime modes** (direct, docker, remote,
cloud). Docker mode (Phase 2) is therefore in-scope for v1, not deferred. Only
the embedded-Python option (DI-033) and `.deb`/`.rpm` Linux packages remain
post-v1.

---

## Spec items

### Distribution & packaging

#### DI-001: One-download install, no terminal/git
- [ ] The user shall install by downloading a single signed installer per OS and
  double-clicking it. No `npm`, `git`, `node`, or `uv` install step shall be
  required of the user.

#### DI-002: Per-OS installer formats
- [ ] macOS shall ship a notarized `.dmg`. Windows shall ship a code-signed NSIS
  `.exe`. Linux shall ship an AppImage (with `.deb`/`.rpm` as stretch goals).

#### DI-003: Code-signing & notarization
- [ ] macOS builds shall be Developer-ID signed with the hardened runtime and
  notarized; every bundled binary (e.g. `uv`) shall be signed so notarization
  passes. Windows builds shall be Authenticode-signed. Signing secrets shall live
  in CI secrets, never in the repo.

#### DI-004: Auto-update
- [ ] The app shall auto-update via `electron-updater` against GitHub Releases,
  reusing the existing `v*` release tagging (`create-release.yml` et al.). A new
  `desktop-build.yml` matrix job (mac/win/linux) shall build via `electron-builder`
  and upload installers as release assets.

#### DI-005: Versioning stays centralized
- [ ] Desktop artifact versions and any added pins shall be derived from
  `config/defaults.json` / `package.json`, consistent with the existing
  single-source-of-truth rule. The release skill (`.agents/skills/release.md`)
  shall be updated to cover desktop artifacts.

### Update strategy (two-tier versioning)

> Two version axes update independently: the Electron **shell** (`package.json`,
> via `electron-updater`) and the **backend stack** (agent-server + automation,
> pinned in `config/defaults.json`, materialized by `uvx` in direct mode or the
> `ghcr.io/openhands/agent-canvas:<tag>` image in docker mode). These specs
> define how they stay coherent.

#### DI-070: Lockstep by default; shell is the source of truth for local modes
- [ ] For `direct` and `docker` modes, the backend version shall be the version
  pinned in the shell's bundled `config/defaults.json`. A shell update therefore
  updates the backend (lockstep). Each shell release ships the backend version it
  was tested against (CI mock-llm + live-e2e run against those pins), so lockstep
  equals the tested combination and there is no N×M compatibility matrix.

#### DI-071: Docker tag derived from shell version
- [ ] Docker mode shall pull `images.agentCanvas:<shellVersion>` (a monolithic
  image — inherently single-version). The tag shall derive from the shell version
  + `config/defaults.json`, never a floating `latest`.

#### DI-072: Offline fallback to last-good backend version
- [ ] The shell shall record the last backend version it successfully started. If
  a newly-pinned version cannot be fetched offline (uvx wheels uncached / image
  not pulled), the app shall offer to run the last-good version with a warning
  rather than hard-fail. (This removes the need for DI-033 in the *update* path;
  DI-033 remains only for the first-ever-install offline case.)

#### DI-073: Updates apply only when idle
- [ ] `electron-updater` shall not force a restart while agents/automations are
  running. It shall download in the background and apply on next quit or with
  explicit user approval, so an update never interrupts a live conversation
  (interplays with DI-051/DI-013 lifecycle).

#### DI-074: Remote/cloud are detect-and-warn, never enforced
- [ ] For `remote`/`cloud` modes the shell does not control the backend version.
  It shall read `/server_info.version` and show a non-blocking compatibility
  banner when outside the tested range, but shall never hard-block (keep
  `/settings/agent-server` reachable for recovery, per existing rules). Power
  users may pin a different *local* backend via the existing
  `OH_AGENT_SERVER_VERSION` / `OH_AGENT_SERVER_GIT_REF` escape hatches.

### Supervisor (Electron main process)

#### DI-010: Embeddable supervisor
- [ ] `dev-with-automation.mjs::main()` shall be refactored so it never calls
  `process.exit()` directly, surfaces errors via throw/events, and returns a
  handle (`{ stop(), urls, on('service-exit', …) }`). `bin/agent-canvas.mjs`
  shall consume the same handle so CLI and desktop share one supervisor.

#### DI-011: No duplicated supervision logic
- [ ] The Electron main process shall import the embeddable supervisor rather
  than reimplement process spawning, port allocation, key generation, or shutdown.
  Shared logic shall live in one module to prevent CLI/desktop drift.

#### DI-012: Renderer loads from local ingress
- [ ] The Electron `BrowserWindow` shall load `http://localhost:<port>` served by
  the existing static-server/ingress (not `file://`), so session-key injection,
  `/api` proxying, and WebSocket upgrades work without reimplementation.

#### DI-013: Lifecycle & port conflicts
- [ ] On quit, the app shall stop all child services (agent-server, automation,
  ingress, any container). Port conflicts (`assertPortsFree`) shall surface as a
  native dialog with a retry/alternate-port path, never a silent exit. (Desktop
  default behavior is refined by DI-062.)

### Coexistence, single-instance & lease lifecycle

> Correctness invariant: **at most one agent-server per state dir
> (`~/.openhands/agent-canvas`) at a time.** Two agent-servers sharing the
> conversations dir fight over `owner_lease.json` (45 s TTL; orphaned on hard
> kill) and conversations silently vanish from `/api/conversations/search`. The
> invariant is upheld by single-instance lock + reuse-if-present + guarded
> stale-lease recovery.

#### DI-060: Single-instance lock
- [ ] The app shall acquire `app.requestSingleInstanceLock()`; a second launch
  shall focus the existing window and exit, preventing two desktop supervisors
  against the same state dir.

#### DI-061: Reuse a healthy running stack instead of duplicating
- [ ] Before spawning, the supervisor shall probe the expected agent-server
  (`isPortBusy` + `GET /server_info` OK + auth OK with the persisted
  `api-key.txt` key). If a healthy compatible stack is found — e.g. a CLI
  `npx`/Docker run already running against the same `~/.openhands` — the app shall
  adopt it (register as a backend and connect) rather than spawn a second
  agent-server.

#### DI-062: Dynamic port fallback for foreign processes
- [ ] When a required port is held by an *unrecognized* process (not our
  agent-server), the supervisor shall fall back to OS-assigned ports
  (`findFreePort` / `findFreePorts`) and load the window at the resolved ingress
  URL, instead of the hard `assertPortsFree` throw. Internal agent-server /
  automation ports are abstracted by the ingress, so the renderer is unaffected.

#### DI-063: Guarded stale-lease recovery
- [ ] When (and only when) the supervisor spawns its own agent-server and has
  confirmed no server is bound to the backend port, it shall call
  `releaseStaleConversationLeases(conversationsDir)` before start, so
  conversations orphaned by a crash/force-quit reload. It shall never release
  leases while any agent-server is bound to that port.

#### DI-064: (Optional) Isolated instance with a separate state dir
- [ ] Advanced path: allow launching against an alternate state dir
  (`OH_CANVAS_SAFE_STATE_DIR`) so a second concurrent stack can run without
  violating the one-server-per-state-dir invariant. May land post-v1.

### Renderer ↔ main IPC & window security

> The desktop API is *additive*: the renderer is the same web app served from
> localhost, so the bridge must be feature-detected (`window.agentCanvasDesktop`)
> and the frontend must keep running unchanged in browser / CLI / Docker.

#### DI-080: Hardened BrowserWindow
- [ ] Windows shall use `contextIsolation: true`, `nodeIntegration: false`,
  `sandbox: true`, and `webSecurity: true`. The renderer shall load only the
  local ingress origin; external navigations/links shall open in the system
  browser (deny in-app navigation away from localhost).

#### DI-081: Single typed preload bridge
- [ ] A single `preload` script shall expose `window.agentCanvasDesktop` via
  `contextBridge` — no raw `ipcRenderer`. Every channel shall be enumerated and
  validated; unknown channels rejected.

#### DI-082: IPC command surface (renderer → main)
- [ ] The bridge shall expose exactly: `stack.getStatus()`,
  `stack.start(mode, opts)`, `stack.stop()`, `stack.restart()`;
  `runtime.getMode()` / `runtime.setMode(mode)` / `runtime.detectPrereqs()`;
  `dialog.pickFolder()`; `logs.getPath()` / `logs.open()`; `app.getVersion()` /
  `app.checkForUpdates()`. New capabilities require a new typed channel, never a
  generic passthrough.

#### DI-083: IPC event surface (main → renderer)
- [ ] The bridge shall deliver typed events: `stack.statusChanged`,
  `service.exited`, `update.available`, `update.downloaded`, and
  `prereqs.changed`. Listeners shall register through the bridge, not via direct
  `ipcRenderer.on`.

#### DI-084: Feature-detected, single frontend
- [ ] Frontend code shall guard every desktop call with
  `if (window.agentCanvasDesktop)` so the identical build runs in the browser,
  CLI static server, and Docker without the bridge present. No desktop-only fork
  of the frontend.

#### DI-085: No privilege escalation over IPC
- [ ] The bridge shall not expand the renderer's privilege: the session key is
  already injected into the page by the static-server today, so IPC shall not
  re-expose additional credentials or arbitrary filesystem/shell access.

### Runtime selection & management

#### DI-020: Runtime Manager
- [ ] A Runtime Manager module shall, given a selected mode, either (a) run the
  embeddable supervisor in `direct` mode, (b) `docker run`/`docker stop` the
  all-in-one image in `docker` mode, or (c) for `remote`/`cloud` write a
  backend-registry entry and connect — no local spawn.

#### DI-021: Mode is persisted and switchable post-install
- [ ] The chosen runtime shall persist under `~/.openhands/agent-canvas/` and be
  changeable later from a Settings page (co-located with `/settings/agent-server`)
  without reinstalling.

#### DI-022: Reuse backend registry for connections
- [ ] `remote` and `cloud` modes shall reuse the existing backend registry,
  health polling (`use-backends-health.ts`), and `api-key-entry-screen.tsx`
  rather than introduce parallel connection UI.

#### DI-023: Switching runtime is non-destructive
- [ ] Switching modes shall not delete conversations/settings in
  `~/.openhands`. Switching to/from `docker` shall reuse the same mounted state
  directory so history is shared across modes where technically possible.

### First-run wizard

#### DI-040: Wizard always asks for runtime (no preset default)
- [ ] First launch shall present a runtime-choice step (extending
  `onboarding-modal.tsx`) listing direct / docker / remote / cloud. The wizard
  shall *recommend* based on detected prerequisites but shall **not** pre-select
  a default; the user must explicitly choose.

#### DI-041: Prerequisite detection surfaced in-app
- [ ] The main process shall detect Docker (`docker info`) and report
  availability to the renderer via IPC. The wizard shall enable/disable and
  annotate each option accordingly (e.g. "Docker not detected — install Docker
  Desktop to enable the sandbox option"), mirroring the existing
  `formatMissingUvxGuidance` UX as in-app cards.

#### DI-042: Security warning for direct mode
- [ ] Selecting `direct` shall require acknowledging a clear warning that the
  agent has full filesystem access (consistent with the README warnings).

### Bundled runtime

#### DI-030: Bundle `uv` for zero-prereq direct mode
- [ ] The installer shall ship a per-platform `uv` binary as `extraResources` so
  `direct` mode requires no user-installed `uv`/Python on the host.

#### DI-031: Supervisor uses the bundled `uv`
- [ ] `buildAgentServerCommand` (and the automation equivalent) shall accept an
  explicit `uv`/`uvx` path so the supervisor invokes the bundled binary instead
  of relying on PATH/`commandExists`.

#### DI-032: First-run fetch UX
- [ ] First launch of `direct`/`docker` modes (uvx wheel download or image pull)
  shall show a progress screen; failures (offline, etc.) shall be actionable, not
  a blank window.

#### DI-033: (Later) Embedded Python option
- [ ] A future phase may bundle a standalone Python + pre-installed wheels to
  remove the first-run network dependency. Out of scope for v1.

### Background service & system tray

> Rationale: the product promises "run agents on a schedule" and "agents
> continue running even when your laptop is shut." On a laptop that requires a
> resident background process that outlives the window — a menu-bar (macOS) /
> system-tray (Windows/Linux) item. This is the main capability that justifies a
> desktop app over the existing npx/Docker channels (cf. the n8n Desktop
> deprecation, which lacked this differentiation).

#### DI-050: Menu-bar / system-tray resident
- [ ] The app shall expose a tray item (Electron `Tray`; macOS menu bar, Windows
  & Linux system tray) showing stack status (running / stopped / degraded) and
  the current runtime mode, with actions: open main window, start / stop /
  restart the local stack, open logs, and Quit. Status shall reuse
  `use-backends-health.ts` verdicts and the colored-dot vocabulary from
  `manage-backends-modal.tsx`.

#### DI-051: Window close does not quit while a local stack runs
- [ ] Closing the main window shall not terminate the app or its supervised
  services while a local (`direct`/`docker`) stack is running; only the tray's
  explicit **Quit** shall tear everything down (consistent with DI-013). For
  `remote`/`cloud` modes the tray shall degrade to a status/launcher role and
  shall not offer start/stop for a server it does not own.

#### DI-052: Launch at login
- [ ] The app shall offer an opt-in "Launch at login" setting so scheduled
  automations fire after a reboot without the user reopening the window. The
  setting shall be surfaced both in the tray menu and in Settings.

### Operations, platform integration & hardening

#### DI-090: Crash recovery with backoff
- [ ] The supervisor shall auto-restart a crashed child service (agent-server /
  automation / ingress) with capped exponential backoff (e.g. 3 attempts). On
  exhaustion it shall surface a tray error + "view logs" rather than silently
  die, mirroring the Docker entrypoint's crash tolerance.

#### DI-091: Logging to disk
- [ ] Each service shall log to `~/.openhands/agent-canvas/logs/<service>.log`
  with size/date rotation. The tray "Open logs" action (DI-050) shall reveal this
  directory.

#### DI-092: Docker mode operational rules
- [ ] Docker mode shall `docker run` with `-p <hostPort>:8000` and load the
  window at `http://localhost:<hostPort>` (the container ships its own
  ingress/frontend), avoiding `host.docker.internal`. It shall mount
  `~/.openhands` and the user-selected projects dir(s), detect a stopped daemon
  via `docker info` and show an actionable card, and pin the tag per DI-071.
  Podman is best-effort / post-v1.

#### DI-093: Native folder picker for local modes
- [ ] `direct` / `docker` modes shall use the native `dialog.showOpenDialog`
  (via `dialog.pickFolder()`) for choosing the working/projects directory,
  feeding the result into the existing workspace flow. `remote` / `cloud` shall
  keep using the in-app `FolderBrowserModal` (the filesystem lives on the server).

#### DI-094: v1 support matrix
- [ ] v1 shall target macOS 12+ (universal2: arm64 + x64), Windows 10/11 x64, and
  Linux x64 (AppImage, glibc ≥ 2.31). Windows arm64, Linux arm64, and
  `.deb`/`.rpm` are post-v1. Bundled `uv` binaries shall match each shipped arch.

#### DI-095: Deep-link protocol handler (minimal in v1)
- [ ] The app shall register an `openhands://` protocol handler that focuses the
  window and routes to a path. Full external-trigger semantics (Slack/GitHub) are
  post-v1.

#### DI-096: Desktop telemetry identity
- [ ] The desktop build shall fire `canvas_install` once per installation (keyed
  by a persisted install id under `~/.openhands/agent-canvas/`) and tag events
  with `platform: "desktop"`, reusing `telemetry.ts` and honoring the existing
  consent surfaces. No new analytics system.

#### DI-097: Disk footprint & cleanup
- [ ] The OS uninstaller shall leave user data (`~/.openhands`) intact. An in-app
  "Clean caches" action shall optionally remove `~/.cache/uv` wheels and pulled
  Docker images. Disk usage shall be disclosed in Settings.

#### DI-098: Respect system/env proxies
- [ ] The app, `uvx`, and `docker pull` shall honor system / `HTTP(S)_PROXY`
  settings in v1. Full air-gap support is deferred to DI-033.

---

## Phased roadmap

1. **Phase 0 — Embeddable launcher (DI-010, DI-011).** Refactor `main()` to
   return a handle and stop calling `process.exit()`. Benefits CLI users too.
   Lowest risk; unblocks everything else.
2. **Phase 1 — Minimal Electron shell + coexistence (DI-012, DI-013, DI-030,
   DI-031, DI-060–DI-063, DI-070, DI-072, DI-080–DI-085, DI-090, DI-091,
   DI-093).** BrowserWindow → existing ingress; hardened window + typed IPC
   bridge; supervisor runs `direct` mode with bundled `uv`; single-instance lock,
   reuse-if-present, dynamic ports, guarded lease recovery; crash backoff +
   logging; native folder picker; shell-pinned backend version with offline
   last-good fallback. Unsigned dev builds.
3. **Phase 2 — Runtime selection + tray (DI-020–DI-023, DI-040–DI-042,
   DI-050–DI-052, DI-071, DI-074, DI-092).** Wizard step + Settings page + Docker
   mode in the Runtime Manager (shell-derived image tag; published-port renderer;
   remote/cloud detect-and-warn), reusing backend-registry and health UI;
   menu-bar/tray resident, close-≠-quit lifecycle, and launch-at-login.
4. **Phase 3 — Distribution (DI-001–DI-005, DI-032, DI-073, DI-094, DI-095,
   DI-096, DI-097, DI-098).** electron-builder targets, signing/notarization,
   `electron-updater` with idle-only apply, support matrix, deep-link handler,
   telemetry/cleanup/proxy, CI release job.
5. **Phase 4 — Optional embedded Python + isolated instance (DI-033, DI-064).**
   Remove first-run network dependency; allow concurrent stacks via separate
   state dir. Defer until demand exists.

---

## Decisions log

All design questions are resolved; each maps to DI spec items above. Anything
that is *not* an engineering decision (accounts, certs, assets) lives in
"Pre-build readiness" below.

- **v1 scope** → all four runtime modes (Scope decision).
- **Two-tier update strategy** → DI-070–DI-074.
- **Coexistence / lease conflict** → DI-060–DI-064.
- **IPC / window security** → DI-080–DI-085.
- **Crash recovery + logging** → DI-090, DI-091.
- **Docker operational details + renderer URL** → DI-092 (publish container port,
  load `localhost:<hostPort>`; no `host.docker.internal`).
- **Native folder picker vs `FolderBrowserModal`** → DI-093 (native for local
  modes, in-app browser for remote/cloud).
- **Support matrix** → DI-094.
- **Deep-link protocol** → DI-095 (minimal in v1).
- **Telemetry identity & consent** → DI-096.
- **Disk footprint & cleanup** → DI-097.
- **Corporate proxy** → DI-098 (honor system proxies; air-gap deferred to DI-033).
- **uv first-run network dependency** → acceptable for v1 with DI-032 progress UX.
- **State sharing across modes** → DI-023 (direct & docker share
  `~/.openhands/agent-canvas`; verify on-disk compatibility in Phase 2).
- **Electron vs Tauri** → Electron for v1 (reuses `main()`); revisit post-v1.
- **macOS background permissions** → normal app + `Tray` (not `LSUIElement`);
  launch-at-login via `app.setLoginItemSettings` (DI-052).

---

## Pre-build readiness

### Decided — safe to start
- [x] Architecture, runtime modes, update strategy, coexistence, IPC contract,
  and operations are all specified (DI-0xx above).
- [ ] **Repo structure:** add an isolated `desktop/` workspace with its own
  `package.json`. Electron / electron-builder / electron-updater shall live ONLY
  there — never in the root `dependencies` / `devDependencies` — so they do not
  leak into the published `@openhands/agent-canvas` npm library or the Docker
  build. (Confirm before any code.)
- [ ] **App identity:** appId `dev.openhands.agent-canvas`, product name
  "Agent Canvas". (Confirm before any code.)

### Needed before Phase 1 (Electron shell)
- [ ] Phase 0 (`main()` refactor, DI-010) merged so the supervisor is importable.
- [ ] Per-arch `uv` binaries acquired and wired as `extraResources` (DI-030).
- [ ] Placeholder app icon (final branding can come later).

### Needed before Phase 3 (signed distribution) — external, long lead time
- [ ] **Apple Developer Program** membership under the org + a Developer ID
  Application certificate (for `.dmg` signing + notarization).
- [ ] **Windows code-signing certificate** (EV recommended for SmartScreen
  reputation).
- [ ] Certs + notarization Apple-ID/app-password provisioned into **CI secrets**.
- [ ] **Final branding assets** (per-platform icons, installer artwork).
- [ ] CI runners confirmed (GitHub-hosted mac/win/linux are sufficient).

### Not blocking v1 (post-v1)
- [ ] Embedded Python for full air-gap (DI-033); isolated concurrent instances
  (DI-064); `.deb`/`.rpm`, Windows/Linux arm64, Podman; full deep-link triggers.

> **Bottom line:** Phases 0–2 have **no external blockers** and can start now,
> pending only the two repo-structure confirmations above. The sole true
> prerequisites are procurement items (Apple/Windows certs + branding) required
> for **Phase 3 signed distribution** — start those in parallel with Phase 0.
