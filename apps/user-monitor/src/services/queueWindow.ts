import type { QueueWindowStatus } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchQueueWindow(): Promise<QueueWindowStatus> {
  return apiFetch<QueueWindowStatus>('/api/queue/window')
}
