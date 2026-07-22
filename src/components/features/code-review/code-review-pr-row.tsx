import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { CodeReviewReviewMenu } from "./code-review-review-menu";
import type {
  CodeReviewPrRow,
  CodeReviewReviewFlavorId,
} from "./code-review-types";

const STATUS_DOT: Record<CodeReviewPrRow["statusTone"], string> = {
  on: "bg-[var(--oh-status-success,#1fbd53)]",
  warn: "bg-[var(--oh-status-warning,#d9a441)]",
  off: "bg-[var(--oh-text-dim)]",
  err: "bg-[var(--oh-status-error,#e76a5e)]",
};

const ROLE_LABEL: Record<CodeReviewPrRow["role"], I18nKey> = {
  author: I18nKey.CODE_REVIEW$ROLE_AUTHORED,
  assignee: I18nKey.CODE_REVIEW$ROLE_ASSIGNED,
  reviewer: I18nKey.CODE_REVIEW$ROLE_REVIEW_REQUESTED,
};

type CodeReviewPrRowViewProps = {
  pullRequest: CodeReviewPrRow;
  onSelect: () => void;
  onReviewFlavor: (flavorId: CodeReviewReviewFlavorId) => void;
};

export function CodeReviewPrRowView({
  pullRequest,
  onSelect,
  onReviewFlavor,
}: CodeReviewPrRowViewProps) {
  const { t } = useTranslation("openhands");
  const isError = Boolean(pullRequest.connectionError);

  return (
    <li data-testid={`code-review-pr-row-${pullRequest.id}`}>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          "grid grid-cols-[14px_1fr_auto] items-center gap-3.5 px-3.5 py-3",
          "cursor-pointer hover:bg-[var(--oh-surface-raised)]/60",
          isError && "opacity-90",
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
            STATUS_DOT[pullRequest.statusTone],
          )}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            {pullRequest.number > 0 ? (
              <span className="font-mono text-xs font-semibold text-[var(--oh-accent)]">
                #{pullRequest.number}
              </span>
            ) : null}
            <span className="text-[11px] text-[var(--oh-muted)]">
              {pullRequest.repo}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm font-medium text-[var(--oh-foreground)]">
            {pullRequest.title}
          </p>
          <p className="mt-1 text-[11px] text-[var(--oh-muted)]">
            {isError
              ? pullRequest.meta
              : `${t(ROLE_LABEL[pullRequest.role])} · ${pullRequest.meta}`}
          </p>
        </div>
        <div
          className="flex flex-wrap items-center justify-end gap-1.5"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {isError ? (
            <button
              type="button"
              data-testid={`code-review-reconnect-${pullRequest.id}`}
              className="text-xs font-medium text-[var(--oh-accent)]"
            >
              {t(I18nKey.CODE_REVIEW$RECONNECT)}
            </button>
          ) : (
            <CodeReviewReviewMenu
              pullRequestId={pullRequest.id}
              onSelectFlavor={onReviewFlavor}
            />
          )}
        </div>
      </div>
    </li>
  );
}
