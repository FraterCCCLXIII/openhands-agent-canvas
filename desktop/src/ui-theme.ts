// Shared styling primitives for the desktop-owned HTML screens (splash + first-run
// wizard). These screens are standalone data: documents rendered by the main
// process, so they cannot import the app's Tailwind/`--oh-*` tokens directly.
// Instead we mirror the canonical values from `src/index.css` / `src/tailwind.css`
// here, in ONE place, so both screens stay on-brand and we avoid magic colors at
// the call sites.

import { readFileSync } from "node:fs";
import { join } from "node:path";

// App background (cool-grey-950). Reused for BrowserWindow.backgroundColor so the
// native window chrome matches the rendered page before paint.
export const APP_BACKGROUND = "#0B0E14";

// Mirror of the app's cool-grey scale + the semantic aliases the screens use.
// Source of truth: src/index.css (:root) and src/tailwind.css.
export const THEME_CSS = `
  :root {
    color-scheme: dark;
    --cool-grey-50:#F7F9FC; --cool-grey-100:#EEF2F7; --cool-grey-200:#DCE3EE;
    --cool-grey-300:#C3CDDC; --cool-grey-400:#A3B0C4; --cool-grey-500:#7E8A9E;
    --cool-grey-600:#626D82; --cool-grey-700:#4B5468; --cool-grey-800:#383F50;
    --cool-grey-900:#2C313F; --cool-grey-925:#21252F; --cool-grey-950:#0B0E14;
    --cool-grey-975:#05070A;

    --background: var(--cool-grey-950);
    --foreground: var(--cool-grey-100);
    --surface: var(--cool-grey-925);
    --surface-raised: var(--cool-grey-900);
    --border: var(--cool-grey-700);
    --border-subtle: var(--cool-grey-800);
    --muted: var(--cool-grey-400);
    --text-secondary: var(--cool-grey-300);
    --text-dim: var(--cool-grey-500);
    --primary: #c9b974;
    --danger: #e76a5e;
    --white: #ffffff;
    --radius: 8px;
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }
`;

// A slim, indeterminate single-line loader in white — mirrors the app's preference
// for a minimal horizontal loader over a circular spinner.
export const LINE_LOADER_CSS = `
  .line-loader {
    position: relative;
    width: 180px;
    height: 3px;
    border-radius: 999px;
    overflow: hidden;
    background: color-mix(in srgb, var(--white) 12%, transparent);
  }
  .line-loader::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 40%;
    border-radius: 999px;
    background: var(--white);
    animation: line-loader-slide 1.15s ease-in-out infinite;
  }
  @keyframes line-loader-slide {
    0% { transform: translateX(-130%); }
    100% { transform: translateX(330%); }
  }
  @media (prefers-reduced-motion: reduce) {
    .line-loader::after { animation-duration: 2.4s; }
  }
`;

let cachedLogo: string | null = null;

/**
 * Inline white OpenHands mark. We strip the fixed width/height and tighten the
 * viewBox (the source has heavy vertical padding) so callers control the size via
 * CSS, and swap the white fill for `currentColor` so the parent's `color` drives it.
 */
export function logoSvg(): string {
  if (cachedLogo !== null) return cachedLogo;
  try {
    const raw = readFileSync(join(__dirname, "..", "assets", "logo-white.svg"), "utf8");
    cachedLogo = raw
      .replace(/<\?xml[^>]*\?>\s*/, "")
      .replace(/\swidth="\d+"\s+height="\d+"/, "")
      .replace(/viewBox="0 -24 148 148"/, 'viewBox="0 0 148 100"')
      .replace(/fill="white"/g, 'fill="currentColor"');
  } catch {
    cachedLogo = "";
  }
  return cachedLogo;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Wrap rendered HTML into a data: URL the BrowserWindow can load. */
export function toDataUrl(html: string): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}
