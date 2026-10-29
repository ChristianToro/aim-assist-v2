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

- Work happens on `hotfix/server-checked-scoring`, which tracks `origin/hotfix/server-checked-scoring`. Push with an explicit refspec (`git push origin hotfix/server-checked-scoring:refs/heads/hotfix/server-checked-scoring`).
- Each milestone stops for review **before** committing, and the next one starts only after approval. A milestone's steps are detailed when it starts.

## Milestones

| # | Status | Milestone | Key files |
|---|---|---|---|
| S0 | Done | **Plan + docs.** This plan, the two open choices settled, CLAUDE.md's document list and workflow updated for this branch. | `PLAN-SCORING.md`, `CLAUDE.md` |
| S1 | Done | **Shared scoring and the event log (client only).** `src/game/scoring.js` (`targetValueAt`, `scoreEvents`) with tests. `GameSession` records the event log and its summary comes from `scoreEvents`; a test plays a scripted session and checks the log reproduces its live score. `readJson` gains a byte limit. No API change yet, so the app keeps working. | `src/game/scoring.js`, `GameSession.js`, `ScoreManager.js`, `api/_lib/http.js` |
| S2 | Done | **Plausibility checks.** `api/_lib/matchCheck.js`, pure, with tests per rule and per mode (a real log passes; a 9,999,999 log, a too-fast log, a too-early submit and a non-ascending log each fail by name). Calibrate the thresholds against logs from the user's own matches under `npm run dev:full`. | `api/_lib/matchCheck.js`, `api/_lib/matchCheck.test.js` |
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

## S1 detail

1. **`src/game/scoring.js`** (new, pure; imports only `ScoreManager.js` and `utils/math.js`, with explicit extensions so Node can load it from `/api`):
   - `targetValueAt(mode, spawnedAtMs)`: the mode's base value, ramped for Survival. It takes **ms**, not the seconds in the Decisions table, to match the log's unit.
   - `applyEvent(scores, mode, event)`: feeds one event to a `ScoreManager`. Expiries count as misses.
   - `scoreEvents(mode, events)`: replays a whole log through a fresh `ScoreManager` and returns its `summary()`, so the result has the shape the results screen already reads.
2. **`ScoreManager`**: `registerHit(value, reactionMs)` replaces `registerHit(target)`, and reaction times are kept in ms.
3. **`GameSession`**:
   - Every hit, miss and expiry goes through `record`, which logs the event and scores it with `applyEvent`. The live HUD and the replay therefore share one code path.
   - Clicks and expiries are stamped with the game time *before* the frame advances it, which is the world the player clicked on. That makes a hit's `t − spawnedAt` equal to its target's age, and keeps every `t` of a timed mode within its duration.
   - `onGameOver` sends `{ ...scoreEvents(mode, events), events }`. `services/scores.js` still picks only the three old fields, so the API is unchanged.
4. **A target's value moved out of the engine.** `Spawner` stamps `spawnedAt` (game-time ms) on each target and no longer carries `targetValue`. `Target.value` is gone, and `applyDifficulty` no longer ramps the value. The value exists only in `targetValueAt`, so the engine and the server can't disagree about it.
5. **`readJson(request, { maxBytes })`**: the default limit is 16 KB, and S4 will pass a larger one for the log. An oversized body gets a 413 `{ error, maxBytes }`. A declared `Content-Length` over the limit is refused before the body is read, and the bytes actually read are checked as well.
6. **ARCHITECTURE.md**'s engine table gains `scoring.js`, and its `GameSession` and `ScoreManager` rows now mention the event log.

### S1 verification

- `npm run lint`, `npm run format:check`, `npm test` (56 files, 306 tests) and `npm run build` pass.
- New tests:
  - `scoring.test.js`: the value ramp, the combo multiplier and its reset, expiries, and reaction stats.
  - `GameSession.test.js`: scripted Gridshot and Survival matches, with Survival played past its 90 s ramp. Replaying the log reproduces the live HUD's score, hits, misses and max combo. Events ascend. Each hit's `t − spawnedAt` is within 1 ms of the clicked target's age. Speed's events all fall within 30 s. `reset()` leaves the last summary's log intact.
  - `http.test.js`: the limit's edge cases (exactly at the limit, bytes vs characters, a declared length, the default).
- `node -e "import('./src/game/scoring.js')…"` loads it in plain Node and scores a ramped Survival hit as 300.
- **The user's browser check passed:** in a hand-played match, the results screen showed the same score as the final HUD.

## S2 detail

1. **`src/game/difficulty.js`** (new, pure): `RAMP_FACTORS`, `rampProgress(mode, ms)` and `settingAt(mode, setting, base, ms)`. These are Survival's ramp, moved out of `GameSession.applyDifficulty`, which now loops over `RAMP_FACTORS`. `targetValueAt` uses `rampProgress`. The server can then check a log against the exact lifespan and spawn interval the engine used when it spawned each target.
2. **`api/_lib/matchCheck.js`** (new, pure): `checkMatch({ mode, events, elapsedMs })` returns the names of the failed rules, in the style of `scoreInput.js`'s `invalid` list. It takes a log that has already passed the body's shape check, which S4 adds.

   | Rule | Fails when |
   |---|---|
   | `order` | times go backwards, or start below 0 |
   | `expiry` | an `expire` appears in a mode where expiries don't cost a life |
   | `hitTiming` | a hit comes before its target's `spawnedAt`, or after that target's lifespan at spawn time (+1 ms rounding) |
   | `spawnRate` | the hit targets' sorted spawn times, starting from 0, are closer than the interval in force at the later one (−1 ms) |
   | `clickRate` | more than 15 hits and misses fall in any one-second window |
   | `reaction` | the average `t − spawnedAt` is under 120 ms |
   | `duration` | in a timed mode, a `t` is past the duration |
   | `tooEarly` | in a timed mode, `elapsedMs` is under the duration − 2 s |
   | `missLimit` | in Survival, misses and expiries don't reach the limit, or reach it before the last `t` |
   | `clock` | the last `t` is past `elapsedMs` + 2 s |

   **Changed from the Decisions table:**
   - **`spawnRate` replaces the hit-count bound** (`hits ≤ maxTargets + ⌊t / minSpawnInterval⌋`). The Spawner waits a full interval after the start and after each spawn, so this rule holds exactly for every real match. It's stricter than the count bound, and it also rejects a target hit twice, since two targets never share a spawn time.
   - **`clock` applies to every mode**, not just Survival: game time can never pass wall-clock time.
3. **`src/game/testing/playMatch.js`** (new, test-only): a headless scripted player, at a 0.3 s minimum reaction, that both `GameSession.test.js` and `matchCheck.test.js` use.
4. **Calibration:**
   - **Data:** the user hand-played one match per mode under `npm run dev`, including spammy bursts, and the logs were exported to `api/_lib/fixtures/real-matches.json`. That file is listed in `.prettierignore`, so it stays as exported. The temporary `window.matchLogs` collector in `GameArea` was removed afterwards.
   - **Real play against the thresholds:** a peak of 8 clicks/s against the cap of 15, and a lowest average reaction of 648 ms against the floor of 120 ms (fastest single hit 366 ms). Both thresholds stay where they are. They're meant to reject inhuman logs, and one player's matches can't justify tightening them toward faster players.
   - **The rounding slack is needed:** in the real Survival match, two hit spawns were 0.01 ms closer than the interval. The −1 ms allowance in `spawnRate` absorbs that.
   - **Not yet calibrated:** the wall-clock tolerance (2 s) used by `tooEarly` and `clock`. It needs a server-issued `started_at`, so it's checked in S4's manual checks.
5. **ARCHITECTURE.md** lists `difficulty.js` in the engine table and `matchCheck.js` among the `api/_lib` modules.

### S2 verification

- `npm run lint`, `npm run format:check`, `npm test` (58 files, 339 tests) and `npm run build` pass.
- `matchCheck.test.js` (29 tests):
  - Each of the six real matches passes, and the fixture covers every mode.
  - A scripted match in each mode passes, and so does an empty Gridshot log.
  - Each rule fails by name:
    - a 9,999,999 log (`spawnRate`, `clickRate`, `duration`)
    - a too-fast log (`reaction`)
    - a submit 5 s after Start (`tooEarly`, `clock`)
    - a non-ascending log
    - an event past the duration
    - an expiry in Gridshot
    - a target hit twice
    - a hit after its lifespan, or before its spawn
    - Survival's ramped lifespan
    - a Survival match short of its miss limit, an empty one, and one that played on past the limit
    - game time ahead of the wall clock
- `difficulty.test.js` (4 tests): the ramp's progress and clamping, the ramped settings, and an `Infinity` base passing through unchanged.
- The randomized engine-log tests (`matchCheck` and `GameSession`) passed on 15 of 15 reruns.

## Verification (every gate)

- `npm run lint`, `npm run format:check`, `npm test` and `npm run build` pass.
- New logic is pure and covered by Vitest without mocks: `scoring.js`, `matchCheck.js`, the route handlers' validation paths.
- **From S4:** under `npm run dev:full`, signed in:
  - A real match in each mode saves, and the stored score equals the results screen's.
  - Replaying the same request (DevTools → Copy as fetch) is rejected as already submitted.
  - A request with `score: 9999999` added is stored with the computed score, and a hand-edited log with extra hits is rejected by name.
  - Submitting a Gridshot match from the console 5 s after Start is rejected as too early.
- **Not runnable here:** the Vercel preview and production, which need the user's push; a real Google sign-in.
