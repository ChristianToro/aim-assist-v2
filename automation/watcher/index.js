// The leaderboard watcher's logic, loaded into Node-RED as
// global.get('watcher') by ~/.node-red/settings.js (PLAN-AUTOMATION.md).
export { ALERTS, decide } from './decide.js'
export { ruleFlags } from './flags.js'
export {
  API_VERSION,
  MESSAGES_URL,
  claudeInput,
  claudeRequest,
  parseVerdict,
} from './claude.js'
export { alertPost } from './alert.js'
export { plainPost } from './message.js'
