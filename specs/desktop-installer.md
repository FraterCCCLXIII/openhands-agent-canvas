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
  native dialog with a retry/alternate-port path, never a silent exit.

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

---

## Phased roadmap

1. **Phase 0 — Embeddable launcher (DI-010, DI-011).** Refactor `main()` to
   return a handle and stop calling `process.exit()`. Benefits CLI users too.
   Lowest risk; unblocks everything else.
2. **Phase 1 — Minimal Electron shell (DI-012, DI-013, DI-030, DI-031).**
   BrowserWindow → existing ingress; supervisor runs `direct` mode with bundled
   `uv`. Unsigned dev builds.
3. **Phase 2 — Runtime selection + tray (DI-020–DI-023, DI-040–DI-042,
   DI-050–DI-052).** Wizard step + Settings page + Docker mode in the Runtime
   Manager, reusing backend-registry and health UI; menu-bar/tray resident,
   close-≠-quit lifecycle, and launch-at-login.
4. **Phase 3 — Distribution (DI-001–DI-005, DI-032).** electron-builder targets,
   signing/notarization, `electron-updater`, CI release job.
5. **Phase 4 — Optional embedded Python (DI-033).** Remove first-run network
   dependency. Defer until demand exists.

---

## Open questions

Grouped by how blocking each one is. Tier 1 should be resolved before writing
Electron code; Tier 2 shapes Phase 1–2; Tier 3 can be decided during the build.

### Tier 1 — resolve before writing code

- **v1 scope:** RESOLVED — v1 ships all four runtime modes (see "Scope decision"
  above). Docker mode is in-scope.
- **Two-tier update strategy:** `electron-updater` updates the *shell*, but the
  agent-server + automation versions are a separate axis (pinned in
  `config/defaults.json`, fetched by `uvx` or pulled as a Docker image). Decide:
  do shell and backend versions bump together? What happens offline (shell
  updates but `uvx` can't fetch wheels)? How do we keep shell↔backend compatible
  when tool names/APIs change? (`/server_info` only *detects* version, it does
  not *guarantee* compatibility.)
- **Coexistence with an already-running stack + conversation-lease conflict:** if
  the user has run `npx`/Docker, `~/.openhands/agent-canvas` already has
  keys/conversations and something may hold `:8000`. `assertPortsFree` currently
  throws, and two agent-servers sharing the conversations dir fight over
  `owner_lease.json` (cf. `releaseStaleConversationLeases`). Decide: reuse a
  running stack, pick new ports, or refuse?
- **Renderer↔main IPC / security contract:** lock in `contextIsolation: true`,
  `nodeIntegration: false`, and a typed `preload` bridge. Define the API surface
  the renderer may call (start/stop stack, pick folder, runtime status, open
  logs). Hard to change later; primary Electron security footgun.

### Tier 2 — shapes Phase 1–2

- **Crash recovery + logging:** does the supervisor auto-restart a crashed
  agent-server (with backoff)? Where do logs go on disk so the tray "open logs"
  action works, and how are they rotated? (Docker entrypoint *tolerates* backend
  crashes via 502; desktop needs an explicit policy.)
- **Docker mode operational details:** image tag pinned to the shell version via
  `config/defaults.json` `images.agentCanvas`; "Docker installed but daemon
  stopped" handling; volume mounts (`~/.openhands`, which project dirs); the
  macOS/Windows networking quirk (`--network host` is Linux-only; mac/win need
  `host.docker.internal`, per the mock-llm-docker notes); Podman/rootless.
- **Native folder picker vs `FolderBrowserModal`:** in direct mode the agent has
  full FS access; the existing browser talks to the agent-server file API. Decide
  whether native `dialog.showOpenDialog` owns workspace/working-dir selection.
- **Support matrix:** macOS min version + Apple Silicon/Intel (universal vs
  separate); Windows 10/11 x64/arm64; Linux glibc baseline. The bundled `uv`
  binary must match each arch — gates DI-030.
- **Code-signing cert ownership/provisioning:** beyond EV-vs-OV — who holds the
  Apple Developer account and the Windows cert, and how do they reach CI secrets?
  Longest-lead-time item; start procurement in parallel with Phase 0.
- **Docker mode renderer:** proxy the container through the Electron-side ingress
  (uniform) vs. point the window straight at the container's `:8000` (simpler).
  Leaning toward proxy for a consistent URL/session-key story.

### Tier 3 — decide during the build

- **Deep-link / custom URL scheme** (e.g. `openhands://…`): register a protocol
  handler so external triggers (Slack/GitHub, per the product pitch) can
  focus/drive the desktop app?
- **Telemetry identity & consent in desktop:** does an Electron install count as
  a `canvas_install`? Reconcile with the two existing PostHog systems and the
  consent surfaces (`TelemetryConsentBanner`, `AnalyticsConsentFormModal`).
- **Disk footprint & uninstall cleanup:** `uv` caches wheels+Python in
  `~/.cache/uv` and Docker images are GBs. Does uninstall clean them, and how is
  disk usage disclosed?
- **Corporate proxy / air-gap:** `uvx` (PyPI), `docker pull`, and
  `electron-updater` all need proxy config; air-gapped orgs push DI-033 (embedded
  Python) sooner.
- **uv first-run network dependency:** acceptable for v1, or do we need DI-033
  sooner for fully-offline installs?
- **State sharing across modes (DI-023):** direct mode uses
  `~/.openhands/agent-canvas`; the Docker image mounts the same path. Confirm the
  on-disk formats are compatible enough to share history when switching.
- **Electron vs Tauri:** Electron is chosen for v1 because the main process can
  import `dev-with-automation.mjs::main()` directly and the codebase is all-JS.
  Tauri (Rust shell, native sidecar/tray, ~10–20 MB installers vs Electron's
  ~100 MB+) is the main alternative if binary size or memory becomes a concern;
  revisit post-v1.
- **macOS background permissions (DI-050–DI-052):** a resident menu-bar app +
  launch-at-login interacts with the Login Items & Background permission surface
  and notarization. Confirm we ship a normal app *with* a menu-bar item (not an
  `LSUIElement` menu-bar-only app, since there is a real main window).
