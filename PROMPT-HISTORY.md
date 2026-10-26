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
