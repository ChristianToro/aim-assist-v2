# Prompt History

This document records meaningful development interactions between the user and
AI coding agents working on this project. It focuses on requests, outcomes,
implementation decisions, verification, and human-agent collaboration rather
than preserving a raw conversation transcript.

Generated code is included verbatim when reasonably concise. Extensive
implementations are referenced through their canonical repository files.

> This file is an engineering collaboration record, not a source of truth for
> application behavior. The repository itself remains authoritative.

> Prior history: [PROMPT-HISTORY-2026-Q4.md](PROMPT-HISTORY-2026-Q4.md) (v2 sessions through M5),
> and [Prototype/V1-PROMPT-HISTORY.md](Prototype/V1-PROMPT-HISTORY.md), the v1 prototype's log.

---

## Session: 2026-10-27 (continued)

**Objective:** Continues the session that began in [PROMPT-HISTORY-2026-Q4.md](PROMPT-HISTORY-2026-Q4.md): the pre-M5 status check, then M5 (data API). The archive was rotated at about 800 lines, mid-session, so numbering continues from Interaction 4.

### Interaction 4 — M5 approved and committed

**User Prompt**

> commit M5 and the doc changes

**Agent Outcome**

M5 was marked Done in PLAN-V2 and committed on `release/v2.0`, together with the M5 detail and verification and the history updates. The history file had reached about 800 lines, so it was archived with `git mv` as `PROMPT-HISTORY-2026-Q4.md`, and this file was started in its place. PLAN-V2's reference to the Neon Auth comparison (Interaction 8) now links to the archive.

**Verification**

Lint, format check, tests and build were last run at the review gate (Interaction 2), and no code has changed since. The signed-in checks of Interaction 3 cover the committed code.

### Interaction 5 — Milestone 6: client on `/api`, Firebase removed

**User Prompt**

> pushed, begin execution of M6

**Agent Outcome**

The user pushed M5. M6 was detailed in PLAN-V2 and implemented, and it stops at the review gate (status: In review), uncommitted. The browser now reaches data only through `/api`, via one helper, `apiFetch`. Firebase is gone from the code, config, dependencies and bundle. README's Firebase sections are left for M9, as planned.

**Rationale**

- **One fetch helper with a typed error.** `ApiError.status` lets `Leaderboard.jsx` word a 401 differently from an outage, which replaces the Firestore-code messages. A signed-out authenticated call fails before any request is made.
- **No uid arguments.** The service functions drop their `uid` and `user` parameters, because the server reads identity from the token. Keeping them would suggest the client chooses whose data it gets. The hooks still key their state by `uid`, so a different account never sees the previous one's result.
- **`toScoreSubmission` is pure** and tested without mocks. The fetch wrappers are tested by mocking `./api` (or `fetch` and `./auth` for the helper itself), which is the only practical seam for I/O.
- **`src/utils/dates.js` was deleted.** Its day and week keys existed only for Firestore's equality filters, and `/api` now computes the UTC windows.

**Changes**

- New: [`src/services/api.js`](src/services/api.js), with `api.test.js`, `scores.test.js` and `leaderboard.test.js`.
- Rewritten: `src/services/{users,scores,leaderboard}.js` and `users.test.js`.
- Edited:
  - `useUserProfile` and `useLeaderboard`: no uid passed to the services;
  - `GameArea`: no `user` passed when saving;
  - `Leaderboard.jsx` and its test: ISO dates and HTTP error messages;
  - `ProfileCard`: ISO dates;
  - `Footer`, `SessionHistory`: text and comment;
  - `vite.config.js`: Firebase chunk removed;
  - `.env.example`, `.gitignore`, `CLAUDE.md`: Firebase notes removed.
- Deleted: `src/firebase/config.js`, `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json` and `src/utils/dates{,.test}.js`, plus the `firebase` dependency.
- [`PLAN-V2.md`](PLAN-V2.md): M6 is In review, and the M6 detail, user steps and verification sections are added.

**Verification**

- Lint and format check pass. `npm test` passes with 116 tests, up from 109, and `npm run build` succeeds.
- The JS bundle is 156 kB gzip in total, with no Firebase chunk. A grep found no Firebase, Firestore or `googleapis` strings in `dist/`, and no `@firebase` packages in the lockfile.
- Under `vercel dev`, `/leaderboards` returns HTML, and the new service and component modules are served as `text/javascript`.
- **Not run:** the in-browser flow with Google sign-in. It needs the user. The five browser checks are listed in PLAN-V2's M6 verification, alongside the open M4 checks.

### Interaction 6 — M6 approved and committed

**User Prompt**

> browser checks pass; commit M6 and the doc changes

**Agent Outcome**

The user reported that the browser checks pass, which covers M6's five checks: the signed-out boards, the saved match, the entry appearing once per board, the profile stats, and a second match. M6 was marked Done in PLAN-V2, with the user's report recorded, and committed on `release/v2.0`. Firebase is now fully removed from the v2 code.

**Verification**

The user ran the browser checks. The M4 checks that are still open (reload, Safari or blocked third-party cookies, sign-out) weren't explicitly reported, so PLAN-V2 keeps them open. Lint, format check, tests and build last ran at the review gate (Interaction 5), and no code has changed since.

### Interaction 7 — Milestone 7: AI hardware recommendations

**User Prompt**

> pushed, begin execution of M7

**Agent Outcome**

The user pushed M6. The `claude-api` skill was consulted first, as PLAN-V2 asks, and M7 was then detailed and built. It stops at the review gate (status: In review), uncommitted.

`POST /api/insights/hardware` turns the caller's per-mode stats, plus an optional current DPI and polling rate, into a structured recommendation from Claude: a summary, then DPI, sensitivity and polling rate, each with a rationale. It sits on a reusable cache-and-rate-limit runner backed by a new `insights` table (migration `003`), which M8 will reuse.

The live parts are blocked on the user. `.env.local` has no `ANTHROPIC_API_KEY` (checked by variable name only), and `003` isn't applied on Neon.

**Rationale**

- **Model and request shape come from the skill, not memory.**
  - `claude-opus-5-5`, with `thinking` omitted (always on; disabling it returns a 400) and `effort: 'medium'` set explicitly.
  - Structured outputs with a plain JSON schema, which avoids a `zod` dependency.
  - `fallbacks: 'default'` for refusals, enabled because the skill makes it the default for this model.
  - SDK 1.3.0's types confirmed `fallbacks: 'default'` and `json_schema` output, and that the client constructs without a key.
- **The cache and the rate limit share one table.** The cache key is a sha256 of `{ PROMPT_VERSION, modeStats, setup }`, so an answer is reused until the player plays again, changes their setup, or the prompt changes. A cached answer doesn't count toward the 5-per-day cap and is still served while the player is at the cap. The cap is soft under concurrency, which is enough to bound cost.
- **Optional current setup.** The game has no DPI or sensitivity settings of its own, so without the player's current values the advice can only be absolute. The schema can't carry numeric bounds, so `parseAdvice` re-checks the DPI range and the polling-rate enum, and an out-of-range answer returns 502 rather than being shown.
- **Factory plus wiring again** (`structuredOutput.js` / `claude.js`), so the Claude-call handling is tested with a fake client and the SDK's real error classes, without network.

**Changes**

- New:
  - `db/migrations/003_insights.sql`;
  - `api/insights/hardware.js`;
  - `api/_lib/{insightPolicy,insightRunner,insightStore,structuredOutput,claude,hardwareAdvice}.js`, with tests for every pure or injectable one.
- Edited:
  - `api/_lib/scoreStore.js`: `modeStats`;
  - `api/_lib/db.js`: wires `insightRunner`;
  - `api/_lib/http.js`: `HttpError` can carry headers, used for `Retry-After`;
  - `.env.example`: `ANTHROPIC_API_KEY`;
  - `package.json` and the lockfile: `@anthropic-ai/sdk@^1.3.0`.
- [`PLAN-V2.md`](PLAN-V2.md):
  - M7 is In review;
  - the SDK dependency is justified;
  - M7 detail, user steps, cost bound and verification are added.

**Verification**

- Lint, format check and build pass. `npm test` passes with 154 tests, up from 116.
- PGlite with `001`–`003` passed 15 checks:
  - `modeStats` shape;
  - the `003` constraints;
  - the runner and store end to end: generate, cached repeat, 5 fresh then 429 with `Retry-After`, cached answer while limited, the limit lifting after 24 hours, per-kind and per-player counting, and the cascade on user deletion.
- The M5 PGlite checks still pass.
- Under `vercel dev`, the new route returns 401 with no token or a forged one, and 405 for GET.
- **Not run:** `003` on Neon and any real Claude call. Both wait on the key and the migration.

### Interaction 8 — M7 live check against Neon and Claude

**User Prompt**

> Key was added, pulled, and I rain the db migrate command. Live check is approved - run it and report back

**Agent Outcome**

`schema_migrations` listed `001`–`003`, and `ANTHROPIC_API_KEY` was present (checked by length, never printed). A scratch script under `vercel dev` did the following:

1. Signed up a temporary user and got its JWT.
2. Posted matches through `POST /api/scores`.
3. Exercised `POST /api/insights/hardware`, which made two real Claude calls.
4. Deleted the user.

10 of 11 checks passed as scripted:

- The 422s at 0 and 4 matches, and the 400 on a bad setup.
- A fresh recommendation in 12.2 s: 800 DPI, 1:1 pointer speed with acceleration off, 1000 Hz. The rationales were grounded in the per-mode numbers.
- A fresh answer for the 1600 DPI / 500 Hz setup in 15.4 s: keep 1600, raise the polling rate to 1000 Hz.
- 2 rows saved, and the cleanup was complete.

The failed check was the cached repeat. The response was served from cache: 762 ms, no new row. The script compared it as a JSON string, though, and Postgres `jsonb` reorders object keys. A PGlite run of the same runner and store confirmed the cached answer deep-equals the fresh one and has the same `generatedAt`.

**Rationale**

The key-order difference was left in the code, because consumers read the answer by key. If byte-identical fresh and cached answers matter, `save` could return the stored `result`, making both paths come back in `jsonb` order.

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md):
  - the M7 verification records the live results, the explanation of the failed check, and the 12–15 s latency to plan for in M8's UI;
  - the open live-check item is replaced.
- Uncommitted, together with the rest of M7.

**Verification**

- As above. Token usage and cost per call weren't captured.
- The user's `vercel env pull` re-added `.env*` to the end of `.gitignore`, the same line removed in M2. It comes after `!.env.example` and would ignore that file if it were ever untracked. It was flagged to the user, not changed.

### Interaction 9 — M7 approved and committed

**User Prompt**

> remove the .gitignore line and commit M7

**Agent Outcome**

The `.env*` line that `vercel env pull` appended was removed, which leaves `.gitignore` identical to the committed version. M7 was marked Done in PLAN-V2 and committed on `release/v2.0`, with the doc updates. The cached-answer key order was left as is: the user didn't ask for the change.

**Verification**

`git check-ignore --no-index -v` shows `.env` and `.env.local` ignored, and `.env.example` matched only by its `!.env.example` exception. Lint, format check, tests and build last ran at the review gate (Interaction 7). Since then only docs have changed, plus `.gitignore` going back to its committed state.

### Interaction 10 — Vercel flags the Neon variables as visible secrets

**User Prompt**

> on the vercel dashboard, in environment variables tab, all variables affiliated with postgress, neon auth, and database are labeled as "needs attention" - each have this message flag: POSTGRES_PRISMA_URL looks like a secret, but its value is visible to anyone with access. Consider rotating at the source and saving as Secret.

Follow-up: "yes, add it to M9 and commit".

**Agent Outcome**

Vercel's current docs were checked:

- Environment variables are now either Config (readable) or Secret (write-only).
- Integration-created variables can't be switched to Secret in place. The documented path is to disconnect, rotate, then reconnect with Development deselected and Sensitive enabled.

From the variable names in `.env.local` (values never printed), the agent split the flagged variables into real secrets (the eight variables that carry the database password) and false positives (host, user and database names, the project id, and the Neon Auth URLs). A fresh build's `dist/` contains no connection strings or API keys.

**Rationale**

- The exposure is limited to members of the Vercel team, not the public. The fix also costs `vercel env pull` its database credentials for local development.
- So it was recorded as a pre-launch step rather than done now. It pairs with a separate Neon development branch, which also keeps local testing off production data.

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md):
  - the M9 row links to a new "Pre-launch user steps (M9)" section;
  - that section holds the existing own-Google-OAuth-client step, plus the credentials step: which variables are secrets, the four-step fix, the local-development consequences, and `ANTHROPIC_API_KEY`'s type.

**Collaboration**

The user reported the dashboard flag. The agent recommended no immediate change if the user is the only member of the Vercel team, with the hardening deferred to before the launch. The user chose to add it to M9 and commit.

### Interaction 11 — Milestone 8: game recommendations and the Profile insights UI

**User Prompt**

> pushed, begin execution of M8

**Agent Outcome**

The original request ("recommend gaming platforms based on their score") was ambiguous, so the agent asked two questions before building. The user chose:

- game and genre picks (3–5 shooters with their platforms), the recommended option, over PC-vs-console advice;
- showing both insights on Profile.

M8 was then detailed in PLAN-V2 and built. It stops at the review gate (status: In review), uncommitted.

- **Server.**
  - `POST /api/insights/platforms` is added.
  - M7's route logic moved into a shared `requestInsight`, so each insight kind is just a module: prompt, schema, `buildPrompt`, `parseAdvice`.
  - The mode reference and the type guards are shared.
  - The hardware cache key and prompt are unchanged.
- **Client.**
  - `ApiError.details`, an insights service, and pure error-message and setup-form helpers.
  - An on-demand `useInsight` hook.
  - An `InsightPanel` frame, with `HardwareInsight` and `PlatformInsight` in a new "AI Insights" section on Profile.

**Rationale**

- **Asked first.** "Platforms" changed the schema and the prompt, and the trainer measures only mouse aim, so titles that suit the player's skills were the better-grounded reading. The decision was the user's.
- **On-demand, not on mount.** Every fresh answer is a paid Claude call, so the panels wait for a click. A cached answer is labelled as cached, so a player knows to play more matches for a new one.
- **`parseAdvice` enforces the array rules.** Structured outputs can't constrain array length, so the pick count and uniqueness are checked server-side, and a bad answer becomes a 502, not a broken UI.

**Changes**

- New:
  - server: `api/insights/platforms.js`, `api/_lib/{insightRequest,platformAdvice,modeReference,checks}.js` and `platformAdvice.test.js`;
  - client: `src/services/insights.js`, `src/hooks/useInsight.js`, `src/utils/{insightErrors,mouseSetup}.js` and `src/components/{InsightPanel,HardwareInsight,PlatformInsight}/`;
  - tests: `insights.test.js`, `insightErrors.test.js`, `mouseSetup.test.js` and `InsightPanel.test.jsx`.
- Edited:
  - `api/insights/hardware.js`, now on `requestInsight`;
  - `api/_lib/hardwareAdvice.js` and `scoreInput.js`, now using the shared guards and mode reference;
  - `hardwareAdvice.test.js`: `buildPrompt` takes `{ setup }`;
  - `src/services/api.js` and its test: `details`;
  - `src/pages/Profile.jsx`.
- [`PLAN-V2.md`](PLAN-V2.md): M8 is In review, with its scope, detail and verification.

**Verification**

- Lint, format check and build pass. `npm test` passes with 193 tests, up from 154.
- No-cost live check under `vercel dev` against Neon with a temporary user (deleted afterwards), 8/8:
  - the 401 and 422 paths on `platforms`;
  - the 422 and 400 paths on `hardware` after the refactor;
  - no `insights` rows written;
  - cleanup complete.
- The Profile modules are served under `vercel dev`.
- **Not run:** a real platforms answer from Claude, and the UI in a browser. Both need the user's sign-in or approval for the API spend.

**Collaboration**

The user chose the meaning of "gaming platforms" and the scope of the Profile UI.

### Interaction 12 — M8 approved and committed

**User Prompt**

> browser checks pass; commit M8 and the doc changes

**Agent Outcome**

The user reported that the browser checks pass: both panels generating, the cached repeat, a fresh hardware answer with a setup entered, and the inline invalid-DPI message. These ran signed in, so they include real Claude answers for both kinds. M8 was marked Done in PLAN-V2, with the report recorded, and committed on `release/v2.0`.

**Verification**

The user ran the browser checks. The agent didn't see the generated answers, so their content isn't recorded here. Lint, format check, tests and build last ran at the review gate (Interaction 11), and no code has changed since.
