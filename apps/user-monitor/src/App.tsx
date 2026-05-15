import styles from './App.module.css';
import { LeaderboardTable, PlayerCard, PodiumTop3, QueueDisplay } from '@sim-racing/ui';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useQueueDisplay } from './hooks/useQueueDisplay';
import { useSignalR } from './hooks/useSignalR';

function formatSeconds(s: number): string {
	const m = Math.floor(s / 60);
	const sec = s % 60;
	return `${m}m ${sec}s`;
}

export default function App() {
	const { connected } = useSignalR();

	const { data: rows } = useLeaderboard(connected);
	const { data: queue } = useQueueDisplay(connected);

	const top3 = rows.filter((r) => r.isTop3);
	const rest = rows.filter((r) => !r.isTop3);

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
					{top3.length === 3 && (
						<PodiumTop3
							first={{ name: top3[0].name, lapTime: top3[0].lapTime }}
							second={{ name: top3[1].name, lapTime: top3[1].lapTime, gap: top3[1].gap ?? undefined }}
							third={{ name: top3[2].name, lapTime: top3[2].lapTime, gap: top3[2].gap ?? undefined }}
							queueEndsText={formatSeconds(queue.estimatedWaitSeconds)}
						/>
					)}
					<div className={styles.podiumDivider} />
				</section>

				<section className={styles.leaderboardSection}>
					{rest.length > 0 && (
						<LeaderboardTable
							rows={rest}
							columns={2}
							size="lg"
							showHeaders
						/>
					)}
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
