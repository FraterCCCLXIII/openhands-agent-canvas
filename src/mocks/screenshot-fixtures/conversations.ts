import type { DirectConversationInfo } from "#/api/agent-server-adapter";
import type { OpenHandsEvent } from "#/types/agent-server/core";
import { SecurityRisk } from "#/types/agent-server/core";

type ScreenshotConversation = DirectConversationInfo & {
  selected_repository?: string | null;
  selected_branch?: string | null;
  git_provider?: string | null;
};

const now = Date.now();
const hoursAgo = (hours: number) =>
  new Date(now - hours * 3_600_000).toISOString();
const daysAgo = (days: number) =>
  new Date(now - days * 86_400_000).toISOString();

export const SCREENSHOT_CONVERSATIONS: ScreenshotConversation[] = [
  {
    id: "1",
    title: "Authentication module refactor",
    created_at: hoursAgo(2),
    updated_at: hoursAgo(0),
    execution_status: "waiting_for_confirmation",
    selected_repository: "acme/platform-api",
    selected_branch: "feature/auth-refactor",
    git_provider: "github",
    workspace: { working_dir: "/workspace/project/platform-api" },
  },
  {
    id: "2",
    title: "Payment API integration",
    created_at: daysAgo(1),
    updated_at: hoursAgo(6),
    execution_status: "running",
    selected_repository: "acme/payments-service",
    selected_branch: "main",
    git_provider: "github",
    workspace: { working_dir: "/workspace/project/payments-service" },
  },
  {
    id: "3",
    title: "Mobile onboarding flow",
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
    execution_status: "idle",
    selected_repository: "acme/mobile-app",
    selected_branch: "develop",
    git_provider: "github",
  },
  {
    id: "4",
    title: "Q3 platform migration",
    created_at: daysAgo(14),
    updated_at: daysAgo(10),
    execution_status: "idle",
    sandbox_status: "MISSING",
    selected_repository: "acme/legacy-platform",
    git_provider: "github",
  },
  {
    id: "6",
    title: "Documentation site update",
    created_at: daysAgo(2),
    updated_at: hoursAgo(18),
    execution_status: "idle",
    selected_repository: "acme/docs",
    selected_branch: "main",
    git_provider: "github",
  },
];

const ts = (offsetSeconds: number) =>
  new Date(Date.UTC(2026, 5, 1, 14, 0, offsetSeconds)).toISOString();

export const SCREENSHOT_CONVERSATION_EVENTS: Record<string, OpenHandsEvent[]> =
  {
    "1": [
      {
        id: "evt-user-1",
        timestamp: ts(0),
        source: "user",
        llm_message: {
          role: "user",
          content: [
            {
              type: "text",
              text: "Refactor the authentication module to use short-lived JWT access tokens with refresh token rotation. Keep backward compatibility for existing API clients.",
            },
          ],
        },
        activated_microagents: [],
        extended_content: [],
      },
      {
        id: "evt-think-1",
        timestamp: ts(5),
        source: "agent",
        thought: [],
        thinking_blocks: [],
        reasoning_content:
          "I'll start by mapping the current auth flow, then identify token issuance, validation, and session storage touchpoints before proposing incremental changes.",
        action: {
          kind: "ThinkAction",
          thought:
            "Review the existing session middleware and token utilities before editing handlers.",
        },
        tool_name: "think",
        tool_call_id: "call_think_1",
        tool_call: {
          id: "call_think_1",
          type: "function",
          function: {
            name: "think",
            arguments: JSON.stringify({
              thought:
                "Review the existing session middleware and token utilities before editing handlers.",
            }),
          },
        },
        llm_response_id: "resp_1",
        security_risk: SecurityRisk.UNKNOWN,
      },
      {
        id: "evt-bash-1",
        timestamp: ts(12),
        source: "agent",
        thought: [
          {
            type: "text",
            text: "Listing auth-related files in the repository.",
          },
        ],
        thinking_blocks: [],
        action: {
          kind: "ExecuteBashAction",
          command: "find src/auth -type f | head -20",
          is_input: false,
          timeout: null,
          reset: false,
        },
        tool_name: "execute_bash",
        tool_call_id: "call_bash_1",
        tool_call: {
          id: "call_bash_1",
          type: "function",
          function: {
            name: "execute_bash",
            arguments: JSON.stringify({
              command: "find src/auth -type f | head -20",
            }),
          },
        },
        llm_response_id: "resp_2",
        security_risk: SecurityRisk.UNKNOWN,
      },
      {
        id: "evt-bash-obs-1",
        timestamp: ts(14),
        source: "environment",
        tool_name: "execute_bash",
        tool_call_id: "call_bash_1",
        action_id: "evt-bash-1",
        observation: {
          kind: "ExecuteBashObservation",
          content: [
            {
              type: "text",
              text: "src/auth/middleware.ts\nsrc/auth/jwt.ts\nsrc/auth/refresh.ts\nsrc/auth/session-store.ts\nsrc/auth/routes/login.ts\nsrc/auth/routes/refresh.ts",
            },
          ],
          command: "find src/auth -type f | head -20",
          exit_code: 0,
          error: false,
          timeout: false,
          metadata: {} as never,
        },
      },
      {
        id: "evt-msg-1",
        timestamp: ts(22),
        source: "agent",
        llm_message: {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "I found the core auth files. Next I'll update `jwt.ts` for 15-minute access tokens, add refresh rotation in `refresh.ts`, and wire the new flow through the login routes while preserving the legacy bearer header path.",
            },
          ],
        },
        activated_microagents: [],
        extended_content: [],
      },
    ],
    "2": [
      {
        id: "evt-user-2",
        timestamp: ts(0),
        source: "user",
        llm_message: {
          role: "user",
          content: [
            {
              type: "text",
              text: "Add Stripe webhook handling for subscription lifecycle events.",
            },
          ],
        },
        activated_microagents: [],
        extended_content: [],
      },
    ],
  };
