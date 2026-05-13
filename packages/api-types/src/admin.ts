// GET /api/admin/queue
export type AttendeeStatus = 'waiting' | 'driving' | 'done' | 'skipped'

export interface AdminQueueEntry {
  attendeeId: string
  /** Format: "SIM-XXXX" */
  ticketNumber: string
  firstName: string
  lastName: string
  email: string
  queuePosition: number
  status: AttendeeStatus
  estimatedWaitMinutes: number
}

export interface AdminQueueResponse {
  entries: AdminQueueEntry[]
}

// GET /api/admin/session/active  (404 when no active session)
export interface ActiveSessionResponse {
  sessionId: string
  attendeeId: string
  ticketNumber: string
  firstName: string
  lastName: string
  startedAt: string
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

// PATCH /api/admin/attendee/{attendeeId}/skip
export interface SkipAttendeeResponse {
  attendeeId: string
  status: 'skipped'
}

// PATCH /api/admin/session/{sessionId}/cancel
export interface CancelSessionResponse {
  sessionId: string
  status: 'cancelled'
}
