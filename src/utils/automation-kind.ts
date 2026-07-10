import type { Automation } from "#/types/automation";

export type AutomationKind = "workflow" | "routine" | "responder";

const RESPONDER_EVENT_SOURCES = new Set(["slack"]);

/**
 * Classifies a saved automation for dashboard grouping and recent-activity labels.
 * Routines are schedule-driven; responders are always-on chat integrations;
 * workflows are other event-driven when/then SDLC automations.
 */
export function getAutomationKind(automation: Automation): AutomationKind {
  if (automation.trigger.type !== "event") {
    return "routine";
  }

  const source = automation.trigger.source?.toLowerCase();
  if (source && RESPONDER_EVENT_SOURCES.has(source)) {
    return "responder";
  }

  return "workflow";
}

export function groupAutomationsByKind(automations: Automation[]) {
  const groups: Record<AutomationKind, Automation[]> = {
    workflow: [],
    routine: [],
    responder: [],
  };

  for (const automation of automations) {
    groups[getAutomationKind(automation)].push(automation);
  }

  return groups;
}
