import { useTranslation } from "react-i18next";
import CalendarIcon from "#/icons/calendar.svg?react";
import ActivityIcon from "#/icons/activity.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  WIZARD_SELECTED_ICON_CLASS,
  WIZARD_SUMMARY_SURFACE_CLASS,
} from "./create-automation-wizard-styles";
import { buildWizardTriggerSummary } from "./wizard-review-step";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";

interface CreateAutomationWizardTriggerSummaryProps {
  state: CreateAutomationWizardState;
}

export function CreateAutomationWizardTriggerSummary({
  state,
}: CreateAutomationWizardTriggerSummaryProps) {
  const { t } = useTranslation("openhands");
  const Icon = state.triggerType === "schedule" ? CalendarIcon : ActivityIcon;

  return (
    <div
      data-testid="create-automation-wizard-trigger-summary"
      className={cn("rounded-xl px-4 py-3", WIZARD_SUMMARY_SURFACE_CLASS)}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-content">
        <Icon
          className={cn("size-4", WIZARD_SELECTED_ICON_CLASS)}
          aria-hidden
        />
        <span>{t(I18nKey.AUTOMATIONS$WIZARD_TRIGGER_SUMMARY)}</span>
      </div>
      <p className="text-sm text-tertiary-light">
        {buildWizardTriggerSummary(state, t)}
      </p>
    </div>
  );
}
