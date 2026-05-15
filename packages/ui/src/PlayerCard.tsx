import type { FC } from 'react'
import styles from './PlayerCard.module.css'

export interface PlayerCardProps {
  queueNumber: number
  name: string
  variant: 'current' | 'next' | 'previous'
}

const LABELS = {
  current: 'Currently Driving',
  next: 'Next Up',
  previous: 'Previous',
} as const

export const PlayerCard: FC<PlayerCardProps> = ({ queueNumber, name, variant }) => {
  const cardClass = [styles.card, styles[variant]].join(' ')
  const displayNumber = String(queueNumber).padStart(3, '0')

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>{LABELS[variant]}</span>
      <div className={cardClass}>
        <span className={styles.number}>{displayNumber}</span>
        <span className={styles.name}>{name}</span>
      </div>
    </div>
  )
}
