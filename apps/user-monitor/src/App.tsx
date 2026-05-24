import styles from './App.module.css';
import { LeaderboardTable, PlayerCard, PodiumTop3, QueueDisplay } from '@sim-racing/ui';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useQueueDisplay } from './hooks/useQueueDisplay';
import { useSignalR } from './hooks/useSignalR';
import { useSimulation } from './hooks/useSimulation';

const SIM_MODE    = new URLSearchParams(window.location.search).get('sim')    === '1';
const VISUAL_MODE = new URLSearchParams(window.location.search).get('visual') === '1';

function formatSeconds(s: number): string {
	const m = Math.floor(s / 60);
	const sec = s % 60;
	return `${m}m ${sec}s`;
}

export default function App() {
	const { connected } = useSignalR();

	const { data: liveRows } = useLeaderboard(connected && !SIM_MODE, VISUAL_MODE);
	const { data: liveQueue } = useQueueDisplay(connected && !SIM_MODE, VISUAL_MODE);
	const { rows: simRows, queue: simQueue } = useSimulation(SIM_MODE);

	const rows = SIM_MODE ? simRows : liveRows;
	const queue = SIM_MODE ? simQueue : liveQueue;

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
						queueEndsText={formatSeconds(queue.estimatedWaitSeconds)}
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
						freeSlots={queue.freeSlots}
						newSlotsAt={queue.newSlotsAt}
					/>
				</section>
			</main>
		</div>
	);
}
