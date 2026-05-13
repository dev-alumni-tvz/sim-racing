import type { WaitEstimateResponse } from '@sim-racing/api-types'
import { apiFetch } from './api'

export function fetchWaitEstimate(position: number): Promise<WaitEstimateResponse> {
  return apiFetch<WaitEstimateResponse>(`/api/queue/wait-estimate?position=${position}`)
}
