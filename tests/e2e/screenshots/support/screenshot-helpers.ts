import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import { seedLocalStorage } from "../../snapshots/support/seed-local-storage";
import { stubWebSocket } from "../../snapshots/support/stub-websocket";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_ROOT = path.resolve(__dirname, "../../../../screenshots");

export type ScreenshotNavVariant = "expanded" | "nav-collapsed";

export function screenshotsDirForVariant(variant: ScreenshotNavVariant): string {
  return variant === "expanded"
    ? SCREENSHOTS_ROOT
    : path.join(SCREENSHOTS_ROOT, "nav-collapsed");
}

export async function prepareScreenshotPage(
  page: Page,
  extraLocalStorage: [string, string][] = [],
): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.removeItem("openhands-agent-server-config");
    window.localStorage.removeItem("openhands-backends");
    window.localStorage.removeItem("openhands-active-backend");
    window.localStorage.removeItem("conversation-panel-preferences");
  });
  await seedLocalStorage(page, { extra: extraLocalStorage });
  await stubWebSocket(page);
}

export async function dismissConsentModal(page: Page): Promise<void> {
  await page
    .getByRole("button", { name: "Confirm preferences" })
    .click({ timeout: 3_000 })
    .catch(() => undefined);
}

export async function waitForAppShell(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page
    .getByTestId("root-layout")
    .waitFor({ state: "visible", timeout: 30_000 });
}

export async function collapseSidebar(page: Page): Promise<void> {
  const collapsedAside = page.locator("aside[data-collapsed='true']");
  if (await collapsedAside.isVisible()) {
    return;
  }

  await page.getByTestId("sidebar-collapse-toggle").click();
  await collapsedAside.waitFor({ state: "visible", timeout: 10_000 });
}

export async function applyNavVariant(
  page: Page,
  variant: ScreenshotNavVariant,
): Promise<void> {
  if (variant === "nav-collapsed") {
    await collapseSidebar(page);
  }
}

export async function capturePage(
  page: Page,
  filename: string,
  options: {
    fullPage?: boolean;
    locator?: ReturnType<Page["getByTestId"]>;
    variant?: ScreenshotNavVariant;
  } = {},
): Promise<void> {
  const variant = options.variant ?? "expanded";
  const target = options.locator ?? page;
  await target.screenshot({
    path: path.join(screenshotsDirForVariant(variant), filename),
    fullPage: options.fullPage ?? true,
    animations: "disabled",
    scale: "device",
  });
}

export async function openConversationTab(
  page: Page,
  tab: "files" | "terminal" | "browser" | "planner" | "tasklist",
): Promise<void> {
  await page.getByTestId("right-panel-toggle").click({ timeout: 10_000 });
  await page.getByTestId(`conversation-tab-${tab}`).click({ timeout: 10_000 });
  await page
    .getByTestId(`conversation-tab-${tab}`)
    .waitFor({ state: "visible" });
}

const CONVERSATION_ONE_STATE = JSON.stringify({
  selectedTab: "files",
  filesTabDiffView: true,
  filesTabContentViewMode: "rich",
  unpinnedTabs: [],
  conversationMode: "code",
  subConversationTaskId: null,
  draftMessage: null,
});

export async function seedConversationOneFilesTab(page: Page): Promise<void> {
  await prepareScreenshotPage(page, [
    ["conversation-state-1", CONVERSATION_ONE_STATE],
  ]);
}
