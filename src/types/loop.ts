import type { AutomationTrigger } from "#/types/automation";

/** Sources the discovery skill may read each turn. */
export type LoopDiscoverySource = "ci" | "issues" | "commits" | "state_file";

export type LoopHandoffIsolation = "worktree" | "sandbox" | "shared";

export enum LoopRunStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  AWAITING_REVIEW = "AWAITING_REVIEW",
}

export interface LoopDiscoveryConfig {
  skillId: string;
  sources: LoopDiscoverySource[];
  stateFilePath: string;
}

export interface LoopHandoffConfig {
  isolation: LoopHandoffIsolation;
  maxParallel: number;
  generatorAgentProfile?: string | null;
}

export interface LoopVerificationConfig {
  evaluatorAgentProfile?: string | null;
  stopCondition: string;
  maxRetriesPerItem: number;
  verifyByActing?: boolean;
}

export interface LoopPersistenceConfig {
  stateFilePath: string;
  commitStateToRepo: boolean;
  inboxPath?: string;
}

export interface LoopSafetyConfig {
  tokenBudgetPerRun?: number | null;
  tokenBudgetDaily?: number | null;
  humanReviewRequired: boolean;
}

/** Which of the five loop moves are configured for this definition. */
export interface LoopMovesChecklist {
  discovery: boolean;
  handoff: boolean;
  verification: boolean;
  persistence: boolean;
  scheduling: boolean;
}

export interface LoopDefinition {
  id: string;
  name: string;
  description?: string;
  templateId?: string | null;
  enabled: boolean;
  trigger: AutomationTrigger;
  discovery: LoopDiscoveryConfig;
  handoff: LoopHandoffConfig;
  verification: LoopVerificationConfig;
  persistence: LoopPersistenceConfig;
  safety: LoopSafetyConfig;
  moves: LoopMovesChecklist;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string | null;
  inbox_count?: number;
}

export interface LoopsResponse {
  loops: LoopDefinition[];
  total: number;
}

export interface LoopRun {
  id: string;
  loop_id: string;
  status: LoopRunStatus;
  turn_number: number;
  findings_count: number;
  inbox_count: number;
  state_file_path: string | null;
  error_detail: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface LoopRunsResponse {
  runs: LoopRun[];
  total: number;
}

export function deriveLoopMovesChecklist(
  loop: LoopDefinition,
): LoopMovesChecklist {
  return {
    discovery: Boolean(
      loop.discovery.skillId && loop.discovery.sources.length > 0,
    ),
    handoff:
      loop.handoff.isolation === "worktree" && loop.handoff.maxParallel >= 1,
    verification: Boolean(
      loop.verification.evaluatorAgentProfile &&
      loop.verification.stopCondition.trim(),
    ),
    persistence: Boolean(loop.persistence.stateFilePath.trim()),
    scheduling: Boolean(
      loop.trigger.schedule ||
      loop.trigger.type === "event" ||
      loop.trigger.type === "cron" ||
      loop.trigger.type === "schedule",
    ),
  };
}
