import styles from './App.module.css'
import { LeaderboardTable, PlayerCard, PodiumTop3, QueueDisplay } from '@sim-racing/ui'
import { useLeaderboard } from './hooks/useLeaderboard'
import { useQueueDisplay } from './hooks/useQueueDisplay'
import { useSignalR } from './hooks/useSignalR'

export default function App() {
  const { connected } = useSignalR()

  const { data: rows = [] } = useLeaderboard(connected)
  const { data: queue } = useQueueDisplay(connected)

  const top3 = rows.filter((r) => r.isTop3)
  const rest = rows.filter((r) => !r.isTop3)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerGlow}>
          <div className={styles.glow1} />
          <div className={styles.glow2} />
          <div className={styles.glow3} />
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.poweredBy}>Powered by: Treblle</span>
          <span className={styles.headerSub}>Timings, players, dashboards tracked by APIs.</span>
        </div>
      </header>

      {top3.length === 3 && (
        <section className={styles.podiumSection}>
          <p className={styles.sectionTitle}>Top 3</p>
          <PodiumTop3
            first={{ name: top3[0].name, lapTime: top3[0].lapTime }}
            second={{ name: top3[1].name, lapTime: top3[1].lapTime, gap: top3[1].gap ?? undefined }}
            third={{ name: top3[2].name, lapTime: top3[2].lapTime, gap: top3[2].gap ?? undefined }}
          />
        </section>
      )}

      <div className={styles.countdown}>
        <span className={styles.countdownLabel}>Queue ends:</span>
        <span className={styles.countdownTime}>
          {queue ? `${queue.waitingCount} waiting` : '—'}
        </span>
      </div>

      <section className={styles.drivingSection}>
        {queue?.currentDriver ? (
          <PlayerCard
            variant="current"
            queueNumber={queue.currentDriver.queueNumber}
            name={queue.currentDriver.name}
          />
        ) : (
          <PlayerCard variant="current" queueNumber={0} name="—" />
        )}
        {queue?.nextDriver ? (
          <PlayerCard
            variant="next"
            queueNumber={queue.nextDriver.queueNumber}
            name={queue.nextDriver.name}
          />
        ) : (
          <PlayerCard variant="next" queueNumber={0} name="—" />
        )}
      </section>

      {rest.length > 0 && (
        <section className={styles.leaderboardSection}>
          <p className={styles.sectionTitle}>Leaderboard</p>
          <LeaderboardTable rows={rest} columns={2} size="lg" />
        </section>
      )}

      {queue && (
        <section className={styles.queueSection}>
          <p className={styles.sectionTitle}>Queue</p>
          <QueueDisplay
            players={queue.queueTiles.map((n) => ({ queueNumber: n, name: '' }))}
            showAsGrid
            newSlotsAt="14:30"
            freeSlots={Math.max(0, 20 - queue.waitingCount)}
          />
        </section>
      )}

      <footer className={styles.footer}>View full leaderboard: simrig.com</footer>
    </div>
  )
}
