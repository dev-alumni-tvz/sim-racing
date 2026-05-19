import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import type { LeaderboardResponse } from '@sim-racing/api-types'
import { computeGap, fullName } from '@sim-racing/api-types'
import { fetchLeaderboard } from '../services/leaderboard'

function transform(data: LeaderboardResponse) {
  const leaderMs = data.entries[0]?.bestLapMs ?? 0
  return data.entries.map((e) => ({
    position: e.rank,
    name: fullName(e.firstName, e.lastName),
    lapTime: e.bestLapFormatted,
    gap: e.rank === 1 ? null : computeGap(e.bestLapMs, leaderMs),
    isTop3: e.rank <= 3,
  }))
}

export function useLeaderboard(enabled = true, visualMode = false) {
  const lastRows = useRef<ReturnType<typeof transform>>([])

  const query = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 2500,
    enabled,
    select: (data) => {
      const rows = transform(data)
      lastRows.current = rows
      return rows
    },
  })

  if (visualMode) return { ...query, data: lastRows.current }
  return { ...query, data: query.data ?? lastRows.current }
}
