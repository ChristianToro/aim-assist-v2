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
