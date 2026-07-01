import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsDropdownInput } from "#/components/features/settings/settings-dropdown-input";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { formControlSettingsLabelClassName } from "#/utils/form-control-classes";
import {
  WIZARD_MONTH_DAY_OPTIONS,
  WIZARD_POLLING_UNIT_OPTIONS,
  WIZARD_SCHEDULE_MODE_OPTIONS,
  WIZARD_TIMEZONE_OPTIONS,
  WIZARD_WEEKDAY_OPTIONS,
} from "./create-automation-wizard.constants";
import { WIZARD_SELECTED_SURFACE_CLASS } from "./create-automation-wizard-styles";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";
import {
  deriveCronFromScheduleState,
  WIZARD_SCHEDULE_PRESETS,
} from "./wizard-schedule.utils";

interface WizardScheduleControlsProps {
  state: CreateAutomationWizardState;
  onChange: (patch: Partial<CreateAutomationWizardState>) => void;
}

const PRESET_LABEL_KEYS: Record<string, I18nKey> = {
  "1m": I18nKey.AUTOMATIONS$WIZARD_PRESET_1M,
  "5m": I18nKey.AUTOMATIONS$WIZARD_PRESET_5M,
  "15m": I18nKey.AUTOMATIONS$WIZARD_PRESET_15M,
  "1h": I18nKey.AUTOMATIONS$WIZARD_PRESET_1H,
  daily: I18nKey.AUTOMATIONS$WIZARD_PRESET_DAILY,
};

export function WizardScheduleControls({
  state,
  onChange,
}: WizardScheduleControlsProps) {
  const { t } = useTranslation("openhands");
  const [advancedOpen, setAdvancedOpen] = useState(state.useAdvancedCron);
  const simpleScheduleDisabled = state.useAdvancedCron;

  useEffect(() => {
    setAdvancedOpen(state.useAdvancedCron);
  }, [state.useAdvancedCron]);

  const applySimpleSchedule = (patch: Partial<CreateAutomationWizardState>) => {
    const next = {
      ...state,
      ...patch,
      useAdvancedCron: false,
      schedulePreset: null,
    };
    onChange({
      ...patch,
      useAdvancedCron: false,
      schedulePreset: patch.schedulePreset ?? null,
      cronExpression: deriveCronFromScheduleState(next),
    });
    setAdvancedOpen(false);
  };

  const handlePresetClick = (presetId: string) => {
    const preset = WIZARD_SCHEDULE_PRESETS.find(
      (entry) => entry.id === presetId,
    );
    if (!preset) return;
    onChange({
      scheduleMode: preset.mode,
      pollingInterval: preset.interval,
      pollingUnit: preset.unit,
      dailyRunTime: preset.dailyRunTime,
      schedulePreset: preset.id,
      useAdvancedCron: false,
      cronExpression: preset.cron,
    });
    setAdvancedOpen(false);
  };

  const handleModeChange = (
    scheduleMode: CreateAutomationWizardState["scheduleMode"],
  ) => {
    applySimpleSchedule({ scheduleMode, schedulePreset: null });
  };

  const handleAdvancedToggle = () => {
    const nextOpen = !advancedOpen;
    setAdvancedOpen(nextOpen);
    onChange({ useAdvancedCron: nextOpen });
  };

  const runEveryLabel = t(I18nKey.AUTOMATIONS$WIZARD_RUN_EVERY);
  const unitLabel = t(I18nKey.AUTOMATIONS$WIZARD_UNIT);
  const atTimeLabel = t(I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_AT_TIME);
  const timezoneLabel = t(I18nKey.AUTOMATIONS$WIZARD_TIMEZONE);

  const scheduleRowHalfClassName = "w-full min-w-0";

  const renderTimezoneField = (wrapperClassName?: string) => (
    <SettingsDropdownInput
      testId="create-automation-wizard-timezone"
      name="timezone"
      label={timezoneLabel}
      wrapperClassName={cn(scheduleRowHalfClassName, wrapperClassName)}
      selectedKey={state.timezone}
      items={WIZARD_TIMEZONE_OPTIONS.map((option) => ({
        key: option.key,
        label: option.label,
      }))}
      onSelectionChange={(key) =>
        onChange({ timezone: String(key ?? state.timezone) })
      }
    />
  );

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-schedule-controls"
    >
      <div
        className={cn(
          "flex flex-wrap gap-2",
          simpleScheduleDisabled && "pointer-events-none opacity-50",
        )}
        aria-disabled={simpleScheduleDisabled}
      >
        {WIZARD_SCHEDULE_PRESETS.map((preset) => {
          const isSelected =
            !state.useAdvancedCron && state.schedulePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={simpleScheduleDisabled}
              data-testid={`create-automation-wizard-schedule-preset-${preset.id}`}
              onClick={() => handlePresetClick(preset.id)}
              className={cn(
                "inline-flex h-9 items-center rounded-lg border px-3 text-sm transition-colors",
                isSelected
                  ? cn(WIZARD_SELECTED_SURFACE_CLASS, "text-white")
                  : "border-[var(--oh-border)] bg-base-secondary text-content hover:bg-surface-raised",
                simpleScheduleDisabled && "cursor-not-allowed",
              )}
            >
              {t(PRESET_LABEL_KEYS[preset.id])}
            </button>
          );
        })}
      </div>

      <SettingsDropdownInput
        testId="create-automation-wizard-schedule-mode"
        name="scheduleMode"
        label={t(I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_FREQUENCY)}
        isDisabled={simpleScheduleDisabled}
        selectedKey={state.scheduleMode}
        items={WIZARD_SCHEDULE_MODE_OPTIONS.map((option) => ({
          key: option.key,
          label: t(option.labelKey),
        }))}
        onSelectionChange={(key) =>
          handleModeChange(
            (key ??
              state.scheduleMode) as CreateAutomationWizardState["scheduleMode"],
          )
        }
      />

      <div
        className={cn(
          "flex flex-col gap-4",
          simpleScheduleDisabled && "pointer-events-none opacity-50",
        )}
        aria-disabled={simpleScheduleDisabled}
      >
        {state.scheduleMode === "interval" ? (
          <div className="grid grid-cols-2 gap-4">
            <div className={scheduleRowHalfClassName}>
              <span
                className={cn(
                  formControlSettingsLabelClassName,
                  "mb-2.5 block",
                )}
              >
                {runEveryLabel}
              </span>
              <div className="flex items-center gap-2">
                <SettingsInput
                  testId="create-automation-wizard-schedule-interval"
                  name="scheduleInterval"
                  type="number"
                  label={runEveryLabel}
                  labelClassName="sr-only"
                  min={1}
                  isDisabled={simpleScheduleDisabled}
                  value={state.pollingInterval}
                  onChange={(pollingInterval) =>
                    applySimpleSchedule({ pollingInterval })
                  }
                  className="w-24 shrink-0"
                />
                <SettingsDropdownInput
                  testId="create-automation-wizard-schedule-unit"
                  name="scheduleUnit"
                  label={unitLabel}
                  labelClassName="sr-only"
                  wrapperClassName="!w-auto max-w-fit shrink-0"
                  autocompleteClassName="!w-auto max-w-fit"
                  inputWrapperClassName="!w-auto w-fit"
                  inputClassName="!w-auto w-fit"
                  isDisabled={simpleScheduleDisabled}
                  selectedKey={state.pollingUnit}
                  items={WIZARD_POLLING_UNIT_OPTIONS.map((option) => ({
                    key: option.key,
                    label: t(option.labelKey),
                  }))}
                  onSelectionChange={(key) =>
                    applySimpleSchedule({
                      pollingUnit: String(key ?? state.pollingUnit),
                    })
                  }
                />
              </div>
            </div>
            {renderTimezoneField()}
          </div>
        ) : null}

        {state.scheduleMode === "daily" ? (
          <div className="grid grid-cols-2 gap-4">
            <SettingsInput
              testId="create-automation-wizard-daily-time"
              name="dailyRunTime"
              type="time"
              label={atTimeLabel}
              isDisabled={simpleScheduleDisabled}
              value={state.dailyRunTime}
              onChange={(dailyRunTime) => applySimpleSchedule({ dailyRunTime })}
              className={scheduleRowHalfClassName}
            />
            {renderTimezoneField()}
          </div>
        ) : null}

        {state.scheduleMode === "weekly" ? (
          <div className="flex flex-col gap-4">
            <SettingsDropdownInput
              testId="create-automation-wizard-weekly-day"
              name="weeklyRunDay"
              label={t(I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_ON_DAY)}
              isDisabled={simpleScheduleDisabled}
              selectedKey={state.weeklyRunDay}
              items={WIZARD_WEEKDAY_OPTIONS.map((option) => ({
                key: option.key,
                label: t(option.labelKey),
              }))}
              onSelectionChange={(key) =>
                applySimpleSchedule({
                  weeklyRunDay: String(key ?? state.weeklyRunDay),
                })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <SettingsInput
                testId="create-automation-wizard-weekly-time"
                name="weeklyRunTime"
                type="time"
                label={atTimeLabel}
                isDisabled={simpleScheduleDisabled}
                value={state.weeklyRunTime}
                onChange={(weeklyRunTime) =>
                  applySimpleSchedule({ weeklyRunTime })
                }
                className={scheduleRowHalfClassName}
              />
              {renderTimezoneField()}
            </div>
          </div>
        ) : null}

        {state.scheduleMode === "monthly" ? (
          <div className="flex flex-col gap-4">
            <SettingsDropdownInput
              testId="create-automation-wizard-monthly-day"
              name="monthlyRunDay"
              label={t(I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_ON_DAY_OF_MONTH)}
              isDisabled={simpleScheduleDisabled}
              selectedKey={state.monthlyRunDay}
              items={WIZARD_MONTH_DAY_OPTIONS.map((option) => ({
                key: option.key,
                label: option.label,
              }))}
              onSelectionChange={(key) =>
                applySimpleSchedule({
                  monthlyRunDay: String(key ?? state.monthlyRunDay),
                })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <SettingsInput
                testId="create-automation-wizard-monthly-time"
                name="monthlyRunTime"
                type="time"
                label={atTimeLabel}
                isDisabled={simpleScheduleDisabled}
                value={state.monthlyRunTime}
                onChange={(monthlyRunTime) =>
                  applySimpleSchedule({ monthlyRunTime })
                }
                className={scheduleRowHalfClassName}
              />
              {renderTimezoneField()}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-[var(--oh-border)]">
        <button
          type="button"
          data-testid="create-automation-wizard-advanced-cron-toggle"
          aria-expanded={advancedOpen}
          onClick={handleAdvancedToggle}
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="text-sm font-medium text-content">
            {t(I18nKey.AUTOMATIONS$WIZARD_ADVANCED_CRON)}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
              advancedOpen && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        {advancedOpen ? (
          <div className="border-t border-[var(--oh-border)] px-4 py-4">
            <SettingsInput
              testId="create-automation-wizard-cron-expression"
              name="cronExpression"
              type="text"
              label={t(I18nKey.AUTOMATIONS$WIZARD_CRON_EXPRESSION)}
              placeholder={t(I18nKey.AUTOMATIONS$WIZARD_CRON_PLACEHOLDER)}
              value={state.cronExpression}
              onChange={(cronExpression) =>
                onChange({
                  cronExpression,
                  useAdvancedCron: true,
                  schedulePreset: null,
                })
              }
            />
            <p className="mt-2 text-xs text-muted">
              {t(I18nKey.AUTOMATIONS$WIZARD_CRON_HELPER)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
