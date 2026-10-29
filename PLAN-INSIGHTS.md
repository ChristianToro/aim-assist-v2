# Plan: Past AI insights on Profile

The plan and milestone tracker for showing a player's earlier AI recommendations on their Profile page, on `improvement/insights`.

## Context

Every recommendation Claude generates is already saved: `insights` has one row per answer (`db/migrations/003_insights.sql`), and the table serves as both the cache and the daily limit (`api/_lib/insightRunner.js`). The player never sees those rows, though:

- The Profile panels (`HardwareInsight`, `PlatformInsight` in the shared `InsightPanel`) start empty. `useInsight` runs only on a button click, because each fresh answer is a paid Claude call.
- Clicking Generate with unchanged stats returns the latest row as `cached`, so the only way to see your last answer is to ask for it again. Rows older than the latest are unreachable.
- The hardware answer's inputs (the DPI and polling rate the player typed) are stored only inside `input_hash`, so an old answer can't say what setup it was for.

## Approach

**Reading the history is free, so it loads on mount.** A new `GET` on each insight route returns the player's recent answers of that kind. Each panel opens on the latest one, and a picker lets the player switch to an older one. Generating still happens only on a click. A fresh answer goes to the top of the list, and a cached one is already there.

## Decisions (2026-10-29)

| Topic | Choice |
|---|---|
| What "previous" means | **Latest on load, plus history** (the user's choice). Each panel shows the player's latest saved answer when Profile opens, with no Claude call. A picker in the panel lists older answers, newest first, by date. *Rejected:* latest only, which leaves older rows unreachable. *Also rejected:* a separate history section, which keeps the panels empty on load. |
| Setup inputs | **Stored from now on** (the user's choice). Migration `005` adds a nullable `insights.context jsonb` column. New rows record the request's `context` (`{ setup }` for hardware, `{}` for platforms). A hardware answer then shows the setup it was for, e.g. "For 800 DPI at 1000 Hz". Rows saved before `005` have `null` and show no setup. |
| Route | `GET /api/insights/hardware` and `GET /api/insights/platforms`, beside the existing `POST`s: `POST` generates, `GET` lists. This adds no route files, and the path fixes the kind, so there's no `kind` parameter to validate. Response: `{ entries: [{ id, recommendation, context, model, generatedAt }] }`, newest first. |
| How many | The latest `HISTORY_LIMIT = 10` per kind. Older rows stay in the table, since they still count toward the limit window and the cache. The daily limit (5 per kind per 24 h) bounds how fast rows grow, so no retention job is needed. |
| Old shapes | Each row's `result` goes back through its kind's `parseAdvice` on read. A row that no longer parses (from an older `PROMPT_VERSION`'s shape) is left out instead of breaking the panel. Both kinds are at version 1 today, so nothing is dropped yet. |
| `POST` response | Gains `id` and `context`, so the client can put a fresh answer at the top of its list (and tell a cached answer is already there) without fetching the list again. |
| Client state | The history read follows the read-hook pattern (keyed result and derived loading, like `useUserProfile`). `useInsight` keeps its click-only generate. The panel shows the selected entry, which defaults to the latest. |
| History failure | Not fatal. If the list fails to load, the panel works as it does today, with one quiet line and a Retry. |
| Branch | `improvement/insights`, created at `2982038` (the tree `main` merged in PR #3). No upstream yet. Push with an explicit refspec: `git push -u origin improvement/insights:refs/heads/improvement/insights`. |

### Not in scope

- Prefilling the hardware fields from the latest answer's setup. It would be cheap once `context` is stored, but nobody asked for it. It's noted here as a follow-up.
- Deleting or hiding past answers. Rows go only when the account is deleted (`on delete cascade`).
- Comparing two answers side by side.

## Workflow

- Each milestone stops for review **before** committing, and the next one starts only after approval. A milestone's steps are detailed when it starts.
- The user applies migrations to Neon (`npm run db:migrate`) and pushes.

## Milestones

| # | Status | Milestone | Key files |
|---|---|---|---|
| I0 | Done | **Plan + docs.** This plan with the two choices settled. CLAUDE.md's document list and workflow point at it. The prompt history is rotated (854 lines). | `PLAN-INSIGHTS.md`, `CLAUDE.md`, `PROMPT-HISTORY.md` |
| I1 | Done | **Server: store the inputs, list the history.** Migration `005_insight_context.sql`. `insightStore` gains `history(uid, kind, limit)` and saves `context`. The runner returns `id` and `context`. `requestInsight` passes `context` to the store. Each insight route adds a `GET`, and a pure `historyEntries(rows, parseAdvice)` drops rows that don't parse. Tests: the runner with its in-memory store, `historyEntries`, and a throwaway PGlite check of the migration and the query. ARCHITECTURE.md's routes and data model. | `db/migrations/005_insight_context.sql`, `api/_lib/insightStore.js`, `api/_lib/insightRunner.js`, `api/_lib/insightRequest.js`, `api/insights/*.js` |
| I2 | Done | **Client: open on the latest answer, pick older ones.** `services/insights.js` list calls, a read hook for the history, `InsightPanel`'s picker and "Generated …" footer for a saved entry, and `HardwareInsight`'s setup line. A fresh answer goes to the top of the list. Tests for the service, the hook, the panel and Profile. ARCHITECTURE.md's data-fetching paragraph. | `src/services/insights.js`, `src/hooks/`, `src/components/InsightPanel/`, `src/components/HardwareInsight/`, `src/components/PlatformInsight/` |
| I3 | Done | **Final pass.** Run against Neon with `005` applied: the user checks the page and supplies screenshots, then the taste-skill app-screen checks follow (`lint.mjs`). README's features list, and the PR body. | `README.md`, `ARCHITECTURE.md` |

## I0 detail

1. Write this plan, with the two scope choices settled by the user.
2. `CLAUDE.md`: the document list leads with PLAN-INSIGHTS.md, and PLAN-SCORING.md is marked done and merged. The workflow paragraph names `improvement/insights`.
3. Rotate `PROMPT-HISTORY.md` (854 lines, past the ~800 cap) to `PROMPT-HISTORY-2026-Q4-03.md`, and open this session in a fresh file.

## I1 detail

1. `db/migrations/005_insight_context.sql`: `insights.context jsonb`, nullable, with a `CHECK` that it's an object.
2. `insightStore.js`:
   - `save` stores `context` and returns `id`.
   - `latest` reads `id` and `context`.
   - The new `history(uid, kind, limit)` reads the player's rows newest first.
   - `id` is sent as text, since a bigint isn't JSON-safe in every driver.
   - Ties on `created_at` break by `insights.id`. A bare `id` there would sort by the text alias.
3. `insightHistory.js` (new, pure): `HISTORY_LIMIT`, `toEntry(row)` (the one response shape for `POST` and `GET`), and `historyEntries(rows, parseAdvice)`.
4. `insightRunner.js` takes `context`, saves it, and returns `toEntry(...)` plus `cached`. `requestInsight` passes `context`. `listInsights` reads the history through the kind's `parseAdvice`.
5. A `GET` on `api/insights/hardware.js` and `platforms.js`. `db.js` exports `insightStore`.
6. Tests: the runner's in-memory store gains `id` and `context`, and `insightHistory.test.js` is new. ARCHITECTURE.md covers the routes, `_lib` modules, data model and AI-insights flow.

### I1 verification (2026-10-29)

- `npm run lint`, `npm run format:check`, `npm test` and `npm run build` pass.
- PGlite (`003`, a legacy row, then `005`, all against the real `insightStore`), 15 checks:
  - The legacy row keeps a null `context`.
  - `history` returns only the caller's rows of that kind, newest first, at most 10, with no hash or `user_id`.
  - The `CHECK` refuses a non-object `context`.
  - The runner's cached answer is the same row as its fresh one, with the same `id` and `context`.
  - Ties order by the numeric id across 99 → 100. The check fails if the `insights.` qualifier is removed.
- Not run: the routes against Neon. `005` isn't applied there yet; that's the user's step in I3.

## I2 detail

1. `services/insights.js`: `listHardwareInsights()` and `listPlatformInsights()` return the `GET`'s `entries`.
2. `utils/insightHistory.js` (new, pure):
   - `mergeEntries(added, saved)` puts answers generated on the page together with the loaded ones, newest first. An id in both keeps the generated copy, which carries `cached`.
   - `shownEntry(entries, selectedId)` returns the picked entry, else the latest.
   - `formatGeneratedAt` formats an entry's date.
3. `hooks/useInsightHistory.js` (new): the read-hook pattern (keyed result, derived loading, `reload`), plus `add` (a generated answer goes on top and is shown) and `select`. The added entries and the selection are kept per uid.
4. `useInsight(request, onAnswer)`: it no longer holds the answer and hands it to the history instead. Its state is just `{ error, isLoading }`.
5. `InsightPanel` takes `history` and renders `children(entry)`:
   - While the history loads it says "Loading your last recommendation".
   - A failed load shows one quiet line with a Retry, and Generate still works.
   - With two or more entries, an `InsightPicker` (a labelled "Showing" select, "Latest, …" first) sits above the answer.
6. `HardwareInsight` shows the answer's setup line (`describeSetup` in `utils/mouseSetup.js`). The square-control class moves to `styles/field.js`, which the picker shares. Both panels take `uid` from Profile.
7. Tests cover the list services, `mergeEntries`/`shownEntry`, `describeSetup`, the hook, the panel's states and Profile end to end. ARCHITECTURE.md's hooks row, styles row and data-fetching paragraph are updated.

### I2 verification (2026-10-29)

- `npm run lint`, `npm run format:check`, `npm test` and `npm run build` pass.
- In the browser: the production build under `vite preview`, signed in through the faked session from U7. `/api/me`, the personal board and both `GET`s were answered locally, with three hardware entries (full setup, no setup, a legacy `null`) and one platforms entry.
  - Dark and Light at 1440, and Dark at 390.
  - Profile opens on the latest answers with their setup line, and the picker lists "Latest, …" then two dates.
  - Two ↓ presses on the focused picker showed the legacy entry, which has no setup line.
  - At 390 there's no sideways scroll, and the console has no errors.
- Not run: real `GET`s against Neon, which is I3.

## I3 detail

1. Live checks against Neon, all read only:
   - `005` is recorded.
   - Every stored answer still parses.
   - The routes under `vercel dev` refuse a request without a token.
2. taste-skill `lint.mjs --app` over the changed UI. `inspect.mjs` can't sign in with Google, as settled in PLAN-UI.md, so the rendered check is I2's faked-session screenshots plus the user's real sign-in.
3. README: the AI insights feature line, and a *Past insights* paragraph in the project plan.
4. The PR body for `improvement/insights` → `main`, written to the agent's scratchpad for the user to paste.

### I3 verification (2026-10-29)

- The user applied `005` (`npm run db:migrate`). A read-only query confirmed:
  - `schema_migrations` lists `001`–`005`.
  - `insights.context` is a nullable `jsonb`.
  - The 12 existing rows have no `context` yet, as expected for answers saved before `005`.
- All 12 stored answers (7 hardware, 5 platforms, across 2 players) pass their kind's `parseAdvice`, so the history skips none. The busiest account has 5 hardware and 3 platforms answers, so its picker will show.
- `vercel dev`: `GET` and `POST` on both insight routes answer 401 without a token, and `/api/health` reports the database up.
- `lint.mjs --app` on `InsightPanel/`, `HardwareInsight/`, `PlatformInsight/`, `Profile.jsx` and `styles/field.js`: 0 FAIL, 0 WARN.
- Lint, format check, tests (436) and build pass.
- *2026-10-29, user report:* under `npm run dev:full`, signed in, an Update with a new DPI produced an entry reading "For 850 DPI", and the picker listed every generated answer.

## Verification

- Every milestone: `npm run lint`, `npm run format:check`, `npm test` and `npm run build` pass.
- I1: the PGlite check runs `003`, `004` and `005` and seeds rows with and without `context`. `history` returns them newest first, at most 10, and only the caller's rows of that kind.
- I2: tests cover a panel that opens on the latest saved answer, picking an older one, a fresh answer going to the top, a cached answer not being duplicated, and a failed list leaving Generate usable.
- I3: the user runs `npm run db:migrate` and then `npm run dev:full`. Profile opens on the last answers with no Claude call, and an answer generated afterwards shows its setup.
