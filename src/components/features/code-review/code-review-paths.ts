/** Route paths for the Code Review surface (#1691). */
export const CODE_REVIEW_BASE_PATH = "/code-review";

export const CODE_REVIEW_PATHS = {
  root: CODE_REVIEW_BASE_PATH,
  pullRequests: `${CODE_REVIEW_BASE_PATH}/pull-requests`,
  issues: `${CODE_REVIEW_BASE_PATH}/issues`,
  /** Temporary homes under Settings until these return to Code Review. */
  hooks: "/settings/hooks",
  codeStyle: "/settings/code-style",
} as const;

export type CodeReviewTabId = "pull-requests" | "issues";
