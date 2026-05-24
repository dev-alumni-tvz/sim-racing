import { useState, useEffect } from 'react';
import styles from './App.module.css';
import { LeaderboardTable, TicketCard } from '@sim-racing/ui';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useSimulation } from './hooks/useSimulation';
import { useConfirmToken } from './hooks/useConfirmToken';
import { usePersistedTicket } from './hooks/usePersistedTicket';
import type { RegistrationResponse } from '@sim-racing/api-types';
import { JoinQueueModal } from './components/JoinQueueModal';
import { ConfirmationPage } from './components/ConfirmationPage';

const SIM_MODE = new URLSearchParams(window.location.search).get('sim') === '1';
const VISUAL_MODE = new URLSearchParams(window.location.search).get('visual') === '1';

interface TicketState {
  name: string
  queueNumber?: number
  estimatedWaitMinutes?: number
}

const VISUAL_TICKET: TicketState = { name: 'Demo Korisnik', queueNumber: 4, estimatedWaitMinutes: 10 };

export default function App() {
	const [search, setSearch] = useState('');
	const [modalOpen, setModalOpen] = useState(false);
	const [showConfirmPage, setShowConfirmPage] = useState(() =>
		!!new URLSearchParams(window.location.search).get('confirmationToken')
	);

	const { stored, registerPending, confirmTicket } = usePersistedTicket();
	const { data: confirmData, isLoading: confirmLoading, isError: confirmError, hasToken } = useConfirmToken();

	useEffect(() => {
		if (!confirmData) return;
		const name = [confirmData.firstName, confirmData.lastName].filter(Boolean).join(' ') || stored?.name;
		confirmTicket(confirmData.queuePosition, Math.ceil(confirmData.estimatedWaitSeconds / 60), name);
	}, [confirmData]);

	if (showConfirmPage && hasToken) {
		return (
			<ConfirmationPage
				isLoading={confirmLoading}
				isError={confirmError}
				confirmData={confirmData}
				storedName={stored?.name}
				onContinue={() => setShowConfirmPage(false)}
			/>
		);
	}

	const { data: liveRows } = useLeaderboard(!SIM_MODE, VISUAL_MODE);
	const { rows: simRows, ticket: simTicket, join: simJoin } = useSimulation(SIM_MODE);

	const persistedTicket: TicketState | null = stored ? {
		name: stored.name,
		queueNumber: stored.status === 'confirmed' ? stored.queueNumber : undefined,
		estimatedWaitMinutes: stored.status === 'confirmed' ? stored.estimatedWaitMinutes : undefined,
	} : null;

	const rows = SIM_MODE ? simRows : (liveRows ?? []);
	const ticket = SIM_MODE ? simTicket : VISUAL_MODE ? VISUAL_TICKET : persistedTicket;
	const isTicketPending = !SIM_MODE && !VISUAL_MODE && stored?.status === 'pending';

	const filtered = search ? rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())) : rows;

	function handleSuccess(data: RegistrationResponse, firstName: string, lastName: string) {
		registerPending(data.attendeeId, `${firstName} ${lastName}`);
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
				{!ticket && !VISUAL_MODE && !hasToken && (
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
						queueNumber={ticket.queueNumber}
						name={ticket.name}
						estimatedWaitMinutes={ticket.estimatedWaitMinutes}
						pendingLabel={isTicketPending ? 'Confirm your email\nto get your queue number' : undefined}
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
