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
| Scope | The landing page plus the shared shell (Navbar, Footer, Button, Card). The other pages get restyled in later milestones (U3–U7, below). |
| Skill install | A user-level Claude Code plugin. It stays out of the repo and adds no npm dependency. |

### The other pages (added 2026-10-28, after U2)

| Topic | Choice |
|---|---|
| Kind of work | Play, Leaderboards, Profile and Settings are **app screens**: they're worked in, not read. The skill gives them their own run (`references/app-screens.md`), its own draw (`draw.mjs --app`) and its own house rules (quiet borders, small labels and repeated panels are fine there) and checks them with `inspect.mjs --app`. NotFound is a **page**, so it takes U2's *Loud and flat* direction. |
| Style | One app style for all four screens, dealt once at U3 with `draw.mjs --app --kind <kind> --keep palette,type --options 3`, for the user to choose from (as at U2). `--keep palette,type` holds the five themes and U2's Unbounded and Onest, which is the skill's rule for a product whose site and app share one palette and typeface. |
| Order | Settings → Leaderboards → Profile → Play, from least to most risk. Settings proves the app tokens on the simplest screen. Leaderboards brings in the `Leaderboard` table, which Profile reuses. Play goes last because its overlays, HUD and results sit beside the canvas. |
| Canvas | The engine in `src/game/` doesn't change. Play's restyle covers only the React around it: `ModePicker`, `GameArea`'s controls and overlays, `GameHud`, `ResultsModal` and `SessionHistory`. The canvas keeps taking its colours from `themes.css`. |
| Data | The screens keep their real data, from the existing hooks and `/api`. The app run's "write a dataset" step becomes a written inventory of each screen's real objects and magnitudes. Fixture data goes only in tests. |
| States | Every block gets its loading, empty and error states (app-screens §11), and every row and control gets hover, selected, focus and disabled. The hooks already expose `isLoading` and `error`. |
| Signed-in screens | **Settled at U5's start (the user's choice, the recommended option):** `lint.mjs` on the source, Testing Library for the states, and screenshots by the user from a real sign-in at 1440, 768 and 390, critiqued against app-screens §2.7. `inspect.mjs` can't sign in with Google, and Play and Profile sit behind `ProtectedRoute`. *Rejected:* a dev-only route with a fixture user, which would ship code only to serve a tool. |

## Workflow

- Work happens on `refactor/UI`, which tracks `origin/refactor/UI`.
- Each milestone stops for review **before** committing, and the next one starts only after approval.

## Milestones

| # | Status | Milestone | Key files |
|---|---|---|---|
| U0 | Done | **Skill install + docs.** Install the plugin (user step). Write this plan and update CLAUDE.md. Ignore `.taste-skill/`. Record the "before" inspector baseline. The user adds the hero image. | `PLAN-UI.md`, `CLAUDE.md`, `.gitignore` |
| U1 | Done | **Gating + shared sign-in button.** Logic only, with tests: `GoogleSignInButton`, nav links shown only to signed-in users, `/play` behind `ProtectedRoute`, and the Start Training tooltip. | `src/App.jsx`, `Navbar`, `Home.jsx`, `GoogleSignInButton/`, `Tooltip/` |
| U2 | Done | **Landing + shell restyle (taste-skill).** Hero with the image, game modes, a leaderboard social-proof section, the CTA, and Navbar, Footer, Button and Card restyled to the dealt type and composition. | `Home.jsx`, `src/components/landing/`, `src/index.css`, `Button`, `Card`, `Navbar`, `Footer` |
| U3 | Done | **App style + Settings.** Record the "before" `inspect.mjs --app` baseline of the four app screens (Play and Profile by the agreed signed-in method). Deal the app style (`--keep palette,type`) for the user to choose. Port its tokens into `src/index.css` (panels, small labels, tabs, controls). Restyle Settings: the theme picker and the system-preference notes, laid out as a settings screen (app-screens §8). | `src/index.css`, `Settings.jsx`, `ThemePicker` |
| U4 | Done | **Leaderboards.** The view tabs as app tabs, the `Leaderboard` table to the app's table rules (figures right-aligned in tabular numerals, the player's own row marked, quiet dividers), and the Personal Best sign-in prompt. Every state: loading, empty per view, error and signed out. | `Leaderboards.jsx`, `Leaderboard` |
| U5 | Done | **Profile.** Settle the signed-in check first. Then `ProfileCard` and `StatTile`, the two AI insight panels (`InsightPanel`, `HardwareInsight` and `PlatformInsight`, including their loading, empty and error states), and Best Matches through U4's table. The screen's one question decides what's biggest. | `Profile.jsx`, `ProfileCard`, `StatTile`, `InsightPanel`, `HardwareInsight`, `PlatformInsight` |
| U6 | Planned | **Play.** The mode picker, the match controls, the HUD, the idle and paused overlays on the canvas, `ResultsModal` (its save status included) and the session history. No engine changes. `Modal`'s backdrop blur and large shadow go, per the house rules. | `Play.jsx`, `ModePicker`, `GameArea`, `GameHud`, `Modal`, `ResultsModal`, `SessionHistory` |
| U7 | Planned | **NotFound, shared states and the final pass.** NotFound in the landing direction. `LoadingScreen` and `LoadingSpinner` matched to the app style. Remove `PagePlaceholder`, which nothing imports. Then a whole-app pass: all five themes, reduced motion, increased contrast, the bundle against U2's numbers, the Vercel preview, and ARCHITECTURE.md and README.md updated. | `NotFound.jsx`, `LoadingScreen`, `LoadingSpinner`, `PagePlaceholder/`, docs |

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

## U3 detail

`taste-skill:design-taste-frontend` runs the **app-screen run** (`references/app-screens.md`, read in full), not the page run.

1. **"Before" baseline.**
   - `inspect.mjs --app` against the production build (`vite preview`, with `/api` proxied to `vercel dev`) for `/settings` and `/leaderboards`, into `.taste-skill/app-before/`.
   - `lint.mjs --app` over the four screens' pages and components. Play and Profile can't be inspected signed out, so their baseline is the lint alone. Their screenshots wait on the U5 decision.
2. **Deal the app style:** `draw.mjs --app --kind community --theme dark --screens settings,list,detail,home --keep palette,type --options 3`. Dark, because four of the five themes are dark and Dark is the default. **The user chooses.** The run notes go in `.taste-skill/app/notes.md`.
3. **Deal the sheet** for the chosen style, then write the notes (app-screens §2.1–2.3):
   - Settings' data inventory.
   - Settings' one question.
   - The face and the signature element chosen from the sheet.
4. **Tokens** in `src/index.css`, mapped onto the existing theme roles, so all five themes carry them. They cover app type sizes (title 24, section 16, body 14, small 12), panel padding and gap, control height, and the style's selection mark. No new colours: any new role is derived from `themes.css`.
5. **Settings restyle** (app-screens §8.2): label column beside panel on desktop, stacked on the phone. `ThemePicker` follows the style's selection rule and shows what the setting produces, since each option is already a preview of its theme. The system-preference notes become rows.
6. **Gate:** lint, format check, tests and build; `lint.mjs --app` and `inspect.mjs --app` on `/settings` at 0 FAIL; screenshots reviewed in all five themes; the critique questions in app-screens §2.7 answered.
7. Stop for review.

### Style (the user's choice)

- **Dealt:** the deal gave two dark styles, not three: *Data terminal* and *True-black flat*. The user chose **Data terminal** (seed `974519014`).
  - **The move:** every selection is a 1px accent line exactly as wide as its label, on the nearest edge.
  - Numbers stay white or grey, tabular, with their sign in the text.
- **Departures from the sheet,** each for a stated reason:
  - **Shell:** the sheet dealt an icon rail. U2's top bar stays (the "no sidebar" archetype: a few destinations over a centred column). It's the shared shell, the landing page uses it, and four destinations don't need a rail. The move goes on its active link instead.
  - **Radius:** the sheet's 6px cards and pill controls give way to U2's square corners. `Button` and `Card` are shared with the landing page, and one product decides its radius once.
  - **Card tone:** the style's cards are darker than the ground. The kept palette puts surfaces one step lighter, with no border or glow.
  - **Weight:** Onest is loaded at 400 and 500 only, so app titles use 500. The old 600 headings were faux bold, synthesized by the browser.
- **Face:** the selection line is each theme's own `--accent`. Figures use Onest's `tnum` (its GSUB table has it), so there's no mono and no new dependency. The signature element is the target in the theme's `--target-*` rings.
- **Settings' one question:** "Which theme am I playing in, and what will the targets look like?" The answer comes first: the title row's line names the theme, and the largest block is the active theme's preview.

### As built

- **Tokens** (`src/index.css`): an app type scale beside the page scale. `title` 22–26, `label` 16, `ui` 14 and `meta` 12px.
- **`SettingsSection`** (new): a label column (title, description, optional summary) beside a `bg-surface` panel, 352 + 48 + 704 = 1104px on desktop, stacked below `lg`. Areas are split by a full-width rule.
- **`ThemePicker`:** a radio list of rows instead of a card grid, each a preview, the name and a description. The chosen name carries the accent line; hovering an unchosen one shows the line in `edge-strong`. `ThemePreview` moved to its own file, with a `lg` size for the summary.
- **`Settings`:**
  - The title row: "Settings", then "<Theme> theme is on, saved to this browser."
  - **Theme:** the summary column shows the active theme at large size ("as the targets will look in a match").
  - **Set elsewhere:** Sound, Reduced motion and Increased contrast, each with an On/Off value. The OS preferences come from the new `useMediaQuery` (`useSyncExternalStore`, so it updates live). Sound comes from `readStoredMute()`, now exported from `AudioManager`, which uses it too.
- **`Navbar`:** the active link loses its `bg-surface` fill (a filled pill tab is off-style) and takes the accent line under its label.
- **Light theme `--muted`** goes from `#71717a` to `#6b6b74`. On `--bg` it measured 4.4:1, under the 4.5:1 floor, and the new layout puts muted text on the ground; it's now 4.8:1.
- **Tests:** 236, up from 231: `useMediaQuery` (2) and `Settings` (3: the theme line, the OS values, the saved sound).
- **Docs:** ARCHITECTURE.md's hooks row and README's test count.

### U3 verification

- **Baseline, `inspect.mjs --app`** (2026-10-28):
  - `/settings`: **0 FAIL, 2 WARN.** `unused-canvas` (the content stops 168px short of the right edge at 1440) and `app-title-size` (a 30px h1 on a phone).
  - `/leaderboards`: **0 FAIL, 4 WARN.** `blank-gap` and `hero-void` (a 488px empty stretch under a two-row board), `unused-canvas` and `app-title-size`.
  - Measured: Onest at 10/12/14/16/20/30px on Settings, a `#09090b` ground, `#18181b` surfaces.
- **Baseline, `lint.mjs --app`** over the four screens: **4 FAIL, 4 WARN.**
  - FAIL `micro-label`: the uppercase tracked headers in `Leaderboard`, `StatTile`, `HardwareInsight` and `SessionHistory`.
  - WARN `glass`: the backdrop blur in `GameArea`'s overlay and in `Modal`.
  - WARN `shadow`: `Modal`'s `shadow-2xl`.
  - WARN `em-dash`: 12 em dashes across the files.
- **Screenshots reviewed:** Settings is a 3-column grid of theme cards with a cyan active ring, then three note cards. Leaderboards is a filled pill tab row over a table with uppercase headers and scores without thousands separators ("13125").
- **After:**
  - `npm run lint`, `npm run format:check`, `npm test` (236) and `npm run build` pass. **Bundle:** entry chunk 3.47 kB gzip (3.44 before), `Settings` 1.83 kB (1.36 before), CSS 8.12 kB gzip (7.80 before).
  - `lint.mjs --app` over Settings, `ThemePicker`, `SettingsSection` and `Navbar`: **0 FAIL, 0 WARN.**
  - `inspect.mjs --app` on `/settings` (production build): **0 FAIL, 1 WARN.** Measured Onest at 12/14/16/26px and the h1 at 26/23/22px.
    - The WARN, `unused-canvas` ("starts 15px from the sidebar"), is a false positive. The inspector measures the text box of the visually hidden "Skip to content" link, which spills past its 1px `sr-only` box at x≈16. The canvas is centred, with 168px margins on both sides. The baseline carried the same WARN.
  - **All five themes,** full-page screenshots in headless Chrome. Contrast:

    | Pair | Dark | Light | Cyberpunk | Terminal | Aimlabs |
    |---|---|---|---|---|---|
    | heading on surface | 17.7 | 17.7 | 18.1 | 17.2 | 16.4 |
    | muted on surface | 6.9 | 5.3 | 6.6 | 8.1 | 6.7 |
    | muted on bg | 7.8 | 4.8 | 7.3 | 9.1 | 7.4 |
    | badge (body on bg) | 13.5 | 9.5 | 14.8 | 17.0 | 12.8 |
    | accent line on surface (non-text, 3:1) | 9.8 | 3.7 | 6.8 | 8.2 | 6.7 |

  - **Keyboard:** focusing the checked radio and pressing ↓ selected the next theme. The theme changed, the accent line moved, and the row showed the focus ring.
  - **Critique** (app-screens §2.7):
    - The biggest block answers the question, and every block ends on the canvas edges.
    - Colour appears only on the selection line and inside the theme previews.
    - Round 1's one fix: the "Set elsewhere" rows took the theme list's dividers (one divider treatment per screen).
    - Left as is: about 200px of open label column under the summary preview beside the taller theme panel.
  - **Before and after** (`/settings`):

    | Measure | Before | After |
    |---|---|---|
    | Inspector | 0 FAIL, 2 WARN | 0 FAIL, 1 WARN (false positive) |
    | Title | 30px at every width, faux-bold 600 | 26/23/22px, Onest 500 |
    | Sizes | 10/12/14/16/20/30 | 12/14/16/26 |
    | Theme choice | a 3 + 2 card grid, cyan ring on the active card | one radio list, the accent line on the chosen name, the active theme shown large |
    | Preferences | three static note cards | three rows with their live On/Off values |

- **Not run:**
  - The navbar's accent line in a real browser. The links only show signed in. The `Navbar` tests still pass.
  - The Vercel preview (after a push).
- **Browser checks (user),** under `npm run dev:full`:
  1. `/settings` in each theme: the chosen name is underlined in the accent, and the big preview matches.
  2. Signed in: the current page's nav link is underlined in the accent, with no filled background.
  3. Turn on reduced motion or increased contrast in the OS: the row's value changes to On without a reload.
  4. Mute sound on `/play`, then open `/settings`: Sound reads Off.
- *2026-10-28, user report: all four browser checks passed, including the navbar's accent line signed in.*

## U4 detail

The *Data terminal* sheet from U3 applies, with its `list` screen pattern.

1. **Notes** (app-screens §2.1–2.2), in `.taste-skill/app/notes.md`:
   - **Inventory:** each row holds a rank, player (name, avatar), mode, score, accuracy, reaction time (nullable) and date. The public boards hold up to 100 players, one row each. Personal Best holds the player's own 10 best matches.
   - **The one question:** "Who leads this board, and where do I stand?"
2. **One departure:** the sheet's `list` pattern puts count cards above the list as filters. The four views are periods, not types, and counting them would take four queries, so they become **underline tabs** on a full-width rule (§4.4), with the selection line under the chosen label.
3. **Pure helpers** in `src/utils/leaderboardFormat.js`, with tests:
   - Formatting: scores with thousands separators, accuracy to one decimal, reaction time in ms or a grey dash, dates in ISO form.
   - Ranks as ordinals.
   - **`boardSummary`**, the board's finding: "A leads with 13,125 in Speed. You're 2nd of 2."
4. **`useLeaderboard`** returns `reload`, so a failed board can offer Retry (tested).
5. **`Leaderboard` table** (§7):
   - Sentence-case 12px headers and quiet row rules. Figures are right-aligned and tabular. A header that sticks while scrolling the 100-row board.
   - The finding as the table's caption.
   - The player's own row carries a neutral "You" tag instead of a tint.
   - Below `lg`, the secondary columns fold into a grey second line under the name.
   - **States, all inside the frame with its header:**
     - Loading: grey bars at the rows' real size, replacing the spinner.
     - Empty: one sentence across the table.
     - Error: one sentence and a Retry text button.
6. **`Leaderboards` page:**
   - A title row with a line naming each view's window (the UTC resets). Signed in, it adds a "Play a match" action.
   - The underline tabs, with `tabpanel` semantics.
   - The Personal Best sign-in prompt in the same frame.
   - Profile keeps working through the same component. Its own layout waits for U5.
7. **Gate:** lint, format check, tests and build; `lint.mjs --app` and `inspect.mjs --app` on `/leaderboards` at 0 FAIL; five themes, the phone, and every state seen in the browser; the §2.7 critique questions answered.
8. Stop for review.

### As built

- **`utils/leaderboardFormat.js`** (new): `formatScore`, `formatAccuracy`, `formatReactionMs` (separators, null kept), `formatDay` (ISO, local), `ordinal` (`Intl.PluralRules`) and `boardSummary`. Examples:
  - A visitor: "Ada leads with 13,125 in Speed. 3 players on this board."
  - A ranked player: "… You're 3rd of 3."
  - The leader: "You lead with …"
  - Personal Best: "Your best is 13,125 in Speed."
- **`useLeaderboard`:** the attempt count is part of the request key, so `reload()` shows the board as loading and refetches.
- **`Leaderboard`**, split into the frame (`Leaderboard.jsx`) and `LeaderboardRow.jsx`:
  - **Layout:**
    - A plain `bg-surface` frame. `Card`'s `p-5` had been beating the `p-0` passed to it, which inset the old table by 20px.
    - `table-fixed` with set widths, so spare width spreads across the columns. Round 1 had left a 440px gap after the player's name.
  - **Header:** 12px sentence case, sticky.
  - **Columns:** Rank, Player, Mode, Score, Accuracy, Reaction (new: the API already sent it) and Date (ISO).
  - **The player's own row** carries a neutral "You" tag.
  - **Folding:** Mode and Accuracy fold into the name's grey second line below `sm`, Reaction and Date below `lg`.
  - **States:**
    - Loading: five placeholder rows plus a caption bar, and an `sr-only` status.
    - Empty: one sentence across the table.
    - Error: the old messages plus Retry.
  - **Finding:** the caption, only with `withSummary`. Profile doesn't use it yet.
- **`Leaderboards` page:**
  - A title row with each view's window ("… Resets Monday at 00:00 UTC.") and, signed in, a "Play a match" link.
  - Underline tabs with `aria-controls` and a labelled `tabpanel`.
  - **The tab rule** sits inside the scrolling tablist: on round 2's screenshots, `overflow-x-auto` had clipped the selected tab's `-mb-px` accent line.
  - The signed-out Personal Best prompt sits in the same frame. Its button moved from the accent fill to `inverse`: the style keeps the accent to a line, and `inverse` still stands apart from the surface.
- **Tests:** 255, up from 236:
  - `leaderboardFormat` (10);
  - `useLeaderboard` (3, the first tests for the hook);
  - `Leaderboard` (from 5 to 8: Retry, loading frame, caption, the "You" tag, formatted figures);
  - the `Leaderboards` page (3: tabs and windows, the signed-out prompt, the Play link).

### U4 verification

- `npm run lint`, `npm run format:check`, `npm test` (255) and `npm run build` pass. **Bundle:** entry chunk 3.48 kB gzip, `Leaderboards` 1.20 kB, `Leaderboard` 2.16 kB, CSS 8.32 kB gzip.
- `lint.mjs --app` over the page and `Leaderboard/`: **0 FAIL, 0 WARN.**
- `inspect.mjs --app` on `/leaderboards` (production build, live data through `vercel dev`): **0 FAIL, 3 WARN.** Measured Onest at 12/14/26px and the h1 at 26/23/22px.
  - `unused-canvas`: the skip-link false positive (see U3).
  - `blank-gap` and `hero-void`: the space between a two-row board and the footer, which `min-h-svh` holds at the window's foot. The board stays at its real size (app-screens §10: design for the data the account has). The baseline carried both WARNs, with a 488px gap.
- **States in headless Chrome** (a scratchpad script with request interception):
  - Today shows "No scores today yet." under the header.
  - Personal Best signed out shows the prompt.
  - A failed request shows the outage sentence and Retry.
  - Retry with the request held shows the placeholder rows and `aria-busy="true"`.
  - Releasing the request shows the board.
- **All five themes:** full-page screenshots. Contrast as in U3: every text pair is 4.8:1 or more. The accent line is 3.7:1 or more on the surface, and the tab line on `--bg` is higher.
- **Phone and tablet:** the second line carries the folded columns. At 390px it wraps to two grey lines under the name, and nothing is dropped.
- **Critique** (§2.7):
  - The table is the biggest block, and its caption answers the question just before the rows.
  - The edges line up: the title, tabs, frame and footer share the 168px margins.
  - Colour appears only on the tab line and the players' own avatars.
  - Figures are right-aligned, tabular and separated, and a missing reaction time is a grey dash.
- **Before and after** (`/leaderboards`):

  | Measure | Before | After |
  |---|---|---|
  | Inspector | 0 FAIL, 4 WARN | 0 FAIL, 3 WARN (explained above) |
  | Title | 30px everywhere, faux-bold 600 | 26/23/22px, Onest 500 |
  | Tabs | filled pills | underline tabs, the accent line on the chosen one |
  | Table | uppercase tracked headers, "13125", locale dates, a cyan rank on the top 3 | sentence-case headers, "13,125", ISO dates, reaction time, a grey rank |
  | Loading | a spinner | the table's own frame with placeholder rows |
  | Error | a tinted card, no way to retry | one sentence in the frame and Retry |

- **Not run:** signed-in paths (the "You" tag, the standing sentence, Personal Best rows, the Play link) in a real browser. Profile's Best Matches through the new table. The Vercel preview.
- **Browser checks (user),** under `npm run dev:full`:
  1. Signed out: each tab's window line, the empty Today board, the Personal Best prompt and its sign-in.
  2. Signed in: your row tagged "You", the caption's standing ("You're 2nd of 2." or "You lead …"), Personal Best rows with "Your best is …", and "Play a match" opening `/play`.
  3. Profile → Best Matches still renders through the new table. Its own layout comes in U5.
  4. Optional: stop `vercel dev` while the page is open, switch tabs to see the error, restart it, and press Retry.
- *2026-10-28, user report: the browser checks passed, including the signed-in paths and Profile's Best Matches through the new table.*

## U5 detail

The *Data terminal* sheet applies, with its `detail` pattern: the page header is the object itself, then KPIs, then the blocks.

1. **Notes** (§2.1–2.2):
   - **Inventory:**
     - The player: name, avatar, member since.
     - `/api/me`'s stats: matches played, highest score, average accuracy, favourite mode.
     - Up to 10 best matches.
     - Two AI recommendations, on demand. Each costs a Claude call, is cached until new matches arrive, is limited to 5 a day, and needs at least 5 matches.
   - **The one question:** "How am I doing, and what should I change?"
2. **The object header:** the avatar, the player's name as the h1, a meta line ("Playing since October 2026 · 12 matches"), and "Play a match" on the right.
3. **`StatStrip`** (new): one container split by dividers into equal columns, each label over its value (§5). Four across from `sm`, two by two on a phone. It replaces Profile's `StatTile`s. The HUD keeps `StatTile` until U6.
   - **Honest values:** a zero prints as 0, and a value that doesn't apply yet (accuracy or favourite mode with no matches) is a grey dash.
   - **Loading:** bars at the values' size.
4. **Best Matches** through U4's table, with a **personal variant**. Mode takes the Player column's place, since every row is the same player. The Leaderboards page's Personal Best tab uses the same variant.
5. **AI recommendations:**
   - `InsightPanel`: the answer above a footer row that holds the Generate/Update button and the "Generated …" stamp, pinned to the panel's foot, so the two panels in a row end level.
   - The button takes `inverse`, keeping the accent to a line.
   - Errors in the body colour, not the accent.
   - `HardwareInsight`'s fields: labels above square 36px controls. Its recommendation labels become sentence case (it fails `micro-label` now).
6. **Profile states:** loading keeps the page frame with placeholder bars, not a full-page spinner. A failed profile shows one sentence and Retry in the stats block, with `useUserProfile` gaining `reload()` like `useLeaderboard`.
7. **Gate:**
   - Lint, format check, tests and build.
   - `lint.mjs --app` at 0 FAIL on Profile and its components.
   - Testing Library covers the header, the stats, the zero and error states, and the personal table.
   - **The user's screenshots** at 1440, 768 and 390, signed in, in at least Dark and Light, critiqued against §2.7.
8. Stop for review.

### As built

- **`ProfileHeader`** (was `ProfileCard`, renamed with `git mv`):
  - The avatar, or an initial; the player's name as the h1; the meta line from `profileMeta()`, with a placeholder bar while it loads; and an action slot.
  - Profile passes "Play a match" (`inverse`, since the header is the surface).
- **`StatStrip`** (new): a `dl` in a 1px-gap grid on `bg-edge`, so the dividers are the container showing through.
  - Four cells across from `sm`, two by two on a phone, each a 12px label over a 20px value (the new `text-figure` token).
  - A null value is a grey dash, read out as "None yet". Loading shows bars.
- **`utils/profileStats.js`** (new):
  - `profileFigures()`: highest score, matches played, average accuracy (null with no matches), favourite mode (null until there is one).
  - `profileMeta()`: "Playing since October 2026 · 12 matches", or "No matches yet".
- **`useUserProfile`:** the same keyed `reload()` as `useLeaderboard`. A failed load shows "Couldn't load your stats right now." and Retry in the stats block.
- **The `Leaderboard` personal variant:**
  - `personal` drops the Player column and makes the mode each row's identity. That covers the header, the rows, the placeholder rows and the message rows' `colSpan`.
  - Profile's Best Matches and the Leaderboards Personal Best tab both use it.
  - No caption on Profile: the strip already shows the highest score (§5, one figure in one place).
- **`InsightPanel`:**
  - A plain surface: the heading and controls, then the answer, then any error, each split by a rule.
  - A footer pinned with `mt-auto` holds the `inverse` button and either the "Asking Claude…" status or the "Generated …" stamp.
  - Errors are in the body colour.
- **`HardwareInsight`:** labels at 14/500 above square 36px controls on `bg-bg`. The recommendation labels are now sentence case, which clears its `micro-label` FAIL.
- **`PlatformInsight`:** the app type tokens only.
- **Profile layout:** header, stats strip, "Best matches", then "AI recommendations" with a line naming the source, and the two panels side by side from `md`.
- **Tests:** 267, up from 255: `useUserProfile` (2), `profileStats` (6) and the `Profile` page (4: header and figures, zero state, stats Retry, the personal table).
- **Docs:** ARCHITECTURE.md's components row.

### U5 verification

- `npm run lint`, `npm run format:check`, `npm test` (267) and `npm run build` pass. **Bundle:** entry chunk 3.45 kB gzip, `Profile` 3.66 kB (3.24 before), `Leaderboard` 2.27 kB, CSS 8.41 kB gzip.
- `lint.mjs --app` over Profile, `ProfileHeader`, `StatStrip`, `InsightPanel`, `HardwareInsight`, `PlatformInsight` and `Leaderboard/`: **0 FAIL, 0 WARN.** The baseline flagged `micro-label` in `StatTile` (still used by the HUD until U6) and `HardwareInsight`.
- **The user's screenshots** (signed in, 1440, 768 and 390, Dark and Light, one with both AI answers filled in), critiqued against §2.7:
  - **The question first:** the header names the player, and the strip and Best matches answer "how am I doing".
  - **The figures agree:**
    - Highest score 8,560 is the top Best-matches row.
    - 5 matches played matches 5 rows.
    - 88.8% is the mean of the five accuracies: 444.1 / 5.
  - **Edges:** every block shares the page edges at all three widths.
  - **Colour:** only on the nav's accent line and the players' own avatars.
  - **Phone:** the strip folds two by two, and the table's secondary columns fold under the mode.
- *2026-10-29, user report and requests, from the screenshots:*
  1. *At 390px the nav links didn't fit: Settings couldn't be reached.* The links row scrolled sideways with no visible scrollbar, beside the avatar and Sign out.
  2. *Best matches should scroll past 5 matches,* for players with many.
- **Fix 1, the phone nav:**
  - **Layout:** below `sm` the bar wraps. The wordmark (shown at every width again) and the account controls take the first row. The four links take a second, edge to edge, each 44px tall.
  - **Rejected:** a menu sheet or a bottom bar (app-screens §12), both heavier for four short links that fit.
  - **The landing hero** used `100svh - 4rem`. It now uses a `--nav-h` token, which `:root:has([data-nav-links])` raises to 6.75rem below `sm`, so a signed-in phone visitor's hero still fits the first screen.
  - **Checked** in headless Chrome on a static copy of the signed-in bar's markup with the built CSS:
    - At 320, 390, 640 and 1440 every link is fully on screen.
    - At 390 Settings spans 321–374px, with no sideways page scroll.
    - `--nav-h` reads 6.75rem against a 107.5px bar at 390, and 4rem against 64px at 1440.
- **Fix 2, Best matches scrolls:**
  - `Leaderboard` takes `visibleRows` and `label`. Past that many rows its frame scrolls under the sticky header and becomes a named, focusable region, so the keyboard can scroll it.
  - **`useRowCap`** (new) measures the rows, which rewrap on phones, and sets the frame's max-height to five rows plus half the sixth, so the cut-off row shows there's more. It re-measures on resize.
  - Profile shows 5. The section header adds "N matches, best first. Scroll for more." when there are more than 5.
- **After the fixes:** lint, format check, tests (270: `useRowCap` 2, `Leaderboard` +1) and build pass. **Bundle:** `Profile` 3.75 kB gzip, CSS 8.55 kB.
- **Browser checks (user),** under `npm run dev:full`:
  1. At 390, signed in: all four links on their own row, each one tappable, Settings included.
  2. The landing page at 390, signed in: the hero still fits the first screen.
  3. With 6 or more matches: Best matches shows 5 rows and half of a sixth, scrolls under its header, and the line by the heading counts them. *(The user had 5 matches at the screenshots, so this needs one more match.)*
- *2026-10-29, user report: all three browser checks passed: the phone nav, the landing hero at 390 signed in, and Best matches scrolling past five.*

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
- **U3–U6 (app screens):**
  - `lint.mjs` on the changed source passes with 0 FAIL.
  - `inspect.mjs --app` passes with 0 FAIL at all three widths on every screen it can reach. Play and Profile are checked the way U5 settles.
  - Every block's loading, empty and error states, and each control's focus state, are seen in the browser, and covered by tests where they're logic.
  - All 5 themes are checked on the screen, and the contrast of every new text and fill pair is computed.
  - The before-and-after table is filled in, as in U2.
- **U7:** the U2 checks, run once more across the whole app.
