import type { LoopDefinition, LoopsResponse } from "#/types/loop";
import { loopStateFilePath } from "#/constants/loop-api";

const morningTriageId = "loop-morning-triage-demo";

export const MOCK_LOOPS_RESPONSE: LoopsResponse = {
  total: 1,
  loops: [
    {
      id: morningTriageId,
      name: "Morning triage",
      description:
        "Discover CI failures, open issues, and recent commits; write findings to state.",
      templateId: "morning-triage",
      enabled: true,
      trigger: {
        type: "schedule",
        schedule: "0 6 * * *",
        schedule_human: "Daily at 06:00",
      },
      discovery: {
        skillId: "morning-triage",
        sources: ["ci", "issues", "commits", "state_file"],
        stateFilePath: loopStateFilePath(morningTriageId),
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
        stateFilePath: loopStateFilePath(morningTriageId),
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
      created_at: "2026-06-20T06:00:00.000Z",
      updated_at: "2026-06-24T06:00:00.000Z",
      last_triggered_at: "2026-06-25T06:00:00.000Z",
      inbox_count: 2,
    },
  ],
};

export function cloneMockLoop(loop: LoopDefinition): LoopDefinition {
  return structuredClone(loop);
}
