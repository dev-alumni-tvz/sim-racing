import { useEffect, useRef, useState } from 'react'
import styles from './App.module.css'
import { LeaderboardTable } from '@sim-racing/ui'
import { useTimerStore, formatTime } from './timerStore'
import { useLeaderboard } from './hooks/useLeaderboard'
import { useAdminQueue } from './hooks/useAdminQueue'
import { useActiveSession } from './hooks/useActiveSession'
import { useStartSession, useStopSession, usePauseSession, useResumeSession, useCancelSession } from './hooks/useSessionMutations'
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

function nextFullHourCountdown(now: Date): string {
  const next = new Date(now)
  next.setHours(next.getHours() + 1, 0, 0, 0)
  const diffMs = next.getTime() - now.getTime()
  const totalSec = Math.floor(diffMs / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
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
  const { seconds, isRunning, start, pause, reset, expire, addTime } = useTimerStore()
  const now = useClock()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const autoStopFired = useRef(false)

  const simMode = SIM_MODE ? 'sim' : VISUAL_MODE ? 'visual' : 'off'
  const simData = useAdminSimulation(simMode)

  const { data: liveLeaderboard = [] } = useLeaderboard(!DEMO_MODE)
  const { data: liveQueue = [] } = useAdminQueue(!DEMO_MODE)
  const { data: liveSession } = useActiveSession(!DEMO_MODE)

  const leaderboardRows = simData?.leaderboardRows ?? liveLeaderboard
  const queueEntries = simData?.queueEntries ?? liveQueue
  const activeSession = simData?.activeSession ?? liveSession ?? null
  const displaySeconds = simData?.timerSeconds ?? seconds
  const displayRunning = simData?.isTimerRunning ?? isRunning
  const isPaused = activeSession?.isPaused ?? false

  const startSessionMutation = useStartSession()
  const stopSessionMutation = useStopSession()
  const pauseSessionMutation = usePauseSession()
  const resumeSessionMutation = useResumeSession()
  const cancelSessionMutation = useCancelSession()

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
    expire()
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
    cancelSessionMutation.mutate(activeSession.sessionId)
    setShowDeleteConfirm(false)
    pause()
    reset()
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
              <button className={styles.btnPlayPause} onClick={DEMO_MODE ? undefined : (displayRunning ? pause : start)} disabled={DEMO_MODE}>
                {displayRunning ? '⏸' : '▶'}
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
              Next queue in: {nextFullHourCountdown(now)}
            </span>
          </div>
        </div>

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
            onClick={() => !DEMO_MODE && activeSession && setShowDeleteConfirm(true)}
            disabled={DEMO_MODE || !activeSession || isPaused || cancelSessionMutation.isPending}
          >
            DELETE
          </button>
        </div>

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

        <QueuePanel
          queueEntries={queueEntries}
          activeSession={activeSession}
          playedEntries={simData?.playedEntries}
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
