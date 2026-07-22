import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";

type CodeReviewPlaceholderProps = {
  /** Optional — omit when the parent page header already names the section. */
  titleKey?: I18nKey;
  bodyKey: I18nKey;
  testId: string;
};

export function CodeReviewPlaceholder({
  titleKey,
  bodyKey,
  testId,
}: CodeReviewPlaceholderProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      data-testid={testId}
      className="mt-1.5 rounded-lg border border-dashed border-[var(--oh-border)] bg-[var(--oh-surface)] px-6 py-5"
    >
      {titleKey ? (
        <p className="text-sm font-semibold text-[var(--oh-foreground)]">
          {t(titleKey)}
        </p>
      ) : null}
      <p
        className={
          titleKey
            ? "mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--oh-muted)]"
            : "max-w-xl text-sm leading-relaxed text-[var(--oh-muted)]"
        }
      >
        {t(bodyKey)}
      </p>
    </div>
  );
}
