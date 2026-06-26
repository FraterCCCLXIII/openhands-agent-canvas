import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { extensionModuleEmptyStateClassName } from "#/utils/extension-module-card-classes";
import { BrandButton } from "#/components/features/settings/brand-button";

interface LoopEmptyStateProps {
  onCreate: () => void;
}

export function LoopEmptyState({ onCreate }: LoopEmptyStateProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      data-testid="loops-empty"
      className={extensionModuleEmptyStateClassName}
    >
      <p className="text-sm text-white">{t(I18nKey.LOOPS$EMPTY)}</p>
      <p className="mt-1 text-xs text-tertiary-light">
        {t(I18nKey.LOOPS$EMPTY_HINT)}
      </p>
      <div className="mt-6">
        <BrandButton type="button" variant="primary" onClick={onCreate}>
          {t(I18nKey.LOOPS$CREATE_FROM_TEMPLATE)}
        </BrandButton>
      </div>
    </div>
  );
}
