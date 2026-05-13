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

  return (
    <div className={cardClass}>
      <span className={styles.label}>{LABELS[variant]}</span>
      <span className={styles.number}>{queueNumber}</span>
      <span className={styles.name}>{name}</span>
    </div>
  )
}
