import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { CreateAutomationWizardActionTypeCards } from "./create-automation-wizard-action-type-cards";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";
import {
  CreateScriptLlmActionPanel,
  RunScriptActionPanel,
  StartConversationActionPanel,
} from "./wizard-action-plan-panels";

interface WizardActionPlanStepProps {
  state: CreateAutomationWizardState;
  onChange: (patch: Partial<CreateAutomationWizardState>) => void;
}

export function WizardActionPlanStep({
  state,
  onChange,
}: WizardActionPlanStepProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-action-plan-step"
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-content">
          {t(I18nKey.AUTOMATIONS$WIZARD_ACTION_TYPE)}
        </h3>
        <p className="text-sm text-muted">
          {t(I18nKey.AUTOMATIONS$WIZARD_ACTION_INTRO)}
        </p>
      </div>

      <CreateAutomationWizardActionTypeCards
        value={state.actionType}
        onChange={(actionType) => onChange({ actionType })}
      />

      {state.actionType === "run-script" ? (
        <RunScriptActionPanel state={state} onChange={onChange} />
      ) : null}
      {state.actionType === "create-script-llm" ? (
        <CreateScriptLlmActionPanel state={state} onChange={onChange} />
      ) : null}
      {state.actionType === "start-conversation" ? (
        <StartConversationActionPanel state={state} onChange={onChange} />
      ) : null}
    </div>
  );
}
