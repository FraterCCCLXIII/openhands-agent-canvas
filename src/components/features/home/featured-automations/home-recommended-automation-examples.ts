import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  GitPullRequest,
  MessageSquareText,
  NotebookPen,
} from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { AutomationRunStatus } from "#/types/automation";

export type RecommendedAutomationCard = {
  /** Catalog automation id (matches `@openhands/extensions/automations`). */
  id: string;
  labelKey: I18nKey;
  Icon: LucideIcon;
  /** Lucide stroke color for the card icon. */
  iconColor: string;
  href: string;
  /** Demo activity fields shown when this card is pinned to the dashboard. */
  demoActivity: {
    name: string;
    triggerSummary: string;
    status: AutomationRunStatus;
    whenLabel: string;
    conversationId: string | null;
  };
};

/**
 * Home recommended-automations rail cards, drawn from real catalog use-cases.
 * Short prompt-style labels; links open the automations page for setup.
 * Demo activity fields power the pinned dashboard modules (no API yet).
 */
export const HOME_RECOMMENDED_AUTOMATION_CARDS: readonly RecommendedAutomationCard[] =
  [
    {
      id: "github-pr-reviewer",
      labelKey: I18nKey.FEATURED_AUTOMATIONS$RECOMMENDED_PR_REVIEW,
      Icon: GitPullRequest,
      iconColor: "#5B9FFF",
      href: "/automations",
      demoActivity: {
        name: "PR Review on Open",
        triggerSummary: "On pull_request opened",
        status: AutomationRunStatus.FAILED,
        whenLabel: "3h ago",
        conversationId: "example-conv-pr-review",
      },
    },
    {
      id: "github-repo-monitor",
      labelKey: I18nKey.FEATURED_AUTOMATIONS$RECOMMENDED_GITHUB_MENTIONS,
      Icon: MessageSquareText,
      iconColor: "#A78BFA",
      href: "/automations",
      demoActivity: {
        name: "GitHub Mentions Responder",
        triggerSummary: "On issue_comment mentioning @OpenHands",
        status: AutomationRunStatus.RUNNING,
        whenLabel: "5m ago",
        conversationId: "example-conv-github-mentions",
      },
    },
    {
      id: "slack-standup-digest",
      labelKey: I18nKey.FEATURED_AUTOMATIONS$RECOMMENDED_SLACK_STANDUP,
      Icon: NotebookPen,
      iconColor: "#4ADE80",
      href: "/automations",
      demoActivity: {
        name: "Slack Standup Digest",
        triggerSummary: "Every weekday at 09:00",
        status: AutomationRunStatus.COMPLETED,
        whenLabel: "1h ago",
        conversationId: "example-conv-slack-standup",
      },
    },
    {
      id: "linear-triage-assistant",
      labelKey: I18nKey.FEATURED_AUTOMATIONS$RECOMMENDED_LINEAR_TRIAGE,
      Icon: ClipboardList,
      iconColor: "#FB923C",
      href: "/automations",
      demoActivity: {
        name: "Linear Triage Assistant",
        triggerSummary: "On Linear issue created",
        status: AutomationRunStatus.PENDING,
        whenLabel: "Queued",
        conversationId: null,
      },
    },
  ];

export function getRecommendedAutomationCardById(
  id: string,
): RecommendedAutomationCard | undefined {
  return HOME_RECOMMENDED_AUTOMATION_CARDS.find((card) => card.id === id);
}
