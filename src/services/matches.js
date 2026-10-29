import { apiFetch } from './api'

// Starts a server-checked match in `mode` (its display label), for a
// signed-in player pressing Start. Resolves to { matchId, startedAt,
// expiresAt }; the matchId goes back with the match's event log.
export const startMatch = (mode) =>
  apiFetch('/api/matches', { method: 'POST', body: { mode }, auth: true })
