import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import type { LeaderboardResponse } from '@sim-racing/api-types'
import { computeGap, fullName } from '@sim-racing/api-types'
import { fetchLeaderboard } from '../services/leaderboard'

const PLACEHOLDER: LeaderboardResponse = {
  entries: [
    { rank: 1, firstName: 'Ivan',     lastName: 'Horvat',      bestLapMs: 83456, bestLapFormatted: '1:23.456', completedAt: '2026-05-13T10:00:00Z' },
    { rank: 2, firstName: 'Marko',    lastName: 'Perić',       bestLapMs: 84089, bestLapFormatted: '1:24.089', completedAt: '2026-05-13T10:05:00Z' },
    { rank: 3, firstName: 'Ana',      lastName: 'Kovač',       bestLapMs: 84891, bestLapFormatted: '1:24.891', completedAt: '2026-05-13T10:10:00Z' },
    { rank: 4, firstName: 'Luka',     lastName: 'Babić',       bestLapMs: 85234, bestLapFormatted: '1:25.234', completedAt: '2026-05-13T10:15:00Z' },
    { rank: 5, firstName: 'Petra',    lastName: 'Novak',       bestLapMs: 85678, bestLapFormatted: '1:25.678', completedAt: '2026-05-13T10:20:00Z' },
    { rank: 6, firstName: 'Tomislav', lastName: 'Jurić',       bestLapMs: 86012, bestLapFormatted: '1:26.012', completedAt: '2026-05-13T10:25:00Z' },
    { rank: 7, firstName: 'Sandra',   lastName: 'Blažević',    bestLapMs: 86345, bestLapFormatted: '1:26.345', completedAt: '2026-05-13T10:30:00Z' },
    { rank: 8, firstName: 'Robert',   lastName: 'Filipović',   bestLapMs: 86789, bestLapFormatted: '1:26.789', completedAt: '2026-05-13T10:35:00Z' },
    { rank: 9, firstName: 'Maja',     lastName: 'Šimunović',   bestLapMs: 87123, bestLapFormatted: '1:27.123', completedAt: '2026-05-13T10:40:00Z' },
    { rank: 10, firstName: 'Davor',   lastName: 'Martinović',  bestLapMs: 87456, bestLapFormatted: '1:27.456', completedAt: '2026-05-13T10:45:00Z' },
  ],
  lastUpdated: '2026-05-13T10:45:00Z',
}

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

const INITIAL_ROWS = transform(PLACEHOLDER)

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

  if (visualMode) return { ...query, data: INITIAL_ROWS }
  return { ...query, data: query.data ?? lastRows.current }
}
