import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { BrandButton } from "#/components/features/settings/brand-button";
import { AddAutomationMenu } from "./add-automation-menu";
import { useAutomateAddAutomation } from "./automate-add-automation-provider";

interface AutomatePageHeaderProps {
  titleKey: I18nKey;
  subtitleKey: I18nKey;
  showAddButton?: boolean;
  /** When set, renders a single create button instead of the add-automation menu. */
  createLabelKey?: I18nKey;
  createTestId?: string;
}

/** Shared page header for Automate subpages — title left, Add action top right. */
export function AutomatePageHeader({
  titleKey,
  subtitleKey,
  showAddButton = true,
  createLabelKey,
  createTestId,
}: AutomatePageHeaderProps) {
  const { t } = useTranslation("openhands");
  const addAutomation = useAutomateAddAutomation();

  return (
    <div className="flex items-start justify-between gap-4">
      <header className="min-w-0 space-y-1">
        <h1 className="text-xl font-semibold text-content">{t(titleKey)}</h1>
        <p className="text-sm text-muted">{t(subtitleKey)}</p>
      </header>
      {showAddButton && addAutomation ? (
        createLabelKey ? (
          <BrandButton
            type="button"
            variant="secondary"
            testId={createTestId}
            className="shrink-0 border border-[var(--oh-border)] bg-base-secondary text-white hover:bg-surface-raised"
            onClick={addAutomation.openWizard}
          >
            {t(createLabelKey)}
          </BrandButton>
        ) : (
          <AddAutomationMenu
            onSetupManually={addAutomation.openManualSetup}
            onUseWizard={addAutomation.openWizard}
          />
        )
      ) : null}
    </div>
  );
}
