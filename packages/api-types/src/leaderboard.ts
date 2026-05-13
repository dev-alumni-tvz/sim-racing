// GET /api/leaderboard
export interface LeaderboardEntry {
  rank: number
  firstName: string
  lastName: string
  /** Lap time in milliseconds */
  bestLapMs: number
  /** Pre-formatted by server, e.g. "1:27.432" */
  bestLapFormatted: string
  completedAt: string
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  lastUpdated: string
}
