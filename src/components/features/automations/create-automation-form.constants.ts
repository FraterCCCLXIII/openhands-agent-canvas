/** UI-only placeholder options until create-automation API wiring lands. */

/** Matches SettingsInput / SettingsDropdownInput field label weight. */
export const createAutomationFieldLabelClassName = "text-sm";

export type CreateAutomationOptionalSection =
  | "repositories"
  | "triggers"
  | "plugins"
  | "notification";

export const CREATE_AUTOMATION_OPTIONAL_SECTIONS: CreateAutomationOptionalSection[] =
  ["repositories", "triggers", "plugins", "notification"];

export const CREATE_AUTOMATION_TRIGGER_OPTIONS = [
  { id: "pull_request.opened", label: "pull_request.opened" },
  { id: "push", label: "push" },
  { id: "issues.opened", label: "issues.opened" },
] as const;

export const CREATE_AUTOMATION_PLUGIN_OPTIONS = [
  { id: "GitHub", label: "GitHub" },
  { id: "Slack", label: "Slack" },
  { id: "Linear", label: "Linear" },
] as const;

export const CREATE_AUTOMATION_SCHEDULE_TRIGGER_ID = "schedule-trigger";
