import type { QueueDisplayResponse } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchQueueDisplay(): Promise<QueueDisplayResponse> {
  return apiFetch<QueueDisplayResponse>('/api/queue/display')
}
