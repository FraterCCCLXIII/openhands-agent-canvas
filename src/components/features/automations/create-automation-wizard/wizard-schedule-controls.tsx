import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SettingsDropdownInput } from "#/components/features/settings/settings-dropdown-input";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  WIZARD_POLLING_UNIT_OPTIONS,
  WIZARD_TIMEZONE_OPTIONS,
} from "./create-automation-wizard.constants";
import { WIZARD_SELECTED_SURFACE_CLASS } from "./create-automation-wizard-styles";
import { WizardFieldGroup } from "./create-automation-wizard-section";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";
import {
  deriveCronFromInterval,
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

  const applySimpleSchedule = (
    interval: string,
    unit: string,
    preset: string | null,
  ) => {
    onChange({
      pollingInterval: interval,
      pollingUnit: unit,
      schedulePreset: preset,
      useAdvancedCron: false,
      cronExpression: deriveCronFromInterval(interval, unit),
    });
    setAdvancedOpen(false);
  };

  const handlePresetClick = (presetId: string) => {
    const preset = WIZARD_SCHEDULE_PRESETS.find(
      (entry) => entry.id === presetId,
    );
    if (!preset) return;
    onChange({
      pollingInterval: preset.interval,
      pollingUnit: preset.unit,
      schedulePreset: preset.id,
      useAdvancedCron: false,
      cronExpression: preset.cron,
    });
    setAdvancedOpen(false);
  };

  const handleIntervalChange = (pollingInterval: string) => {
    applySimpleSchedule(pollingInterval, state.pollingUnit, null);
  };

  const handleUnitChange = (unit: string) => {
    applySimpleSchedule(state.pollingInterval, unit, null);
  };

  const handleAdvancedToggle = () => {
    const nextOpen = !advancedOpen;
    setAdvancedOpen(nextOpen);
    onChange({ useAdvancedCron: nextOpen });
  };

  return (
    <div
      className="flex flex-col gap-4"
      data-testid="create-automation-wizard-schedule-controls"
    >
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-start",
          simpleScheduleDisabled && "pointer-events-none opacity-50",
        )}
        aria-disabled={simpleScheduleDisabled}
      >
        <WizardFieldGroup label={t(I18nKey.AUTOMATIONS$WIZARD_RUN_EVERY)}>
          <div className="flex gap-2">
            <SettingsInput
              testId="create-automation-wizard-schedule-interval"
              name="scheduleInterval"
              type="number"
              label={t(I18nKey.AUTOMATIONS$WIZARD_RUN_EVERY)}
              labelClassName="sr-only"
              min={1}
              isDisabled={simpleScheduleDisabled}
              value={state.pollingInterval}
              onChange={handleIntervalChange}
              className="w-20 shrink-0"
            />
            <SettingsDropdownInput
              testId="create-automation-wizard-schedule-unit"
              name="scheduleUnit"
              label={t(I18nKey.AUTOMATIONS$WIZARD_RUN_EVERY)}
              wrapperClassName="min-w-0 flex-1"
              isDisabled={simpleScheduleDisabled}
              selectedKey={state.pollingUnit}
              items={WIZARD_POLLING_UNIT_OPTIONS.map((option) => ({
                key: option.key,
                label: t(option.labelKey),
              }))}
              onSelectionChange={(key) =>
                handleUnitChange(String(key ?? state.pollingUnit))
              }
            />
          </div>
        </WizardFieldGroup>

        <div
          aria-hidden
          className="hidden sm:block w-px self-stretch bg-[var(--oh-border)]"
        />

        <WizardFieldGroup label={t(I18nKey.AUTOMATIONS$WIZARD_PRESETS)}>
          <div className="flex flex-wrap gap-2">
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
        </WizardFieldGroup>
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
            <WizardFieldGroup
              label={t(I18nKey.AUTOMATIONS$WIZARD_CRON_EXPRESSION)}
              helper={t(I18nKey.AUTOMATIONS$WIZARD_CRON_HELPER)}
            >
              <SettingsInput
                testId="create-automation-wizard-cron-expression"
                name="cronExpression"
                type="text"
                label={t(I18nKey.AUTOMATIONS$WIZARD_CRON_EXPRESSION)}
                labelClassName="sr-only"
                value={state.cronExpression}
                onChange={(cronExpression) =>
                  onChange({
                    cronExpression,
                    useAdvancedCron: true,
                    schedulePreset: null,
                  })
                }
              />
            </WizardFieldGroup>
          </div>
        ) : null}
      </div>

      <SettingsDropdownInput
        testId="create-automation-wizard-timezone"
        name="timezone"
        label={t(I18nKey.AUTOMATIONS$WIZARD_TIMEZONE)}
        selectedKey={state.timezone}
        items={WIZARD_TIMEZONE_OPTIONS.map((option) => ({
          key: option.key,
          label: option.label,
        }))}
        onSelectionChange={(key) =>
          onChange({ timezone: String(key ?? state.timezone) })
        }
      />
    </div>
  );
}
