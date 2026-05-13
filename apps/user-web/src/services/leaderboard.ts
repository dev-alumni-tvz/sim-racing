import type { LeaderboardResponse } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchLeaderboard(): Promise<LeaderboardResponse> {
  return apiFetch<LeaderboardResponse>('/api/leaderboard')
}
