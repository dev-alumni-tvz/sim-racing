// GET /api/admin/queue — returns flat array
export type AttendeeStatus = 'waiting' | 'driving' | 'done' | 'skipped'

export interface AdminQueueEntry {
  attendeeId: string
  ticketNumber: string
  firstName: string
  lastName: string
  email: string
  queuePosition: number
  status: AttendeeStatus
}

export type AdminQueueResponse = AdminQueueEntry[]

// GET /api/admin/session/active  (204 when no active session)
export interface ActiveSessionResponse {
  sessionId: string
  attendeeId: string
  ticketNumber: string
  attendeeFirstName: string
  attendeeLastName: string
  startedAt: string
  isPaused: boolean
}

// POST /api/admin/session/pause
export interface PauseSessionResponse {
  sessionId: string
  isPaused: true
}

// POST /api/admin/session/resume
export interface ResumeSessionResponse {
  sessionId: string
  isPaused: false
}

// POST /api/admin/session/start
export interface StartSessionRequest {
  attendeeId: string
}

export interface StartSessionResponse {
  sessionId: string
  attendeeId: string
  ticketNumber: string
  startedAt: string
}

// POST /api/admin/session/stop
export interface StopSessionResponse {
  sessionId: string
  attendeeId: string
  durationSeconds: number
  /** null immediately after stop — arrives via LeaderboardHub.LeaderboardUpdated */
  bestLapMs: number | null
  bridgeDataReceived: boolean
}

// POST /api/admin/queue/{attendeeId}/skip
export interface SkipAttendeeResponse {
  attendeeId: string
  status: 'skipped'
}

// DELETE /api/admin/session/{sessionId}
export interface CancelSessionResponse {
  sessionId: string
  status: 'cancelled'
}

// PUT /api/admin/attendee/{attendeeId}
export interface EditAttendeeRequest {
  firstName?: string
  lastName?: string
  email?: string
}

// PUT /api/admin/leaderboard/{sessionId}  (sessionId === attendeeId)
export interface EditLeaderboardRequest {
  bestLapMs: number
}

// POST /api/admin/queue/swap
export interface SwapQueueRequest {
  attendeeIdA: string
  attendeeIdB: string
}
