import type {
  ActiveSessionResponse,
  StartSessionRequest,
  StartSessionResponse,
  StopSessionResponse,
  SkipAttendeeResponse,
  CancelSessionResponse,
  EditAttendeeRequest,
  EditLeaderboardRequest,
  SwapQueueRequest,
} from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchActiveSession(): Promise<ActiveSessionResponse | null> {
  return apiFetch<ActiveSessionResponse | null>('/api/admin/session/active')
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
  return apiFetch<SkipAttendeeResponse>(`/api/admin/queue/${attendeeId}/skip`, {
    method: 'POST',
  })
}

export function cancelSession(sessionId: string): Promise<CancelSessionResponse> {
  return apiFetch<CancelSessionResponse>(`/api/admin/session/${sessionId}`, {
    method: 'DELETE',
  })
}

export function editAttendee(attendeeId: string, body: EditAttendeeRequest): Promise<void> {
  return apiFetch<void>(`/api/admin/attendee/${attendeeId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteAttendee(attendeeId: string): Promise<void> {
  return apiFetch<void>(`/api/admin/attendee/${attendeeId}`, { method: 'DELETE' })
}

export function editLeaderboardEntry(attendeeId: string, body: EditLeaderboardRequest): Promise<void> {
  return apiFetch<void>(`/api/admin/leaderboard/${attendeeId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteLeaderboardEntry(attendeeId: string): Promise<void> {
  return apiFetch<void>(`/api/admin/leaderboard/${attendeeId}`, { method: 'DELETE' })
}

export function swapQueuePositions(body: SwapQueueRequest): Promise<void> {
  return apiFetch<void>('/api/admin/queue/swap', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
