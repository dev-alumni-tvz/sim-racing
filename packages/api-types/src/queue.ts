// GET /api/queue/display
export interface CurrentDriver {
  ticketNumber: string
  firstName: string
  sessionStartedAt: string
  /** Snapshot from server — drive the live timer from sessionStartedAt client-side */
  elapsedSeconds: number
}

export interface NextDriver {
  ticketNumber: string
  firstName: string
  estimatedWaitMinutes: number
}

export interface QueueDisplayResponse {
  currentDriver: CurrentDriver | null
  nextDriver: NextDriver | null
  waitingCount: number
}

// GET /api/queue/wait-estimate?position={n}
export interface WaitEstimateResponse {
  estimatedWaitMinutes: number
}
