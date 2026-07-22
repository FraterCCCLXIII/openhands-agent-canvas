import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import type {
  CodeReviewChecksStatus,
  CodeReviewIssueRow,
  CodeReviewPrRow,
} from "./code-review-types";

const CHECKS_LABEL: Record<CodeReviewChecksStatus, I18nKey> = {
  passing: I18nKey.CODE_REVIEW$CHECKS_PASSING,
  failing: I18nKey.CODE_REVIEW$CHECKS_FAILING,
  pending: I18nKey.CODE_REVIEW$CHECKS_PENDING,
  none: I18nKey.CODE_REVIEW$CHECKS_NONE,
};

const CHECKS_DOT: Record<CodeReviewChecksStatus, string> = {
  passing: "bg-[var(--oh-status-success,#1fbd53)]",
  failing: "bg-[var(--oh-status-error,#e76a5e)]",
  pending: "bg-[var(--oh-status-warning,#d9a441)]",
  none: "bg-[var(--oh-text-dim)]",
};

type MetaRowProps = {
  label: string;
  children: ReactNode;
  testId?: string;
};

function MetaRow({ label, children, testId }: MetaRowProps) {
  return (
    <div
      data-testid={testId}
      className="grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-3 py-1.5 text-sm"
    >
      <dt className="text-[var(--oh-muted)]">{label}</dt>
      <dd className="min-w-0 text-[var(--oh-foreground)]">{children}</dd>
    </div>
  );
}

type CodeReviewPrHostSummaryProps = {
  pullRequest: CodeReviewPrRow;
};

export function CodeReviewPrHostSummary({
  pullRequest,
}: CodeReviewPrHostSummaryProps) {
  const { t } = useTranslation("openhands");
  const checksStatus = pullRequest.checksStatus ?? "none";
  const reviewers = pullRequest.reviewers ?? [];

  return (
    <div
      data-testid="code-review-pr-host-summary"
      className="flex flex-col gap-4"
    >
      <dl data-testid="code-review-pr-meta">
        <MetaRow
          label={t(I18nKey.CODE_REVIEW$META_REVIEWERS)}
          testId="code-review-pr-reviewers"
        >
          {reviewers.length > 0
            ? reviewers.join(", ")
            : t(I18nKey.CODE_REVIEW$NO_REVIEWERS)}
        </MetaRow>

        <MetaRow
          label={t(I18nKey.CODE_REVIEW$META_COMMENTS)}
          testId="code-review-pr-comments"
        >
          {t(I18nKey.CODE_REVIEW$COMMENTS_COUNT, {
            count: pullRequest.commentCount ?? 0,
          })}
        </MetaRow>

        <MetaRow
          label={t(I18nKey.CODE_REVIEW$META_CHECKS)}
          testId="code-review-pr-checks"
        >
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className={cn("size-1.5 rounded-full", CHECKS_DOT[checksStatus])}
            />
            {t(CHECKS_LABEL[checksStatus])}
          </span>
        </MetaRow>
      </dl>

      {pullRequest.description ? (
        <section data-testid="code-review-pr-description">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--oh-muted)]">
            {t(I18nKey.CODE_REVIEW$META_DESCRIPTION)}
          </h3>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--oh-muted)]">
            {pullRequest.description}
          </div>
        </section>
      ) : null}
    </div>
  );
}

type CodeReviewIssueHostSummaryProps = {
  issue: CodeReviewIssueRow;
};

export function CodeReviewIssueHostSummary({
  issue,
}: CodeReviewIssueHostSummaryProps) {
  const { t } = useTranslation("openhands");
  const labels = issue.labels ?? [];
  const assignees = issue.assignees ?? [];

  return (
    <div
      data-testid="code-review-issue-host-summary"
      className="flex flex-col gap-4"
    >
      {issue.author ? (
        <div
          data-testid="code-review-issue-author"
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <span className="font-medium text-[var(--oh-foreground)]">
            {issue.author}
          </span>
          <span className="text-[var(--oh-muted)]">{issue.meta}</span>
        </div>
      ) : null}

      {labels.length > 0 ? (
        <ul
          data-testid="code-review-issue-labels"
          className="flex flex-wrap gap-1.5"
        >
          {labels.map((label) => (
            <li
              key={label}
              className="rounded border border-[var(--oh-border)] px-1.5 py-px text-[11px] font-medium text-[var(--oh-muted)]"
            >
              {label}
            </li>
          ))}
        </ul>
      ) : null}

      <dl data-testid="code-review-issue-meta">
        <MetaRow
          label={t(I18nKey.CODE_REVIEW$META_ASSIGNEES)}
          testId="code-review-issue-assignees"
        >
          {assignees.length > 0
            ? assignees.join(", ")
            : t(I18nKey.CODE_REVIEW$NO_ASSIGNEES)}
        </MetaRow>
        <MetaRow
          label={t(I18nKey.CODE_REVIEW$META_COMMENTS)}
          testId="code-review-issue-comments"
        >
          {t(I18nKey.CODE_REVIEW$COMMENTS_COUNT, {
            count: issue.commentCount ?? 0,
          })}
        </MetaRow>
      </dl>

      {issue.description ? (
        <section data-testid="code-review-issue-description">
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--oh-muted)]">
            {t(I18nKey.CODE_REVIEW$META_DESCRIPTION)}
          </h3>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--oh-muted)]">
            {issue.description}
          </div>
        </section>
      ) : null}
    </div>
  );
}
