import type {
  CodeReviewConnectedRepo,
  CodeReviewHookRule,
  CodeReviewIssueRow,
  CodeReviewPrRow,
  CodeReviewReviewFlavor,
  CodeReviewSampleComment,
} from "./code-review-types";

/**
 * UI-first fixture data aligned to the #1691 mockup frames.
 * Replace with live host APIs when F3 lands.
 */
export const CODE_REVIEW_MOCK_REPOS: CodeReviewConnectedRepo[] = [
  { id: "agent-canvas", label: "openhands/agent-canvas" },
  { id: "extensions", label: "openhands/extensions" },
  { id: "legacy", label: "acme-corp/legacy", errored: true },
];

export const CODE_REVIEW_MOCK_PRS: CodeReviewPrRow[] = [
  {
    id: "pr-1651",
    number: 1651,
    repo: "openhands/agent-canvas",
    title: "feat: commits view with per-commit diffs",
    role: "reviewer",
    meta: "2h ago",
    statusTone: "warn",
    filesChanged: 14,
    additions: 412,
    deletions: 88,
    author: "DevinVinson",
    headBranch: "feat/commits-view-diffs",
    baseBranch: "main",
    reviewers: ["paulbloch"],
    commentCount: 4,
    checksStatus: "pending",
    description:
      "Adds a commits rail and per-commit diff viewer so reviewers can step through history without leaving the Files tab.\n\nWhy\nHelps reviewers isolate which commit introduced a regression.\n\nSummary\n- Commits list beside the Files rail\n- Selecting a commit scopes the diff panel\n- Empty / binary file placeholders",
  },
  {
    id: "pr-2102",
    number: 2102,
    repo: "openhands/extensions",
    title: "wip: scaffold the marketplace entry for pr-review",
    role: "author",
    meta: "draft · 3h ago",
    statusTone: "off",
    filesChanged: 6,
    additions: 188,
    deletions: 12,
    author: "openhands-bot",
    isDraft: true,
    headBranch: "wip/pr-review-marketplace",
    baseBranch: "main",
    reviewers: [],
    commentCount: 1,
    checksStatus: "none",
    description:
      "Scaffold only — wires the marketplace card shell for the PR review skill pack. No runtime launch yet.",
  },
  {
    id: "pr-485",
    number: 485,
    repo: "openhands/agent-canvas",
    title: "feat: render critic results in conversation events",
    role: "assignee",
    meta: "CI failing · 5h ago",
    statusTone: "err",
    filesChanged: 9,
    additions: 276,
    deletions: 41,
    author: "enyst",
    headBranch: "feat/critic-events",
    baseBranch: "main",
    reviewers: ["DevinVinson", "paulbloch"],
    commentCount: 7,
    checksStatus: "failing",
    description:
      "Surfaces Critic / Verification findings as first-class conversation events instead of burying them in tool output.\n\nHow to test\n1. Enable Verification in settings\n2. Run a conversation that triggers Critic\n3. Confirm the event card renders in chat",
  },
  {
    id: "pr-106",
    number: 106,
    repo: "openhands/extensions",
    title: "PR reviewer only loads repo-root AGENTS.md",
    role: "author",
    meta: "approved · ready to merge · 2 days ago",
    statusTone: "on",
    filesChanged: 3,
    additions: 54,
    deletions: 9,
    author: "rbren",
    headBranch: "fix/agents-md-nested",
    baseBranch: "main",
    reviewers: ["enyst"],
    commentCount: 2,
    checksStatus: "passing",
    description:
      "Walks parent directories for AGENTS.md so nested packages pick up project guidance during PR review.",
  },
  {
    id: "pr-legacy-err",
    number: 0,
    repo: "acme-corp/legacy",
    title: "Can't reach this repo — token expired",
    role: "author",
    meta: "connection error · 2 PRs hidden",
    statusTone: "err",
    connectionError: true,
  },
];

export const CODE_REVIEW_MOCK_ISSUES: CodeReviewIssueRow[] = [
  {
    id: "issue-1691",
    number: 1691,
    repo: "openhands/agent-canvas",
    title: "Top-level Code Review surface for connected repositories",
    role: "assignee",
    meta: "enhancement · updated 1h ago",
    statusTone: "warn",
    linkedPrNumber: 1651,
    author: "DevinVinson",
    labels: ["enhancement", "roadmap"],
    assignees: ["paulbloch"],
    commentCount: 6,
    description:
      "Review workflows are scattered across PR review, hooks, and verification. Need one Code Review workspace that combines host data with agent launchers.\n\nAcceptance\n- Top-level nav + PR / Issues tabs\n- Connected-repos PR list (author ∪ assignee ∪ reviewer)\n- Quick actions: Review with agent",
  },
  {
    id: "issue-1420",
    number: 1420,
    repo: "openhands/agent-canvas",
    title: "Binary files render blank in the Files diff view",
    role: "author",
    meta: "bug · linked from PR #1651 · 4h ago",
    statusTone: "err",
    linkedPrNumber: 1651,
    author: "openhands-bot",
    labels: ["bug", "files-tab"],
    assignees: [],
    commentCount: 3,
    description:
      "Empty-diff branch returns null for binary paths, so the viewer shows a blank panel. Should show a Binary file placeholder instead.",
  },
  {
    id: "issue-88",
    number: 88,
    repo: "openhands/extensions",
    title: "Marketplace card missing icons for several catalog entries",
    role: "reviewer",
    meta: "good first issue · 1 day ago",
    statusTone: "off",
    author: "rbren",
    labels: ["good first issue"],
    assignees: [],
    commentCount: 1,
    description:
      "Several marketplace catalog entries fall back to a generic glyph. Map the missing logos in the extensions package.",
  },
  {
    id: "issue-42",
    number: 42,
    repo: "openhands/extensions",
    title: "hooks.json in nested packages is never discovered",
    role: "author",
    meta: "bug · 3 days ago",
    statusTone: "warn",
    author: "enyst",
    labels: ["bug", "hooks"],
    assignees: ["DevinVinson"],
    commentCount: 5,
    description:
      "Discovery only checks the repo root. Nested packages with their own .openhands/hooks.json are ignored.",
  },
  {
    id: "issue-210",
    number: 210,
    repo: "openhands/agent-canvas",
    title: "Document how review flavors map to skills",
    role: "assignee",
    meta: "docs · no linked PR · 5 days ago",
    statusTone: "on",
    author: "paulbloch",
    labels: ["docs"],
    assignees: ["paulbloch"],
    commentCount: 0,
    description:
      "Write a short mapping from Static / Runtime / Quality / Critic to the skills they launch (code-review, qa-changes, code-simplifier, Verification).",
  },
];

export const CODE_REVIEW_MOCK_HOOKS: CodeReviewHookRule[] = [
  {
    id: "hook-1",
    event: "PreToolUse · Edit, Write",
    rule: "run /code-review (static) before the edit lands",
    active: true,
  },
  {
    id: "hook-2",
    event: "PostToolUse · Bash ≠ 0",
    rule: "run /qa-changes when a command fails",
    active: true,
  },
  {
    id: "hook-3",
    event: "PreToolUse · any",
    rule: "SecurityAnalyzer gate (existing, Verification)",
    active: true,
  },
];

export const CODE_REVIEW_REVIEW_FLAVORS: CodeReviewReviewFlavor[] = [
  {
    id: "static",
    skillHint: "code-review + github-pr-review",
    requiresGitHub: true,
  },
  {
    id: "runtime",
    skillHint: "qa-changes",
    requiresGitHub: true,
  },
  {
    id: "quality",
    skillHint: "code-simplifier",
    requiresGitHub: false,
  },
  {
    id: "critic",
    skillHint: "Verification",
    requiresGitHub: false,
    isVerificationCrossLink: true,
  },
];

export const CODE_REVIEW_SAMPLE_COMMENTS: CodeReviewSampleComment[] = [
  {
    id: "c1",
    location: "src/routes.tsx:42",
    body: 'route("files") is missing the diff sub-toggle from this PR — wire the SegmentedToggle here or the diff view stays unreachable from the rail.',
  },
  {
    id: "c2",
    location: "src/components/files/diff-view.tsx:118",
    body: 'Empty-diff branch returns null, so binary files render blank. Show a "Binary file" placeholder instead.',
  },
  {
    id: "c3",
    location: "github-client.ts:64",
    body: "reviewDecision is fetched but never rendered on the row — surface it as the status chip so the list shows APPROVED/CHANGES_REQUESTED without a second call.",
  },
];
