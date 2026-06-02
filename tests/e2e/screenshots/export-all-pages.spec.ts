import fs from "node:fs";
import { test, type Page } from "@playwright/test";
import {
  applyNavVariant,
  capturePage,
  dismissConsentModal,
  openConversationTab,
  prepareScreenshotPage,
  screenshotsDirForVariant,
  seedConversationOneFilesTab,
  type ScreenshotNavVariant,
  waitForAppShell,
} from "./support/screenshot-helpers";

const PRIMARY_AUTOMATION_ID = "a1000000-0000-0000-0000-000000000001";

const NAV_VARIANTS: ScreenshotNavVariant[] = ["expanded", "nav-collapsed"];

type PageCapture = {
  filename: string;
  /** Viewport-only capture for hero/marketing; full scroll for long settings pages. */
  fullPage?: boolean;
  prepare?: (page: Page) => Promise<void>;
  navigate: (page: Page) => Promise<void>;
  ready: (page: Page) => Promise<void>;
};

const PAGE_CAPTURES: PageCapture[] = [
  {
    filename: "01-home-conversations.png",
    fullPage: false,
    navigate: async (page) => {
      await page.goto("/conversations");
    },
    ready: async (page) => {
      await page.getByText("Authentication module refactor").waitFor({
        timeout: 20_000,
      });
    },
  },
  {
    filename: "02-conversation-chat.png",
    fullPage: false,
    navigate: async (page) => {
      await page.goto("/conversations/1");
    },
    ready: async (page) => {
      await page
        .getByTestId("chat-interface")
        .waitFor({ state: "visible", timeout: 20_000 });
    },
  },
  {
    filename: "03-conversation-files-changes.png",
    prepare: seedConversationOneFilesTab,
    navigate: async (page) => {
      await page.goto("/conversations/1");
    },
    ready: async (page) => {
      await page
        .getByTestId("chat-interface")
        .waitFor({ state: "visible", timeout: 20_000 });
      await openConversationTab(page, "files");
      await page
        .getByTestId("files-tab")
        .waitFor({ state: "visible", timeout: 15_000 });
    },
  },
  {
    filename: "04-conversation-terminal.png",
    navigate: async (page) => {
      await page.goto("/conversations/1");
    },
    ready: async (page) => {
      await page
        .getByTestId("chat-interface")
        .waitFor({ state: "visible", timeout: 20_000 });
      await openConversationTab(page, "terminal");
      await page.locator(".xterm").first().waitFor({
        state: "visible",
        timeout: 15_000,
      });
    },
  },
  {
    filename: "05-conversation-archived.png",
    navigate: async (page) => {
      await page.goto("/conversations/4");
    },
    ready: async () => undefined,
  },
  {
    filename: "06-automations-list.png",
    fullPage: false,
    navigate: async (page) => {
      await page.goto("/automations");
    },
    ready: async (page) => {
      await page
        .getByRole("button", { name: "Automation actions" })
        .first()
        .waitFor({ timeout: 15_000 });
    },
  },
  {
    filename: "07-automation-detail.png",
    fullPage: false,
    navigate: async (page) => {
      await page.goto(`/automations/${PRIMARY_AUTOMATION_ID}`);
    },
    ready: async (page) => {
      await page.getByText("PR Triage Digest").first().waitFor({
        timeout: 15_000,
      });
    },
  },
  {
    filename: "08-skills.png",
    fullPage: false,
    navigate: async (page) => {
      await page.goto("/skills");
    },
    ready: async (page) => {
      await page.getByTestId("skills-settings-screen").waitFor({
        state: "visible",
        timeout: 15_000,
      });
    },
  },
  {
    filename: "09-mcp.png",
    fullPage: false,
    navigate: async (page) => {
      await page.goto("/mcp");
    },
    ready: async (page) => {
      await page.getByTestId("mcp-page").waitFor({
        state: "visible",
        timeout: 15_000,
      });
    },
  },
  {
    filename: "10-plugins.png",
    navigate: async (page) => {
      await page.goto("/plugins");
    },
    ready: async (page) => {
      await page.getByTestId("skills-plugins-screen").waitFor({
        state: "visible",
        timeout: 15_000,
      });
    },
  },
  {
    filename: "11-settings-llm.png",
    navigate: async (page) => {
      await page.goto("/settings/llm");
    },
    ready: async () => undefined,
  },
  {
    filename: "12-settings-agent.png",
    navigate: async (page) => {
      await page.goto("/settings/agent");
    },
    ready: async () => undefined,
  },
  {
    filename: "13-settings-condenser.png",
    navigate: async (page) => {
      await page.goto("/settings/condenser");
    },
    ready: async () => undefined,
  },
  {
    filename: "14-settings-verification.png",
    navigate: async (page) => {
      await page.goto("/settings/verification");
    },
    ready: async () => undefined,
  },
  {
    filename: "15-settings-app.png",
    navigate: async (page) => {
      await page.goto("/settings/app");
    },
    ready: async () => undefined,
  },
  {
    filename: "16-settings-secrets.png",
    navigate: async (page) => {
      await page.goto("/settings/secrets");
    },
    ready: async () => undefined,
  },
];

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  for (const variant of NAV_VARIANTS) {
    fs.mkdirSync(screenshotsDirForVariant(variant), { recursive: true });
  }
});

for (const variant of NAV_VARIANTS) {
  test.describe(`${variant} nav`, () => {
    for (const capture of PAGE_CAPTURES) {
      test(capture.filename, async ({ page }) => {
        if (capture.prepare) {
          await capture.prepare(page);
        } else {
          await prepareScreenshotPage(page);
        }

        await capture.navigate(page);
        await dismissConsentModal(page);
        await waitForAppShell(page);
        await capture.ready(page);
        await applyNavVariant(page, variant);
        await capturePage(page, capture.filename, {
          variant,
          fullPage: capture.fullPage,
        });
      });
    }
  });
}
