# Aim Assist

A browser-based aim trainer inspired by Aimlabs — six game modes, live statistics, Google sign-in, and global leaderboards. Built as a portfolio project to demonstrate modern React, interactive Canvas programming, and cloud integration.

> **Status**: Milestones 0–25 complete. The GitHub Pages pipeline is in place; first publish needs the one-time console setup in [Roadmap](#roadmap) below.

## Features

- **Six game modes** — Gridshot, Precision, Speed, Tracking, Flick, and an endless Survival mode with escalating difficulty
- **Full match loop** — countdown timer (or lives in Survival), pause/resume, results screen with reaction-time analytics, session history
- **Scoring depth** — streak-based combo multiplier (up to 2×), accuracy, avg/best/worst reaction times
- **Google authentication** — profiles with aggregate stats (highest score, games played, running average accuracy, favorite mode)
- **Leaderboards** — all-time / daily / weekly top-100 and personal bests, backed by Firestore
- **Five themes** — Dark, Light, Cyberpunk, Terminal, and Aimlabs, applied to the UI *and* the canvas, remembered per browser
- **Feel** — particle bursts, floating score text, and Web Audio–synthesized sound effects (no audio assets)
- **Accessibility** — keyboard focus rings, `prefers-reduced-motion` and `prefers-contrast` support, modal focus management, skip link

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19, React Router 7, Tailwind CSS 4 |
| Gameplay | HTML5 Canvas 2D, vanilla ES2022+ classes |
| Backend | Firebase (Google Auth + Cloud Firestore, Spark plan) |
| Build | Vite 8 (Rolldown) |
| Quality | ESLint 10, Prettier, Vitest + React Testing Library (72 tests) |

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
2. **Firestore** → create a Standard database in production mode, then publish rules: public reads; `users/{uid}` writable only by its owner; `scores` create-only with `uid == request.auth.uid`
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

## Roadmap

### Milestone 12 — Themes (complete)

Five themes — Dark, Light, Cyberpunk, Terminal, Aimlabs — selectable from Settings and persisted to `localStorage`. Notes on how it was built:

- **CSS is the single source of truth for color.** Each theme is a `[data-theme='...']` block in `src/styles/themes.css` redefining the same semantic tokens; `src/styles/themes.js` carries only ids and copy. Keeping values out of JavaScript means nothing can drift between two lists, and each theme's `prefers-contrast: more` overrides still compose on top of it (one global override couldn't suit five palettes).
- **Themes reach the canvas.** Each theme also defines target-ring, particle, and floating-text tokens. `src/game/palette.js` resolves them once per theme change and the session swaps its palette — entities take a palette argument at *draw* time rather than storing hexes, so switching theme recolors a match already in progress without rebuilding the engine or resetting the score.
- **The picker previews itself.** Because theme blocks are attribute-scoped rather than `:root`-scoped, each option in the picker renders inside its own `data-theme` and shows the real colors — including a miniature of the target rings — with no hand-maintained swatch list.
- **No flash of the wrong theme.** A short inline script in `index.html` stamps the saved theme on `<html>` before first paint. `ThemeProvider` also writes the attribute synchronously in its setter, so consumers reading resolved CSS variables (the canvas palette) never see a stale theme for a commit.

### Milestone 25 — GitHub Pages deployment

The repo-side work is done; what remains is configuration in the GitHub and Firebase consoles.

**In this repo**

- `vite.config.js` sets `base: '/Aim_Assist/'` — project Pages sites serve from `/<repo>/`, and without the prefix every asset 404s and the page renders blank. It applies in dev too, so the dev server also moves to `/Aim_Assist/` and local paths match production.
- `<BrowserRouter basename={import.meta.env.BASE_URL}>` in `src/App.jsx` — Vite sets `BASE_URL` from `base`, so routes resolve under the subpath without hardcoding it twice.
- `npm run build` also runs `scripts/spa-fallback.mjs`, which copies `dist/index.html` to `dist/404.html`. Pages has no SPA rewrite, so a hard refresh or shared link to `/Aim_Assist/leaderboards` would otherwise hit GitHub's 404 page. Pages serves `404.html` for unmatched paths, which boots the app and lets the router read the preserved URL. (This only breaks on deep links, never on in-app navigation — which is why it survives casual testing.)
- `.github/workflows/deploy.yml` runs lint, tests, and the build on every push to `main`, then publishes with `upload-pages-artifact` + `deploy-pages`. It needs `id-token: write` for the OIDC handshake. A guard step fails the run if the Firebase secrets are missing, since `firebase/config.js` only warns and would otherwise publish a build that looks fine and breaks at runtime.

**Manual setup, once**

1. **Settings → Pages → Source: GitHub Actions.** The branch-based option can't work — the site has to be built.
2. **Settings → Secrets and variables → Actions** — add the six values the client needs: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. (`MEASUREMENT_ID` sits in `.env` but nothing reads it.) Vite picks `VITE_`-prefixed variables up from the environment, ahead of any `.env`, so the workflow passes them as `env:` with no dotenv file.
3. **Firebase → Authentication → Settings → Authorized domains** — add `christiantoro.github.io`. Sign-in uses `signInWithPopup`, which validates the calling origin; the default list covers only `localhost` and the Firebase domains, so Google sign-in works all through development and then fails in production with `auth/unauthorized-domain`.
4. **Merge to `main`.** The site lands at `https://christiantoro.github.io/Aim_Assist/`.

**Worth doing before the URL is public**

Once the site is live the Firestore rules are the only thing guarding the data. Restrict the browser API key to the `christiantoro.github.io/*` referrer in the Google Cloud console, and consider adding value bounds to the score-create rule — it currently checks `uid` ownership but not the score itself, so a signed-in user can write any value straight from the console.

## License

Personal portfolio project — no license granted for reuse.
