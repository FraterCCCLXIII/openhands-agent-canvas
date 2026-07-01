import type { FunctionComponent, SVGProps } from "react";
import CalendarIcon from "#/icons/calendar.svg?react";
import GitChangesIcon from "#/icons/git_changes.svg?react";
import SparkleIcon from "#/icons/sparkle.svg?react";
import { I18nKey } from "#/i18n/declaration";

export type CreateAutomationStarterTemplateId =
  | "standup-digest"
  | "ship-report"
  | "ci-watchdog";

export interface CreateAutomationStarterTemplate {
  id: CreateAutomationStarterTemplateId;
  labelKey: I18nKey;
  promptKey: I18nKey;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}

/** Quick-start scheduled-task examples shown on the empty automations state. */
export const CREATE_AUTOMATION_STARTER_TEMPLATES: CreateAutomationStarterTemplate[] =
  [
    {
      id: "standup-digest",
      labelKey: I18nKey.AUTOMATIONS$STARTER_STANDUP_DIGEST,
      promptKey: I18nKey.AUTOMATIONS$STARTER_STANDUP_DIGEST_PROMPT,
      icon: SparkleIcon,
    },
    {
      id: "ship-report",
      labelKey: I18nKey.AUTOMATIONS$STARTER_SHIP_REPORT,
      promptKey: I18nKey.AUTOMATIONS$STARTER_SHIP_REPORT_PROMPT,
      icon: CalendarIcon,
    },
    {
      id: "ci-watchdog",
      labelKey: I18nKey.AUTOMATIONS$STARTER_CI_WATCHDOG,
      promptKey: I18nKey.AUTOMATIONS$STARTER_CI_WATCHDOG_PROMPT,
      icon: GitChangesIcon,
    },
  ];
