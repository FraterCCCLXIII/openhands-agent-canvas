import { useTranslation } from "react-i18next";
import { CreateAutomationPromptField } from "#/components/features/automations/create-automation-prompt-field";
import { SettingsDropdownInput } from "#/components/features/settings/settings-dropdown-input";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import {
  WIZARD_SCRIPT_LANGUAGE_OPTIONS,
  WIZARD_SCRIPT_OPTIONS,
  WIZARD_SCRIPT_RUNTIME_OPTIONS,
} from "./create-automation-wizard.constants";
import { WizardSection } from "./create-automation-wizard-section";
import { WizardIntegrationChips } from "./wizard-integration-chips";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";

interface WizardActionPlanPanelProps {
  state: CreateAutomationWizardState;
  onChange: (patch: Partial<CreateAutomationWizardState>) => void;
}

export function RunScriptActionPanel({
  state,
  onChange,
}: WizardActionPlanPanelProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-action-run-script"
    >
      <WizardSection
        testId="create-automation-wizard-script-section"
        title={t(I18nKey.AUTOMATIONS$WIZARD_SCRIPT_SECTION)}
        defaultExpanded
      >
        <div className="flex flex-col gap-2">
          <SettingsDropdownInput
            testId="create-automation-wizard-select-script"
            name="selectedScript"
            label={t(I18nKey.AUTOMATIONS$WIZARD_SELECT_SCRIPT)}
            selectedKey={state.selectedScript}
            items={WIZARD_SCRIPT_OPTIONS.map((option) => ({
              key: option.key,
              label: option.label,
            }))}
            onSelectionChange={(key) =>
              onChange({ selectedScript: String(key ?? state.selectedScript) })
            }
          />
          <p className="text-xs text-muted">
            {t(I18nKey.AUTOMATIONS$WIZARD_SCRIPT_LAST_UPDATED)}
          </p>
        </div>
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-script-inputs"
        title={t(I18nKey.AUTOMATIONS$WIZARD_SCRIPT_INPUTS)}
      >
        <SettingsInput
          testId="create-automation-wizard-script-channels"
          name="scriptChannels"
          type="text"
          label={t(I18nKey.AUTOMATIONS$WIZARD_SCRIPT_CHANNELS)}
          placeholder={t(
            I18nKey.AUTOMATIONS$WIZARD_SCRIPT_CHANNELS_PLACEHOLDER,
          )}
          value=""
          onChange={() => undefined}
        />
        <SettingsInput
          testId="create-automation-wizard-script-match"
          name="scriptMatch"
          type="text"
          label={t(I18nKey.AUTOMATIONS$WIZARD_SCRIPT_MATCH_CRITERIA)}
          value=""
          onChange={() => undefined}
        />
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-script-integrations"
        title={t(I18nKey.AUTOMATIONS$WIZARD_INTEGRATIONS_SECRETS)}
      >
        <WizardIntegrationChips />
      </WizardSection>
    </div>
  );
}

export function CreateScriptLlmActionPanel({
  state,
  onChange,
}: WizardActionPlanPanelProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-action-create-script"
    >
      <WizardSection
        testId="create-automation-wizard-script-description"
        title={t(I18nKey.AUTOMATIONS$WIZARD_DESCRIBE_SCRIPT)}
        defaultExpanded
      >
        <CreateAutomationPromptField
          prompt={state.prompt}
          onPromptChange={(prompt) => onChange({ prompt })}
        />
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-script-configuration"
        title={t(I18nKey.AUTOMATIONS$WIZARD_SCRIPT_CONFIGURATION)}
      >
        <SettingsDropdownInput
          testId="create-automation-wizard-script-language"
          name="scriptLanguage"
          label={t(I18nKey.AUTOMATIONS$WIZARD_SCRIPT_LANGUAGE)}
          selectedKey={state.scriptLanguage}
          items={WIZARD_SCRIPT_LANGUAGE_OPTIONS.map((option) => ({
            key: option.key,
            label: option.label,
          }))}
          onSelectionChange={(key) =>
            onChange({ scriptLanguage: String(key ?? state.scriptLanguage) })
          }
        />
        <SettingsDropdownInput
          testId="create-automation-wizard-script-runtime"
          name="scriptRuntime"
          label={t(I18nKey.AUTOMATIONS$WIZARD_RUNTIME)}
          selectedKey={state.scriptRuntime}
          items={WIZARD_SCRIPT_RUNTIME_OPTIONS.map((option) => ({
            key: option.key,
            label: option.label,
          }))}
          onSelectionChange={(key) =>
            onChange({ scriptRuntime: String(key ?? state.scriptRuntime) })
          }
        />
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-llm-integrations"
        title={t(I18nKey.AUTOMATIONS$WIZARD_INTEGRATIONS_SECRETS)}
      >
        <WizardIntegrationChips />
      </WizardSection>
    </div>
  );
}

export function StartConversationActionPanel({
  state,
  onChange,
}: WizardActionPlanPanelProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-action-start-conversation"
    >
      <WizardSection
        testId="create-automation-wizard-conversation-setup"
        title={t(I18nKey.AUTOMATIONS$WIZARD_CONVERSATION_SETUP)}
        defaultExpanded
      >
        <SettingsInput
          testId="create-automation-wizard-conversation-title"
          name="conversationTitle"
          type="text"
          label={t(I18nKey.AUTOMATIONS$WIZARD_CONVERSATION_TITLE)}
          value={state.conversationTitle}
          onChange={(conversationTitle) => onChange({ conversationTitle })}
        />
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-starting-prompt"
        title={t(I18nKey.AUTOMATIONS$WIZARD_STARTING_PROMPT)}
      >
        <CreateAutomationPromptField
          prompt={state.prompt}
          onPromptChange={(prompt) => onChange({ prompt })}
        />
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-conversation-integrations"
        title={t(I18nKey.AUTOMATIONS$WIZARD_INTEGRATIONS_SECRETS)}
      >
        <WizardIntegrationChips />
      </WizardSection>
    </div>
  );
}
