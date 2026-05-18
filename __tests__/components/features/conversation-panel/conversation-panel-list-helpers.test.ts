import { describe, expect, it } from "vitest";
import {
  groupConversations,
  sortConversationsByField,
} from "#/components/features/conversation-panel/conversation-panel-list-helpers";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";
import { ExecutionStatus } from "#/types/agent-server/core";

const base: Omit<AppConversation, "id" | "title" | "workspace"> = {
  selected_repository: null,
  selected_branch: null,
  git_provider: null,
  updated_at: "2024-01-02T00:00:00.000Z",
  created_at: "2024-01-01T00:00:00.000Z",
  execution_status: ExecutionStatus.FINISHED,
  conversation_url: null,
  created_by_user_id: null,
  metrics: null,
  llm_model: null,
  trigger: null,
  pr_number: [],
  session_api_key: null,
  sandbox_id: null,
  sub_conversation_ids: [],
};

describe("conversation-panel-list-helpers", () => {
  it("sorts by updated desc", () => {
    const a: AppConversation = {
      ...base,
      id: "a",
      title: "a",
      updated_at: "2024-01-01T00:00:00.000Z",
      created_at: "2024-01-01T00:00:00.000Z",
    };
    const b: AppConversation = {
      ...base,
      id: "b",
      title: "b",
      updated_at: "2024-01-03T00:00:00.000Z",
      created_at: "2024-01-01T00:00:00.000Z",
    };
    expect(
      sortConversationsByField([a, b], "updated").map((c) => c.id),
    ).toEqual(["b", "a"]);
  });

  it("groups local conversations by selected_workspace, collapsing per-conversation worktree paths", () => {
    // Two conversations launched against the same workspace but with
    // different per-conversation worktree dirs (the agent-server runs
    // with worktree: true). They must end up in a single group keyed
    // off the user-selected workspace, not split by the worktree dir.
    const sameWsA: AppConversation = {
      ...base,
      id: "1",
      title: "one",
      selected_workspace: "/workspace/agent-server-gui",
      workspace: { working_dir: "/workspace/agent-server-gui/wt-abc" },
      updated_at: "2024-01-02T00:00:00.000Z",
    };
    const sameWsB: AppConversation = {
      ...base,
      id: "2",
      title: "two",
      selected_workspace: "/workspace/agent-server-gui",
      workspace: { working_dir: "/workspace/agent-server-gui/wt-def" },
      updated_at: "2024-01-04T00:00:00.000Z",
    };
    // Different workspace — its own group.
    const otherWs: AppConversation = {
      ...base,
      id: "3",
      title: "three",
      selected_workspace: "/workspace/other",
      workspace: { working_dir: "/workspace/other/wt-xyz" },
      updated_at: "2024-01-03T00:00:00.000Z",
    };
    // No user-selected workspace — must bucket under "No workspace"
    // even though working_dir is set (to a per-conversation default).
    const none: AppConversation = {
      ...base,
      id: "4",
      title: "four",
      selected_workspace: null,
      workspace: { working_dir: "/workspace/project/agent-canvas/wt-noop" },
      updated_at: "2024-01-01T00:00:00.000Z",
    };

    const groups = groupConversations(
      [sameWsA, sameWsB, otherWs, none],
      "local",
      "updated",
      { emptyWorkspace: "No workspace", emptyRepository: "No repository" },
    );

    expect(
      groups.map((g) => ({
        id: g.id,
        label: g.label,
        ids: g.conversations.map((c) => c.id),
        launch: g.launch,
      })),
    ).toEqual([
      {
        id: "ws:/workspace/agent-server-gui",
        label: "agent-server-gui",
        ids: ["2", "1"],
        launch: { workingDir: "/workspace/agent-server-gui" },
      },
      {
        id: "ws:/workspace/other",
        label: "other",
        ids: ["3"],
        launch: { workingDir: "/workspace/other" },
      },
      {
        id: "__none_workspace",
        label: "No workspace",
        ids: ["4"],
        launch: {},
      },
    ]);
  });

  it("groups cloud conversations by repository string", () => {
    const r1: AppConversation = {
      ...base,
      id: "1",
      title: "one",
      selected_repository: "org/agent-canvas",
      updated_at: "2024-01-02T00:00:00.000Z",
    };
    const r2: AppConversation = {
      ...base,
      id: "2",
      title: "two",
      selected_repository: "org/sdk",
      updated_at: "2024-01-03T00:00:00.000Z",
    };

    const groups = groupConversations([r1, r2], "cloud", "updated", {
      emptyWorkspace: "No workspace",
      emptyRepository: "No repository",
    });

    expect(groups.map((g) => g.label)).toEqual(["sdk", "agent-canvas"]);
    expect(groups[0].launch).toEqual({
      repository: {
        name: "org/sdk",
        gitProvider: "github",
        branch: "main",
      },
    });
    expect(groups[1].launch).toEqual({
      repository: {
        name: "org/agent-canvas",
        gitProvider: "github",
        branch: "main",
      },
    });
  });
});
