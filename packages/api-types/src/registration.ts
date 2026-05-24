// POST /api/registration → 202 Accepted
export interface RegistrationRequest {
  firstName: string
  lastName: string
  email: string
}

export interface RegistrationResponse {
  attendeeId: string
  message: string
}

// GET /api/registration/confirm?token=<token>
export interface ConfirmRegistrationResponse {
  attendeeId: string
  /** 3-digit zero-padded number, e.g. "047" */
  ticketNumber: string
  queuePosition: number
  estimatedWaitSeconds: number
  firstName: string
  lastName: string
}

export interface RegistrationConflictResponse {
  error: string
}
