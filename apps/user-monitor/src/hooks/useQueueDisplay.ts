import { useQuery } from '@tanstack/react-query'
import type { QueueDisplayResponse } from '@sim-racing/api-types'
import { ticketToPosition } from '@sim-racing/api-types'
import { fetchQueueDisplay } from '../services/queueDisplay'

const PLACEHOLDER: QueueDisplayResponse = {
  currentDriver: {
    ticketNumber: 'SIM-0007',
    firstName: 'Davor',
    sessionStartedAt: new Date(Date.now() - 142_000).toISOString(),
    elapsedSeconds: 142,
  },
  nextDriver: {
    ticketNumber: 'SIM-0008',
    firstName: 'Luka',
    estimatedWaitMinutes: 3,
  },
  waitingCount: 11,
}

export function useQueueDisplay(signalRConnected = false) {
  return useQuery({
    queryKey: ['queueDisplay'],
    queryFn: fetchQueueDisplay,
    refetchInterval: signalRConnected ? false : 2500,
    placeholderData: PLACEHOLDER,
    select: (data) => ({
      currentDriver: data.currentDriver
        ? {
            name: data.currentDriver.firstName,
            queueNumber: ticketToPosition(data.currentDriver.ticketNumber),
            sessionStartedAt: data.currentDriver.sessionStartedAt,
          }
        : null,
      nextDriver: data.nextDriver
        ? {
            name: data.nextDriver.firstName,
            queueNumber: ticketToPosition(data.nextDriver.ticketNumber),
            estimatedWaitMinutes: data.nextDriver.estimatedWaitMinutes,
          }
        : null,
      waitingCount: data.waitingCount,
      queueTiles: Array.from({ length: data.waitingCount }, (_, i) => i + 1),
    }),
  })
}
