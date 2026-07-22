import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { CodeReviewIssueHostSummary } from "./code-review-host-summary";
import type { CodeReviewIssueRow } from "./code-review-types";

const ROLE_LABEL: Record<CodeReviewIssueRow["role"], I18nKey> = {
  author: I18nKey.CODE_REVIEW$ROLE_AUTHORED,
  assignee: I18nKey.CODE_REVIEW$ROLE_ASSIGNED,
  reviewer: I18nKey.CODE_REVIEW$ROLE_REVIEW_REQUESTED,
};

type CodeReviewIssueDetailProps = {
  issue: CodeReviewIssueRow;
  onTriage: () => void;
};

export function CodeReviewIssueDetail({
  issue,
  onTriage,
}: CodeReviewIssueDetailProps) {
  const { t } = useTranslation("openhands");

  return (
    <div data-testid="code-review-issue-detail" className="flex flex-col gap-5">
      <div>
        <p className="text-xs text-[var(--oh-muted)]">{issue.repo}</p>
        <p className="mt-1 text-sm text-[var(--oh-muted)]">
          {`${t(ROLE_LABEL[issue.role])} · ${issue.meta}`}
        </p>
        {issue.linkedPrNumber ? (
          <p
            data-testid="code-review-issue-linked-pr"
            className="mt-2 text-sm text-[var(--oh-muted)]"
          >
            {t(I18nKey.CODE_REVIEW$ISSUE_LINKED_PR, {
              number: issue.linkedPrNumber,
            })}
          </p>
        ) : null}
      </div>

      <CodeReviewIssueHostSummary issue={issue} />

      <div>
        <button
          type="button"
          data-testid={`code-review-triage-issue-${issue.id}-drawer`}
          onClick={onTriage}
          className="rounded-lg bg-[var(--oh-accent)] px-3 py-2 text-sm font-semibold text-[var(--oh-bg-deep,#101010)] hover:opacity-90"
        >
          {t(I18nKey.CODE_REVIEW$ACTION_TRIAGE)}
        </button>
      </div>
    </div>
  );
}
