import { useState, useEffect } from 'react'

const PHASE_MS = 1000

type LeaderboardRow = {
  position: number
  name: string
  lapTime: string
  gap: string | null
  isTop3: boolean
}

type SimTicket = {
  name: string
  queueNumber: number
  estimatedWaitMinutes: number
}

const ALL_ROWS: LeaderboardRow[] = [
  { position: 1, name: 'Ivan Horvat',      lapTime: '1:23.456', gap: null,     isTop3: true  },
  { position: 2, name: 'Marko Perić',      lapTime: '1:24.089', gap: '+0.633', isTop3: true  },
  { position: 3, name: 'Ana Kovač',        lapTime: '1:24.891', gap: '+1.435', isTop3: true  },
  { position: 4, name: 'Luka Babić',       lapTime: '1:25.234', gap: '+1.778', isTop3: false },
  { position: 5, name: 'Petra Novak',      lapTime: '1:25.678', gap: '+2.222', isTop3: false },
  { position: 6, name: 'Tomislav Jurić',   lapTime: '1:26.012', gap: '+2.556', isTop3: false },
  { position: 7, name: 'Sandra Blažević',  lapTime: '1:26.345', gap: '+2.889', isTop3: false },
  { position: 8, name: 'Robert Filipović', lapTime: '1:26.789', gap: '+3.333', isTop3: false },
  { position: 9, name: 'Maja Šimunović',   lapTime: '1:27.123', gap: '+3.667', isTop3: false },
]

const DEMO_ROW: LeaderboardRow = {
  position: 10, name: 'Demo Korisnik', lapTime: '1:27.456', gap: '+4.000', isTop3: false,
}

const MOCK_TICKET: SimTicket = {
  name: 'Demo Korisnik',
  queueNumber: 3,
  estimatedWaitMinutes: 8,
}

// Phase 0:    button visible, empty LB, no ticket  (waits for click)
// Phase 1:    ticket shown, empty LB               (just joined)
// Phase 2-10: one user added per second, ticket shown
// Phase 11:   Demo Korisnik in LB (done), no ticket, button visible again  (waits for click)
const FINAL_PHASE = 11

export function useSimulation(enabled: boolean) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!enabled || phase === 0 || phase === FINAL_PHASE) return
    const id = setInterval(() => setPhase((p) => p + 1), PHASE_MS)
    return () => clearInterval(id)
  }, [enabled, phase])

  const join = () => {
    if (enabled && (phase === 0 || phase === FINAL_PHASE)) setPhase(1)
  }

  if (!enabled) return { rows: [], ticket: null, join: () => {} }

  const hasRaced = phase === FINAL_PHASE
  const showTicket = phase > 0 && !hasRaced
  // phase 0 & 1 → 0 rows; phase 2 → 1 row; … phase 10 → 9 rows; phase 11 → all 10
  const rows = hasRaced
    ? [...ALL_ROWS, DEMO_ROW]
    : ALL_ROWS.slice(0, Math.max(0, phase - 1))

  return {
    rows,
    ticket: showTicket ? MOCK_TICKET : null,
    join,
  }
}
