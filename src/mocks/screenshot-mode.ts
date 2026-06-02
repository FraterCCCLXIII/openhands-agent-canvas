/**
 * When VITE_SCREENSHOT_MODE=true, MSW handlers load polished marketing/demo
 * fixtures from src/mocks/screenshot-fixtures/ instead of minimal test data.
 */
export function isScreenshotMode(): boolean {
  return import.meta.env.VITE_SCREENSHOT_MODE === "true";
}
