import { apiFetch } from './api'

/*
 * AI recommendations for the signed-in player. Each answer is an entry,
 * { id, recommendation, context, model, generatedAt }. A fresh answer
 * takes Claude 10–20 s; a cached one (stats and inputs unchanged) is
 * instant and also carries `cached: true`.
 */

// `setup` is the player's current mouse: { dpi?, pollingRateHz? }.
export const getHardwareInsight = (setup = {}) =>
  apiFetch('/api/insights/hardware', {
    method: 'POST',
    body: { setup },
    auth: true,
  })

export const getPlatformInsight = () =>
  apiFetch('/api/insights/platforms', { method: 'POST', auth: true })

// The player's past answers of a kind, newest first. A free read: no
// Claude call and no daily limit.
const listEntries = async (path) => {
  const { entries } = await apiFetch(path, { auth: true })
  return entries
}

export const listHardwareInsights = () => listEntries('/api/insights/hardware')

export const listPlatformInsights = () => listEntries('/api/insights/platforms')
