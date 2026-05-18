import { useState } from 'react';
import styles from './App.module.css';
import { LeaderboardTable, TicketCard } from '@sim-racing/ui';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useSimulation } from './hooks/useSimulation';
import type { RegistrationResponse } from '@sim-racing/api-types';
import { JoinQueueModal } from './components/JoinQueueModal';

const SIM_MODE = new URLSearchParams(window.location.search).get('sim') === '1';
const VISUAL_MODE = new URLSearchParams(window.location.search).get('visual') === '1';

const VISUAL_TICKET: RegistrationResponse = { attendeeId: 'visual', ticketNumber: '004', queuePosition: 4, estimatedWaitMinutes: 10 };

export default function App() {
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [liveTicket, setLiveTicket] = useState<RegistrationResponse | null>(null);
	const [liveTicketName, setLiveTicketName] = useState('');

	const { data: liveRows } = useLeaderboard(!SIM_MODE, VISUAL_MODE);
	const { rows: simRows, ticket: simTicket, ticketName: simTicketName, join: simJoin } = useSimulation(SIM_MODE);

	const rows = SIM_MODE ? simRows : (liveRows ?? []);
	const ticket = SIM_MODE ? simTicket : VISUAL_MODE ? VISUAL_TICKET : liveTicket;
	const ticketName = SIM_MODE ? simTicketName : VISUAL_MODE ? 'Demo Korisnik' : liveTicketName;

	const filtered = search ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) : rows;

	function handleSuccess(data: RegistrationResponse, firstName: string, lastName: string) {
		setLiveTicket(data);
		setLiveTicketName(`${firstName} ${lastName}`);
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
				{!ticket && !VISUAL_MODE && (
					<button
						className={styles.joinBtn}
						onClick={() => (SIM_MODE ? simJoin() : setModalOpen(true))}
					>
						Join the Queue
					</button>
				)}
			</section>

			{ticket && (
				<div className={styles.ticketWrapper}>
					<TicketCard
						queueNumber={ticket.queuePosition}
						name={ticketName}
						estimatedWaitMinutes={ticket.estimatedWaitMinutes}
					/>
				</div>
			)}

			<div className={styles.heroSeparator} />

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
