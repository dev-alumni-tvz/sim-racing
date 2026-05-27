import type {
  ActiveSessionResponse,
  StartSessionRequest,
  StartSessionResponse,
  StopSessionResponse,
  PauseSessionResponse,
  ResumeSessionResponse,
  SkipAttendeeResponse,
  CancelSessionResponse,
  EditAttendeeRequest,
  EditLeaderboardRequest,
  ReorderQueueRequest,
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

export function pauseSession(): Promise<PauseSessionResponse> {
  return apiFetch<PauseSessionResponse>('/api/admin/session/pause', { method: 'POST' })
}

export function resumeSession(): Promise<ResumeSessionResponse> {
  return apiFetch<ResumeSessionResponse>('/api/admin/session/resume', { method: 'POST' })
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

export function editLeaderboardEntry(sessionId: string, body: EditLeaderboardRequest): Promise<void> {
  return apiFetch<void>(`/api/admin/leaderboard/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteLeaderboardEntry(sessionId: string): Promise<void> {
  return apiFetch<void>(`/api/admin/leaderboard/${sessionId}`, { method: 'DELETE' })
}

export function reorderQueuePositions(body: ReorderQueueRequest): Promise<void> {
  return apiFetch<void>('/api/admin/queue/reorder', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
