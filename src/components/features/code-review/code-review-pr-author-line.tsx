import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type { CodeReviewPrRow } from "./code-review-types";

type CodeReviewPrAuthorLineProps = {
  pullRequest: CodeReviewPrRow;
};

export function CodeReviewPrAuthorLine({
  pullRequest,
}: CodeReviewPrAuthorLineProps) {
  const { t } = useTranslation("openhands");

  if (!pullRequest.author && !pullRequest.isDraft && !pullRequest.meta) {
    return null;
  }

  return (
    <p
      data-testid="code-review-pr-author"
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      {pullRequest.author ? (
        <span className="font-medium text-[var(--oh-foreground)]">
          {pullRequest.author}
        </span>
      ) : null}
      {pullRequest.meta ? (
        <span className="text-[var(--oh-muted)]">{pullRequest.meta}</span>
      ) : null}
      {pullRequest.isDraft ? (
        <span
          data-testid="code-review-pr-draft-badge"
          className="rounded border border-[var(--oh-border)] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-[var(--oh-muted)]"
        >
          {t(I18nKey.CODE_REVIEW$DRAFT_BADGE)}
        </span>
      ) : null}
    </p>
  );
}
