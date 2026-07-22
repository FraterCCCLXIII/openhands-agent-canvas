import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { CODE_REVIEW_MOCK_HOOKS } from "./code-review-mock-data";

export function CodeReviewHooksPanel() {
  const { t } = useTranslation("openhands");

  return (
    <div data-testid="code-review-hooks-panel">
      <div className="mb-4 rounded-md border border-[var(--oh-border)] border-l-[3px] border-l-[var(--oh-accent)] bg-[var(--oh-surface)] px-3 py-2.5 text-xs leading-relaxed text-[var(--oh-muted)]">
        {t(I18nKey.CODE_REVIEW$HOOKS_NOTE)}
      </div>

      <ul className="divide-y divide-[var(--oh-border-subtle)] overflow-hidden rounded-lg border border-[var(--oh-border)] bg-[var(--oh-surface)]">
        {CODE_REVIEW_MOCK_HOOKS.map((hook) => (
          <li
            key={hook.id}
            data-testid={`code-review-hook-${hook.id}`}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3.5 py-2.5"
          >
            <span className="whitespace-nowrap font-mono text-[11px] text-[var(--oh-accent)]">
              {hook.event}
            </span>
            <span className="text-sm text-[var(--oh-muted)]">{hook.rule}</span>
            {hook.active ? (
              <span className="rounded border border-[var(--oh-status-success,#1fbd53)]/40 bg-[var(--oh-status-success,#1fbd53)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--oh-status-success,#1fbd53)]">
                {t(I18nKey.CODE_REVIEW$HOOK_ACTIVE)}
              </span>
            ) : null}
          </li>
        ))}
        <li className="px-3.5 py-2.5">
          <button
            type="button"
            data-testid="code-review-add-hook"
            className="text-sm font-medium text-[var(--oh-accent)]"
          >
            {t(I18nKey.CODE_REVIEW$ADD_HOOK)}
          </button>
        </li>
      </ul>

      <p className="mt-3.5 border-t border-[var(--oh-border)] pt-3.5 text-xs leading-relaxed text-[var(--oh-muted)]">
        {t(I18nKey.CODE_REVIEW$HOOKS_FOOTNOTE)}
      </p>
    </div>
  );
}
