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

### Interaction 3 — Server: store the inputs, list the history (I1)

**User Prompt**

> Pulled main, execute I1

**Agent Outcome**

- **Migration `005_insight_context.sql`:** `insights.context jsonb`, nullable, with a `CHECK` that it's an object.
- **`GET /api/insights/hardware` and `GET /api/insights/platforms`:** these return `{ entries: [{ id, recommendation, context, model, generatedAt }] }`, the caller's 10 latest, newest first. They sit beside the existing `POST`s.
- **New `api/_lib/insightHistory.js`:** pure functions. `toEntry` is the one response shape, and `POST` now returns it plus `cached`. `historyEntries` drops rows that the kind's `parseAdvice` rejects.
- **Store and runner:** `insightStore` gains `history` and saves `context`. The runner takes `context`. `requestInsight` gains `listInsights`.
- **Client:** unchanged. The `POST` response is a superset of what `useInsight` reads.
- **Docs:** ARCHITECTURE.md covers the routes, the `_lib` list, the data model and the insights flow. PLAN-INSIGHTS.md has the I1 detail and verification.

**Rationale**

- `id` is cast to text, because a Postgres bigint isn't JSON-safe in every driver.
- A cached answer returns the stored row's `context`, not the request's, so `POST` and `GET` describe the same row identically. Equal hashes mean the two contexts are equal anyway.

**Attempted Approach / Resolution**

A tiebreak was first written as `order by created_at desc, id desc`. In Postgres, a bare name in `ORDER BY` resolves to the output alias first, which here is `id::text`, so ties would have sorted '99' above '100'. It's now `insights.id desc`, with a comment. A PGlite check over ids 19–118 fails without the qualifier and passes with it.

**Changes**

- New: [`db/migrations/005_insight_context.sql`](db/migrations/005_insight_context.sql), [`api/_lib/insightHistory.js`](api/_lib/insightHistory.js) and its test.
- Changed: [`api/_lib/insightStore.js`](api/_lib/insightStore.js), [`insightRunner.js`](api/_lib/insightRunner.js) and its test, [`insightRequest.js`](api/_lib/insightRequest.js), [`db.js`](api/_lib/db.js), [`api/insights/hardware.js`](api/insights/hardware.js), [`platforms.js`](api/insights/platforms.js), [`ARCHITECTURE.md`](ARCHITECTURE.md), [`PLAN-INSIGHTS.md`](PLAN-INSIGHTS.md).

**Verification**

- `npm run lint`, `npm run format:check`, `npm test` (409 tests, up from 401) and `npm run build` pass.
- PGlite, 15 checks with the real store (scratchpad `check-i1.mjs`).
- Not run: the routes against Neon (`005` is unapplied). Approved and committed at the user's "commit I1".

### Interaction 4 — Client: open on the latest answer, pick older ones (I2)

**User Prompt**

> Pushed, execute I2

**Agent Outcome**

- **On load:** each Profile insight panel loads the player's saved answers and opens on the latest, with no Claude call. A "Showing" select ("Latest, …" first, then dates) appears once there are two or more answers.
- **Generating:** a fresh answer goes to the top and is shown. A cached one isn't listed twice, and still says it's cached.
- **Hardware answers** show the setup they were for, e.g. "For 1600 DPI at 500 Hz." Answers saved before I1 show nothing there.
- **Failures:** if the history fails to load, the panel shows one quiet line with a Retry, and Generate still works.
- **New modules:**
  - `useInsightHistory`: the read hook, plus `add` and `select`.
  - `utils/insightHistory.js`: the pure helpers `mergeEntries`, `shownEntry` and `formatGeneratedAt`.
  - `InsightPicker`.
  - `styles/field.js`: the square control class, shared with `HardwareInsight`.
  - `describeSetup` in `mouseSetup.js`.
- **Changed:** `useInsight` now hands its answer to the history (`onAnswer`) instead of keeping it.

**Rationale**

- The history is the single list a panel renders, and generated answers merge into it by id. That avoids a second "current answer" state that could disagree with the list, and a cached answer dedupes by id for free.
- Selection and generated entries are keyed by uid, like the other read hooks, so a different account never sees the last one's.

**Collaboration**

- An edit to Profile's subtitle copy was reverted before review. The picker already makes the history visible.

**Changes**

- New: [`src/hooks/useInsightHistory.js`](src/hooks/useInsightHistory.js), [`src/utils/insightHistory.js`](src/utils/insightHistory.js), [`src/components/InsightPanel/InsightPicker.jsx`](src/components/InsightPanel/InsightPicker.jsx), [`src/styles/field.js`](src/styles/field.js), and tests for the hook and the utils.
- Changed: `services/insights.js`, `hooks/useInsight.js`, `InsightPanel.jsx`, `HardwareInsight.jsx`, `PlatformInsight.jsx`, `Profile.jsx`, `utils/mouseSetup.js`, their tests, [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`PLAN-INSIGHTS.md`](PLAN-INSIGHTS.md).

**Verification**

- `npm run lint`, `npm run format:check`, `npm test` (436 tests, up from 409) and `npm run build` pass.
- Browser: the production build with the U7 faked session and stubbed reads (scratchpad `insight-shots.mjs`), in Dark and Light at 1440 and Dark at 390. It opened on the latest answers, the keyboard picked an older one, there was no sideways scroll and no console errors.
- Not run: against Neon (I3). Approved and committed at the user's "commit I2".

### Interaction 5 — Final pass and PR body (I3)

**User Prompt**

> Pushed and migrated, execute I3

**Agent Outcome**

- **Live checks against Neon** (read only, nothing printed from `.env.local`):
  - `005_insight_context.sql` is recorded.
  - All 12 stored answers pass `parseAdvice`, so the history drops none.
  - Under `vercel dev`, both routes' `GET` and `POST` answer 401 without a token.
- **taste-skill `lint.mjs --app`** on the changed UI: 0 FAIL, 0 WARN.
- **README:** the AI insights feature line mentions past answers, and the project plan gains a *Past insights* paragraph.
- **PR body:** written to the agent's scratchpad (`PR-insights.md`) for the user to paste. It has a route/table/component diff, tests 401 → 436, the PGlite and Neon checks, and a two-way-door Merge Danger with a Profile blast radius.

**Verification**

- Lint, format check, tests (436) and build pass.
- Not done by the agent: the real signed-in look at Profile, since Google sign-in can't be automated here (PLAN-UI.md). That's left to the user.

### Interaction 6 — Signed-in check passed; I3 committed

**User Prompt**

> I ran a dev server, signed in and sent an update with a new dpi. The new entry has "for 850 dpi", and the picker lists all generated responses. success. commit I3

**Agent Outcome**

- PLAN-INSIGHTS.md records the user's report, and I3 is marked Done and committed. Every milestone (I0–I3) is now done.
- **Next:** the user pushes and opens the PR with the body in the scratchpad (`PR-insights.md`).

### Interaction 7 — PR body for `improvement/insights` → `main`

**User Prompt**

> Pushed, log the PR body in the prompt history

**Agent Outcome**

- **The body:** written in I3 to the agent's scratchpad (`PR-insights.md`) for the user to paste when opening the PR on GitHub. It follows the `pr` skill's template:
  - **Summary:** diffs of the two routes (`GET` added; `POST` gains `id` and `context`), the `insights.context` column, and the Profile component tree (`useInsightHistory`, `useInsight(request, history.add)`, `InsightPicker`, the setup line). It also notes that old shapes are dropped on read.
  - **Evidence:**
    - Before and after (empty panels, then panels open on saved answers), with the faked-session screenshots or the user's own.
    - Tests 401 → 436, with the new cases listed.
    - The 15 PGlite checks, including the `insights.id` tie order.
    - The read-only Neon checks (`005` recorded, all 12 rows parse, 401 without a token).
    - taste-skill lint at 0 FAIL, 0 WARN.
  - **Merge Danger:** a two-way door, since `005` is additive and already applied, and the `POST` response only gains fields. The blast radius is Profile: two capped, indexed `GET`s on load, and a failed `GET` that leaves Generate usable.
- The branch is pushed (`improvement/insights` tracks `origin/improvement/insights`). The PR wasn't opened by the agent. This entry was committed at the user's "commit it".

---

## Session: 2026-10-29 (fifth)

**Objective:** Bring the README up to date with the merged work and explain its data flow with Mermaid diagrams (`improvement/Readme`).

### Interaction 1 — README architecture as Mermaid diagrams

**User Prompt**

> On branch `improvement/Readme`, update the readme to reflect the latest state of the project. include mermaid diagrams explaining data flow

**Agent Outcome**

- Created `improvement/Readme` from `main` (`3844410`, the merged insights PR).
- **README's Architecture section** swaps the ASCII sketch for six Mermaid diagrams:
  - **System overview** (flowchart): React UI, canvas engine and `src/services/*` in the browser; `/api` on Vercel; Neon Auth, Neon Postgres and the Anthropic API, with each edge labelled.
  - **Sign-in and identity** (sequence): the Google redirect, the one-time verifier exchange, the 15-minute Ed25519 JWT, and `/api` verifying it against the JWKS, ending at `uid = sub`.
  - **Playing and saving a match** (sequence): the match ticket requested in parallel with `start()`, the rAF loop, `onHud` only on a hit, miss or tick, `onGameOver`'s summary carrying the event log, and the submit that checks, scores and claims in one statement.
  - **Score submission gates** (flowchart): 401 → 400 (shape) → 404/409/410 → 400 (`checkMatch`) → `scoreEvents` → 201.
  - **Data model** (ER): `neon_auth.user`, `matches`, `scores` and `insights` as the migrations define them, with `matches |o--o| scores` for the nullable, unique `match_id`.
  - **AI insights** (flowchart): the free history read on mount, then the 5-match minimum (422), the input-hash cache, the daily cap (429), the Claude call and its answer check (502).
- The section now lists the three rules ARCHITECTURE.md states, adding the token-identity rule to the README's two, plus a short leaderboards and profile-stats paragraph.
- **Smaller fixes:** test count 400+ → 430+, links to all three prompt-history archives, and the "see below" under replay-proof scoring now links to the match-saving section.

**Rationale**

- The ER diagram names the Neon Auth table `NEON_AUTH_USER` instead of using Mermaid's entity-alias syntax, which older renderers don't parse.
- Every diagram label that holds a `/`, parentheses or braces is quoted, since `["/api…"]` would otherwise parse as a Mermaid trapezoid.

**Changes**

- [`README.md`](README.md): the Architecture section, the tech-stack test count, the AI-tools archive links, and one anchor link.

**Verification**

- Each Mermaid block was extracted and rendered with `@mermaid-js/mermaid-cli@11.4.2` (via the system Chrome): all six parse. The overview and the match sequence were also looked at as PNGs.
- Facts were checked against the code: `api/scores.js`, `matchSubmit.js`'s order of checks, `useMatchSave`, the migrations, and `GameSession`'s `onGameOver({ ...scoreEvents(mode, events), events })`. An early label, `onGameOver(summary, event log)`, was corrected to a single summary that carries the log.
- `npm test` (436 passed) and `npm run build` pass. The entry chunk is 3.62 kB gzip, so the README's 3.6 kB claim holds. `npx prettier --check README.md` passes (Markdown is in `.prettierignore` anyway).

**Collaboration**

- The agent found that ARCHITECTURE.md still called `matchCheck.js` "not yet wired to a route", although `matchSubmit.js` runs it, and asked before going beyond the README.

### Interaction 2 — ARCHITECTURE.md fix and commit

**User Prompt**

> /prompt-history fix the ARCHITECTURE.md line too, then commit

**Agent Outcome**

- [`ARCHITECTURE.md`](ARCHITECTURE.md): `matchCheck.js` is now described as what `matchSubmit.js` runs before scoring.
- This session is logged here, and the README, ARCHITECTURE.md and this file are committed on `improvement/Readme`. Nothing is pushed.

**Collaboration**

- The user approved the README as presented and chose to include the ARCHITECTURE.md correction in the same commit.

### Interaction 3 — PR body for `improvement/Readme` → `main`

**User Prompt**

> Pushed, write the PR body

**Agent Outcome**

- **The body:** written to the agent's scratchpad (`PR-readme.md`) for the user to paste. It follows the `pr` skill's template:
  - **Summary:** a diff sketch of the README's new architecture subsections (one line per diagram and what it traces), the test count and archive links, the ARCHITECTURE.md line and the new history session. It also names the code each diagram was checked against.
  - **Evidence:** the old ASCII block and the stale `matchCheck.js` line, then all six blocks rendering in mermaid-cli 11.4.2, plus 436 tests and the 3.62 kB entry chunk that the README's figures rely on.
  - **Merge Danger:** a two-way door with a docs-only blast radius. The one risk named is GitHub's renderer disagreeing with mermaid-cli, so the user should look at the rendered README on the branch before merging.
- `improvement/Readme` tracks `origin/improvement/Readme`. The PR wasn't opened by the agent. This entry was committed at the user's "commit it".

---

## Session: 2026-10-29 (sixth)

**Objective:** Take stock of the project after the README PR, then add a hover hint on Profile that explains where to find mouse settings (`feature/mouse-tool-tip`).

### Interaction 1 — SITREP after the README merge

**User Prompt**

> /sitrep

**Agent Outcome**

- A read-only report: `main` is clean and level with `origin/main` at `d7edb78`. All 31 tracked milestones (M0–M9, U0–U7, S0–S5, I0–I3) are Done and merged, and no plan is active.
- Gaps noted, none blocking: CLAUDE.md's Workflow still names `improvement/insights` as the current work. The known limits recorded in the plans are a player replaying their own log under a fresh ticket (`PLAN-SCORING.md`), no cleanup of expired matches, and the deferred prefill of the hardware fields (`PLAN-INSIGHTS.md`).

### Interaction 2 — Where to find DPI and polling rate

**User Prompt**

> start a new branch, `feature/mouse-tool-tip`, where on hover, a user can learn where to find mouse setting info:
>
> *(pasted: "Not sure what your DPI and polling rate are?" with two steps, "Check your mouse's software" (G HUB, Synapse, SteelSeries GG, iCUE, Glorious Core; "DPI"/"CPI", "Polling Rate"/"Report Rate") and "Look up your mouse model" (the spec page's defaults))*

**Agent Outcome**

- Created `feature/mouse-tool-tip` from `main` (`d7edb78`). It has no upstream yet.
- **The trigger:** the pasted heading, "Not sure what your DPI and polling rate are?", is a small dotted-underline button under the Mouse settings panel's DPI and polling-rate fields. Hovering, focusing or tapping it opens the two steps, with the user's wording kept as given.
- **`Tooltip` grows two options** instead of a second overlay component:
  - `align`: `center` (the default) or `start`, which lines the hint up with the trigger's left edge so it doesn't run off a phone screen from the panel's left column.
  - `size`: `sm` (the default, 18rem) or `lg` (24rem), so the two steps don't stack into a tall column.
- **Hoverable hint:** the gap above the box is now padding on the positioned element rather than margin, so the pointer can move from the trigger onto the hint without closing it (WCAG 1.4.13). The landing page's "Start Training" hint looks the same.

**Rationale**

- The pasted heading is a question the player asks, so it works as the trigger's label and isn't repeated inside the hint.
- The steps are built from `block` spans, not `<p>` or `<ol>`, because the tooltip element is a `<span>` (phrasing content). A screen reader hears the hint flattened as the trigger's description, so list semantics would be lost anyway.
- No new dependency.

**Changes**

- [`src/components/Tooltip/Tooltip.jsx`](src/components/Tooltip/Tooltip.jsx): the `align` and `size` maps, and the padding bridge.
- [`src/components/HardwareInsight/MouseSetupHelp.jsx`](src/components/HardwareInsight/MouseSetupHelp.jsx) (new): the trigger and the two steps.
- [`src/components/HardwareInsight/HardwareInsight.jsx`](src/components/HardwareInsight/HardwareInsight.jsx): the help sits across both columns under the fields.
- [`src/components/HardwareInsight/MouseSetupHelp.test.jsx`](src/components/HardwareInsight/MouseSetupHelp.test.jsx) (new): the trigger's accessible description, and both steps on hover.

**Verification**

- `npx vitest run`: 70 files, 438 tests pass (436 before, plus the two new ones).
- `npm run lint`, `prettier --check src` and `npm run build`: clean.
- taste-skill `lint.mjs --app` on `Tooltip/`, `HardwareInsight/` and `StartTrainingButton.jsx`: 0 FAIL, 0 WARN.
- **Rendered check:** Profile needs a Google sign-in, which `inspect.mjs` can't do, so the user looked at the hint on the running app and replied "looks good". This entry was committed at the user's "commit the changes".
