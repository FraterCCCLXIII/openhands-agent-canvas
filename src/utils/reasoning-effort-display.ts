import type { TFunction } from "i18next";

import {
  type ReasoningEffort,
  REASONING_EFFORT_FIELD,
} from "#/constants/reasoning-effort";
import { resolveSchemaChoiceLabel } from "#/utils/sdk-settings-field-metadata";

const EFFORT_FALLBACK_LABELS: Record<ReasoningEffort, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

/** User-facing label for a reasoning-effort value (reuses schema i18n keys). */
export function getReasoningEffortLabel(
  t: TFunction,
  effort: ReasoningEffort,
): string {
  return resolveSchemaChoiceLabel(
    t,
    REASONING_EFFORT_FIELD,
    effort,
    EFFORT_FALLBACK_LABELS[effort],
  );
}

/** Effort label color — darker than the profile name (`--oh-muted`) on the pill. */
export function getReasoningEffortTextClassName(
  effort: ReasoningEffort,
): string {
  switch (effort) {
    case "low":
      return "text-[var(--oh-text-dim)] opacity-75";
    case "medium":
      return "text-[var(--oh-text-dim)]";
    case "high":
      return "text-[var(--oh-text-dim)] opacity-90";
    default:
      return "text-[var(--oh-text-dim)]";
  }
}
