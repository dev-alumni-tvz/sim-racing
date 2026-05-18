import { useState, useEffect } from 'react'
import type { PlayedEntry } from './useLeaderboardRaw'

const PHASE_MS = 1000
const DRIVE_DURATION = 20
const PAUSE_DURATION = 3
const CYCLE = DRIVE_DURATION + PAUSE_DURATION
const INITIAL_SECONDS = 300

// Visual mode shows a frozen mid-session snapshot
const VISUAL_PHASE = 8

export type SimLeaderboardRow = {
  position: number
  name: string
  lapTime: string
  gap: string | null
  isTop3: boolean
}

const LEADERBOARD_ROWS: SimLeaderboardRow[] = [
  { position: 1,  name: 'Ivan Horvat',      lapTime: '1:23.456', gap: null,     isTop3: true  },
  { position: 2,  name: 'Marko Perić',      lapTime: '1:24.089', gap: '+0.633', isTop3: true  },
  { position: 3,  name: 'Ana Kovač',        lapTime: '1:24.891', gap: '+1.435', isTop3: true  },
  { position: 4,  name: 'Luka Babić',       lapTime: '1:25.234', gap: '+1.778', isTop3: false },
  { position: 5,  name: 'Petra Novak',      lapTime: '1:25.678', gap: '+2.222', isTop3: false },
  { position: 6,  name: 'Tomislav Jurić',   lapTime: '1:26.012', gap: '+2.556', isTop3: false },
  { position: 7,  name: 'Sandra Blažević',  lapTime: '1:26.345', gap: '+2.889', isTop3: false },
  { position: 8,  name: 'Robert Filipović', lapTime: '1:26.789', gap: '+3.333', isTop3: false },
  { position: 9,  name: 'Maja Šimunović',   lapTime: '1:27.123', gap: '+3.667', isTop3: false },
  { position: 10, name: 'Davor Martinović', lapTime: '1:27.456', gap: '+4.000', isTop3: false },
]

type QueueEntry = {
  attendeeId: string
  ticketNumber: string
  queuePosition: number
  name: string
  firstName: string
  lastName: string
  email: string
  status: string
}

type ActiveSession = {
  sessionId: string
  attendeeId: string
  name: string
  ticketNumber: string
  startedAt: string
} | null

const DRIVERS: QueueEntry[] = [
  { attendeeId: 'a1', ticketNumber: '007', queuePosition: 1, name: 'Davor Martinović', firstName: 'Davor',  lastName: 'Martinović', email: 'd.m@example.com', status: 'waiting' },
  { attendeeId: 'a2', ticketNumber: '008', queuePosition: 2, name: 'Luka Babić',       firstName: 'Luka',   lastName: 'Babić',      email: 'l.b@example.com', status: 'waiting' },
  { attendeeId: 'a3', ticketNumber: '009', queuePosition: 3, name: 'Filip Knežević',   firstName: 'Filip',  lastName: 'Knežević',   email: 'f.k@example.com', status: 'waiting' },
  { attendeeId: 'a4', ticketNumber: '010', queuePosition: 4, name: 'Ivana Vuković',    firstName: 'Ivana',  lastName: 'Vuković',    email: 'i.v@example.com', status: 'waiting' },
  { attendeeId: 'a5', ticketNumber: '011', queuePosition: 5, name: 'Nikola Rajković',  firstName: 'Nikola', lastName: 'Rajković',   email: 'n.r@example.com', status: 'waiting' },
  { attendeeId: 'a6', ticketNumber: '012', queuePosition: 6, name: 'Tea Živković',     firstName: 'Tea',    lastName: 'Živković',   email: 't.z@example.com', status: 'waiting' },
]

const INITIAL_PLAYED: PlayedEntry[] = [
  { playOrder: 1, attendeeId: 'lb1', ticketNumber: '001', name: 'Ivan Horvat',  firstName: 'Ivan',  lastName: 'Horvat', rank: 1, gap: null,     lapTime: '1:23.456', bestLapMs: 83456 },
  { playOrder: 2, attendeeId: 'lb2', ticketNumber: '002', name: 'Marko Perić', firstName: 'Marko', lastName: 'Perić',  rank: 2, gap: '+0.633', lapTime: '1:24.089', bestLapMs: 84089 },
]

const DRIVER_RESULTS: PlayedEntry[] = [
  { playOrder: 3, attendeeId: 'a1', ticketNumber: '007', name: 'Davor Martinović', firstName: 'Davor',  lastName: 'Martinović', rank: 10, gap: '+4.000', lapTime: '1:27.456', bestLapMs: 87456 },
  { playOrder: 4, attendeeId: 'a2', ticketNumber: '008', name: 'Luka Babić',       firstName: 'Luka',   lastName: 'Babić',      rank: 4,  gap: '+1.778', lapTime: '1:25.234', bestLapMs: 85234 },
  { playOrder: 5, attendeeId: 'a3', ticketNumber: '009', name: 'Filip Knežević',   firstName: 'Filip',  lastName: 'Knežević',   rank: 7,  gap: '+2.889', lapTime: '1:26.345', bestLapMs: 86345 },
  { playOrder: 6, attendeeId: 'a4', ticketNumber: '010', name: 'Ivana Vuković',    firstName: 'Ivana',  lastName: 'Vuković',    rank: 5,  gap: '+2.222', lapTime: '1:25.678', bestLapMs: 85678 },
  { playOrder: 7, attendeeId: 'a5', ticketNumber: '011', name: 'Nikola Rajković',  firstName: 'Nikola', lastName: 'Rajković',   rank: 3,  gap: '+1.435', lapTime: '1:24.891', bestLapMs: 84891 },
  { playOrder: 8, attendeeId: 'a6', ticketNumber: '012', name: 'Tea Živković',     firstName: 'Tea',    lastName: 'Živković',   rank: 6,  gap: '+2.556', lapTime: '1:26.012', bestLapMs: 86012 },
]

function computeState(phase: number) {
  if (phase === 0) {
    return { activeDriverIdx: -1, timerSeconds: INITIAL_SECONDS, playedDriverCount: 0 }
  }
  const p = phase - 1
  const cycleIdx = Math.floor(p / CYCLE)
  const cyclePhase = p % CYCLE
  const isDriving = cyclePhase < DRIVE_DURATION

  if (cycleIdx >= DRIVERS.length) {
    return { activeDriverIdx: -1, timerSeconds: INITIAL_SECONDS, playedDriverCount: DRIVERS.length }
  }
  return {
    activeDriverIdx: isDriving ? cycleIdx : -1,
    timerSeconds: isDriving ? INITIAL_SECONDS - cyclePhase : INITIAL_SECONDS,
    playedDriverCount: isDriving ? cycleIdx : cycleIdx + 1,
  }
}

export function useAdminSimulation(mode: 'sim' | 'visual' | 'off') {
  const [phase, setPhase] = useState(0)
  const maxPhase = DRIVERS.length * CYCLE + 1

  useEffect(() => {
    if (mode !== 'sim') return
    const id = setInterval(() => {
      setPhase((p) => (p >= maxPhase ? 0 : p + 1))
    }, PHASE_MS)
    return () => clearInterval(id)
  }, [mode, maxPhase])

  if (mode === 'off') return null

  const effectivePhase = mode === 'visual' ? VISUAL_PHASE : phase
  const { activeDriverIdx, timerSeconds, playedDriverCount } = computeState(effectivePhase)

  const activeSession: ActiveSession = activeDriverIdx >= 0
    ? {
        sessionId: DRIVERS[activeDriverIdx].attendeeId,
        attendeeId: DRIVERS[activeDriverIdx].attendeeId,
        name: DRIVERS[activeDriverIdx].name,
        ticketNumber: DRIVERS[activeDriverIdx].ticketNumber,
        startedAt: new Date().toISOString(),
      }
    : null

  const firstQueueIdx = activeDriverIdx >= 0 ? activeDriverIdx : playedDriverCount
  const queueEntries: QueueEntry[] = DRIVERS.slice(firstQueueIdx).map((driver, relIdx) => ({
    ...driver,
    status: activeDriverIdx >= 0 && relIdx === 0 ? 'driving' : 'waiting',
  }))

  const playedEntries: PlayedEntry[] = [
    ...INITIAL_PLAYED,
    ...DRIVER_RESULTS.slice(0, playedDriverCount),
  ]

  return {
    leaderboardRows: LEADERBOARD_ROWS,
    queueEntries,
    activeSession,
    playedEntries,
    timerSeconds,
    isTimerRunning: activeDriverIdx >= 0,
  }
}
