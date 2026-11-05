# Prompt History — Automation

This document records meaningful development interactions between the user and
AI coding agents working on this project. It focuses on requests, outcomes,
implementation decisions, verification, and human-agent collaboration rather
than preserving a raw conversation transcript.

Generated code is included verbatim when reasonably concise. Extensive
implementations are referenced through their canonical repository files.

> This file is an engineering collaboration record, not a source of truth for
> application behavior. The repository itself remains authoritative.

> This file holds only the leaderboard-automation work on `feature/automation`
> ([PLAN-AUTOMATION.md](PLAN-AUTOMATION.md)), at the user's request. The
> project's main log is [PROMPT-HISTORY.md](PROMPT-HISTORY.md).

---

## Session: 2026-11-05

**Objective:** Notify the app owner in Discord when a player takes first place on the global leaderboard, with a Node-RED automation that has an AI step. It's the week-7 assignment: a working AI automation, a one-page proposal and a live demo.

The first five turns asked for no logging and no files. The user logged the whole session afterwards (Interaction 15).

### Interaction 1 — Options for first-place notifications

**User Prompt**

> No logging, no writing files:
>
> As the application owner, I want a way to be notified when a user achieves first place in the global leaderboard.
>
> I want to use node-RED for automation. I do not want to create new accounts/log ins for services. The free tier of vercel cannot be jeopordized with excessive polling. Perhaps a Discord webhook to notify a channel of my choosing.
>
> The purpose of this exercise is to showcase automation--with an AI step (classify, draft, summarize, route, etc)--for demonstration purposes, but using actual data from the application.
>
> Here is a guideline of the assignment: [pasted assignment: build a working AI automation with at least one AI step for a real, validated problem, plus a one-page proposal covering the problem, the solution, the value with a number and the cost. The grading covers how reliably it works, control (a validated problem, an end-to-end explanation, its failure mode, cost against value), a live demo with a 90-second pitch, and meeting the spec. The build steps and the AI prompt must be logged.]
>
> what are my options?

[Prompt abbreviated for history. Core requirements preserved.]

**Agent Outcome**

Read the leaderboard and score code, and laid out three ways to trigger the alert and three kinds of AI step:

- **Pull:** Node-RED checks the public `GET /api/leaderboard?view=all` on a timer. No app changes, and it recovers on its own after downtime.
- **Push:** `POST /api/scores` notifies Node-RED. That needs a tunnel to the local Node-RED, and events are lost while it's down.
- **Hybrid:** push for speed, plus a rare check to catch what's lost.
- **AI step:** draft an announcement, classify and route (`celebrate` or `review` to two channels), or summarize a digest.

Also listed what not to do: Node-RED querying Neon directly, Vercel Cron, Postgres `LISTEN/NOTIFY`. Flagged that the spec names Zapier, and that the all-time board ranks raw scores across modes.

**Rationale**

The real budget limit is Neon waking up for each check, not Vercel invocations. Checking on a timer needs no app changes and has the simplest failure story to explain.

**Collaboration**

The user picked **timed checks** and **classify and route** from the options offered.

### Interaction 2 — Neon's free tier, and what "0.39" means

**User Prompt**

> no logging, no writing files:
>
> neon's free tier offers 100 CU houers per project per month

> no logging, no writing files:
>
> compute under "usage" in the neon console shows 0.39

**Agent Outcome**

A table of CU-hours by check interval, assuming each check wakes Neon for its ~5-minute idle timeout at 0.25 CU:

| Interval | CU-hours/month |
|---|---|
| 5 min or less | ~183, over the cap |
| 15 min | ~60 |
| 30 min | ~30 |
| 60 min | ~15 |

Read "0.39" as compute **used** this period (about 2.4 CU-hours a month from real traffic), not the compute size, and said how to check the size.

**Collaboration**

The user supplied the free-tier figure and the console reading, which grounded the cost number for the proposal.

### Interaction 3 — Option 1 in detail

**User Prompt**

> no logging, no writing files:
>
> we will go with option 1. explore it more

**Agent Outcome**

Found in the repo and on the live board:

- 3 players on the all-time board; the #1 is Speed 13,125.
- Mode ceilings from `maxPlausibleScore`: Gridshot 93,000, Precision 5,400, Speed 19,800, Tracking 7,400, Flick 13,500, Survival ~9.6M.
- Responses are `no-store`, so every check reaches Neon.
- `~/.node-red/settings.js` had no file context, no `uiHost` and no `adminAuth`.

Designed the flow node by node, the change-detection rules (first run, takeover, extended lead, removal, empty board, fetch error), the hard flags, and the name-free Claude input. Claude writes `{player}` and Node-RED fills the name in, so a player's name can't steer the label. Also covered the failure modes, the demo and the proposal numbers.

**Collaboration**

The user chose to **alert when the #1 raises their own record** ("extended lead") and to put the **all-time board only** on the timer. The daily board is for the demo.

### Interaction 4 — Write the plan (A0)

**User Prompt**

> write this plan as `PLAN-AUTOMATION.MD` onto the `feature/automation` branch

**Agent Outcome**

`feature/automation` already existed, locally and on origin, at `main`'s commit with no commits of its own, so the work used it. Wrote [PLAN-AUTOMATION.md](PLAN-AUTOMATION.md), in the layout of PLAN-INSIGHTS.md: context, approach with the rejected options, the decisions table, change detection, the flow, the prompt outline, failure modes, milestones A0–A5 and the demo. It's lowercase `.md` to match the other plans.

**Collaboration**

The user approved: *"commit it and start A1"*. Committed `08d692e`.

### Interaction 5 — Node-RED setup (A1)

**Agent Outcome**

`~/.node-red/settings.js` (outside the repo, original kept as `settings.js.orig`) now:

- loads a private `.env` with `process.loadEnvFile`,
- sets `credentialSecret` from it,
- sets `uiHost: "127.0.0.1"`,
- uses file-backed context.

Created `.env` with mode 600: blanks for the API key and two webhooks, the app URL, and a generated credential secret that was never printed.

**Verification**

- Node-RED listened on `127.0.0.1:1880` only.
- A temporary check tab's boot counter went 1 → 2 across a clean restart.
- The user filled `.env` and created both webhooks: `boots: 4`, all three secrets `true`, the editor reachable from Windows, and a test post in each channel.

**Collaboration**

> all three show true. Ran `node-red` and can see the GUI. […] Two discord webhooks added, and both tests posted to each channel. commit and move to A2

Committed `216e476`.

### Interaction 6 — Check and decide (A2)

**Agent Outcome**

The logic is pure, tested modules that Node-RED loads as `global.get('watcher')` through `functionGlobalContext`. The function nodes are thin glue.

**Implementation**

- [`automation/watcher/decide.js`](automation/watcher/decide.js) — `decide({ saved, entries, view, now })` → `{ action, state, event }`. It reuses `periodStart` from `api/_lib/leaderboardView.js`, so yesterday's daily #1 isn't the previous holder.
- [`automation/watcher/message.js`](automation/watcher/message.js) — `plainPost`, `escapeMarkdown`, `formatDuration`.
- [`automation/leaderboard-watch.flow.json`](automation/leaderboard-watch.flow.json) — the flow, deployed through the admin API's `POST /flows`, plus fixture injects 1–5 and a 503.
- [`eslint.config.js`](eslint.config.js) — `automation/` counts as Node code.

**Rationale**

- **Two context stores:** a module in global context can't be written to a file store, because its functions don't survive being saved as JSON. So the default store became `memory`, and the saved #1 goes to a named `file` store.
- **Saving:** state is saved only after Discord returns 2xx, so a failed post is retried at the next check.

**Attempted Approach / Resolution**

The first deploy went to the user's own Node-RED. It was still holding port 1880 with the old settings, and `pgrep -x` missed it because of its padded process title. The agent stopped it cleanly and restarted it with the new settings. Nothing had run in between.

**Verification**

- `npm test`: 460 passed.
- Fixtures gave, in order: seed → none → takeover (posted) → extended (posted) → removal → empty → none → fetch failed.
- The real all-time board seeded with the #1 (`id` 23) and survived a restart.
- The user saw both posts.

**Collaboration**

> both fixture posts showed up. commit and move to A3

Committed `dec0a6e`.

### Interaction 7 — AI step and routing (A3)

**Agent Outcome**

Added rule flags, a Claude request in raw HTTP from Node-RED's http request node, a merge step, a **Route by label** switch, and two change nodes that set each webhook URL from env. Added Fixture 6, the suspicious takeover.

**Implementation**

- [`automation/watcher/flags.js`](automation/watcher/flags.js) — `MODE_CEILINGS`, built from `maxPlausibleScore` and `GAME_MODES`; `pctOfCeiling`; `ruleFlags`.
- [`automation/watcher/claude.js`](automation/watcher/claude.js) — `SYSTEM_PROMPT` (which lists the modes from `MODE_REFERENCE`), `VERDICT_SCHEMA`, `claudeInput` (figures only), `claudeRequest`, `parseVerdict`.
- [`automation/watcher/alert.js`](automation/watcher/alert.js) — `label`, `alertPost`.

The request: `claude-haiku-5-5`, effort `low`, `output_config.format` as a JSON schema, `anthropic-version: 2026-10-21`, and no sampling parameters. The schema can't carry length or range limits, so `parseVerdict` applies them.

**Rationale**

- **Same-mode lead:** the lead flag compares #1 only with a #2 in the same mode. The all-time board mixes modes, so a lead over a #2 in another mode would flag ordinary runs.
- **Ben's fixtures moved to Speed:** in Flick they were 96–99% of the ceiling, so they'd have gone to review and nothing would have tested `celebrate`.

**Verification**

- `npm test`: 486 passed.
- Live: Fixture 2 → `celebrate`, Fixture 3 → `celebrate`, Fixture 6 → `review`. About 1,410–1,470 tokens in and 170–190 out, roughly $0.00024 per alert.
- The user saw the Ben posts in #announcements and the Cara review in #mod-alerts.

### Interaction 8 — Drop the `[fixture]` marker

**User Prompt**

> all messages are including their node title:
> [fixture] **Ben** takes back the top spot on Aim Assist in Speed with 13400 points at 95.5% accuracy and a 640 ms average reaction. A solid step up from the previous best. Keep pushing for the next one!
>
> Can `[fixture]` be stripped from the discord messaging

**Agent Outcome**

Explained that the marker was deliberate, not the node title, then removed it from all posts, along with its two tests.

**Collaboration**

The user's choice. The trade-off was stated: fixture posts now read like real alerts, and only the plain and review posts' "fixture board" wording gives them away.

> approved, commit it

Committed `8084fe6`.

### Interaction 9 — Failure handling (A4)

**Agent Outcome**

**Implementation**

- [`automation/watcher/watchdog.js`](automation/watcher/watchdog.js) — `trackFetch` posts once to #mod-alerts on the 3rd failed fetch in a row, and posts a "reachable again" notice afterwards. The recovery notice goes beyond the plan.
- [`automation/watcher/retry.js`](automation/watcher/retry.js) — `retryDelayMs` waits for Discord's `retry_after`, else `Retry-After`, else 5 s, at most 60 s, and retries once.
- The flow: Decide has a second output for notices, **Save, or retry once on 429** resends the same body, and a catch node collects errors.

**Verification**

The failure paths ran live without spamming Discord or paying for Claude. `process.loadEnvFile` doesn't override variables already set, so a test instance ran with an invalid API key and the webhooks pointed at a local mock. The mock answered the first post with a 429 asking for 1.5 s. The instance was started after the 14:30 timer tick, so no real check could post to the mock.

Results: the "down" notice came on the 3rd failure only, then the recovery notice. Claude's 401 led to the plain post. The 429 was retried after 1,500 ms and accepted, and only then was the state saved. `npm test`: 496 passed.

### Interaction 10 — Demo dry run: a real run went to review

**User Prompt**

> I played a match, then in the editor clicked `check now:daily` , but the announcement appeared in #mod-alerts, not in announcements

**Agent Outcome**

- **The routing was right; Claude's call was wrong.** The run was Tracking 6,100: 82% of the ceiling, 97.3% accuracy, 642 ms. No rule fired, and Claude said `review`.
- **Replayed 3 times:** `celebrate` every time.
- **The cause:** the prompt said "close to the ceiling" without saying how close.
- **The fix:**
  - The prompt says the ceiling is a theoretical maximum, with strong human play often at 60–85% of it.
  - It states the three rules, built from `flags.js`'s exported thresholds.
  - It limits `review` to concrete reasons the rules miss.

The new label paragraph in [`automation/watcher/claude.js`](automation/watcher/claude.js):

```text
Rules already send three cases to review, and appear in ruleFlags when they fire: a score at ${NEAR_CEILING_PCT}% of the ceiling or more, an average reaction under ${MIN_HUMAN_REACTION_MS} ms, and a lead of ${BIG_LEAD_PCT}% or more over #2 in the same mode. Your job is what they miss.

Label "review" only for a concrete reason tied to figures in the input: a combination that is unlikely together (such as perfect accuracy with a reaction time near the floor), or a jump far beyond the previous #1 in the same mode. A score under ${NEAR_CEILING_PCT}% of the ceiling is not a reason on its own, and neither is high accuracy on its own. Otherwise label "celebrate". When rule flags were raised, still give your own label and reasons. Give your confidence in the label from 0 to 1.
```

**Verification**

A label check, a scratchpad script (it moves to the repo in A5), ran five valid cases 5 times each, about $0.008 a run:

| Prompt | Wrong labels |
|---|---|
| Old | 2 of 25, both on the user's run ("82% … close to the top") |
| New | 0 of 25 |

Case D, a suspicious daily Precision run that no rule catches, goes to `review` every time.

**Attempted Approach / Resolution**

The check's first cases had two impossible boards, where a lower score took #1. Claude flagged them as inconsistent. They were fixed, and the old prompt was rerun on the corrected cases (stashing the two prompt files and restoring them) for a fair comparison.

Also added a test that the prompt's thresholds match `flags.js`. `npm test`: 497 passed.

### Interaction 11 — A4 committed; the label check goes to A5

**User Prompt**

> fixture 2 posted to announcements. Add the label check in A5 as evidence for the build log. commit it

**Agent Outcome**

Marked A4 Done, and added the label check to A5's row as build-log evidence: run by hand because it calls the paid API, so not part of `npm test`. Committed `94a9628`.

### Interaction 12 — Log the session

**User Prompt**

> log this entire session into its own `prompt-history-automation.md` file

**Agent Outcome**

Wrote this file, separate from [PROMPT-HISTORY.md](PROMPT-HISTORY.md).

**Collaboration**

> commit it and move to A5

Committed `68e7a3b`.

### Interaction 13 — Proposal, build log and label check (A5)

**Agent Outcome**

Asked for the two facts the proposal's value figure depends on, rather than estimating them:

- the user checked the leaderboard by hand **a few times a week**, so a new #1 could wait 2–3 days;
- celebrating players and catching cheaters **matter equally**.

Then wrote:

- [`automation/PROPOSAL.md`](automation/PROPOSAL.md) — one page: problem, solution, value (from up to 2–3 days to notice a new #1 down to under 30 minutes, and no manual checks), cost (effectively $0 a month, about $0.00024 per alert), failure modes, next step.
- [`automation/BUILD-LOG.md`](automation/BUILD-LOG.md) — the assignment's build log:
  - a Mermaid flow diagram, every step and change rule;
  - the AI step: an example input and output from a real run, the request settings, the schema, and the full system prompt as sent;
  - the prompt's one revision, with the incident and the old-versus-new label table (23 of 25 → 25 of 25);
  - the failure table with how each path was tested, the measured cost, the timeline with commits, and how to run it.
- [`automation/label-check.js`](automation/label-check.js) — the A4 check moved into the repo, run with `npm run automation:label-check -- [runs] [--show]`. It reads the key from `~/.node-red/.env`, sends five valid cases through the flow's own `claudeInput` and `claudeRequest`, and exits 1 on a miss. It isn't a `*.test.js`, so `npm test` never calls the paid API.
- [`package.json`](package.json) — the `automation:label-check` script.

**Verification**

- `npm run automation:label-check -- 5 --show`: 25 of 25, about $0.008. The build log's example verdicts come from this run.
- `npm test`: 497 passed, 59 of them the watcher's. Lint and Prettier are clean.

**Attempted Approach / Resolution**

Case B was first called "the real all-time takeover". The live board shows the Flick score was set after the Speed one, so it's now "the real top two scores, set up as a takeover", in the script, the build log and the plan.

**Collaboration**

> approved, commit A5

Committed `01adbdf`. A0–A5 are all done.

### Interaction 14 — Pitch script, CLAUDE.md entry, and this log closed

**User Prompt**

> write the 90-second pitch script, add A5 to prompt-history-automation to close the open items, CLAUDE.md's "Documents" entry for "PLAN-AUTOMATION.md". I will conduct the pull request at a later time.

**Agent Outcome**

- [`automation/PITCH.md`](automation/PITCH.md) — the 90-second pitch in four timed parts (problem, solution, value, cost and failure), with demo cues at the points where the live posts appear, a pre-demo checklist, and backups for when the demo misbehaves. One backup row was corrected while writing: with the Wi-Fi down, the watchdog notice can't reach Discord either.
- [`CLAUDE.md`](CLAUDE.md) — a Documents entry for PLAN-AUTOMATION.md, pointing at `automation/` and this log. It was written with the `writing-for-agents` guidance: what the document is and when to reach it, in the existing entries' style.
- [`PLAN-AUTOMATION.md`](PLAN-AUTOMATION.md) — the Demo section points at the pitch.
- This file: Interactions 13–14 and the closed summary.

**Collaboration**

The user is leaving the PR for `feature/automation` → `main` to a later time.

> yes, update those two lines and commit everything

The agent had pointed out two stale CLAUDE.md lines, and the user had them fixed. `improvement/insights` was merged in PR #4, so PLAN-INSIGHTS.md's entry now reads "all done, merged", and **read first** moved to PLAN-AUTOMATION.md, now first in the list. The Workflow paragraph lists the insights work as merged and names `feature/automation` as the current branch, with its PR left to the user.

### Interaction 15 — The mock Discord moves into the repo

**User Prompt**

> no logging, no writing files:
>
> there is a shell still open, using node-red and a scratchpad file. Is anything crucial there for demonstration/functionality if I close the shell?

> add the mock to automation/ and commit it

**Agent Outcome**

- **The answer:** closing the shell stops the background Node-RED, which only pauses checks. The flow, saved state, settings and logic live in `~/.node-red` and the repo. Of the scratchpad files, only the mock Discord had no copy in the repo.
- **[`automation/mock-discord.js`](automation/mock-discord.js):** the mock, rewritten to the repo's standards. The first `/announce` post gets a 429 asking for 1.5 s, every other post gets a 204, and each request prints as a JSON line.
- **[`automation/BUILD-LOG.md`](automation/BUILD-LOG.md):** the mock in the table of files, a new "Re-running the failure tests" section (start the test instance just after a timer tick, or a real alert could go to the mock), and A5's commit in the timeline in place of "this commit".
- **[`PLAN-AUTOMATION.md`](PLAN-AUTOMATION.md):** A4's notes link the mock and the label check in the repo, where they said "the session scratchpad".

**Verification**

- Against the mock on a spare port: `/announce` → 429, then `/announce` → 204, `/mods` → 204, `/announce` → 204, each logged.
- `npx eslint automation`: clean. Prettier: clean.
- The real Node-RED on port 1880 was untouched.

**Attempted Approach / Resolution**

The first check put a trailing `&` on an `&&` chain, which sent the whole chain to the background, so the requests ran before the mock started. The stray chain then started a mock on that port. The check ran against it, and both stray processes were stopped.

### Session Summary

**Completed**

- A0–A5 on `feature/automation`: `08d692e`, `216e476`, `dec0a6e`, `8084fe6`, `94a9628`, `01adbdf`, plus this log (`68e7a3b`), the pitch and CLAUDE.md (`07c92ad`), and the mock. Not pushed.
- A Node-RED watcher that checks the all-time board every 30 min, 08:00–24:00 Eastern. Rule flags and Claude Haiku triage each new #1, `celebrate` posts to #announcements, and `review` posts to #mod-alerts. A watchdog, a 429 retry and a rule-only fallback cover failures.
- The assignment's deliverables: the proposal, the build log with the AI prompt, the label check as evidence, and the Demo Day pitch.

**Key Decisions**

- Checking on a timer over the app pushing alerts: no app changes, it recovers on its own, and it costs about 20 of Neon's 100 free CU-hours a month.
- Claude never sees player names, which blocks prompt injection and keeps personal data away from the AI.
- The logic is in tested repo modules, and the Node-RED function nodes are glue.
- The triage prompt is tied to the rule constants and was measured before and after its fix.
- The proposal's value figure comes from the user's own checking habit, not an estimate.

**Verification**

- 497 tests pass; lint and Prettier are clean.
- Every fixture and failure path was run live: Discord, the mock and an invalid key.
- The label check from the repo: 25 of 25.
- The user confirmed each milestone's posts in Discord.

**Open Items**

- The PR for `feature/automation` → `main`, which the user will open later.
- Node-RED is running as a background process from this session. Restart it from a terminal for ongoing use.
