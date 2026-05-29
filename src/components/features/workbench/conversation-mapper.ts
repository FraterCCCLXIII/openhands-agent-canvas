import type { TFunction } from "i18next";
import { I18nKey } from "#/i18n/declaration";
import { ExecutionStatus } from "#/types/agent-server/core/base/common";
import type { Provider } from "#/types/settings";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";
import {
  NO_REPOSITORY,
  type WorkbenchCard,
  type WorkbenchColumn,
  type WorkbenchColumnIcon,
} from "./types";

interface ColumnDef {
  id: string;
  icon: WorkbenchColumnIcon;
  titleKey: I18nKey;
  statuses: ExecutionStatus[];
}

// Maps each status column to the agent execution statuses it collects. The
// `waiting` column is the fallback bucket for unknown/`null` statuses.
const STATUS_COLUMN_DEFS: ColumnDef[] = [
  {
    id: "in-progress",
    icon: "in-progress",
    titleKey: I18nKey.WORKBENCH$COLUMN_IN_PROGRESS,
    statuses: [ExecutionStatus.RUNNING],
  },
  {
    id: "waiting",
    icon: "waiting",
    titleKey: I18nKey.WORKBENCH$COLUMN_WAITING,
    statuses: [
      ExecutionStatus.IDLE,
      ExecutionStatus.PAUSED,
      ExecutionStatus.WAITING_FOR_CONFIRMATION,
    ],
  },
  {
    id: "done",
    icon: "done",
    titleKey: I18nKey.WORKBENCH$COLUMN_DONE,
    statuses: [ExecutionStatus.FINISHED],
  },
  {
    id: "failed",
    icon: "failed",
    titleKey: I18nKey.WORKBENCH$COLUMN_FAILED,
    statuses: [ExecutionStatus.ERROR, ExecutionStatus.STUCK],
  },
];

const ARCHIVED_COLUMN_ID = "archived";

// The Archived column is not status-driven — cards land here only when the
// user explicitly archives them, so it stays out of status routing.
const ARCHIVED_COLUMN_DEF: ColumnDef = {
  id: ARCHIVED_COLUMN_ID,
  icon: "archived",
  titleKey: I18nKey.WORKBENCH$COLUMN_ARCHIVED,
  statuses: [],
};

// Full ordered column set rendered by the board.
const COLUMN_DEFS: ColumnDef[] = [...STATUS_COLUMN_DEFS, ARCHIVED_COLUMN_DEF];

const FALLBACK_COLUMN_ID = "waiting";
const IN_PROGRESS_COLUMN_ID = "in-progress";

/** Column id a conversation belongs to, based on its execution status. */
export function executionStatusToColumnId(
  status: ExecutionStatus | null | undefined,
): string {
  if (!status) return FALLBACK_COLUMN_ID;
  const def = STATUS_COLUMN_DEFS.find((column) =>
    column.statuses.includes(status),
  );
  return def?.id ?? FALLBACK_COLUMN_ID;
}

/** Last path segment of a path, or `null` when not derivable. */
function basename(path: string | null | undefined): string | null {
  const trimmed = path?.trim().replace(/\/+$/, "");
  if (!trimmed) return null;
  const segments = trimmed.split("/").filter(Boolean);
  return segments.at(-1) ?? null;
}

/**
 * Grouping key for a conversation:
 * - cloud: the selected repository (`owner/repo`)
 * - local: the user-attached workspace's basename
 * - otherwise the `NO_REPOSITORY` catchall.
 *
 * Intentionally ignores `workspace.working_dir` — that is the per-conversation
 * worktree the agent-server creates (basename === conversation id), which would
 * fragment the rail into one entry per conversation.
 */
export function repoFromConversation(conversation: AppConversation): string {
  return (
    conversation.selected_repository ||
    basename(conversation.selected_workspace) ||
    NO_REPOSITORY
  );
}

/** Map a single conversation onto the card shape rendered by the board. */
export function conversationToCard(
  t: TFunction,
  conversation: AppConversation,
): WorkbenchCard {
  const hasPr =
    Array.isArray(conversation.pr_number) && conversation.pr_number.length > 0;
  const sourceType = hasPr
    ? "pr"
    : conversation.trigger === "resolver"
      ? "automation"
      : "task";

  const isRunning = conversation.execution_status === ExecutionStatus.RUNNING;

  return {
    id: conversation.id,
    number: hasPr ? conversation.pr_number[0] : undefined,
    title: conversation.title?.trim() || t(I18nKey.WORKBENCH$UNTITLED),
    repo: repoFromConversation(conversation),
    sourceType,
    model: conversation.llm_model,
    // The list payload has no live action text; show a generic working line
    // for running conversations so the card reads as active.
    activity: isRunning ? t(I18nKey.WORKBENCH$AGENT_WORKING) : undefined,
    branch: conversation.selected_branch ?? "main",
    baseBranch: "main",
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    conversationUrl: conversation.conversation_url,
    sessionApiKey: conversation.session_api_key,
    workingDir: conversation.workspace?.working_dir ?? null,
    selectedRepository: conversation.selected_repository,
  };
}

/**
 * Build the board columns from a flat list of conversations (newest first).
 * Conversations whose id is in `archivedIds` are routed to the Archived column
 * regardless of their execution status.
 */
export function buildColumnsFromConversations(
  t: TFunction,
  conversations: AppConversation[],
  archivedIds: ReadonlySet<string> = new Set(),
): WorkbenchColumn[] {
  const columns: WorkbenchColumn[] = COLUMN_DEFS.map((def) => ({
    id: def.id,
    title: t(def.titleKey),
    icon: def.icon,
    cards: [],
  }));
  const columnsById = new Map(columns.map((column) => [column.id, column]));

  conversations.forEach((conversation) => {
    const columnId = archivedIds.has(conversation.id)
      ? ARCHIVED_COLUMN_ID
      : executionStatusToColumnId(conversation.execution_status);
    columnsById.get(columnId)?.cards.push(conversationToCard(t, conversation));
  });

  columns.forEach((column) => {
    column.cards.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  });

  return columns;
}

/** Distinct repositories referenced by any column's cards. */
export function collectRepositories(columns: WorkbenchColumn[]): string[] {
  const repos = new Set<string>();
  columns.forEach((column) =>
    column.cards.forEach((card) => repos.add(card.repo)),
  );
  return Array.from(repos);
}

/**
 * Map of repository name -> git provider, for conversations that carry one.
 * Used to start a new conversation against a known repository.
 */
export function collectRepositoryProviders(
  conversations: AppConversation[],
): Map<string, Provider> {
  const providers = new Map<string, Provider>();
  conversations.forEach((conversation) => {
    if (conversation.selected_repository && conversation.git_provider) {
      providers.set(
        conversation.selected_repository,
        conversation.git_provider,
      );
    }
  });
  return providers;
}

export { IN_PROGRESS_COLUMN_ID, ARCHIVED_COLUMN_ID };
