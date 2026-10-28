# Plan: Converting Aim Assist from Firebase to Neon + Vercel

Feasibility report and migration steps for replacing Firebase (Firestore + GitHub Pages hosting) with Neon Postgres and Vercel. File paths below are relative to the `Aim_Assist` repository root.

## Feasibility verdict

**This is very feasible, and the codebase is set up well for it.** Firebase is used in only about 10 files. Every database call already goes through `src/services/*`. No page, hook or component imports `firebase/*` directly; only the services and `AuthProvider` do. If the service function signatures stay the same, the hooks and pages barely change.

The real change is architectural, not the amount of code. Right now the browser talks straight to Firestore, and `firestore.rules` is the only security layer. Postgres can't be exposed to the browser like that, so moving to Neon means adding a small server layer (Vercel Functions). This helps the project. The README says server-authoritative scoring "requires the paid Firebase tier", but Vercel's free Hobby tier runs serverless functions, so moving fixes that weakness.

## What's coupled to Firebase today

| Area | Files | Migration impact |
|---|---|---|
| SDK init | `src/firebase/config.js`, `.env.example` | Replace or shrink |
| Auth | `src/services/auth.js`, `src/contexts/AuthProvider.jsx` | Can stay as-is in a hybrid setup (see below) |
| Data | `src/services/users.js`, `scores.js`, `leaderboard.js` | Rewrite as `fetch()` calls to `/api/*` |
| Security | `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `.firebaserc` | Port to server validation and SQL `CHECK` constraints |
| Firestore-specific UI | `Leaderboard.jsx` (`createdAt.toDate()`, the `failed-precondition` and `permission-denied` messages), `Footer.jsx` text | Small edits |
| Tests | `users.test.js` mocks `firebase/firestore` | Rewrite against the new layer |
| Hosting | `.github/workflows/deploy.yml`, `vite.config.js` (`base: '/Aim_Assist/'`, firebase chunk group), `scripts/spa-fallback.mjs`, `App.jsx` basename | Simplify |
| Docs | `CLAUDE.md`, `ARCHITECTURE.md`, `README.md`, `PROJECT_PLAN.md` | Update. `CLAUDE.md` currently requires Firebase, so this is a deliberate change to the project's stated stack |

## Auth: the one real decision

Neon is only a database. You still need Google Sign-In from somewhere. There are two options:

1. **Hybrid (recommended to start):** Keep Firebase Auth for Google sign-in and stop using Firestore.
   - The client sends `await user.getIdToken()` as a Bearer token.
   - Vercel functions verify it with `jose` against Google's public keys, checking that `aud` is your project ID and `iss` is `https://securetoken.google.com/<projectId>`. The `firebase-admin` package isn't needed.
   - `auth.js`, `AuthProvider`, `useAuth` and every `user.uid`/`displayName`/`photoURL` consumer stay unchanged.
   - Most of the Firebase bundle is Firestore, so most of the ~563 kB Firebase chunk still goes away.
2. **Full replacement:** Neon Auth (managed, built on Better Auth; check its current status since it has changed recently), self-hosted Better Auth with sessions in Neon, or Clerk.
   - This removes Firebase entirely.
   - It rewrites the auth layer and changes the format of user IDs, so existing users would have to be matched up, for example by email.
   - It's better done as a second step after the hybrid works.

Skip Neon's Data API with row-level security (browser talks to Postgres over HTTP). It copies the current setup, where the client is trusted, so it throws away the main benefit of moving.

## What Postgres improves

- **Profile stats become derived instead of stored.** `recordMatchOnProfile` currently reads the profile, edits it in the browser and writes it back. Two matches saved at the same time can lose an update, and the README admits the stats are self-reported. In SQL, `count(*)`, `avg(accuracy)`, `max(score)` and `mode() WITHIN GROUP (ORDER BY mode)` over `scores` give you `gamesPlayed`, `averageAccuracy`, `highestScore` and `favoriteMode` with no stored aggregates at all.
- **No composite index setup.** The `day`/`week` key columns, `firestore.indexes.json`, and the "index still building" error state all go away. Daily and weekly boards become `where created_at >= date_trunc('week', now())`.
- **No copying names onto scores.** `displayName`/`photoURL` on each score exist only to avoid extra reads in Firestore. A join replaces them.
- **Easy one-entry-per-player boards.** `DISTINCT ON (uid)` does it in one query. Today's top 100 can be filled by a single player.
- **Real server validation.** The rules logic (allowed modes, score range, accuracy 0–100) moves into the API handler plus `CHECK` constraints. That opens the way to the match-token anti-cheat the README wants.

A schema sketch:

```sql
create table users (
  uid          text primary key,
  display_name text not null check (char_length(display_name) <= 100),
  photo_url    text check (char_length(photo_url) <= 1000),
  created_at   timestamptz not null default now()
);
create table scores (
  id            bigint generated always as identity primary key,
  uid           text not null references users(uid),
  mode          text not null check (mode in ('Gridshot','Precision','Speed','Tracking','Flick','Survival')),
  score         int  not null check (score between 0 and 10000000),
  accuracy      real not null check (accuracy between 0 and 100),
  reaction_time int  check (reaction_time between 0 and 60000),
  created_at    timestamptz not null default now()
);
create index on scores (score desc);
create index on scores (uid, score desc);
create index on scores (created_at desc);
```

## Steps, in order

**Phase 1: move hosting to Vercel.** This is independent of the database and low-risk.

1. Import the GitHub repo into Vercel. It detects Vite on its own, and each PR gets a preview URL.
2. In `vite.config.js`, change `base` from `'/Aim_Assist/'` to `'/'`. `App.jsx` reads `BASE_URL`, so it follows automatically.
3. Delete `scripts/spa-fallback.mjs` and its `build` step. Add a `vercel.json` rewrite that sends every non-`/api` path to `/index.html`.
4. Move the `VITE_FIREBASE_*` values into Vercel's environment variables.
5. Add the `*.vercel.app` domain to Firebase Auth's authorized domains, or sign-in will fail.
6. Change `deploy.yml` into a lint-and-test-only CI workflow, or remove it.

**Phase 2: set up Neon.**

7. Add Neon through the Vercel Marketplace integration. It injects `DATABASE_URL` and can give each preview deployment its own Neon branch, which is good to show in a portfolio.
8. Keep the schema as plain `.sql` migration files in the repo, for example `db/migrations/001_init.sql`. A migration tool isn't needed at this size.

**Phase 3: build the API layer.** Use `/api/*.js` Vercel Functions at the repo root, with shared helpers in `api/_lib/`. Files starting with an underscore don't become routes.

9. Shared helpers:
   - `api/_lib/db.js` uses `@neondatabase/serverless` (`neon()` over HTTP, so no connection-pool problems in serverless).
   - `api/_lib/auth.js` verifies the Bearer token with `jose`.
10. Endpoints:
    - `PUT /api/me` creates or updates the user row (`insert … on conflict (uid) do update`). It replaces `ensureUserDocument`.
    - `GET /api/me` returns the derived stats. It replaces `getUserProfile`.
    - `POST /api/scores` validates and inserts, with `uid` taken from the verified token, never from the request body.
    - `GET /api/leaderboard?view=all|daily|weekly|personal`.
11. The two new dependencies are justified as `CLAUDE.md` asks: `@neondatabase/serverless` is the database driver, and `jose` does standards-based JWT verification without the heavy `firebase-admin` package.

**Phase 4: switch the client over.**

12. Rewrite `services/users.js`, `scores.js` and `leaderboard.js` as `fetch` wrappers with the same exported names and return shapes. `useLeaderboard`, `useUserProfile`, `GameArea` and `AuthProvider` then stay unchanged.
13. Delete `recordMatchOnProfile`, since the server now derives those stats.
14. UI changes:
    - `Leaderboard.jsx`: format dates from ISO strings instead of `.toDate()`, and replace the Firestore-specific error messages with HTTP-status ones.
    - `Footer.jsx`: update the text.
15. Remove `getFirestore` from `config.js` and the firebase chunk group from `vite.config.js`. Delete `firestore.rules`, `firestore.indexes.json` and `firebase.json`.

**Phase 5: data, tests, docs.**

16. Data: either reset the leaderboards, which is reasonable for a portfolio, or write a one-off export script from Firestore into Neon.
17. Tests:
    - Move the validation and stats logic into pure functions and test them with Vitest.
    - Replace `users.test.js` with tests of the service layer that mock `fetch`.
18. Docs: update `CLAUDE.md`, `ARCHITECTURE.md` (Layer 3 becomes "Vercel Functions + Neon Postgres") and `README.md` (stack table, setup steps, and the anti-cheat section, which now becomes possible).

**Phase 6 (optional): replace Firebase Auth** with Neon Auth or Better Auth to remove the `firebase` dependency completely.

## Risks and gotchas

- **Never put `DATABASE_URL` in a `VITE_`-prefixed variable.** The current workflow puts `VITE_` secrets into the client bundle by design, which was fine for Firebase's public config. For a database connection string it would leak full database access.
- **Neon cold starts:** the free tier scales compute to zero after about 5 minutes idle, so the first leaderboard load after a quiet period takes a few hundred milliseconds longer.
- **Day boundaries change meaning.** `getDayKey()` currently uses the player's local date. Server-side, pick either UTC days (simplest, one global board) or have the client send its timezone.
- **Vercel Hobby is for non-commercial use only.** That's fine for a portfolio.
- **Local development** needs `vercel dev`, or a Vite `server.proxy` pointing to it, so that `/api` works alongside the Vite dev server.

## Rough effort

- Phase 1 (hosting only): a few hours.
- Phases 2–5 with the hybrid auth: about 1–2 focused days.
- Full auth replacement: roughly 1–2 more days, mostly testing and dealing with existing user IDs.

Recommended starting point: Phase 1 on its own branch, since it doesn't depend on anything else.
