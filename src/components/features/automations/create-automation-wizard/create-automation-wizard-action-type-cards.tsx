import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { WIZARD_ACTION_TYPE_OPTIONS } from "./create-automation-wizard.constants";
import {
  WIZARD_SELECTED_ICON_CLASS,
  WIZARD_SELECTED_SURFACE_CLASS,
} from "./create-automation-wizard-styles";
import type { CreateAutomationWizardActionType } from "./create-automation-wizard.types";

interface CreateAutomationWizardActionTypeCardsProps {
  value: CreateAutomationWizardActionType;
  onChange: (value: CreateAutomationWizardActionType) => void;
}

export function CreateAutomationWizardActionTypeCards({
  value,
  onChange,
}: CreateAutomationWizardActionTypeCardsProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
      data-testid="create-automation-wizard-action-types"
      role="radiogroup"
      aria-label={t(I18nKey.AUTOMATIONS$WIZARD_ACTION_TYPE)}
    >
      {WIZARD_ACTION_TYPE_OPTIONS.map(
        ({ id, labelKey, descriptionKey, icon: Icon }) => {
          const isSelected = value === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-testid={`create-automation-wizard-action-type-${id}`}
              onClick={() => onChange(id)}
              className={cn(
                "flex min-h-[5.5rem] flex-col items-start gap-2 rounded-xl border px-3 py-3 text-left transition-colors",
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
              <span className="text-xs text-muted">{t(descriptionKey)}</span>
            </button>
          );
        },
      )}
    </div>
  );
}
