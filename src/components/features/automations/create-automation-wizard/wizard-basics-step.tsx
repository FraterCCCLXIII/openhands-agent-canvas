import { useTranslation } from "react-i18next";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";

interface WizardBasicsStepProps {
  state: CreateAutomationWizardState;
  onChange: (patch: Partial<CreateAutomationWizardState>) => void;
}

export function WizardBasicsStep({ state, onChange }: WizardBasicsStepProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-basics-step"
    >
      <SettingsInput
        testId="create-automation-wizard-name"
        name="name"
        type="text"
        label={t(I18nKey.AUTOMATIONS$NAME)}
        value={state.name}
        placeholder={t(I18nKey.AUTOMATIONS$CREATE_NAME_PLACEHOLDER)}
        showRequiredTag
        onChange={(value) => onChange({ name: value })}
      />
      <SettingsInput
        testId="create-automation-wizard-description"
        name="description"
        type="text"
        label={t(I18nKey.AUTOMATIONS$WIZARD_DESCRIPTION)}
        value={state.description}
        placeholder={t(I18nKey.AUTOMATIONS$WIZARD_DESCRIPTION_PLACEHOLDER)}
        showOptionalTag
        onChange={(value) => onChange({ description: value })}
      />
    </div>
  );
}
