import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import type { QueueDisplayResponse } from '@sim-racing/api-types'
import { fullName, ticketToPosition } from '@sim-racing/api-types'
import { fetchQueueDisplay } from '../services/queueDisplay'

const MAX_WAITING = 25

function nextFullHour(): string {
  const now = new Date()
  const next = new Date(now)
  next.setHours(now.getHours() + 1, 0, 0, 0)
  return `${String(next.getHours()).padStart(2, '0')}:00H`
}

const EMPTY_PLACEHOLDER: QueueDisplayResponse = {
  currentDriver: null,
  nextDriver: null,
  previousDriver: null,
  waitingQueue: [],
  waitingCount: 0,
  estimatedWaitSeconds: 0,
}

const VISUAL_PLACEHOLDER: QueueDisplayResponse = {
  currentDriver:  { ticketNumber: '022', firstName: 'Grobina', lastName: 'Ivković'  },
  nextDriver:     { ticketNumber: '023', firstName: 'Ivan',    lastName: 'Horvat'   },
  previousDriver: { ticketNumber: '020', firstName: 'Ivan',    lastName: 'Horvat'   },
  waitingQueue: [
    { ticketNumber: '024', firstName: 'Luka',     lastName: 'Babić'     },
    { ticketNumber: '025', firstName: 'Filip',    lastName: 'Knežević'  },
    { ticketNumber: '026', firstName: 'Ivana',    lastName: 'Vuković'   },
    { ticketNumber: '027', firstName: 'Nikola',   lastName: 'Rajković'  },
    { ticketNumber: '028', firstName: 'Tea',      lastName: 'Živković'  },
    { ticketNumber: '029', firstName: 'Bruno',    lastName: 'Stanković' },
    { ticketNumber: '030', firstName: 'Petra',    lastName: 'Novak'     },
    { ticketNumber: '031', firstName: 'Tomislav', lastName: 'Jurić'     },
  ],
  waitingCount: 8,
  estimatedWaitSeconds: 0,
}

function transform(data: QueueDisplayResponse) {
  const freeSlots = Math.max(0, MAX_WAITING - data.waitingCount)
  return {
    currentDriver: data.currentDriver
      ? {
          name: fullName(data.currentDriver.firstName, data.currentDriver.lastName),
          queueNumber: ticketToPosition(data.currentDriver.ticketNumber),
        }
      : null,
    nextDriver: data.nextDriver
      ? {
          name: fullName(data.nextDriver.firstName, data.nextDriver.lastName),
          queueNumber: ticketToPosition(data.nextDriver.ticketNumber),
        }
      : null,
    previousDriver: data.previousDriver
      ? {
          name: fullName(data.previousDriver.firstName, data.previousDriver.lastName),
          queueNumber: ticketToPosition(data.previousDriver.ticketNumber),
        }
      : null,
    waitingQueue: data.waitingQueue.filter(
      (s) => s.ticketNumber !== data.nextDriver?.ticketNumber
    ),
    waitingCount: data.waitingCount,
    freeSlots,
    newSlotsAt: nextFullHour(),
    estimatedWaitSeconds: data.estimatedWaitSeconds,
  }
}

export function useQueueDisplay(enabled = true, visualMode = false) {
  const lastQueue = useRef(transform(visualMode ? VISUAL_PLACEHOLDER : EMPTY_PLACEHOLDER))

  const query = useQuery({
    queryKey: ['queueDisplay'],
    queryFn: fetchQueueDisplay,
    enabled,
    refetchInterval: 2500,
    select: (data) => {
      const queue = transform(data)
      lastQueue.current = queue
      return queue
    },
  })

  return { ...query, data: query.data ?? lastQueue.current }
}
