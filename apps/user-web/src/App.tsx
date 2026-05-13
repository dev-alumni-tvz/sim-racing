import { useState } from 'react';
import styles from './App.module.css';
import { LeaderboardTable } from '@sim-racing/ui';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useRegistration } from './hooks/useRegistration';
import type { RegistrationResponse } from '@sim-racing/api-types';

export default function App() {
	const [search, setSearch] = useState('');
	const [ticket, setTicket] = useState<RegistrationResponse | null>(null);

	const { data: rows = [] } = useLeaderboard();
	const registration = useRegistration();

	const filtered = search ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) : rows;

	function handleJoinQueue() {
		// TODO: open registration form modal
		registration.mutate(
			{ firstName: 'Vaše', lastName: 'Ime', email: 'test@example.com' },
			{
				onSuccess: (data) => setTicket(data),
				onError: () => {
					setTicket({
						attendeeId: 'demo',
						ticketNumber: 'SIM-0042',
						queuePosition: 42,
						estimatedWaitMinutes: 15,
					});
				},
			},
		);
	}

	return (
		<div className={styles.app}>
			<nav className={styles.navbar}>
				<img
					src="/CareerDayLogo.svg"
					alt="Career Day"
					className={styles.navLogo}
				/>
				<span className={styles.navDivider}></span>
				<img
					src="/Treblle%20Logo%20-%20Color.svg"
					alt="Treblle"
					className={styles.navLogoSponsor}
				/>
			</nav>

			<section className={styles.hero}>
				<h1 className={styles.heroTitle}>
					Misliš da si najbrži
					<br />
					na <span className={styles.heroHighlight}>#CD26</span>?
				</h1>
				<p className={styles.heroSubtitle}>
					Prijavi se, odvezi svoj najbolji krug i<br />
					popni se na leaderboard.
				</p>
				<button
					className={styles.joinBtn}
					onClick={handleJoinQueue}
				>
					Join the Queue
				</button>
			</section>
			<div className={styles.heroSeparator} />
			{ticket && (
				<div className={styles.ticketBanner}>
					<span className={styles.ticketNum}>{ticket.ticketNumber}</span>
					<span className={styles.ticketWait}>
						Pozicija #{ticket.queuePosition} · ~{ticket.estimatedWaitMinutes} min
					</span>
				</div>
			)}

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
				<LeaderboardTable
					rows={filtered}
					size="sm"
					useDmSans
				/>
				<div className={styles.divider} />
			</section>
		</div>
	);
}
