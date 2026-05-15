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

// GET /api/queue/wait-estimate
export interface WaitEstimateResponse {
  estimatedWaitMinutes: number
}
