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
}

const PodiumCard: FC<{
  entry: PodiumEntry
  place: 'first' | 'second' | 'third'
  rank: number
}> = ({ entry, place, rank }) => (
  <div className={`${styles.card} ${styles[place]}`}>
    <div className={styles.avatarRing} />
    <span className={styles.placeLabel}>#{rank}</span>
    <span className={styles.playerName}>{entry.name}</span>
    <span className={styles.lapTimeLabel}>Lap Time:</span>
    <span className={styles.lapTime}>{entry.lapTime}</span>
    {entry.gap && <span className={styles.gap}>{entry.gap}</span>}
  </div>
)

export const PodiumTop3: FC<PodiumTop3Props> = ({ first, second, third }) => {
  return (
    <div className={styles.podium}>
      <PodiumCard entry={second} place="second" rank={2} />
      <PodiumCard entry={first} place="first" rank={1} />
      <PodiumCard entry={third} place="third" rank={3} />
    </div>
  )
}
