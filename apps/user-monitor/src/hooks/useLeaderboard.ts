import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import type { LeaderboardResponse } from '@sim-racing/api-types'
import { computeGap, fullName } from '@sim-racing/api-types'
import { fetchLeaderboard } from '../services/leaderboard'

const EMPTY_PLACEHOLDER: LeaderboardResponse = {
  entries: [],
  lastUpdated: new Date().toISOString(),
}

const VISUAL_PLACEHOLDER: LeaderboardResponse = {
  entries: [
    { rank: 1,  attendeeId: 'v01', ticketNumber: '001', firstName: 'Ivan',     lastName: 'Horvat',     bestLapMs: 83456, bestLapFormatted: '1:23.456', completedAt: '2026-05-13T10:00:00Z' },
    { rank: 2,  attendeeId: 'v02', ticketNumber: '002', firstName: 'Marko',    lastName: 'Perić',      bestLapMs: 84089, bestLapFormatted: '1:24.089', completedAt: '2026-05-13T10:05:00Z' },
    { rank: 3,  attendeeId: 'v03', ticketNumber: '003', firstName: 'Ana',      lastName: 'Kovač',      bestLapMs: 84891, bestLapFormatted: '1:24.891', completedAt: '2026-05-13T10:10:00Z' },
    { rank: 4,  attendeeId: 'v04', ticketNumber: '004', firstName: 'Luka',     lastName: 'Babić',      bestLapMs: 85234, bestLapFormatted: '1:25.234', completedAt: '2026-05-13T10:15:00Z' },
    { rank: 5,  attendeeId: 'v05', ticketNumber: '005', firstName: 'Petra',    lastName: 'Novak',      bestLapMs: 85678, bestLapFormatted: '1:25.678', completedAt: '2026-05-13T10:20:00Z' },
    { rank: 6,  attendeeId: 'v06', ticketNumber: '006', firstName: 'Tomislav', lastName: 'Jurić',      bestLapMs: 86012, bestLapFormatted: '1:26.012', completedAt: '2026-05-13T10:25:00Z' },
    { rank: 7,  attendeeId: 'v07', ticketNumber: '007', firstName: 'Sandra',   lastName: 'Blažević',   bestLapMs: 86345, bestLapFormatted: '1:26.345', completedAt: '2026-05-13T10:30:00Z' },
    { rank: 8,  attendeeId: 'v08', ticketNumber: '008', firstName: 'Robert',   lastName: 'Filipović',  bestLapMs: 86789, bestLapFormatted: '1:26.789', completedAt: '2026-05-13T10:35:00Z' },
    { rank: 9,  attendeeId: 'v09', ticketNumber: '009', firstName: 'Maja',     lastName: 'Šimunović',  bestLapMs: 87123, bestLapFormatted: '1:27.123', completedAt: '2026-05-13T10:40:00Z' },
    { rank: 10, attendeeId: 'v10', ticketNumber: '010', firstName: 'Davor',    lastName: 'Martinović', bestLapMs: 87456, bestLapFormatted: '1:27.456', completedAt: '2026-05-13T10:45:00Z' },
    { rank: 11, attendeeId: 'v11', ticketNumber: '011', firstName: 'Filip',    lastName: 'Knežević',   bestLapMs: 87890, bestLapFormatted: '1:27.890', completedAt: '2026-05-13T10:50:00Z' },
    { rank: 12, attendeeId: 'v12', ticketNumber: '012', firstName: 'Ivana',    lastName: 'Vuković',    bestLapMs: 88234, bestLapFormatted: '1:28.234', completedAt: '2026-05-13T10:55:00Z' },
    { rank: 13, attendeeId: 'v13', ticketNumber: '013', firstName: 'Nikola',   lastName: 'Rajković',   bestLapMs: 88678, bestLapFormatted: '1:28.678', completedAt: '2026-05-13T11:00:00Z' },
  ],
  lastUpdated: '2026-05-13T11:00:00Z',
}

function transform(data: LeaderboardResponse) {
  const leaderMs = data.entries[0]?.bestLapMs ?? 0
  const rows = data.entries.map((e) => ({
    position: e.rank,
    name: fullName(e.firstName, e.lastName),
    lapTime: e.bestLapFormatted,
    gap: e.rank === 1 ? null : computeGap(e.bestLapMs, leaderMs),
    isTop3: e.rank <= 3,
  }))
  // Keep raw completedAt timestamps so callers can filter by queue window
  const completions: { completedAt: string }[] = data.entries.map((e) => ({
    completedAt: e.completedAt,
  }))
  return { rows, completions }
}

export function useLeaderboard(enabled = true, visualMode = false) {
  const lastResult = useRef(transform(visualMode ? VISUAL_PLACEHOLDER : EMPTY_PLACEHOLDER))

  const query = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    enabled,
    refetchInterval: 2500,
    select: (data) => {
      const result = transform(data)
      lastResult.current = result
      return result
    },
  })

  return { ...query, data: query.data ?? lastResult.current }
}
