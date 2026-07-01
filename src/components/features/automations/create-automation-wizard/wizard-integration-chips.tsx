import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandButton } from "#/components/features/settings/brand-button";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { WIZARD_ACTION_INTEGRATION_OPTIONS } from "./create-automation-wizard.constants";
import { WIZARD_SELECTED_SURFACE_CLASS } from "./create-automation-wizard-styles";

interface WizardIntegrationChipsProps {
  testId?: string;
}

export function WizardIntegrationChips({
  testId,
}: WizardIntegrationChipsProps) {
  const { t } = useTranslation("openhands");

  return (
    <div className="flex flex-col gap-2" data-testid={testId}>
      <span className="text-sm text-content">
        {t(I18nKey.AUTOMATIONS$WIZARD_INTEGRATIONS_SECRETS)}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {WIZARD_ACTION_INTEGRATION_OPTIONS.map((option) => (
          <span
            key={option.id}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs",
              option.enabled
                ? WIZARD_SELECTED_SURFACE_CLASS
                : "border-[var(--oh-border)] text-muted",
            )}
          >
            {option.enabled ? (
              <Check className="size-3.5 shrink-0 text-white" aria-hidden />
            ) : null}
            {option.label}
          </span>
        ))}
        <BrandButton
          type="button"
          variant="secondary"
          className="h-8 min-h-8 px-2.5 text-xs"
        >
          {t(I18nKey.AUTOMATIONS$WIZARD_ADD_MORE)}
        </BrandButton>
      </div>
    </div>
  );
}
