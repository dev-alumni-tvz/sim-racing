import type {
  ActiveSessionResponse,
  StartSessionRequest,
  StartSessionResponse,
  StopSessionResponse,
  SkipAttendeeResponse,
  CancelSessionResponse,
} from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchActiveSession(): Promise<ActiveSessionResponse> {
  return apiFetch<ActiveSessionResponse>('/api/admin/session/active')
}

export function startSession(body: StartSessionRequest): Promise<StartSessionResponse> {
  return apiFetch<StartSessionResponse>('/api/admin/session/start', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function stopSession(): Promise<StopSessionResponse> {
  return apiFetch<StopSessionResponse>('/api/admin/session/stop', { method: 'POST' })
}

export function skipAttendee(attendeeId: string): Promise<SkipAttendeeResponse> {
  return apiFetch<SkipAttendeeResponse>(`/api/admin/attendee/${attendeeId}/skip`, {
    method: 'PATCH',
  })
}

export function cancelSession(sessionId: string): Promise<CancelSessionResponse> {
  return apiFetch<CancelSessionResponse>(`/api/admin/session/${sessionId}/cancel`, {
    method: 'PATCH',
  })
}
