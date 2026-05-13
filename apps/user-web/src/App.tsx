import { useState } from 'react'
import styles from './App.module.css'
import { LeaderboardTable, TicketCard } from '@sim-racing/ui'
import { useLeaderboard } from './hooks/useLeaderboard'
import { useRegistration } from './hooks/useRegistration'
import type { RegistrationResponse } from '@sim-racing/api-types'

export default function App() {
  const [search, setSearch] = useState('')
  const [ticket, setTicket] = useState<RegistrationResponse | null>(null)

  const { data: rows = [] } = useLeaderboard()
  const registration = useRegistration()

  const filtered = search
    ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : rows

  function handleJoinQueue() {
    // TODO: show registration form modal; for now demo with placeholder data
    registration.mutate(
      { firstName: 'Vaše', lastName: 'Ime', email: 'test@example.com' },
      {
        onSuccess: (data) => setTicket(data),
        onError: () => {
          // API not up — show demo ticket
          setTicket({
            attendeeId: 'demo',
            ticketNumber: 'SIM-0042',
            queuePosition: 42,
            estimatedWaitMinutes: 15,
          })
        },
      }
    )
  }

  return (
    <div className={styles.app}>
      <nav className={styles.navbar}>
        <span className={styles.navBrand}>CareerDay</span>
        <span className={styles.navSponsor}>Treblle</span>
      </nav>

      {ticket && (
        <div className={styles.ticketSection}>
          <TicketCard
            queueNumber={ticket.queuePosition}
            name="Vaše Ime"
            estimatedWaitMinutes={ticket.estimatedWaitMinutes}
          />
        </div>
      )}

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroGlow} />
          <span className={styles.heroTitle}>Sim Racing Challenge</span>
        </div>
        <button className={styles.joinBtn} onClick={handleJoinQueue}>
          Join the Queue
        </button>
      </section>

      <section className={styles.leaderboardSection}>
        <h2 className={styles.lbTitle}>Leaderboard</h2>
        <p className={styles.lbSubtitle}>Tko je najbrži na TVZ-u ?</p>
        <div className={styles.searchRow}>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <LeaderboardTable rows={filtered} size="sm" useDmSans />
        <div className={styles.divider} />
      </section>
    </div>
  )
}
