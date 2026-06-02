import type {
  WorkspaceItem,
  WorkspaceParentItem,
} from "@openhands/typescript-client/clients";

export const SCREENSHOT_WORKSPACES: WorkspaceItem[] = [
  {
    id: "ws-platform-api",
    name: "platform-api",
    path: "/workspace/project/platform-api",
  },
  {
    id: "ws-payments-service",
    name: "payments-service",
    path: "/workspace/project/payments-service",
  },
  {
    id: "ws-docs",
    name: "docs",
    path: "/workspace/project/docs",
  },
];

export const SCREENSHOT_WORKSPACE_PARENTS: WorkspaceParentItem[] = [
  {
    id: "wp-project",
    name: "project",
    path: "/workspace/project",
  },
];
