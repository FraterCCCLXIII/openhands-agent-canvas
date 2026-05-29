// Data model for the Workbench kanban board. The board is backed by real
// agent-server conversations (mapped in `conversation-mapper.ts`); these
// shapes are the UI's view of a conversation grouped by execution status.

export type WorkbenchColumnIcon =
  | "in-progress"
  | "waiting"
  | "done"
  | "failed"
  | "archived";

export type WorkbenchCardSource = "pr" | "task" | "automation";

export interface WorkbenchCard {
  /** Conversation id — used for navigation. */
  id: string;
  /** PR number when the conversation is tied to a pull request. */
  number?: number;
  title: string;
  /** Repository the card belongs to, or `"No Repository"`. */
  repo: string;
  sourceType: WorkbenchCardSource;
  /** Model driving the conversation, when known. */
  model?: string | null;
  /** Short "what the agent is doing right now" line, if active. */
  activity?: string;
  branch: string;
  baseBranch: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkbenchColumn {
  id: string;
  title: string;
  icon: WorkbenchColumnIcon;
  cards: WorkbenchCard[];
}

/** The `repo` sentinel that means "not associated with a repository". */
export const NO_REPOSITORY = "No Repository";

/** The `activeRepo` sentinel that means "show every repository". */
export const ALL_REPOSITORIES = "all";
