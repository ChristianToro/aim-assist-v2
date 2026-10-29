# Prompt History

This document records meaningful development interactions between the user and
AI coding agents working on this project. It focuses on requests, outcomes,
implementation decisions, verification, and human-agent collaboration rather
than preserving a raw conversation transcript.

Generated code is included verbatim when reasonably concise. Extensive
implementations are referenced through their canonical repository files.

> This file is an engineering collaboration record, not a source of truth for
> application behavior. The repository itself remains authoritative.

> Prior history: [PROMPT-HISTORY-2026-Q4-02.md](PROMPT-HISTORY-2026-Q4-02.md) (M5 through the UI refactor's U2),
> before it [PROMPT-HISTORY-2026-Q4.md](PROMPT-HISTORY-2026-Q4.md) (v2 sessions through M5),
> and [Prototype/V1-PROMPT-HISTORY.md](Prototype/V1-PROMPT-HISTORY.md), the v1 prototype's log.
>
> **Open action item** carried over: anti-cheat, server-authoritative score submission
> (raised 2026-10-28; see Interaction 12 of the 2026-10-28 session in the -02 archive).

---

## Session: 2026-10-28 (second)

**Objective:** Extend PLAN-UI.md with milestones that restyle the remaining pages after U2.

### Interaction 1 — Plan for restyling the other pages

**User Prompt**

> extend the plan-ui doc to restyle the other pages

**Agent Outcome**

- PLAN-UI.md gains a second decisions table, *The other pages*, and milestones **U3–U7** (all Planned). Steps get detailed when each milestone starts, as CLAUDE.md requires.
  - **U3:** the "before" baseline, the app-style deal, and Settings.
  - **U4:** Leaderboards and the shared `Leaderboard` table.
  - **U5:** Profile, including the AI insight panels.
  - **U6:** Play, covering the React around the canvas only.
  - **U7:** NotFound, the loading components, removing the unused `PagePlaceholder`, and a whole-app pass.
- The verification section adds the app-screen gates for U3–U6.
- **Rotated** `PROMPT-HISTORY.md` at 775 lines to [PROMPT-HISTORY-2026-Q4-02.md](PROMPT-HISTORY-2026-Q4-02.md). It's `-02` because the unsequenced `PROMPT-HISTORY-2026-Q4.md` predates the sequence rule and is effectively the first.

**Rationale**

- **App screens, not pages.** The taste-skill's `SKILL.md` splits work into pages (read) and app screens (worked in), and gives app screens their own run, draw (`draw.mjs --app`), house rules and `inspect.mjs --app`. Play, Leaderboards, Profile and Settings are app screens. NotFound is a page, so it takes U2's direction.
- **`--keep palette,type`.** The skill says a product's site and app share one palette and typeface, so U2's Unbounded and Onest carry over with the five themes.
- **Order by risk.** Settings is simplest and proves the tokens. Leaderboards builds the table Profile reuses. Play goes last because it sits beside the canvas.
- **Real data only.** The app run's "write a dataset" step becomes an inventory of the real data, since these screens render live `/api` data.

**Collaboration**

One decision is left open for the user, to settle when U5 starts. `inspect.mjs` has no option for a browser profile or cookies, so it can't reach Play and Profile behind Google sign-in. The recommendation is `lint.mjs`, tests, and the user's own screenshots. The alternative is a dev-only fixture route.

**Changes**

- [`PLAN-UI.md`](PLAN-UI.md): the *other pages* decisions, U3–U7 rows, U3–U7 verification, and the Scope row pointing to them.
- `PROMPT-HISTORY.md` → [`PROMPT-HISTORY-2026-Q4-02.md`](PROMPT-HISTORY-2026-Q4-02.md) (renamed), and this new file.

**Verification**

Documentation only, with nothing to run. Checked against the repo: the pages and components each milestone names, `PagePlaceholder` having no importers, the `Modal` backdrop blur, and the taste-skill 2.1.5 `SKILL.md`, `references/app-screens.md` and `inspect.mjs` flags.

### Interaction 2 — Plan committed; U3 started

**User Prompt**

> commit the plan and history, then start U3

**Agent Outcome**

- Committed the plan and the history rotation as `a17072a`.
- **Started U3 on the taste-skill's app-screen run,** after reading `references/app-screens.md` in full:
  - Recorded the "before" baseline: `inspect.mjs --app` on `/settings` and `/leaderboards`, and `lint.mjs --app` over all four screens (4 FAIL `micro-label`).
  - Dealt the app style. Only two dark styles suit the brief: *Data terminal* and *True-black flat*.

**Collaboration**

The user chose **Data terminal** (the recommendation): every selection is a 1px accent line exactly as wide as its label, and figures are tabular.

### Interaction 3 — U3: app style and Settings built

**Agent Outcome**

Settings is restyled as a settings screen:
- The theme list has live previews, and the active theme is shown large beside it.
- A "Set elsewhere" panel shows the current values of sound, reduced motion and increased contrast.
- The style's selection line is on the chosen theme and on the navbar's active link.

The full record (departures, as built, contrast table, before and after) is in [PLAN-UI.md](PLAN-UI.md#u3-detail).

**Rationale**

- **Kept U2's top bar** instead of the dealt icon rail. It's the shared shell, and four destinations don't need a rail.
- **Kept U2's square corners** instead of the sheet's 6px and pill radii, since `Button` and `Card` are shared with the landing page.
- **No mono face.** A script read Onest's GSUB table and found `tnum`, so figures can be tabular without a new dependency.
- **Light `--muted` darkened** from `#71717a` to `#6b6b74`. It measured 4.4:1 on `--bg`, and the new layout puts muted text on the ground.
- **Current values are read, not toggled.** The OS preferences come from a new `useMediaQuery` hook, and sound from `readStoredMute()`, now exported by `AudioManager`, which uses it too.

**Changes**

- New:
  - [`src/components/SettingsSection/SettingsSection.jsx`](src/components/SettingsSection/SettingsSection.jsx)
  - [`src/components/ThemePicker/ThemePreview.jsx`](src/components/ThemePicker/ThemePreview.jsx)
  - [`src/hooks/useMediaQuery.js`](src/hooks/useMediaQuery.js) and its test
  - [`src/pages/Settings.test.jsx`](src/pages/Settings.test.jsx)
- Edited:
  - `src/pages/Settings.jsx`, `ThemePicker.jsx`, `Navbar.jsx` and `game/AudioManager.js`;
  - `src/index.css` (the app type scale) and `src/styles/themes.css` (light `--muted`);
  - `ARCHITECTURE.md`, `README.md` and `PLAN-UI.md`.

**Verification**

- `npm run lint`, `format:check`, `test` (236, up from 231) and `build` pass.
- `lint.mjs --app`: 0 FAIL, 0 WARN.
- `inspect.mjs --app` on `/settings` (production build): 0 FAIL, 1 WARN. The WARN is `unused-canvas`, a false positive: the inspector measures the text of the visually hidden skip link.
- **Headless Chrome,** with a scratchpad script on the skill's CDP helper: all five themes screenshotted and the contrast of every pair computed. Arrow-key theme selection checked with the focus ring.
- **Not run:** the navbar's accent line signed in, and the Vercel preview.

### Interaction 4 — U3 approved and committed

**User Prompt**

> Browser checks passed. Mark U3 done, and commit it with the history

**Agent Outcome**

- All four of U3's browser checks passed in the user's browser. That covers the navbar's accent line signed in, which headless Chrome couldn't reach.
- U3 is marked Done in PLAN-UI.md and committed on `refactor/UI` with Interactions 2–4.
- U4 (Leaderboards) is next, once the user says to start it.

### Interaction 5 — U4: Leaderboards built

**User Prompt**

> start U4

**Agent Outcome**

Leaderboards is restyled in the *Data terminal* app style.

- **Page:** underline tabs on one rule, each view's window in words ("Resets Monday at 00:00 UTC"), and "Play a match" for signed-in players.
- **Table:**
  - Sentence-case headers, right-aligned tabular figures with separators, a new Reaction column, ISO dates, and a "You" tag on the player's own row.
  - A caption that states the board's finding ("A leads with 13,125 in Speed. You're 2nd of 2.").
  - Placeholder rows while loading, one sentence when empty, and Retry on an error.

The full record is in [PLAN-UI.md](PLAN-UI.md#u4-detail).

**Rationale**

- **Underline tabs instead of the sheet's count cards.** The four views are periods, not types, and counts would cost four queries.
- **Figures and the finding as pure functions** (`utils/leaderboardFormat.js`), so the table, the caption and the tests share one definition.
- **`reload()` as part of the request key,** so the hook keeps deriving its loading state with no setState inside effects.

**Attempted Approach / Resolution**

The gate's screenshots caught three layout bugs:
- **Padding:** `Card`'s `p-5` overrode the `p-0` passed to it, so the table now sits in a plain surface.
- **Column gap:** a `w-full` player column left a 440px gap, fixed with `table-fixed` and set widths.
- **Hidden tab line:** the tablist's `overflow-x-auto` clipped the selected tab's `-mb-px` accent line, so the rule moved inside the scroller.

**Changes**

- New:
  - [`src/utils/leaderboardFormat.js`](src/utils/leaderboardFormat.js) and its test
  - [`src/components/Leaderboard/LeaderboardRow.jsx`](src/components/Leaderboard/LeaderboardRow.jsx)
  - [`src/hooks/useLeaderboard.test.js`](src/hooks/useLeaderboard.test.js)
  - [`src/pages/Leaderboards.test.jsx`](src/pages/Leaderboards.test.jsx)
- Edited:
  - `src/components/Leaderboard/Leaderboard.jsx` and its test, `src/hooks/useLeaderboard.js` and `src/pages/Leaderboards.jsx`;
  - `README.md` (test count) and `PLAN-UI.md`.

**Verification**

- Lint, format check, tests (255, up from 236) and build pass.
- `lint.mjs --app`: 0 FAIL, 0 WARN.
- `inspect.mjs --app`: 0 FAIL, 3 WARN, each explained in PLAN-UI:
  - the skip-link false positive;
  - the space between a two-row board and the footer.
- **Headless Chrome:** the empty, signed-out, error, loading and retried states (request interception), and all five themes.
- **Not run:** the signed-in paths, Profile's Best Matches, and the Vercel preview. They're listed as user checks.

### Interaction 6 — U4 approved and committed

**User Prompt**

> browser checks passed. commit U4

**Agent Outcome**

- The user reported that U4's browser checks passed. That covers the signed-in paths and Profile's Best Matches through the new table, which headless Chrome couldn't reach.
- U4 is marked Done in PLAN-UI.md and committed on `refactor/UI` with Interactions 5–6.
- U5 (Profile) is next. It opens with the open decision on how to check the signed-in screens.

### Interaction 7 — U5: Profile built; signed-in check settled

**User Prompt**

> start U5 with the recommended approach

**Agent Outcome**

- **Settled the open decision.** Play and Profile are checked with `lint.mjs`, Testing Library and the user's own signed-in screenshots. The dev-only fixture route was rejected.
- **Profile now follows the sheet's `detail` pattern:**
  - **Header:** the player as the page header (avatar, name as the h1, "Playing since … · N matches", Play a match).
  - **Stats:** a divided stats strip with honest zeros and dashes.
  - **Best matches:** shown through a new personal variant of U4's table, with Mode instead of a repeated Player column.
  - **AI recommendations:** their panels restyled with the footer pinned so they end level.
- **Placeholders and Retry** replace the full-page spinner and the static error line.

The full record is in [PLAN-UI.md](PLAN-UI.md#u5-detail).

**Rationale**

- **The personal variant applies to the Leaderboards Personal Best tab too,** since every row there is the same player.
- **No finding caption on Profile:** the stats strip already shows the highest score.
- **`StatStrip` is new rather than a restyled `StatTile`,** because the HUD still uses `StatTile` and is U6's.

**Changes**

- New:
  - [`src/components/StatStrip/StatStrip.jsx`](src/components/StatStrip/StatStrip.jsx)
  - [`src/utils/profileStats.js`](src/utils/profileStats.js) and its test
  - [`src/hooks/useUserProfile.test.js`](src/hooks/useUserProfile.test.js)
  - [`src/pages/Profile.test.jsx`](src/pages/Profile.test.jsx)
- Renamed: `ProfileCard/ProfileCard.jsx` → [`ProfileHeader/ProfileHeader.jsx`](src/components/ProfileHeader/ProfileHeader.jsx), rewritten.
- Edited:
  - `Profile.jsx`, `Leaderboard.jsx`, `LeaderboardRow.jsx`, `InsightPanel.jsx`, `HardwareInsight.jsx`, `PlatformInsight.jsx` and `useUserProfile.js`;
  - `index.css` (`text-figure`), `ARCHITECTURE.md`, `README.md` (test count) and `PLAN-UI.md`.

**Verification**

- Lint, format check, tests (267, up from 255) and build pass.
- `lint.mjs --app`: 0 FAIL, 0 WARN.
- **Not yet done:** the user's signed-in screenshots and their critique.

### Interaction 8 — U5 screenshots reviewed; phone nav fixed; Best matches scrolls

**User Prompt**

> screenshots added. Something to note: with a width of 390px, the nav bar buttons are not displaying appropriately; settings cannot be selected.
>
> When a user have a numerous amount of games matches played, their "best matches" section should be scrollable past 5 matches

**Agent Outcome**

- **Critiqued the user's seven screenshots against app-screens §2.7.** The figures agree: 8,560 is the top row, 5 matches match 5 rows, and 88.8% is the mean of the five accuracies. The edges line up at every width.
- **Phone nav:**
  - **Cause:** the links row scrolled sideways, with no visible scrollbar, beside the account controls.
  - **Fix:** below `sm` the bar wraps into two rows, with the four links edge to edge and 44px tall.
  - The landing hero now sizes to a `--nav-h` token that a CSS `:has()` rule raises when that row exists.
- **Best matches** shows 5 rows and half of the sixth, then scrolls inside its frame under the sticky header. The frame is a named, focusable region. A new `useRowCap` hook measures the rows, because their height varies with wrapping.

**Rationale**

- **Two rows instead of a menu or a bottom bar,** because four short links fit at 320px once they have their own row.
- **`useRowCap` writes `max-height` directly** rather than holding it in state, because the value only feeds layout and the repo avoids setState inside effects.

**Changes**

- New: [`src/hooks/useRowCap.js`](src/hooks/useRowCap.js) and its test.
- Edited:
  - `Navbar.jsx`, `landing/Hero.jsx` and `index.css` (`--nav-h`);
  - `Leaderboard.jsx` and its test (`visibleRows`, `label`);
  - `Profile.jsx` and `PLAN-UI.md`.

**Verification**

- Lint, format check, tests (270, up from 267) and build pass.
- **The signed-in bar's layout,** checked in headless Chrome on a static copy of its markup with the built CSS, at 320, 390, 640 and 1440: every link is on screen, and `--nav-h` matches the bar's real height.
- **Not run:** the scrolling with real data (the user has 5 matches), and the signed-in phone nav in the real app. Both are listed as user checks.

**Collaboration**

The user found the phone nav bug in their own screenshots, which headless runs couldn't reach signed in, and asked for the scrolling Best matches.

### Interaction 9 — U5 approved and committed

**User Prompt**

> browser checks passed. commit U5

**Agent Outcome**

- The user reported that U5's browser checks passed: the phone nav, the landing hero at 390 signed in, and Best matches scrolling past five.
- U5 is marked Done in PLAN-UI.md and committed on `refactor/UI` with Interactions 7–9.
- U6 (Play) is next.

### Interaction 10 — U6: Play built

**User Prompt**

> all commits pushed, the working tree is clean. Execute U6

**Agent Outcome**

Play is restyled in the *Data terminal* app style, with no engine changes.
- **Tabs:** a shared `Tabs` component (underline tabs that wrap instead of scrolling) replaces `ModePicker` and Leaderboards' own tab row.
- **HUD:** it runs on `StatStrip` and shows the round's starting values before the first snapshot, so the canvas no longer shifts as a match starts.
- **Canvas:**
  - The overlays lose their blur, and the idle overlay names the round in words.
  - A new `solid` button (ink fill) is the screen's one primary: Start match, Resume, Play again.
- **Results dialog:** it leads with a 32px final score and lists the stats as sentence-case rows.
- **Session history:** it uses U4's table rules and keeps its frame when empty.

The full record is in [PLAN-UI.md](PLAN-UI.md#u6-detail).

**Rationale**

- **Wrapping tabs:** six mode names don't fit across 390px, and a sideways scroller hid the U5 nav's last link.
- **Shared modules:** `ReactionTime` and `styles/table.js` give the leaderboard and the session history one definition for their cells, folding and reaction times.

**Attempted Approach / Resolution**

- **Symptom:** a 390px headless check of Leaderboards (after the move to `Tabs`) showed the Player header clipped to "Playe" in the error state.
- **Cause:** the message row's `colSpan={7}` gave the fixed-layout table seven columns while only three were visible. The bug dated from U4, whose state screenshots were all at 1440.
- **Fix:** the empty and error sentences now sit below the table in both tables, which restores the column at 206px.

**Changes**

- New:
  - [`src/components/Tabs/Tabs.jsx`](src/components/Tabs/Tabs.jsx), [`src/components/ReactionTime/ReactionTime.jsx`](src/components/ReactionTime/ReactionTime.jsx) and [`src/styles/table.js`](src/styles/table.js);
  - tests for `Tabs`, `ResultsModal` and `SessionHistory`.
- Deleted: `src/components/ModePicker/` and `src/components/StatTile/`.
- Edited:
  - `Play.jsx`, `Leaderboards.jsx`, `GameArea.jsx`, `GameHud.jsx` and its test, `StatStrip.jsx`, `Modal.jsx`, `ResultsModal.jsx`, `SessionHistory.jsx`, `Leaderboard.jsx`, `LeaderboardRow.jsx` and `Button.jsx`;
  - `index.css` (`text-answer`), `README.md` (test count) and `PLAN-UI.md`.

**Verification**

- Lint, format check, tests (277, up from 270) and build pass.
- `lint.mjs --app`: 0 FAIL, 0 WARN.
- **Headless Chrome on Leaderboards, signed out:** the tabs carry the accent line, and the board's column widths are right at 390.
- **Not yet done:** the user's signed-in screenshots of Play.

### Interaction 11 — U6 screenshots taken with a faked session; four fixes

**User Prompt**

> use a faked session in headless chrome

**Agent Outcome**

- **The agent now takes the signed-in screenshots,** replacing the user-screenshot method for U6. It runs headless Chrome on the production build and intercepts two kinds of request:
  - **Session:** the Neon Auth SDK's one session call (`get-session`) returns a stand-in player. The SDK reads `session.token` for the JWT that `/api` calls send.
  - **Score saves:** `POST /api/scores` gets a local 201.
  - **Effect:** no credentials, no repo code, and nothing reaches the database.
- **Driving the page:** targets are found by their colour in the canvas pixels and clicked with real mouse events. Dark and Light at 1440, 768 and 390, through idle, mid-match, paused, results and the session table: six runs, all clean.
- **Fixes from the screenshots:**
  - **Dialog ring:** the unlayered global `:focus-visible` framed the results dialog; it moved to `@layer base`.
  - **Stale HUD:** between matches the HUD showed the last match; it now shows the next round's starting values.
  - **Phone shift:** at 390 the controls row wrapped when Pause and Restart appeared, shifting the canvas; the controls now take their own line.
  - **Wrapping text:** the "When" and "Max combo" cells wrapped; they're now `nowrap`.
  - **Copy:** one em dash left the Gridshot hint.

**Attempted Approach / Resolution**

- **First try:** the fake session was rejected, and the page redirected home.
- **Cause:** a credentialed CORS preflight can't accept `Access-Control-Allow-Headers: *`.
- **Fix:** echoing the requested headers back signed the page in.

**Changes**

- Edited: `index.css`, `GameArea.jsx`, `SessionHistory.jsx`, `styles/table.js` and `PLAN-UI.md`.
- The scripts live in the agent's scratchpad, not the repo.

**Verification**

- Lint, tests (277) and build pass.
- **The canvas's top edge,** measured idle and running, is unchanged at 390, 768 and 1440.
- The six-run screenshot set was retaken on the final build.

**Collaboration**

The user chose the faked session over driving their own signed-in Chrome.

### Interaction 12 — U6 approved and committed

**User Prompt**

> browser checks passed. commit U6

**Agent Outcome**

- The user reported that U6's browser checks passed on their real account: a match saved, and the phone controls row held still at match start.
- U6 is marked Done in PLAN-UI.md and committed on `refactor/UI` with Interactions 10–12.
- U7 (NotFound, shared states and the final pass) is next.

---

## Session: 2026-10-29

**Objective:** Execute U7: NotFound, the shared loading states, and the whole-app final pass.

### Interaction 1 — U7 built and verified; stopped at the review gate

**User Prompt**

> working tree is clean. execute U7

**Agent Outcome**

- **U7's steps** written into PLAN-UI.md first. NotFound takes U2's *Loud and flat* sheet without a redeal, because the skill's "single section" case matches the surrounding design. The loading states take U3's *Data terminal* §11 rules.
- **NotFound:**
  - The landing hero's waterline device, with "404 / Missed" as the headline.
  - The sentence and **Back to home** sit under it.
  - The warm-up target panel is pinned on the seam at the right from `md`.
  - Hero's headline moved into a shared `WaterlineHeadline` rather than being copied.
- **Loading:**
  - `LoadingScreen` is now the title row in grey bars with a delayed fade-in, used by both Suspense and `ProtectedRoute`.
  - `LoadingSpinner` is a quiet ink ring, left only inline in InsightPanel.
- **Removed:** `PagePlaceholder/`.
- **Docs:** a Styling paragraph and updated rows in ARCHITECTURE.md, and a UI-refactor paragraph, the test count and the bundle size in README.md.

**Attempted Approach / Resolution**

- **First NotFound build:** the sentence sat at the foot of the field, and the "Back to home" button sat inside a panel that ran past the first screen. The inspector also failed `still-page` (5 moving elements).
  - **Fix:** the sentence and button now sit under the headline. The panel moved onto the seam, and its parts rise in a stagger (`WarmupTarget`'s new `riseIn`, and `--rise` on `.rise-in`), which brought the count to 9.
- **At 768:** the in-flow panel left the right half empty, so the pinning starts at `md`, not `lg`.
- **Rejected:** rendering two panels, one per breakpoint. That meant duplicate state and a duplicate button in the DOM.
- **Page lint:** it flagged the navbar's accent selection line as a hairline. It carries `taste-skill-ignore` now: it's the app style's one mark, and the app lint has always passed it.

**Changes**

- New: `components/landing/WaterlineHeadline.jsx`, `pages/NotFound.test.jsx`.
- Edited: `NotFound.jsx`, `Hero.jsx`, `WarmupTarget.jsx`, `LoadingScreen.jsx`, `LoadingSpinner.jsx`, `ProtectedRoute.jsx`, `Navbar.jsx` (comment only), `index.css`, `App.test.jsx`, `PLAN-UI.md`, `ARCHITECTURE.md`, `README.md`.
- Deleted: `components/PagePlaceholder/`.
- The check scripts (`app-pass.mjs`, `sheet.mjs`, `loading-shot.mjs`) live in the agent's scratchpad, not the repo.

**Verification**

- Lint, format check, tests (280, up from 277) and build pass.
- `lint.mjs`: 0 FAIL on the page and app source.
- `inspect.mjs`: 0 FAIL on `/`, the 404, `/settings` and `/leaderboards`. The WARNs are listed and explained in PLAN-UI.md.
- **Headless Chrome, signed in through U6's faked session** (Profile's reads answered locally):
  - All six screens in all five themes, with no console errors.
  - Reduced motion leaves nothing hidden.
  - Increased contrast switches each theme's muted and edge colours.
  - The 404's target records a hit.
  - With the session held, the loading frame sits at the h1's position.
- **Bundle:** entry chunk 3.62 kB gzip (3.44 at U2), CSS 8.27 kB.
- **Not run:** the Vercel preview (it needs the user's push), and a real Google sign-in.

**Collaboration**

- U7 stopped at the review gate and is uncommitted.
- Five browser checks for the user are listed under U7 verification in PLAN-UI.md.

### Interaction 2 — U7 approved and committed

**User Prompt**

> browser checks passed. commit U7

**Agent Outcome**

- The user reported that U7's browser checks passed.
- U7 is marked Done in PLAN-UI.md and committed on `refactor/UI` with this session's history. Every milestone, U0–U7, is now done.
- **Left to the user:** pushing `refactor/UI`, then checking the Vercel preview.

### Interaction 3 — PR body for `refactor/UI` → `main`

**User Prompt**

> write the PR body for refactor/UI into main; I will conduct it via the browser

**Agent Outcome**

- **The body:** written to the agent's scratchpad (`PR-refactor-UI.md`) for the user to paste when opening the PR on GitHub. It follows the `pr` skill's template:
  - **Summary:** the route-gate diff, the two styles, the file tree and the two new font dependencies.
  - **Evidence:** before and after inspector results, with the local screenshot paths to drag in. Tests went from 193 to 280, and the bundle compares against `main`.
  - **Merge Danger:** a two-way door with a UI-wide blast radius.
- **Also noted in the body:** the branch carries one docs-only v2 commit (`de1ac72`), and the Vercel preview of this branch is still unchecked.
- The PR wasn't opened by the agent. This entry is uncommitted.

---

## Session: 2026-10-29 (second)

**Objective:** Take a situation report of the repository against its plans after the UI refactor merged.

### Interaction 1 — SITREP after the `refactor/UI` merge

**User Prompt**

> /prompt-history /sitrep

**Agent Outcome**

- **Read-only report**, no code changed. `main` is clean and level with `origin/main` at `e19a821` (PR #2, `refactor/UI` merged).
- **Against plan:** PLAN-V2.md M0–M9 and PLAN-UI.md U0–U7 are all marked Done; `refactor/UI` has no commits beyond `main`.
- **Open items found:**
  - The Vercel preview / production check for the restyle is still listed as not run in PLAN-UI.md's U7 verification (user check 5).
  - No plan file covers the next work. README's "Which features considered next?" list leads with server-authoritative scoring, the open action item carried in this file's header.
- **Verification:** code and docs inspected; tests not run.

### Interaction 2 — Plan for server-checked scoring, from an audit

**User Prompt**

> We are going to address the open action item; move the current changes onto branch `hotfix/server-checked-scoring` to leave main unchanged.
>
> Here is an audit report supplied by a trusted source: *(a black-box security and architecture audit of the deployed app: F1, High, `POST /api/scores` trusts client-computed scores "without … strict bounds checking"; F2, Medium, API routes lack server-side schema validation; remedies: Zod on every route and server-side telemetry verification)*
>
> write a plan to address the vulnerabilities

**Agent Outcome**

- **Branch:** `hotfix/server-checked-scoring` created from `main` with Interaction 1's uncommitted entry; `main` is unchanged.
- **Audit checked against the code** before planning:
  - **F1 holds**, in part: bounds exist (`scoreInput.js` and the `CHECK`s) but are mode-blind sanity limits, so 9,999,999 passes them.
  - **F2 doesn't hold:** every route already validates its input with tested pure functions (`parseSetup` bounds DPI and enumerates polling rates).
  - The one real validation gap found: `readJson` has no body-size limit.
- **PLAN-SCORING.md** (new), milestones S0–S5. The server issues a match (`POST /api/matches`) and computes the score itself from the match's event log, with a shared pure `scoreEvents` in `src/game/scoring.js`. Plausibility checks come from each mode's spawn configuration plus wall-clock time since the match was issued.
- **Rejected:**
  - Zod: a dependency that adds no check the existing validators lack.
  - Full deterministic replay: an engine rewrite, and a bot can still forge input.
  - Bounds only: a cheater would just post each mode's maximum.
  - A signed JWT ticket: a second secret, and single use still needs a table.
- **Stated limit:** this makes impossible scores unrepresentable; it doesn't prove a human played.
- **Open for the user at S0:** what to do with legacy rows that have no `match_id`, and whether to accept breaking old clients on deploy.
- **Verification:** none run; this is a plan, built from reading `api/`, `src/game/` and `db/migrations/`.

### Interaction 3 — S0: choices settled, docs updated; stopped at the review gate

**User Prompt**

> go with both recommendations; execute S0

**Agent Outcome**

- **Settled** in PLAN-SCORING.md's new "Settled at S0" table:
  - **Legacy rows stay** on the boards. S5's read-only report lists any that fail the new bounds, for the user to delete in the Neon Console.
  - **The old client's body is rejected** once S4 deploys, with no legacy submission path.
- **CLAUDE.md:**
  - PLAN-SCORING.md leads the document list. PLAN-UI.md stays listed, marked done, for its design rules.
  - The workflow names `hotfix/server-checked-scoring`.
  - The gameplay stack row no longer says the engine is unchanged from v1.
- **PLAN-SCORING.md:** S0 is at Review, with an S0 detail and verification section.

**Verification**

- Docs only, so lint, tests and build weren't run.
- `npm run format:check` passes, but `.prettierignore` excludes `*.md`, so it doesn't check these files.
- CLAUDE.md's document links resolve.

**Collaboration**

- S0 stopped at the review gate. Nothing is committed: `CLAUDE.md`, `PROMPT-HISTORY.md` and the new `PLAN-SCORING.md` are uncommitted on `hotfix/server-checked-scoring`.

### Interaction 4 — S0 approved and committed

**User Prompt**

> commit S0

**Agent Outcome**

- S0 is marked Done in PLAN-SCORING.md and committed on `hotfix/server-checked-scoring` with this session's history.
- **Next:** S1, the shared scoring function and the client's event log, when the user says so.

---

## Session: 2026-10-29 (third)

**Objective:** S1 of PLAN-SCORING.md: the shared scoring function and the client's match event log.

### Interaction 1 — SITREP before S1

**User Prompt**

> /sitrep

**Agent Outcome**

- **Read-only report**, no code changed. The branch is clean and in sync with `origin/hotfix/server-checked-scoring`. S0 is done; S1–S5 aren't started, and the code agrees (no `scoring.js`, no `readJson` limit, migrations stop at `003`).
- **Found:** PLAN-SCORING.md's Workflow said the branch had no upstream, but it already tracks one.
- **Verification:** code inspected; tests not run.

### Interaction 2 — S1: shared scoring and the event log; stopped at the review gate

**User Prompt**

> execute S1

**Agent Outcome**

- **`src/game/scoring.js`** (new): `targetValueAt(mode, spawnedAtMs)`, `applyEvent(scores, mode, event)` and `scoreEvents(mode, events)`. It loads in plain Node, so `/api` can import it in S4.
- **`GameSession`** logs `{ t, kind, spawnedAt? }` for every hit, miss and expiry through `record`, which scores the event via `applyEvent`. Its game-over summary is `scoreEvents`' replay of the log, plus the log as `events`.
- **Clicks and expiries are stamped before the frame advances time.** A hit's `t − spawnedAt` then equals its target's age, and a timed mode's `t` never passes its duration.
- **A target's value lives only in `targetValueAt`:** `Spawner.targetValue` and `Target.value` were removed, and targets carry `spawnedAt` instead.
- **`ScoreManager.registerHit(value, reactionMs)`** replaces `registerHit(target)`.
- **`readJson`** has a 16 KB default limit, overridable per route, and answers 413 past it.
- PLAN-SCORING.md: S1 is at Review, with an S1 detail section, and the stale upstream line is fixed. ARCHITECTURE.md's engine table lists `scoring.js`.

**Rationale**

- The live HUD and the replay share `applyEvent`, and the target value has a single definition. Client and server would otherwise each compute a score and could drift apart.
- `targetValueAt` takes ms, not the plan's seconds, so it uses the log's own unit.

**Changes**

- New: [`src/game/scoring.js`](src/game/scoring.js), [`src/game/scoring.test.js`](src/game/scoring.test.js), [`src/game/GameSession.test.js`](src/game/GameSession.test.js).
- Changed: `GameSession.js`, `ScoreManager.js` and its test, `Spawner.js`, `Target.js`, `api/_lib/http.js` and its test, `ARCHITECTURE.md`, `PLAN-SCORING.md`.

**Verification**

- `npm run lint`, `npm run format:check`, `npm test` (306 tests) and `npm run build` pass.
- Scripted Gridshot and Survival sessions (Survival past its 90 s ramp) reproduce the live HUD's figures from the log.
- Not run: a hand-played match in the browser.

**Collaboration**

- Stopped at the review gate; nothing is committed.

### Interaction 3 — S1 approved and committed

**User Prompt**

> browser check passes: result screen shows identical score as final HUD. commit S1

**Agent Outcome**

- S1 is marked Done in PLAN-SCORING.md. Its verification now records the user's browser check in place of "not run".
- S1 is committed on `hotfix/server-checked-scoring` with this session's history.
- **Next:** S2, the plausibility checks in `api/_lib/matchCheck.js`, when the user says so.

**Verification**

- The user hand-played a match in the browser: the results screen's score matched the final HUD's.

### Interaction 4 — S2: plausibility checks built; paused for calibration logs

**User Prompt**

> Pushed, working tree is clean. Execute S2

**Agent Outcome**

- **`api/_lib/matchCheck.js`** (new, pure): `checkMatch({ mode, events, elapsedMs })` returns the names of the failed rules. The rules are `order`, `expiry`, `hitTiming`, `spawnRate`, `clickRate`, `reaction`, `duration`, `tooEarly`, `missLimit` and `clock`.
- **`src/game/difficulty.js`** (new): Survival's ramp, `rampProgress` and `settingAt(mode, setting, base, ms)`, moved out of `GameSession.applyDifficulty`. `targetValueAt` uses it too, so the server checks a log against the engine's exact lifespans and spawn intervals.
- **`spawnRate` replaces the plan's hit-count bound.** The Spawner waits a full interval after each spawn, so the hit targets' spawn times, sorted, are at least the interval in force at the later one apart. That's stricter than the count bound, and it also catches a target hit twice.
- **`src/game/testing/playMatch.js`** (new, test-only): a scripted player, with a 0.3 s minimum reaction, that both `GameSession.test` and `matchCheck.test` use.
- **Calibration:** a temporary dev-only `window.matchLogs` collector in `GameArea`, to be removed before review. The thresholds are still the plan's starting values.

**Verification**

- `matchCheck.test.js` has 22 tests: a played match in each mode passes, and each rule fails by name on a mutated or fabricated log, including a 9,999,999 one. The randomized match tests passed on 15 of 15 reruns.

**Collaboration**

- Waiting for the user to play real matches and export their logs.

### Interaction 5 — S2 calibrated against real matches; stopped at the review gate

**User Prompt**

> logs saved to api/_lib/fixtures/real-matches.json

**Agent Outcome**

- **All six real matches** (one per mode) pass every rule.
  - Peak click rate: 8/s against the cap of 15.
  - Lowest average reaction: 648 ms against the floor of 120 ms (fastest single hit 366 ms).
  - **Thresholds unchanged:** they target inhuman logs, and one player's data can't justify tightening them toward faster players.
- **The 1 ms rounding slack is needed:** two of the real Survival match's hit spawns were 0.01 ms closer than the spawn interval.
- **The real logs became the test fixture.** `matchCheck.test.js` passes each one, and checks that the fixture covers every mode. `api/_lib/fixtures` is in `.prettierignore`, so the file stays as exported.
- **The temporary `window.matchLogs` collector was removed.** `GameArea.jsx` has no diff against the S1 commit.
- **Also added:** `difficulty.test.js`; ARCHITECTURE.md lists `difficulty.js` and `matchCheck.js`; PLAN-SCORING.md has S2 at Review, with a rule table and calibration notes.

**Verification**

- `npm run lint`, `npm run format:check`, `npm test` (339 tests) and `npm run build` pass.
- The wall-clock tolerance is still uncalibrated. It needs S3's `started_at`, and is checked in S4.

**Collaboration**

- The user played the calibration matches and exported the logs. The thresholds come from their data.
- Stopped at the review gate; nothing is committed.

### Interaction 6 — S2 approved and committed

**User Prompt**

> commit S2

**Agent Outcome**

- S2 is marked Done in PLAN-SCORING.md and committed on `hotfix/server-checked-scoring` with this session's history.
- **Next:** S3, the `matches` table and `POST /api/matches`, when the user says so.

### Interaction 7 — S3: matches table and `POST /api/matches`; stopped at the review gate

**User Prompt**

> execute S3

**Agent Outcome**

- **`004_matches.sql`:** the `matches` table (uuid id, user, mode, `started_at`, `expires_at`, `submitted_at`, with `CHECK`s) and `scores.match_id`.
  - **Deviation from the plan:** a composite foreign key `(match_id, user_id, mode)` → `matches`, in place of a plain `match_id` reference. The database itself then refuses a score whose player or mode differs from its match's.
- **New modules:**
  - `matchPolicy.js`: the limit, ticket lifetimes and the body parser.
  - `rateLimit.js`: the window arithmetic, extracted from `insightPolicy.js`, which now uses it.
  - `matchStore.js`, wired in `db.js`.
  - `matchIssue.js`: the 20-per-10-minutes limit, a 429 with `Retry-After`.
  - The route `api/matches.js`, and `services/matches.js` (`startMatch`), which nothing calls yet.
- **Docs:** ARCHITECTURE.md has the route, the store and the data model. PLAN-SCORING.md has S3 at Review, with two notes for S4:
  - `scores.js` must check the constraint name once scores carry a `match_id`.
  - `004` must be applied to Neon before S4 deploys.

**Rationale**

- Elapsed time is computed from the database's clock at both issue and submit, so there's no Vercel/Neon clock skew.
- Modes are stored as labels, like `scores`, so S4 inserts the match's own mode and the composite key holds.

**Verification**

- `npm run lint`, `npm run format:check`, `npm test` (360 tests) and `npm run build` pass.
- PGlite, in a scratch directory, ran migrations `001`–`004` on a stub `neon_auth."user"`. 18 checks passed: the `CHECK`s; the composite key rejecting another mode, another player or an unknown match; `unique` rejecting a second score for one match; a legacy null `match_id` still inserting; the 21st issue refused; deleting a user cascading cleanly.
- Not run: the route under `npm run dev:full`, which needs `004` applied to Neon.

**Collaboration**

- Stopped at the review gate; nothing is committed. The migration hasn't been applied to Neon; that's the user's step.

### Interaction 8 — S3 approved and committed; `004` applied to Neon

**User Prompt**

> 004 applied, commit S3

**Agent Outcome**

- The user applied `004_matches.sql` to Neon. PLAN-SCORING.md records it, and marks S3 Done.
- S3 is committed on `hotfix/server-checked-scoring` with this session's history.
- **Next:** S4, which moves `POST /api/scores` onto matches and has the client request a match on Start, when the user says so.

### Interaction 9 — S4: scores computed on the server from matches; paused for the manual checks

**User Prompt**

> Pushed, execute S4

**Agent Outcome**

- **`POST /api/scores` now takes `{ matchId, events }`.** `scoreInput.js` checks the shape; `matchSubmit.js` loads the caller's match (404 / 409 / 410), runs `checkMatch` with the database's elapsed time (400 naming the rules), and scores the log under the match's own mode.
- **One statement claims and saves.** `scoreStore.insertForMatch` claims the match and inserts the score together (`with claimed as (update …) insert … select … from claimed`), so a replay finds nothing to claim.
  - **Deviation from the plan:** not a multi-statement transaction. Neon's HTTP driver can't run `checkMatch` inside one, so the check runs first.
- **Client:**
  - `useMatchSave` requests a ticket on Start, in parallel with the engine, and redeems it at game over.
  - Restart keeps the round's ticket, so restarts don't use up the 20-per-10-minutes limit.
  - New results statuses: `unregistered` and `rejected`.
- `api/scores.js` maps only `scores_user_id_fkey` violations to 401.
- ARCHITECTURE.md's routes and "Saving a match" flow are rewritten. The Security note and the README are left for S5.
- **Known limit recorded in the plan:** a player can resubmit one of their own real logs under a fresh ticket, which duplicates a score but can't raise it.

**Verification**

- `npm run lint`, `npm run format:check`, `npm test` (380 tests) and `npm run build` pass.
- PGlite, with the real stores and handlers, passed 16 checks: a real save with the computed score (ignoring `score: 9999999`), a replay 409, foreign/unknown 404, extra hits 400 `[spawnRate]`, a too-early Gridshot 400, an expired 410, the match's mode stored, a real Survival save.
- Pending: the user's manual checks under `npm run dev:full`.

**Collaboration**

- Paused for the user to run the manual checks; nothing is committed.

### Interaction 10 — S4 manual checks passed; approved and committed

**User Prompt**

> all manual checks pass, commit S4

**Agent Outcome**

- **The user's manual checks passed** under `npm run dev:full`, signed in:
  - a real match in each mode saved, with the stored score equal to the results screen's
  - replay → 409
  - `score: 9999999` on a fresh ticket → the computed score stored
  - doubled hits → 400 `[spawnRate]`
  - a Gridshot submit straight after issue → 400 `[tooEarly]`
  - the old client's body → 400
- S4 is marked Done in PLAN-SCORING.md with these results, and committed on `hotfix/server-checked-scoring` with this session's history.
- **Next:** S5, the legacy-row report and the docs (ARCHITECTURE Security note, README next features, audit response), when the user says so.

**Verification**

- The user ran the manual checks. The Vercel preview and production aren't checked yet; they need the push.
