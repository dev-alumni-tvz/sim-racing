import type { FC } from 'react'
import styles from './TicketCard.module.css'

export interface TicketCardProps {
  queueNumber?: number
  name: string
  estimatedWaitMinutes?: number
  /** When set, replaces the queue number with this message (e.g. pending email confirmation) */
  pendingLabel?: string
}

export const TicketCard: FC<TicketCardProps> = ({ queueNumber, name, estimatedWaitMinutes, pendingLabel }) => {
  return (
    <div className={styles.ticket}>
      <span className={styles.label}>{pendingLabel ? 'Check your email' : 'Your queue number'}</span>
      {pendingLabel ? (
        <span className={styles.pendingLabel}>{pendingLabel}</span>
      ) : (
        <span className={styles.number}>
          {queueNumber != null ? String(queueNumber).padStart(3, '0') : '—'}
        </span>
      )}
      <span className={styles.name}>{name}</span>
      {estimatedWaitMinutes != null && (
        <span className={styles.wait}>~{estimatedWaitMinutes} min wait</span>
      )}
    </div>
  )
}
