import type { RegistrationRequest, RegistrationResponse } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function postRegistration(body: RegistrationRequest): Promise<RegistrationResponse> {
  return apiFetch<RegistrationResponse>('/api/registration', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
