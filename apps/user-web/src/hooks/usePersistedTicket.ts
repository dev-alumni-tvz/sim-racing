import { useState } from 'react'

const STORAGE_KEY = 'sim_racing_ticket'

interface PendingTicket {
  status: 'pending'
  attendeeId: string
  name: string
}

interface ConfirmedTicket {
  status: 'confirmed'
  attendeeId: string
  name: string
  queueNumber: number
  estimatedWaitMinutes: number
}

type StoredTicket = PendingTicket | ConfirmedTicket

function load(): StoredTicket | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredTicket) : null
  } catch {
    return null
  }
}

function save(t: StoredTicket) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t))
}

export function usePersistedTicket() {
  const [stored, setStored] = useState<StoredTicket | null>(load)

  function registerPending(attendeeId: string, name: string) {
    const t: PendingTicket = { status: 'pending', attendeeId, name }
    save(t)
    setStored(t)
  }

  function confirmTicket(queueNumber: number, estimatedWaitMinutes: number, name?: string) {
    const resolvedName = name || stored?.name || ''
    const t: ConfirmedTicket = {
      status: 'confirmed',
      attendeeId: stored?.attendeeId ?? '',
      name: resolvedName,
      queueNumber,
      estimatedWaitMinutes,
    }
    save(t)
    setStored(t)
  }

  return { stored, registerPending, confirmTicket }
}
