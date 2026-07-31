# Aim Assist

A browser-based aim trainer inspired by Aimlabs — six game modes, live statistics, Google sign-in, and global leaderboards. Built as a portfolio project to demonstrate modern React, interactive Canvas programming, and cloud integration.

## Live Demo

[View my project here](https://christiantoro.github.io/Aim_Assist/)

## Problem

Serious aim trainers are desktop applications. Aimlabs ships through Steam, KovaaK's is paid, and both want an install, an account, and a launcher before you've clicked a single target. That's a lot of hassle for something people mostly want in five-minute bursts — a warm-up before a session, or a quick check of whether their tracking has actually improved.

There's no reason the core of that experience needs a native client. Hit detection, a 60 FPS render loop, and persistent stats are all things a browser does well now. The gap is that nobody has built a version you can send someone as a link.

## Value

Zero install, works on any device with a browser, free, and your stats follow you across machines throughGoogle sign-in. Six distinct modes covering different skills — flicking, tracking, precision, target switching — plus
reaction-time analytics to help FPS gamers actively work on improving their performance and competitive edge.

## Project Plan

I set out to build a browser-based aim trainer with canvas gameplay, a React interface, and Firebase for authentication and score storage — Aimlabs-inspired, but not an attempt to clone it feature-for-feature.
The approach was to plan the architecture completely before writing any code. A separate planning session produced three documents — a project charter, an architecture spec, and a 26-milestone implementation plan — that fixed the important decisions up front. The central one, which everything else follows from: React never animates gameplay. React owns menus, routing, auth, and statistics; the canvas engine owns the frame loop, entities, collision, and particles; they communicate through a narrow lifecycle API and event callbacks, never per-frame state. Files [PROJECT-PLAN.md](./PROJECT_PLAN.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) delve into this in greater detail.

## Features

- **Six game modes** — Gridshot, Precision, Speed, Tracking, Flick, and an endless Survival mode with escalating difficulty
- **Full match loop** — countdown timer (or lives in Survival), pause/resume, results screen with reaction-time analytics, session history
- **Scoring depth** — streak-based combo multiplier (up to 2×), accuracy, avg/best/worst reaction times
- **Google authentication** — profiles with aggregate stats (highest score, games played, running average accuracy, favorite mode)
- **Leaderboards** — all-time / daily / weekly top-100 and personal bests, backed by Firestore
- **Five themes** — Dark, Light, Cyberpunk, Terminal, and Aimlabs, applied to the UI *and* the canvas, remembered per browser
- **Feel** — particle bursts, floating score text, and Web Audio–synthesized sound effects (no audio assets)

### Which features considered next?

- **Server-authoritative scoring** — This is the honest weak point. Scores are computed client-side, so a signed-in user canpost a plausible fake straight from the browser console. The rules make it deliberate rather than trivial, but closing it properly means a Cloud Function that validates a match token — which requires the paid Firebase tier.
- **Progress charts** — Every match is already stored with a timestamp; plotting score and accuracy over time is mostly a query and a chart component, and it's the single feature that would most change how the app feels to a returning user.
- **Persistent session history** — Currently in-memory only, so a refresh clears it.Sensitivity calibration, so target sizes and speeds can be tuned to match the game a player is warming up for.
- **AI powered Recommendations** — Based on a user's performance, specific games or mouse sensitivity customizations are suggested.
- **Daily challenge** — a seeded target sequence so every player gets an identical run, which makes the leaderboard meaningfully comparable in a way the current free-play boards aren't.

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19, React Router 7, Tailwind CSS 4 |
| Gameplay | HTML5 Canvas 2D, vanilla ES2022+ classes |
| Backend | Firebase (Google Auth + Cloud Firestore, Spark plan) |
| Build | Vite 8 (Rolldown) |
| Quality | ESLint 10, Prettier, Vitest + React Testing Library (72 tests) |

## AI Tools Used

The planning phase was completed in conjunction with OpenAI's ChatGPT, and the implementation with Claude's Fable model. Refer to the [prompt history](./PROMPT-HISTORY.md) for insight on their performance.

## Architecture

Three layers with a strict, one-directional data flow:

```
React (menus, auth, stats, routing)
   │  start / pause / resume / stop
   ▼
Game Engine (rAF loop, targets, collision, particles)
   │  event-driven callbacks: onHud, onGameOver
   ▼
Firebase (users, scores, leaderboards)
```

The non-negotiable rule: **React never animates gameplay.** The `GameEngine` owns the `requestAnimationFrame` loop and pushes stats to React only when something displayed changes (hit, miss, or second tick) — never per frame. A game mode is pure configuration (`src/game/modes.js`); all six modes and the difficulty ramp run on the same engine with zero bespoke mode logic.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design and [PROJECT_PLAN.md](./PROJECT_PLAN.md) for the milestone log.

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your Firebase web app credentials
npm run dev
```

Firebase console setup (one time):

1. **Authentication** → enable the Google provider
2. **Firestore** → create a Standard database in production mode, then deploy the rules in [`firestore.rules`](./firestore.rules):

   ```bash
   npx firebase-tools deploy --only firestore:rules
   ```

   Scores are world-readable (the leaderboards render signed-out), create-only, and validated field by field; `users/{uid}` is readable and writable only by its owner.
3. **Indexes** — the daily/weekly/personal leaderboard views each need a composite index (`day+score`, `week+score`, `uid+score`). All three are declared in [`firestore.indexes.json`](./firestore.indexes.json); deploy them with:

   ```bash
   npx firebase-tools deploy --only firestore:indexes
   ```

   The target project comes from [`.firebaserc`](./.firebaserc) — change it if you're running against your own Firebase project, or pass `--project <your-project-id>` instead.

   Index builds are asynchronous: after deploying, the three tabs keep failing for a few minutes until the console reports each index as **Enabled** rather than **Building**. Until then they fail with `failed-precondition` (the page says so explicitly, and Firestore logs a one-click creation link in the browser console). All Time is unaffected — it sorts without a filter, so it needs no composite index.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` / `preview` | Production build / local preview |
| `npm test` / `test:watch` | Vitest suite (game logic, services, components) |
| `npm run lint` / `format` | ESLint / Prettier |

## Engineering Notes (findings from the build)

Things this codebase demonstrates that a reviewer might care about:

- **The scene contract paid off.** `GameEngine` drives any `{ update(dt, size, input), render(ctx, size) }` object. That one abstraction absorbed the demo scene, six game modes, difficulty scaling, and particle systems without ever rewiring the loop.
- **React renders are event-driven, not frame-driven.** The HUD re-renders on hits/misses/second-ticks only; memoized components (`GameHud`, `Leaderboard`, `SessionHistory`) shield the rest. The canvas hits 60 FPS with zero React involvement.
- **Firestore shaped the data model.** Firestore can't combine a `createdAt` range filter with an `orderBy(score)` sort, so score documents carry equality-filterable `day` ("2026-07-06") and `week` ("2026-W28") keys written at save time. Player identity is denormalized onto score docs so leaderboards render without N user lookups.
- **Zero-asset audio.** All sound effects are synthesized with the Web Audio API (oscillator + exponential-decay envelope), created lazily after a user gesture to satisfy autoplay policies.
- **Bundle discipline.** Route-level code splitting plus Rolldown `advancedChunks` puts the app shell at ~8 kB, with Firebase (~563 kB) and React (~232 kB) in independently cached vendor chunks.
- **Pure game logic = trivial tests.** Because gameplay classes never touch React or the DOM, `ScoreManager`, `Spawner`, `Collision`, `Target`, and `Timer` are tested as plain classes — 72 tests run in about a second.
- **Frame-loop hygiene.** Delta time is clamped (backgrounded tabs can't cause physics jumps), pause re-anchors the clock, hit-testing uses the full target radius (shrinking targets stay fair), and hot paths avoid per-frame allocations.


## License

Personal portfolio project — no license granted for reuse.
