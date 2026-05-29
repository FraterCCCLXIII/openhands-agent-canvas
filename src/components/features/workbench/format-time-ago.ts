import type { TFunction } from "i18next";
import { I18nKey } from "#/i18n/declaration";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Localized, coarse elapsed-time label (just now / Nh / Nd). */
export function formatTimeAgo(t: TFunction, isoDate: string): string {
  const elapsed = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(elapsed / DAY_MS);
  if (days > 0) {
    return t(I18nKey.WORKBENCH$TIME_DAYS_SHORT, { count: days });
  }
  const hours = Math.floor(elapsed / HOUR_MS);
  if (hours > 0) {
    return t(I18nKey.WORKBENCH$TIME_HOURS_SHORT, { count: hours });
  }
  return t(I18nKey.WORKBENCH$TIME_JUST_NOW);
}
