// GET /api/queue/window  (public) and GET /api/admin/queue/window (admin)
export interface QueueWindowStatus {
  isActive: boolean
  windowStartedAt: string | null
  windowEndsAt: string | null
  timeRemainingSeconds: number
}

// GET /api/queue/display
export interface QueueDriverInfo {
  ticketNumber: string
  firstName: string
  lastName: string
}

export interface QueueDisplayResponse {
  currentDriver: QueueDriverInfo | null
  nextDriver: QueueDriverInfo | null
  previousDriver: QueueDriverInfo | null
  waitingQueue: QueueDriverInfo[]
  waitingCount: number
  estimatedWaitSeconds: number
}

// GET /api/queue/wait-estimate — returns raw integer seconds
export type WaitEstimateResponse = number
