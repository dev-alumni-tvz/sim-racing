import { useQuery } from '@tanstack/react-query'
import { fetchWaitEstimate } from '../services/queueWait'

export function useWaitEstimate(position: number | null) {
  return useQuery({
    queryKey: ['waitEstimate', position],
    queryFn: () => fetchWaitEstimate(position!),
    enabled: position !== null,
    refetchInterval: 30_000,
    select: (data) => data.estimatedWaitMinutes,
  })
}
