import { useQuery } from '@tanstack/react-query'
import type { ActiveSessionResponse } from '@sim-racing/api-types'
import { fullName } from '@sim-racing/api-types'
import { fetchActiveSession } from '../services/session'

export function useActiveSession() {
  return useQuery({
    queryKey: ['activeSession'],
    queryFn: async () => {
      try {
        return await fetchActiveSession()
      } catch (e) {
        // 404 = no active session — treat as null, not an error
        if (e instanceof Error && e.message.startsWith('404')) return null
        throw e
      }
    },
    refetchInterval: 2500,
    select: (data: ActiveSessionResponse | null) =>
      data
        ? {
            sessionId: data.sessionId,
            attendeeId: data.attendeeId,
            name: fullName(data.firstName, data.lastName),
            ticketNumber: data.ticketNumber,
            startedAt: data.startedAt,
          }
        : null,
  })
}
