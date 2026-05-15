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
  showHeaders?: boolean
}

const HEADERS = ['Pos', 'Name', 'Gap', 'Lap Time']

const HeaderRow: FC = () => (
  <div className={styles.headerRow}>
    {HEADERS.map((h) => (
      <span key={h} className={styles.headerCell}>{h}</span>
    ))}
  </div>
)

export const LeaderboardTable: FC<LeaderboardTableProps> = ({
  rows,
  columns = 1,
  size = 'sm',
  useDmSans = false,
  maxHeight,
  showHeaders = false,
}) => {
  const renderRows = (items: typeof rows) =>
    items.map((row) => (
      <LeaderboardRow key={row.position} {...row} size={size} useDmSans={useDmSans} />
    ))

  return (
    <div className={styles.wrapper}>
      {columns === 2 ? (
        <div className={styles.twoCol}>
          <div className={styles.column}>
            {showHeaders && <HeaderRow />}
            {renderRows(rows.slice(0, Math.ceil(rows.length / 2)))}
          </div>
          <div className={styles.column}>
            {showHeaders && <HeaderRow />}
            {renderRows(rows.slice(Math.ceil(rows.length / 2)))}
          </div>
        </div>
      ) : (
        <div
          className={`${styles.oneCol} ${maxHeight ? styles.scrollable : ''}`}
          style={maxHeight ? { maxHeight } : undefined}
        >
          {showHeaders && <HeaderRow />}
          {renderRows(rows)}
        </div>
      )}
    </div>
  )
}
