import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { LeaderboardTable, PlayerCard, PodiumTop3, QueueDisplay } from '@sim-racing/ui';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useQueueDisplay } from './hooks/useQueueDisplay';
import { useQueueWindow } from './hooks/useQueueWindow';
import { useSimulation } from './hooks/useSimulation';

const SIM_MODE    = new URLSearchParams(window.location.search).get('sim')    === '1';
const VISUAL_MODE = new URLSearchParams(window.location.search).get('visual') === '1';

function formatSeconds(s: number): string {
	const m = Math.floor(s / 60);
	const sec = s % 60;
	return `${m}m ${sec}s`;
}

export default function App() {
	const { data: liveData } = useLeaderboard(!SIM_MODE, VISUAL_MODE);
	const { data: liveQueue } = useQueueDisplay(!SIM_MODE, VISUAL_MODE);
	const { data: queueWindow } = useQueueWindow(!SIM_MODE && !VISUAL_MODE);
	const { rows: simRows, queue: simQueue } = useSimulation(SIM_MODE);

	// Local countdown that ticks every second and resyncs from API on each poll.
	const [countdownSecs, setCountdownSecs] = useState<number>(0);
	useEffect(() => {
		if (queueWindow?.timeRemainingSeconds !== undefined) {
			setCountdownSecs(queueWindow.timeRemainingSeconds);
		}
	}, [queueWindow?.timeRemainingSeconds]);
	useEffect(() => {
		if (!queueWindow?.isActive) return;
		const id = setInterval(() => setCountdownSecs(s => Math.max(0, s - 1)), 1000);
		return () => clearInterval(id);
	}, [queueWindow?.isActive]);

	const rows = SIM_MODE ? simRows : liveData.rows;
	const rawQueue = SIM_MODE ? simQueue : liveQueue;

	// Total occupied slots = waiting + currently driving + finished this window
	// Filter by windowStartedAt so queue 2 doesn't inherit queue 1's done count
	const MAX_QUEUE = 15;
	const windowStart = queueWindow?.windowStartedAt ? new Date(queueWindow.windowStartedAt) : null;
	const doneThisWindowCount = SIM_MODE ? 0 : liveData.completions.filter(
		(c) => windowStart && new Date(c.completedAt) >= windowStart
	).length;
	const drivingCount = rawQueue.currentDriver ? 1 : 0;
	const totalOccupied = (rawQueue.waitingCount ?? 0) + drivingCount + doneThisWindowCount;
	const freeSlots = Math.max(0, MAX_QUEUE - totalOccupied);
	const newSlotsAt = queueWindow?.windowEndsAt
		? (() => {
			const d = new Date(queueWindow.windowEndsAt!)
			return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}H`
		})()
		: rawQueue.newSlotsAt;

	const windowActive = SIM_MODE || VISUAL_MODE || (queueWindow?.isActive ?? false);
	// Always show the waiting queue so registered people are visible even before
	// the window opens. Only hide the driver cards (current/next/previous) when
	// the window is inactive, since those only apply during an active session.
	const queue = windowActive ? rawQueue : {
		...rawQueue,
		currentDriver: null,
		nextDriver: null,
		previousDriver: null,
	};

	const top3 = rows.filter((r) => r.isTop3);
	const rest = rows.filter((r) => !r.isTop3);

	const EMPTY = { name: '—', lapTime: '--:--.---' };
	const podiumFirst  = top3[0] ? { name: top3[0].name, lapTime: top3[0].lapTime } : EMPTY;
	const podiumSecond = top3[1] ? { name: top3[1].name, lapTime: top3[1].lapTime, gap: top3[1].gap ?? undefined } : EMPTY;
	const podiumThird  = top3[2] ? { name: top3[2].name, lapTime: top3[2].lapTime, gap: top3[2].gap ?? undefined } : EMPTY;

	const MIN_ROWS = 8;
	const nextPosition = Math.max(4, top3.length + rest.length + 1);
	const leaderboardRows = rest.length >= MIN_ROWS ? rest : [
		...rest,
		...Array.from({ length: MIN_ROWS - rest.length }, (_, i) => ({
			position: nextPosition + i,
			name: '—',
			lapTime: '--:--.---',
			gap: null as string | null,
			isTop3: false,
		})),
	];

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.headerMeta}>
					<span className={styles.poweredBy}>Powered by:</span>
					<img
						src="/Treblle Logo Big.svg"
						alt="Treblle"
						className={styles.headerLogo}
					/>
					<span className={styles.headerSub}>Timings, players, dashboards tracked by APIs.</span>
				</div>
			</header>

			<main className={styles.mainContent}>
				<section className={styles.podiumSection}>
					<PodiumTop3
						first={podiumFirst}
						second={podiumSecond}
						third={podiumThird}
						queueEndsText={queueWindow?.isActive ? formatSeconds(countdownSecs) : '—'}
					/>
					<div className={styles.podiumDivider} />
				</section>

				<section className={styles.leaderboardSection}>
					<LeaderboardTable
						rows={leaderboardRows}
						columns={2}
						size="lg"
						showHeaders
					/>
					<p className={styles.leaderboardLink}>
						View full leaderboard: <span className={styles.leaderboardUrl}>app.sim-cd.com</span>
					</p>
                    <div className={styles.podiumDivider} />
				</section>

				<section className={styles.drivingSection}>
					<PlayerCard
						variant="next"
						queueNumber={queue.nextDriver?.queueNumber ?? 0}
						name={queue.nextDriver?.name ?? '—'}
					/>
					<PlayerCard
						variant="current"
						queueNumber={queue.currentDriver?.queueNumber ?? 0}
						name={queue.currentDriver?.name ?? '—'}
					/>
					<PlayerCard
						variant="previous"
						queueNumber={queue.previousDriver?.queueNumber ?? 0}
						name={queue.previousDriver?.name ?? '—'}
					/>
				</section>

				<section className={styles.queueSection}>
					<p className={styles.sectionTitle}>Queue:</p>
					<QueueDisplay
						showAsGrid
						waitingQueue={queue.waitingQueue}
						freeSlots={freeSlots}
						newSlotsAt={newSlotsAt}
					/>
				</section>
			</main>
		</div>
	);
}
