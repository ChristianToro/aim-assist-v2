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
