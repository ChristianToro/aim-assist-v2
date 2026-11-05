# Demo Day pitch: leaderboard takeover alerts

A 90-second pitch (problem → solution → value) to go with the live demo. The figures come from [PROPOSAL.md](PROPOSAL.md) and [BUILD-LOG.md](BUILD-LOG.md).

## Before you go on

- [ ] Node-RED is running (`node-red`) and the **Leaderboard watch** tab is open at `http://localhost:1880`.
- [ ] Discord is open on #announcements and #mod-alerts.
- [ ] Press **Check now: daily** once, so its status reads `daily: none` and only the live match will count. The daily board resets at 00:00 UTC (19:00 Eastern standard time).
- [ ] Press **Fixture: reset**, then **Fixture 1**, so Fixture 6 is ready.
- [ ] Signed in on the app, on the Play page.

## The 90 seconds

**0:00 to 0:20 — Problem**

> Aim Assist is my browser aim trainer. First place on its leaderboard is the moment I care about most. A player who earns it deserves a shout-out, and it's exactly where a cheater would show up. I was checking by hand a few times a week, so a new number one could sit unnoticed for two to three days.

**0:20 to 0:50 — Solution** *(play the match while you talk, or have it played just before)*

> So I built a Node-RED automation. Every 30 minutes it reads the app's public leaderboard. When first place changes, rules check the numbers. Then Claude reads the run's figures (never the player's name, so no one can talk their way past it), labels it *celebrate* or *review*, and writes the announcement.

*Press **Check now: daily**. Claude's post appears in #announcements.*

> Celebrations go to announcements. Anything suspicious goes to mod-alerts, with the reasons.

*Press **Fixture 6**. The review appears in #mod-alerts. Say: "That one's a test fixture."*

**0:50 to 1:10 — Value**

> Time to notice a new number one drops from days to under 30 minutes, and I don't check by hand anymore. The AI earns its place, too. In testing, it flagged a run that no rule caught (perfect accuracy at a 165-millisecond reaction) five times out of five, and it labelled 25 of 25 test cases correctly.

**1:10 to 1:30 — Cost and failure**

> It costs effectively nothing: about two-hundredths of a cent per alert, a fifth of Neon's free compute, and no new accounts. And if something fails, whether it's Claude, Discord or the leaderboard, it still alerts me or tells me it can't. Next step: run it for two weeks and tune the thresholds on real data.

## If something goes wrong live

| Problem | Do this |
|---|---|
| The match doesn't take #1 (someone scored higher today) | Press **Fixture 2**: the same path, a fixture takeover, posts to #announcements. |
| The post lands in #mod-alerts | That's the review route working. Read out Claude's reasons, which is the failure-mode story. |
| The app's API is down (Discord still works) | Press **Fixture: fetch fails** 3 times: the watchdog notice is the failure mode, live. |
| Wi-Fi is down (nothing can reach Discord or Claude) | Show the red "fetch failed" status on **Decide**. Explain that nothing is saved, so the next check catches up. |
| Asked "what if the laptop's off?" | Alerts come late, never lost: the next check compares against the board as it is then. |
