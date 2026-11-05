/*
 * Label check for the takeover triage prompt (PLAN-AUTOMATION.md, A4):
 * sends each case's Claude input RUNS times to the Messages API and counts
 * how often the label matches the expected one. Build-log evidence
 * (automation/BUILD-LOG.md), not a unit test: it calls the paid API (about
 * $0.008 for 5 runs of the 5 cases on Haiku), so it's run by hand.
 *
 *   npm run automation:label-check            # 5 runs per case
 *   npm run automation:label-check -- 3 --show
 *
 * --show prints each case's first verdict. The npm script reads
 * ANTHROPIC_API_KEY from ~/.node-red/.env.
 */
import {
  API_VERSION,
  MESSAGES_URL,
  claudeInput,
  claudeRequest,
  parseVerdict,
  ruleFlags,
} from './watcher/index.js'

const DEFAULT_RUNS = 5
// Claude Haiku 5.5 list prices in dollars per million tokens, for the cost.
const USD_PER_MTOK = { input: 0.1, output: 0.5 }

const run = (mode, score, accuracy, reactionTime, createdAt, uid) => ({
  uid,
  mode,
  score,
  accuracy,
  reactionTime,
  createdAt,
})

const realSpeed = run('Speed', 13125, 96.3, 977, '2026-10-28T20:59:40Z', 'b')
const realFlick = run('Flick', 10819, 96.2, 648, '2026-10-27T13:51:09Z', 'c')

// Valid boards only: a new #1 always outscores the run it replaced.
const CASES = [
  {
    name: "A: the user's daily Tracking run, 82% of the ceiling",
    expected: 'celebrate',
    event: {
      kind: 'takeover',
      view: 'daily',
      current: run('Tracking', 6100, 97.3, 642, '2026-11-05T19:37:38Z', 'a'),
      previous: null,
      runnerUp: null,
    },
  },
  {
    name: 'B: the real top two scores, Speed 66% taking #1 from Flick 80%',
    expected: 'celebrate',
    event: {
      kind: 'takeover',
      view: 'all',
      current: realSpeed,
      previous: realFlick,
      runnerUp: realFlick,
    },
  },
  {
    name: 'C: Flick 85%, strong but human',
    expected: 'celebrate',
    event: {
      kind: 'takeover',
      view: 'all',
      current: run('Flick', 11475, 98, 600, '2026-11-05T12:00:00Z', 'a'),
      previous: realFlick,
      runnerUp: realFlick,
    },
  },
  {
    name: 'D: daily Precision 87%, 100% accuracy, 165 ms (no rule fires)',
    expected: 'review',
    event: {
      kind: 'takeover',
      view: 'daily',
      current: run('Precision', 4700, 100, 165, '2026-11-05T12:00:00Z', 'a'),
      previous: run('Precision', 3400, 91, 690, '2026-11-05T10:00:00Z', 'b'),
      runnerUp: run('Precision', 3400, 91, 690, '2026-11-05T10:00:00Z', 'b'),
    },
  },
  {
    name: 'E: Speed 97%, 120 ms, 61% over #2 (every rule fires)',
    expected: 'review',
    event: {
      kind: 'takeover',
      view: 'all',
      current: run('Speed', 19300, 100, 120, '2026-11-04T15:00:00Z', 'a'),
      previous: run('Speed', 13400, 95.5, 640, '2026-11-03T08:00:00Z', 'b'),
      runnerUp: run('Speed', 12000, 95.5, 640, '2026-11-01T10:00:00Z', 'c'),
    },
  },
]

const ask = async (input, apiKey) => {
  const response = await fetch(MESSAGES_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': API_VERSION,
    },
    body: JSON.stringify(claudeRequest(input)),
  })
  return response.json()
}

const checkCase = async ({ expected, event }, runs, apiKey) => {
  const input = claudeInput(event, ruleFlags(event))
  const answers = await Promise.all(
    Array.from({ length: runs }, () => ask(input, apiKey))
  )
  const verdicts = answers.map(parseVerdict)
  return {
    labels: verdicts.map((verdict) => verdict?.label ?? 'none'),
    misses: verdicts.filter((verdict) => verdict?.label !== expected).length,
    first: verdicts[0],
    tokensIn: answers.reduce((sum, a) => sum + (a.usage?.input_tokens ?? 0), 0),
    tokensOut: answers.reduce(
      (sum, a) => sum + (a.usage?.output_tokens ?? 0),
      0
    ),
  }
}

const parseArgs = (args) => {
  const runs = Number(args.find((arg) => !arg.startsWith('--')) ?? DEFAULT_RUNS)
  if (!Number.isInteger(runs) || runs < 1) {
    throw new Error(`Runs must be a whole number from 1, got "${args[0]}"`)
  }
  return { runs, show: args.includes('--show') }
}

const main = async () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set (see ~/.node-red/.env)')
  }
  const { runs, show } = parseArgs(process.argv.slice(2))

  let misses = 0
  const tokens = { input: 0, output: 0 }
  for (const testCase of CASES) {
    const result = await checkCase(testCase, runs, apiKey)
    misses += result.misses
    tokens.input += result.tokensIn
    tokens.output += result.tokensOut
    const mark = result.misses === 0 ? 'ok  ' : 'MISS'
    console.log(`${mark} ${testCase.name}`)
    console.log(
      `     expected ${testCase.expected}, got ${result.labels.join(' ')}`
    )
    if (show) console.log(`     ${JSON.stringify(result.first)}`)
  }

  const usd =
    (tokens.input * USD_PER_MTOK.input + tokens.output * USD_PER_MTOK.output) /
    1e6
  const total = CASES.length * runs
  console.log(
    `\n${total - misses} of ${total} labels as expected. ${tokens.input} tokens in, ${tokens.output} out, about $${usd.toFixed(4)}.`
  )
  process.exitCode = misses === 0 ? 0 : 1
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
