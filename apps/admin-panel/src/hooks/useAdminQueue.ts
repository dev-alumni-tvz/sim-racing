import { useQuery } from '@tanstack/react-query'
import type { AdminQueueResponse } from '@sim-racing/api-types'
import { fullName, ticketToPosition } from '@sim-racing/api-types'
import { fetchAdminQueue } from '../services/adminQueue'

const PLACEHOLDER: AdminQueueResponse = {
  entries: [
    { attendeeId: 'a1', ticketNumber: 'SIM-0007', firstName: 'Davor',    lastName: 'Martinović', email: 'd.m@example.com', queuePosition: 7, status: 'driving',  estimatedWaitMinutes: 0 },
    { attendeeId: 'a2', ticketNumber: 'SIM-0008', firstName: 'Luka',     lastName: 'Babić',      email: 'l.b@example.com', queuePosition: 8, status: 'waiting',  estimatedWaitMinutes: 3 },
    { attendeeId: 'a3', ticketNumber: 'SIM-0009', firstName: 'Filip',    lastName: 'Knežević',   email: 'f.k@example.com', queuePosition: 9, status: 'waiting',  estimatedWaitMinutes: 8 },
    { attendeeId: 'a4', ticketNumber: 'SIM-0010', firstName: 'Ivana',    lastName: 'Vuković',    email: 'i.v@example.com', queuePosition: 10, status: 'waiting', estimatedWaitMinutes: 13 },
    { attendeeId: 'a5', ticketNumber: 'SIM-0011', firstName: 'Nikola',   lastName: 'Rajković',   email: 'n.r@example.com', queuePosition: 11, status: 'waiting', estimatedWaitMinutes: 18 },
    { attendeeId: 'a6', ticketNumber: 'SIM-0012', firstName: 'Tea',      lastName: 'Živković',   email: 't.z@example.com', queuePosition: 12, status: 'waiting', estimatedWaitMinutes: 23 },
    { attendeeId: 'a7', ticketNumber: 'SIM-0013', firstName: 'Bruno',    lastName: 'Stanković',  email: 'b.s@example.com', queuePosition: 13, status: 'waiting', estimatedWaitMinutes: 28 },
  ],
}

export function useAdminQueue() {
  return useQuery({
    queryKey: ['adminQueue'],
    queryFn: fetchAdminQueue,
    refetchInterval: 2500,
    placeholderData: PLACEHOLDER,
    select: (data) =>
      data.entries.map((e) => ({
        attendeeId: e.attendeeId,
        queueNumber: ticketToPosition(e.ticketNumber),
        ticketNumber: e.ticketNumber,
        name: fullName(e.firstName, e.lastName),
        status: e.status,
        estimatedWaitMinutes: e.estimatedWaitMinutes,
      })),
  })
}
