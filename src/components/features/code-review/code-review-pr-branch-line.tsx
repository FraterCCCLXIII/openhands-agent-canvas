import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type { CodeReviewPrRow } from "./code-review-types";

type CodeReviewPrBranchLineProps = {
  pullRequest: CodeReviewPrRow;
};

export function CodeReviewPrBranchLine({
  pullRequest,
}: CodeReviewPrBranchLineProps) {
  const { t } = useTranslation("openhands");

  if (!pullRequest.headBranch || !pullRequest.baseBranch) {
    return null;
  }

  return (
    <p
      data-testid="code-review-pr-branch"
      className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs"
    >
      <span className="truncate text-[var(--oh-accent)]">
        {pullRequest.headBranch}
      </span>
      <ArrowRight
        size={12}
        aria-hidden
        className="shrink-0 text-[var(--oh-muted)]"
      />
      <span className="shrink-0 text-[var(--oh-foreground)]">
        {pullRequest.baseBranch}
      </span>
      {pullRequest.additions != null && pullRequest.deletions != null ? (
        <span className="shrink-0">
          <span className="text-[var(--oh-status-success,#1fbd53)]">
            {t(I18nKey.CODE_REVIEW$DIFF_ADDITIONS, {
              count: pullRequest.additions,
            })}
          </span>{" "}
          <span className="text-[var(--oh-status-error,#e76a5e)]">
            {t(I18nKey.CODE_REVIEW$DIFF_DELETIONS, {
              count: pullRequest.deletions,
            })}
          </span>
        </span>
      ) : null}
    </p>
  );
}
