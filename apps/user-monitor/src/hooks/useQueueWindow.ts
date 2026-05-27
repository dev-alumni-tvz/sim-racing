import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import type { QueueWindowStatus } from '@sim-racing/api-types'
import { fetchQueueWindow } from '../services/queueWindow'

const INACTIVE: QueueWindowStatus = {
  isActive: false,
  windowStartedAt: null,
  windowEndsAt: null,
  timeRemainingSeconds: 0,
}

export function useQueueWindow(enabled = true) {
  const last = useRef<QueueWindowStatus>(INACTIVE)

  const query = useQuery({
    queryKey: ['queueWindow'],
    queryFn: fetchQueueWindow,
    enabled,
    refetchInterval: 2500,
    select: (data) => {
      last.current = data
      return data
    },
  })

  return { ...query, data: query.data ?? last.current }
}
