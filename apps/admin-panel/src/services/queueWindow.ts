import type { QueueWindowStatus } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchQueueWindow(): Promise<QueueWindowStatus> {
  return apiFetch<QueueWindowStatus>('/api/admin/queue/window')
}

export function startQueueWindow(): Promise<QueueWindowStatus> {
  return apiFetch<QueueWindowStatus>('/api/admin/queue/window/start', { method: 'POST' })
}

export function stopQueueWindow(): Promise<QueueWindowStatus> {
  return apiFetch<QueueWindowStatus>('/api/admin/queue/window/stop', { method: 'POST' })
}
