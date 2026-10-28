import { apiFetch } from './api'

/*
 * The signed-in player's profile: { uid, gamesPlayed, highestScore,
 * averageAccuracy, favoriteMode, createdAt }. The server derives the
 * stats from their scores and knows who's asking from the token, so
 * there's no uid to pass and nothing to keep in sync after a match.
 */
export const getUserProfile = () => apiFetch('/api/me', { auth: true })
