import { apiFetch } from './api'

// The POST /api/scores body for a finished match (ScoreManager.summary).
// Name, avatar, owner and timestamp all come from the server.
export const toScoreSubmission = (mode, summary) => ({
  mode,
  score: summary.score,
  accuracy: summary.accuracy,
  reactionTime: summary.averageReactionMs,
})

// Persists a finished match; profile stats update with it on the server.
export const saveMatchResult = ({ mode, summary }) =>
  apiFetch('/api/scores', {
    method: 'POST',
    body: toScoreSubmission(mode, summary),
    auth: true,
  })
