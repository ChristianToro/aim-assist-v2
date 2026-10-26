# Plan: Aim Assist v2.0

The v2.0 project plan and milestone tracker. [PLAN-CONVERSION.md](PLAN-CONVERSION.md) is the original feasibility report; this file records where v2 departs from it and what state each milestone is in. The v1 plan is archived at [Prototype/V1-PROJECT-PLAN.md](Prototype/V1-PROJECT-PLAN.md).

## Context

This repo is a clone of the v1 Aim Assist prototype: React + Vite + Canvas, Firebase Auth + Firestore, deployed to GitHub Pages. v2.0 rebuilds the platform:

- **Hosting:** GitHub Pages → **Vercel**
- **Database:** Firestore → **Neon Postgres**
- **Auth:** Google sign-in stays, but **Firebase is removed entirely**
- **New AI features:** the Anthropic API, called server-side, will (1) assess a user's scores and recommend hardware adjustments such as mouse DPI, and (2) recommend gaming platforms based on their scores.

Other UI and functionality changes happen later, on separate feature branches.

## Decisions (2026-10-26)

| Decision | Choice | Departs from PLAN-CONVERSION? |
|---|---|---|
| Auth | Remove Firebase fully. Google OAuth goes through Better Auth, with sessions stored in Neon. | **Yes.** PLAN-CONVERSION recommended a hybrid that keeps Firebase Auth. |
| Existing Firestore data | Reset. The Neon leaderboards start empty. | No. This was one of its two options. |
| AI features | Built as milestones on `release/v2.0`, after the data API exists | n/a (new scope) |
| Prototype docs | Archived in `Prototype/` with a `V1-` prefix | n/a |
| Day boundaries | Daily and weekly boards use UTC | No. It listed UTC as the simplest option. |

Because the data is reset, the uid format can change freely when auth moves, so no user-matching step is needed.

## Workflow

- All work happens on `release/v2.0`.
- Each milestone is small. It stops for review **before** committing, and the next one starts only after approval.
- Each milestone is detailed when it starts, not before.

## Milestones

| # | Status | Milestone | Key files |
|---|---|---|---|
| M0 | Done | **Branch + docs reorg.** Create `release/v2.0`. Archive the v1 docs to `Prototype/V1-*`. Write the new root `CLAUDE.md`, `PLAN-V2.md` and `PROMPT-HISTORY.md`. Repoint the README links. | `Prototype/`, `CLAUDE.md`, `PLAN-V2.md`, `PROMPT-HISTORY.md`, `README.md` |
| M1 | Not started | **Vercel hosting.** Set `vite.config.js` `base` to `'/'`. Add `vercel.json` with a SPA rewrite for every path except `/api`. Remove `scripts/spa-fallback.mjs` and its build step. Turn `deploy.yml` into a lint-and-test CI workflow. *User:* import the repo into Vercel. | `vite.config.js`, `vercel.json`, `package.json`, `.github/workflows/` |
| M2 | Not started | **Neon + schema.** Add Neon through the Vercel Marketplace (user step). Write `db/migrations/001_init.sql` for the scores table with its CHECK constraints (see PLAN-CONVERSION). Make `/api` work in local dev (`vercel dev`, or a Vite proxy). | `db/migrations/`, `.env.example` |
| M3 | Not started | **Auth server.** Better Auth with the Google provider, its Neon tables in a migration, and an `/api/auth/*` handler. *User:* create a Google OAuth client and set the env vars. | `api/auth/[...all].js`, `api/_lib/auth.js`, `api/_lib/db.js` |
| M4 | Not started | **Auth client switchover.** Move `services/auth.js` and `AuthProvider` onto the Better Auth client. Keep the `useAuth()` shape (`uid`, `displayName`, `photoURL`) so consumers don't change. | `src/services/auth.js`, `src/contexts/AuthProvider.jsx` |
| M5 | Not started | **Data API.** Add `GET /api/me` (stats derived in SQL), `POST /api/scores` (validated, uid taken from the session) and `GET /api/leaderboard?view=all\|daily\|weekly\|personal` (`DISTINCT ON`, UTC days). Write validation and stats logic as pure functions with Vitest tests. | `api/me.js`, `api/scores.js`, `api/leaderboard.js`, `api/_lib/` |
| M6 | Not started | **Client data switchover + remove Firebase.** Turn the services into `fetch` wrappers with the same exports. Delete `recordMatchOnProfile`. Update the `Leaderboard.jsx` dates and errors and `Footer.jsx`. Remove the `firebase` dependency, `src/firebase/`, the firestore/firebase config files and the vite firebase chunk. Rewrite `users.test.js`. | `src/services/*`, `src/components/Leaderboard`, root Firebase files |
| M7 | Not started | **AI hardware recommendations.** Add `POST /api/insights/hardware`, which feeds aggregated score stats to Claude and returns a structured result (DPI, sensitivity, polling rate). Rate-limit and cache it per user in a Neon table. | `api/insights/`, `api/_lib/anthropic.js`, migration |
| M8 | Not started | **AI platform recommendations.** Add `POST /api/insights/platforms` on the same foundation, plus a minimal display surface on Profile. Polished UI comes later on feature branches. | `api/insights/`, `src/pages/Profile.jsx` |
| M9 | Not started | **Docs.** Write a new `ARCHITECTURE.md` (Layer 3 becomes Vercel Functions + Neon + Anthropic) and update the README stack, setup, live-demo and anti-cheat sections. | `ARCHITECTURE.md`, `README.md` |

### Dependencies

Each dependency is added only in the milestone that uses it, with a justification:

- `@neondatabase/serverless` (M2/M3): the HTTP Postgres driver. It avoids connection-pool exhaustion in serverless functions.
- `better-auth` (M3/M4): Google OAuth with session cookies stored in Postgres. Hand-rolling OAuth would be a security risk. Before M3, check its current docs against Neon Auth, because Neon Auth is built on Better Auth and has changed recently.
- `@anthropic-ai/sdk` (M7): the official client for the AI features. Before M7, check the `claude-api` skill for the current model ids and structured-output support.

## M0 detail

1. Create `release/v2.0` from local `main` (`bdcf5f0`). Branching from a local branch sets no upstream, so a bare `git push` can't land on `main`. The user pushes with `git push -u origin release/v2.0:refs/heads/release/v2.0`.
2. Archive the docs with `git mv`, so history follows the files:
   - `CLAUDE.md` → `Prototype/V1-CLAUDE.md`
   - `ARCHITECTURE.md` → `Prototype/V1-ARCHITECTURE.md`
   - `PROJECT_PLAN.md` → `Prototype/V1-PROJECT-PLAN.md`
   - `PROMPT-HISTORY.md` → `Prototype/V1-PROMPT-HISTORY.md`

   Each file gets a one-line "archived" banner under its title. A file still named `CLAUDE.md` in a subdirectory would be auto-loaded by Claude Code, which is why the files are renamed and not just moved.
3. Repoint the three README links (project plan, architecture, prompt history) to `Prototype/`. The full README rewrite waits for M9.
4. Write a new root `CLAUDE.md` for v2. It covers the stack, the ownership split, the security rules (no secrets in `VITE_` vars, uid from the session only), the milestone workflow, the condensed v1 coding standards, the git rules carried over (with the push refspec now naming `origin`), a doc map and the prompt-history opt-in.
5. Write a new root `PROMPT-HISTORY.md` with the skill's header, a link back to the v1 history, and the 2026-10-26 session.
6. Track `PLAN-CONVERSION.md` unchanged. Departures from it live in the Decisions table above.
7. Stop for review, then make one commit on approval. The commit has no attribution line.

### M0 verification

- `git status` shows the four renames into `Prototype/` plus the new and modified root docs.
- No root doc or README links to a moved path, and every relative link resolves.
- `npm run lint` and `npm test` still pass. M0 changes no code, and Prettier ignores `*.md`.
- `git rev-parse --abbrev-ref release/v2.0@{upstream}` errors with "no upstream configured".
