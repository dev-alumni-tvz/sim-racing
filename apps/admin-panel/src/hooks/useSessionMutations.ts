import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  startSession,
  stopSession,
  pauseSession,
  resumeSession,
  skipAttendee,
  cancelSession,
  editAttendee,
  deleteAttendee,
  editLeaderboardEntry,
  deleteLeaderboardEntry,
  reorderQueuePositions,
} from '../services/session'
import type { AdminQueueEntry, ActiveSessionResponse, EditAttendeeRequest, EditLeaderboardRequest, ReorderQueueRequest } from '@sim-racing/api-types'

export function useStartSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: startSession,
    onMutate: (variables) => {
      // Optimistically populate activeSession so windowActive stays true
      // during the gap between mutation success and the refetch completing.
      const queue = qc.getQueryData<AdminQueueEntry[]>(['adminQueue']) ?? []
      const attendee = queue.find(e => e.attendeeId === variables.attendeeId)
      if (attendee) {
        qc.setQueryData<ActiveSessionResponse>(['activeSession'], {
          sessionId: 'optimistic',
          attendeeId: attendee.attendeeId,
          ticketNumber: attendee.ticketNumber,
          attendeeFirstName: attendee.firstName,
          attendeeLastName: attendee.lastName,
          startedAt: new Date().toISOString(),
          isPaused: false,
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['adminQueue'] })
    },
    onError: () => {
      qc.setQueryData(['activeSession'], null)
      qc.invalidateQueries({ queryKey: ['activeSession'] })
    },
  })
}

export function useStopSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: stopSession,
    onMutate: () => {
      qc.setQueryData(['activeSession'], null)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['adminQueue'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
    },
    onError: () => {
      // 400 means no active session — stale frontend state; sync all queries
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['adminQueue'] })
    },
  })
}

export function usePauseSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: pauseSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activeSession'] }),
  })
}

export function useResumeSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: resumeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activeSession'] }),
  })
}

export function useSkipAttendee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attendeeId: string) => skipAttendee(attendeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminQueue'] }),
  })
}

export function useCancelSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sessionId: string) => cancelSession(sessionId),
    onMutate: () => {
      qc.setQueryData(['activeSession'], null)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['adminQueue'] })
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
    },
  })
}

export function useEditAttendee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: EditAttendeeRequest }) =>
      editAttendee(attendeeId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminQueue'] }),
  })
}

export function useDeleteAttendee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attendeeId: string) => deleteAttendee(attendeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminQueue'] }),
  })
}

export function useEditLeaderboardEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ attendeeId, body }: { attendeeId: string; body: EditLeaderboardRequest }) =>
      editLeaderboardEntry(attendeeId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaderboard'] }),
  })
}

export function useDeleteLeaderboardEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attendeeId: string) => deleteLeaderboardEntry(attendeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaderboard'] }),
  })
}

export function useReorderQueue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ReorderQueueRequest) => reorderQueuePositions(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminQueue'] }),
  })
}
