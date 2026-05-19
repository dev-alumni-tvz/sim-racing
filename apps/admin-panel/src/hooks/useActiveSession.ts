import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import type { ActiveSessionResponse } from '@sim-racing/api-types'
import { fullName } from '@sim-racing/api-types'
import { fetchActiveSession } from '../services/session'

type Session = {
  sessionId: string
  attendeeId: string
  name: string
  ticketNumber: string
  startedAt: string
} | null

function transform(data: ActiveSessionResponse | null): Session {
  if (!data) return null
  return {
    sessionId: data.sessionId,
    attendeeId: data.attendeeId,
    name: fullName(data.attendeeFirstName, data.attendeeLastName),
    ticketNumber: data.ticketNumber,
    startedAt: data.startedAt,
  }
}

export function useActiveSession(enabled = true) {
  const last = useRef<Session>(null)

  const query = useQuery({
    queryKey: ['activeSession'],
    queryFn: () => fetchActiveSession(),
    enabled,
    refetchInterval: 2500,
    select: (data: ActiveSessionResponse | null) => {
      const session = transform(data)
      last.current = session
      return session
    },
  })

  // query.data is undefined only before the first fetch completes
  // null means "fetched, no active session" — both are valid states
  return { ...query, data: query.data !== undefined ? query.data : last.current }
}
