# Prompt History

This document records meaningful development interactions between the user and
AI coding agents working on this project. It focuses on requests, outcomes,
implementation decisions, verification, and human-agent collaboration rather
than preserving a raw conversation transcript.

Generated code is included verbatim when reasonably concise. Extensive
implementations are referenced through their canonical repository files.

> This file is an engineering collaboration record, not a source of truth for
> application behavior. The repository itself remains authoritative.

> Prior history: [PROMPT-HISTORY-2026-Q4-03.md](PROMPT-HISTORY-2026-Q4-03.md) (UI refactor U3 through server-checked scoring S5),
> before it [PROMPT-HISTORY-2026-Q4-02.md](PROMPT-HISTORY-2026-Q4-02.md) (M5 through the UI refactor's U2),
> [PROMPT-HISTORY-2026-Q4.md](PROMPT-HISTORY-2026-Q4.md) (v2 sessions through M5),
> and [Prototype/V1-PROMPT-HISTORY.md](Prototype/V1-PROMPT-HISTORY.md), the v1 prototype's log.

---

## Session: 2026-10-29 (fourth)

**Objective:** Let players see their previous AI-generated insights on the Profile page (`improvement/insights`).

### Interaction 1 — Plan past insights on Profile (I0)

**User Prompt**

> I create a branch titled `improvement/insights`.
>
> the task is to allow users to display previous AI generated insights on their profile page

**Agent Outcome**

- **What I found:** every answer is already a row in `insights`, but the Profile panels start empty. `useInsight` runs only on click, and a click with unchanged stats just returns the latest row as `cached`. Older rows can't be reached. The hardware answer's setup inputs exist only inside `input_hash`.
- **[PLAN-INSIGHTS.md](PLAN-INSIGHTS.md)** (new) has four milestones:
  - **I0:** the plan and docs.
  - **I1:** migration `005` (`insights.context jsonb`), `GET` on both insight routes (the latest 10, re-parsed on read), and the `POST` response gains `id` and `context`.
  - **I2:** the panels open on the latest saved answer and have a picker for older ones.
  - **I3:** a run against Neon, README and the PR body.
- **CLAUDE.md:** the document list leads with PLAN-INSIGHTS.md, and the workflow names `improvement/insights`. Server-checked scoring is marked merged.
- **Rotated** `PROMPT-HISTORY.md` at 854 lines to [PROMPT-HISTORY-2026-Q4-03.md](PROMPT-HISTORY-2026-Q4-03.md).

**Rationale**

- Reading saved rows costs nothing, so it can run on mount, unlike generating. The click-only rule in ARCHITECTURE.md exists because of the Claude call, not the read.
- `GET` beside each existing `POST` fixes the kind by path, so no new route file or `kind` parameter is needed.
- Rows pass back through `parseAdvice` on read, so a future `PROMPT_VERSION` that changes the answer's shape can't break the panel.

**Collaboration**

The user made both scope calls, each the recommended option: **latest on load plus a history picker** (over latest only, or a separate history section), and **storing the setup inputs from now on** in a new nullable column (over no migration).

**Changes**

- [`PLAN-INSIGHTS.md`](PLAN-INSIGHTS.md): new.
- [`CLAUDE.md`](CLAUDE.md): document list and workflow.
- `PROMPT-HISTORY.md` → [`PROMPT-HISTORY-2026-Q4-03.md`](PROMPT-HISTORY-2026-Q4-03.md) (renamed), and this new file.

**Verification**

- Docs only, so no tests were run. `npm run format:check` was run on the new Markdown.
- The branch is at `2982038`, the same tree `main` merged as `356f182` (PR #3). It has no upstream yet. The local `main` is 8 commits behind `origin/main`.
- Stopped at the I0 review gate. Nothing is committed.

### Interaction 2 — I0 committed so `main` can be pulled

**User Prompt**

> only commit, so I can pull main. *(with git's "Your local changes … would be overwritten by checkout" error for PROMPT-HISTORY.md and CLAUDE.md)*

**Agent Outcome**

- I0 is marked Done and committed on `improvement/insights`. Nothing is pushed, and I1 waits for the user.
