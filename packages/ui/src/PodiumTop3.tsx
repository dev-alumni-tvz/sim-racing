import type { FC } from 'react'
import styles from './PodiumTop3.module.css'

export interface PodiumEntry {
  name: string
  lapTime: string
  gap?: string
}

export interface PodiumTop3Props {
  first: PodiumEntry
  second: PodiumEntry
  third: PodiumEntry
  queueEndsText?: string
}

const ICONS: Record<'first' | 'second' | 'third', string> = {
  first:  '/gold.svg',
  second: '/silver.svg',
  third:  '/bronce.svg',
}

const PodiumCard: FC<{
  entry: PodiumEntry
  place: 'first' | 'second' | 'third'
  queueEndsText?: string
}> = ({ entry, place, queueEndsText }) => (
  <div className={`${styles.card} ${styles[place]}`}>
    <div className={styles.aboveBox}>
      <img src={ICONS[place]} alt={place} className={styles.icon} />
      <span className={styles.playerName}>{entry.name}</span>
    </div>
    <div className={styles.inBox}>
      <span className={styles.lapTimeLabel}>Lap Time:</span>
      <span className={styles.lapTime}>{entry.lapTime}</span>
      {entry.gap && <span className={styles.gap}>{entry.gap}</span>}
      {queueEndsText && (
        <div className={styles.queueEnds}>
          <img src="/alarm-clock.svg" alt="" className={styles.queueEndsIcon} />
          <span className={styles.queueEndsLabel}>Queue ends:</span>
          <span className={styles.queueEndsTime}>{queueEndsText}</span>
        </div>
      )}
    </div>
  </div>
)

export const PodiumTop3: FC<PodiumTop3Props> = ({ first, second, third, queueEndsText }) => {
  return (
    <div className={styles.podium}>
      <PodiumCard entry={second} place="second" />
      <PodiumCard entry={first} place="first" queueEndsText={queueEndsText} />
      <PodiumCard entry={third} place="third" />
    </div>
  )
}
