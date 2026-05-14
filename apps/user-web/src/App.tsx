import { useState } from 'react';
import styles from './App.module.css';
import { LeaderboardTable, TicketCard } from '@sim-racing/ui';
import { useLeaderboard } from './hooks/useLeaderboard';
import type { RegistrationResponse } from '@sim-racing/api-types';
import { JoinQueueModal } from './components/JoinQueueModal';

export default function App() {
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [ticket, setTicket] = useState<RegistrationResponse | null>(null);
	const [ticketName, setTicketName] = useState('');

	const { data: rows = [] } = useLeaderboard();

	const filtered = search
		? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
		: rows;

	function handleSuccess(data: RegistrationResponse, firstName: string, lastName: string) {
		setTicket(data);
		setTicketName(`${firstName} ${lastName}`);
		setModalOpen(false);
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
				{!ticket && (
					<button
						className={styles.joinBtn}
						onClick={() => setModalOpen(true)}
					>
						Join the Queue
					</button>
				)}
			</section>

			<div className={styles.heroSeparator} />

			{ticket && (
				<div className={styles.ticketWrapper}>
					<TicketCard
						queueNumber={ticket.queuePosition}
						name={ticketName}
						estimatedWaitMinutes={ticket.estimatedWaitMinutes}
					/>
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

			{modalOpen && (
				<JoinQueueModal
					onClose={() => setModalOpen(false)}
					onSuccess={handleSuccess}
				/>
			)}
		</div>
	);
}
