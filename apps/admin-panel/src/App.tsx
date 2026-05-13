import { useEffect, useState } from 'react'
import styles from './App.module.css'
import { LeaderboardTable, QueueDisplay } from '@sim-racing/ui'
import { useTimerStore, formatTime } from './timerStore'
import { useLeaderboard } from './hooks/useLeaderboard'
import { useAdminQueue } from './hooks/useAdminQueue'
import { useActiveSession } from './hooks/useActiveSession'
import { useStartSession, useStopSession } from './hooks/useSessionMutations'
import { useSignalR } from './hooks/useSignalR'

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

export default function App() {
  const { seconds, isRunning, start, pause, reset, addTime } = useTimerStore()
  const now = useClock()

  const { connected } = useSignalR()
  const { data: leaderboardRows = [] } = useLeaderboard(connected)
  const { data: queueEntries = [] } = useAdminQueue()
  const { data: activeSession } = useActiveSession()

  const startSessionMutation = useStartSession()
  const stopSessionMutation = useStopSession()

  const queuePlayers = queueEntries
    .filter((e) => e.status === 'waiting' || e.status === 'driving')
    .map((e) => ({ queueNumber: e.queueNumber, name: e.name }))

  function handleNextPlayer() {
    const nextWaiting = queueEntries.find((e) => e.status === 'waiting')
    if (nextWaiting) {
      startSessionMutation.mutate({ attendeeId: nextWaiting.attendeeId })
      reset()
      start()
    }
  }

  function handleStop() {
    stopSessionMutation.mutate()
    pause()
    reset()
  }

  return (
    <div className={styles.layout}>
      {/* ---- Left: All-time leaderboard ---- */}
      <aside className={styles.allTimePanel}>
        <p className={styles.panelTitle}>All Time Leaderboard</p>
        <LeaderboardTable rows={leaderboardRows} size="sm" maxHeight={900} />
      </aside>

      {/* ---- Centre: Timer + controls + queue ---- */}
      <main className={styles.centerPanel}>
        <div className={styles.timerWidget}>
          <span className={styles.timerLabel}>Time Left:</span>
          <span className={styles.timerDisplay}>{formatTime(seconds)}</span>
          <div className={styles.timerControls}>
            <button className={styles.btnOffset} onClick={() => addTime(-60)}>-1m</button>
            <button className={styles.btnOffset} onClick={() => addTime(-10)}>-10s</button>
            <button className={styles.btnOffset} onClick={() => addTime(-1)}>-1s</button>
            <button className={styles.btnPlayPause} onClick={isRunning ? pause : start}>
              {isRunning ? 'PAUSE' : 'PLAY'}
            </button>
            <button className={styles.btnOffset} onClick={() => addTime(1)}>+1s</button>
            <button className={styles.btnOffset} onClick={() => addTime(10)}>+10s</button>
            <button className={styles.btnOffset} onClick={() => addTime(60)}>+1m</button>
          </div>
          <button className={styles.btnOffset} style={{ marginTop: 4 }} onClick={reset}>
            Reset
          </button>
        </div>

        <div className={styles.currentTimeWidget}>
          <span className={styles.currentTimeLabel}>Current Time</span>
          <span className={styles.currentTimeClock}>{clockStr(now)}</span>
          {activeSession && (
            <span className={styles.nextQueueLabel}>
              DRIVING: {activeSession.name} ({activeSession.ticketNumber})
            </span>
          )}
        </div>

        <div className={styles.actionRow}>
          <button
            className={styles.btnNextPlayer}
            onClick={handleNextPlayer}
            disabled={startSessionMutation.isPending}
          >
            NEXT PLAYER
          </button>
          <button
            className={styles.btnPause}
            onClick={handleStop}
            disabled={!activeSession || stopSessionMutation.isPending}
          >
            STOP
          </button>
        </div>

        <div className={styles.queuePanel}>
          <div className={styles.queueHeader}>
            <span className={styles.queueTitle}>Current Queue</span>
            {activeSession && <span className={styles.activeDot} />}
          </div>
          <div className={styles.queueScroll}>
            <QueueDisplay players={queuePlayers} />
          </div>
        </div>
      </main>

      {/* ---- Third panel: Guest leaderboard view ---- */}
      <section className={styles.guestPanel}>
        <p className={styles.panelTitle}>Guests</p>
        <LeaderboardTable rows={leaderboardRows.slice(0, 5)} size="sm" />
      </section>

      {/* ---- Right: Embedded user-monitor ---- */}
      <div className={styles.monitorPanel}>
        <iframe
          className={styles.monitorFrame}
          src={`${import.meta.env.VITE_MONITOR_URL ?? 'http://localhost:5175'}`}
          title="User Monitor"
        />
      </div>
    </div>
  )
}
