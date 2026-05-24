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
  swapQueuePositions,
} from '../services/session'
import type { EditAttendeeRequest, EditLeaderboardRequest, SwapQueueRequest } from '@sim-racing/api-types'

// Hardcoded test lap time used for local testing (1:23.450)
const TEST_LAP_MS = 83_450

export function useStartSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: startSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['adminQueue'] })
    },
  })
}

export function useStopSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: stopSession,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['adminQueue'] })
      qc.invalidateQueries({ queryKey: ['leaderboard'] })
      editLeaderboardEntry(data.sessionId, { bestLapMs: TEST_LAP_MS }).then(() => {
        qc.invalidateQueries({ queryKey: ['leaderboard'] })
      }).catch(() => {})
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['adminQueue'] })
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

export function useSwapQueue() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SwapQueueRequest) => swapQueuePositions(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminQueue'] }),
  })
}
