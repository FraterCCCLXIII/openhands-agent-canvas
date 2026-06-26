# Loops (Loop Engineering)

Status: **Phase 0 scaffold** on `feat/loops`.

## Purpose

Loops are the fourth layer above prompt, context, and harness engineering: a system
that discovers work, hands it to agents, verifies results, persists state, and
reschedules itself without a human in the inner cycle.

Automations in agent-canvas today provide **scheduling + one-shot prompt**.
Loops add **multi-turn orchestration** with durable state and an independent
evaluator that can say no.

Reference: Loop Engineering (Osmani / Steinberger / Cherny, June 2026); see
`specs/loops.md` appendix for the five moves and six parts.

## Five moves (one turn)

| Move | Responsibility |
|------|----------------|
| **Discovery** | Find this turn's work (CI, issues, commits, prior state) via a **Skill**, not a cron prompt wall |
| **Handoff** | Isolate each unit of work (worktree per finding) |
| **Verification** | Separate generator from evaluator; stop condition judged by a fresh check |
| **Persistence** | Write state to disk (repo file); agent forgets, repo does not |
| **Scheduling** | Trigger on cron/event; unfinished work carries to the next run |

## Six parts

| Part | Maps to | agent-canvas (current / planned) |
|------|---------|-----------------------------------|
| Automations | Scheduling | Reuse automation backend triggers |
| Worktrees | Handoff | Conversation `worktree: true` per item |
| Skills | Discovery | `discoverySkillId` invokes bundled/user skills |
| Connectors (MCP) | Persistence / discovery | GitHub, Linear, Slack, etc. |
| Sub-agents | Verification | Generator + evaluator agent profiles |
| Memory (state file) | Persistence | `.openhands/loops/<id>/state.md` |

## Anti-patterns (one move skipped)

- **Nodding loop** — no evaluator (verification skipped)
- **Amnesiac loop** — no state file (persistence skipped)
- **Manual loop** — no trigger (scheduling skipped)
- **Blind loop** — human still picks work (discovery skipped)
- **Tangled loop** — parallel agents share one directory (handoff skipped)

## Data model

See `src/types/loop.ts`. A `LoopDefinition` includes:

- `trigger` — same shape as automations (cron / event)
- `discovery` — skill id + input sources + state file path
- `handoff` — isolation mode, max parallel, generator profile
- `verification` — evaluator profile, stop condition, max retries
- `persistence` — state path, optional commit-to-repo
- `safety` — token budgets, human review required, inbox path

## API (planned)

Mounted on the automation backend sidecar (same session auth as `/api/automation`):

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/loops/health` | Health check |
| GET | `/api/loops/v1` | List loops |
| POST | `/api/loops/v1` | Create loop |
| GET | `/api/loops/v1/:id` | Loop detail |
| PATCH | `/api/loops/v1/:id` | Update / toggle |
| DELETE | `/api/loops/v1/:id` | Delete |
| POST | `/api/loops/v1/:id/dispatch` | Run one turn now |
| GET | `/api/loops/v1/:id/runs` | Run history |

Phase 0 uses **MSW mocks** only; orchestrator implementation follows in Phase 1.

## UI

- `/loops` — list, templates, create from template
- `/loops/:loopId` — detail: checklist of five moves, last run, state path, inbox count

Feature flag: `VITE_LOOPS_ENABLED` (default on unless `"false"`).

## Phased delivery

### Phase 0 (this branch)

- Spec, types, mock API, list + detail UI, morning-triage template

### Phase 1

- Loop orchestrator: discovery-only turn (skill → state file commit)
- Cron trigger via automation backend

### Phase 2

- Generator + evaluator conversations per finding
- Stop condition + retry cap

### Phase 3

- Parallel handoff, inbox, token budgets

## First template: Morning Triage

Discovery skill reads CI failures, open issues, and recent commits; writes findings
to `.openhands/loops/<loop-id>/triage.md`. Phase 1 runs discovery only; handoff
and verification activate in Phase 2.

## Safety defaults (non-negotiable)

1. Evaluator is a **separate** agent profile — never the generator grading itself
2. State on disk, not only in chat
3. Discovery via Skills
4. At least one human checkpoint (inbox / no auto-merge)
5. Token and retry caps before unattended runs
