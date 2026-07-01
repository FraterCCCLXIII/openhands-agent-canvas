export const SCHEDULED_TASKS_INTRO_DISMISSED_STORAGE_KEY =
  "openhands-automations-scheduled-tasks-intro-dismissed";

export function readScheduledTasksIntroDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(SCHEDULED_TASKS_INTRO_DISMISSED_STORAGE_KEY) ===
    "true"
  );
}

export function writeScheduledTasksIntroDismissed(dismissed: boolean): void {
  window.localStorage.setItem(
    SCHEDULED_TASKS_INTRO_DISMISSED_STORAGE_KEY,
    dismissed ? "true" : "false",
  );
}
