/** SDK field path for LLM reasoning effort on saved profiles. */
export const REASONING_EFFORT_FIELD = "llm.reasoning_effort";

/** Effort levels exposed in the chat profile switcher (subset of schema choices). */
export const REASONING_EFFORT_VALUES = ["low", "medium", "high"] as const;

export type ReasoningEffort = (typeof REASONING_EFFORT_VALUES)[number];

export const DEFAULT_REASONING_EFFORT: ReasoningEffort = "medium";

export function isReasoningEffort(value: unknown): value is ReasoningEffort {
  return (
    typeof value === "string" &&
    (REASONING_EFFORT_VALUES as readonly string[]).includes(value)
  );
}

export function normalizeReasoningEffort(value: unknown): ReasoningEffort {
  return isReasoningEffort(value) ? value : DEFAULT_REASONING_EFFORT;
}
