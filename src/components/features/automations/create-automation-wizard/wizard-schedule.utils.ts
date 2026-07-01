import { I18nKey } from "#/i18n/declaration";
import { WIZARD_WEEKDAY_OPTIONS } from "./create-automation-wizard.constants";
import type { CreateAutomationWizardState } from "./create-automation-wizard.types";

export type WizardSchedulePresetId = "1m" | "5m" | "15m" | "1h" | "daily";

export type WizardScheduleMode = "interval" | "daily" | "weekly" | "monthly";

export interface WizardSchedulePreset {
  id: WizardSchedulePresetId;
  mode: WizardScheduleMode;
  interval: string;
  unit: "minutes" | "hours";
  dailyRunTime: string;
  cron: string;
}

export const WIZARD_SCHEDULE_PRESETS: WizardSchedulePreset[] = [
  {
    id: "1m",
    mode: "interval",
    interval: "1",
    unit: "minutes",
    dailyRunTime: "09:00",
    cron: "*/1 * * * *",
  },
  {
    id: "5m",
    mode: "interval",
    interval: "5",
    unit: "minutes",
    dailyRunTime: "09:00",
    cron: "*/5 * * * *",
  },
  {
    id: "15m",
    mode: "interval",
    interval: "15",
    unit: "minutes",
    dailyRunTime: "09:00",
    cron: "*/15 * * * *",
  },
  {
    id: "1h",
    mode: "interval",
    interval: "1",
    unit: "hours",
    dailyRunTime: "09:00",
    cron: "0 * * * *",
  },
  {
    id: "daily",
    mode: "daily",
    interval: "1",
    unit: "hours",
    dailyRunTime: "09:00",
    cron: "0 9 * * *",
  },
];

export function deriveCronFromInterval(interval: string, unit: string): string {
  const value = Math.max(1, Number.parseInt(interval, 10) || 1);
  if (unit === "hours") {
    return `0 */${value} * * *`;
  }
  return `*/${value} * * * *`;
}

function parseTimeParts(time: string): { hour: string; minute: string } {
  const [hour = "9", minute = "0"] = time.split(":");
  return {
    hour: String(Number.parseInt(hour, 10) || 0),
    minute: String(Number.parseInt(minute, 10) || 0),
  };
}

export function deriveCronFromScheduleState(
  state: Pick<
    CreateAutomationWizardState,
    | "scheduleMode"
    | "pollingInterval"
    | "pollingUnit"
    | "dailyRunTime"
    | "weeklyRunDay"
    | "weeklyRunTime"
    | "monthlyRunDay"
    | "monthlyRunTime"
  >,
): string {
  switch (state.scheduleMode) {
    case "daily": {
      const { hour, minute } = parseTimeParts(state.dailyRunTime);
      return `${minute} ${hour} * * *`;
    }
    case "weekly": {
      const { hour, minute } = parseTimeParts(state.weeklyRunTime);
      return `${minute} ${hour} * * ${state.weeklyRunDay}`;
    }
    case "monthly": {
      const { hour, minute } = parseTimeParts(state.monthlyRunTime);
      const day = Math.min(
        31,
        Math.max(1, Number.parseInt(state.monthlyRunDay, 10) || 1),
      );
      return `${minute} ${hour} ${day} * *`;
    }
    default:
      return deriveCronFromInterval(state.pollingInterval, state.pollingUnit);
  }
}

export function getSchedulePresetById(
  presetId: string | null | undefined,
): WizardSchedulePreset | undefined {
  return WIZARD_SCHEDULE_PRESETS.find((preset) => preset.id === presetId);
}

export function getWizardScheduleDescription(
  state: CreateAutomationWizardState,
  t: (key: I18nKey, options?: Record<string, string>) => string,
): string {
  if (state.useAdvancedCron) {
    return state.cronExpression;
  }

  switch (state.scheduleMode) {
    case "daily":
      return t(I18nKey.AUTOMATIONS$WIZARD_REVIEW_DAILY, {
        time: state.dailyRunTime,
      });
    case "weekly": {
      const weekday =
        WIZARD_WEEKDAY_OPTIONS.find(
          (option) => option.key === state.weeklyRunDay,
        )?.labelKey ?? I18nKey.AUTOMATIONS$WIZARD_WEEKDAY_MONDAY;
      return t(I18nKey.AUTOMATIONS$WIZARD_REVIEW_WEEKLY, {
        day: t(weekday),
        time: state.weeklyRunTime,
      });
    }
    case "monthly":
      return t(I18nKey.AUTOMATIONS$WIZARD_REVIEW_MONTHLY, {
        day: state.monthlyRunDay,
        time: state.monthlyRunTime,
      });
    default:
      return `${state.pollingInterval} ${t(
        state.pollingUnit === "hours"
          ? I18nKey.AUTOMATIONS$WIZARD_UNIT_HOURS
          : I18nKey.AUTOMATIONS$WIZARD_UNIT_MINUTES,
      )}`;
  }
}
