import type { FunctionComponent, SVGProps } from "react";
import { Code, MessageSquare, Sparkles } from "lucide-react";
import CalendarIcon from "#/icons/calendar.svg?react";
import ActivityIcon from "#/icons/activity.svg?react";
import { I18nKey } from "#/i18n/declaration";
import type {
  CreateAutomationWizardActionType,
  CreateAutomationWizardState,
  CreateAutomationWizardStep,
  CreateAutomationWizardTriggerType,
} from "./create-automation-wizard.types";

export const CREATE_AUTOMATION_WIZARD_STEPS: CreateAutomationWizardStep[] = [
  "basics",
  "trigger",
  "action-plan",
  "review",
];

export const WIZARD_STEP_LABEL_KEYS: Record<
  CreateAutomationWizardStep,
  I18nKey
> = {
  basics: I18nKey.AUTOMATIONS$WIZARD_STEP_BASICS,
  trigger: I18nKey.AUTOMATIONS$WIZARD_STEP_TRIGGER,
  "action-plan": I18nKey.AUTOMATIONS$WIZARD_STEP_ACTION_PLAN,
  review: I18nKey.AUTOMATIONS$WIZARD_STEP_REVIEW,
};

export const WIZARD_TRIGGER_TYPE_OPTIONS: {
  id: CreateAutomationWizardTriggerType;
  labelKey: I18nKey;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}[] = [
  {
    id: "schedule",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_TRIGGER_SCHEDULE,
    icon: CalendarIcon,
  },
  {
    id: "event",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_TRIGGER_EVENT,
    icon: ActivityIcon,
  },
];

export const WIZARD_ACTION_TYPE_OPTIONS: {
  id: CreateAutomationWizardActionType;
  labelKey: I18nKey;
  descriptionKey: I18nKey;
  icon: FunctionComponent<{ className?: string }>;
}[] = [
  {
    id: "run-script",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_ACTION_RUN_SCRIPT,
    descriptionKey: I18nKey.AUTOMATIONS$WIZARD_ACTION_RUN_SCRIPT_DESC,
    icon: Code,
  },
  {
    id: "create-script-llm",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_ACTION_CREATE_SCRIPT,
    descriptionKey: I18nKey.AUTOMATIONS$WIZARD_ACTION_CREATE_SCRIPT_DESC,
    icon: Sparkles,
  },
  {
    id: "start-conversation",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_ACTION_START_CONVERSATION,
    descriptionKey: I18nKey.AUTOMATIONS$WIZARD_ACTION_START_CONVERSATION_DESC,
    icon: MessageSquare,
  },
];

export const WIZARD_SCRIPT_OPTIONS = [
  { key: "slack-channel-checker.ts", label: "slack-channel-checker.ts" },
  { key: "ci-watchdog.ts", label: "ci-watchdog.ts" },
  { key: "standup-digest.ts", label: "standup-digest.ts" },
];

export const WIZARD_SCRIPT_LANGUAGE_OPTIONS = [
  { key: "typescript", label: "TypeScript (Node.js)" },
];

export const WIZARD_SCRIPT_RUNTIME_OPTIONS = [
  { key: "node-18", label: "Node 18" },
];

export const WIZARD_ACTION_INTEGRATION_OPTIONS = [
  { id: "slack-mcp", label: "Slack MCP", enabled: true },
  { id: "agent-canvas-secrets", label: "Agent Canvas secrets", enabled: true },
  { id: "linear-mcp", label: "Linear MCP", enabled: false },
];

export const WIZARD_TIMEZONE_OPTIONS = [
  { key: "America/New_York", label: "America/New_York (EDT)" },
  { key: "America/Los_Angeles", label: "America/Los_Angeles (PDT)" },
  { key: "UTC", label: "UTC" },
];

export const WIZARD_PREVIOUS_RUN_OPTIONS = [
  { key: "skip", labelKey: I18nKey.AUTOMATIONS$WIZARD_SKIP_NEXT_RUN },
  { key: "queue", labelKey: I18nKey.AUTOMATIONS$WIZARD_QUEUE_NEXT_RUN },
];

export const WIZARD_JITTER_OPTIONS = [
  { key: "30", labelKey: I18nKey.AUTOMATIONS$WIZARD_JITTER_30_SECONDS },
  { key: "60", labelKey: I18nKey.AUTOMATIONS$WIZARD_JITTER_60_SECONDS },
];

export const WIZARD_POLLING_UNIT_OPTIONS = [
  { key: "minutes", labelKey: I18nKey.AUTOMATIONS$WIZARD_UNIT_MINUTES },
  { key: "hours", labelKey: I18nKey.AUTOMATIONS$WIZARD_UNIT_HOURS },
];

export const WIZARD_SCHEDULE_MODE_OPTIONS: Array<{
  key: CreateAutomationWizardState["scheduleMode"];
  labelKey: I18nKey;
}> = [
  { key: "interval", labelKey: I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_INTERVAL },
  { key: "daily", labelKey: I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_DAILY },
  { key: "weekly", labelKey: I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_WEEKLY },
  { key: "monthly", labelKey: I18nKey.AUTOMATIONS$WIZARD_SCHEDULE_MONTHLY },
];

export const WIZARD_MONTH_DAY_OPTIONS = Array.from(
  { length: 31 },
  (_, index) => {
    const day = String(index + 1);
    return { key: day, label: day };
  },
);

export const WIZARD_WEEKDAY_OPTIONS = [
  { key: "1", labelKey: I18nKey.AUTOMATIONS$WIZARD_WEEKDAY_MONDAY },
  { key: "2", labelKey: I18nKey.AUTOMATIONS$WIZARD_WEEKDAY_TUESDAY },
  { key: "3", labelKey: I18nKey.AUTOMATIONS$WIZARD_WEEKDAY_WEDNESDAY },
  { key: "4", labelKey: I18nKey.AUTOMATIONS$WIZARD_WEEKDAY_THURSDAY },
  { key: "5", labelKey: I18nKey.AUTOMATIONS$WIZARD_WEEKDAY_FRIDAY },
  { key: "6", labelKey: I18nKey.AUTOMATIONS$WIZARD_WEEKDAY_SATURDAY },
  { key: "0", labelKey: I18nKey.AUTOMATIONS$WIZARD_WEEKDAY_SUNDAY },
];

export const WIZARD_INTEGRATION_OPTIONS = [
  { key: "github", label: "GitHub" },
  { key: "slack", label: "Slack" },
  { key: "linear", label: "Linear" },
];

export const WIZARD_EVENT_OPTIONS = [
  {
    id: "pull_request.opened",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_EVENT_PR_OPENED,
  },
  {
    id: "pull_request.updated",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_EVENT_PR_UPDATED,
  },
  {
    id: "pull_request.ready_for_review",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_EVENT_PR_READY,
  },
  {
    id: "pull_request.closed",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_EVENT_PR_CLOSED,
  },
  {
    id: "issues.opened",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_EVENT_ISSUE_OPENED,
  },
  {
    id: "issues.labeled",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_EVENT_ISSUE_LABELED,
  },
  {
    id: "push",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_EVENT_PUSH,
  },
];

export const WIZARD_REPOSITORY_OPTIONS = [
  { key: "acme/agent-canvas", label: "acme/agent-canvas" },
  { key: "acme/platform", label: "acme/platform" },
];

export const WIZARD_BRANCH_OPTIONS: Array<
  { key: string; label: string } | { key: string; labelKey: I18nKey }
> = [
  { key: "any", labelKey: I18nKey.AUTOMATIONS$WIZARD_ANY_BRANCH },
  { key: "main", label: "main" },
  { key: "develop", label: "develop" },
];

export function getWizardBranchLabel(
  branchKey: string,
  t: (key: I18nKey) => string,
): string {
  const option = WIZARD_BRANCH_OPTIONS.find((entry) => entry.key === branchKey);
  if (!option) return branchKey;
  return "labelKey" in option ? t(option.labelKey) : option.label;
}

export const WIZARD_DELIVERY_BEHAVIOR_OPTIONS = [
  {
    key: "debounce",
    labelKey: I18nKey.AUTOMATIONS$WIZARD_DEBOUNCE_EVENTS,
  },
  { key: "immediate", labelKey: I18nKey.AUTOMATIONS$WIZARD_RUN_IMMEDIATELY },
];

export const WIZARD_WAIT_PERIOD_OPTIONS = [
  { key: "2", labelKey: I18nKey.AUTOMATIONS$WIZARD_WAIT_2_MINUTES },
  { key: "5", labelKey: I18nKey.AUTOMATIONS$WIZARD_WAIT_5_MINUTES },
  { key: "10", labelKey: I18nKey.AUTOMATIONS$WIZARD_WAIT_10_MINUTES },
];

export const DEFAULT_CREATE_AUTOMATION_WIZARD_STATE: CreateAutomationWizardState =
  {
    name: "",
    description: "",
    triggerType: "schedule",
    scheduleMode: "interval",
    schedulePreset: "15m",
    useAdvancedCron: false,
    cronExpression: "*/15 * * * *",
    timezone: "America/New_York",
    activeWindowEnabled: true,
    activeWindowFrom: "08:00",
    activeWindowTo: "18:00",
    activeWindowTimezone: "America/New_York",
    maxRunsPerHour: "12",
    previousRunBehavior: "skip",
    jitterEnabled: false,
    jitterMaxSeconds: "30",
    pollingInterval: "15",
    pollingUnit: "minutes",
    dailyRunTime: "09:00",
    weeklyRunDay: "1",
    weeklyRunTime: "09:00",
    monthlyRunDay: "1",
    monthlyRunTime: "09:00",
    integration: "github",
    selectedEvents: [
      "pull_request.opened",
      "pull_request.updated",
      "pull_request.ready_for_review",
    ],
    repository: "acme/agent-canvas",
    branch: "any",
    labels: "",
    author: "",
    deliveryBehavior: "debounce",
    waitPeriod: "2",
    actionType: "start-conversation",
    selectedScript: "slack-channel-checker.ts",
    scriptLanguage: "typescript",
    scriptRuntime: "node-18",
    conversationTitle: "Automation: {{trigger.name}}",
    prompt: "",
  };

export const WIZARD_DEFAULT_SELECTED_EVENTS = [
  ...DEFAULT_CREATE_AUTOMATION_WIZARD_STATE.selectedEvents,
];
