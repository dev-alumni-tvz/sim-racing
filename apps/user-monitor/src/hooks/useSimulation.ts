import { useState, useEffect } from 'react'

const PEOPLE = [
  { number: 1, firstName: 'Luka',     lastName: 'Babić'     },
  { number: 2, firstName: 'Filip',    lastName: 'Knežević'  },
  { number: 3, firstName: 'Ivana',    lastName: 'Vuković'   },
  { number: 4, firstName: 'Nikola',   lastName: 'Rajković'  },
  { number: 5, firstName: 'Tea',      lastName: 'Živković'  },
  { number: 6, firstName: 'Bruno',    lastName: 'Stanković' },
  { number: 7, firstName: 'Petra',    lastName: 'Novak'     },
  { number: 8, firstName: 'Tomislav', lastName: 'Jurić'     },
  { number: 9, firstName: 'Maja',     lastName: 'Horvat'    },
  { number: 10, firstName: 'Ivan',    lastName: 'Perić'     },
]

const MAX_WAITING = 8

function pad3(n: number): string {
  return String(n).padStart(3, '0')
}

function randomLapMs(): number {
  return Math.floor(75_000 + Math.random() * 20_000) // 1:15.000 – 1:35.000
}

function formatLapMs(ms: number): string {
  const s = ms / 1000
  const m = Math.floor(s / 60)
  const rem = (s % 60).toFixed(3).padStart(6, '0')
  return `${m}:${rem}`
}

function nextFullHour(): string {
  const now = new Date()
  const next = new Date(now)
  next.setHours(now.getHours() + 1, 0, 0, 0)
  return `${String(next.getHours()).padStart(2, '0')}:00H`
}

interface SimPerson {
  number: number
  firstName: string
  lastName: string
}

interface SimEntry {
  person: SimPerson
  lapMs: number
}

interface SimState {
  tick: number
  addedCount: number
  currentDriver: SimPerson | null
  nextDriver: SimPerson | null
  previousDriver: SimPerson | null
  waitingQueue: SimPerson[]
  leaderboard: SimEntry[]
  drivingStartTick: number
}

const INITIAL: SimState = {
  tick: 0,
  addedCount: 0,
  currentDriver: null,
  nextDriver: null,
  previousDriver: null,
  waitingQueue: [],
  leaderboard: [],
  drivingStartTick: 0,
}

function advance(s: SimState): SimState {
  const next: SimState = {
    ...s,
    tick: s.tick + 1,
    waitingQueue: [...s.waitingQueue],
    leaderboard: [...s.leaderboard],
  }

  // Add one person every 2 ticks
  if (next.tick % 2 === 0 && next.addedCount < PEOPLE.length) {
    const person = PEOPLE[next.addedCount]
    next.addedCount++
    if (!next.currentDriver) {
      next.currentDriver = person
      next.drivingStartTick = next.tick
    } else if (!next.nextDriver) {
      next.nextDriver = person
    } else {
      next.waitingQueue = [...next.waitingQueue, person]
    }
  }

  // Finish current driver after 10 ticks
  if (next.currentDriver && next.tick - next.drivingStartTick >= 10) {
    const lapMs = randomLapMs()
    next.leaderboard = [...s.leaderboard, { person: next.currentDriver, lapMs }]
      .sort((a, b) => a.lapMs - b.lapMs)
    next.previousDriver = next.currentDriver
    next.currentDriver = next.nextDriver
    next.nextDriver = next.waitingQueue[0] ?? null
    next.waitingQueue = next.waitingQueue.slice(1)
    if (next.currentDriver) next.drivingStartTick = next.tick
  }

  return next
}

export function useSimulation(active: boolean) {
  const [state, setState] = useState<SimState>(INITIAL)

  useEffect(() => {
    setState(INITIAL)
    if (!active) return
    const id = setInterval(() => setState(s => advance(s)), 1000)
    return () => clearInterval(id)
  }, [active])

  const leaderMs = state.leaderboard[0]?.lapMs ?? 0

  const rows = state.leaderboard.map((entry, idx) => ({
    position: idx + 1,
    name: `${entry.person.firstName} ${entry.person.lastName}`,
    lapTime: formatLapMs(entry.lapMs),
    gap: idx === 0 ? null : `+${((entry.lapMs - leaderMs) / 1000).toFixed(3)}`,
    isTop3: idx < 3,
  }))

  const secsLeft = state.currentDriver
    ? Math.max(0, 10 - (state.tick - state.drivingStartTick))
    : 0

  const queue = {
    currentDriver: state.currentDriver
      ? { name: `${state.currentDriver.firstName} ${state.currentDriver.lastName}`, queueNumber: state.currentDriver.number }
      : null,
    nextDriver: state.nextDriver
      ? { name: `${state.nextDriver.firstName} ${state.nextDriver.lastName}`, queueNumber: state.nextDriver.number }
      : null,
    previousDriver: state.previousDriver
      ? { name: `${state.previousDriver.firstName} ${state.previousDriver.lastName}`, queueNumber: state.previousDriver.number }
      : null,
    waitingQueue: state.waitingQueue.map(p => ({
      ticketNumber: pad3(p.number),
      firstName: p.firstName,
      lastName: p.lastName,
    })),
    waitingCount: state.waitingQueue.length,
    freeSlots: Math.max(0, MAX_WAITING - state.waitingQueue.length),
    newSlotsAt: nextFullHour(),
    estimatedWaitSeconds: secsLeft + state.waitingQueue.length * 10,
  }

  return { rows, queue }
}
