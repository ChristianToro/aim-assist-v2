# PROMPT-HISTORY.md

A record of the AI-assisted development session ("milestone sweep") that built this project. Each entry quotes the user prompt verbatim and condenses the assistant's response to its outcome and key decisions — full responses ran to thousands of words each and are summarized rather than reproduced. Commit hashes refer to the `milestone_sweep` branch.

---

## 1. Orientation

> Make sense of this current directory

Explored the repo and reported: a freshly scaffolded Vite + React template (stock demo still in `src/`) sitting under three substantial planning documents — CLAUDE.md (project charter), ARCHITECTURE.md (three-layer React / Canvas Engine / Firebase design), and PROJECT_PLAN.md (26 milestones). Identified the core architectural rule (React never animates gameplay) and flagged what was missing versus the plan: react-router, the Firebase SDK, Tailwind, Prettier, and git initialization.

## 2. Tooling gaps

> rectify the missing items: react-router, Firebase SDK, tailwind, prettier config

Installed and wired all four: react-router-dom 7; Firebase SDK with a `src/firebase/config.js` module reading `VITE_*` env vars (plus `.env.example` and gitignore rules); Tailwind CSS v4 via the `@tailwindcss/vite` plugin; Prettier with config, ignore file, and `format`/`format:check` scripts. Verified with a production build.

## 3. Version control

> initialize it

`git init`, renamed the default branch to `main`, and made the initial commit (`7a0a083`) with node_modules/dist/.env correctly excluded.

## 4. Milestone 1 — App shell

> Move on to milestone 1

Built the application shell (`a19e8ef`): React Router with a Layout route (Navbar + Outlet + Footer), Home page with hero and mode-preview grid, placeholder Play/Leaderboards/Profile/Settings pages, a themed 404, dark-mode-first Tailwind styling, and removal of the stock Vite demo assets.

## 5. Milestones 2–3 — Design system & canvas

> Complete milestones 2 and 3.

- **M2** (`e2e4cc8`): semantic color tokens (`--bg`, `--surface`, `--edge`, `--accent`, …) exposed as Tailwind utilities via `@theme inline` — chosen specifically so future themes are a `:root` variable swap. Button (variants/sizes/Link-mode), Card, and Modal components; all existing UI refactored onto tokens.
- **M3** (`08cf0c2`): `GameCanvas` component owning the rAF loop, devicePixelRatio-aware resizing via ResizeObserver, delta-time clamping, FPS counter, and a scene contract (`update(dt, size)` / `render(ctx, size)`) proven by a bouncing-target demo scene.

## 6. Milestone 4 — Game engine

> renamed our working branch to milestone sweep. move on to milestone 4

On the renamed `milestone_sweep` branch, moved loop ownership from React into a `GameEngine` class (`7cc20d5`): rAF scheduling, clamped delta time, and a lifecycle API (attach/detach/start/stop/pause/resume/reset) as React's only interface to gameplay. `GameCanvas` slimmed to a DOM bridge; Play gained a working Pause/Resume control.

## 7. Push confusion

> not seeing anything committed on the branch

Diagnosed: commits existed locally on `milestone_sweep`, but the branch had never been pushed — GitHub only had `main` through Milestone 3. Confirmed no upstream was set (so a bare `git push` couldn't misfire) and provided the explicit-refspec push command. A follow-up user command failed because the command was split across two shell lines; supplied the one-line fix (`git push --set-upstream origin milestone_sweep`).

## 8. Milestone 5 — Targets

> move on to milestone 5

`Target` class (variable radius, lifespan, grow-in/shrink-out animation, full-radius hit testing so shrinking targets stay fair) and `Spawner` (interval spawning, rejection-sampling overlap prevention, spawn-timer capped at one interval so freed slots refill instantly — Gridshot behavior for free). Plus `math`/`random` utils. Commit `53dc32f`.

## 9. Milestones 6–10 — Playable game

> Complete milestones 6 through 10

Five commits turning the demo into a complete game:

- **M6 input** (`f01eb2b`): `Input` queues canvas-space clicks consumed during update (not in DOM handlers); `Collision.findHitTarget`; engine owns input and drops stale clicks on start/resume. Fixed a latent engine bug — the frame loop now only reschedules while running, so `stop()` from inside `update` sticks.
- **M7 scoring** (`9dd5eb0`): `ScoreManager` (combo multiplier +0.1×/hit capped at 2×, accuracy, reaction times) and an event-driven `GameHud` — React never renders per frame.
- **M8 timer** (`eb486f1`): `Timer` driven by loop delta (engine pause pauses it for free), `GameSession` as one restartable match, `useGameSession` hook owning phase (idle/running/over), start overlay + pause overlay.
- **M9 results** (`c9f00ca`): `ResultsModal` with final score, accuracy, max combo, and avg/best/worst reaction; completes the loop start → play → results → restart.
- **M10 particles** (`03c3802`): radial particle bursts (frame-rate-independent drag, life-based fade) and rising floating score text on every hit.

## 10. Milestone 11 — Sound (12 deferred)

> complete milestones 11, skip 12 as we will adjust themes later.

`AudioManager` (`9dc4b60`) synthesizing every effect with the Web Audio API — hit pop, miss thud, 3-2-1 countdown ticks, descending game-over motif — no audio assets. Lazy AudioContext creation after a user gesture (autoplay-policy safe), mute persisted to localStorage, Sound On/Off toggle in Play. Milestone 12 skipped per instruction.

## 11. Milestones 13–15 — Firebase

> I believe firebase has been set up by me during the project initialization; credentials are stored in .env. Verify this. complete milestones 13 - 15

Verified all six `VITE_FIREBASE_*` credentials present in `.env` (checked presence/length only, values never printed) and git-ignored. Then:

- **M13** (`ead3a87`): config module now warns loudly on missing credentials.
- **M14** (`09c6cf2`): auth service wrapping all `firebase/auth` access, AuthContext/Provider with session-restore loading state, working Google sign-in in the Navbar, `ProtectedRoute` guarding /profile.
- **M15** (`5c62d65`): users service (profile doc with incremental aggregates — running average accuracy, highest score, favorite mode via per-mode counts) and scores service (one doc per match, identity denormalized for leaderboards). Match saving became **event-driven** (an `onGameOver` callback with the latest-ref pattern) after the new react-hooks v7 lint rejected setState-in-effect — the lint pushed the design somewhere genuinely better, twice.

## 12. Billing question

> is a blaze account required for this project to utilize firestore?

No — the free Spark plan covers everything this project uses (Firestore, Google Auth, Hosting) with generous daily quotas; Blaze is only needed for Cloud Functions, phone auth, etc. Noted Spark's fail-closed behavior (quota errors, never bills) is arguably safer for a portfolio project.

## 13. Console setup

> how do I then configure the cloud firestore database for this project via the console

Step-by-step console walkthrough: create a Standard database in production mode (region is permanent), publish security rules matching the app's exact data model (public reads; owner-only user writes; validated create-only scores), enable the Google provider, and defer composite indexes to Firestore's one-click error links. Included an end-to-end verification procedure.

## 14. Milestones 16–17 — Leaderboards & profile

> move on to milestones 16 and 17

- **M16** (`aa42b79`): the key design constraint — Firestore can't combine a `createdAt` range filter with `orderBy(score)` — solved by stamping equality-filterable `day`/`week` keys on each score. Leaderboard service (top-100 all/daily/weekly + personal best), `useLeaderboard` with derived loading state, ranked table component, tabbed Leaderboards page.
- **M17** (`a04e39c`): shared `StatTile`, `useUserProfile`, `ProfileCard` (avatar, playing-since, aggregate tiles), and a Best Matches section reusing the Leaderboard component. Flagged the three composite indexes the user must create via console links.

## 15. Milestones 18–20 — Modes, difficulty, stats

> complete milestones 18-20

- **M18** (`3dcd81a`): all modes as **pure configuration** in `modes.js` — Gridshot, Precision, Speed, Tracking (targets gained velocity + edge bouncing), Flick. `GameArea` extracted and remounted per mode via `key`; Home cards read the same data.
- **M19** (`39e1396`): per-mode difficulty scaling — spawner parameters lerp toward harder values over a ramp — plus the Survival mode built on it: endless, 5-miss limit (expiries count), Lives HUD tile.
- **M20** (`732a3f8`): SessionHistory table (ephemeral, per browser session, survives mode switches); reaction stats and longest combo were already flowing through ScoreManager.

Notably, no structural changes to the engine/spawner/scoring were needed — the M4–M7 abstractions absorbed everything as config.

## 16. Milestones 21–24 — Polish, a11y, perf, tests

> complete milestones 21 - 24

- **M21 polish** (`2b88b53`): Tailwind `@theme` motion tokens (page fade/slide on navigation, modal pop-in, button press), lazy-loaded routes with a branded LoadingScreen inside Layout, mobile fixes (nav scroll, collapsing wordmark, stacked footer).
- **M22 accessibility** (`6a9d68e`): universal `:focus-visible` ring, `prefers-reduced-motion` (CSS collapse + gameplay skips decorative particle bursts while keeping score text), `prefers-contrast: more` token overrides, skip link, modal focus management with focus return, labeled canvas.
- **M23 optimization** (`47d7aa7`): **app shell 796 kB → 8 kB** via Rolldown `advancedChunks` (Firebase and React as independently cached vendor chunks); frame-loop allocation fixes (reused size object, shared frozen empty-clicks array); React.memo on HUD/leaderboard/history.
- **M24 testing** (`1ca3c5e`): Vitest + jsdom + React Testing Library — **53 tests across 10 files**. Pure game logic tested as plain classes (the architecture's payoff), Firestore service tested with a mocked SDK, plus Button/GameHud component tests.

## 17. README

> milestone 12 will be completed at a later date. As for milestone 25, I will be configuring the deployment onto github pages at a later time.
>
> draft a README file covering key findings from this sweep, along with suggestions for both milestone 12 and 25.

Replaced the stock Vite README (`bd5c950`) with a portfolio-facing one: features, architecture summary, setup instructions (including console steps and indexes), the engineering findings above, a 5-step theme plan for M12 (leaning on the token system; canvas palette flagged as the one gotcha), and a GitHub Pages plan for M25 (base path + router basename, the `404.html` SPA fallback, Actions CI with secrets, Firebase authorized domains).

## 18. This document

> Write a markdown file at the root of this repo titled "PROMPT-HISTORY.md", where all of my prompts and responses are recorded

Produced this file.

## 19. Repo state check

> What is the current state of this repo? provide a quick summary

Surveyed branches, commits, source tree, and toolchain health. Reported: `milestone_sweep` clean and in sync with its remote, while `origin/main` is stale at Milestone 3 — milestones 4–24 have never reached `main`. Confirmed 24 of 25 milestones committed one-per-commit. Verified the two known gaps are genuinely unimplemented rather than just uncommitted: **Milestone 12 (themes)** has no commit and `src/pages/Settings.jsx` is still an 11-line `PagePlaceholder` — no ThemeProvider, no localStorage persistence, no selector anywhere in `src/`; **Milestone 25 (deployment)** has no `vercel.json` or `firebase.json`. Health check passed clean: `npm test` → 53 tests across 10 files, `npm run lint` → no errors.

## 20. Architecture review — the React/engine boundary

> Is separating the game logic and isolating it from react the appropriate method for this application?

Read `GameEngine`, `GameSession`, `useGameSession`, `GameCanvas`, and `GameArea` and argued yes, on evidence rather than principle:

- **The frame-rate mismatch is real.** `GameSession.js:151` gates `emitHud()` to hits, misses, and changed *displayed* seconds — React re-renders a few times per second instead of 60+.
- **Canvas gives React nothing to diff.** React's value is declarative DOM reconciliation; there is no DOM inside `<canvas>`. Routing entities through React would pay the reconciler tax for zero benefit — the distinction that makes this right *here* but wrong for a DOM-based target grid.
- **Testability is the demonstrable payoff.** The five game-logic test files are plain unit tests — no jsdom, no RTL, no `act()` — which only works because those modules never import React.
- **React 19 semantics would fight it.** StrictMode double-invocation, effect re-runs, and concurrent render replay all threaten simulation state in `useState`; a `ref` is just the same separation with worse ergonomics.

Praised the seam as a real port rather than a `game/` folder: `GameEngine.js:41` exposes only attach/start/pause/resume/stop, `GameCanvas` is 50 lines of DOM-only work, data flows out one-way via callbacks, and `GameEngine.js:34` + `consumeClicks()` drains input *inside* the frame step so hit resolution is deterministic w.r.t. frame timing.

Honest costs flagged: `isPaused`/`isMuted` duplicated across engine and React state (`useGameSession.js:54,69`) — the standard tax of this pattern, growing with UI-visible engine state; engine construction in `useMemo` is the fragile spot (`useMemo` is a hint, not a cache guarantee — hence the eslint-disable and `engineInstance` late-binding), where a lazy `useRef` init would be sturdier; and `reducedMotion` captured once at construction won't follow a mid-session OS change.

**Forward-looking note for Milestone 12:** canvas colors are hardcoded at `Target.js:5-7`, `Particle.js:5`, and `FloatingText.js:27`. Themes are the first thing needing to flow *inbound* (React → engine), a path this design hasn't exercised. Recommendation: pass a palette into `createGameSession` at construction and let the existing remount-on-change mechanism handle switches — do **not** call `getComputedStyle` inside `draw()`, which is a per-frame layout read that punches straight through the seam.

## 21. This entry

> append these prompts and your responses to the PROMPT-HISTORY.md file

Appended sections 19–21 (`4e20221`).

## 22. Milestone 12 — Themes

> now complete milestone 12

Built the deferred theme system (`105d3da`): Dark, Light, Cyberpunk, Terminal, and Aimlabs, selectable from a real Settings page (replacing the placeholder) and persisted to `localStorage`. Three decisions carried the implementation:

- **CSS is the single source of truth for color.** Each theme is a `[data-theme='...']` block in `src/styles/themes.css` redefining the same semantic tokens; `src/styles/themes.js` holds only ids and copy. The alternative — palettes in JavaScript applied via `style.setProperty()` — was rejected because inline styles outrank stylesheet rules and would have silently broken the `prefers-contrast: more` support added in M22. Each theme instead carries its own contrast overrides in a nested media query, since one global override can't suit five palettes.
- **Themes reach the canvas without breaking the seam.** This was exactly the inbound React → engine path flagged in §20. Themes also define target-ring, particle, and floating-text tokens; `src/game/palette.js` resolves them **once per theme change**, and the session swaps its palette via a new `setPalette()`. Entities take a palette at `draw()` time instead of storing hex values, so a theme switch recolors a match already in progress — particles mid-flight included — with no engine rebuild and no score reset. This improved on §20's own recommendation, which had assumed a remount would be needed.
- **Attribute-scoped, not `:root`-scoped.** Writing `[data-theme='x']` rather than `:root[data-theme='x']` lets a theme apply to a subtree, which is what makes each picker option render a live miniature of the app *in its own colors*, target rings included, with no hand-maintained swatch list.

Two details beyond the four milestone tasks: an inline script in `index.html` stamps the saved theme before first paint, and `ThemeProvider` writes the attribute synchronously in its setter rather than in an effect — child effects run before parent effects, so a deferred write would let the canvas read the previous theme's variables for one commit.

Caught during the build: `peer-checked:` only reaches siblings, so the picker's nested "Active" badge would never have highlighted — replaced the CSS variant with plain JS state. Declined to add `@testing-library/user-event` for the provider tests (not installed; CLAUDE.md forbids unjustified dependencies) and used `fireEvent` from the existing RTL dependency instead.

Verified: 68 tests passing across 14 files (15 new, covering the registry, palette resolution and per-token fallbacks, provider persistence and validation, and the picker), lint and Prettier clean, production build green with all five themes confirmed in the compiled CSS, and a dev-server smoke test confirming the pre-paint script is served ahead of the app bundle.

## 23. This entry

> append these prompts and results into PROMPT-HISTORY.md

Appended sections 22–23 and refreshed the sweep summary below.

_A run of prompts between here and §24 is not recorded — the leaderboard composite indexes, `.firebaserc`, the GitHub Pages walkthrough, Milestone 25 itself, repository secrets, and debugging the deployed 404. Sections 24–26 were requested specifically._

## 24. Choosing a Pages workflow

> the repo is public. since the source is github actions, which workflow do I use? Jekyll, or static html, or another option?

Neither — the answer was to pick nothing. Selecting **GitHub Actions** in the Pages source dropdown *is* the setting; the Jekyll and Static HTML cards beneath it are starter templates for repos that don't already have a workflow, and this one has `.github/workflows/deploy.yml`.

Warned against clicking either: Jekyll builds Markdown and would produce nothing usable from a React app, while Static HTML commits a second workflow that uploads a directory **with no build step** — publishing raw `src/` with no bundling and no env vars, then racing `deploy.yml` with whichever finished last winning. A genuinely confusing failure to debug. Noted that `deploy.yml` is that same Static HTML template plus the parts that matter, and that the `workflow_dispatch` trigger built into it allows a manual run without a fresh push.

## 25. Hardening the Firestore rules

> yml file is now part of main, and it is deployed.
>
> this was shared by you during this session: [the §20-era note that the score-write rule validates `uid` but not the score itself] … make those changes

The rules existed only in the Firebase console, so this began by creating `firestore.rules` and wiring it into `firebase.json` (`55ab277`). Scores became create-only and immutable, with `hasOnly`/`hasAll` pinning the exact ten-field shape, `mode` constrained to the six real labels, ranges on score and accuracy, and `createdAt == request.time` so a score can't be filed under a clock the client chose. Reads on `users` were narrowed from public to owner-only — leaderboards never touch that collection, since identity is denormalized onto each score, and the profile page only loads the signed-in user's own document.

Reading the data model first corrected two errors in the advice being implemented:

- **`reactionTime` is nullable.** `ScoreManager.summary()` returns `null` for a match with zero hits, so the strict numeric check originally suggested would have rejected legitimate saves.
- **`day` cannot be matched against `request.time`.** `getDayKey()` uses the player's *local* calendar date while `request.time` is UTC, so the proposed exact comparison would reject anyone playing an evening west of UTC — the user's own timezone included. Bounded to a ±2-day window instead, which still blocks backdating onto an old daily board.

The score ceiling was also raised from the 100,000 originally floated to 10,000,000: at Survival's hardest the spawner yields roughly 1300 points/second, making 100,000 about eighty seconds of good play and a live risk to real records.

Flagged three limits rather than implying the work was finished: the rules are **unverified** (the emulator needs Java and a download, neither available in the sandbox), deploying **overwrites** the console rules that were only reconstructed from the README's description, and none of this is real anti-cheat — a signed-in user can still write a *plausible* score, since nothing server-side observed the match. Closing that needs Cloud Functions and therefore the Blaze plan.

## 26. This entry

> add the last three prompts and responses to PROMPT-HISTORY.md EXCEPT the terminal diverged branch conflict prompt.

Appended sections 24–26 and refreshed the sweep summary. The excluded prompt was a `git pull` refusing to reconcile a local `main` still sitting at Milestone 3, one unpushed commit ahead of a remote 34 commits further along.

---

## Sweep summary

| | |
|---|---|
| Milestones completed | 0–25 |
| Commits on `main` | 37, merged over three pull requests |
| Tests | 72 passing across 15 files |
| App shell bundle | ~8 kB (vendors split and cached separately) |
| Recurring theme | Verification before every commit (lint + build, later + tests); the new react-hooks v7 lint rules twice forced event-driven designs that were better than the effect-based first drafts |
