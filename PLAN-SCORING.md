# Plan: Server-checked scoring

The plan and milestone tracker for closing the open anti-cheat action item on `hotfix/server-checked-scoring`. It answers the black-box audit of 2026-10-29 (Findings 1 and 2) and the README's "Server-authoritative scoring" next feature.

## Context

`POST /api/scores` takes the finished match's `{ mode, score, accuracy, reactionTime }` from the browser. The server checks ownership (the JWT's `sub`) and bounds (`api/_lib/scoreInput.js`, mirrored by `CHECK`s in `db/migrations/001_init.sql`), but the bounds are sanity limits for every mode at once: any integer score up to 10,000,000 passes. That's how a 9,999,999 Survival score reached the all-time board on 2026-10-28.

### The audit, checked against the code

| Audit claim | Holds? | Evidence |
|---|---|---|
| **F1:** scores are pre-calculated by the client and trusted | **Yes** | `src/services/scores.js` posts `ScoreManager.summary()`'s figures; nothing ties them to a match that was played. |
| **F1:** "without … strict bounds checking" | **Partly** | Bounds exist (`scoreInput.js`, tested in `scoreInput.test.js`) but are mode-blind and loose: 9,999,999 is inside them. |
| **F2:** API routes lack server-side validation, so direct calls bypass UI guardrails (e.g. DPI) | **No** | `hardwareAdvice.parseSetup` checks DPI as an integer in 100–32,000 and the polling rate against an enum; `/api/leaderboard` checks `view`; `/api/insights/platforms` takes no body; unknown keys are dropped. Each has unit tests. |
| **F2 remedy:** add Zod to every route | **Rejected** | It would replace tested pure validators with a dependency and add no check they lack (the dependency rule in CLAUDE.md). The real gap F2 points at, cross-field consistency, is F1's fix. |
| Strength: "24-hour global" insight limit | Detail | It's per player and per kind: 5 fresh answers in any rolling 24 h (`insightPolicy.js`). |

The one validation gap worth closing outside F1: `readJson` reads a body of any size (Vercel caps it at 4.5 MB). S1 gives it a limit, since S3's event log makes bodies larger.

## Approach

**The server computes the score.** The client stops sending `score`, `accuracy` and `reactionTime`. It sends a server-issued **match id** and the match's **event log** (each hit and miss with its game-time stamp). The server checks the log for plausibility against the mode's own configuration and the wall-clock time since the match was issued, then derives the figures itself with the same pure function the client uses for its results screen.

What this buys, honestly stated:

- An impossible score becomes **unrepresentable**, not just out of bounds: the score is a function of hits, and hits are capped by how fast the mode spawns targets in the time that passed.
- A score can't be posted without a match that was started on the server, at most once, by the same player, in the same mode, after enough real time.
- **It is not proof of a human.** A bot that fabricates a plausible log can still post a top-player score. Closing that needs input-level replay or heuristics (see Rejected), and is out of scope.

## Decisions (2026-10-29)

| Topic | Choice |
|---|---|
| Match identity | A `matches` row per started match (`uuid` id, `user_id`, `mode`, `started_at`, `submitted_at`). A DB row instead of the README's signed token: single use and expiry come from SQL, and no new secret is needed. |
| Issue timing | `POST /api/matches` when the player presses Start, in parallel with the engine starting, so there's no added latency. Signed-out players don't request one (their scores aren't saved). The server's `started_at` is then slightly *after* the real start; a small tolerance covers it. |
| Event log | `[{ t, kind: 'hit', spawnedAt } \| { t, kind: 'miss' } \| { t, kind: 'expire' }]`, `t` and `spawnedAt` in game-time ms from the same accumulator as `GameSession`'s `elapsed`, so pausing doesn't count. `spawnedAt` (not the target's age) lets the server derive Survival's ramped target value exactly. |
| Shared scoring | New pure `src/game/scoring.js`: `targetValueAt(mode, seconds)` (moved out of `GameSession.applyDifficulty`) and `scoreEvents(mode, events)` → `{ score, hits, misses, accuracy, averageReactionMs }`. `GameSession` and `api/_lib` both import it, as `scoreInput.js` already imports `modes.js`, so client and server can't drift. The results screen shows `scoreEvents`' figures, so what the player sees is what's stored. |
| Plausibility checks | Pure `api/_lib/matchCheck.js`, each failure named in the 400 like today's `invalid` list: times ascending and ≥ 0; a hit's `spawnedAt` ≤ `t` and within that target's lifespan; hits ≤ `maxTargets + ⌊t / minSpawnInterval⌋`; clicks per rolling second ≤ a human cap; average reaction ≥ a human floor; timed modes: every `t` ≤ duration, and wall-clock since `started_at` ≥ duration − tolerance; Survival: misses + expiries reach `missLimit`, and the last `t` ≤ wall-clock elapsed + tolerance. |
| Thresholds | Named constants, calibrated in S2 against the user's own real matches before they're enforced. Starting values: click cap 15/s, reaction floor 120 ms average, tolerance 2 s. |
| Ticket limits | A match expires unsubmitted after its duration plus 30 min (Survival: 2 h). At most 20 matches issued per player per 10 min, so parallel tickets can't flood the board. Timed modes are self-limiting at one save per 30 s per ticket. |
| `scores` table | Gains `match_id uuid unique references matches`, nullable so the legacy rows stay valid; every new insert sets it. The 10M `CHECK` stays as the last line of defence. |
| Validation library | No Zod (see the audit table). The new validators are pure functions with tests, like the existing ones. |
| Branch | `hotfix/server-checked-scoring`, created from `main` with this session's uncommitted prompt-history entry. Merged by PR like `refactor/UI`. |

### Rejected

- **Full deterministic replay** (seeded RNG, fixed timestep, the client sends raw pointer input and the server re-runs `Spawner` and `Collision`): the strongest check, but it rewrites the engine's frame-`dt` loop and its `Math.random` spawns, and a bot can still produce valid input. Worth it only if the board ever carries stakes.
- **Bounds-only fix** (per-mode max scores in `scoreInput.js`): small, but the client still invents every figure, and a cheater just posts the per-mode maximum.
- **A signed JWT match token:** a second signing secret to manage, and single use would still need a table.

### Settled at S0 (the user's choices, both the recommended options)

| Topic | Choice |
|---|---|
| Legacy rows | Scores without a `match_id` **stay** on the boards. S5's read-only report lists any that fail the new bounds, and the user deletes them in the Neon Console, as on 2026-10-28. *Rejected:* hiding `match_id is null` rows from the public boards. |
| Deploy order | Once S4 deploys, the old client's body is **rejected** with a 400. A tab still on the old bundle gets the new one on reload. *Rejected:* a legacy submission path, which would keep the hole open. |

## Workflow

- Work happens on `hotfix/server-checked-scoring`. Push with an explicit refspec (`git push -u origin hotfix/server-checked-scoring:refs/heads/hotfix/server-checked-scoring`); the branch has no upstream yet.
- Each milestone stops for review **before** committing, and the next one starts only after approval. A milestone's steps are detailed when it starts.

## Milestones

| # | Status | Milestone | Key files |
|---|---|---|---|
| S0 | Done | **Plan + docs.** This plan, the two open choices settled, CLAUDE.md's document list and workflow updated for this branch. | `PLAN-SCORING.md`, `CLAUDE.md` |
| S1 | Planned | **Shared scoring and the event log (client only).** `src/game/scoring.js` (`targetValueAt`, `scoreEvents`) with tests. `GameSession` records the event log and its summary comes from `scoreEvents`; a test plays a scripted session and checks the log reproduces its live score. `readJson` gains a byte limit. No API change yet, so the app keeps working. | `src/game/scoring.js`, `GameSession.js`, `ScoreManager.js`, `api/_lib/http.js` |
| S2 | Planned | **Plausibility checks.** `api/_lib/matchCheck.js`, pure, with tests per rule and per mode (a real log passes; a 9,999,999 log, a too-fast log, a too-early submit and a non-ascending log each fail by name). Calibrate the thresholds against logs from the user's own matches under `npm run dev:full`. | `api/_lib/matchCheck.js`, `api/_lib/matchCheck.test.js` |
| S3 | Planned | **Matches table and `POST /api/matches`.** Migration `004_matches.sql` (`matches`, `scores.match_id`, `CHECK`s), `matchStore` with the issue limit, the route, and `services/matches.js`. Unused by the client until S4. | `db/migrations/004_matches.sql`, `api/matches.js`, `api/_lib/matchStore.js` |
| S4 | Planned | **`POST /api/scores` on matches.** Body `{ matchId, events }`. In one transaction: claim the match (owner, mode, unexpired, unsubmitted), run `matchCheck`, insert the computed figures with `match_id`. `scoreInput.js` becomes the body shape check. `GameArea` requests the match on Start and posts the log; the save status covers a missing or rejected ticket. | `api/scores.js`, `api/_lib/scoreInput.js`, `GameArea.jsx`, `services/scores.js` |
| S5 | Planned | **Legacy data and docs.** The read-only report of legacy rows that fail the new bounds (`scripts/`). ARCHITECTURE.md (routes, data model, the score flow, Security's "Scores are still computed in the browser"), README's next-features list, and an audit-response note. | `scripts/`, `ARCHITECTURE.md`, `README.md` |

## S0 detail

1. Write this plan, with the audit checked against the code.
2. Settle the two open choices (above).
3. `CLAUDE.md`:
   - The document list leads with PLAN-SCORING.md. PLAN-UI.md stays listed for its design rules, now marked done.
   - The workflow names this branch and plan.
   - The stack's gameplay row no longer says the engine is unchanged from v1, since S1 adds the event log.
4. Stop for review.

### S0 verification

- Docs only: no code changed, so lint, tests and build weren't run.
- `npm run format:check` passes, but it doesn't cover these files: `.prettierignore` excludes `*.md`.
- The links in CLAUDE.md's document list were checked to resolve to files in the repo root.

## Verification (every gate)

- `npm run lint`, `npm run format:check`, `npm test` and `npm run build` pass.
- New logic is pure and covered by Vitest without mocks: `scoring.js`, `matchCheck.js`, the route handlers' validation paths.
- **From S4:** under `npm run dev:full`, signed in:
  - A real match in each mode saves, and the stored score equals the results screen's.
  - Replaying the same request (DevTools → Copy as fetch) is rejected as already submitted.
  - A request with `score: 9999999` added is stored with the computed score, and a hand-edited log with extra hits is rejected by name.
  - Submitting a Gridshot match from the console 5 s after Start is rejected as too early.
- **Not runnable here:** the Vercel preview and production, which need the user's push; a real Google sign-in.
