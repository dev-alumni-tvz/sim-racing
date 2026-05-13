import type { FC } from 'react'
import { LeaderboardRow } from './LeaderboardRow'
import type { LeaderboardRowProps } from './LeaderboardRow'
import styles from './LeaderboardTable.module.css'

export interface LeaderboardTableProps {
  rows: Omit<LeaderboardRowProps, 'size' | 'useDmSans'>[]
  columns?: 1 | 2
  size?: 'sm' | 'lg'
  useDmSans?: boolean
  maxHeight?: number
}

export const LeaderboardTable: FC<LeaderboardTableProps> = ({
  rows,
  columns = 1,
  size = 'sm',
  useDmSans = false,
  maxHeight,
}) => {
  const headerClass = [styles.header, size === 'lg' ? styles.headerLg : '']
    .filter(Boolean)
    .join(' ')

  const renderRows = (items: typeof rows) =>
    items.map((row) => (
      <LeaderboardRow key={row.position} {...row} size={size} useDmSans={useDmSans} />
    ))

  return (
    <div className={styles.wrapper}>
      <div className={headerClass}>
        <span className={styles.headerCol}>Pos.</span>
        <span className={styles.headerCol}>Name</span>
        <span className={styles.headerCol}>Lap Time</span>
        <span className={styles.headerCol}>Gap</span>
      </div>

      {columns === 2 ? (
        <div className={styles.twoCol}>
          <div className={styles.column}>{renderRows(rows.slice(0, Math.ceil(rows.length / 2)))}</div>
          <div className={styles.column}>{renderRows(rows.slice(Math.ceil(rows.length / 2)))}</div>
        </div>
      ) : (
        <div
          className={`${styles.oneCol} ${maxHeight ? styles.scrollable : ''}`}
          style={maxHeight ? { maxHeight } : undefined}
        >
          {renderRows(rows)}
        </div>
      )}
    </div>
  )
}
