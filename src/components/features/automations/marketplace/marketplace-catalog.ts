import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Bug,
  CalendarClock,
  ClipboardList,
  FileText,
  GitMerge,
  Kanban,
  MessageSquare,
  Radar,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import {
  AUTOMATION_CATALOG,
  type RecommendedAutomation,
} from "@openhands/extensions/automations";
import type { MarketplaceSectionId } from "./marketplace-section-ids";
import {
  MARKETPLACE_SECTION_CODE_QUALITY,
  MARKETPLACE_SECTION_POPULAR,
  MARKETPLACE_SECTION_PROJECT_MANAGEMENT,
  MARKETPLACE_SECTION_RELIABILITY,
  MARKETPLACE_SECTION_RESEARCH,
  MARKETPLACE_SECTION_TEAM_COORDINATION,
} from "./marketplace-section-ids";

export interface MarketplaceLucideIconStyle {
  icon: LucideIcon;
  iconBg: string;
  iconColor?: string;
}

export type MarketplaceAutomationEntry = RecommendedAutomation & {
  sectionId: MarketplaceSectionId;
} & (
    | { iconSource: "mcp" }
    | ({ iconSource: "lucide" } & MarketplaceLucideIconStyle)
  );

function catalogEntry(
  id: string,
  sectionId: MarketplaceSectionId,
): MarketplaceAutomationEntry | null {
  const automation = AUTOMATION_CATALOG.find((entry) => entry.id === id);
  if (!automation) return null;
  return { ...automation, sectionId, iconSource: "mcp" };
}

function sample(
  entry: RecommendedAutomation & {
    sectionId: MarketplaceSectionId;
  } & MarketplaceLucideIconStyle,
): MarketplaceAutomationEntry {
  const { icon, iconBg, iconColor, sectionId, ...automation } = entry;
  return {
    ...automation,
    sectionId,
    iconSource: "lucide",
    icon,
    iconBg,
    iconColor,
  };
}

export const AUTOMATION_MARKETPLACE_CATALOG: MarketplaceAutomationEntry[] = [
  catalogEntry("github-pr-reviewer", MARKETPLACE_SECTION_POPULAR)!,
  catalogEntry("slack-standup-digest", MARKETPLACE_SECTION_POPULAR)!,
  catalogEntry("linear-triage-assistant", MARKETPLACE_SECTION_POPULAR)!,
  catalogEntry("research-brief-writer", MARKETPLACE_SECTION_POPULAR)!,
  catalogEntry("incident-retrospective-drafter", MARKETPLACE_SECTION_POPULAR)!,
  sample({
    id: "release-notes-generator",
    name: "Release notes generator",
    category: "Shipping",
    description:
      "Draft release notes from merged pull requests, linked issues, and changelog entries.",
    requiredMcpIds: ["github", "linear"],
    popularityRank: 88,
    estimatedSetupMinutes: 6,
    sectionId: MARKETPLACE_SECTION_POPULAR,
    icon: Rocket,
    iconBg: "#6366F1",
    prompt:
      "Create an automation that drafts release notes when a release branch is cut or a tag is published. Use GitHub MCP for merged PRs and Linear MCP for linked issues. Ask me for repositories, version format, tone, and whether notes should publish to GitHub Releases automatically.",
    exampleImplementation:
      "Trigger: github release published or manual\nRequired MCPs: GitHub, Linear\n\n1. Gather merged PRs and linked issues for the release window.\n2. Group changes by feature, fix, and internal work.\n3. Draft customer-facing notes with links and upgrade guidance.\n4. Publish or save the notes for review.",
  }),
  sample({
    id: "sentry-error-triage",
    name: "Sentry error triage",
    category: "Quality",
    description:
      "Review new Sentry issues, cluster duplicates, and suggest owners with likely root causes.",
    requiredMcpIds: ["sentry", "github"],
    popularityRank: 86,
    estimatedSetupMinutes: 5,
    sectionId: MARKETPLACE_SECTION_POPULAR,
    icon: Bug,
    iconBg: "#362D59",
    prompt:
      "Create an automation that triages new Sentry issues. Use Sentry MCP to inspect stack traces and frequency, and GitHub MCP to locate likely source files and recent changes. Ask me for projects, severity thresholds, and whether to assign owners automatically.",
    exampleImplementation:
      "Trigger: sentry issue.created\nRequired MCPs: Sentry, GitHub\n\n1. Load issue details, stack trace, and release metadata.\n2. Search for related issues and recent commits touching the stack frame paths.\n3. Suggest severity, owner, and next debugging steps.\n4. Optionally create or update a tracking issue.",
  }),
  sample({
    id: "dependabot-pr-summarizer",
    name: "Dependency update reviewer",
    category: "Maintenance",
    description:
      "Summarize Dependabot pull requests with risk notes, breaking changes, and merge guidance.",
    requiredMcpIds: ["github"],
    popularityRank: 72,
    estimatedSetupMinutes: 4,
    sectionId: MARKETPLACE_SECTION_CODE_QUALITY,
    icon: Shield,
    iconBg: "#10B981",
    prompt:
      "Create an automation that reviews dependency update pull requests. Use GitHub MCP to inspect changelogs, release notes, and test status. Ask me which repositories to watch and whether low-risk updates can merge automatically.",
    exampleImplementation:
      "Trigger: github pull_request.opened by dependabot\nRequired MCP: GitHub\n\n1. Identify dependency scope and semver bump type.\n2. Summarize changelog risk and affected packages.\n3. Recommend merge, defer, or manual verification.",
  }),
  sample({
    id: "ci-failure-analyst",
    name: "CI failure analyst",
    category: "Quality",
    description:
      "When CI fails, collect logs, identify the failing step, and propose a fix path.",
    requiredMcpIds: ["github"],
    popularityRank: 70,
    estimatedSetupMinutes: 4,
    sectionId: MARKETPLACE_SECTION_CODE_QUALITY,
    icon: Activity,
    iconBg: "#F59E0B",
    prompt:
      "Create an automation that responds to failing CI checks on pull requests. Use GitHub MCP to inspect workflow runs, logs, and recent commits. Ask me which repositories and workflows matter and whether comments should post automatically.",
    exampleImplementation:
      "Trigger: github check_run.completed with failure\nRequired MCP: GitHub\n\n1. Fetch failing workflow jobs and relevant logs.\n2. Identify the first failing step and likely cause.\n3. Suggest fixes or reruns with links to logs.",
  }),
  sample({
    id: "stale-pr-nudger",
    name: "Stale PR nudger",
    category: "Code review",
    description:
      "Find inactive pull requests, summarize blockers, and draft friendly follow-up comments.",
    requiredMcpIds: ["github", "slack"],
    popularityRank: 68,
    estimatedSetupMinutes: 5,
    sectionId: MARKETPLACE_SECTION_CODE_QUALITY,
    icon: GitMerge,
    iconBg: "#8B5CF6",
    prompt:
      "Create an automation that nudges stale pull requests. Use GitHub MCP to find inactive PRs and Slack MCP to notify authors or reviewers. Ask me for staleness thresholds, repositories, and notification channels.",
    exampleImplementation:
      "Trigger: cron, weekday afternoons\nRequired MCPs: GitHub, Slack\n\n1. List PRs without activity beyond the configured threshold.\n2. Summarize review status and blockers.\n3. Draft follow-up comments or Slack reminders.",
  }),
  sample({
    id: "test-gap-detector",
    name: "Test gap detector",
    category: "Quality",
    description:
      "Inspect changed files on a PR and flag risky areas missing tests or coverage updates.",
    requiredMcpIds: ["github"],
    popularityRank: 64,
    estimatedSetupMinutes: 4,
    sectionId: MARKETPLACE_SECTION_CODE_QUALITY,
    icon: FileText,
    iconBg: "#06B6D4",
    prompt:
      "Create an automation that checks pull requests for missing tests. Use GitHub MCP to inspect changed files and existing test directories. Ask me for repository test conventions and severity rules.",
    exampleImplementation:
      "Trigger: github pull_request.opened or synchronize\nRequired MCP: GitHub\n\n1. Read changed files and classify them by risk.\n2. Compare against nearby tests and coverage patterns.\n3. Comment with suggested test cases when gaps are found.",
  }),
  sample({
    id: "slack-channel-digest",
    name: "Slack channel digest",
    category: "Team updates",
    description:
      "Turn a busy channel into a concise daily recap with decisions, links, and open questions.",
    requiredMcpIds: ["slack"],
    popularityRank: 82,
    estimatedSetupMinutes: 4,
    sectionId: MARKETPLACE_SECTION_TEAM_COORDINATION,
    icon: MessageSquare,
    iconBg: "#611F69",
    prompt:
      "Create an automation that publishes a daily Slack channel digest. Use Slack MCP to read configured channels and summarize key threads. Ask me for channels, schedule, and whether to include DMs or exclude bots.",
    exampleImplementation:
      "Trigger: cron, weekday evenings\nRequired MCP: Slack\n\n1. Collect messages from approved channels.\n2. Group by topic and highlight decisions and blockers.\n3. Post a digest with links back to source threads.",
  }),
  sample({
    id: "on-call-handoff-brief",
    name: "On-call handoff brief",
    category: "Operations",
    description:
      "Compile open incidents, noisy alerts, and unresolved threads for the next on-call shift.",
    requiredMcpIds: ["slack", "sentry"],
    popularityRank: 76,
    estimatedSetupMinutes: 6,
    sectionId: MARKETPLACE_SECTION_TEAM_COORDINATION,
    icon: Bell,
    iconBg: "#EF4444",
    prompt:
      "Create an automation that prepares on-call handoff notes. Use Slack MCP for incident channels and Sentry MCP for active issues. Ask me for rotation schedule, channels, and escalation rules.",
    exampleImplementation:
      "Trigger: cron before shift change\nRequired MCPs: Slack, Sentry\n\n1. Gather active incidents and recent alert spikes.\n2. Summarize unresolved work and recent mitigations.\n3. Publish a handoff note with owners and next steps.",
  }),
  sample({
    id: "meeting-prep-brief",
    name: "Meeting prep brief",
    category: "Team updates",
    description:
      "Before recurring meetings, collect relevant updates from Slack and docs into a one-page brief.",
    requiredMcpIds: ["slack", "notion"],
    popularityRank: 74,
    estimatedSetupMinutes: 5,
    sectionId: MARKETPLACE_SECTION_TEAM_COORDINATION,
    icon: Users,
    iconBg: "#3B82F6",
    prompt:
      "Create an automation that prepares meeting briefs. Use Slack MCP for recent team updates and Notion MCP for linked docs and agendas. Ask me for meeting cadence, participants, and source pages.",
    exampleImplementation:
      "Trigger: cron before configured meetings\nRequired MCPs: Slack, Notion\n\n1. Pull recent updates from approved channels.\n2. Attach linked Notion agenda items and decisions.\n3. Publish a brief with discussion prompts.",
  }),
  sample({
    id: "weekly-team-pulse",
    name: "Weekly team pulse",
    category: "Team updates",
    description:
      "Aggregate shipped work, active projects, and morale signals into a weekly leadership summary.",
    requiredMcpIds: ["slack", "linear"],
    popularityRank: 71,
    estimatedSetupMinutes: 5,
    sectionId: MARKETPLACE_SECTION_TEAM_COORDINATION,
    icon: CalendarClock,
    iconBg: "#14B8A6",
    prompt:
      "Create an automation that writes a weekly team pulse. Use Slack MCP for highlights and Linear MCP for completed and in-progress work. Ask me for teams, channels, and the destination for the summary.",
    exampleImplementation:
      "Trigger: cron, Friday afternoon\nRequired MCPs: Slack, Linear\n\n1. Collect shipped issues and major discussions.\n2. Summarize momentum, risks, and staffing gaps.\n3. Publish a weekly pulse for leadership review.",
  }),
  sample({
    id: "sprint-planning-assistant",
    name: "Sprint planning assistant",
    category: "Planning",
    description:
      "Review the backlog, flag overcommitted work, and propose a sprint scope with rationale.",
    requiredMcpIds: ["linear"],
    popularityRank: 80,
    estimatedSetupMinutes: 4,
    sectionId: MARKETPLACE_SECTION_PROJECT_MANAGEMENT,
    icon: Kanban,
    iconBg: "#5E6AD2",
    prompt:
      "Create an automation that assists sprint planning. Use Linear MCP to inspect backlog items, estimates, and dependencies. Ask me for teams, sprint length, and planning rules.",
    exampleImplementation:
      "Trigger: manual or cron before sprint start\nRequired MCP: Linear\n\n1. Load candidate issues and current cycle capacity.\n2. Flag dependencies, missing estimates, and duplicate work.\n3. Propose a sprint scope with tradeoffs.",
  }),
  sample({
    id: "notion-spec-sync",
    name: "Notion spec sync",
    category: "Documentation",
    description:
      "Keep Notion specs aligned with linked Linear issues and highlight stale requirements.",
    requiredMcpIds: ["notion", "linear"],
    popularityRank: 77,
    estimatedSetupMinutes: 6,
    sectionId: MARKETPLACE_SECTION_PROJECT_MANAGEMENT,
    icon: BookOpen,
    iconBg: "#191919",
    prompt:
      "Create an automation that syncs product specs between Notion and Linear. Use both MCPs to compare issue status with spec sections. Ask me for workspace structure, spec templates, and stale thresholds.",
    exampleImplementation:
      "Trigger: cron, twice weekly\nRequired MCPs: Notion, Linear\n\n1. Match linked Linear issues to Notion spec pages.\n2. Flag specs that diverge from implementation status.\n3. Suggest updates or review tasks.",
  }),
  sample({
    id: "backlog-grooming-assistant",
    name: "Backlog grooming assistant",
    category: "Project management",
    description:
      "Find vague tickets, missing acceptance criteria, and duplicate requests before planning.",
    requiredMcpIds: ["linear"],
    popularityRank: 69,
    estimatedSetupMinutes: 3,
    sectionId: MARKETPLACE_SECTION_PROJECT_MANAGEMENT,
    icon: ClipboardList,
    iconBg: "#F97316",
    prompt:
      "Create an automation that grooms the backlog. Use Linear MCP to inspect issue quality, labels, and duplicates. Ask me for teams, quality bar, and whether updates should apply automatically.",
    exampleImplementation:
      "Trigger: cron, mid-week\nRequired MCP: Linear\n\n1. Scan backlog items missing acceptance criteria or owners.\n2. Cluster likely duplicates and unclear requests.\n3. Recommend label, split, or close actions.",
  }),
  sample({
    id: "roadmap-drift-monitor",
    name: "Roadmap drift monitor",
    category: "Planning",
    description:
      "Compare active work against roadmap themes and surface projects that went off-track.",
    requiredMcpIds: ["linear", "notion"],
    popularityRank: 66,
    estimatedSetupMinutes: 5,
    sectionId: MARKETPLACE_SECTION_PROJECT_MANAGEMENT,
    icon: Sparkles,
    iconBg: "#A855F7",
    prompt:
      "Create an automation that monitors roadmap drift. Use Linear MCP for active work and Notion MCP for roadmap docs. Ask me for planning themes, teams, and review cadence.",
    exampleImplementation:
      "Trigger: cron, weekly\nRequired MCPs: Linear, Notion\n\n1. Map active issues to roadmap themes.\n2. Highlight work that no longer matches stated priorities.\n3. Publish a drift report with suggested realignments.",
  }),
  sample({
    id: "competitor-watch-brief",
    name: "Competitor watch brief",
    category: "Research",
    description:
      "Track competitor launches and industry news, then publish a short intelligence brief.",
    requiredMcpIds: ["tavily", "notion"],
    popularityRank: 83,
    estimatedSetupMinutes: 7,
    sectionId: MARKETPLACE_SECTION_RESEARCH,
    icon: Radar,
    iconBg: "#0EA5E9",
    prompt:
      "Create an automation that publishes a competitor watch brief. Use Tavily MCP for web research and Notion MCP to store the brief. Ask me for competitors, keywords, cadence, and destination pages.",
    exampleImplementation:
      "Trigger: cron, weekly\nRequired MCPs: Tavily, Notion\n\n1. Search configured competitors and topic keywords.\n2. Rank sources by relevance and recency.\n3. Publish a brief with implications and follow-ups.",
  }),
  sample({
    id: "docs-freshness-audit",
    name: "Docs freshness audit",
    category: "Research",
    description:
      "Find documentation that likely drifted from the codebase and suggest update tasks.",
    requiredMcpIds: ["github", "notion"],
    popularityRank: 73,
    estimatedSetupMinutes: 6,
    sectionId: MARKETPLACE_SECTION_RESEARCH,
    icon: BookOpen,
    iconBg: "#64748B",
    prompt:
      "Create an automation that audits documentation freshness. Use GitHub MCP for recent code changes and Notion MCP for linked docs. Ask me for repositories, doc locations, and stale thresholds.",
    exampleImplementation:
      "Trigger: cron, weekly\nRequired MCPs: GitHub, Notion\n\n1. Compare recent code changes with linked docs.\n2. Flag pages that likely need updates.\n3. Create review tasks or suggested edits.",
  }),
  sample({
    id: "customer-feedback-synthesizer",
    name: "Customer feedback synthesizer",
    category: "Research",
    description:
      "Cluster support and feedback signals into themes with suggested product follow-ups.",
    requiredMcpIds: ["slack", "linear"],
    popularityRank: 70,
    estimatedSetupMinutes: 5,
    sectionId: MARKETPLACE_SECTION_RESEARCH,
    icon: Search,
    iconBg: "#EC4899",
    prompt:
      "Create an automation that synthesizes customer feedback. Use Slack MCP for support channels and Linear MCP for linked requests. Ask me for source channels, themes, and output format.",
    exampleImplementation:
      "Trigger: cron, weekly\nRequired MCPs: Slack, Linear\n\n1. Gather recent feedback messages and linked issues.\n2. Cluster by theme, severity, and customer impact.\n3. Publish a synthesis with recommended next steps.",
  }),
  sample({
    id: "security-advisory-watch",
    name: "Security advisory watch",
    category: "Research",
    description:
      "Monitor new advisories affecting your stack and open remediation tasks when needed.",
    requiredMcpIds: ["tavily", "github"],
    popularityRank: 67,
    estimatedSetupMinutes: 6,
    sectionId: MARKETPLACE_SECTION_RESEARCH,
    icon: Shield,
    iconBg: "#DC2626",
    prompt:
      "Create an automation that watches security advisories. Use Tavily MCP for advisory searches and GitHub MCP to inspect affected dependencies. Ask me for stack keywords, repositories, and escalation rules.",
    exampleImplementation:
      "Trigger: cron, daily\nRequired MCPs: Tavily, GitHub\n\n1. Search for advisories affecting configured packages and vendors.\n2. Match against repository dependencies.\n3. Open remediation tasks or alerts when action is needed.",
  }),
  sample({
    id: "postmortem-action-tracker",
    name: "Postmortem action tracker",
    category: "Reliability",
    description:
      "Follow up on retrospective action items and nag owners when follow-ups go stale.",
    requiredMcpIds: ["notion", "linear", "slack"],
    popularityRank: 75,
    estimatedSetupMinutes: 5,
    sectionId: MARKETPLACE_SECTION_RELIABILITY,
    icon: ClipboardList,
    iconBg: "#78716C",
    prompt:
      "Create an automation that tracks postmortem action items. Use Notion MCP for retrospective pages, Linear MCP for follow-up issues, and Slack MCP for reminders. Ask me for templates, teams, and reminder cadence.",
    exampleImplementation:
      "Trigger: cron, twice weekly\nRequired MCPs: Notion, Linear, Slack\n\n1. Load open action items from recent postmortems.\n2. Check issue status and overdue tasks.\n3. Send reminders with owners and due dates.",
  }),
  sample({
    id: "deployment-smoke-summary",
    name: "Deployment smoke summary",
    category: "Reliability",
    description:
      "After deploys, summarize smoke test results, new errors, and rollback recommendations.",
    requiredMcpIds: ["github", "sentry"],
    popularityRank: 74,
    estimatedSetupMinutes: 5,
    sectionId: MARKETPLACE_SECTION_RELIABILITY,
    icon: Rocket,
    iconBg: "#22C55E",
    prompt:
      "Create an automation that summarizes deployment smoke results. Use GitHub MCP for deploy events and Sentry MCP for new errors after release. Ask me for environments, services, and alert thresholds.",
    exampleImplementation:
      "Trigger: github deployment.status.success\nRequired MCPs: GitHub, Sentry\n\n1. Capture deployment metadata and release version.\n2. Compare new error volume against baseline.\n3. Publish a smoke summary with rollback guidance if needed.",
  }),
  sample({
    id: "uptime-anomaly-report",
    name: "Uptime anomaly report",
    category: "Reliability",
    description:
      "Review alert spikes and incident chatter to produce a daily reliability snapshot.",
    requiredMcpIds: ["sentry", "slack"],
    popularityRank: 71,
    estimatedSetupMinutes: 4,
    sectionId: MARKETPLACE_SECTION_RELIABILITY,
    icon: Activity,
    iconBg: "#F43F5E",
    prompt:
      "Create an automation that publishes a daily uptime anomaly report. Use Sentry MCP for alert trends and Slack MCP for incident discussion. Ask me for services, channels, and thresholds.",
    exampleImplementation:
      "Trigger: cron, daily\nRequired MCPs: Sentry, Slack\n\n1. Detect alert spikes and newly noisy issues.\n2. Summarize related incident threads.\n3. Publish a reliability snapshot for the team.",
  }),
  sample({
    id: "incident-timeline-builder",
    name: "Incident timeline builder",
    category: "Reliability",
    description:
      "Build a minute-by-minute incident timeline from Slack and issue updates.",
    requiredMcpIds: ["slack", "linear", "notion"],
    popularityRank: 68,
    estimatedSetupMinutes: 7,
    sectionId: MARKETPLACE_SECTION_RELIABILITY,
    icon: AlertTriangle,
    iconBg: "#FB923C",
    prompt:
      "Create an automation that builds incident timelines. Use Slack MCP for response chatter, Linear MCP for linked issues, and Notion MCP to publish the timeline. Ask me for incident identifiers and template structure.",
    exampleImplementation:
      "Trigger: manual or incident label added\nRequired MCPs: Slack, Linear, Notion\n\n1. Gather timestamped messages and status changes.\n2. Build a timeline with actors, decisions, and customer impact.\n3. Publish the draft timeline for review.",
  }),
];

export function getMarketplaceAutomationById(id: string) {
  return AUTOMATION_MARKETPLACE_CATALOG.find((entry) => entry.id === id);
}

export const ORIGINAL_AUTOMATION_CATALOG_IDS = new Set(
  AUTOMATION_CATALOG.map((entry) => entry.id),
);
