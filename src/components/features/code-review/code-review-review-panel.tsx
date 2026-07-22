import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { CODE_REVIEW_SAMPLE_COMMENTS } from "./code-review-mock-data";
import { CodeReviewPrHostSummary } from "./code-review-host-summary";
import type {
  CodeReviewPrRow,
  CodeReviewReviewFlavorId,
} from "./code-review-types";

type CodeReviewReviewPanelProps = {
  pullRequest: CodeReviewPrRow;
  initialFlavor?: CodeReviewReviewFlavorId;
};

export function CodeReviewReviewPanel({
  pullRequest,
  initialFlavor,
}: CodeReviewReviewPanelProps) {
  const { t } = useTranslation("openhands");

  return (
    <div data-testid="code-review-review-panel" className="flex flex-col gap-5">
      <CodeReviewPrHostSummary pullRequest={pullRequest} />

      <section
        data-testid="code-review-review-output"
        data-flavor={initialFlavor ?? "none"}
      >
        <h3 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--oh-muted)]">
          {t(I18nKey.CODE_REVIEW$SAMPLE_OUTPUT_TITLE)}
          <span className="rounded border border-[var(--oh-status-success,#1fbd53)]/40 bg-[var(--oh-status-success,#1fbd53)]/10 px-1.5 py-px text-[10px] font-semibold normal-case tracking-normal text-[var(--oh-status-success,#1fbd53)]">
            {t(I18nKey.CODE_REVIEW$SAMPLE_OUTPUT_PILL, { count: 3 })}
          </span>
        </h3>
        <ul className="flex flex-col gap-2">
          {CODE_REVIEW_SAMPLE_COMMENTS.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-[var(--oh-border)] bg-[var(--oh-bg-deep,#101010)]/40 px-3 py-2.5"
            >
              <p className="font-mono text-[11px] text-[var(--oh-accent)]">
                {comment.location}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--oh-muted)]">
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3.5 border-t border-[var(--oh-border)] pt-3.5 text-xs leading-relaxed text-[var(--oh-muted)]">
          {t(I18nKey.CODE_REVIEW$SAMPLE_OUTPUT_FOOTNOTE)}
        </p>
      </section>
    </div>
  );
}
