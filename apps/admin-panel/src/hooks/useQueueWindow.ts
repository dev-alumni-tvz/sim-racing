import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueueWindowStatus } from '@sim-racing/api-types'
import { fetchQueueWindow, startQueueWindow, stopQueueWindow } from '../services/queueWindow'

const CACHE_KEY = 'sim_qw'

function readCache(): QueueWindowStatus | undefined {
  try {
    const s = sessionStorage.getItem(CACHE_KEY)
    return s ? (JSON.parse(s) as QueueWindowStatus) : undefined
  } catch {
    return undefined
  }
}

function writeCache(v: QueueWindowStatus) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(v)) } catch {}
}

export function useQueueWindow(enabled = true) {
  return useQuery({
    queryKey: ['queueWindow'],
    queryFn: async () => {
      const data = await fetchQueueWindow()
      writeCache(data)
      return data
    },
    enabled,
    refetchInterval: 2500,
    initialData: readCache,
  })
}

export function useStartQueueWindow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: startQueueWindow,
    onSuccess: (data) => {
      writeCache(data)
      qc.setQueryData(['queueWindow'], data)
    },
  })
}

export function useStopQueueWindow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: stopQueueWindow,
    onSuccess: (data) => {
      writeCache(data)
      qc.setQueryData(['queueWindow'], data)
    },
  })
}
