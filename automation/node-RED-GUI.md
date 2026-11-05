# The Node-RED editor: the Leaderboard watch tab

The flow runs in Node-RED on the owner's machine, so its editor isn't something a reviewer can open. This page draws what the **Leaderboard watch** tab looks like at `http://localhost:1880`. The nodes, names, wires and output ports come from [`leaderboard-watch.flow.json`](leaderboard-watch.flow.json), and each node is coloured the way the editor colours its type. How the pieces work is in [BUILD-LOG.md](BUILD-LOG.md).

The canvas has three rows. The **main flow** runs left to right across the top. The **error catcher** sits under its left end, and the **fixtures** are stacked below that. Two comment nodes label the main flow and the fixtures; they have no wires and aren't drawn here.

## The whole tab

```mermaid
flowchart LR
  timer("Every 30 min,<br/>08:00–24:00: all-time")
  nowAll("Check now: all-time")
  nowDaily("Check now: daily")
  request("Leaderboard request")
  get("GET leaderboard")
  decide("Decide")
  alertEvent("alert event")
  claudeReq("Flags + Claude request")
  claude("POST Claude")
  merge("Merge verdict")
  verdict("verdict")
  route("Route by label")
  announce("→ #announcements")
  mods("→ #mod-alerts")
  post("POST to Discord")
  save("Save, or retry once on 429")
  fixtures("Fixtures 1–6 and<br/>fetch fails (503)")
  reset("Fixture: reset")
  forget("Forget fixture state")
  catchAll("Any error")
  errors("errors")

  timer --> request
  nowAll --> request
  nowDaily --> request
  request --> get --> decide
  decide -- "1" --> claudeReq
  decide -- "1" --> alertEvent
  decide -- "2" --> mods
  claudeReq --> claude --> merge
  merge --> route
  merge --> verdict
  route -- "1" --> announce
  route -- "2" --> mods
  announce --> post
  mods --> post
  post --> save
  save -. "429" .-> post
  fixtures --> decide
  reset --> forget
  catchAll --> errors

  classDef inject fill:#a6bbcf,stroke:#7b8fa3,color:#000
  classDef function fill:#fdd0a2,stroke:#c99e74,color:#000
  classDef http fill:#e7e7ae,stroke:#b3b37d,color:#000
  classDef sw fill:#e2d96e,stroke:#aea640,color:#000
  classDef debug fill:#87a980,stroke:#5f7f58,color:#000
  classDef catchNode fill:#e49191,stroke:#b06464,color:#000
  class timer,nowAll,nowDaily,fixtures,reset inject
  class request,decide,claudeReq,merge,save,forget function
  class get,claude,post http
  class route,announce,mods sw
  class alertEvent,verdict,errors debug
  class catchAll catchNode
```

## Node types

| Colour in the editor | Type | Nodes on this tab |
|---|---|---|
| Grey-blue `#a6bbcf` | inject | The timer, **Check now** ×2, the fixtures ×8 |
| Orange `#fdd0a2` | function | Leaderboard request, Decide, Flags + Claude request, Merge verdict, Save or retry, Forget fixture state |
| Pale yellow `#e7e7ae` | http request | GET leaderboard, POST Claude, POST to Discord |
| Yellow `#e2d96e` | switch, change | Route by label; → #announcements, → #mod-alerts |
| Green `#87a980` | debug | alert event, verdict, errors |
| Red `#e49191` | catch | Any error |

A function node's code is a few lines of glue. The decisions come from the repo's [`watcher/`](watcher/) modules, which `settings.js` loads as `global.get('watcher')`. Secrets come from `env.get()`, so no node holds one.

## 1. Trigger and fetch

```mermaid
flowchart LR
  timer("<b>inject</b><br/>Every 30 min, 08:00–24:00: all-time<br/><i>cron */30 8-23 * * * · view = all</i>")
  nowAll("<b>inject</b><br/>Check now: all-time<br/><i>button · view = all</i>")
  nowDaily("<b>inject</b><br/>Check now: daily<br/><i>button · view = daily</i>")
  request("<b>function</b><br/>Leaderboard request<br/><i>msg.url from AIM_ASSIST_URL, 10 s timeout</i>")
  get("<b>http request</b><br/>GET leaderboard<br/><i>returns parsed JSON</i>")
  decide("<b>function</b><br/>Decide")

  timer --> request
  nowAll --> request
  nowDaily --> request
  request --> get --> decide

  classDef inject fill:#a6bbcf,stroke:#7b8fa3,color:#000
  classDef function fill:#fdd0a2,stroke:#c99e74,color:#000
  classDef http fill:#e7e7ae,stroke:#b3b37d,color:#000
  class timer,nowAll,nowDaily inject
  class request,decide function
  class get http
```

The timer checks the all-time board only. Each **Check now** button checks its board straight away, and the daily one is what the demo uses.

## 2. Decide: two outputs

```mermaid
flowchart LR
  get("<b>http request</b><br/>GET leaderboard")
  fixtures("<b>inject</b> ×7<br/>Fixtures 1–6, fetch fails (503)<br/><i>view = fixture</i>")
  decide("<b>function</b> · 2 outputs<br/>Decide<br/><i>watcher.decide, watcher.trackFetch</i>")
  claudeReq("<b>function</b><br/>Flags + Claude request")
  alertEvent("<b>debug</b><br/>alert event<br/><i>shows msg.event</i>")
  mods("<b>change</b><br/>→ #mod-alerts")
  stop(("no output:<br/>nothing new,<br/>or saved now"))

  get --> decide
  fixtures --> decide
  decide -- "output 1 · a takeover or extended lead" --> claudeReq
  decide -- "output 1" --> alertEvent
  decide -- "output 2 · watchdog: down or recovered" --> mods
  decide -.- stop

  classDef inject fill:#a6bbcf,stroke:#7b8fa3,color:#000
  classDef function fill:#fdd0a2,stroke:#c99e74,color:#000
  classDef http fill:#e7e7ae,stroke:#b3b37d,color:#000
  classDef sw fill:#e2d96e,stroke:#aea640,color:#000
  classDef debug fill:#87a980,stroke:#5f7f58,color:#000
  classDef quiet fill:#fff,stroke:#999,color:#555,stroke-dasharray:3 3
  class fixtures inject
  class decide,claudeReq function
  class get http
  class mods sw
  class alertEvent debug
  class stop quiet
```

Decide sends nothing on output 1 when the board hasn't changed. It also sends nothing when the change needs no alert (the first check, a removal, an empty board): it saves that state straight away. Output 2 fires only on the 3rd failed fetch in a row, and on the first success after that.

## 3. The AI step and routing

```mermaid
flowchart LR
  claudeReq("<b>function</b><br/>Flags + Claude request<br/><i>rule flags · figures only, no names · API key from env</i>")
  claude("<b>http request</b><br/>POST Claude<br/><i>Messages API · claude-haiku-5-5 · 30 s timeout</i>")
  merge("<b>function</b><br/>Merge verdict<br/><i>label: review if any flag or Claude says so<br/>puts the name in for {player}</i>")
  verdict("<b>debug</b><br/>verdict<br/><i>shows msg.verdict</i>")
  route("<b>switch</b><br/>Route by label<br/><i>msg.label</i>")
  announce("<b>change</b><br/>→ #announcements<br/><i>msg.url = env DISCORD_ANNOUNCE_URL</i>")
  mods("<b>change</b><br/>→ #mod-alerts<br/><i>msg.url = env DISCORD_MODS_URL</i>")

  claudeReq --> claude --> merge
  merge --> verdict
  merge --> route
  route -- "output 1 · celebrate" --> announce
  route -- "output 2 · review" --> mods

  classDef function fill:#fdd0a2,stroke:#c99e74,color:#000
  classDef http fill:#e7e7ae,stroke:#b3b37d,color:#000
  classDef sw fill:#e2d96e,stroke:#aea640,color:#000
  classDef debug fill:#87a980,stroke:#5f7f58,color:#000
  class claudeReq,merge function
  class claude http
  class route,announce,mods sw
  class verdict debug
```

If Claude fails (an error, a refusal or bad JSON), Merge verdict lets the rules decide and sends the plain factual post instead, so the alert still goes out.

## 4. Posting and saving

```mermaid
flowchart LR
  announce("<b>change</b><br/>→ #announcements")
  mods("<b>change</b><br/>→ #mod-alerts<br/><i>alerts and watchdog notices</i>")
  post("<b>http request</b><br/>POST to Discord<br/><i>returns the reply as text</i>")
  save("<b>function</b><br/>Save, or retry once on 429")
  saved(("2xx:<br/>new #1 saved"))
  later(("other failure:<br/>retried at the<br/>next check"))

  announce --> post
  mods --> post
  post --> save
  save -. "429 · waits retry_after (≤ 60 s), resends once" .-> post
  save -.- saved
  save -.- later

  classDef function fill:#fdd0a2,stroke:#c99e74,color:#000
  classDef http fill:#e7e7ae,stroke:#b3b37d,color:#000
  classDef sw fill:#e2d96e,stroke:#aea640,color:#000
  classDef quiet fill:#fff,stroke:#999,color:#555,stroke-dasharray:3 3
  class save function
  class post http
  class announce,mods sw
  class saved,later quiet
```

The wire from **Save, or retry** back into **POST to Discord** is the one loop on the canvas. The new #1 is saved only after Discord accepts the post, so a failed alert is tried again at the next check.

## Fixtures and errors

```mermaid
flowchart LR
  reset("<b>inject</b><br/>Fixture: reset")
  forget("<b>function</b><br/>Forget fixture state<br/><i>clears top_fixture, watchdog_fixture</i>")
  f1("<b>inject</b><br/>Fixture 1: first board (seed)")
  f2("<b>inject</b><br/>Fixture 2: Ben takes #1 (takeover)")
  f3("<b>inject</b><br/>Fixture 3: Ben raises it (extended)")
  f4("<b>inject</b><br/>Fixture 4: Ben's account deleted (removal)")
  f5("<b>inject</b><br/>Fixture 5: empty board (empty)")
  f6("<b>inject</b><br/>Fixture 6: suspicious takeover (review)")
  ferr("<b>inject</b><br/>Fixture: fetch fails (503)")
  decide("<b>function</b><br/>Decide<br/><i>main flow</i>")
  catchAll("<b>catch</b><br/>Any error<br/><i>every node on the tab</i>")
  errors("<b>debug</b><br/>errors<br/><i>sidebar and console</i>")

  reset --> forget
  f1 --> decide
  f2 --> decide
  f3 --> decide
  f4 --> decide
  f5 --> decide
  f6 --> decide
  ferr --> decide
  catchAll --> errors

  classDef inject fill:#a6bbcf,stroke:#7b8fa3,color:#000
  classDef function fill:#fdd0a2,stroke:#c99e74,color:#000
  classDef debug fill:#87a980,stroke:#5f7f58,color:#000
  classDef catchNode fill:#e49191,stroke:#b06464,color:#000
  class reset,f1,f2,f3,f4,f5,f6,ferr inject
  class forget,decide function
  class errors debug
  class catchAll catchNode
```

The fixtures skip the fetch and feed a fake board straight into Decide, under view `fixture`, with their own saved state. Press **Reset**, then 1 to 5 in order; 6 works any time after 1. Fixtures 2, 3 and 6 go through Claude and post to Discord like real alerts. Pressing **fetch fails** 3 times brings the watchdog notice.

## What the status lines say

In the editor, each function node shows a coloured dot or ring and a short text under it after it runs. A green or yellow dot means it worked; a red ring means a failure.

| Node | Status | Means |
|---|---|---|
| Decide | 🟢 `all: none at 14:31` | Checked, nothing changed. Also `seed`, `removal` and `empty`, all saved. |
| Decide | 🟡 `daily: takeover at 14:37` | A new #1, passed on to Claude. Also `extended`. |
| Decide | 🔴 `all: fetch failed (503) at 15:00` | The board couldn't be read. State unchanged. |
| Merge verdict | 🟢 `daily: celebrate` / 🟡 `daily: review` | The final label. `(rules only)` is added when Claude gave no verdict. |
| Save, or retry once on 429 | 🟢 `daily: posted takeover at 14:37` | Discord accepted it, and the new #1 is saved. Also `posted watchdog down`. |
| Save, or retry once on 429 | 🟡 `all: rate-limited, retrying in 2 s` | Discord sent a 429. One retry is scheduled. |
| Save, or retry once on 429 | 🔴 `all: post failed (500) at 15:00` | Not saved, so it's tried again at the next check. |
| Forget fixture state | ⚪ `fixture state cleared` | The fixture board starts over. |

## What travels on each wire

| Wire | The message carries |
|---|---|
| inject → Leaderboard request | `view`: `all` or `daily` |
| Leaderboard request → GET leaderboard | `url`, `requestTimeout` |
| GET leaderboard → Decide | `statusCode`, `payload.entries` (the board, best first) |
| Decide output 1 → Flags + Claude request | `event` (`kind`, `current`, `previous`, `runnerUp`), `nextState`, `stateKey` |
| Decide output 2 → #mod-alerts | `notice` (`down` or `recovered`), the webhook body in `payload` |
| Flags + Claude request → POST Claude | `flags`, the API request in `payload`, the key in `headers` |
| POST Claude → Merge verdict | Claude's response in `payload` |
| Merge verdict → Route by label | `label`, `verdict`, the webhook body in `payload` and `post`. It's a fresh message, so the API key stops here. |
| change → POST to Discord | `url`, the webhook's address from env |
| POST to Discord → Save, or retry | `statusCode` and Discord's reply. The body to resend is kept in `post`. |
