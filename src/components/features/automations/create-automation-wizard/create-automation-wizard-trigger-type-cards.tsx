import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { WIZARD_TRIGGER_TYPE_OPTIONS } from "./create-automation-wizard.constants";
import {
  WIZARD_SELECTED_ICON_CLASS,
  WIZARD_SELECTED_SURFACE_CLASS,
} from "./create-automation-wizard-styles";
import type { CreateAutomationWizardTriggerType } from "./create-automation-wizard.types";

interface CreateAutomationWizardTriggerTypeCardsProps {
  value: CreateAutomationWizardTriggerType;
  onChange: (value: CreateAutomationWizardTriggerType) => void;
}

export function CreateAutomationWizardTriggerTypeCards({
  value,
  onChange,
}: CreateAutomationWizardTriggerTypeCardsProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      data-testid="create-automation-wizard-trigger-types"
      role="radiogroup"
      aria-label={t(I18nKey.AUTOMATIONS$WIZARD_TRIGGER_TYPE)}
    >
      {WIZARD_TRIGGER_TYPE_OPTIONS.map(({ id, labelKey, icon: Icon }) => {
        const isSelected = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            data-testid={`create-automation-wizard-trigger-type-${id}`}
            onClick={() => onChange(id)}
            className={cn(
              "flex min-h-[4.5rem] flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-colors",
              isSelected
                ? WIZARD_SELECTED_SURFACE_CLASS
                : "border-[var(--oh-border)] bg-base-secondary hover:bg-surface-raised",
            )}
          >
            <Icon
              className={cn(
                "size-4",
                isSelected ? WIZARD_SELECTED_ICON_CLASS : "text-muted",
              )}
              aria-hidden
            />
            <span className="text-sm font-medium text-content">
              {t(labelKey)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
