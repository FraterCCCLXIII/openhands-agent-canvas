export type CreateAutomationWizardStep =
  | "basics"
  | "trigger"
  | "action-plan"
  | "review";

export type CreateAutomationWizardTriggerType = "schedule" | "event";

export type CreateAutomationWizardActionType =
  | "run-script"
  | "create-script-llm"
  | "start-conversation";

export interface CreateAutomationWizardState {
  name: string;
  description: string;
  triggerType: CreateAutomationWizardTriggerType;
  schedulePreset: string | null;
  useAdvancedCron: boolean;
  cronExpression: string;
  timezone: string;
  activeWindowEnabled: boolean;
  activeWindowFrom: string;
  activeWindowTo: string;
  activeWindowTimezone: string;
  maxRunsPerHour: string;
  previousRunBehavior: string;
  jitterEnabled: boolean;
  jitterMaxSeconds: string;
  pollingInterval: string;
  pollingUnit: string;
  integration: string;
  selectedEvents: string[];
  repository: string;
  branch: string;
  labels: string;
  author: string;
  deliveryBehavior: string;
  waitPeriod: string;
  actionType: CreateAutomationWizardActionType;
  selectedScript: string;
  scriptLanguage: string;
  scriptRuntime: string;
  conversationTitle: string;
  prompt: string;
}
