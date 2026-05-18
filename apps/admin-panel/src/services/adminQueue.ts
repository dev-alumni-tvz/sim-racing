import type { AdminQueueEntry } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchAdminQueue(): Promise<AdminQueueEntry[]> {
  return apiFetch<AdminQueueEntry[]>('/api/admin/queue')
}
