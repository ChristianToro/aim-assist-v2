# Plan: UI refactor (taste-skill)

The plan and milestone tracker for the UI rework on `refactor/UI`. v2.0 ([PLAN-V2.md](PLAN-V2.md)) is merged into `main`, and this is the "UI changes on separate feature branches" work it deferred.

## Context

The landing page (`src/pages/Home.jsx`) is still the v1 prototype's centered hero and game-mode grid. Every nav link shows to signed-out visitors, even though playing for real (saved scores, the profile) needs a Google account.

The UI is reworked with Leonxlnx's [taste-skill](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend`), an anti-slop design skill:

- It deals a researched art direction.
- It checks the page in headless Chrome at 1440, 768 and 390 px.
- It runs a screenshot-and-fix loop.

The first target is the landing page:

- Nav links are hidden from signed-out users.
- For a signed-out user, "Start Training" opens a tooltip telling them to "Continue with Google" to play.
- A hero image of a simulated game, supplied by the user.
- The leaderboard appears as a social-proof section.
- A bottom CTA with a login button and the line "Are you ready to step your game up?"

## Decisions (2026-10-28)

| Topic | Choice |
|---|---|
| Access | Hide the nav links, and gate **`/play` only** behind `ProtectedRoute`. `/leaderboards` and `/settings` stay reachable by URL. The navbar's "Continue with Google" stays. |
| Theming | `--keep palette`: the 5 themes and the canvas colors stay. The skill deals **typography and composition**. |
| Imagery | The user's hero image plus UI fragments built in HTML. No stock photos, so the skill's picture-floor rule is waived with `--allow`. |
| Scope | The landing page plus the shared shell (Navbar, Footer, Button, Card). The other pages get restyled in later milestones. |
| Skill install | A user-level Claude Code plugin. It stays out of the repo and adds no npm dependency. |

## Workflow

- Work happens on `refactor/UI`, which tracks `origin/refactor/UI`.
- Each milestone stops for review **before** committing, and the next one starts only after approval.

## Milestones

| # | Status | Milestone | Key files |
|---|---|---|---|
| U0 | Done | **Skill install + docs.** Install the plugin (user step). Write this plan and update CLAUDE.md. Ignore `.taste-skill/`. Record the "before" inspector baseline. The user adds the hero image. | `PLAN-UI.md`, `CLAUDE.md`, `.gitignore` |
| U1 | Planned | **Gating + shared sign-in button.** Logic only, with tests: `GoogleSignInButton`, nav links shown only to signed-in users, `/play` behind `ProtectedRoute`, and the Start Training tooltip. | `src/App.jsx`, `Navbar`, `Home.jsx`, `GoogleSignInButton/`, `Tooltip/` |
| U2 | Planned | **Landing + shell restyle (taste-skill).** Hero with the image, game modes, a leaderboard social-proof section, the CTA, and Navbar, Footer, Button and Card restyled to the dealt type and composition. | `Home.jsx`, `src/components/landing/`, `src/index.css`, `Leaderboard.jsx` |

## U0 detail

1. **User step** (slash commands Claude can't run): in Claude Code, run `/plugin marketplace add Leonxlnx/taste-skill`, then `/plugin install taste-skill@taste-skill`, then restart the session so `taste-skill:design-taste-frontend` loads. The prerequisites are met: Node 24, and Google Chrome is installed for `inspect.mjs`.
2. Write this plan.
3. `CLAUDE.md`:
   - The document list adds PLAN-UI.md.
   - The workflow covers `refactor/UI`.
   - A "UI design" rule: taste-skill with `--keep palette`, semantic theme tokens only, and no new runtime dependency without a justification.
4. `.gitignore`: add `.taste-skill/`, the skill's scratch output (screenshots and the dealt sheet).
5. **"Before" baseline**, as the skill's redesign workflow requires: `inspect.mjs` against the current `/` under `npm run dev:full` (`http://localhost:3000`) at all three widths. The report stays in `.taste-skill/` for comparison after U2.
6. **User step:** put the hero image in `src/assets/` (it's `src/assets/hero-img.webp`), so Vite fingerprints it.
7. Stop for review.

### U0 verification

- **Skill install:** the plugin `taste-skill@taste-skill` 2.1.5 is installed at local scope. It's enabled in `.claude/settings.local.json`, which the user's global git ignore covers, so nothing lands in the repo.
- **Hero image:** `src/assets/hero-img.webp`, a 1319×1192 WebP of 38 KB. It's a Gridshot screenshot in the default cyan theme, with targets and cursor in motion. The user converted it from the first upload, a 1.2 MB PNG of the same frame.
  - **Theme, for U2:** the screenshot's colors match only the default theme.
- **Baseline:** `inspect.mjs`, run with `--out .taste-skill/before` on the production build (`npm run build`, then `vite preview` on port 4173). The home page makes no `/api` calls, so `vercel dev` wasn't needed. **6 FAIL, 1 WARN:**
  - `hairline`: the navbar's and footer's borders;
  - `outlined-box`: the 6 game-mode cards;
  - `few-pictures`: 0 images;
  - `focal-point`: the largest type is 48 px (3.3vw), and no picture holds a third of the screen;
  - `still-page`: 2 moving elements;
  - `headline-lines`: the headline wraps to 3 lines at 390 px;
  - WARN `no-footage`.

  Measured: system-ui only, sizes 14/16/18/20/48 px, a `#09090b` ground with a `#06b6d4` accent, 1 screen and 97 words.
- **Baseline lint** of the landing page and shell source: **5 FAIL, 2 WARN:**
  - `hairline`: the Navbar and Footer borders, and the Leaderboard table rows;
  - `micro-label`: the Leaderboard header row;
  - `glass`: the navbar's backdrop blur;
  - `h-screen`: `min-h-screen` in Layout.

  Table lines are allowed by the house rules ("real tables … may have lines"), so the inspector won't flag the Leaderboard rows. The lint can be silenced with `taste-skill-ignore`.
- **Screenshots reviewed** (desktop and mobile): a centered system-font hero with an accent-colored phrase (a banned "styled accent word"), two buttons, and a uniform 3×2 grid of outlined cards. The mobile nav crowds the wordmark.
- `npm run build` passes (entry chunk 3.30 kB gzip, unchanged).

## U1 detail

These behaviour changes come with tests and are kept separate, so U2's diff is design only.

1. **`GoogleSignInButton`** (new, `src/components/GoogleSignInButton/`) wraps the try/catch `signInWithGoogle()` handler.
   - That handler is currently duplicated in `AuthControls.jsx` and in `SignInPrompt` in `pages/Leaderboards.jsx`, and the CTA would add a third copy.
   - Both current callers switch to the new component.
2. **Navbar:** render `navLinks` only when `useAuth()` has a `user`. While `isLoading`, render none, so links don't flash and then disappear. `AuthControls` doesn't change.
3. **Route gate** (`src/App.jsx`): `<Route path="play">` moves inside the existing `<ProtectedRoute />` element, next to `profile`. Signed-out deep links redirect to `/`.
4. **Start Training** (`Home.jsx`):
   - **Signed in:** the existing `Button to="/play"`.
   - **Signed out:** a `<button>` that opens a tooltip reading "Continue with Google to start playing".
     - It toggles on click, and also shows on hover and focus.
     - It closes on Escape, on blur or on an outside click.
     - It's wired up with `aria-describedby` and `role="tooltip"`.
   - The tooltip is a small `src/components/Tooltip/` component, positioned with CSS only. No popper library.
5. **Tests** (Vitest and Testing Library):
   - **Harness:**
     - Components are wrapped in `AuthContext.Provider` (from `src/contexts/authContext.js`) and a `MemoryRouter`.
     - `services/auth` is mocked with `vi.mock`, as `api.test.js` already does, so the Neon SDK isn't initialized.
   - **`Navbar`:** links are hidden when signed out or loading, and all four show when signed in.
   - **`Home`:** signed out, Start Training shows the tooltip and Escape hides it. Signed in, it links to `/play`.
   - **`GoogleSignInButton`:** a click calls `signInWithGoogle`, and a rejection is caught.
   - **Routing:** signed out, `/play` renders Home.
6. **Unchanged:** `GameArea`'s derived `'signed-out'` save status. It still covers a sign-out in the middle of a match.
7. Stop for review.

## U2 detail

`taste-skill:design-taste-frontend` runs in **redesign mode**. It keeps the stack (React and Tailwind 4) and the content, and changes things in the order type, color, frame, states, then components.

- **Draw:** `draw.mjs --brief "<aim trainer brief>" --sections hero,features,social-proof,cta --options 3 --keep palette`. The user picks one of the three dealt directions before the build starts.
- **Assets:**
  - The user's hero image is declared with `--have`.
  - Nothing is fetched with `assets.mjs`.
  - `--allow` waives only the picture-floor rule.
- **Tokens:**
  - The dealt type system goes into `src/index.css` under `@theme`, as `--font-display` and `--font-body`.
  - Colors keep using the semantic utilities from `styles/themes.css`, so all 5 themes keep working.
  - The skill's `base.css` and `base.js` aren't imported. Their rules are ported into Tailwind tokens and CSS.
- **Web font:** if the dealt face isn't a system font, it's self-hosted with one `@fontsource-variable/<face>` package. That avoids a third-party font request, and only the weights used are bundled. The justification is recorded here when it's added.

The landing sections are small components under `src/components/landing/`:

1. **Hero:**
   - A headline of two lines at most, a subline, and Start Training with its U1 behaviour.
   - The hero image, with `width`/`height` set, `fetchpriority="high"` and descriptive alt text.
2. **Game modes:** the existing `GAME_MODES` content, restyled. No icon-topped cards.
3. **Social proof** (`LeaderboardShowcase`):
   - **Data:** `useLeaderboard('all')` (public, no token), with the top 5 taken on the client from the existing top-100 response, so the API doesn't change.
   - **Display:** `Leaderboard.jsx` with a new `compact` prop that hides the Mode and Date columns.
   - **States:** an empty board reads "No scores yet — be the first." On an error the section hides, since a landing page shouldn't show an outage banner.
4. **CTA:** "Are you ready to step your game up?" with `GoogleSignInButton` when signed out, and a Start Training link when signed in.

**Shell:**

- Navbar, Footer, Button and Card follow the dealt type and composition.
- `Button` keeps its variant and size API, so other pages don't change.
- Motion uses CSS transform and opacity only. The global `prefers-reduced-motion` rule in `index.css` covers it.

**Skill gate:**

- `lint.mjs` over the changed files.
- `inspect.mjs http://localhost:3000` at 1440/768/390, with 0 FAIL.
- At most three rounds of screenshot critique.
- A before-and-after comparison against the U0 baseline.
- A check of all 5 themes through ThemePicker.

Stop for review.

## Verification (every gate)

- `npm run lint`, `npm run format:check`, `npm test` and `npm run build` pass.
- Under `npm run dev:full`:
  - **Signed out:** no nav links, the tooltip appears on Start Training, `/play` redirects to `/`, the CTA starts Google sign-in, and the leaderboard section renders (including its empty state).
  - **Signed in:** the links show, Start Training goes to `/play`, and the CTA shows Start Training.
- **U2:**
  - `inspect.mjs` passes with 0 FAIL at all three widths, with the screenshots reviewed and the critique recorded.
  - A manual check of all 5 themes and of reduced motion.
  - The bundle compared to v2's numbers (entry chunk 3.3 kB gzip).
  - After a push, a check on the Vercel preview deploy for `refactor/UI`.
