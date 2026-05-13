import type { LeaderboardEntry } from './leaderboard'
import type { CurrentDriver, NextDriver } from './queue'

// ---- LeaderboardHub (/hubs/leaderboard) ----

export interface LeaderboardUpdatedPayload {
  entries: LeaderboardEntry[]
  lastUpdated: string
}

export interface SessionCompletedPayload {
  sessionId: string
  driverName: string
  durationSeconds: number
}

// ---- QueueHub (/hubs/queue) ----

export interface SessionStartedPayload {
  sessionId: string
  driverName: string
  ticketNumber: string
  startedAt: string
}

export interface SessionStoppedPayload {
  sessionId: string
  driverName: string
  durationSeconds: number
}

export interface QueueUpdatedPayload {
  currentDriver: CurrentDriver | null
  nextDriver: NextDriver | null
  waitingCount: number
}

export interface AttendeeRegisteredPayload {
  ticketNumber: string
  queuePosition: number
  waitingCount: number
}
