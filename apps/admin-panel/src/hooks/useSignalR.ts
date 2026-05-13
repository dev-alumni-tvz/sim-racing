import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { LeaderboardUpdatedPayload, QueueUpdatedPayload } from '@sim-racing/api-types'
import { buildLeaderboardConnection, buildQueueConnection } from '../services/signalr'

export function useSignalR() {
  const queryClient = useQueryClient()
  const [connected, setConnected] = useState(false)
  const lbRef = useRef<ReturnType<typeof buildLeaderboardConnection> | null>(null)
  const queueRef = useRef<ReturnType<typeof buildQueueConnection> | null>(null)

  useEffect(() => {
    const lb = buildLeaderboardConnection()
    const queue = buildQueueConnection()
    lbRef.current = lb
    queueRef.current = queue

    lb.on('LeaderboardUpdated', (payload: LeaderboardUpdatedPayload) => {
      queryClient.setQueryData(['leaderboard'], payload)
    })

    queue.on('QueueUpdated', (payload: QueueUpdatedPayload) => {
      queryClient.setQueryData(['queueDisplay'], payload)
    })

    queue.on('SessionStarted', () => {
      queryClient.invalidateQueries({ queryKey: ['activeSession'] })
      queryClient.invalidateQueries({ queryKey: ['adminQueue'] })
    })

    queue.on('SessionStopped', () => {
      queryClient.invalidateQueries({ queryKey: ['activeSession'] })
      queryClient.invalidateQueries({ queryKey: ['adminQueue'] })
    })

    const onConnected = () => setConnected(true)
    const onDisconnected = () => setConnected(false)

    lb.onreconnected(onConnected)
    lb.onclose(onDisconnected)
    queue.onreconnected(onConnected)
    queue.onclose(onDisconnected)

    Promise.all([lb.start(), queue.start()])
      .then(onConnected)
      .catch(() => {
        // API not up yet — polling fallback stays active
      })

    return () => {
      lb.stop()
      queue.stop()
    }
  }, [queryClient])

  return { connected }
}
