import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startSession, stopSession, skipAttendee, cancelSession } from '../services/session'

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activeSession'] })
      qc.invalidateQueries({ queryKey: ['adminQueue'] })
    },
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
