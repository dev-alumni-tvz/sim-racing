import type { FC } from 'react'
import styles from './LeaderboardRow.module.css'

export interface LeaderboardRowProps {
  position: number
  name: string
  lapTime: string
  gap: string | null
  isTop3?: boolean
  size?: 'sm' | 'lg'
  useDmSans?: boolean
}

function rankClass(position: number): string {
  if (position === 1) return styles.rowRank1
  if (position === 2) return styles.rowRank2
  return styles.rowRank3
}

export const LeaderboardRow: FC<LeaderboardRowProps> = ({
  position,
  name,
  lapTime,
  gap,
  isTop3 = false,
  size = 'sm',
  useDmSans = false,
}) => {
  const rowClass = [
    styles.row,
    size === 'lg' ? styles.rowLg : '',
    isTop3 ? styles.rowTop3 : '',
    isTop3 ? rankClass(position) : '',
    useDmSans ? styles.mobile : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rowClass}>
      <span className={styles.pos}>{position}.</span>
      <span className={styles.name}>{name}</span>
      <span className={styles.gap}>{gap ?? '—'}</span>
      <span className={styles.lapTime}>{lapTime}</span>
    </div>
  )
}
