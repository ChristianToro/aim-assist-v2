# Prompt History

This document records meaningful development interactions between the user and
AI coding agents working on this project. It focuses on requests, outcomes,
implementation decisions, verification, and human-agent collaboration rather
than preserving a raw conversation transcript.

Generated code is included verbatim when reasonably concise. Extensive
implementations are referenced through their canonical repository files.

> This file is an engineering collaboration record, not a source of truth for
> application behavior. The repository itself remains authoritative.

> Prior history: [Prototype/V1-PROMPT-HISTORY.md](Prototype/V1-PROMPT-HISTORY.md),
> the v1 prototype's log, in a different format. This file covers v2 only.

---

## Session: 2026-10-26

**Objective:** Kick off the v2.0 revamp: branch, archive the v1 docs, and plan the Firebase/Pages → Neon/Vercel migration plus the AI features.

### Interaction 1 — v2.0 kickoff and planning

**User Prompt**

> This is a clone of a previous project owned by me that will be revamped and expanded. Refer to the PLAN-CONVERSION.md file as to the trajectory of the changes.
>
> This application will move away from a Github pages deployment that is using Firebase and Firestore and will adopt Vercel as deployment and Neon for database services.
>
> Users will still utilize Google for authentication. Other UI and functionality changes will take place later in separate branches as features.
>
> An AI API (Anthropic) will be used to: (1) assess user scores to recommend hardware adjustments--mouse DPI, etc, and (2) recommend gaming platforms based on their score.
>
> The PROJECT-PLAN, PROMPT-HISTORY, CLAUDE and ARCHITECTURE md files are to be placed in their own directory marked "Prototype"; retitle the file names to ensure future Claude sessions refer to the correct md files for the revamp.
>
> Code execution will be conducted in small milestones to be reviewed before a commit and approval to move to the next milestone.
>
> work will take place on git branch 'release/v2.0'

**Agent Outcome**

In plan mode, read `PLAN-CONVERSION.md` and the Firebase touchpoints, then asked four clarifying questions. Drafted a plan with Milestone 0 (the docs reorg) and a v2 roadmap (M1–M9): Vercel hosting → Neon schema → Better Auth server → auth client → data API → client switchover and Firebase removal → AI hardware recommendations → AI platform recommendations → docs.

**Rationale**

Auth is split into a server milestone and a client milestone ahead of the data API, because every `/api` endpoint needs session identity once Firebase Auth goes away. The `useAuth()` shape (`uid`, `displayName`, `photoURL`) is kept so pages and hooks don't change. The AI features come after the data API because they consume server-side score aggregates.

**Collaboration**

The user made these calls through the clarifying questions:

- **Remove Firebase fully.** This overrides PLAN-CONVERSION's recommended hybrid that kept Firebase Auth.
- **Reset the Firestore data.** Starting empty removes the uid-matching problem a full auth swap would otherwise create.
- **Use a `V1-` prefix** for the archived docs.
- **Build the AI features as milestones on `release/v2.0`**, not on separate feature branches.

### Interaction 2 — Plan saved to the repo; Milestone 0 executed

**User Prompt**

> write this plan as PLAN-V2.md into the root of the repository, and execute in manual mode

**Agent Outcome**

Executed M0 on the new branch `release/v2.0`, created from local `main` (`bdcf5f0`) with no upstream. The work stops at the review gate, uncommitted.

**Rationale**

`PLAN-V2.md` now serves as the v2 project plan and milestone tracker, so there's no separate `PROJECT-PLAN.md` duplicating the roadmap. The archived `CLAUDE.md` was renamed, not just moved, because Claude Code auto-loads any file named `CLAUDE.md` in a subdirectory it works in. The new `CLAUDE.md` keeps the v1 git rules but fixes the push refspec to name the real remote, `origin`, where v1 had said `test`.

**Changes**

- `CLAUDE.md` → [`Prototype/V1-CLAUDE.md`](Prototype/V1-CLAUDE.md) (renamed with `git mv`, with an archive banner added under the title)
- `ARCHITECTURE.md` → [`Prototype/V1-ARCHITECTURE.md`](Prototype/V1-ARCHITECTURE.md) (same)
- `PROJECT_PLAN.md` → [`Prototype/V1-PROJECT-PLAN.md`](Prototype/V1-PROJECT-PLAN.md) (same)
- `PROMPT-HISTORY.md` → [`Prototype/V1-PROMPT-HISTORY.md`](Prototype/V1-PROMPT-HISTORY.md) (same)
- [`CLAUDE.md`](CLAUDE.md) — new v2 agent instructions: doc map, review-gate workflow, stack, ownership, security rules, condensed coding standards, and git rules.
- [`PLAN-V2.md`](PLAN-V2.md) — new: the plan, a Decisions table, and the milestone tracker.
- [`PROMPT-HISTORY.md`](PROMPT-HISTORY.md) — new: this file.
- [`README.md`](README.md) — the three doc links now point at `Prototype/V1-*`.
- [`PLAN-CONVERSION.md`](PLAN-CONVERSION.md) — newly tracked, content unchanged.

**Verification**

- `git rev-parse --abbrev-ref release/v2.0@{upstream}` → `fatal: no upstream configured`.
- `npm ci`, then `npm run lint` (clean) and `npm test` (72 tests in 15 files passed). `node_modules` was absent in the fresh clone.
- `git status` shows the four renames. Root docs and the README were grepped for links to the old paths.

**Collaboration**

The user reviewed M0 and approved it ("make the one commit and use the suggested message"). It was committed as a single commit on `release/v2.0` titled "Archive v1 docs to Prototype/ and add v2 plan, CLAUDE.md, and prompt history". M0 is marked Done in PLAN-V2.md.

---

## Session: 2026-10-27

**Objective:** Resume v2.0 work with a status check of the repo against PLAN-V2.md, then execute M1 (Vercel hosting).

### Interaction 1 — SITREP before M1

**User Prompt**

> /prompt-history /sitrep

**Agent Outcome**

Read-only status report. M0 is committed (`fc9acb5`) and `release/v2.0` now tracks `origin/release/v2.0` with nothing ahead or behind. M1 hasn't started: `vite.config.js` still sets `base: '/Aim_Assist/'`, the `build` script still runs `scripts/spa-fallback.mjs`, there's no `vercel.json`, and `deploy.yml` is still the Pages workflow (it triggers only on `main`, so it doesn't fire on the release branch). No `api/` or `db/` exists yet, and `firebase` is still a dependency, as the plan expects before M6.

**Verification**

Inspected git state, `PLAN-V2.md`, `vite.config.js`, `package.json` and `.github/workflows/deploy.yml`. No tests were run.

### Interaction 2 — Milestone 1: Vercel hosting

**User Prompt**

> begin execution of milestone 1

**Agent Outcome**

Wrote the M1 step detail into `PLAN-V2.md` and executed it. The app now builds for the domain root, `vercel.json` handles SPA deep links, and the Pages deploy workflow is now CI-only. The work stops at the review gate, uncommitted, and M1 is marked "In review".

`vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/((?!api(?:/|$)).*)", "destination": "/index.html" }
  ]
}
```

**Rationale**

The rewrite's lookahead excludes `/api` and `/api/*` but not look-alikes such as `/apiary`. Vercel serves files that exist before it applies rewrites, so assets never reach the rewrite. `BrowserRouter`'s `basename` was removed rather than kept as `BASE_URL`, because with `base: '/'` it would always equal the router's default. CI also runs `format:check` and `build`, so a broken build is caught on the branch and not only by a Vercel deploy.

**Changes**

- [`vite.config.js`](vite.config.js) — removed `base: '/Aim_Assist/'` and its Pages comment, so the default `/` applies.
- [`src/App.jsx`](src/App.jsx) — removed the `basename` prop and its comment.
- [`vercel.json`](vercel.json) — new: the SPA rewrite.
- `package.json` — `build` is now plain `vite build`.
- `scripts/spa-fallback.mjs` — deleted (with `git rm`). It was the Pages `404.html` workaround.
- `.github/workflows/deploy.yml` → [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — renamed with `git mv` and rewritten. It runs on pushes to `main` and `release/**` and on PRs (lint, format check, test, build) with `contents: read` only. The Pages jobs and the Firebase secret check are gone.
- [`PLAN-V2.md`](PLAN-V2.md) — M1 detail, user steps and verification; M1 status set to "In review".

**Verification**

- `npm run lint` is clean, `npm run format:check` passes (after Prettier reflowed `vercel.json`), and `npm test` passes 72 tests in 15 files.
- `npm run build` succeeded. `dist/` has no `404.html`, and every asset URL in `dist/index.html` is root-relative (`/assets/…`).
- `vite preview` returned 200 for `/`, `/leaderboards`, `/favicon.svg` and the entry JS. This checks the base path only, since `vite preview` has its own SPA fallback.
- The rewrite `source` was tested with `path-to-regexp@6.1.0`, which Vercel uses to compile it, installed in a scratch directory outside the repo. Client routes and `/apiary` are rewritten; `/api`, `/api/`, `/api/me` and `/api/auth/callback/google` pass through.
- **Not verified:** a real Vercel deploy. That needs the user to import the repo first.

**Open user steps**

Import the repo into Vercel, then hard-refresh a deep link to verify the rewrite. The two Firebase steps are optional (see Interaction 3).

**Collaboration**

At the review gate, the user asked why the Firebase steps were needed, since v2 drops Firebase (Interaction 3).

### Interaction 3 — Firebase deploy steps made optional; M1 committed

**User Prompt**

> before we commit, explain why steps 2 and 3 are necessary--this version of Aim Assist will not be leveraging firebase. is this to check deployment success?

> make steps 2 & 3 optional with an explanation to what they will perform, then commit

**Agent Outcome**

Explained that the two steps aren't a deployment check. The branch still runs on Firebase until M4 (auth) and M6 (data), and `src/firebase/config.js` initializes it on every page load. Without the `VITE_FIREBASE_*` env vars, `getAuth()` throws on load, so the Vercel page is likely blank. This comes from reading the code and the SDK's behavior, not from a deploy. Without the authorized domain, only Firebase Google sign-in fails. Either way the rewrite can still be verified, because a deep link returns `index.html`.

The PLAN-V2.md M1 user steps were rewritten: importing into Vercel is required, while the env vars and authorized domain are labeled optional, each with what it enables and the milestone that undoes it (M6 and M4). M1 is marked Done, with the live-deploy rewrite check noted as pending the Vercel import. Committed on `release/v2.0` as "Move hosting to Vercel: root base path, SPA rewrite, CI-only workflow".

**Changes**

- [`PLAN-V2.md`](PLAN-V2.md) — M1 user steps split into required and optional interim Firebase steps; M1 status set to Done.

**Verification**

No code changed after Interaction 2's checks. The commit was confirmed with `git log`.

**Collaboration**

The user challenged the Firebase steps as contradicting v2's Firebase removal. That changed them from required setup into optional, explicitly temporary steps.
