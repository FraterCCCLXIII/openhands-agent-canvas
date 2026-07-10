import type { TFunction } from "i18next";
import { I18nKey } from "#/i18n/declaration";

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Relative timestamp for automation activity rows (dashboard + detail views). */
export function formatAutomationRelativeTime(
  dateStr: string,
  locale: string,
  t: TFunction<"openhands">,
): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffSeconds < 60) {
    return t(I18nKey.AUTOMATE$DASHBOARD_TIME_SECONDS_AGO, {
      count: diffSeconds,
    });
  }
  if (diffMins < 60) {
    return t(I18nKey.AUTOMATIONS$DETAIL$TIME_MINUTES_AGO, { count: diffMins });
  }
  if (diffHours < 24) {
    return t(I18nKey.AUTOMATIONS$DETAIL$TIME_HOURS_AGO, { count: diffHours });
  }
  if (diffDays === 1) {
    return t(I18nKey.AUTOMATIONS$DETAIL$TIME_YESTERDAY);
  }
  if (diffDays < 7) {
    return t(I18nKey.AUTOMATIONS$DETAIL$TIME_DAYS_AGO, { count: diffDays });
  }
  return formatDate(dateStr, locale);
}
