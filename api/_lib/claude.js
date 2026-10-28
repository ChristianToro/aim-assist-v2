import Anthropic from '@anthropic-ai/sdk'
import { createStructuredCaller } from './structuredOutput.js'

// Reads ANTHROPIC_API_KEY, a server-only secret. One retry and a minute's
// timeout keep a player from waiting through the SDK's longer defaults.
const client = new Anthropic({ maxRetries: 1, timeout: 60_000 })

export const askClaudeForJson = createStructuredCaller(client)
