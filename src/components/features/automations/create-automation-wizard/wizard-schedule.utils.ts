export type WizardSchedulePresetId = "1m" | "5m" | "15m" | "1h" | "daily";

export interface WizardSchedulePreset {
  id: WizardSchedulePresetId;
  interval: string;
  unit: "minutes" | "hours";
  cron: string;
}

export const WIZARD_SCHEDULE_PRESETS: WizardSchedulePreset[] = [
  { id: "1m", interval: "1", unit: "minutes", cron: "*/1 * * * *" },
  { id: "5m", interval: "5", unit: "minutes", cron: "*/5 * * * *" },
  { id: "15m", interval: "15", unit: "minutes", cron: "*/15 * * * *" },
  { id: "1h", interval: "1", unit: "hours", cron: "0 * * * *" },
  { id: "daily", interval: "1", unit: "hours", cron: "0 9 * * *" },
];

export function deriveCronFromInterval(interval: string, unit: string): string {
  const value = Math.max(1, Number.parseInt(interval, 10) || 1);
  if (unit === "hours") {
    return `0 */${value} * * *`;
  }
  return `*/${value} * * * *`;
}

export function getSchedulePresetById(
  presetId: string | null | undefined,
): WizardSchedulePreset | undefined {
  return WIZARD_SCHEDULE_PRESETS.find((preset) => preset.id === presetId);
}
