import { loopStateFilePath } from "#/constants/loop-api";
import type { LoopDefinition } from "#/types/loop";

export interface LoopTemplate {
  id: string;
  nameKey: string;
  descriptionKey: string;
  /** Default loop name when creating from template. */
  defaultName: string;
  /** Phase label shown in UI (e.g. "Phase 1 — discovery only"). */
  phaseLabelKey: string;
  buildDefinition: (overrides?: {
    name?: string;
  }) => Omit<
    LoopDefinition,
    "id" | "created_at" | "updated_at" | "last_triggered_at" | "inbox_count"
  >;
}

const MORNING_TRIAGE_TEMPLATE_ID = "morning-triage";

function buildMorningTriageDefinition(overrides?: {
  name?: string;
}): Omit<
  LoopDefinition,
  "id" | "created_at" | "updated_at" | "last_triggered_at" | "inbox_count"
> {
  const statePath = loopStateFilePath(MORNING_TRIAGE_TEMPLATE_ID);
  return {
    name: overrides?.name ?? "Morning triage",
    description:
      "Discover CI failures, open issues, and recent commits; write actionable findings to a state file.",
    templateId: MORNING_TRIAGE_TEMPLATE_ID,
    enabled: false,
    trigger: {
      type: "schedule",
      schedule: "0 6 * * *",
      schedule_human: "Daily at 06:00",
    },
    discovery: {
      skillId: "morning-triage",
      sources: ["ci", "issues", "commits", "state_file"],
      stateFilePath: statePath,
    },
    handoff: {
      isolation: "worktree",
      maxParallel: 3,
      generatorAgentProfile: null,
    },
    verification: {
      evaluatorAgentProfile: "loop-evaluator",
      stopCondition: "all targeted tests pass and lint is clean",
      maxRetriesPerItem: 2,
      verifyByActing: true,
    },
    persistence: {
      stateFilePath: statePath,
      commitStateToRepo: true,
      inboxPath: ".openhands/loops/inbox/",
    },
    safety: {
      tokenBudgetPerRun: 50_000,
      tokenBudgetDaily: 200_000,
      humanReviewRequired: true,
    },
    moves: {
      discovery: true,
      handoff: true,
      verification: true,
      persistence: true,
      scheduling: true,
    },
  };
}

export const LOOP_TEMPLATES: LoopTemplate[] = [
  {
    id: MORNING_TRIAGE_TEMPLATE_ID,
    nameKey: "LOOPS$TEMPLATE_MORNING_TRIAGE_NAME",
    descriptionKey: "LOOPS$TEMPLATE_MORNING_TRIAGE_DESCRIPTION",
    defaultName: "Morning triage",
    phaseLabelKey: "LOOPS$TEMPLATE_MORNING_TRIAGE_PHASE",
    buildDefinition: buildMorningTriageDefinition,
  },
];

export function getLoopTemplateById(id: string): LoopTemplate | undefined {
  return LOOP_TEMPLATES.find((template) => template.id === id);
}
