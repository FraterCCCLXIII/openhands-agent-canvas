# Branch notes — `poc/installer-electron`

Working notes for the Electron desktop installer POC. See
[`../specs/desktop-installer.md`](../specs/desktop-installer.md) for the full
design and [`README.md`](./README.md) for how to run/build.

## What's verified working

- **Self-start** — with ports free, the app spawns its own agent-server +
  automation + ingress (direct mode) and the renderer loads; the whole stack is
  owned by the desktop process tree.
- **Bundled `uv`** — `npm run fetch-uv` pulls the standalone binary into
  gitignored `vendor/uv/<platform>-<arch>/`; the supervisor prepends it to the
  stack's `PATH` (logs `Using bundled uv …`), falling back to system `uv`. The
  packaged path resolves via `process.resourcesPath`.
- **Runtime wizard** — native always-ask picker on first run (and tray
  "Switch Runtime…"); Docker mode confirmed end-to-end.
- **`.dmg`** — `release/Agent Canvas-0.1.0-arm64.dmg` (134 MB), ad-hoc signed
  (`dev.openhands.agent-canvas`), bundling `build/bin/scripts/config/tools` +
  `uv`. Runnable locally (right-click → Open the first time).

## What remains for a true public release (Phase 3)

- Real Developer ID signing + notarization (mac) and a Windows cert —
  procurement lead time.
- Auto-update (`electron-updater`) and final branding/icons.
- Windows/Linux packaging targets + a CI release job.
- The in-process embeddable `main()` handle (DI-010) is still deferred in favor
  of the subprocess supervisor (works well).

## Try it now

You can install and try the `.dmg` now: open `desktop/release/`, run the dmg,
drag to Applications, then right-click → Open.
