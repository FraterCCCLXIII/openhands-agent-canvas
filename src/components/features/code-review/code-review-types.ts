export type CodeReviewPrRole = "author" | "assignee" | "reviewer";

export type CodeReviewPrStatusTone = "on" | "warn" | "off" | "err";

export type CodeReviewChecksStatus = "passing" | "failing" | "pending" | "none";

export type CodeReviewReviewFlavorId =
  | "static"
  | "runtime"
  | "quality"
  | "critic";

export type CodeReviewPrRow = {
  id: string;
  number: number;
  repo: string;
  title: string;
  role: CodeReviewPrRole;
  meta: string;
  statusTone: CodeReviewPrStatusTone;
  /** When set, the row shows a reconnect affordance instead of actions. */
  connectionError?: boolean;
  filesChanged?: number;
  additions?: number;
  deletions?: number;
  author?: string;
  isDraft?: boolean;
  headBranch?: string;
  baseBranch?: string;
  reviewers?: string[];
  commentCount?: number;
  checksStatus?: CodeReviewChecksStatus;
  /** Plain-text PR body for the drawer summary (fixture / future API). */
  description?: string;
};

export type CodeReviewConnectedRepo = {
  id: string;
  label: string;
  errored?: boolean;
};

export type CodeReviewIssueRow = {
  id: string;
  number: number;
  repo: string;
  title: string;
  role: CodeReviewPrRole;
  meta: string;
  statusTone: CodeReviewPrStatusTone;
  /** Linked PR number when the issue is referenced by an open PR. */
  linkedPrNumber?: number;
  author?: string;
  labels?: string[];
  assignees?: string[];
  commentCount?: number;
  /** Plain-text issue body for the drawer summary (fixture / future API). */
  description?: string;
};

export type CodeReviewHookRule = {
  id: string;
  event: string;
  rule: string;
  active: boolean;
};

export type CodeReviewSampleComment = {
  id: string;
  location: string;
  body: string;
};

export type CodeReviewReviewFlavor = {
  id: CodeReviewReviewFlavorId;
  skillHint: string;
  requiresGitHub: boolean;
  isVerificationCrossLink?: boolean;
};
