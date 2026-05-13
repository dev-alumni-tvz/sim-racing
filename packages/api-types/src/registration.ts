// POST /api/registration
export interface RegistrationRequest {
  firstName: string
  lastName: string
  email: string
}

export interface RegistrationResponse {
  attendeeId: string
  /** Format: "SIM-XXXX", e.g. "SIM-0047" */
  ticketNumber: string
  queuePosition: number
  estimatedWaitMinutes: number
}

export interface RegistrationConflictResponse {
  error: string
}
