import { useTranslation } from "react-i18next";
import { SettingsDropdownInput } from "#/components/features/settings/settings-dropdown-input";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { ToggleSwitch } from "#/components/features/automations/toggle-switch";
import { OptionalTag } from "#/components/features/settings/optional-tag";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { formControlSettingsFieldClassName } from "#/utils/form-control-classes";
import {
  WIZARD_BRANCH_OPTIONS,
  WIZARD_DELIVERY_BEHAVIOR_OPTIONS,
  WIZARD_EVENT_OPTIONS,
  WIZARD_INTEGRATION_OPTIONS,
  WIZARD_JITTER_OPTIONS,
  WIZARD_PREVIOUS_RUN_OPTIONS,
  WIZARD_REPOSITORY_OPTIONS,
  WIZARD_TIMEZONE_OPTIONS,
  WIZARD_WAIT_PERIOD_OPTIONS,
} from "./create-automation-wizard.constants";
import { CreateAutomationWizardTriggerTypeCards } from "./create-automation-wizard-trigger-type-cards";
import { WizardSection } from "./create-automation-wizard-section";
import { WizardScheduleControls } from "./wizard-schedule-controls";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";

interface WizardTriggerStepProps {
  state: CreateAutomationWizardState;
  onChange: (patch: Partial<CreateAutomationWizardState>) => void;
}

export function WizardTriggerStep({ state, onChange }: WizardTriggerStepProps) {
  const { t } = useTranslation("openhands");

  const toggleEvent = (eventId: string) => {
    onChange({
      selectedEvents: state.selectedEvents.includes(eventId)
        ? state.selectedEvents.filter((id) => id !== eventId)
        : [...state.selectedEvents, eventId],
    });
  };

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-trigger-step"
    >
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-content">
          {t(I18nKey.AUTOMATIONS$WIZARD_TRIGGER_TYPE)}
        </h3>
        <p className="text-sm text-muted">
          {t(I18nKey.AUTOMATIONS$WIZARD_TRIGGER_INTRO)}
        </p>
      </div>

      <CreateAutomationWizardTriggerTypeCards
        value={state.triggerType}
        onChange={(triggerType) => onChange({ triggerType })}
      />

      {state.triggerType === "schedule" ? (
        <ScheduleTriggerPanel state={state} onChange={onChange} />
      ) : null}
      {state.triggerType === "event" ? (
        <EventTriggerPanel
          state={state}
          onChange={onChange}
          toggleEvent={toggleEvent}
        />
      ) : null}
    </div>
  );
}

function ScheduleTriggerPanel({
  state,
  onChange,
}: {
  state: CreateAutomationWizardState;
  onChange: WizardTriggerStepProps["onChange"];
}) {
  const { t } = useTranslation("openhands");

  return (
    <>
      <WizardSection
        testId="create-automation-wizard-schedule"
        title={t(I18nKey.AUTOMATIONS$WIZARD_SCHEDULE)}
        description={t(I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_INTRO)}
        descriptionPlacement="inline"
        defaultExpanded
      >
        <WizardScheduleControls state={state} onChange={onChange} />
      </WizardSection>

      <ActiveWindowSection state={state} onChange={onChange} />
      <RunLimitsSection state={state} onChange={onChange} />
    </>
  );
}

function EventTriggerPanel({
  state,
  onChange,
  toggleEvent,
}: {
  state: CreateAutomationWizardState;
  onChange: WizardTriggerStepProps["onChange"];
  toggleEvent: (eventId: string) => void;
}) {
  const { t } = useTranslation("openhands");

  return (
    <>
      <WizardSection
        testId="create-automation-wizard-integration-source"
        title={t(I18nKey.AUTOMATIONS$WIZARD_INTEGRATION_SOURCE)}
        description={t(I18nKey.AUTOMATIONS$WIZARD_INTEGRATION_HELPER)}
        defaultExpanded
      >
        <SettingsDropdownInput
          testId="create-automation-wizard-integration"
          name="integration"
          label={t(I18nKey.AUTOMATIONS$WIZARD_SELECT_INTEGRATION)}
          selectedKey={state.integration}
          items={WIZARD_INTEGRATION_OPTIONS.map((option) => ({
            key: option.key,
            label: option.label,
          }))}
          onSelectionChange={(key) =>
            onChange({ integration: String(key ?? state.integration) })
          }
        />
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-events"
        title={t(I18nKey.AUTOMATIONS$WIZARD_EVENTS)}
        description={t(I18nKey.AUTOMATIONS$WIZARD_EVENTS_HELPER)}
      >
        <ul className="flex flex-col gap-2">
          {WIZARD_EVENT_OPTIONS.map((option) => (
            <li key={option.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-content">
                <input
                  type="checkbox"
                  data-testid={`create-automation-wizard-event-${option.id}`}
                  checked={state.selectedEvents.includes(option.id)}
                  onChange={() => toggleEvent(option.id)}
                  className="size-4 rounded border-[var(--oh-border)] bg-base-secondary"
                />
                <span>{t(option.labelKey)}</span>
              </label>
            </li>
          ))}
        </ul>
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-filters"
        title={
          <span className="inline-flex items-center gap-2">
            {t(I18nKey.AUTOMATIONS$WIZARD_FILTERS)}
            <OptionalTag />
          </span>
        }
      >
        <SettingsDropdownInput
          testId="create-automation-wizard-repository"
          name="repository"
          label={t(I18nKey.AUTOMATIONS$WIZARD_REPOSITORY)}
          selectedKey={state.repository}
          items={WIZARD_REPOSITORY_OPTIONS.map((option) => ({
            key: option.key,
            label: option.label,
          }))}
          onSelectionChange={(key) =>
            onChange({ repository: String(key ?? state.repository) })
          }
        />
        <SettingsDropdownInput
          testId="create-automation-wizard-branch"
          name="branch"
          label={t(I18nKey.AUTOMATIONS$WIZARD_BRANCH)}
          selectedKey={state.branch}
          items={WIZARD_BRANCH_OPTIONS.map((option) => ({
            key: option.key,
            label: "labelKey" in option ? t(option.labelKey) : option.label,
          }))}
          onSelectionChange={(key) =>
            onChange({ branch: String(key ?? state.branch) })
          }
        />
        <SettingsInput
          testId="create-automation-wizard-labels"
          name="labels"
          type="text"
          label={t(I18nKey.AUTOMATIONS$WIZARD_LABELS)}
          placeholder={t(I18nKey.AUTOMATIONS$WIZARD_LABELS_PLACEHOLDER)}
          value={state.labels}
          onChange={(labels) => onChange({ labels })}
        />
        <SettingsInput
          testId="create-automation-wizard-author"
          name="author"
          type="text"
          label={t(I18nKey.AUTOMATIONS$WIZARD_AUTHOR)}
          placeholder={t(I18nKey.AUTOMATIONS$WIZARD_AUTHOR_PLACEHOLDER)}
          value={state.author}
          onChange={(author) => onChange({ author })}
        />
      </WizardSection>

      <WizardSection
        testId="create-automation-wizard-delivery-behavior"
        title={t(I18nKey.AUTOMATIONS$WIZARD_DELIVERY_BEHAVIOR)}
      >
        <SettingsDropdownInput
          testId="create-automation-wizard-delivery-behavior-select"
          name="deliveryBehavior"
          label={t(I18nKey.AUTOMATIONS$WIZARD_MANY_EVENTS)}
          selectedKey={state.deliveryBehavior}
          items={WIZARD_DELIVERY_BEHAVIOR_OPTIONS.map((option) => ({
            key: option.key,
            label: t(option.labelKey),
          }))}
          onSelectionChange={(key) =>
            onChange({
              deliveryBehavior: String(key ?? state.deliveryBehavior),
            })
          }
        />
        <SettingsDropdownInput
          testId="create-automation-wizard-wait-period"
          name="waitPeriod"
          label={t(I18nKey.AUTOMATIONS$WIZARD_WAIT_PERIOD)}
          selectedKey={state.waitPeriod}
          items={WIZARD_WAIT_PERIOD_OPTIONS.map((option) => ({
            key: option.key,
            label: t(option.labelKey),
          }))}
          onSelectionChange={(key) =>
            onChange({ waitPeriod: String(key ?? state.waitPeriod) })
          }
        />
        <p className="text-xs text-muted">
          {t(I18nKey.AUTOMATIONS$WIZARD_DEBOUNCE_HELPER)}
        </p>
      </WizardSection>
    </>
  );
}

function ActiveWindowSection({
  state,
  onChange,
}: {
  state: CreateAutomationWizardState;
  onChange: WizardTriggerStepProps["onChange"];
}) {
  const { t } = useTranslation("openhands");

  return (
    <WizardSection
      testId="create-automation-wizard-active-window"
      title={
        <span className="inline-flex items-center gap-2">
          {t(I18nKey.AUTOMATIONS$WIZARD_ACTIVE_WINDOW)}
          <OptionalTag />
        </span>
      }
      description={t(I18nKey.AUTOMATIONS$WIZARD_ACTIVE_WINDOW_HELPER)}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-content">
          {t(I18nKey.AUTOMATIONS$WIZARD_ACTIVE_WINDOW)}
        </span>
        <ToggleSwitch
          enabled={state.activeWindowEnabled}
          label={t(I18nKey.AUTOMATIONS$WIZARD_ACTIVE_WINDOW)}
          onToggle={() =>
            onChange({ activeWindowEnabled: !state.activeWindowEnabled })
          }
        />
      </div>
      {state.activeWindowEnabled ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SettingsInput
              testId="create-automation-wizard-active-from"
              name="activeWindowFrom"
              type="time"
              label={t(I18nKey.AUTOMATIONS$WIZARD_FROM)}
              value={state.activeWindowFrom}
              onChange={(activeWindowFrom) => onChange({ activeWindowFrom })}
            />
            <SettingsInput
              testId="create-automation-wizard-active-to"
              name="activeWindowTo"
              type="time"
              label={t(I18nKey.AUTOMATIONS$WIZARD_TO)}
              value={state.activeWindowTo}
              onChange={(activeWindowTo) => onChange({ activeWindowTo })}
            />
          </div>
          <SettingsDropdownInput
            testId="create-automation-wizard-active-window-timezone"
            name="activeWindowTimezone"
            label={t(I18nKey.AUTOMATIONS$WIZARD_TIMEZONE)}
            selectedKey={state.activeWindowTimezone}
            items={WIZARD_TIMEZONE_OPTIONS.map((option) => ({
              key: option.key,
              label: option.label,
            }))}
            onSelectionChange={(key) =>
              onChange({
                activeWindowTimezone: String(key ?? state.activeWindowTimezone),
              })
            }
          />
        </>
      ) : null}
    </WizardSection>
  );
}

function RunLimitsSection({
  state,
  onChange,
  defaultMaxRuns = "12",
}: {
  state: CreateAutomationWizardState;
  onChange: WizardTriggerStepProps["onChange"];
  defaultMaxRuns?: string;
}) {
  const { t } = useTranslation("openhands");
  const maxRuns = state.maxRunsPerHour || defaultMaxRuns;

  return (
    <WizardSection
      testId="create-automation-wizard-run-limits"
      title={t(I18nKey.AUTOMATIONS$WIZARD_RUN_LIMITS)}
    >
      <SettingsInput
        testId="create-automation-wizard-max-runs"
        name="maxRunsPerHour"
        type="number"
        label={t(I18nKey.AUTOMATIONS$WIZARD_MAX_RUNS_PER_HOUR)}
        min={1}
        value={maxRuns}
        onChange={(maxRunsPerHour) => onChange({ maxRunsPerHour })}
      />
      <SettingsDropdownInput
        testId="create-automation-wizard-previous-run-behavior"
        name="previousRunBehavior"
        label={t(I18nKey.AUTOMATIONS$WIZARD_PREVIOUS_RUN_BEHAVIOR)}
        selectedKey={state.previousRunBehavior}
        items={WIZARD_PREVIOUS_RUN_OPTIONS.map((option) => ({
          key: option.key,
          label: t(option.labelKey),
        }))}
        onSelectionChange={(key) =>
          onChange({
            previousRunBehavior: String(key ?? state.previousRunBehavior),
          })
        }
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-content">
          <input
            type="checkbox"
            data-testid="create-automation-wizard-jitter-enabled"
            checked={state.jitterEnabled}
            onChange={() => onChange({ jitterEnabled: !state.jitterEnabled })}
            className={cn(
              "size-4 rounded border-[var(--oh-border)]",
              formControlSettingsFieldClassName,
            )}
          />
          <span>{t(I18nKey.AUTOMATIONS$WIZARD_ADD_JITTER)}</span>
        </label>
        <SettingsDropdownInput
          testId="create-automation-wizard-jitter-max"
          name="jitterMaxSeconds"
          label={t(I18nKey.AUTOMATIONS$WIZARD_JITTER_UP_TO)}
          wrapperClassName="sm:max-w-[12rem]"
          isDisabled={!state.jitterEnabled}
          selectedKey={state.jitterMaxSeconds}
          items={WIZARD_JITTER_OPTIONS.map((option) => ({
            key: option.key,
            label: t(option.labelKey),
          }))}
          onSelectionChange={(key) =>
            onChange({
              jitterMaxSeconds: String(key ?? state.jitterMaxSeconds),
            })
          }
        />
      </div>
      <p className="text-xs text-muted">
        {t(I18nKey.AUTOMATIONS$WIZARD_JITTER_HELPER)}
      </p>
    </WizardSection>
  );
}
