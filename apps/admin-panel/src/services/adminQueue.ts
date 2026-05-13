import type { AdminQueueResponse } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchAdminQueue(): Promise<AdminQueueResponse> {
  return apiFetch<AdminQueueResponse>('/api/admin/queue')
}
