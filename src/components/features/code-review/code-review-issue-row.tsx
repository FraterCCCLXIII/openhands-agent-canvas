import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import type { CodeReviewIssueRow } from "./code-review-types";

const STATUS_DOT: Record<CodeReviewIssueRow["statusTone"], string> = {
  on: "bg-[var(--oh-status-success,#1fbd53)]",
  warn: "bg-[var(--oh-status-warning,#d9a441)]",
  off: "bg-[var(--oh-text-dim)]",
  err: "bg-[var(--oh-status-error,#e76a5e)]",
};

const ROLE_LABEL: Record<CodeReviewIssueRow["role"], I18nKey> = {
  author: I18nKey.CODE_REVIEW$ROLE_AUTHORED,
  assignee: I18nKey.CODE_REVIEW$ROLE_ASSIGNED,
  reviewer: I18nKey.CODE_REVIEW$ROLE_REVIEW_REQUESTED,
};

type CodeReviewIssueRowViewProps = {
  issue: CodeReviewIssueRow;
  onSelect: () => void;
  onTriage: () => void;
};

export function CodeReviewIssueRowView({
  issue,
  onSelect,
  onTriage,
}: CodeReviewIssueRowViewProps) {
  const { t } = useTranslation("openhands");

  return (
    <li data-testid={`code-review-issue-row-${issue.id}`}>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "grid grid-cols-[14px_1fr_auto] items-center gap-3.5 px-3.5 py-3",
          "cursor-pointer hover:bg-[var(--oh-surface-raised)]/60",
        )}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
      >
        <span
          aria-hidden
          className={cn(
            "h-2.5 w-2.5 justify-self-center rounded-full",
            STATUS_DOT[issue.statusTone],
          )}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-xs font-semibold text-[var(--oh-accent)]">
              #{issue.number}
            </span>
            <span className="text-[11px] text-[var(--oh-muted)]">
              {issue.repo}
            </span>
            {issue.linkedPrNumber ? (
              <span className="text-[11px] text-[var(--oh-muted)]">
                {t(I18nKey.CODE_REVIEW$ISSUE_LINKED_PR, {
                  number: issue.linkedPrNumber,
                })}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-sm font-medium text-[var(--oh-foreground)]">
            {issue.title}
          </p>
          <p className="mt-1 text-[11px] text-[var(--oh-muted)]">
            {`${t(ROLE_LABEL[issue.role])} · ${issue.meta}`}
          </p>
        </div>
        <div
          className="flex flex-wrap items-center justify-end gap-1.5"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            data-testid={`code-review-triage-issue-${issue.id}`}
            onClick={onTriage}
            className="rounded-lg bg-[var(--oh-accent)] px-2.5 py-1.5 text-xs font-semibold text-[var(--oh-bg-deep,#101010)] hover:opacity-90"
          >
            {t(I18nKey.CODE_REVIEW$ACTION_TRIAGE)}
          </button>
        </div>
      </div>
    </li>
  );
}
