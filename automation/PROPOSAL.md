# Proposal: Leaderboard takeover alerts for Aim Assist

**Client:** Aim Assist, a browser aim trainer at [aim-assist-v2.vercel.app](https://aim-assist-v2.vercel.app). One owner builds and runs it, on the free tiers of Vercel and Neon.

## Problem

First place on the global leaderboard is the moment the owner cares about most, for two reasons. A player who takes #1 deserves recognition while it still matters to them. And a #1 is exactly where a cheater would show up. The server rejects impossible matches, but not ones that are merely unlikely, and a suspicious #1 stays in front of every player until the owner looks.

Today the owner checks the leaderboard by hand a few times a week. **A new #1 can sit unnoticed for 2–3 days**, both the deserving ones and the suspicious ones.

The fix can't create new accounts or log-ins, and it can't put the free tiers at risk with heavy polling.

## Solution

A Node-RED automation on the owner's machine checks the public leaderboard every 30 minutes, 08:00–24:00. When #1 changes:

1. **Rules** check the numbers: a score at 90% or more of its mode's ceiling, a reaction time no human sustains, or a lead of 50% or more over #2 in the same mode.
2. **Claude** (Haiku) reads the run's figures, never the player's name. It labels the takeover **celebrate** or **review**, gives its reasons, and drafts the announcement.
3. **Routing:** celebrations go to #announcements with Claude's announcement. Anything flagged by a rule or by Claude goes to #mod-alerts, with the reasons.

It runs on accounts the owner already has: Discord webhooks, their Anthropic key, and the app's public API.

## Value

- **Time to notice a new #1: from up to 2–3 days to under 30 minutes** while it runs.
- **Manual checks: from a few a week to none.**
- **A suspicious #1 gets a look before most players see it.** The AI catches what the rules miss: in testing, a run with no rule fired (87% of the ceiling, perfect accuracy, a 165 ms reaction) went to review in 5 runs out of 5. Across five test cases, 25 of 25 labels were correct after one prompt fix.

## Cost

| | Cost |
|---|---|
| Claude, per alert (~1,400 tokens in, ~180 out) | about **$0.00024** |
| Claude, per month | under **$0.01** at any likely number of new #1s |
| Neon compute | at most ~20 of the free 100 CU-hours a month |
| Vercel, Node-RED, Discord | **$0**: about 1,000 function calls a month on the free plan, self-hosted, existing accounts |

**Running cost: effectively $0 a month.**

## Failure modes

- **The machine is off:** alerts come late, never lost. The next check sees the current #1.
- **The leaderboard is down:** after about 90 minutes, #mod-alerts is told, and told again when it's back.
- **Claude is down:** the rules decide, and a plain alert still goes out.
- **Claude is wrong:** the rules still force a review. A wrong celebration costs one post.

**Next step:** run it for two weeks, then count the alerts and how many reviews were warranted, and tune the thresholds on that evidence. How it's built and tested is in [BUILD-LOG.md](BUILD-LOG.md).
