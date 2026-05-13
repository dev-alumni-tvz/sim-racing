import type { FC } from 'react'
import styles from './QueueDisplay.module.css'

export interface QueuePlayer {
  queueNumber: number
  name: string
}

export interface QueueDisplayProps {
  players: QueuePlayer[]
  showAsGrid?: boolean
  newSlotsAt?: string
  freeSlots?: number
}

export const QueueDisplay: FC<QueueDisplayProps> = ({
  players,
  showAsGrid = false,
  newSlotsAt,
  freeSlots,
}) => {
  if (!showAsGrid) {
    return (
      <div className={styles.list}>
        {players.map((p) => (
          <div key={p.queueNumber} className={styles.listRow}>
            <span className={styles.listQueueNum}>#{p.queueNumber}</span>
            <span className={styles.listName}>{p.name}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {players.map((p) => (
        <div key={p.queueNumber} className={styles.tile}>
          <span className={styles.tileNumber}>{p.queueNumber}</span>
        </div>
      ))}
      {newSlotsAt && (
        <div className={styles.infoTile}>
          <span className={styles.infoTileLabel}>New slots open at:</span>
          <span className={styles.infoTileValue}>{newSlotsAt}</span>
        </div>
      )}
      {freeSlots !== undefined && (
        <div className={styles.infoTile}>
          <span className={styles.infoTileLabel}>Free slots available:</span>
          <span className={styles.infoTileValue}>{freeSlots}</span>
        </div>
      )}
    </div>
  )
}
