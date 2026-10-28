import { apiFetch } from './api'

/*
 * AI recommendations for the signed-in player. Each resolves to
 * { recommendation, model, generatedAt, cached }. A fresh answer takes
 * Claude 10–20 s; a cached one (stats and inputs unchanged) is instant.
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
