// @spec DI-030 — fetch the standalone `uv` binary for bundling.
//
// Downloads the official astral-sh/uv standalone build for one or more targets
// into `desktop/vendor/uv/<platform>-<arch>/` (gitignored). Run at build time
// (electron-builder `extraResources` copies it into the app), and optionally in
// dev to exercise the bundled-uv code path. Falls back to system `uv` when the
// bundle is absent, so this is not required for `npm start` during development.
//
// Usage:
//   node scripts/fetch-uv.mjs                 # host platform/arch
//   node scripts/fetch-uv.mjs darwin-arm64 darwin-x64   # explicit targets

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const VENDOR_ROOT = join(HERE, "..", "vendor", "uv");

// Maps our `<platform>-<arch>` keys to uv release asset names + archive kind.
const TARGETS = {
  "darwin-arm64": { asset: "uv-aarch64-apple-darwin", kind: "tar.gz" },
  "darwin-x64": { asset: "uv-x86_64-apple-darwin", kind: "tar.gz" },
  "linux-x64": { asset: "uv-x86_64-unknown-linux-gnu", kind: "tar.gz" },
  "linux-arm64": { asset: "uv-aarch64-unknown-linux-gnu", kind: "tar.gz" },
  "win32-x64": { asset: "uv-x86_64-pc-windows-msvc", kind: "zip" },
};

function hostKey() {
  return `${process.platform}-${process.arch}`;
}

async function download(url, dest) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`Download failed (${res.status}) for ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
}

function extract(archivePath, kind, destDir) {
  mkdirSync(destDir, { recursive: true });
  if (kind === "tar.gz") {
    // uv tarballs contain a top-level `<asset>/` dir holding uv + uvx.
    const r = spawnSync(
      "tar",
      ["-xzf", archivePath, "-C", destDir, "--strip-components=1"],
      { stdio: "inherit" },
    );
    if (r.status !== 0) throw new Error("tar extraction failed");
  } else {
    const r = spawnSync("unzip", ["-o", archivePath, "-d", destDir], {
      stdio: "inherit",
    });
    if (r.status !== 0) throw new Error("unzip extraction failed");
  }
}

async function fetchTarget(key) {
  const spec = TARGETS[key];
  if (!spec) {
    throw new Error(
      `Unknown target "${key}". Known: ${Object.keys(TARGETS).join(", ")}`,
    );
  }
  const destDir = join(VENDOR_ROOT, key);
  const ext = spec.kind === "zip" ? "zip" : "tar.gz";
  const url = `https://github.com/astral-sh/uv/releases/latest/download/${spec.asset}.${ext}`;
  const tmp = join(tmpdir(), `${spec.asset}.${ext}`);

  process.stdout.write(`• ${key}: ${url}\n`);
  await download(url, tmp);
  rmSync(destDir, { recursive: true, force: true });
  extract(tmp, spec.kind, destDir);
  rmSync(tmp, { force: true });

  const uvName = process.platform === "win32" ? "uv.exe" : "uv";
  if (!existsSync(join(destDir, uvName))) {
    throw new Error(`uv binary missing after extraction in ${destDir}`);
  }
  process.stdout.write(`  → ${destDir}\n`);
}

async function main() {
  const targets = process.argv.slice(2);
  const list = targets.length > 0 ? targets : [hostKey()];
  mkdirSync(VENDOR_ROOT, { recursive: true });
  for (const key of list) {
    // eslint-disable-next-line no-await-in-loop
    await fetchTarget(key);
  }
  process.stdout.write("Done.\n");
}

main().catch((err) => {
  process.stderr.write(`fetch-uv failed: ${err.message}\n`);
  process.exit(1);
});
