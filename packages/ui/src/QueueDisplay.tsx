import type { FC } from 'react'
import styles from './QueueDisplay.module.css'

export interface QueuePlayer {
  queueNumber: number
  name: string
}

export interface QueueSlot {
  ticketNumber: string
  firstName: string
  lastName: string
}

export interface QueueDisplayProps {
  // list mode (admin-panel)
  players?: QueuePlayer[]
  showAsGrid?: boolean
  // grid mode (user-monitor)
  waitingQueue?: QueueSlot[]
  freeSlots?: number
  newSlotsAt?: string
}

function formatTicket(ticketNumber: string): string {
  const n = parseInt(ticketNumber, 10)
  return isNaN(n) ? ticketNumber : String(n).padStart(3, '0')
}

export const QueueDisplay: FC<QueueDisplayProps> = ({
  players = [],
  showAsGrid = false,
  waitingQueue = [],
  freeSlots = 0,
  newSlotsAt,
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
      {waitingQueue.map((slot) => (
        <div key={slot.ticketNumber} className={styles.tile}>
          <span className={styles.tileNumber}>{formatTicket(slot.ticketNumber)}</span>
        </div>
      ))}

      {freeSlots > 0 ? (
        <div className={styles.infoTileFree}>
          <span className={styles.infoTileLabel}>Free slots available:</span>
          <span className={styles.infoTileValue}>{freeSlots}</span>
        </div>
      ) : (
        <div className={styles.infoTileNew}>
          <span className={styles.infoTileLabel}>New slots open at:</span>
          <span className={styles.infoTileValue}>{newSlotsAt ?? '—'}</span>
        </div>
      )}
    </div>
  )
}
