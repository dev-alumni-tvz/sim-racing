import { useState, useEffect } from 'react'
import type { FC } from 'react'
import type { RegistrationResponse } from '@sim-racing/api-types'
import { useRegistration } from '../hooks/useRegistration'
import styles from './JoinQueueModal.module.css'

interface Props {
  onClose: () => void
  onSuccess: (data: RegistrationResponse, firstName: string, lastName: string) => void
}

function getErrorMessage(err: Error): string {
  const status = parseInt(err.message)
  if (status === 409) return 'Ova email adresa je već korištena danas.'
  if (status === 400) return 'Red je pun. Novi slobodni slotovi otvaraju se sljedeći sat.'
  return 'Nešto je pošlo po krivu. Pokušaj ponovo.'
}

export const JoinQueueModal: FC<Props> = ({ onClose, onSuccess }) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  const registration = useRegistration()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const emailValid = email.toLowerCase().endsWith('@tvz.hr')
  const canSubmit =
    firstName.trim().length > 0 && lastName.trim().length > 0 && emailValid

  function handleSubmit() {
    if (!canSubmit || registration.isPending) return
    registration.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
      },
      {
        onSuccess: (data) => onSuccess(data, firstName.trim(), lastName.trim()),
      },
    )
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 className={styles.title}>Prijavi se</h2>

        <div className={styles.fields}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Ime</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Ime"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={registration.isPending}
                autoFocus
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Prezime</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Prezime"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={registration.isPending}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={`${styles.input} ${email && !emailValid ? styles.inputError : ''}`}
              type="email"
              placeholder="user@tvz.hr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={registration.isPending}
            />
            {email && !emailValid && (
              <span className={styles.fieldError}>Email mora završavati na @tvz.hr</span>
            )}
          </div>
        </div>

        {registration.isError && (
          <p className={styles.error}>
            {getErrorMessage(registration.error as Error)}
          </p>
        )}

        <button
          className={`${styles.btn} ${canSubmit ? styles.btnActive : styles.btnInactive}`}
          onClick={handleSubmit}
          disabled={!canSubmit || registration.isPending}
        >
          {registration.isPending ? 'Prijava...' : 'Join the Queue'}
        </button>
      </div>
    </div>
  )
}
