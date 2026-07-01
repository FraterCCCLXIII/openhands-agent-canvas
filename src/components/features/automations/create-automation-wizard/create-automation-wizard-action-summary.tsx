import { Code, MessageSquare, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { WIZARD_ACTION_TYPE_OPTIONS } from "./create-automation-wizard.constants";
import {
  WIZARD_SELECTED_ICON_CLASS,
  WIZARD_SUMMARY_SURFACE_CLASS,
} from "./create-automation-wizard-styles";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";

interface CreateAutomationWizardActionSummaryProps {
  state: CreateAutomationWizardState;
}

export function CreateAutomationWizardActionSummary({
  state,
}: CreateAutomationWizardActionSummaryProps) {
  const { t } = useTranslation("openhands");
  const Icon =
    state.actionType === "run-script"
      ? Code
      : state.actionType === "create-script-llm"
        ? Sparkles
        : MessageSquare;

  return (
    <div
      data-testid="create-automation-wizard-action-summary"
      className={cn("rounded-xl px-4 py-3", WIZARD_SUMMARY_SURFACE_CLASS)}
    >
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-content">
        <Icon
          className={cn("size-4", WIZARD_SELECTED_ICON_CLASS)}
          aria-hidden
        />
        <span>{t(I18nKey.AUTOMATIONS$WIZARD_WHAT_HAPPENS_NEXT)}</span>
      </div>
      <p className="text-sm text-tertiary-light">
        {buildWizardActionSummary(state, t)}
      </p>
    </div>
  );
}

export function buildWizardActionSummary(
  state: CreateAutomationWizardState,
  t: (key: I18nKey, options?: Record<string, string>) => string,
): string {
  if (state.actionType === "run-script") {
    return t(I18nKey.AUTOMATIONS$WIZARD_ACTION_SUMMARY_RUN_SCRIPT, {
      script: state.selectedScript,
    });
  }
  if (state.actionType === "create-script-llm") {
    return t(I18nKey.AUTOMATIONS$WIZARD_ACTION_SUMMARY_CREATE_SCRIPT);
  }
  return t(I18nKey.AUTOMATIONS$WIZARD_ACTION_SUMMARY_START_CONVERSATION, {
    title: state.conversationTitle,
  });
}

export function getWizardActionTypeLabel(
  actionType: CreateAutomationWizardState["actionType"],
  t: (key: I18nKey) => string,
): string {
  const option = WIZARD_ACTION_TYPE_OPTIONS.find(
    (entry) => entry.id === actionType,
  );
  return option ? t(option.labelKey) : actionType;
}
