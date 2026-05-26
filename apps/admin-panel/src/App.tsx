import { useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import { LeaderboardTable } from '@sim-racing/ui'
import { useTimerStore, formatTime } from './timerStore'
import { useLeaderboard } from './hooks/useLeaderboard'
import { useAdminQueue } from './hooks/useAdminQueue'
import { useActiveSession } from './hooks/useActiveSession'
import { useStartSession, useStopSession, usePauseSession, useResumeSession, useDeleteAttendee } from './hooks/useSessionMutations'
import { useQueueWindow, useStartQueueWindow, useStopQueueWindow } from './hooks/useQueueWindow'
import { useAdminSimulation } from './hooks/useAdminSimulation'
import { QueuePanel } from './components/QueuePanel'
import { LoginPage } from './components/LoginPage'
import { isAuthenticated } from './services/auth'

const SIM_MODE = new URLSearchParams(window.location.search).get('sim') === '1'
const VISUAL_MODE = new URLSearchParams(window.location.search).get('visual') === '1'
const DEMO_MODE = SIM_MODE || VISUAL_MODE

function useClock() {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

function clockStr(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function formatWindowCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => DEMO_MODE || isAuthenticated())

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  return <AdminApp />
}

function AdminApp() {
  const { seconds, start, pause, reset, addTime } = useTimerStore()
  const now = useClock()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showStopQueueConfirm, setShowStopQueueConfirm] = useState(false)
  const [stopQueuePassword, setStopQueuePassword] = useState('')
  const [localWindowEnd, setLocalWindowEnd] = useState<Date | null>(() => {
    try {
      const s = sessionStorage.getItem('sim_wend')
      if (!s) return null
      const d = new Date(s)
      return d.getTime() > Date.now() ? d : null
    } catch { return null }
  })
  const autoStopFired = useRef(false)

  const simMode = SIM_MODE ? 'sim' : VISUAL_MODE ? 'visual' : 'off'
  const simData = useAdminSimulation(simMode)

  const { data: liveLeaderboard = [] } = useLeaderboard(!DEMO_MODE)
  const { data: liveQueue = [] } = useAdminQueue(!DEMO_MODE)
  const { data: liveSession } = useActiveSession(!DEMO_MODE)
  const { data: queueWindow, isPending: windowPending } = useQueueWindow(!DEMO_MODE)

  const queueEntries = simData?.queueEntries ?? liveQueue
  const deletedIds = new Set(liveQueue.filter(e => e.status === 'deleted').map(e => e.attendeeId))
  const leaderboardRows = simData?.leaderboardRows ?? liveLeaderboard.filter(r => !deletedIds.has(r.attendeeId))
  const activeSession = simData?.activeSession ?? liveSession ?? null
  const displaySeconds = simData?.timerSeconds ?? seconds
  const isPaused = activeSession?.isPaused ?? false
  // windowLoaded: true immediately if cached (initialData hit) or in DEMO_MODE
  const windowLoaded = DEMO_MODE || !windowPending

  const startSessionMutation = useStartSession()
  const stopSessionMutation = useStopSession()
  const pauseSessionMutation = usePauseSession()
  const resumeSessionMutation = useResumeSession()
  const deleteAttendeeMutation = useDeleteAttendee()
  const startQueueMutation = useStartQueueWindow()
  const stopQueueMutation = useStopQueueWindow()

  // windowActive: true while a queue window is open.
  // isPending always bridges the click→response gap.
  // isSuccess only counts while the API hasn't confirmed isActive:false — this
  // prevents it from lingering after a natural timer expiry (unlike the STOP QUEUE
  // path which calls startQueueMutation.reset() explicitly).
  const windowActive = DEMO_MODE
    || (queueWindow?.isActive === true)
    || startQueueMutation.isPending
    || (startQueueMutation.isSuccess && queueWindow?.isActive !== false)
    || !!activeSession

  function handleNextPlayer() {
    if (DEMO_MODE) return
    const next = queueEntries.find((e) => e.status === 'waiting')
    if (next) {
      startSessionMutation.mutate({ attendeeId: next.attendeeId })
      reset()
      start()
    }
  }

  function handleFinish() {
    if (DEMO_MODE) return
    stopSessionMutation.mutate()
    reset()
  }

  function handlePauseResume() {
    if (DEMO_MODE) return
    if (isPaused) {
      resumeSessionMutation.mutate()
      start()
    } else {
      pauseSessionMutation.mutate()
      pause()
    }
  }

  function handleDeleteConfirm() {
    if (DEMO_MODE || !activeSession) return
    const attendeeId = activeSession.attendeeId
    stopSessionMutation.mutate(undefined, {
      onSuccess: () => deleteAttendeeMutation.mutate(attendeeId),
    })
    setShowDeleteConfirm(false)
    autoStopFired.current = true
    reset()
  }

  function handleStopQueueConfirm() {
    if (DEMO_MODE) return
    stopQueueMutation.mutate(undefined, {
      onSuccess: () => {
        setLocalWindowEnd(null)
        try { sessionStorage.removeItem('sim_wend') } catch {}
      },
    })
    startQueueMutation.reset()
    setShowStopQueueConfirm(false)
    setStopQueuePassword('')
  }

  // Reset the guard whenever the timer is running above zero
  useEffect(() => {
    if (seconds > 0) autoStopFired.current = false
  }, [seconds])

  useEffect(() => {
    if (DEMO_MODE || seconds !== 0 || !activeSession || isPaused || stopSessionMutation.isPending || autoStopFired.current) return
    autoStopFired.current = true
    handleFinish()
  }, [seconds, activeSession, isPaused, stopSessionMutation.isPending])

  const monitorBase = import.meta.env.VITE_MONITOR_URL ?? 'http://localhost:5175'
  const monitorSrc = DEMO_MODE ? `${monitorBase}?visual=1` : monitorBase

  const windowCountdownLabel = windowActive ? 'Queue ends in:' : 'Next queue in:'
  const windowCountdownSeconds = localWindowEnd
    ? Math.max(0, Math.floor((localWindowEnd.getTime() - now.getTime()) / 1000))
    : null
  const windowCountdownValue = windowCountdownSeconds !== null
    ? formatWindowCountdown(windowCountdownSeconds)
    : '—'

  return (
    <div className={styles.layout}>
      {DEMO_MODE && (
        <div className={`${styles.demoBanner} ${SIM_MODE ? styles.demoBannerSim : ''}`}>
          {SIM_MODE ? 'Simulation Mode' : 'Visual Preview'}
        </div>
      )}

      {/* ---- Left: All-time leaderboard ---- */}
      <aside className={styles.allTimePanel}>
        <p className={styles.panelTitle}>All Time Leaderboard</p>
        <div className={styles.leaderboardScroll}>
          <LeaderboardTable rows={leaderboardRows} size="sm" />
        </div>
      </aside>

      {/* ---- Centre: Timer + controls + queue ---- */}
      <main className={styles.centerPanel}>
        <div className={styles.topRow}>
          <div className={styles.timerWidget}>
            <span className={styles.timerLabel}>Time Left</span>
            <span className={styles.timerDisplay}>{formatTime(displaySeconds)}</span>
            <div className={styles.timerControls}>
              <button className={styles.btnOffset} onClick={() => addTime(-60)} disabled={DEMO_MODE}>-1m</button>
              <button className={styles.btnOffset} onClick={() => addTime(-10)} disabled={DEMO_MODE}>-10s</button>
              <button className={styles.btnOffset} onClick={() => addTime(-1)} disabled={DEMO_MODE}>-1s</button>
              <button
                className={styles.btnPlayPause}
                onClick={handlePauseResume}
                disabled={DEMO_MODE || !activeSession || pauseSessionMutation.isPending || resumeSessionMutation.isPending}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              <button className={styles.btnOffset} onClick={() => addTime(1)} disabled={DEMO_MODE}>+1s</button>
              <button className={styles.btnOffset} onClick={() => addTime(10)} disabled={DEMO_MODE}>+10s</button>
              <button className={styles.btnOffset} onClick={() => addTime(60)} disabled={DEMO_MODE}>+1m</button>
            </div>
          </div>

          <div className={styles.currentTimeWidget}>
            <span className={styles.currentTimeLabel}>Current Time</span>
            <span className={styles.currentTimeClock}>{clockStr(now)}</span>
            <span className={styles.nextQueueLabel}>
              {windowCountdownLabel} {windowCountdownValue}
            </span>
          </div>
        </div>

        {!windowLoaded ? null : !windowActive ? (
          <div className={styles.actionRow}>
            <button
              className={styles.btnNextPlayer}
              onClick={() => {
                if (DEMO_MODE) return
                startQueueMutation.mutate(undefined, {
                  onSuccess: () => {
                    const end = new Date(Date.now() + 60 * 60 * 1000)
                    setLocalWindowEnd(end)
                    try { sessionStorage.setItem('sim_wend', end.toISOString()) } catch {}
                  },
                })
              }}
              disabled={DEMO_MODE || startQueueMutation.isPending}
            >
              START QUEUE
            </button>
          </div>
        ) : (
          <div className={styles.actionRow}>
            <button
              className={styles.btnNextPlayer}
              onClick={handleNextPlayer}
              disabled={DEMO_MODE || !!activeSession || startSessionMutation.isPending}
            >
              NEXT PLAYER
            </button>
            <button
              className={styles.btnFinish}
              onClick={handleFinish}
              disabled={DEMO_MODE || !activeSession || isPaused || stopSessionMutation.isPending}
            >
              FINISH
            </button>
            <button
              className={isPaused ? styles.btnResume : styles.btnPauseToggle}
              onClick={handlePauseResume}
              disabled={DEMO_MODE || !activeSession || pauseSessionMutation.isPending || resumeSessionMutation.isPending}
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            <button
              className={styles.btnDelete}
              onClick={() => !DEMO_MODE && !activeSession && setShowStopQueueConfirm(true)}
              disabled={DEMO_MODE || !!activeSession || isPaused || stopQueueMutation.isPending}
            >
              STOP QUEUE
            </button>
          </div>
        )}

        {showDeleteConfirm && (
          <div className={styles.overlay}>
            <div className={styles.dialog}>
              <p className={styles.dialogTitle}>Are you sure you want to delete this driving session?</p>
              <div className={styles.dialogActions}>
                <button className={styles.btnDialogYes} onClick={handleDeleteConfirm}>Yes</button>
                <button className={styles.btnDialogNo} onClick={() => setShowDeleteConfirm(false)}>No</button>
              </div>
            </div>
          </div>
        )}

        {showStopQueueConfirm && (
          <div className={styles.overlay}>
            <div className={styles.dialog}>
              <p className={styles.dialogTitle}>Enter password to close the queue window.</p>
              <input
                className={styles.input}
                type="password"
                autoFocus
                placeholder="••••"
                value={stopQueuePassword}
                onChange={(e) => setStopQueuePassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && stopQueuePassword === 'STOP') handleStopQueueConfirm()
                  if (e.key === 'Escape') { setShowStopQueueConfirm(false); setStopQueuePassword('') }
                }}
              />
              <div className={styles.dialogActions}>
                <button
                  className={styles.btnDialogYes}
                  onClick={handleStopQueueConfirm}
                  disabled={stopQueuePassword !== 'STOP'}
                >
                  Yes
                </button>
                <button className={styles.btnDialogNo} onClick={() => { setShowStopQueueConfirm(false); setStopQueuePassword('') }}>No</button>
              </div>
            </div>
          </div>
        )}

        <QueuePanel
          queueEntries={queueEntries}
          activeSession={activeSession}
          playedEntries={!DEMO_MODE && !windowActive ? [] : simData?.playedEntries}
          onDeleteSession={() => setShowDeleteConfirm(true)}
        />
      </main>

      {/* ---- Right: Embedded user-monitor ---- */}
      <div className={styles.monitorPanel}>
        <iframe
          className={styles.monitorFrame}
          src={monitorSrc}
          title="User Monitor"
        />
      </div>
    </div>
  )
}
