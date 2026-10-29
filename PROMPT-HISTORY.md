# Prompt History

This document records meaningful development interactions between the user and
AI coding agents working on this project. It focuses on requests, outcomes,
implementation decisions, verification, and human-agent collaboration rather
than preserving a raw conversation transcript.

Generated code is included verbatim when reasonably concise. Extensive
implementations are referenced through their canonical repository files.

> This file is an engineering collaboration record, not a source of truth for
> application behavior. The repository itself remains authoritative.

> Prior history: [PROMPT-HISTORY-2026-Q4-02.md](PROMPT-HISTORY-2026-Q4-02.md) (M5 through the UI refactor's U2),
> before it [PROMPT-HISTORY-2026-Q4.md](PROMPT-HISTORY-2026-Q4.md) (v2 sessions through M5),
> and [Prototype/V1-PROMPT-HISTORY.md](Prototype/V1-PROMPT-HISTORY.md), the v1 prototype's log.
>
> **Open action item** carried over: anti-cheat, server-authoritative score submission
> (raised 2026-10-28; see Interaction 12 of the 2026-10-28 session in the -02 archive).

---

## Session: 2026-10-28 (second)

**Objective:** Extend PLAN-UI.md with milestones that restyle the remaining pages after U2.

### Interaction 1 — Plan for restyling the other pages

**User Prompt**

> extend the plan-ui doc to restyle the other pages

**Agent Outcome**

- PLAN-UI.md gains a second decisions table, *The other pages*, and milestones **U3–U7** (all Planned). Steps get detailed when each milestone starts, as CLAUDE.md requires.
  - **U3:** the "before" baseline, the app-style deal, and Settings.
  - **U4:** Leaderboards and the shared `Leaderboard` table.
  - **U5:** Profile, including the AI insight panels.
  - **U6:** Play, covering the React around the canvas only.
  - **U7:** NotFound, the loading components, removing the unused `PagePlaceholder`, and a whole-app pass.
- The verification section adds the app-screen gates for U3–U6.
- **Rotated** `PROMPT-HISTORY.md` at 775 lines to [PROMPT-HISTORY-2026-Q4-02.md](PROMPT-HISTORY-2026-Q4-02.md). It's `-02` because the unsequenced `PROMPT-HISTORY-2026-Q4.md` predates the sequence rule and is effectively the first.

**Rationale**

- **App screens, not pages.** The taste-skill's `SKILL.md` splits work into pages (read) and app screens (worked in), and gives app screens their own run, draw (`draw.mjs --app`), house rules and `inspect.mjs --app`. Play, Leaderboards, Profile and Settings are app screens. NotFound is a page, so it takes U2's direction.
- **`--keep palette,type`.** The skill says a product's site and app share one palette and typeface, so U2's Unbounded and Onest carry over with the five themes.
- **Order by risk.** Settings is simplest and proves the tokens. Leaderboards builds the table Profile reuses. Play goes last because it sits beside the canvas.
- **Real data only.** The app run's "write a dataset" step becomes an inventory of the real data, since these screens render live `/api` data.

**Collaboration**

One decision is left open for the user, to settle when U5 starts. `inspect.mjs` has no option for a browser profile or cookies, so it can't reach Play and Profile behind Google sign-in. The recommendation is `lint.mjs`, tests, and the user's own screenshots. The alternative is a dev-only fixture route.

**Changes**

- [`PLAN-UI.md`](PLAN-UI.md): the *other pages* decisions, U3–U7 rows, U3–U7 verification, and the Scope row pointing to them.
- `PROMPT-HISTORY.md` → [`PROMPT-HISTORY-2026-Q4-02.md`](PROMPT-HISTORY-2026-Q4-02.md) (renamed), and this new file.

**Verification**

Documentation only, with nothing to run. Checked against the repo: the pages and components each milestone names, `PagePlaceholder` having no importers, the `Modal` backdrop blur, and the taste-skill 2.1.5 `SKILL.md`, `references/app-screens.md` and `inspect.mjs` flags.
