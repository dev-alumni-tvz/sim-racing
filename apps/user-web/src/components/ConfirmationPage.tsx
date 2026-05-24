import type { FC } from 'react'
import { TicketCard } from '@sim-racing/ui'
import type { ConfirmRegistrationResponse } from '@sim-racing/api-types'
import styles from './ConfirmationPage.module.css'

interface Props {
  isLoading: boolean
  isError: boolean
  confirmData?: ConfirmRegistrationResponse
  storedName?: string
  onContinue: () => void
}

export const ConfirmationPage: FC<Props> = ({ isLoading, isError, confirmData, storedName, onContinue }) => {
  const name = confirmData
    ? `${confirmData.firstName} ${confirmData.lastName}`.trim()
    : storedName ?? ''

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <img src="/CareerDayLogo.svg" alt="Career Day" className={styles.navLogo} />
        <span className={styles.navDivider} />
        <img src="/Treblle%20Logo%20-%20Color.svg" alt="Treblle" className={styles.navLogoSponsor} />
      </nav>

      <div className={styles.content}>
        {isLoading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Potvrđivanje mjesta...</p>
          </div>
        )}

        {isError && (
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>✕</span>
            <h2 className={styles.errorTitle}>Link je istekao</h2>
            <p className={styles.errorSubtitle}>Ovaj link za potvrdu je već iskorišten ili je istekao.</p>
            <button className={styles.btn} onClick={onContinue}>
              Vrati se na početak
            </button>
          </div>
        )}

        {confirmData && (
          <div className={styles.successState}>
            <span className={styles.successIcon}>✓</span>
            <h2 className={styles.successTitle}>
              Potvrđeno<span className={styles.accent}>!</span>
            </h2>
            <p className={styles.successSubtitle}>Tvoje mjesto u redu je osigurano.</p>
            <div className={styles.ticketWrapper}>
              <TicketCard
                queueNumber={parseInt(confirmData.ticketNumber, 10)}
                name={name}
                estimatedWaitMinutes={Math.ceil(confirmData.estimatedWaitSeconds / 60)}
              />
            </div>
            <button className={styles.btn} onClick={onContinue}>
              Vidi leaderboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}