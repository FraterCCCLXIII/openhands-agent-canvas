import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for exporting marketing/demo screenshots.
 * Starts the frontend with VITE_SCREENSHOT_MODE + VITE_MOCK_API so MSW
 * serves polished fixture data from src/mocks/screenshot-fixtures/.
 */
export default defineConfig({
  testDir: "./tests/e2e/screenshots",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:3020/",
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Override Desktop Chrome defaults (1280×720) for retina marketing exports.
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
      },
    },
  ],
  webServer: {
    command: "npm run screenshots:serve",
    url: "http://localhost:3020/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
