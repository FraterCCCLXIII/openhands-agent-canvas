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
  /**
   * Runtime coordinates used for on-demand git/diff fetches (e.g. the card's
   * diff stat). Absent for placeholder cards.
   */
  conversationUrl?: string | null;
  sessionApiKey?: string | null;
  workingDir?: string | null;
  /**
   * The conversation's selected repository (e.g. `owner/repo`), if any. Needed
   * alongside `workingDir` so the diff stat resolves the same git path the
   * conversation page uses — when `workingDir` is absent the path is derived
   * from the repo name.
   */
  selectedRepository?: string | null;
  /**
   * Optimistic placeholder shown immediately after a task is created, before
   * the real conversation surfaces in the refetched list. Rendered as a
   * skeleton and not interactive.
   */
  isPlaceholder?: boolean;
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
