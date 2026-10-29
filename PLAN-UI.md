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
| U1 | Done | **Gating + shared sign-in button.** Logic only, with tests: `GoogleSignInButton`, nav links shown only to signed-in users, `/play` behind `ProtectedRoute`, and the Start Training tooltip. | `src/App.jsx`, `Navbar`, `Home.jsx`, `GoogleSignInButton/`, `Tooltip/` |
| U2 | Done | **Landing + shell restyle (taste-skill).** Hero with the image, game modes, a leaderboard social-proof section, the CTA, and Navbar, Footer, Button and Card restyled to the dealt type and composition. | `Home.jsx`, `src/components/landing/`, `src/index.css`, `Button`, `Card`, `Navbar`, `Footer` |

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
3. **Route gate** (`src/App.jsx`): `<Route path="play">` moves inside the existing `<ProtectedRoute />` element, next to `profile`. Signed-out deep links redirect to `/`. The route table is now exported as `AppRoutes`, so a test can mount it in a `MemoryRouter`. `App` still wraps it in the providers and `BrowserRouter`.
4. **Start Training** (`Home.jsx`):
   - **Signed in:** the existing `Button to="/play"`.
   - **Signed out:** a `<button>` that opens a tooltip reading "Continue with Google to start playing".
     - It opens on click, hover and focus. *Built:* a click opens it rather than toggling it. With hover also opening it, a toggle would close it on the first click with a mouse.
     - It closes on Escape, on blur or on an outside click.
     - It's wired up with `aria-describedby` and `role="tooltip"`.
   - The tooltip is a small `src/components/Tooltip/` component, positioned with CSS only. No popper library.
5. **Tests** (Vitest and Testing Library):
   - **Harness:**
     - Components are wrapped in `AuthContext.Provider` (from `src/contexts/authContext.js`) and a `MemoryRouter`, through the shared helper `src/test/renderWithAuth.jsx`.
     - `services/auth` is mocked with `vi.mock`, as `api.test.js` already does, so the Neon SDK isn't initialized.
   - **`Navbar`:** links are hidden when signed out or loading, and all four show when signed in.
   - **`Home`:** signed out, Start Training shows the tooltip and Escape hides it. Signed in, it links to `/play`.
   - **`GoogleSignInButton`:** a click calls `signInWithGoogle`, and a rejection is caught.
   - **Routing:** signed out, `/play` renders Home.
   - **`Tooltip`** (added while building): hidden at first and tied to its trigger as the accessible description; opens on click, focus and hover; closes on Escape, an outside press, blur and the pointer leaving.
6. **Unchanged:** `GameArea`'s derived `'signed-out'` save status. It still covers a sign-out in the middle of a match.
7. `ARCHITECTURE.md`: the `pages/` row now says `/play` is protected too, and the nav links are for signed-in players only.
8. Stop for review.

### U1 verification

- `npm run lint`, `npm run format:check`, `npm test` and `npm run build` pass.
  - **Tests:** 205, up from 193. The 12 new tests are 2 for `GoogleSignInButton`, 4 for `Tooltip`, 3 for `Navbar`, 2 for `Home` and 1 for `AppRoutes`.
  - **Bundle:** the entry chunk is 3.33 kB gzip (3.30 before), and `Home` is 1.18 kB.
- **Signed out, in headless Chrome** against the production build (`vite preview`), with JS run before the DOM dump:
  - On `/`, the navbar has no Play, Leaderboards, Profile or Settings links. It shows only the wordmark and "Continue with Google". The one `/leaderboards` link left is the hero's button.
  - The hidden `role="tooltip"` element is in place next to Start Training.
  - `/play` redirects to Home (its `h1` is "Train your aim, …").
- **Not run here:**
  - The tooltip opening in a real browser. The unit tests cover it in jsdom.
  - Every signed-in path, which needs Google sign-in.
- *2026-10-28, user report:*
  - *Signed out: no links in the navbar, Start Training shows the message on hover, and `/play` reroutes to Home.*
  - *Signed in: the links appear.*
  - *Second report: signed in, Start Training opens `/play`. The tooltip closes when the pointer leaves. Signed out, `/leaderboards` and `/settings` work. The Personal Best button starts Google sign-in.*
  - *Not reported: closing with Escape or an outside click. The `Tooltip` unit tests cover both.*
  - *The user saw only one "Continue with Google", the navbar's. That's expected: the other one is on `/leaderboards` → Personal Best, which a signed-out visitor reaches through the hero's Leaderboards button or the URL, now that the nav link is hidden. U2's CTA adds one to Home. (U2 later replaced the hero's button with the board section's link and the footer link.)*
- **Browser checks (user),** under `npm run dev:full`:
  1. Signed out: no page links in the navbar. Hovering, focusing or clicking Start Training shows "Continue with Google to start playing". Escape or a click elsewhere hides it.
  2. Signed out: typing `/play` lands on Home. `/leaderboards` and `/settings` still open.
  3. Signed in: all four links show, and Start Training opens `/play`.
  4. Both "Continue with Google" buttons (the navbar, and Leaderboards → Personal Best) still start sign-in.

## U2 detail

`taste-skill:design-taste-frontend` ran in **redesign mode**. It kept the stack (React and Tailwind 4) and the content, and changed things in the order type, color, frame, states, then components.

### Direction (the user's choice)

- **Dealt:** `draw.mjs --sector consumer-app --sections features,proof,cta,footer --have product-ui --keep palette --options 3` dealt three directions: *Product performs*, *Loud and flat* and *The page is the object*.
  - The user chose **Loud and flat** (seed `1164839022`): flat saturated fields, the heaviest type, short blunt statements.
  - The user also approved the one "live thing": a warm-up target.
- **Sheet:**
  - Hero "Waterline headline". Unbounded 800 (uppercase display) with Onest 400/500 (text). The palette is kept.
  - Sections: capabilities at poster scale, names as one sentence, first step already open.
  - Motion: masked headline.
- **One redraw:** the footer went from "Contact as the headline" to `footer-single-quiet-line`. The project publishes no phone or email, and the footer is the shared shell on Play, Profile and Settings, where a 90svh close would be wrong.
- **Settled conflicts** (house rules > direction > type and palette > blueprints):
  - The hero blueprint says "no image", but the direction calls for a tilted picture and the user supplied the hero screenshot. The screenshot sits tilted 4° in the lower field at the right, cropped by the hero's bottom edge, and never over the headline.
  - The headline is flush left (direction), not centred (blueprint), and aligned to the app's `max-w-6xl` container, so the margins match the navbar and every other section.
  - The proof sentence is a statement at 36px or less (the house rule), not a 76px run.
- **Idea:** the target's ring colours, each theme's own `--target-*`, become the poster's flat fields and the one live target.

### As built

- **Type and tokens** (`src/index.css`):
  - `--font-sans` (Onest) and `--font-display` (Unbounded; `.font-display` sets 800, uppercase, -0.03em).
  - Five size steps cover the page: `caption` 13–14, `copy` 17–19, `lead` 22–36, `head` 22–48 and `display` 52–140 px. They're named `caption` and `copy` because `text-body` is already the body colour utility.
  - Motion tokens, plus CSS for the masked line reveal, `.waterline`, reveal-on-scroll, the hero picture's slow drift and the mode-list hover.
- **New dependencies:** `@fontsource/unbounded` 5.3.0 and `@fontsource/onest` 5.3.1, pinned exactly.
  - **Why:** self-hosted, so there's no third-party font request (the sheet's Google Fonts link would add one).
  - **Footprint:** only the weights and subsets used are imported: Unbounded 800 Latin, and Onest 400/500 Latin and Latin Extended (players' names). About 77 KB of woff2 on disk, and a browser downloads only the files whose `unicode-range` a page uses.
- **`src/components/landing/`:**
  - `Hero`: waterline fields at `--seam-y` (46% of the screen below the nav on phones, 50% from `sm`). The h1 sits so the middle of line two is on the seam, and line two's `::after` repaints its lower half in `--on-accent`. So there's no second copy of the text, and the reveal carries the repaint with it.
  - `ModeList`: six names at poster scale, each with its description and `modeFacts(mode)`. That's a pure function, so the numbers can't drift from `modes.js`.
  - `BoardSentence`: social proof from `useLeaderboard('all')`, written as "Leading the board: A with 3,100 and B with 2,850." `useCycle` lights one name every 2 s. It shows a loading line and an empty-board line, and hides itself on an error.
  - `ClosingCall`: "Are you ready to step your game up?" on an accent field, with the `WarmupTarget` panel (`data-ui`). The panel's button is `GoogleSignInButton` when signed out and Start Training when signed in.
  - `WarmupTarget` and `useWarmupTarget`: a DOM button in the theme's ring colours. A hit records the last and best reaction time (pure helpers in `utils/reactionTarget.js`) and moves the target.
  - `StartTrainingButton`, moved out of `Home.jsx`.
  - `pages/Home.jsx` composes the four sections, and `useReveal` handles the reveal-on-scroll.
- **Accent fields use `accent-strong`:**
  - In the Light theme, `on-accent` on `accent` is only 3.7:1, below AA for the 22px phone-size sentences.
  - `accent-strong` clears 4.5:1 in all five themes: Dark 8.2, Light 5.4, Cyberpunk 5.7, Terminal 6.4, Aimlabs 5.1.
- **Shell:**
  - `Button`: square, with flat fills. Secondary is now `bg-surface` rather than an outline, and there's a new `inverse` variant for accent fields. The variant and size API is unchanged.
  - `Card`: a one-tone-step fill with no border.
  - `Navbar`: a plain bar with no border, blur or sticky positioning. The wordmark is in the display face.
  - `Footer`: one quiet line with what this is, Leaderboards and Settings, and the year.
  - `Tooltip`: square corners.
  - `Layout`: `min-h-svh`.
  - `pages/Leaderboards.jsx`: the Personal Best sign-in button is now primary, since a secondary button now has the same fill as the Card around it.
- **Removed from Home:** the hero's "Leaderboards" button. Signed-out visitors reach `/leaderboards` through "See every leaderboard" in the board section and through the footer.
- **Sign-in from the landing page lands on `/play`** (the user's request at the U2 gate):
  - **How:** `signInWithGoogle({ returnTo })` builds Neon's absolute callback with `utils/callbackUrl.js`, which is pure and tested. `GoogleSignInButton` takes `returnTo`.
  - **Where:** the closing panel's button passes `/play`. The navbar's button passes `/play` only on `/`; anywhere else the player returns to the page they were on.
  - **Why it's safe:** the SDK exchanges the returned verifier inside its first `getSession` call, which `useSession` reports as pending, so `ProtectedRoute` on `/play` shows its spinner and doesn't redirect home.
- **Tests** (231, up from 205; 225 before the `returnTo` change):
  - New: `modeFacts`, `reactionTarget`, `BoardSentence` (sentence, cycling, empty, error) and `WarmupTarget`.
  - Updated: `Home` (tooltip, closing sign-in, two Start Training links when signed in, six modes, one h1), with `useLeaderboard` mocked in `Home` and `App` tests.

### U2 verification

- `npm run lint`, `npm run format:check`, `npm test` (231) and `npm run build` pass.
  - **Bundle:** entry chunk 3.44 kB gzip (3.33 before), `Home` 3.58 kB, CSS 7.80 kB gzip (6.29 before), `react-vendor` and `auth-vendor` unchanged.
- **taste-skill `lint.mjs`** over the landing page and shell: 0 FAIL, 0 WARN.
  - Two lines carry `taste-skill-ignore`: the tooltip's overlay shadow, and the warm-up panel's dialog frame (a `data-ui` fragment).
- **taste-skill `inspect.mjs`:**
  - **Final gate:** run on the production build (`vite preview`, with `/api` proxied to `vercel dev` so the board shows live data), with `--allow few-pictures` (the U2 imagery decision). Result: **0 FAIL, 1 WARN** (`no-footage`: no honest clip of the product exists).
  - **Measured:** Unbounded 800 and Onest, sizes 14/19/36/48/130 px, the headline on 2 lines at 1440, 768 and 390.
- **Rounds:**
  - **Inspector rounds 1–3** fixed the hero button falling below the first screen, the off-centre margins, covered text (the two-copy waterline technique and the sticky nav), the closing line wrapping to 3–4 lines, the hero sentence under 18px on phones, and display weight 400 (preflight resets heading weights).
  - **Critique rounds 1 and 2** fixed a dead block of accent colour in the close, mode descriptions squeezed into a third-width column on tablet, and an empty left column in the close.
  - Screenshots at 1440, 768 and 390 were reviewed after the last change.
- **Before and after:**

  | Measure | Before (U0) | After |
  |---|---|---|
  | Inspector | 6 FAIL, 1 WARN | 0 FAIL, 1 WARN |
  | Hero type | system-ui 48 px (3.3vw), 3 lines at 390 | Unbounded 130 px (9vw), 2 lines everywhere |
  | Faces | system-ui | Onest, Unbounded |
  | Page | 1 screen, 97 words, 0 images | 3.9 screens, 219 words, the hero screenshot and the warm-up panel |

- **All five themes,** full-page screenshots in headless Chrome: the fields, waterline, panel and target rings take each theme's colours. Text contrast was computed for every pair the page uses (table above).
- **Real browser, headless Chrome:**
  - Hovering Start Training shows "Continue with Google to start playing", and Escape plus moving away hides it.
  - One hit on the warm-up target recorded a reaction time and moved the target.
  - With reduced motion on, no `[data-reveal]` element stays hidden, and the page logs no console errors.
- **Not run:**
  - Signed-in paths in a real browser (they need Google).
  - The Vercel preview deploy (after a push).
- **Data note for the user:** the all-time board's leader has **9,999,999** in Survival. That's almost certainly not a real score, and the landing page now shows it as social proof. *The user deleted the row in the Neon Console (2026-10-28). Preventing exploited scores is deferred to later work; see README's anti-cheat note on server-signed match tokens.*
- *2026-10-28, user report: the signed-out checks all passed, and the other pages look right. The user asked that signing in from the landing page lands on `/play`, which is now built and tested in jsdom. Not yet checked with a real Google sign-in.*
- *2026-10-28, user report: with a real Google sign-in, both "Continue with Google" buttons on the landing page land on `/play`, and the navbar's button on `/leaderboards` returns there.*
- **Browser checks (user),** under `npm run dev:full`:
  1. Signed out: the tooltip, the board sentence cycling, "See every leaderboard", and the closing "Continue with Google" starting sign-in.
  2. Signed in: both Start Training buttons open `/play`.
  3. The warm-up target in each theme (Settings → theme).
  4. Play, Leaderboards, Profile and Settings still look right with the restyled Button, Card, Navbar and Footer.

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
