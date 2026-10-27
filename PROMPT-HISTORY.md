# Prompt History

This document records meaningful development interactions between the user and
AI coding agents working on this project. It focuses on requests, outcomes,
implementation decisions, verification, and human-agent collaboration rather
than preserving a raw conversation transcript.

Generated code is included verbatim when reasonably concise. Extensive
implementations are referenced through their canonical repository files.

> This file is an engineering collaboration record, not a source of truth for
> application behavior. The repository itself remains authoritative.

> Prior history: [Prototype/V1-PROMPT-HISTORY.md](Prototype/V1-PROMPT-HISTORY.md),
> the v1 prototype's log, in a different format. This file covers v2 only.

---

## Session: 2026-10-26

**Objective:** Kick off the v2.0 revamp: branch, archive the v1 docs, and plan the Firebase/Pages → Neon/Vercel migration plus the AI features.

### Interaction 1 — v2.0 kickoff and planning

**User Prompt**

> This is a clone of a previous project owned by me that will be revamped and expanded. Refer to the PLAN-CONVERSION.md file as to the trajectory of the changes.
>
> This application will move away from a Github pages deployment that is using Firebase and Firestore and will adopt Vercel as deployment and Neon for database services.
>
> Users will still utilize Google for authentication. Other UI and functionality changes will take place later in separate branches as features.
>
> An AI API (Anthropic) will be used to: (1) assess user scores to recommend hardware adjustments--mouse DPI, etc, and (2) recommend gaming platforms based on their score.
>
> The PROJECT-PLAN, PROMPT-HISTORY, CLAUDE and ARCHITECTURE md files are to be placed in their own directory marked "Prototype"; retitle the file names to ensure future Claude sessions refer to the correct md files for the revamp.
>
> Code execution will be conducted in small milestones to be reviewed before a commit and approval to move to the next milestone.
>
> work will take place on git branch 'release/v2.0'

**Agent Outcome**

In plan mode, read `PLAN-CONVERSION.md` and the Firebase touchpoints, then asked four clarifying questions. Drafted a plan with Milestone 0 (the docs reorg) and a v2 roadmap (M1–M9): Vercel hosting → Neon schema → Better Auth server → auth client → data API → client switchover and Firebase removal → AI hardware recommendations → AI platform recommendations → docs.

**Rationale**

Auth is split into a server milestone and a client milestone ahead of the data API, because every `/api` endpoint needs session identity once Firebase Auth goes away. The `useAuth()` shape (`uid`, `displayName`, `photoURL`) is kept so pages and hooks don't change. The AI features come after the data API because they consume server-side score aggregates.

**Collaboration**

The user made these calls through the clarifying questions:

- **Remove Firebase fully.** This overrides PLAN-CONVERSION's recommended hybrid that kept Firebase Auth.
- **Reset the Firestore data.** Starting empty removes the uid-matching problem a full auth swap would otherwise create.
- **Use a `V1-` prefix** for the archived docs.
- **Build the AI features as milestones on `release/v2.0`**, not on separate feature branches.

### Interaction 2 — Plan saved to the repo; Milestone 0 executed

**User Prompt**

> write this plan as PLAN-V2.md into the root of the repository, and execute in manual mode

**Agent Outcome**

Executed M0 on the new branch `release/v2.0`, created from local `main` (`bdcf5f0`) with no upstream. The work stops at the review gate, uncommitted.

**Rationale**

`PLAN-V2.md` now serves as the v2 project plan and milestone tracker, so there's no separate `PROJECT-PLAN.md` duplicating the roadmap. The archived `CLAUDE.md` was renamed, not just moved, because Claude Code auto-loads any file named `CLAUDE.md` in a subdirectory it works in. The new `CLAUDE.md` keeps the v1 git rules but fixes the push refspec to name the real remote, `origin`, where v1 had said `test`.

**Changes**

- `CLAUDE.md` → [`Prototype/V1-CLAUDE.md`](Prototype/V1-CLAUDE.md) (renamed with `git mv`, with an archive banner added under the title)
- `ARCHITECTURE.md` → [`Prototype/V1-ARCHITECTURE.md`](Prototype/V1-ARCHITECTURE.md) (same)
- `PROJECT_PLAN.md` → [`Prototype/V1-PROJECT-PLAN.md`](Prototype/V1-PROJECT-PLAN.md) (same)
- `PROMPT-HISTORY.md` → [`Prototype/V1-PROMPT-HISTORY.md`](Prototype/V1-PROMPT-HISTORY.md) (same)
- [`CLAUDE.md`](CLAUDE.md) — new v2 agent instructions: doc map, review-gate workflow, stack, ownership, security rules, condensed coding standards, and git rules.
- [`PLAN-V2.md`](PLAN-V2.md) — new: the plan, a Decisions table, and the milestone tracker.
- [`PROMPT-HISTORY.md`](PROMPT-HISTORY.md) — new: this file.
- [`README.md`](README.md) — the three doc links now point at `Prototype/V1-*`.
- [`PLAN-CONVERSION.md`](PLAN-CONVERSION.md) — newly tracked, content unchanged.

**Verification**

- `git rev-parse --abbrev-ref release/v2.0@{upstream}` → `fatal: no upstream configured`.
- `npm ci`, then `npm run lint` (clean) and `npm test` (72 tests in 15 files passed). `node_modules` was absent in the fresh clone.
- `git status` shows the four renames. Root docs and the README were grepped for links to the old paths.

**Collaboration**

The user reviewed M0 and approved it ("make the one commit and use the suggested message"). It was committed as a single commit on `release/v2.0` titled "Archive v1 docs to Prototype/ and add v2 plan, CLAUDE.md, and prompt history". M0 is marked Done in PLAN-V2.md.

---

## Session: 2026-10-27

**Objective:** Resume v2.0 work with a status check of the repo against PLAN-V2.md, then execute M1 (Vercel hosting).

### Interaction 1 — SITREP before M1

**User Prompt**

> /prompt-history /sitrep

**Agent Outcome**

Read-only status report. M0 is committed (`fc9acb5`) and `release/v2.0` now tracks `origin/release/v2.0` with nothing ahead or behind. M1 hasn't started: `vite.config.js` still sets `base: '/Aim_Assist/'`, the `build` script still runs `scripts/spa-fallback.mjs`, there's no `vercel.json`, and `deploy.yml` is still the Pages workflow (it triggers only on `main`, so it doesn't fire on the release branch). No `api/` or `db/` exists yet, and `firebase` is still a dependency, as the plan expects before M6.

**Verification**

Inspected git state, `PLAN-V2.md`, `vite.config.js`, `package.json` and `.github/workflows/deploy.yml`. No tests were run.

### Interaction 2 — Milestone 1: Vercel hosting

**User Prompt**

> begin execution of milestone 1

**Agent Outcome**

Wrote the M1 step detail into `PLAN-V2.md` and executed it. The app now builds for the domain root, `vercel.json` handles SPA deep links, and the Pages deploy workflow is now CI-only. The work stops at the review gate, uncommitted, and M1 is marked "In review".

`vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/((?!api(?:/|$)).*)", "destination": "/index.html" }
  ]
}
```

**Rationale**

The rewrite's lookahead excludes `/api` and `/api/*` but not look-alikes such as `/apiary`. Vercel serves files that exist before it applies rewrites, so assets never reach the rewrite. `BrowserRouter`'s `basename` was removed rather than kept as `BASE_URL`, because with `base: '/'` it would always equal the router's default. CI also runs `format:check` and `build`, so a broken build is caught on the branch and not only by a Vercel deploy.

**Changes**

- [`vite.config.js`](vite.config.js) — removed `base: '/Aim_Assist/'` and its Pages comment, so the default `/` applies.
- [`src/App.jsx`](src/App.jsx) — removed the `basename` prop and its comment.
- [`vercel.json`](vercel.json) — new: the SPA rewrite.
- `package.json` — `build` is now plain `vite build`.
- `scripts/spa-fallback.mjs` — deleted (with `git rm`). It was the Pages `404.html` workaround.
- `.github/workflows/deploy.yml` → [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — renamed with `git mv` and rewritten. It runs on pushes to `main` and `release/**` and on PRs (lint, format check, test, build) with `contents: read` only. The Pages jobs and the Firebase secret check are gone.
- [`PLAN-V2.md`](PLAN-V2.md) — M1 detail, user steps and verification; M1 status set to "In review".

**Verification**

- `npm run lint` is clean, `npm run format:check` passes (after Prettier reflowed `vercel.json`), and `npm test` passes 72 tests in 15 files.
- `npm run build` succeeded. `dist/` has no `404.html`, and every asset URL in `dist/index.html` is root-relative (`/assets/…`).
- `vite preview` returned 200 for `/`, `/leaderboards`, `/favicon.svg` and the entry JS. This checks the base path only, since `vite preview` has its own SPA fallback.
- The rewrite `source` was tested with `path-to-regexp@6.1.0`, which Vercel uses to compile it, installed in a scratch directory outside the repo. Client routes and `/apiary` are rewritten; `/api`, `/api/`, `/api/me` and `/api/auth/callback/google` pass through.
- **Not verified:** a real Vercel deploy. That needs the user to import the repo first.

**Open user steps**

Import the repo into Vercel, then hard-refresh a deep link to verify the rewrite. The two Firebase steps are optional (see Interaction 3).

**Collaboration**

At the review gate, the user asked why the Firebase steps were needed, since v2 drops Firebase (Interaction 3).

### Interaction 3 — Firebase deploy steps made optional; M1 committed

**User Prompt**

> before we commit, explain why steps 2 and 3 are necessary--this version of Aim Assist will not be leveraging firebase. is this to check deployment success?

> make steps 2 & 3 optional with an explanation to what they will perform, then commit

**Agent Outcome**

Explained that the two steps aren't a deployment check. The branch still runs on Firebase until M4 (auth) and M6 (data), and `src/firebase/config.js` initializes it on every page load. Without the `VITE_FIREBASE_*` env vars, `getAuth()` throws on load, so the Vercel page is likely blank. This comes from reading the code and the SDK's behavior, not from a deploy. Without the authorized domain, only Firebase Google sign-in fails. Either way the rewrite can still be verified, because a deep link returns `index.html`.

The PLAN-V2.md M1 user steps were rewritten: importing into Vercel is required, while the env vars and authorized domain are labeled optional, each with what it enables and the milestone that undoes it (M6 and M4). M1 is marked Done, with the live-deploy rewrite check noted as pending the Vercel import. Committed on `release/v2.0` as "Move hosting to Vercel: root base path, SPA rewrite, CI-only workflow".

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md) — M1 user steps split into required and optional interim Firebase steps; M1 status set to Done.

**Verification**

No code changed after Interaction 2's checks. The commit was confirmed with `git log`.

**Collaboration**

The user challenged the Firebase steps as contradicting v2's Firebase removal. That changed them from required setup into optional, explicitly temporary steps.

### Interaction 4 — First Vercel deploy: blank page troubleshooting

**User Prompt**

> [Summarized: a series of Q&A turns covering where to find the Firebase web config, how to make `release/v2.0` Vercel's production branch, and why `https://aim-assist-v2.vercel.app/` stayed blank after the env vars were set.]

> Mark the M1 deep-link check as confirmed

> include a summarized note about the troubleshooting into prompt history, then include that change with the plan-v2 amendment as one commit

**Agent Outcome**

The blank page was diagnosed by fetching the live bundle with `curl`. Its entry chunk had the same hash as a local build made without `.env` (`index-DPXV9vf2.js`), and the Firebase config compiled to `apiKey:void 0` / `projectId:void 0`. So `getAuth()` threw on load, as predicted in Interaction 3. There were two causes, fixed in turn:

1. **Variables added after the build.** Vite writes `VITE_*` values into the bundle at build time, so the deployment had to be rebuilt.
2. **Wrong variable names.** The Vercel keys had been named after the Firebase config fields (such as `apiKey`) instead of `VITE_FIREBASE_*`, so Vite ignored them. They were renamed using the field → variable mapping from `src/firebase/config.js`.

When the vars were saved, Vercel warned that the `VITE_` prefix exposes them to the browser. That's correct, and it's acceptable for Firebase web config, which is public by design. They were kept prefixed and set to Vercel's "Config" type. The same warning applies to the future server secrets (`DATABASE_URL` and the others), which must never take that prefix.

After a clean redeploy, the entry chunk changed to `index-Cs0nb64U.js` with all six config fields populated. The M1 deep-link check was confirmed live: `/leaderboards` returned `200 text/html`.

The user also asked whether values from the v1 build would matter. They don't: they identify the same Firebase project that this branch still uses until M6.

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md) — the M1 rewrite check is marked confirmed on `aim-assist-v2.vercel.app`.

**Verification**

The checks were `curl` probes of the live HTML, entry chunk and `/leaderboards`. The API key was redacted from all output. Page rendering was **not** verified by the agent, since `curl` can't execute the app; the user hard-refreshes in a browser for that.

**Collaboration**

The user ran every Vercel and Firebase dashboard step. Their remark that the key "is titled apiKey" exposed the naming mismatch.

### Interaction 5 — Milestone 2: Neon schema, migration runner, health endpoint

**User Prompt**

> begin execution of milestone 2

**Agent Outcome**

Wrote the M2 step detail into `PLAN-V2.md` and executed the repo side. The work stops at the review gate, uncommitted, and M2 is marked "In review". The Neon integration, `vercel link` and `vercel env pull` are user steps, so nothing has run against a real Neon database yet.

**Rationale**

- **`scores` only, no `users` table.** The PLAN-CONVERSION sketch's `users` table was dropped, because Better Auth's `user` table (M3) will hold name and image. The column is `user_id`, with its foreign key deferred to M3's migration, once the table it references exists.
- **A migration runner, not a tool.** There's no `psql` on this machine, and every Neon branch should be migrated the same way. `scripts/migrate.js` (about 70 lines) applies files in order, each in a transaction, and records them in `schema_migrations`. It uses the driver's WebSocket `Client` because migration files hold several statements, which the HTTP `neon()` function can't run.
- **`api/_lib/db.js` moved here from M3.** M2 has to prove `/api` and Neon work, and `GET /api/health` (`select 1`) is the smallest endpoint that shows both.
- **Vercel CLI installed globally.** `vercel dev` runs on a global install instead of a devDependency, since the CLI is large and only used locally.

**Implementation**

- [`db/migrations/001_init.sql`](db/migrations/001_init.sql) — the `scores` table: CHECK bounds copied from `firestore.rules`, plus score, user-and-score and `created_at` indexes.
- [`scripts/migrate.js`](scripts/migrate.js) — key symbols `listPending()`, `applyMigration()`, `migrate()`. It prefers `DATABASE_URL_UNPOOLED`.
- [`api/_lib/db.js`](api/_lib/db.js), [`api/health.js`](api/health.js) — a web-standard `export const GET` handler that returns `{ ok, database }`, or 503.

**Changes**

- `package.json` / `package-lock.json` — `@neondatabase/serverless@^1.2.0` added (the only new package in the lockfile). New scripts: `dev:full` (`vercel dev`) and `db:migrate` (`node --env-file-if-exists=.env.local`, so no dotenv dependency).
- `eslint.config.js` — Node globals for `api/**` and `scripts/**`.
- `.env.example` — server-only section for `DATABASE_URL` and `DATABASE_URL_UNPOOLED`, with a warning never to give them a `VITE_` prefix.
- `.gitignore` — `.vercel`.
- [`PLAN-V2.md`](PLAN-V2.md) — M2 detail, user steps and verification.

**Verification**

- `npm run lint`, `format:check` and `build` pass, and `npm test` passes 72 tests in 15 files.
- `npm run db:migrate` without credentials exits 1 with "DATABASE_URL is not set. Run `vercel env pull .env.local` first."
- `001_init.sql` was applied in PGlite (in-process Postgres, installed in a scratch directory outside the repo). Valid rows inserted, including the boundary values and a null reaction time. Unknown mode, score out of range, accuracy out of range, reaction time over 60000, and null `user_id` or `accuracy` were each rejected by the intended constraint. All three indexes exist.
- `npm audit` reports 17 findings (3 moderate, 14 high, including zod). The lockfile diff shows `@neondatabase/serverless` as the only added package, with no transitive packages, so none of the findings come from M2. They were not addressed here.
- **Not yet verified:** `migrate.js` against Neon (including its transaction and rerun behavior), `/api/health` under `vercel dev`, and `/api/health` on a Vercel deploy. All need the user steps first.

### Interaction 6 — M2 verified against Neon

**User Prompt**

> neon is connected and env pulled, run the verification

**Agent Outcome**

M2 now works against the real Neon database and under `vercel dev`. The only remaining check is `/api/health` on the deployed site, which needs a push.

The `vercel env pull` output also contained `NEON_AUTH_BASE_URL` and `VITE_NEON_AUTH_URL`, which means Neon Auth was turned on with the integration. That bears on M3's pre-check of Better Auth against Neon Auth; it's flagged, not acted on. `vercel link` also appended a `.env*` line to `.gitignore`. It duplicates the existing `.env` / `.env.*` rules and comes after the `!.env.example` exception, so it would ignore an untracked `.env.example`. At the user's direction ("remove the .gitignore line, then commit"), the line was removed. `git check-ignore --no-index` confirmed that `.env` and `.env.local` stay ignored and `.env.example` doesn't. M2 was marked Done and committed on `release/v2.0` as "Add Neon schema, migration runner and /api/health".

**Verification**

- `npm run db:migrate` printed "Applied 001_init.sql". A second run printed "Database is up to date."
- In a transaction on Neon that was rolled back, the catalog showed `schema_migrations` holding `001_init.sql`, every `scores` CHECK constraint, and all three indexes. A valid row inserted, and a negative score was rejected by `scores_score_check`. The table held 0 rows after the rollback.
- `vercel dev --listen 3000`: `GET /api/health` returned `{"ok":true,"database":"up"}` (200, `application/json`), and `/leaderboards` returned 200 `text/html`. The server was stopped afterwards.
- Pending: `/api/health` on the Vercel domain after a push.

### Interaction 7 — M2 deployed check

**User Prompt**

> pushed, check the health endpoint on vercel and display the results

**Agent Outcome**

After the user pushed `c54837d`, the live deployment passed M2's last check. M2 is fully verified.

**Verification**

`curl` against `https://aim-assist-v2.vercel.app`:

| Request | Result |
|---|---|
| `GET /api/health` | 200 `application/json`, `{"ok":true,"database":"up"}`, `x-vercel-cache: MISS` (a live round trip, region `iad1`) |
| `GET /api`, `GET /api/nope` | 404 `text/plain`, Vercel's `NOT_FOUND` (not rewritten to the app) |
| `GET /leaderboards` | 200 `text/html` (SPA rewrite intact) |

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md) — the deployed `/api/health` check is marked confirmed. Committed as `f36d5df`.

### Interaction 8 — Neon Auth vs Better Auth, before M3

**User Prompt**

> commit the changes first.
>
> Before the execution of milestone 3, I want to compare using Neon Auth or Better Auth for the application

**Agent Outcome**

Committed the M2 confirmation (`f36d5df`). Then compared Neon's Managed Better Auth ("Neon Auth") with self-hosted Better Auth, using Neon's docs, Better Auth's installation docs and `npm view`, all as of 2026-10-27. **Recommendation: self-hosted Better Auth, as already planned. The decision is the user's and is still pending.**

Findings that shaped the recommendation:

- **Maturity.** The Neon Auth *service* is GA and runs Better Auth 1.7.6. Its client SDKs are still pre-1.0 (`@neondatabase/auth` 0.7.0-beta, `@neondatabase/neon-js` 0.9.0-beta), and `@neondatabase/auth` pins `better-auth` 1.7.6. Self-hosted `better-auth` is at 1.7.14.
- **Identity in `/api`.** Neon Auth runs on a Neon domain, so `/api` would verify a Bearer JWT against `{NEON_AUTH_URL}/.well-known/jwks.json` with `jose` and take the uid from `sub`. Neon's Hono guide checks only `iss`. Self-hosted, `/api/auth/*` runs on the app's own domain, and `/api` reads a first-party session cookie through `auth.api.getSession()`. That matches CLAUDE.md's "identity from the server session".
- **Architecture fit.** Neon's roadmap lists "standalone frontend + backend" as "Coming soon", citing cookies that can't be shared across domains. Neon's own SPA + Hono guide still works through the Bearer-token pattern.
- **Where Neon Auth wins.** Less code, no `BETTER_AUTH_SECRET`, shared Google credentials for testing, auth state that branches with each Neon branch, and up to 60k MAU free. The Neon integration already enabled it (`VITE_NEON_AUTH_URL` and `NEON_AUTH_BASE_URL` came down with `vercel env pull`).
- **Where self-hosting costs more.** The user needs their own Google OAuth client. Google doesn't accept wildcard redirect URIs, so sign-in on per-deploy preview URLs needs Better Auth's OAuth proxy plugin or has to be tested on stable domains.

**Verification**

This was research only; nothing was installed or prototyped. Versions came from `npm view`. Neon Auth's cookie and session behavior across domains with a Vite SPA, under Safari's third-party-cookie blocking, was not tested.

### Interaction 9 — Neon Auth chosen; M3 and M4 replanned

**User Prompt**

> We will be moving forward with Neon Auth. Make the appropriate changes to M3 and M4

**Agent Outcome**

The user chose Neon Auth over the recommended self-hosted Better Auth. A read-only query of the live database found that Neon Auth had created `neon_auth.{user, session, account, jwks, …}`, the `user` table has 0 rows, and `neon_auth."user".id` is a **`uuid`**, not text. The table is owned by `neon_auth`, and `neondb_owner` holds `REFERENCES` and `SELECT` on it. The `uuid` id changed M3: its migration must also convert `scores.user_id` from `text` to `uuid` before adding the foreign key.

The plan and project docs were updated to match:

- **M3** is now: `api/_lib/auth.js` verifies the Bearer JWT with `jose` against `NEON_AUTH_BASE_URL/.well-known/jwks.json` (issuer and expiry, uid from `sub`), with Vitest tests using locally generated keys. `GET /api/me` returns the verified identity or 401. Migration `002` changes `user_id` to `uuid` and adds an `on delete cascade` foreign key. User steps: own Google credentials and trusted domains in the Neon Console.
- **M4** is now: add `@neondatabase/auth`, then move `services/auth.js` (`signIn.social`) and `AuthProvider` onto it, mapping `id`/`name`/`image` to the unchanged `useAuth()` shape. Add `getAuthToken()` and remove `getAuth` from the Firebase config. Saving scores is noted as unavailable between M4 and M6.
- **M5** extends `/api/me` instead of creating it.

**Rationale**

`GET /api/me` moved into M3 so that server-side token verification has a live surface to test. `@neondatabase/auth` was picked over `@neondatabase/neon-js` because the latter adds the Data API client and `pg`. It's pinned exactly because it's a beta. `on delete cascade` removes a user's scores when Neon Auth deletes that user.

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md):
  - Auth row in Decisions, revised and dated.
  - M3, M4 and M5 rows.
  - Dependencies: `better-auth` replaced by `jose` (M3) and `@neondatabase/auth` (M4).
  - New "Neon Auth notes" section.
  - Stale Better Auth references corrected in the M1 and M2 details.
- [`CLAUDE.md`](CLAUDE.md):
  - Auth stack row.
  - Security rules: `BETTER_AUTH_SECRET` and `GOOGLE_CLIENT_SECRET` dropped from the secrets list, since Google credentials now live in the Neon Console. Identity now comes from the verified JWT's `sub`.
- [`db/migrations/001_init.sql`](db/migrations/001_init.sql) — comment only. It now names `neon_auth."user"` and the uuid change. The file is already applied, and the runner tracks migrations by filename, so the edit doesn't re-run anything.

**Verification**

These are documentation changes. A grep confirms that the only remaining "Better Auth" mentions describe Neon Auth's internals. The schema facts come from `information_schema`, `pg_tables` and `has_table_privilege` queries against Neon. No tests were run, since no code changed.

**Collaboration**

The user overrode the agent's recommendation and chose Neon Auth.

### Interaction 10 — Milestone 3: Neon Auth token verification

**User Prompt**

> commit, then begin execution of milestone 3

**Agent Outcome**

Committed the auth replan (`5b41e46`), wrote the M3 detail into `PLAN-V2.md`, and executed the repo side. The work stops at the review gate, uncommitted, and M3 is marked "In review". Applying `002` to Neon and testing with a real Neon Auth token are waiting on the user's approval.

Neon Auth's public metadata was checked before any code was written. Its JWKS holds one `OKP`/`Ed25519` key with `alg: EdDSA`, and `/.well-known/openid-configuration` returns 404. So the verifier pins `EdDSA` and takes its issuer rule (the origin of `NEON_AUTH_BASE_URL`) from Neon's backend guide. `VITE_NEON_AUTH_URL` and `NEON_AUTH_BASE_URL` hold the same URL.

**Rationale**

- **Pure verifier, separate wiring.** `verifier.js` holds the pure `createVerifier({ keySet, issuer })`. `auth.js` builds the Neon Auth instance from env at import. The split came from the first draft: there, importing the module read `NEON_AUTH_BASE_URL` immediately, so tests couldn't import the verifier without the env var.
- **401 vs 500.** Only jose token errors become a 401 `AuthError`. A JWKS timeout or any other error propagates as a 500, so an outage on our side isn't reported as the caller's fault.
- **Required claims.** `requiredClaims: ['sub', 'exp']` rejects tokens that never expire, and tokens with no subject.

**Implementation**

- [`api/_lib/verifier.js`](api/_lib/verifier.js) — `createVerifier()`, `AuthError` (`status = 401`).
- [`api/_lib/auth.js`](api/_lib/auth.js) — `verifyRequest`: a remote JWKS at `NEON_AUTH_BASE_URL/.well-known/jwks.json`, built once per cold start.
- [`api/me.js`](api/me.js) — `GET` returns `{ uid }` or 401 `{ error: 'Unauthorized' }`, both with `Cache-Control: private, no-store`.
- [`api/_lib/verifier.test.js`](api/_lib/verifier.test.js) — 11 tests using an Ed25519 key pair generated in the test, in Vitest's `node` environment.
- [`db/migrations/002_scores_user_fk.sql`](db/migrations/002_scores_user_fk.sql) — `user_id` becomes `uuid`, with a foreign key to `neon_auth."user"(id)` and `on delete cascade`.

**Changes**

- `package.json` / `package-lock.json` — `jose@^6.2.13`, one package with no transitive dependencies.
- `.env.example` — `NEON_AUTH_BASE_URL` and `VITE_NEON_AUTH_URL`.
- [`PLAN-V2.md`](PLAN-V2.md):
  - M3 detail, user steps (own Google OAuth client and trusted domains in the Neon Console) and verification.
  - A note on the risk that the foreign key depends on a managed table.
  - M3 status set to "In review".

**Verification**

- `npm run lint` and `format:check` are clean. `npm test` passes 83 tests in 16 files, 11 of them new. `npm run build` passes.
- PGlite (scratch directory), applying `001` then `002` on top of a stub `neon_auth."user"` (uuid primary key):
  - `user_id` became `uuid`;
  - a known user's score inserted;
  - `'not-a-uuid'` was rejected;
  - an unknown uuid was rejected by `scores_user_id_fkey`;
  - deleting the user left 0 scores.
- `vercel dev`: `/api/me` returned 401 `{"error":"Unauthorized"}` with no header, with a `Basic` scheme, and with `Bearer not-a-jwt`. A token forged with the correct issuer and expiry but the agent's own Ed25519 key was also refused with 401, which shows the remote JWKS fetch works. `Cache-Control: private, no-store` was present.
- On the first run the forged-token probe was invalid: the URL was passed as an argument instead of an environment variable, so an empty token was sent. It was rerun correctly before the result above was recorded.
- **Not yet verified:**
  - `002` against Neon;
  - a real Neon Auth token reaching 200, and its actual `iss`, `aud` and `alg`.

### Interaction 11 — User applies `002` on Neon

**User Prompt**

> Would I be able to conduct step 1 to apply 002?

**Agent Outcome**

The agent gave the user the command, the expected output and SQL to check the result. The user ran `npm run db:migrate` themselves, and it printed "Applied 002_scores_user_fk.sql".

**Verification**

Read-only queries on Neon showed:

- `schema_migrations` = `001_init.sql, 002_scores_user_fk.sql`;
- `scores.user_id` is `uuid`;
- `scores_user_id_fkey` is `FOREIGN KEY (user_id) REFERENCES neon_auth."user"(id) ON DELETE CASCADE`.

A rerun of `db:migrate` printed "Database is up to date."

**Collaboration**

The user chose to run the production-adjacent migration themselves, rather than have the agent run it.

### Interaction 12 — M3 committed; real-token check

**User Prompt**

> commit M3 as it stands, and conduct step 2

**Agent Outcome**

Committed M3 as `ec851b9`, then ran the real-token check under `vercel dev` and marked M3 Done.

1. **Created a temporary test user.** `POST {NEON_AUTH_BASE_URL}/sign-up/email` with `Origin: http://localhost:3000`, a throwaway `@example.com` address and a random password returned 200. The user's id was `059699e6-…`.
2. **Got a JWT.** `GET {base}/token` with the session cookie returned an Ed25519 JWT. `get-session` also returned one in its `set-auth-jwt` header.
3. **Inspected the token.** `alg: EdDSA`, `kid` matching the JWKS key, `iss` = `aud` = the auth URL's origin, and a lifetime of 900 s. The claims also carry the user's profile (`name`, `email`, `role`, …).
4. **Called `/api/me`.**
   - The real JWT returned **200** `{"uid":"059699e6-…"}`.
   - The same JWT with `sub` altered returned **401**.
   - The opaque session `token` from sign-up returned **401**.
5. **Deleted the test user.** It was deleted by exact id and email with SQL (`neondb_owner` has `DELETE` on `neon_auth."user"`). The cascade removed its `session` and `account` rows. Afterwards `neon_auth."user"` and `scores` both held 0 rows, and the scratch files holding the credentials and tokens were deleted.

**Rationale**

The issuer rule taken from Neon's guide (`iss` = origin) now matches a real token. Two findings went into PLAN-V2's Neon Auth notes for M4:

- **The JWT/session-token split.** `getAuthToken()` must return the JWT, while Neon's Hono guide reads `session.token`.
- **An audience check.** Real tokens carry `aud`, so adding an `audience` check is a cheap hardening.

The 15-minute stateless token lifetime was also noted.

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md):
  - M3 status set to Done.
  - Real-token results recorded in the M3 verification.
  - Three Neon Auth notes added.

These are uncommitted.

**Verification**

Recorded above. All requests used `curl` against the live Neon Auth instance and the local `vercel dev`. The dev server was stopped afterwards.

**Collaboration**

The user then had the doc updates committed (`9e822ec`) and pushed the branch.

### Interaction 13 — `/api/me` on Vercel

**User Prompt**

> pushed, check /api/me on vercel

**Agent Outcome**

The deployed `/api/me` behaves as it did locally. Because the forged token produced a clean 401, the production function has `NEON_AUTH_BASE_URL` (a missing value would give a 500 at import) and can fetch Neon Auth's JWKS.

**Verification**

`curl` against `https://aim-assist-v2.vercel.app`:

| Request | Result |
|---|---|
| `/api/me`, no token | 401 `{"error":"Unauthorized"}` |
| `/api/me`, `Bearer not-a-jwt` | 401 |
| `/api/me`, forged EdDSA token (correct `iss`/`aud`/`exp`, agent's own key) | 401 |
| `/api/health` | 200 `{"ok":true,"database":"up"}` |

Headers: `Cache-Control: private, no-store`, `x-vercel-cache: MISS`.

A real token reaching 200 was **not** tested on Vercel. It was confirmed under `vercel dev` (Interaction 12), and M4's sign-in will exercise it.

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md) — the deployed `/api/me` result is added to the M3 verification. Uncommitted.


