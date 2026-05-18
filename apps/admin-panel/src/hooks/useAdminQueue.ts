import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import type { AdminQueueEntry } from '@sim-racing/api-types'
import { fullName } from '@sim-racing/api-types'
import { fetchAdminQueue } from '../services/adminQueue'

function transform(data: AdminQueueEntry[]) {
  return data.map((e) => ({
    attendeeId: e.attendeeId,
    ticketNumber: e.ticketNumber,
    queuePosition: e.queuePosition,
    name: fullName(e.firstName, e.lastName),
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    status: e.status,
  }))
}

export function useAdminQueue(enabled = true) {
  const last = useRef<ReturnType<typeof transform>>([])

  const query = useQuery({
    queryKey: ['adminQueue'],
    queryFn: fetchAdminQueue,
    enabled,
    refetchInterval: 2500,
    select: (data) => {
      const rows = transform(data)
      last.current = rows
      return rows
    },
  })

  return { ...query, data: query.data ?? last.current }
}
