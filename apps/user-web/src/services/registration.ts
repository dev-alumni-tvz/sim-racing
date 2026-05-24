import type { RegistrationRequest, RegistrationResponse, ConfirmRegistrationResponse } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function postRegistration(body: RegistrationRequest): Promise<RegistrationResponse> {
  return apiFetch<RegistrationResponse>('/api/registration', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function confirmRegistration(token: string): Promise<ConfirmRegistrationResponse> {
  return apiFetch<ConfirmRegistrationResponse>(`/api/registration/confirm?token=${encodeURIComponent(token)}`)
}
