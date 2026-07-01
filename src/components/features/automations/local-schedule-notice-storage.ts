export const LOCAL_SCHEDULE_NOTICE_DISMISSED_STORAGE_KEY =
  "openhands-automations-local-schedule-notice-dismissed";

export function readLocalScheduleNoticeDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.localStorage.getItem(LOCAL_SCHEDULE_NOTICE_DISMISSED_STORAGE_KEY) ===
    "true"
  );
}

export function writeLocalScheduleNoticeDismissed(dismissed: boolean): void {
  window.localStorage.setItem(
    LOCAL_SCHEDULE_NOTICE_DISMISSED_STORAGE_KEY,
    dismissed ? "true" : "false",
  );
}
