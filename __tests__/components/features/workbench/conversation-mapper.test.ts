import { describe, it, expect } from "vitest";
import {
  buildColumnsFromConversations,
  collectRepositories,
  collectRepositoryProviders,
  conversationToCard,
  executionStatusToColumnId,
  repoFromConversation,
} from "#/components/features/workbench/conversation-mapper";
import { NO_REPOSITORY } from "#/components/features/workbench/types";
import { ExecutionStatus } from "#/types/agent-server/core/base/common";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";

// The mapper only ever calls `t` with a fallback key, so an identity stub is
// enough to keep these tests free of an i18n provider.
const t = ((key: string) => key) as unknown as Parameters<
  typeof conversationToCard
>[0];

function conversation(
  overrides: Partial<AppConversation> = {},
): AppConversation {
  return {
    id: "c1",
    created_by_user_id: null,
    selected_repository: null,
    selected_branch: null,
    git_provider: null,
    title: "Title",
    trigger: "gui",
    pr_number: [],
    llm_model: "anthropic/claude",
    metrics: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    execution_status: ExecutionStatus.RUNNING,
    conversation_url: null,
    session_api_key: null,
    sandbox_id: null,
    sub_conversation_ids: [],
    ...overrides,
  };
}

describe("executionStatusToColumnId", () => {
  it.each([
    [ExecutionStatus.RUNNING, "in-progress"],
    [ExecutionStatus.IDLE, "waiting"],
    [ExecutionStatus.PAUSED, "waiting"],
    [ExecutionStatus.WAITING_FOR_CONFIRMATION, "waiting"],
    [ExecutionStatus.FINISHED, "done"],
    [ExecutionStatus.ERROR, "failed"],
    [ExecutionStatus.STUCK, "failed"],
  ])("maps %s to the %s column", (status, columnId) => {
    expect(executionStatusToColumnId(status)).toBe(columnId);
  });

  it("falls back to waiting for a null status", () => {
    expect(executionStatusToColumnId(null)).toBe("waiting");
  });
});

describe("repoFromConversation", () => {
  it("prefers the selected repository", () => {
    expect(
      repoFromConversation(conversation({ selected_repository: "owner/repo" })),
    ).toBe("owner/repo");
  });

  it("falls back to the attached workspace basename", () => {
    expect(
      repoFromConversation(
        conversation({ selected_workspace: "/Users/me/code/app" }),
      ),
    ).toBe("app");
  });

  it("ignores the per-conversation worktree dir", () => {
    expect(
      repoFromConversation(
        conversation({
          workspace: { working_dir: "/workspace/project/abc123" },
        }),
      ),
    ).toBe(NO_REPOSITORY);
  });

  it("falls back to NO_REPOSITORY", () => {
    expect(repoFromConversation(conversation())).toBe(NO_REPOSITORY);
  });
});

describe("conversationToCard", () => {
  it("marks PR-backed conversations as a pr source with the PR number", () => {
    const card = conversationToCard(t, conversation({ pr_number: [42] }));
    expect(card.sourceType).toBe("pr");
    expect(card.number).toBe(42);
  });

  it("marks resolver conversations as automations", () => {
    const card = conversationToCard(t, conversation({ trigger: "resolver" }));
    expect(card.sourceType).toBe("automation");
  });

  it("defaults to a task source", () => {
    expect(conversationToCard(t, conversation()).sourceType).toBe("task");
  });
});

describe("buildColumnsFromConversations", () => {
  it("buckets conversations by status and sorts newest first", () => {
    const columns = buildColumnsFromConversations(t, [
      conversation({
        id: "old",
        execution_status: ExecutionStatus.RUNNING,
        updated_at: "2026-01-01T00:00:00.000Z",
      }),
      conversation({
        id: "new",
        execution_status: ExecutionStatus.RUNNING,
        updated_at: "2026-01-03T00:00:00.000Z",
      }),
      conversation({ id: "done", execution_status: ExecutionStatus.FINISHED }),
    ]);
    const inProgress = columns.find((c) => c.id === "in-progress")!;
    const done = columns.find((c) => c.id === "done")!;
    expect(inProgress.cards.map((c) => c.id)).toEqual(["new", "old"]);
    expect(done.cards.map((c) => c.id)).toEqual(["done"]);
  });

  it("routes archived ids to the Archived column regardless of status", () => {
    const columns = buildColumnsFromConversations(
      t,
      [
        conversation({ id: "a", execution_status: ExecutionStatus.RUNNING }),
        conversation({ id: "b", execution_status: ExecutionStatus.FINISHED }),
      ],
      new Set(["a"]),
    );
    const inProgress = columns.find((c) => c.id === "in-progress")!;
    const archived = columns.find((c) => c.id === "archived")!;
    expect(inProgress.cards.map((c) => c.id)).toEqual([]);
    expect(archived.cards.map((c) => c.id)).toEqual(["a"]);
  });
});

describe("collectRepositories / collectRepositoryProviders", () => {
  it("returns the distinct repositories across columns", () => {
    const columns = buildColumnsFromConversations(t, [
      conversation({ id: "a", selected_repository: "owner/one" }),
      conversation({ id: "b", selected_repository: "owner/two" }),
      conversation({ id: "c", selected_repository: "owner/one" }),
    ]);
    expect(collectRepositories(columns).sort()).toEqual([
      "owner/one",
      "owner/two",
    ]);
  });

  it("maps repositories to their git provider", () => {
    const providers = collectRepositoryProviders([
      conversation({
        selected_repository: "owner/repo",
        git_provider: "github",
      }),
      conversation({ selected_repository: "owner/no-provider" }),
    ]);
    expect(providers.get("owner/repo")).toBe("github");
    expect(providers.has("owner/no-provider")).toBe(false);
  });
});
