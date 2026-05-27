import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { computeGap, fullName } from '@sim-racing/api-types'
import type { LeaderboardResponse } from '@sim-racing/api-types'
import { fetchLeaderboard } from '../services/leaderboard'

function transform(data: LeaderboardResponse) {
  const leaderMs = data.entries[0]?.bestLapMs ?? 0
  const today = new Date().toDateString()
  return data.entries
    .filter((e) => new Date(e.completedAt).toDateString() === today)
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    .map((e, idx) => ({
      playOrder: idx + 1,
      attendeeId: e.attendeeId,
      sessionId: e.sessionId,
      ticketNumber: e.ticketNumber,
      name: fullName(e.firstName, e.lastName),
      firstName: e.firstName,
      lastName: e.lastName,
      rank: e.rank,
      gap: e.rank === 1 ? null : computeGap(e.bestLapMs, leaderMs),
      lapTime: e.bestLapFormatted,
      bestLapMs: e.bestLapMs,
    }))
}

export function useLeaderboardRaw() {
  const last = useRef<PlayedEntry[]>([])

  const query = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    select: (data) => {
      const rows = transform(data)
      last.current = rows
      return rows
    },
  })

  return { ...query, data: query.data ?? last.current }
}

export type PlayedEntry = ReturnType<typeof transform>[number]
