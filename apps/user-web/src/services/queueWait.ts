import { apiFetch } from './api'

export function fetchWaitEstimate(position: number): Promise<number> {
  return apiFetch<number>(`/api/queue/wait-estimate?position=${position}`)
}
