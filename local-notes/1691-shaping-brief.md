# #1691 — Code Review surface (shaping brief)

**Status: Incomplete / WIP** (UI-first mock; not ready for review)

| | |
| --- | --- |
| Branch | [`feat/code-review-surface-1691`](https://github.com/FraterCCCLXIII/openhands-agent-canvas/tree/feat/code-review-surface-1691) |
| Fork remote | `origin` / `fork` → `FraterCCCLXIII/openhands-agent-canvas` |
| Base | `upstream/main` (`OpenHands/agent-canvas`) |
| Issue | https://github.com/OpenHands/agent-canvas/issues/1691 |

Local artifacts (not necessarily committed):

- `1691-codebase-map.md` — georgeglarson writeup
- `1691-oh-mockup-revised.html` — 5-frame HTML mockup
- Preview: https://htmlpreview.github.io/?https://gist.githubusercontent.com/georgeglarson/20e1cea08e02d03def4ef6d4e65b0919/raw/334a25dc339aacac90f921e1e07e920aa7383c93/oh-mockup-revised.html

---

## Problem (issue)

Review workflows are scattered: PR review, hooks, agent review behavior, issue triage. Need one top-level **Code Review** workspace that combines host data (GitHub/GitLab/…) with repo-local OpenHands config and agent launchers.

## Proposed IA

Top-level nav → `/code-review` with sub-pages:

| Tab | Role in MVP |
| --- | --- |
| **Pull Requests** (default) | Anchor: connected-repos PR list + quick actions |
| **Issues** | Issue list + drawer (triage CTA) |
| **Hooks** | Moved to Settings (`/settings/hooks`) |
| **Code Style** | Moved to Settings (`/settings/code-style`) |

Multi-provider in the same views long-term; GitHub-first for PoC.

## MVP picture (issue)

1. Top-level Code Review nav  
2. Sub-routes; PR default  
3. PRs where user is **author, assignee, or requested reviewer**  
4. Quick actions: **Review with agent**, **Summarize changes**  
5. Hooks: repo selector + read-only `.openhands/hooks.json` detection  
6. Code Style + Issues as placeholders  

## Feedback: georgeglarson

[Comment](https://github.com/OpenHands/agent-canvas/issues/1691#issuecomment-4967698149) + [codebase map](https://gist.github.com/georgeglarson/bc754ba63ed60164300c0a043e0bbe7b) + [mockups](https://gist.github.com/georgeglarson/20e1cea08e02d03def4ef6d4e65b0919)

**Already exists (wire, don’t rebuild):**

- Skills: `code-review`, `github-pr-review`, `qa-changes`, `code-simplifier` (+ iterate / learn-from-code-review)
- Files-tab diff view; hooks modal; hook execution events; `github-pr-reviewer` automation
- Verification (Critic / Goal / SecurityAnalyzer) — **cross-link, don’t absorb** into Code Review

**Gaps:**

- Surface that ties pieces together + **connected-repos PR list** (real API lift)
- Hooks modal is **conversation-scoped** today → repo-level governance on the Hooks tab is still new work

**Suggested phases:**

1. Break into phases  
2. Spec the connected-repos PR list  
3. First PR: `/code-review` route + nav + sub-route stubs  

**Net-new (F1–F4):**

| ID | Work |
| --- | --- |
| F1 | Route + nav + sidebar + command menu |
| F2 | Sub-routes (PR / Hooks / Code Style / Issues) |
| F3 | Connected-repos PR list (author ∪ assignee ∪ reviewer) |
| F4 | Quick actions: Review (flavor chooser) + Summarize |

## Feedback: DevinVinson

[Comment](https://github.com/OpenHands/agent-canvas/issues/1691#issuecomment-4980526534)

- Wants more shaping before a big build  
- **Differentiation vs Codex PR tab:** Codex ≈ thin GitHub API wrapper; Agent Canvas should add **agent quick actions** and visibility into **automations** that have run / should run  
- Attached Codex-style PR list screenshot as contrast (not the target UX)

## Mockup frames (revised HTML)

1. **Pull Requests index** — repo chips, role filters (author / assignee / review requested), PR rows with status dots, **Summarize** + **Review ▾** (static / quality / runtime QA); `iterate` shown disabled as Phase 2  
2. **Review action** — flavor chooser + sample output (inline GH-style comments / PASS-FAIL / markdown)  
3. **Hooks** — governance: event → rule list, “add hook”, note that modal exists conversation-scoped  
4. **Degrade states** — no connected repos; GitHub not connected blocking a flavor  
5. **Placeholders** — Code Style + Issues template-first copy so nav is complete  

## Recommended first slice (aligned with feedback)

1. **Scaffold PR:** `/code-review` + sidebar + tabs + stubs (F1/F2)  
2. **Spec + implement** connected PR list (F3) — GitHub-first  
3. **Wire quick actions** to existing skills (F4)  
4. **Hooks** lifts/repurposes existing modal toward repo-level (settings)  
5. Leave Code Style thin; don’t absorb Verification  

## Implementation status (incomplete on this branch)

WIP mock-data UI on [`feat/code-review-surface-1691`](https://github.com/FraterCCCLXIII/openhands-agent-canvas/tree/feat/code-review-surface-1691) — **do not treat as done**.

Done enough to navigate / click through:

- [x] F1 — `/code-review` route, sidebar + command menu  
- [x] F2 — Code Review tabs: Pull Requests / Issues (Hooks + Code Style under Settings)  
- [x] PR list UI (roles, Connected/Show dropdowns, search, Review ▾ per row)  
- [x] Push-style PR drawer: author/age, repo, branch + diff, GitHub ↗ + Review ▾ in header  
- [x] Host-style PR/issue summary (reviewers, comments, checks, description) + sample review output  
- [x] Issues list + drawer (triage CTA)  
- [x] Empty-repos degrade state  

Still open / incomplete:

- [ ] Live connected-repos PR/issue API (F3)  
- [ ] Skill launch wiring for review flavors (F4)  
- [ ] Repo-level hooks detection (settings Hooks page still thin)  
- [ ] Summarize row action (removed from current UI; may return)  
- [ ] Automations status on PR rows (Devin contrast)  
- [ ] Polish / product review before opening an upstream PR  

## Open questions

- Exact GraphQL/API for multi-role PR query + caching  
- How automations status appears on PR rows (Devin’s Codex contrast)  
- Whether Issues stays under Code Review vs a later Bug Triage view  
- Multi-provider timing (GitLab dead keys already noted in writeup)  
