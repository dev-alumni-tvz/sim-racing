import type { FC } from 'react'
import styles from './TicketCard.module.css'

export interface TicketCardProps {
  queueNumber?: number
  name: string
  estimatedWaitMinutes?: number
}

export const TicketCard: FC<TicketCardProps> = ({ queueNumber, name, estimatedWaitMinutes }) => {
  return (
    <div className={styles.ticket}>
      <span className={styles.label}>Your queue number</span>
      <span className={styles.number}>
        {queueNumber != null ? String(queueNumber).padStart(3, '0') : '—'}
      </span>
      <span className={styles.name}>{name}</span>
      {estimatedWaitMinutes != null && (
        <span className={styles.wait}>~{estimatedWaitMinutes} min wait</span>
      )}
    </div>
  )
}
