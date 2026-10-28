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
| Auth | Remove Firebase fully. Google sign-in goes through **Neon Auth**, Neon's managed Better Auth, which stores users in the `neon_auth` schema. `/api` verifies its JWTs. *Revised 2026-10-27:* this replaces self-hosted Better Auth after a comparison ([PROMPT-HISTORY-2026-Q4.md](PROMPT-HISTORY-2026-Q4.md), 2026-10-27, Interaction 8). | **Yes.** PLAN-CONVERSION recommended a hybrid that keeps Firebase Auth. |
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
| M3 | Done | **Auth server (Neon Auth).** Add `api/_lib/auth.js`, which reads `Authorization: Bearer <jwt>`, verifies it with `jose` against Neon Auth's JWKS (`NEON_AUTH_BASE_URL/.well-known/jwks.json`) and checks the issuer and expiry. The uid is the token's `sub`. Vitest covers it with locally generated keys. Add `GET /api/me`, which returns the verified identity or 401; M5 adds stats. Migration `002` changes `scores.user_id` to `uuid` and adds a foreign key to `neon_auth."user"(id)` with `on delete cascade`. Add the Neon Auth vars to `.env.example`. *User:* in the Neon Console → Auth, add `localhost:3000` as a trusted domain (the Vercel domains are added automatically). Google sign-in uses Neon's shared keys during development, and your own Google OAuth client before the portfolio launch. | `api/_lib/auth.js`, `api/me.js`, `db/migrations/002_*.sql`, `.env.example` |
| M4 | Done | **Auth client switchover.** Add `@neondatabase/auth` and create the client from `VITE_NEON_AUTH_URL`. Move `services/auth.js` onto it: Google sign-in through `signIn.social`, sign-out, and the session. Move `AuthProvider` too, and keep the `useAuth()` shape by mapping `uid`, `displayName` and `photoURL` from the user's `id`, `name` and `image`, so consumers don't change. Add a `getAuthToken()` helper for the Bearer header that the M6 services send. Remove `getAuth` from `src/firebase/config.js`. Between M4 and M6 the Firestore writes have no Firebase user, so saving scores and profiles doesn't work on the branch; the data is being reset anyway. | `src/services/auth.js`, `src/contexts/AuthProvider.jsx`, `src/firebase/config.js` |
| M5 | Done | **Data API.** Extend `GET /api/me` with stats derived in SQL, and add `POST /api/scores` (validated, uid taken from the session) and `GET /api/leaderboard?view=all\|daily\|weekly\|personal` (`DISTINCT ON`, UTC days). Write validation and stats logic as pure functions with Vitest tests. | `api/me.js`, `api/scores.js`, `api/leaderboard.js`, `api/_lib/` |
| M6 | Not started | **Client data switchover + remove Firebase.** Turn the services into `fetch` wrappers with the same exports. Delete `recordMatchOnProfile`. Update the `Leaderboard.jsx` dates and errors and `Footer.jsx`. Remove the `firebase` dependency, `src/firebase/`, the firestore/firebase config files and the vite firebase chunk. Rewrite `users.test.js`. | `src/services/*`, `src/components/Leaderboard`, root Firebase files |
| M7 | Not started | **AI hardware recommendations.** Add `POST /api/insights/hardware`, which feeds aggregated score stats to Claude and returns a structured result (DPI, sensitivity, polling rate). Rate-limit and cache it per user in a Neon table. | `api/insights/`, `api/_lib/anthropic.js`, migration |
| M8 | Not started | **AI platform recommendations.** Add `POST /api/insights/platforms` on the same foundation, plus a minimal display surface on Profile. Polished UI comes later on feature branches. | `api/insights/`, `src/pages/Profile.jsx` |
| M9 | Not started | **Docs.** Write a new `ARCHITECTURE.md` (Layer 3 becomes Vercel Functions + Neon + Anthropic) and update the README stack, setup, live-demo and anti-cheat sections. *User, before launch:* switch Neon Auth's Google provider from the shared keys to your own OAuth client (see the M3 detail). | `ARCHITECTURE.md`, `README.md` |

### Dependencies

Each dependency is added only in the milestone that uses it, with a justification:

- `@neondatabase/serverless` (M2): the HTTP Postgres driver. It avoids connection-pool exhaustion in serverless functions.
- `jose` (M3): verifies Neon Auth's JWTs against its JWKS in `/api`. It's standards-based, has no dependencies, and is what Neon's own backend guide uses.
- `@neondatabase/auth` (M4): Neon's official Neon Auth client, wrapping a Better Auth client. It's still a beta, so it's pinned exactly at `0.7.0-beta`. It was chosen over `@neondatabase/neon-js`, which adds the Data API client and pulls in `pg`.
  - **Why not a plain Better Auth client:** after the Google redirect, the SDK exchanges Neon's `neon_auth_session_verifier` URL parameter for the session. That's how Neon handles the callback across domains, and a plain Better Auth client doesn't do it.
  - **Install cost:** about 200 packages, mostly its unused UI kit (`@neondatabase/auth-ui`, 36 `@radix-ui` packages), which never reach the bundle.
  - **Bundle cost:** 67 kB gzip in its own `auth-vendor` chunk (Better Auth, zod, and `@supabase/auth-js`, which its shared error helpers depend on).
  - **Net effect:** +38 kB gzip until M6 removes the 141 kB Firebase chunk; after that, the total is far below v1's.

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
3. Add `vercel.json` with one rewrite that sends every path outside `/api` to `/index.html`. Vercel serves files that exist (such as `/assets/*` and `/favicon.svg`) before it applies rewrites, so only client routes reach the rewrite. *Revised in M4:* `vercel dev` has no built files, so this catch-all also swallowed Vite's module requests. See M4 step 9.
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

**User steps:**

- **Trusted domains (before M4).** In the Neon Console → Auth → Domains, add `http://localhost:3000` for `vercel dev`, and also `http://localhost:5173` if sign-in is tested under plain `npm run dev`.
  - The Vercel integration already adds the production domain, the team and branch aliases, and one entry per deployment. As of 2026-10-27 the list holds `aim-assist-v2.vercel.app`, `aim-assist-v2-christian-toro.vercel.app`, `aim-assist-v2-git-release-v20-christian-toro.vercel.app` and four per-deploy URLs.
  - The per-deploy entries accumulate, and old ones can be pruned.
- **Google OAuth, in two stages.** The credentials live in the Neon Console, so switching changes no code and needs no redeploy.
  - *Development (M4 onward):* Neon's shared keys, already offered under Auth → OAuth providers → Google. The Google consent screen then shows Neon's name and logo.
  - *Before the portfolio launch:* your own client, so the consent screen shows "Aim Assist":
    1. In Google Cloud Console → APIs & Services → OAuth consent screen, choose External, set the app name to "Aim Assist", add a support email, and keep only the basic scopes (`openid`, `email`, `profile`), which need no Google verification.
    2. Go to Credentials → Create OAuth client ID → Web application, and use the redirect URI that Neon's Google "configure" dialog shows.
    3. Paste the client ID and secret into Neon's Google configuration in place of the shared keys.

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

## M4 detail

1. Add `@neondatabase/auth@0.7.0-beta`, pinned exactly.
2. `src/services/auth.js`:
   - Build `BetterAuthReactAdapter()(VITE_NEON_AUTH_URL)` directly rather than through `createAuthClient()`. For this adapter, `createAuthClient()` returns only the Better Auth client, which has no `getJWTToken()` (found in the SDK source).
   - Exports:
     - `signInWithGoogle()`: a full-page redirect through `signIn.social`. `callbackURL` is the current absolute URL, because a relative one would resolve against the auth origin.
     - `signOutUser()`.
     - `useAuthSession`: the SDK's `useSession` hook.
     - `getAuthToken()`: `adapter.getJWTToken(false)`. The SDK copies the `set-auth-jwt` header into `session.token`, so this returns the JWT that `/api` needs.
3. `src/utils/authUser.js` holds `toAppUser()`, a pure mapping from `{ id, name, image }` to `{ uid, displayName, photoURL }`, with Vitest tests.
4. `AuthProvider` builds `{ user, isLoading }` from `useAuthSession()` and `toAppUser`. The `ensureUserDocument` call is removed, since it can't write to Firestore without a Firebase user and M6 deletes it.
5. `AuthControls` and `Leaderboards`: drop `isUserCancellation`, which was a popup-only concept; a redirect has no popup to close.
6. `src/firebase/config.js`: remove `getAuth` and `GoogleAuthProvider`. Firestore stays until M6.
7. `api/_lib/verifier.js` and `auth.js`: also check `aud`, which equals the Neon Auth origin (the hardening noted in M3), with a test for the wrong audience.
8. `vite.config.js`: put the SDK in its own `auth-vendor` chunk, so app changes don't invalidate it in caches.
9. **`vercel.json` fix (found by the user running `npm run dev:full`).**
   - **Symptom:** Vite failed with "Failed to parse source for import analysis… index.html".
   - **Cause:** under `vercel dev` there are no built files, so M1's catch-all rewrite sent everything to `/index.html`, including `/src/main.jsx`, `/@vite/client` and `/favicon.svg`. Vite then received module requests for `index.html`.
   - **Fix:** the rewrite is now `/((?!api(?:/|$)|@)[^.]*)`. It applies only to paths without a file extension, and skips `/api` and Vite's `/@…` paths. App routes never contain a dot.
   - **Production bonus:** a missing file such as an old `/assets/*.js` after a deploy now returns 404, where it used to return `index.html` with a 200, which surfaced as a confusing MIME-type error.
   - **Verification gap:** M1's and M2's `vercel dev` checks only requested `/api/health` and HTML pages, never a module, which is why this wasn't caught earlier.
10. Stop for review.

**Known gap until M6:** Profile stats and score saving still go through Firestore, which no longer sees a signed-in user. They fail on this branch until M6 moves them to `/api`.

### M4 verification

- `npm run lint`, `npm run format:check`, `npm test` (87 tests) and `npm run build` pass. The entry chunk is 3.3 kB gzip, and `auth-vendor` is 67 kB gzip.
- `vercel.json` rewrite:
  - `path-to-regexp@6.1.0` matches as intended in 18 cases: app routes and `/apiary` are rewritten; `/api*`, `/@vite/client`, `/@id/…`, `/src/main.jsx`, `/favicon.svg`, `/assets/*.js` and `/node_modules/.vite/deps/*` pass through.
  - Under `vercel dev`, modules are served as `text/javascript` (including `/src/services/auth.js` and the pre-bundled Neon Auth SDK), pages as HTML, `/api/health` as 200 and `/api/me` as 401.
  - *Confirmed 2026-10-27 on `aim-assist-v2.vercel.app` (the M4 build, which preloads `auth-vendor`):*
    - *`/`, `/leaderboards`, `/profile` and `/no-such-page` return 200 HTML.*
    - *The real entry chunk returns 200 JavaScript, and `/favicon.svg` is served as `image/svg+xml`.*
    - *A missing `/assets/index-OLDHASH.js` and `/missing.png` now return 404.*
    - *`/api/health` returns 200, `/api/me` 401 and `/api/nope` 404.*
- SDK smoke test in Node against the live Neon Auth instance:
  - `signIn.social`, `signOut`, `useSession` and `getJWTToken` exist.
  - `getJWTToken(false)` returns `null` when signed out.
  - A Google sign-in for a trusted callback (`localhost:3000`) returns Neon's `/sign-in/social/init` URL.
  - An untrusted callback is rejected with 403.
- *2026-10-27: the user reported that "sign-in works locally" under `npm run dev:full`, which covers check 1. Checks 2–6 (reload, Safari or blocked third-party cookies, sign-out, `/profile`, and a browser JWT reaching `/api/me`) weren't reported and remain open. Check 3 matters most before launch.*
- **Browser checks (user):** on `vercel dev`, or on the Vercel deploy after a push.
  1. "Continue with Google" goes to Google (Neon branding with the shared keys), returns to the same page, and the avatar appears.
  2. Reload: still signed in.
  3. Same in Safari, or in Chrome with third-party cookies blocked.
  4. "Sign out", then reload: signed out.
  5. `/profile` opens while signed in. Its stats error until M6 is expected.
  6. In the DevTools console, signed in: `fetch('/api/me', { headers: { Authorization: 'Bearer ' + await (await import('/src/services/auth.js')).getAuthToken() } }).then((r) => r.json())` returns your `{ uid }`. This works under `vercel dev` only, because production bundles don't serve `/src`.

## M5 detail

1. `api/_lib/http.js` holds the response helpers shared by every route:
   - `json()` sends `Cache-Control: private, no-store` on every response. Public boards aren't CDN-cached either, so a score shows up the moment it's saved.
   - `readJson()` turns a malformed body into a 400.
   - `handle(handler)` maps an `AuthError` to 401 `{ error: 'Unauthorized' }` and an `HttpError` (built with `badRequest()`) to its status and details. Anything else propagates, so Vercel answers 500.
2. `api/_lib/scoreInput.js` holds `parseScoreSubmission(body)`, a pure validator. It returns `{ score }` with only the four known fields, or `{ invalid: [field, …] }` listing every bad field.
   - The bounds match `001_init.sql`'s CHECKs. The mode allowlist is built from `src/game/modes.js`, so the client and server lists can't drift; the SQL CHECK stays as the backstop.
   - Unknown keys, a `uid` included, are dropped. `reactionTime` must be present, either `null` or an integer.
3. `api/_lib/leaderboardView.js` holds `VIEWS` and `periodStart(view, now)`, which is pure. It returns UTC midnight for `daily`, Monday 00:00 UTC for `weekly`, and `null` otherwise.
4. `api/_lib/scoreStore.js` holds `createScoreStore(sql)`, which owns every query. `db.js` wires it to Neon as `scoreStore`. The same pattern as `verifier.js` / `auth.js` lets a check script run the real queries on PGlite.
   - `insert` returns `{ id, createdAt }`.
   - `profileStats(uid)` derives `gamesPlayed`, `highestScore`, `averageAccuracy` and `favoriteMode` (`mode() within group`) from `scores`, plus the account's `createdAt` from `neon_auth."user"`. It returns zeros and a `null` mode for a player with no matches, and `null` for an unknown user.
   - `topScores(since)` keeps each player's best score in the window (`DISTINCT ON (user_id)`), ranks the top 100, and breaks ties in favour of the earlier score.
   - `personalBests(uid)` returns the caller's own top 10, with several entries per player allowed.
   - Entries come back in the shape `Leaderboard.jsx` renders: `{ id, uid, displayName, photoURL, mode, score, accuracy, reactionTime, createdAt }`. Name and avatar are joined from `neon_auth."user"`, and the email is never selected.
5. Routes:
   - `GET /api/me` returns `{ uid, gamesPlayed, highestScore, averageAccuracy, favoriteMode, createdAt }`, the flat shape `getUserProfile` returned, so M6 changes no consumer. A valid token whose user was deleted gets 401.
   - `POST /api/scores` checks the token, then validates the body (400 `{ error, invalid }`), then inserts, and returns 201 `{ id, createdAt }`. A foreign-key violation (`23503`: the token outlived its user) becomes 401.
   - `GET /api/leaderboard?view=all|daily|weekly|personal` (default `all`) returns `{ entries }`. Only `personal` needs a token; an unknown view returns 400 with the valid list.
6. Vitest tests for `scoreInput`, `leaderboardView` and `http` run in the `node` environment with no mocks.
7. Stop for review.

**Behaviour changes from v1:**

- Public boards now show one entry per player; in v1 one player could fill the daily top 100.
- Names and avatars come live from Neon Auth, so a renamed Google account updates its old entries. In v1 they were copied onto each score.
- Daily and weekly boards use UTC days; in v1 they used the player's local day keys.

**Known gap:** `POST /api/scores` has sanity bounds but no rate limit, as in v1. A signed-in user can post many plausible scores. M7 builds per-user rate limiting for the AI endpoints, and the same table could cover score submissions later.

### M5 verification

- `npm run lint`, `npm run format:check`, `npm test` (109 tests, up from 87) and `npm run build` pass.
- `scoreStore` on PGlite, with `001` and `002` applied on a stub `neon_auth."user"` that has the live columns, passes 12 checks:
  - The all-time, weekly and daily boards each keep one best entry per player, and the UTC windows exclude last week's and yesterday's scores.
  - Tied scores rank the earlier one first.
  - The personal board lists several of the player's own matches.
  - Entries have the client's shape and no email.
  - Stats are right for a player with matches, zeros and `null` for one with none, and `null` for an unknown user.
  - `insert` returns `{ id, createdAt }`, and an unknown user is rejected with SQLSTATE `23503`.
- Under `vercel dev` against Neon (scores table empty):
  - `/api/leaderboard` with no view, `daily` and `weekly` return 200 `{"entries":[]}`, so the windowed query runs on Neon through the real driver.
  - `?view=bogus` returns 400. `?view=personal`, `/api/me` and `POST /api/scores` without a token or with a forged one return 401.
  - `GET /api/scores` returns 405.
  - Every M5 response carries `private, no-store`.
- Signed-in paths, *confirmed 2026-10-28 (UTC) under `vercel dev` against Neon*, with a temporary email/password user and its JWT from `{base}/token`. All 22 checks passed:
  - *A new user's `/api/me` showed zero stats, a `null` favourite mode and the account's `createdAt`, and the personal board was empty.*
  - *A body with a bad mode and a negative score got 400 `{"error":"Invalid score","invalid":["mode","score"]}`. Malformed JSON got 400, and no token got 401.*
  - *Three valid posts got 201 `{ id, createdAt }`. The `uid` in one body was ignored: 3 rows were saved under the token's uid, and 0 under the body's.*
  - *`/api/me` then showed 3 games, a high score of 3100, 80 average accuracy and Precision as the favourite mode. The personal board listed 3100, 2500, 1800 with the client's entry shape and no email.*
  - *Signed out, the all, daily and weekly boards each held exactly one entry for the player: its best score, 3100.*
  - *After the user was deleted by exact id and email, the still-valid JWT got 401 from `/api/me` (no user row) and from `POST /api/scores` (foreign-key violation).*
  - *Cleanup left 0 test users, 0 of their sessions and 0 scores.*
