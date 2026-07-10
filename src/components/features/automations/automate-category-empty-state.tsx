import { useTranslation } from "react-i18next";
import { BrandButton } from "#/components/features/settings/brand-button";
import { I18nKey } from "#/i18n/declaration";
import { extensionModuleEmptyStateClassName } from "#/utils/extension-module-card-classes";

interface AutomateCategoryEmptyStateProps {
  titleKey: I18nKey;
  descriptionKey: I18nKey;
  createLabelKey: I18nKey;
  onCreate: () => void;
  testId: string;
}

export function AutomateCategoryEmptyState({
  titleKey,
  descriptionKey,
  createLabelKey,
  onCreate,
  testId,
}: AutomateCategoryEmptyStateProps) {
  const { t } = useTranslation("openhands");

  return (
    <div data-testid={testId} className={extensionModuleEmptyStateClassName}>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <h2 className="text-base font-semibold text-content">{t(titleKey)}</h2>
        <p className="text-sm text-muted">{t(descriptionKey)}</p>
        <BrandButton
          type="button"
          variant="secondary"
          testId={`${testId}-create`}
          className="border border-[var(--oh-border)] bg-base-secondary text-white hover:bg-surface-raised"
          onClick={onCreate}
        >
          {t(createLabelKey)}
        </BrandButton>
      </div>
    </div>
  );
}
