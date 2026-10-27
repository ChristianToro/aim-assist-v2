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
| Auth | Remove Firebase fully. Google sign-in goes through **Neon Auth**, Neon's managed Better Auth, which stores users in the `neon_auth` schema. `/api` verifies its JWTs. *Revised 2026-10-27:* this replaces self-hosted Better Auth after a comparison (PROMPT-HISTORY, 2026-10-27, Interaction 8). | **Yes.** PLAN-CONVERSION recommended a hybrid that keeps Firebase Auth. |
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
| M1 | Done | **Vercel hosting.** Set `vite.config.js` `base` to `'/'`. Add `vercel.json` with a SPA rewrite for every path except `/api`. Remove `scripts/spa-fallback.mjs` and its build step. Turn `deploy.yml` into a lint-and-test CI workflow. *User:* import the repo into Vercel. | `vite.config.js`, `vercel.json`, `package.json`, `.github/workflows/` |
| M2 | Done | **Neon + schema.** Add Neon through the Vercel Marketplace (user step). Write `db/migrations/001_init.sql` for the scores table with its CHECK constraints (see PLAN-CONVERSION). Make `/api` work in local dev (`vercel dev`, or a Vite proxy). | `db/migrations/`, `.env.example` |
| M3 | Done | **Auth server (Neon Auth).** Add `api/_lib/auth.js`, which reads `Authorization: Bearer <jwt>`, verifies it with `jose` against Neon Auth's JWKS (`NEON_AUTH_BASE_URL/.well-known/jwks.json`) and checks the issuer and expiry. The uid is the token's `sub`. Vitest covers it with locally generated keys. Add `GET /api/me`, which returns the verified identity or 401; M5 adds stats. Migration `002` changes `scores.user_id` to `uuid` and adds a foreign key to `neon_auth."user"(id)` with `on delete cascade`. Add the Neon Auth vars to `.env.example`. *User:* in the Neon Console → Auth, add your own Google OAuth credentials and add the trusted domains (`localhost:3000` and the Vercel domain). | `api/_lib/auth.js`, `api/me.js`, `db/migrations/002_*.sql`, `.env.example` |
| M4 | Not started | **Auth client switchover.** Add `@neondatabase/auth` and create the client from `VITE_NEON_AUTH_URL`. Move `services/auth.js` onto it: Google sign-in through `signIn.social`, sign-out, and the session. Move `AuthProvider` too, and keep the `useAuth()` shape by mapping `uid`, `displayName` and `photoURL` from the user's `id`, `name` and `image`, so consumers don't change. Add a `getAuthToken()` helper for the Bearer header that the M6 services send. Remove `getAuth` from `src/firebase/config.js`. Between M4 and M6 the Firestore writes have no Firebase user, so saving scores and profiles doesn't work on the branch; the data is being reset anyway. | `src/services/auth.js`, `src/contexts/AuthProvider.jsx`, `src/firebase/config.js` |
| M5 | Not started | **Data API.** Extend `GET /api/me` with stats derived in SQL, and add `POST /api/scores` (validated, uid taken from the session) and `GET /api/leaderboard?view=all\|daily\|weekly\|personal` (`DISTINCT ON`, UTC days). Write validation and stats logic as pure functions with Vitest tests. | `api/me.js`, `api/scores.js`, `api/leaderboard.js`, `api/_lib/` |
| M6 | Not started | **Client data switchover + remove Firebase.** Turn the services into `fetch` wrappers with the same exports. Delete `recordMatchOnProfile`. Update the `Leaderboard.jsx` dates and errors and `Footer.jsx`. Remove the `firebase` dependency, `src/firebase/`, the firestore/firebase config files and the vite firebase chunk. Rewrite `users.test.js`. | `src/services/*`, `src/components/Leaderboard`, root Firebase files |
| M7 | Not started | **AI hardware recommendations.** Add `POST /api/insights/hardware`, which feeds aggregated score stats to Claude and returns a structured result (DPI, sensitivity, polling rate). Rate-limit and cache it per user in a Neon table. | `api/insights/`, `api/_lib/anthropic.js`, migration |
| M8 | Not started | **AI platform recommendations.** Add `POST /api/insights/platforms` on the same foundation, plus a minimal display surface on Profile. Polished UI comes later on feature branches. | `api/insights/`, `src/pages/Profile.jsx` |
| M9 | Not started | **Docs.** Write a new `ARCHITECTURE.md` (Layer 3 becomes Vercel Functions + Neon + Anthropic) and update the README stack, setup, live-demo and anti-cheat sections. | `ARCHITECTURE.md`, `README.md` |

### Dependencies

Each dependency is added only in the milestone that uses it, with a justification:

- `@neondatabase/serverless` (M2): the HTTP Postgres driver. It avoids connection-pool exhaustion in serverless functions.
- `jose` (M3): verifies Neon Auth's JWTs against its JWKS in `/api`. It's standards-based, has no dependencies, and is what Neon's own backend guide uses.
- `@neondatabase/auth` (M4): Neon's official Neon Auth client, wrapping a Better Auth client. It's still a beta (0.7.0-beta on 2026-10-27), so pin the exact version and re-check its docs before M4. It was chosen over `@neondatabase/neon-js`, which adds the Data API client and pulls in `pg`.

### Neon Auth notes

- The Vercel integration enabled Neon Auth and injects `NEON_AUTH_BASE_URL` (server) and `VITE_NEON_AUTH_URL` (client). Both are public URLs, not secrets.
- `neon_auth."user".id` is a `uuid` (checked 2026-10-27), and our role has `REFERENCES` on it. That's why M3 changes `scores.user_id` from `text` to `uuid`.
- Auth state branches with the database, so each Neon branch has its own users.
- The auth server runs on a Neon domain, not the app's. M4 has to confirm that sessions persist in Safari (which blocks third-party cookies) and after a reload.
- **`/api` needs the JWT, not the session token** (seen in M3). Neon Auth issues an Ed25519 JWT from `GET {base}/token` and in the `set-auth-jwt` header of `get-session`. The opaque `token` that sign-up and `session.token` return is rejected by `/api/me`. M4's `getAuthToken()` must return the JWT, so check what the SDK exposes, because Neon's Hono guide reads `session.token`.
- JWTs last 900 s and are stateless, so a token stays valid for up to 15 minutes after sign-out or user deletion. Writes for a deleted user still fail on the `scores` foreign key.
- Real tokens carry `aud` equal to the auth origin. The verifier checks `iss` but not `aud` yet. Adding `audience` is a one-line hardening for M4.
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

## M1 detail

1. `vite.config.js`: set `base` to `'/'`, since Vercel serves from the domain root. Drop the Pages comment.
2. `src/App.jsx`: remove `basename={import.meta.env.BASE_URL}` from `BrowserRouter`. With `base: '/'` it is always `/`, which is the router's default.
3. Add `vercel.json` with one rewrite that sends every path outside `/api` to `/index.html`. Vercel serves files that exist (such as `/assets/*` and `/favicon.svg`) before it applies rewrites, so only client routes reach the rewrite.
4. Delete `scripts/spa-fallback.mjs` and remove it from the `build` script. The rewrite replaces the `404.html` copy.
5. Rename `.github/workflows/deploy.yml` to `ci.yml` with `git mv`. It runs on pushes to `main` and `release/**` and on pull requests, with the steps `npm ci`, lint, `format:check`, test and build. The Pages upload, deploy job, Pages permissions and the Firebase secret check are removed, because Vercel now deploys.
6. Stop for review.

**User steps (outside the repo):**

- **Required:** import the repo into Vercel. The Vite preset is detected automatically (build `npm run build`, output `dist`).
- **Optional:** set `release/v2.0` as the Vercel production branch, so the stable domain tracks v2 while `main` still holds v1.

**Optional interim Firebase steps.** v2 drops Firebase, but the code still runs on it until M4 (auth) and M6 (data). These steps only keep the deployed v1-era app working until then, and M6 undoes them. Without them, the hosting itself still deploys and can be verified.

- **Copy the six `VITE_FIREBASE_*` values into the Vercel environment variables.** These are public config, not secrets. The page renders on Vercel and the leaderboards load. Without them, `getAuth()` in `src/firebase/config.js` throws on load, so the deployed page is likely blank. The deep-link check below still works, because the rewrite returns `index.html` either way. M6 removes these variables.
- **Add the Vercel domain (`<project>.vercel.app`) to Firebase Auth → Settings → Authorized domains.** Firebase Google sign-in and score submission then work on that domain; without it, sign-in fails with `auth/unauthorized-domain`. It only works on domains you add (the production domain, and the stable branch alias if you test on it). It's discarded in M4, when Neon Auth takes over sign-in with its own Google OAuth setup and trusted domains.

### M1 verification

- `npm run lint`, `npm run format:check` and `npm test` pass.
- `npm run build` produces `dist/` with no `404.html`, and asset URLs in `dist/index.html` start with `/assets/`.
- `npm run preview` serves `/` and a deep link such as `/leaderboards`. (`vite preview` has its own SPA fallback, so this checks the base path but not `vercel.json`.)
- `vercel.json` is valid JSON, and the rewrite pattern matches client routes but not `/api` or `/api/*`, checked with a regex test.
- The `vercel.json` rewrite itself is verified only on the user's first Vercel deploy: a hard refresh of `/leaderboards` (or `curl`) must return `index.html` with status 200. *Confirmed 2026-10-27 on `aim-assist-v2.vercel.app`: `/leaderboards` returned `200 text/html`.*

## M2 detail

1. Add `@neondatabase/serverless` to `dependencies`, since the functions import it at runtime.
2. `db/migrations/001_init.sql` creates the `scores` table from the PLAN-CONVERSION sketch, with its `CHECK` constraints (the same bounds as `firestore.rules`) and indexes for the leaderboard queries:
   - The sketch's `users` table is dropped. The auth provider's user table holds name and image; after the auth revision, that's Neon Auth's `neon_auth."user"`.
   - The column is `user_id`. M3's migration changes it to `uuid` to match `neon_auth."user".id`, and adds the foreign key.
3. `scripts/migrate.js` and `npm run db:migrate`: a small runner that applies `db/migrations/*.sql` in filename order, each file in a transaction, and records it in `schema_migrations` so a rerun skips it.
   - It connects with the Neon driver's WebSocket `Client`, because a migration file holds several statements.
   - It prefers `DATABASE_URL_UNPOOLED`, since Neon recommends the direct endpoint for schema changes.
   - It loads `.env.local` with Node's `--env-file-if-exists`, so no dotenv dependency is needed.
   - A runner is needed because there's no `psql` here, and every Neon branch has to be migrated the same way.
4. `api/_lib/db.js`, the shared `neon()` HTTP query function, moves here from M3. `api/health.js` uses it for `GET /api/health`, which runs `select 1` and returns `{ ok, database }` (status 503 when the database is unreachable). It's the smallest endpoint that proves `/api` and Neon work, both locally and once deployed.
5. Local dev uses `vercel dev`, which runs Vite and the `/api` functions together on one port, just as production does. A Vite proxy would still need `vercel dev` running behind it, so it adds nothing.
   - Add an `npm run dev:full` script.
   - The Vercel CLI is installed globally by the user, not added as a devDependency, because it's large and only needed locally.
6. ESLint: add Node globals for `api/**` and `scripts/**`, which run on the server.
7. `.env.example`: add a server-only section for `DATABASE_URL` and `DATABASE_URL_UNPOOLED`, with a warning never to give them a `VITE_` prefix.
8. `.gitignore`: add `.vercel/`, the link folder that `vercel link` writes.
9. Stop for review.

**User steps:**

- Vercel → Storage (Marketplace) → **Neon** → create a database and connect it to the project for Development, Preview and Production. This injects `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and related variables.
- Install the CLI (`npm i -g vercel`), then run `vercel link` and `vercel env pull .env.local` in the repo.
- Optional: enable the `VITE_FIREBASE_*` variables for Development too, so `vercel env pull` brings them and the app renders under `vercel dev`.

### M2 verification

- `npm run lint`, `npm run format:check`, `npm test` and `npm run build` pass.
- `001_init.sql` applies cleanly in PGlite (in-process Postgres, run in a scratch directory outside the repo). Valid rows insert; an out-of-range mode, score, accuracy or reaction time is rejected.
- After the user steps:
  - `npm run db:migrate` applies `001_init.sql`, and a second run reports nothing to apply. *Confirmed 2026-10-27. A rolled-back transaction on Neon also showed every CHECK constraint and index live and a negative score rejected.*
  - Under `vercel dev`, `curl localhost:3000/api/health` returns `{"ok":true,"database":"up"}`. *Confirmed 2026-10-27 (200 `application/json`).*
  - After a push, `/api/health` on the Vercel domain returns the same, confirming that the `vercel.json` rewrite leaves `/api` alone. *Confirmed 2026-10-27 on `aim-assist-v2.vercel.app`: 200 `{"ok":true,"database":"up"}`, and unknown `/api` paths return Vercel's 404, not `index.html`.*

## M3 detail

1. Add `jose` to `dependencies`.
2. `api/_lib/auth.js`:
   - `createVerifier({ keySet, issuer })` returns a function that takes a `Request` and resolves to `{ uid }`, or throws `AuthError` (status 401).
   - It reads `Authorization: Bearer <jwt>` and checks the token with `jwtVerify`:
     - the algorithm must be `EdDSA`, the only one in Neon Auth's JWKS;
     - the issuer must be the origin of `NEON_AUTH_BASE_URL`, as in Neon's backend guide;
     - `sub` and `exp` must be present.
   - Token errors from jose become `AuthError`. A JWKS fetch timeout and other errors propagate as server errors, not as 401.
   - The exported `verifyRequest` is built once per cold start from a remote JWKS at `NEON_AUTH_BASE_URL/.well-known/jwks.json`. jose caches the keys and refetches when it sees an unknown `kid`.
3. `api/_lib/auth.test.js` covers the verifier with an Ed25519 key pair generated in the test, with no mocks and no network: a valid token, a missing or non-Bearer header, the wrong issuer, an expired token, the wrong signing key, a missing `sub` or `exp`, and an HS256 token. It lives under `_lib`, so Vercel never deploys it as a function, and it runs in Vitest's `node` environment.
4. `api/me.js`: `GET /api/me` returns `{ uid }` with `Cache-Control: private, no-store`, or 401 `{ error: 'Unauthorized' }`. M5 adds stats.
5. `db/migrations/002_scores_user_fk.sql` changes `scores.user_id` from `text` to `uuid` (the table is empty) and adds a foreign key to `neon_auth."user"(id)` with `on delete cascade`.
6. `.env.example`: add `NEON_AUTH_BASE_URL` and `VITE_NEON_AUTH_URL`, both public URLs that the Neon integration sets.
7. Stop for review.

**User steps (needed by M4 sign-in, and can be done now):**

- In Google Cloud Console, create an OAuth client (type: Web application). Use the redirect URI that the Neon Console shows for Google.
- In Neon Console → Auth → OAuth providers, set Google to use your client ID and secret instead of the shared development credentials.
- In Neon Console → Auth → Domains, add the trusted domains `http://localhost:3000` and `https://aim-assist-v2.vercel.app`.

**Risk:** the foreign key makes `neon_auth."user"` a dependency of our schema. If a future Neon Auth internal migration drops or rebuilds that table, it would fail on the foreign key. If that ever happens, removing the constraint is a one-line migration.

### M3 verification

- `npm run lint`, `npm run format:check`, `npm test` (including the new verifier tests) and `npm run build` pass.
- `002_scores_user_fk.sql` applies in PGlite on top of `001` and a stub `neon_auth."user"`:
  - a non-uuid `user_id` is rejected;
  - an unknown user is rejected by the foreign key;
  - deleting a user cascades to their scores.
- Under `vercel dev`, `GET /api/me` returns 401 with no token, a malformed token or a forged token.
- With the user's approval, against Neon:
  - `npm run db:migrate` applies `002`. *Confirmed 2026-10-27: the user ran it. `user_id` is `uuid`, `scores_user_id_fkey` references `neon_auth."user"(id) ON DELETE CASCADE`, and a rerun reports nothing to apply.*
  - a real Neon Auth token from a temporary email/password test user, deleted afterwards, returns 200 `{ uid }` from `/api/me` and confirms the token's `iss`, `aud` and `alg`. *Confirmed 2026-10-27 under `vercel dev`:*
    - *The real JWT returned 200 with the user's uid. The same token with `sub` altered returned 401, and the opaque session token from sign-up also returned 401.*
    - *Token facts: `alg` is `EdDSA` with the JWKS `kid`; `iss` and `aud` are both the auth URL's origin; the lifetime is 900 s.*
    - *Deleting the test user cascaded to `session` and `account`, leaving 0 users.*
- Deployed, *confirmed 2026-10-27 on `aim-assist-v2.vercel.app`*:
  - `/api/me` returned 401 with no token, a malformed token and a forged token, with `Cache-Control: private, no-store`. That rules out a missing `NEON_AUTH_BASE_URL` (it would give 500) and shows the remote JWKS fetch works.
  - A real token reaching 200 on Vercel is first exercised by M4's sign-in.
