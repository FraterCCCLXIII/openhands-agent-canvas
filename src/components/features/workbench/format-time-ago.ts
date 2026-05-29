import type { TFunction } from "i18next";
import { I18nKey } from "#/i18n/declaration";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Localized, coarse "time ago" label (just now / Nh ago / Nd ago). */
export function formatTimeAgo(t: TFunction, isoDate: string): string {
  const elapsed = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(elapsed / DAY_MS);
  if (days > 0) {
    return t(I18nKey.WORKBENCH$TIME_DAYS_AGO, { count: days });
  }
  const hours = Math.floor(elapsed / HOUR_MS);
  if (hours > 0) {
    return t(I18nKey.WORKBENCH$TIME_HOURS_AGO, { count: hours });
  }
  return t(I18nKey.WORKBENCH$TIME_JUST_NOW);
}
