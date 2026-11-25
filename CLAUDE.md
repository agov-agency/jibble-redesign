# Jibble redesign: orchestration rules

The main session is the orchestrator. The user describes a task; you decide agents, models and parallelism without asking. Keep progress updates to a line or two and optimize tokens: pass file paths not pasted content, give agents explicit scopes, request short summaries.

Project facts: HTML/CSS/JS prototype, no backend, illustrative data (see `PRODUCT.md`). Shared tokens/components live in `shared/`; the design system is `DESIGN.md`. Dev server: Vite on 5180 via `preview_start`. Impeccable hooks in `.claude/settings.local.json` must stay intact. Do not commit or push unless asked.

## 1. Triage (always first)

- **Trivial** (small edit, label, one-file tweak, a question): do it yourself. No agents.
- **Lookup / lightweight check**: `scout` (Haiku).
- **Scoped build, several files**: `implementer` (Sonnet).
- **Hard UX, IA, architecture, competing approaches, cross-surface plans**: `ux-architect` (Opus).
- **Runtime/interaction verification**: `qa-tester` (Sonnet).
- **Keeping `DESIGN.md` in sync after a change**: `design-system-maintainer` (Sonnet). See §10.

## 2. Models

Haiku for search and lightweight checks, Sonnet for implementation, research and testing, Opus for complex UX, architecture and difficult reasoning. Set `model` on the Agent call. Escalate one tier (Haiku→Sonnet→Opus) when an agent fails, returns thin or contradictory results, or the task proves harder than triaged. Do not default to Opus.

Reviews default to Sonnet, including teammates in a team. Use Opus only when the reasoning itself is the hard part (IA, competing architectures, cross-surface trade-offs), not for "important" or "thorough" reviews.

## 3. Parallelism

Run agents in parallel only when their work is independent. Never run two writers on the same files. Research and reviews are good parallel candidates; sequential steps that depend on each other are not.

## 4. Workflow (scale to the task)

1. Requirements and existing behavior (`scout`, or yourself if small).
2. Plan. Use `ux-architect` only when the decision is genuinely hard.
3. Implement (yourself for small, `implementer` for larger; split into parallel implementers only across disjoint files).
4. Adaptive review (below).
5. Fix only confirmed issues, then re-verify the fixed behavior.
6. Documentation check (§10): if the final change likely affects `DESIGN.md`, run `design-system-maintainer`.

## 5. Adaptive review

Choose reviewers by type, complexity and risk. Do not run all by default.

- Copy, tiny CSS tweak, low risk: none, or just a self-check.
- New/changed component or styling, no flow change: `ui-consistency-reviewer`.
- New or changed flow, actions, permissions, states: `workflow-reviewer`.
- Interactive behavior or JS changes: `qa-tester`.
- Multiple reviewers only for large, cross-surface or high-risk changes. Run them in parallel.
- Impeccable agents (`impeccable-finish-reviewer`, etc.) only for Impeccable craft workflows.
- Independent reviews run as parallel subagents. The orchestrator merges their results, removes duplicates and settles disagreements. Reviewers do not consolidate each other's work.

## 6. Subagents vs Agent Teams

Agent Teams are enabled (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).
- **Subagents (default):** use them for every independent review or task. Separate perspectives on the same surface are still independent work, so use parallel subagents and let the orchestrator compare the results.
- **Agent Teams:** only when one agent's work depends on another's findings while both are still running (e.g. a writer that needs a reviewer's ruling before it continues). "Two viewpoints" alone is not a reason.
- **Exchange budget:** one exchange by default. Each teammate sends one structured message (up to 5 findings with file:line, up to 2 questions), reads the peer's message, and folds it into its final report. It sends no acknowledgements and no second round. A second round needs a stated reason in the brief.
- **No reopening finished agents:** don't send a message to a completed agent only to acknowledge it or pass along a late message. The orchestrator reconciles late information itself.
- **Read-only reviewer agents** (`scout`, `ui-consistency-reviewer`, `workflow-reviewer`, `ux-architect`) have no SendMessage. A team member that needs to message others must be `general-purpose`, with "read-only" stated in its brief.
- Subagents cannot spawn subagents; you remain the single orchestrator.

## 7. Dynamic specialization

When no existing agent fits, spawn a temporary specialist with `general-purpose` or a one-off prompt (and a team if coordination is needed). Do not add permanent agent files for one-off tasks. Only create a permanent agent in `.claude/agents/` if the same specialization recurs and the user agrees.

## 8. Autonomy and approval

Routine implementation, fixes and reviews proceed without approval. Ask first before significant UX or architectural changes: navigation or IA changes, departures from `DESIGN.md`, new patterns, and edits to shared tokens/components that affect every screen.

## 9. Token discipline

- **Narrow briefs:** each brief names the exact files or line ranges to cover, one perspective, and a word cap (default 300).
- **Evidence-based findings:** each finding has a severity, a file:line, the issue and a fix direction. No praise, no restating the brief, no file dumps.
- **Reuse before exploring:** when this conversation already has findings or file maps for a surface, pass them into the brief (as a short summary plus file paths) and tell the agent not to re-scan what they cover. Don't give two agents overlapping exploration of the same files.
- Automatic delegation and model selection under §1–2 stay as they are. These rules limit cost, not autonomy.

## 10. Design documentation maintenance

`DESIGN.md` is the source of truth for established conventions. After implementation, review and fixes are done (workflow step 6), decide whether documentation impact is likely. If yes, invoke `design-system-maintainer` (Sonnet) automatically, without asking.

**Invoke when the finished change:**
- adds or changes anything in `shared/` (tokens, `shell.css`, `components.css`, shared scripts);
- introduces a component, variant or interaction pattern that is reused, or is meant to be, across surfaces;
- adds or changes interaction states or accessibility behavior for a control type (focus, keyboard, disabled, error, loading);
- follows a user decision that sets a project-wide convention, or approves a previously undocumented pattern;
- touches something `DESIGN.md` names explicitly (a class, value or file path) in a way that may now be stale.

**Skip it for** copy changes, one-off screen tweaks, bug fixes that don't change a rule, experiments or unapproved UX, and changes `DESIGN.md` already describes correctly. Never invoke it after every task.

**Brief:** changed files (or the diff summary), the task in one line, the approval status ("approved by user in chat", "approved plan", or "not yet approved"), and the `DESIGN.md` sections likely affected. Do not paste content.

**Ordering:** run it after the last code change, never in parallel with another writer on `DESIGN.md` (e.g. `impeccable-documenter`). It edits `DESIGN.md` only and never application code.

**After it returns:** check its `DESIGN.md` diff, relay "Updated" items in a line or two, put any "Needs approval" proposals to the user (§8 applies: principles, global tokens and project-wide conventions need the user's yes), and treat "Conflicts" marked as drift like review findings (fix the code, not the doc). Apply approved proposals yourself or re-run the agent with the approval stated.
