# CLAUDE.md — Aim Assist v2

Browser-based aim trainer (Aimlabs-inspired), portfolio quality. v2 moves the v1 prototype off Firebase / GitHub Pages onto Vercel + Neon and adds AI recommendations. Reviewers are software engineers: optimize for clean architecture, readability, and polish.

## Documents

- [PLAN-V2.md](PLAN-V2.md) — **read first.** Milestone tracker, v2 decisions, and current status. Update a milestone's status when it changes.
- [PLAN-CONVERSION.md](PLAN-CONVERSION.md) — the Firebase → Neon/Vercel feasibility report (schema sketch, endpoint design, gotchas). PLAN-V2.md's Decisions table overrides it where they differ.
- [PROMPT-HISTORY.md](PROMPT-HISTORY.md) — v2 collaboration log.
- `Prototype/V1-*.md` — archived v1 docs. Historical only; consult `V1-ARCHITECTURE.md` for the game-engine design, which v2 keeps unchanged.

Use the `prompt-history` skill to maintain PROMPT-HISTORY.md — invoke it at the start of the session and keep it updated as work progresses.

## Workflow

Work happens on `release/v2.0` in small milestones from PLAN-V2.md. Each milestone ends at a **review gate**: present the changes and verification results, then wait. Commit only after the user approves, and start the next milestone only when the user says so. Detail a milestone's steps when it starts.

## Stack

| Layer | v2 |
|---|---|
| UI | React 19, React Router 7, Tailwind CSS 4, Vite |
| Gameplay | HTML5 Canvas 2D engine in `src/game/` (unchanged from v1) |
| Server | Vercel Functions in `/api` (helpers in `api/_lib/`, underscore = not a route) |
| Database | Neon Postgres via `@neondatabase/serverless`; schema as plain SQL in `db/migrations/` |
| Auth | Google sign-in via Better Auth, sessions in Neon (Firebase removed entirely) |
| AI | Anthropic API, called only from `/api` |
| Hosting | Vercel |

Until M6 completes, parts of the code still use Firebase; PLAN-V2.md shows which layers have moved.

## Ownership

- **React** owns menus, routing, auth state, settings, statistics, leaderboards, themes.
- **Canvas engine** owns the frame loop, rendering, targets, collision, particles. React never animates gameplay; the engine reports to React through event callbacks (`onHud`, `onGameOver`), never per frame.
- **`/api`** owns every database read/write, session checks, score validation, and AI calls. The browser reaches data only through `src/services/*`, which call `/api`.

## Security rules

- Client env vars (`VITE_*`) hold only public values. Secrets — `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `ANTHROPIC_API_KEY` — live in server-only env vars read inside `/api`.
- A request's user identity comes from the server session, never from the request body.
- Validate inputs in the handler and back them with SQL `CHECK` constraints.

## Coding standards

- Small, single-responsibility components and modules; keep files under ~200 lines when practical.
- Keep game logic out of React; keep game objects inside the engine.
- `const`, arrow functions, named constants instead of magic numbers, flat control flow.
- Custom hooks for stateful logic (`useAuth`, `useLeaderboard`, …); pure functions for validation, scoring, and stats so Vitest covers them without mocks.
- Justify every new dependency in the milestone that adds it.
- Concise comments for non-obvious logic; match the surrounding code's style.

## Git

- Commit messages carry no Co-Authored-By or other attribution lines.
- The user pushes manually (no SSH keys here); leave pushing to them.
- **CRITICAL: Never amend commits that have been pushed upstream.** Check `git log origin/main..HEAD` (or the branch's remote) before amending; otherwise make a new commit.
- **CRITICAL: Never force push.**
- `gh pr edit` is broken on this repo (Projects-classic GraphQL deprecation). Edit PR titles/bodies with `gh api -X PATCH /repos/{owner}/{repo}/pulls/{n}`.
- With `push.default=upstream`, a branch created from a remote-tracking ref pushes to that ref — possibly `main`. Push branches with an explicit refspec, e.g. `git push -u origin release/v2.0:refs/heads/release/v2.0`, and check `git rev-parse --abbrev-ref <branch>@{upstream}` first.
