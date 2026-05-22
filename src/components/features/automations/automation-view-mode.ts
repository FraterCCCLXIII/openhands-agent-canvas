export type AutomationViewMode = "grid" | "list";

export const AUTOMATIONS_VIEW_MODE_STORAGE_KEY = "openhands-automations-view";

export function readStoredAutomationViewMode(): AutomationViewMode {
  if (typeof window === "undefined") {
    return "grid";
  }

  const stored = window.localStorage.getItem(AUTOMATIONS_VIEW_MODE_STORAGE_KEY);
  return stored === "list" ? "list" : "grid";
}

export function writeStoredAutomationViewMode(view: AutomationViewMode): void {
  window.localStorage.setItem(AUTOMATIONS_VIEW_MODE_STORAGE_KEY, view);
}

export const automationListTableClassName =
  "border border-[var(--oh-border)] rounded-md divide-y divide-[var(--oh-border-subtle)]";

export const automationListRowClassName =
  "flex min-w-0 items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--oh-interactive-hover)] focus-visible:outline-none focus-visible:bg-[var(--oh-interactive-hover)]";
