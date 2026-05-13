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
    useDmSans ? styles.mobile : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rowClass}>
      <span className={styles.pos}>{position}</span>
      <span className={styles.name}>{name}</span>
      <span className={styles.lapTime}>{lapTime}</span>
      <span className={styles.gap}>{gap ?? '—'}</span>
    </div>
  )
}
