# Aim Assist

A browser-based aim trainer inspired by Aimlabs: six game modes, live statistics, Google sign-in, global leaderboards, and AI recommendations for your mouse setup and the shooters that suit your aim. Built as a portfolio project to demonstrate modern React, interactive Canvas programming, and a small serverless backend.

## Live Demo

[View my project here](https://aim-assist-v2.vercel.app)

## Problem

Serious aim trainers are desktop applications. Aimlabs ships through Steam, KovaaK's is paid, and both want an install, an account, and a launcher before you've clicked a single target. That's a lot of hassle for something people mostly want in five-minute bursts — a warm-up before a session, or a quick check of whether their tracking has actually improved.

There's no reason the core of that experience needs a native client. Hit detection, a 60 FPS render loop, and persistent stats are all things a browser does well now. The gap is that nobody has built a version you can send someone as a link.

## Value

Zero install, works on any device with a browser, free, and your stats follow you across machines through Google sign-in. Six distinct modes covering different skills — flicking, tracking, precision, target switching — plus reaction-time analytics to help FPS gamers actively work on improving their performance and competitive edge.

## Project Plan

I set out to build a browser-based aim trainer with canvas gameplay and a React interface — Aimlabs-inspired, but not an attempt to clone it feature-for-feature.

The approach was to plan the architecture completely before writing any code. A separate planning session produced three documents — a project charter, an architecture spec, and a 26-milestone implementation plan — that fixed the important decisions up front. The central one, which everything else follows from: React never animates gameplay. React owns menus, routing, auth, and statistics; the canvas engine owns the frame loop, entities, collision, and particles; they communicate through a narrow lifecycle API and event callbacks, never per-frame state. The v1 documents are archived in [`Prototype/`](./Prototype).

**v2** kept the game engine unchanged and replaced the platform underneath it. The v1 prototype ran on Firebase and GitHub Pages, with the browser talking straight to Firestore. v2 moves hosting to Vercel, data to Neon Postgres behind a small API, and sign-in to Neon Auth, removing Firebase entirely. It then adds AI recommendations through the Anthropic API. The work ran as ten small milestones, each stopping for review before it was committed. [PLAN-V2.md](./PLAN-V2.md) records every decision and how each milestone was verified.

## Features

- **Six game modes** — Gridshot, Precision, Speed, Tracking, Flick, and an endless Survival mode with escalating difficulty
- **Full match loop** — countdown timer (or lives in Survival), pause/resume, results screen with reaction-time analytics, session history
- **Scoring depth** — streak-based combo multiplier (up to 2×), accuracy, avg/best/worst reaction times
- **Google sign-in** — profiles with stats derived from every match you've played (highest score, games played, average accuracy, favorite mode)
- **Leaderboards** — all-time, daily, and weekly top 100 (one entry per player, with days in UTC) and personal bests
- **AI insights** — on your profile, Claude reads your per-mode stats and recommends a DPI, sensitivity, and polling rate (optionally relative to your current mouse), and 3–5 shooters whose aiming demands suit your strengths
- **Five themes** — Dark, Light, Cyberpunk, Terminal, and Aimlabs, applied to the UI *and* the canvas, remembered per browser
- **Feel** — particle bursts, floating score text, and Web Audio–synthesized sound effects (no audio assets)

### Which features considered next?

- **Server-authoritative scoring** — The honest weak point. The server now validates every score's bounds, ties it to the signed-in player's verified token, and backs both with database constraints, but the score itself is still computed in the browser, so a signed-in player can post a plausible fake. Closing that fully means the server issuing a signed match token at start and checking the submitted match against it (duration, plausible hit rate). With a server in place, that's now a feature to build, not a hosting limitation.
- **Progress charts** — Every match is already stored with a timestamp; plotting score and accuracy over time is mostly a query and a chart component, and it's the single feature that would most change how the app feels to a returning user.
- **Persistent session history** — Currently in-memory only, so a refresh clears it.
- **Sensitivity calibration** — Target sizes and speeds tuned to match the game a player is warming up for.
- **Daily challenge** — A seeded target sequence so every player gets an identical run, which makes the leaderboard meaningfully comparable in a way the current free-play boards aren't.

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19, React Router 7, Tailwind CSS 4, self-hosted Unbounded and Onest (Fontsource) |
| Gameplay | HTML5 Canvas 2D, vanilla ES2022+ classes |
| API | Vercel Functions (`/api`), JWTs verified with `jose` |
| Database | Neon Postgres, plain SQL migrations, `@neondatabase/serverless` |
| Auth | Google sign-in through Neon Auth |
| AI | Anthropic API (Claude Opus 5.5), structured JSON output, server-side only |
| Hosting | Vercel, with GitHub Actions running lint, tests, and build |
| Build | Vite 8 (Rolldown) |
| Quality | ESLint 10, Prettier, Vitest + React Testing Library (255 tests) |

## AI Tools Used

The v1 planning phase was completed in conjunction with OpenAI's ChatGPT, and the implementation with Claude's Fable model; see the [v1 prompt history](./Prototype/V1-PROMPT-HISTORY.md). v2 was planned and built with Claude Code, milestone by milestone, with each one stopping for my review before it was committed. The [v2 prompt history](./PROMPT-HISTORY.md) (and its [archive](./PROMPT-HISTORY-2026-Q4.md)) records each request, the decisions behind it, and how it was verified.

## Architecture

```
React (menus, auth, stats, insights, routing)
   │  start / pause / resume / stop
   ▼
Game Engine (rAF loop, targets, collision, particles)
   │  event-driven callbacks: onHud, onGameOver
   ▼
React services ──fetch + Bearer JWT──▶ Vercel Functions (/api)
                                          ├─ Neon Auth (verify tokens)
                                          ├─ Neon Postgres (scores, insights)
                                          └─ Anthropic API (recommendations)
```

The non-negotiable rule: **React never animates gameplay.** The `GameEngine` owns the `requestAnimationFrame` loop and pushes stats to React only when something displayed changes (hit, miss, or second tick) — never per frame. A game mode is pure configuration (`src/game/modes.js`); all six modes and the difficulty ramp run on the same engine with zero bespoke mode logic.

The second rule is new in v2: **the browser never touches data directly.** Every database read and write, every token check, and every AI call happens in `/api`, and a request's identity comes only from a verified token, never from what the browser sends.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design.

## Getting Started

You need Node 24 and a [Vercel](https://vercel.com) account. Neon and Neon Auth come through Vercel's Marketplace.

```bash
npm install
npm i -g vercel
```

One-time setup:

1. **Vercel project.** Import the repo into Vercel (it detects Vite).
2. **Database and auth.** In the project, add **Neon** from Storage (Marketplace) and connect it to all environments. This creates the database, enables Neon Auth, and injects `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL` and related variables.
3. **AI key.** Add `ANTHROPIC_API_KEY` under Settings → Environment Variables. It's server-only, so never give it a `VITE_` prefix.
4. **Local env.** Link the folder and pull the variables:

   ```bash
   vercel link
   vercel env pull .env.local
   ```

   [`.env.example`](./.env.example) lists every variable and which side reads it.
5. **Schema.** Apply the migrations in [`db/migrations/`](./db/migrations):

   ```bash
   npm run db:migrate
   ```

   Each file runs in a transaction and is recorded, so reruns skip what's applied.
6. **Sign-in.** In the Neon Console → Auth, add `http://localhost:3000` as a trusted domain. Neon's shared Google keys work for development; use your own Google OAuth client before going public.

Then run the app and API together:

```bash
npm run dev:full   # vercel dev → http://localhost:3000
```

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev:full` | Vite and the `/api` functions on one port (`vercel dev`) |
| `npm run dev` | Vite only, with HMR. There's no `/api`, so data and sign-in won't work. |
| `npm run build` / `preview` | Production build / local preview |
| `npm run db:migrate` | Apply new SQL migrations to the database in `.env.local` |
| `npm test` / `test:watch` | Vitest suite (game logic, API helpers, services, components) |
| `npm run lint` / `format` / `format:check` | ESLint / Prettier |

## Engineering Notes (findings from the build)

Things this codebase demonstrates that a reviewer might care about:

- **The scene contract paid off.** `GameEngine` drives any `{ update(dt, size, input), render(ctx, size) }` object. That one abstraction absorbed the demo scene, six game modes, difficulty scaling, and particle systems without ever rewiring the loop.
- **React renders are event-driven, not frame-driven.** The HUD re-renders on hits/misses/second-ticks only; memoized components (`GameHud`, `Leaderboard`, `SessionHistory`) shield the rest. The canvas hits 60 FPS with zero React involvement.
- **Postgres simplified the data model.** v1's Firestore needed `day`/`week` key fields, three composite indexes, and player names copied onto every score. In v2, `DISTINCT ON` gives one-entry-per-player boards in a single query, a join supplies names and avatars, and profile stats are derived on read instead of stored, so concurrent matches can't lose an update.
- **Validation in two places.** Every input is checked in the handler (the 400 names the bad fields) and again by SQL `CHECK` constraints. The browser can't choose whose data it reads or writes: the user id comes from the verified JWT.
- **Structured AI output, still checked.** Claude answers against a JSON schema, and the server then checks what a schema can't express (DPI range, 3–5 distinct picks) before anything reaches the UI. Answers are cached by a hash of their inputs and capped at 5 fresh ones per player per day, so repeat requests are instant and free.
- **Dependencies are injected at the edges.** The JWT verifier, the database queries, and the Claude client are factories wired from environment variables in one place each, so the whole suite runs without a network, and the real SQL was exercised against in-process Postgres (PGlite).
- **Zero-asset audio.** All sound effects are synthesized with the Web Audio API (oscillator + exponential-decay envelope), created lazily after a user gesture to satisfy autoplay policies.
- **Bundle discipline.** Route-level code splitting plus Rolldown `advancedChunks` keeps the entry chunk at 3.4 kB gzip, with React (72 kB) and the Neon Auth SDK (67 kB) in independently cached vendor chunks. Removing Firebase dropped its 141 kB chunk.
- **Frame-loop hygiene.** Delta time is clamped (backgrounded tabs can't cause physics jumps), pause re-anchors the clock, hit-testing uses the full target radius (shrinking targets stay fair), and hot paths avoid per-frame allocations.

## License

Personal portfolio project — no license granted for reuse.
