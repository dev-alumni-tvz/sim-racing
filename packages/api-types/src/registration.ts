// POST /api/registration
export interface RegistrationRequest {
  firstName: string
  lastName: string
  email: string
}

export interface RegistrationResponse {
  attendeeId: string
  /** 3-digit zero-padded number, e.g. "047" */
  ticketNumber: string
  queuePosition: number
  estimatedWaitMinutes: number
}

export interface RegistrationConflictResponse {
  error: string
}
