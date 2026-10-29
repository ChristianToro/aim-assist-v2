# Response to the 2026-10-29 audit

The black-box security and architecture audit of the deployed app made two findings. This note gives the response to each one: whether it held, what changed, and what risk remains. The detail, decisions and verification of every step are in [PLAN-SCORING.md](PLAN-SCORING.md) (milestones S0–S5, on `hotfix/server-checked-scoring`).

## Summary

| Finding | Severity (audit) | Verdict | Outcome |
|---|---|---|---|
| **F1:** `POST /api/scores` trusts client-computed scores | High | **Held** | Fixed. The server now computes every new score from the match's event log, after plausibility checks. |
| **F2:** API routes lack server-side schema validation | Medium | **Didn't hold** | No validation gap was found. One related hardening was made: a size limit on every request body. |

## F1: client-computed scores

**It held.** The browser posted `{ mode, score, accuracy, reactionTime }`. The server checked ownership and bounds, but the bounds were sanity limits shared by every mode, so any score up to 10,000,000 passed. That's how a 9,999,999 Survival score reached the all-time board on 2026-10-28.

**What changed.**

- **Matches are issued by the server.** `POST /api/matches` records each signed-in match as it starts: the mode, the database's start time, and a ticket that saves once. At most 20 can be issued per player in any 10 minutes.
- **The client sends evidence, not a score.** `POST /api/scores` takes `{ matchId, events }`, where `events` is the log of every hit, miss and expiry in game time. A `score` field in the body is ignored. The old body is refused.
- **The server checks the log.** `api/_lib/matchCheck.js` checks it against the match's mode and the real time since the match was issued:
  - **Engine rules** (exact, from the engine's own behaviour): order; expiries; each hit inside its target's lifespan; spawn rate; duration; miss limit.
  - **Human limits:** 15 clicks a second at most, and a 120 ms average reaction at least. Both were checked against real matches.
  - **Wall-clock rules:** a timed match can't be submitted early, and game time can't exceed real time.
- **The server computes the figures.** It uses the same pure function the results screen uses (`src/game/scoring.js`). One SQL statement claims the match and stores the score, so a replayed request saves nothing. A composite foreign key makes the database refuse a score whose player or mode differs from its match's.
- **Legacy rows.** Scores saved before this change stay on the boards. `npm run db:legacy-report` lists any that exceed what a passing log could earn in their mode, or that fail the reaction floor, so they can be removed by hand.

**What remains.** These checks make an impossible score unrepresentable, but they don't prove a human played:

- A bot that fabricates a plausible log can still post a top-player score.
- A player can resubmit one of their own real logs under a new ticket. That duplicates a score, but can't raise it.

Closing either would take deterministic replay of raw input, which was rejected as out of proportion for a free practice board (see PLAN-SCORING.md, "Rejected").

## F2: missing schema validation

**It didn't hold.** Every route already validated its input with tested pure functions before this work started:

- the DPI, bounded at 100–32,000, and the polling rate against a fixed list, in the hardware insight route
- `view` in `/api/leaderboard`
- every field of a score submission

Unknown keys were dropped, and SQL `CHECK` constraints backed the same bounds. The UI's limits were never the only check.

**Remedy not adopted: Zod on every route.** It would replace tested validators with a dependency and add no check they lack. The real gap F2 pointed toward, the consistency of a submission as a whole, was F1's, and the event-log checks close it.

**One gap closed anyway.** `readJson` read a body of any size, up to Vercel's 4.5 MB cap. It now refuses anything over 16 KB with a 413, or over 512 KB for a score submission's event log.
