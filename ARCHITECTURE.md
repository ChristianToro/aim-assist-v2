# Architecture

How Aim Assist v2 is put together: what each layer owns, how a request moves through the system, and the rules that keep the boundaries clean. The canvas engine is unchanged from v1; the server and data layers are new. The v1 design spec is archived at [Prototype/V1-ARCHITECTURE.md](Prototype/V1-ARCHITECTURE.md).

## Overview

```
 Browser ─────────────────────────────────────────────────────────────
   React UI ── start / pause / resume / stop ──▶ Canvas game engine
   (pages, hooks, contexts)  ◀── onHud, onGameOver ──  (src/game/)
        │
        │  src/services/*  (fetch + Bearer JWT)
        ▼
 Vercel Functions ─────────────────────────────────────────────────────
   /api/me  /api/scores  /api/leaderboard  /api/insights/*
        │                 │                        │
        ▼                 ▼                        ▼
   Neon Auth JWKS    Neon Postgres           Anthropic API
   (verify tokens)   (scores, insights)      (Claude, server-side only)
```

Three rules hold the design together:

1. **React never animates gameplay.** The engine owns the frame loop and reports to React through event callbacks, never per frame.
2. **The browser never touches data directly.** Every database read and write, every token check and every AI call happens in `/api`. The browser reaches it only through `src/services/*`.
3. **Identity comes from a verified token, never from the request body.** `/api` takes the user id from the `sub` of a Neon Auth JWT it has verified.

## Layer 1: React (`src/`)

React owns everything around gameplay: routing, menus, auth state, settings, themes, statistics, leaderboards and the AI insight panels.

| Folder | Role |
|---|---|
| `pages/` | One component per route. Each is code-split with `lazy()`; `/play` and `/profile` sit behind `ProtectedRoute`, and the navbar shows page links only to signed-in players. |
| `components/` | Small presentational pieces (`Leaderboard`, `ProfileHeader`, `StatStrip`, `Tabs`, `InsightPanel`, …) plus the game bridge (`GameArea`, `GameCanvas`, `GameHud`). `LoadingScreen` is the one "page not ready" frame, shown both while a route's chunk downloads and while `ProtectedRoute` waits for the session. `components/landing/` holds the home page's sections, including the waterline headline the 404 page reuses and a DOM warm-up target that reports reaction times (no canvas, nothing animated per frame). |
| `hooks/` | Stateful logic: `useAuth`, `useLeaderboard`, `useUserProfile`, `useInsight`, `useGameSession` (which owns one engine instance), the landing page's `useReveal`, `useCycle` and `useWarmupTarget`, and Settings' `useMediaQuery` (the OS's motion and contrast preferences). |
| `contexts/` | `AuthProvider` (the Neon Auth session, mapped to `{ uid, displayName, photoURL }`) and `ThemeProvider`. |
| `services/` | The only modules that leave the browser: `auth.js` (Neon Auth SDK) and `fetch` wrappers over `/api`. |
| `utils/` | Pure functions (error messages, form parsing, user mapping, mode facts, reaction timing, leaderboard and profile formatting), tested without mocks. |
| `styles/` | `themes.css` (the five themes as one set of semantic colour roles, which the canvas reads too), the theme list, and the shared data-table class lists. |

**Services.** `services/api.js` holds `apiFetch`, the single place the browser calls `/api`. With `auth: true` it attaches `Authorization: Bearer <jwt>` from `getAuthToken()`; when no one is signed in, it fails with a 401 before making any request. A non-2xx response becomes an `ApiError { status, message, details }`, so the UI can word each failure: the leaderboard tells a 401 apart from an outage, and the insight panels say how many more matches are needed or when the daily limit resets. The other services (`users`, `scores`, `leaderboard`, `insights`) are thin wrappers that take no user id, because the server already knows who is asking.

**Data fetching.** The read hooks key their results by request (view and uid), and derive loading state by comparing the requested key with the key of the last result, so there's no synchronous `setState` inside effects. `useInsight` is the exception by design. It runs on a button click, never on mount, because each fresh answer is a paid Claude call. It keeps the previous answer on screen while a new one loads, and only the latest of overlapping requests is applied.

**Styling.** Components use only the semantic utilities that `src/index.css` maps onto the theme roles (`bg-surface`, `text-muted`, `text-accent`, …), so switching theme changes no markup. The same file holds two type scales: a page scale in Unbounded and Onest for the landing and 404 pages, and an app scale (title, label, ui, meta) for the screens players work in. The accent appears on actions and on one selection mark, a 1px line under the chosen tab or nav link. Motion is CSS only (transform and opacity), and `prefers-reduced-motion` collapses it globally. Each theme strengthens its own borders and secondary text under `prefers-contrast: more`. [PLAN-UI.md](PLAN-UI.md) records the design decisions.

## Layer 2: Canvas game engine (`src/game/`)

Plain ES classes with no React and no DOM beyond the canvas they're given.

| Module | Owns |
|---|---|
| `GameEngine` | The `requestAnimationFrame` loop and its lifecycle API (`attach`, `start`, `pause`, `resume`, `stop`, `reset`). Delta time is clamped, so a backgrounded tab can't cause one huge physics step. |
| `GameSession` | One match of one mode: spawning, the countdown or miss limit, and the match's event log (each hit, miss and expiry, stamped in game time). It implements the engine's scene contract. |
| `Spawner`, `Target`, `Collision` | Non-overlapping placement (rejection sampling), target motion and lifetime, and hit-testing against the full radius. |
| `difficulty.js` | Survival's ramp as pure functions of game time: the spawner settings it changes and their value at any ms. `GameSession` ramps its spawner with them; `api/_lib/matchCheck.js` checks logs against the same values. |
| `scoring.js` | The pure definition of a score from an event log: a target's value from its spawn time, and `scoreEvents` for a whole match. The live HUD and the results screen both use it, and it imports nothing outside `src/game` and `src/utils`, so `/api` can too. |
| `ScoreManager`, `Timer` | Score, combo multiplier, accuracy and reaction times, fed one event at a time through `scoring.js`; the match clock. |
| `Particle`, `FloatingText`, `AudioManager` | Hit effects, and Web Audio sound synthesized at runtime (no audio files). |
| `Input` | A queue of clicks in canvas coordinates, consumed during `update`, so a click is handled at a fixed point in the frame. |
| `modes.js`, `palette.js` | Modes as pure configuration; theme colors read from CSS custom properties once per theme change, never per frame. |

**The scene contract.** The engine drives any object with `update(dt, size, input)` and `render(ctx, size)`. All six modes, including Survival's difficulty ramp, are configurations of one `GameSession`. No mode has code of its own.

**The React boundary.** React talks to the engine through its lifecycle API only. The session talks back through two callbacks: `onHud(snapshot)` fires when something on the HUD changes (a hit, a miss, or a new second on the clock), and `onGameOver(summary)` fires once. `GameCanvas` mounts the canvas and keeps it sized to its layout times `devicePixelRatio`; it never re-renders during play. The only inbound call during a match is `setPalette()`, which recolors a live match when the theme changes without resetting it.

## Layer 3: Server (`api/`), Neon and Anthropic

Every `.js` file directly under `api/` is a Vercel Function, and its path is its route. Shared code lives in `api/_lib/`; the underscore keeps it from being routed, and tests sit beside the code they cover.

### Routes

| Route | Auth | Does |
|---|---|---|
| `GET /api/health` | none | `select 1` against Neon: 200, or 503 if the database is down. |
| `GET /api/me` | required | The caller's uid and profile stats, derived in SQL on each request. |
| `POST /api/matches` | required | Issues a match when a signed-in player presses Start: `{ mode }` in, 201 `{ matchId, startedAt, expiresAt }` out. At most 20 per player in any 10 minutes (429 with `Retry-After`). |
| `POST /api/scores` | required | Redeems a match with its event log, `{ matchId, events }`: checks it, computes the score on the server and stores it. Returns 201 with the stored figures. |
| `GET /api/leaderboard?view=all\|daily\|weekly\|personal` | `personal` only | The top 100 (one best entry per player), or the caller's own top 10. |
| `POST /api/insights/hardware` | required | DPI, sensitivity and polling-rate advice from Claude. The body may carry the current `{ setup }`. |
| `POST /api/insights/platforms` | required | 3–5 shooter games, with their platforms, that suit the caller's aim. |

Every response is JSON with `Cache-Control: private, no-store`, so a saved score shows up immediately. `handle()` in `http.js` maps an `AuthError` to 401 and an `HttpError` to its own status and details; anything else is a bug or an outage, and Vercel answers 500.

### `api/_lib/` modules

Modules that touch the outside world are split into a pure factory and a small wiring module. The factory takes its dependency as an argument; the wiring module builds the real dependency from environment variables. Tests and scratch scripts use the factories with local keys, PGlite or a fake client, so nothing in the test suite needs a network.

| Factory | Wiring | Dependency |
|---|---|---|
| `verifier.js`: `createVerifier({ keySet, issuer, audience })` | `auth.js`: Neon Auth's remote JWKS | `jose` |
| `scoreStore.js`, `matchStore.js`, `insightStore.js`: queries over a tagged-template `sql` | `db.js`: Neon's HTTP driver | `@neondatabase/serverless` |
| `structuredOutput.js`: `createStructuredCaller(client)` | `claude.js`: `new Anthropic()` | `@anthropic-ai/sdk` |

The rest are pure functions with unit tests: request validation (`scoreInput.js`, `matchPolicy.js`, `checks.js`), the event-log plausibility rules (`matchCheck.js`, not yet wired to a route; tested against engine-made logs and the real matches in `fixtures/`), the UTC board windows (`leaderboardView.js`), the cache key and limit arithmetic (`insightPolicy.js`, `rateLimit.js`, and `matchPolicy.js`'s ticket lifetimes), and each insight kind's prompt, schema and answer check (`hardwareAdvice.js`, `platformAdvice.js`). `matchIssue.js` (the issue limit) and `matchSubmit.js` (redeeming a match) run around the stores they're given, and their tests use in-memory ones.

### Data model (`db/migrations/`)

Plain SQL. `npm run db:migrate` applies the files in order, each in its own transaction, and records them in `schema_migrations`.

- **`neon_auth."user"`** is owned by Neon Auth. The app reads only `id`, `name`, `image` and `"createdAt"`; it never selects the email.
- **`scores`** has one row per finished match: `user_id` (a foreign key to `neon_auth."user"`, deleted with the user), `mode`, `score`, `accuracy`, `reaction_time` and `created_at`. `CHECK` constraints repeat the handler's validation bounds as a second line of defence. Indexes support the all-time board, per-player bests and time windows.
- **`matches`** has one row per match a signed-in player started: a uuid `id`, `user_id` (deleted with the user), `mode`, `started_at` (the database's clock), `expires_at` (the duration plus 30 minutes, or 2 hours for Survival) and `submitted_at`. `CHECK`s keep `expires_at` after `started_at`, and any submit inside that window.
- **`scores.match_id`** names the match a score was computed from. It's `unique`, so a match can be redeemed only once. A composite foreign key `(match_id, user_id, mode)` makes the database refuse a score whose player or mode differs from its match's. It's null for the rows saved before matches existed, which the key doesn't check.
- **`insights`** has one row per generated AI answer: `user_id`, `kind`, `input_hash`, `result jsonb`, `model` and `created_at`. It serves as both the cache and the rate limit.

Profile stats (games played, best score, average accuracy, favourite mode) are never stored. `GET /api/me` derives them with `count`, `max`, `avg` and `mode() within group`, so two matches saved at the same moment can't lose an update.

## Request flows

### Sign-in and identity

1. "Continue with Google" calls Neon Auth's `signIn.social`. That's a full-page redirect through Google and back to the same page (from the landing page, on to `/play`), where the SDK exchanges a one-time verifier for the session. `useSession` stays pending during that exchange, so `ProtectedRoute` waits instead of redirecting.
2. `AuthProvider` exposes the session user, and `getAuthToken()` supplies a short-lived Ed25519 JWT (15 minutes), cached by the SDK.
3. `/api` verifies each JWT against Neon Auth's JWKS. It pins `EdDSA`, checks the issuer, audience and expiry, and requires `sub`. The uid is `sub`.
4. A token can stay valid for up to 15 minutes after its user is deleted. `/api/me` answers it with a 401 because the user row is gone, and `POST /api/scores` with a 401 because the insert breaks the foreign key.

### Saving a match

The server computes every stored score itself, from the match's event log (PLAN-SCORING.md):

1. **Start.** For a signed-in player, `useMatchSave` calls `POST /api/matches` in parallel with the engine starting. The `matches` row records the mode and the database's start time. A mid-match Restart keeps the round's ticket.
2. **Play.** `GameSession` logs every hit, miss and expiry in game time (`scoring.js`). Its `onGameOver` summary is `scoreEvents`' replay of that log, so the results screen shows what the server will compute.
3. **Submit.** `saveMatchResult` posts `{ matchId, events }`, and `POST /api/scores` handles it:
   - verifies the token
   - shape-checks the body (`scoreInput.js`, at most 512 KB and 10,000 events; any `score` or `uid` in it is ignored)
   - loads the caller's match (404 if it's unknown or another player's, 409 if already submitted, 410 if expired)
   - runs `checkMatch` with the mode's configuration and the database's elapsed time (400 naming the failed rules)
   - scores the log with `scoreEvents`
4. **Claim.** One statement claims the match (`submitted_at`) and inserts the computed figures under the match's own mode. Both happen or neither does, so a replayed request finds nothing to claim. The composite key from `scores` to `matches` backs this up in the database.
5. **Status.** The results screen reports the outcome: saved; *unregistered* (no ticket); *rejected* (a 4xx from the server's checks); or an error.

The profile stats and the leaderboards pick the match up on their next read.

### Leaderboards

`all`, `daily` and `weekly` keep each player's best score in the window using `DISTINCT ON (user_id)`, then rank the top 100. A tie goes to the score that was set first. Daily boards start at UTC midnight and weekly boards at Monday 00:00 UTC (`periodStart`), so every player sees the same board. Names and avatars are joined live from `neon_auth."user"`, so renaming a Google account updates its past entries.

### AI insights

`requestInsight()` runs the same steps for both kinds:

1. Load the caller's per-mode stats. Fewer than 5 matches returns 422 with `{ needed, played }`.
2. Hash `{ PROMPT_VERSION, modeStats, ...context }`. If the hash matches the player's latest answer of this kind, return that answer as `cached` without calling Claude.
3. Otherwise, a player who already has 5 fresh answers in the last 24 hours gets 429 with `Retry-After`.
4. Otherwise, make one `claude-opus-5-5` call with structured output (a JSON schema) and `effort: 'medium'`. The `fallbacks: 'default'` option makes the API retry a refused request on a fallback model within the same call.
5. Check the answer against what the schema can't express (the DPI range, the pick count, no repeated titles), store it, and return it.

| Outcome | Status |
|---|---|
| A refusal (after the fallback), a truncated answer, or one that fails the check | 502 |
| Anthropic overloaded, rate-limited or unreachable | 503 with `Retry-After` |

The cap is soft: two requests at the same instant can both get through. That's enough to bound the cost per player. A fresh answer takes about 12–15 s, which is why the UI shows an explicit loading state.

## Security model

- **Secrets stay on the server.** `DATABASE_URL` and `ANTHROPIC_API_KEY` are read only inside `/api` and `scripts/`. `VITE_*` variables are compiled into the client bundle, so they hold only public values (`VITE_NEON_AUTH_URL`). Google OAuth credentials live in the Neon Console.
- **Validation happens twice.** Handlers validate input and name the bad fields in a 400. SQL `CHECK` constraints back the same bounds in the database.
- **Scores are still computed in the browser.** The server validates bounds and ownership, but it can't prove that a plausible score was really played. The README's "next" list covers what would close that gap.

## Testing

Vitest runs in two environments. Browser code (components and hooks) runs under `jsdom`. `/api` tests opt into `node` per file. The pyramid leans on pure functions:

- **Pure unit tests.** The game classes, request validation, the UTC windows, the cache key and limit, the prompts and schemas, and the client error messages.
- **Injected dependencies.** The JWT verifier runs with keys generated in the test. The Claude caller runs with a fake client and the SDK's real error classes. The insight runner runs with an in-memory store. The services run with a stubbed `fetch`.
- **Outside the suite.** The SQL ran on PGlite (in-process Postgres) with every migration applied, and the deployed routes were checked live with temporary users. Both are recorded per milestone in [PLAN-V2.md](PLAN-V2.md).

## Deployment and local development

- **Hosting.** Vercel builds on every push. `vercel.json` rewrites any path without a file extension, other than `/api` and Vite's `/@…` paths, to `index.html`, so client routes work on reload and a missing asset returns a real 404.
- **CI.** GitHub Actions (`.github/workflows/ci.yml`) runs lint, format check, tests and the build on pushes and pull requests.
- **Local development.** `npm run dev:full` runs `vercel dev`, which serves Vite and the `/api` functions on one port, as in production. `npm run dev` is Vite alone, without `/api`.
