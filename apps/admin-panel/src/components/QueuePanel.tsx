import { useRef, useState } from 'react'
import { useLeaderboardRaw, type PlayedEntry } from '../hooks/useLeaderboardRaw'
import {
  useEditAttendee,
  useDeleteAttendee,
  useSkipAttendee,
  useEditLeaderboardEntry,
  useDeleteLeaderboardEntry,
  useSwapQueue,
} from '../hooks/useSessionMutations'
import styles from './QueuePanel.module.css'

type QueueEntry = {
  attendeeId: string
  ticketNumber: string
  queuePosition: number
  name: string
  firstName: string
  lastName: string
  email: string
  status: string
}

type ActiveSession = { sessionId: string; name: string; ticketNumber: string } | null

interface Props {
  queueEntries: QueueEntry[]
  activeSession: ActiveSession
  playedEntries?: PlayedEntry[]
  onDeleteSession?: () => void
}

type ModalState =
  | { type: 'queue'; entry: QueueEntry }
  | { type: 'leaderboard'; entry: PlayedEntry }
  | null

function parseLapTime(formatted: string): number | null {
  const match = formatted.match(/^(\d+):(\d{2})\.(\d{3})$/)
  if (!match) return null
  return Number(match[1]) * 60000 + Number(match[2]) * 1000 + Number(match[3])
}

export function QueuePanel({ queueEntries, activeSession, playedEntries: propPlayedEntries, onDeleteSession }: Props) {
  const { data: hookPlayedEntries = [] } = useLeaderboardRaw()
  const playedEntries = propPlayedEntries ?? hookPlayedEntries
  const [modal, setModal] = useState<ModalState>(null)
  const [localOrder, setLocalOrder] = useState<QueueEntry[] | null>(null)
  const dragIdx = useRef<number | null>(null)

  const editAttendee = useEditAttendee()
  const deleteAttendee = useDeleteAttendee()
  const skipAttendee = useSkipAttendee()
  const editLeaderboard = useEditLeaderboardEntry()
  const deleteLeaderboard = useDeleteLeaderboardEntry()
  const swapQueue = useSwapQueue()

  const waitingFromServer = queueEntries
    .filter((e) => e.status === 'waiting')
    .sort((a, b) => a.queuePosition - b.queuePosition)

  // Use optimistic local order while a swap is in flight; fall back to server order
  const waitingEntries = localOrder ?? waitingFromServer

  // Played section: all 'done' queue entries, enriched with leaderboard data where available
  const leaderboardById = new Map(playedEntries.map((e) => [e.attendeeId, e]))
  const doneEntries = queueEntries.filter((e) => e.status === 'done')
  const withLb = doneEntries.filter((e) => leaderboardById.has(e.attendeeId))
    .sort((a, b) => leaderboardById.get(a.attendeeId)!.playOrder - leaderboardById.get(b.attendeeId)!.playOrder)
  const withoutLb = doneEntries.filter((e) => !leaderboardById.has(e.attendeeId))
  const playedRows = [...withLb, ...withoutLb]

  function handleDragStart(idx: number) {
    dragIdx.current = idx
  }

  function handleDrop(dropIdx: number) {
    const fromIdx = dragIdx.current
    dragIdx.current = null
    if (fromIdx === null || fromIdx === dropIdx) return

    const reordered = [...waitingEntries]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    setLocalOrder(reordered)

    swapQueue.mutate(
      { attendeeIdA: waitingEntries[fromIdx].attendeeId, attendeeIdB: waitingEntries[dropIdx].attendeeId },
      { onSuccess: () => setLocalOrder(null), onError: () => setLocalOrder(null) }
    )
  }

  return (
    <div className={styles.panel}>
      {activeSession ? (
        <div className={styles.currentlyDrivingCard}>
          <span className={styles.currentlyDrivingLabel}>Currently Driving</span>
          <div className={styles.currentlyDrivingRow}>
            <span className={styles.currentlyDrivingName}>{activeSession.name}</span>
            <span className={styles.currentlyDrivingTicket}>#{activeSession.ticketNumber}</span>
            {onDeleteSession && (
              <button className={styles.btnDeleteSession} onClick={onDeleteSession}>DELETE</button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.currentlyDrivingCardEmpty}>
          <span className={styles.currentlyDrivingLabel}>Currently Driving</span>
          <span className={styles.currentlyDrivingEmpty}>No active session</span>
        </div>
      )}

      <div className={styles.header}>
        <span className={styles.title}>Current Queue</span>
        {activeSession && <span className={styles.activeDot} />}
      </div>

      <div className={styles.scroll}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Played</p>
          {playedRows.length > 0 ? playedRows.map((qe, idx) => {
            const lb = leaderboardById.get(qe.attendeeId)
            return (
              <button
                key={qe.attendeeId}
                className={styles.row}
                onClick={() => lb
                  ? setModal({ type: 'leaderboard', entry: lb })
                  : setModal({ type: 'queue', entry: qe })
                }
              >
                <span className={styles.playOrder}>{idx + 1}.</span>
                <span className={styles.name}>{qe.name}</span>
                <span className={styles.ticket}>#{qe.ticketNumber}</span>
                <span className={styles.rank}>{lb ? `P${lb.rank}` : '—'}</span>
                <span className={styles.gap}>{lb ? (lb.gap ?? '—') : '—'}</span>
                <span className={styles.lapTime}>{lb ? lb.lapTime : '—'}</span>
              </button>
            )
          }) : (
            <div className={styles.emptyRow}>&nbsp;</div>
          )}
        </div>

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Next Up</p>
          {waitingEntries.length > 0 ? waitingEntries.map((e, idx) => (
            <div
              key={e.attendeeId}
              className={styles.draggableRow}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(ev) => ev.preventDefault()}
              onDrop={() => handleDrop(idx)}
            >
              <span className={styles.dragHandle}>⠿</span>
              <button
                className={styles.rowInner}
                onClick={() => setModal({ type: 'queue', entry: e })}
              >
                <span className={styles.playOrder}>{idx + 1}.</span>
                <span className={styles.name}>{e.name}</span>
                <span className={styles.ticket}>#{e.ticketNumber}</span>
              </button>
            </div>
          )) : (
            <div className={styles.emptyRow}>&nbsp;</div>
          )}
        </div>
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={(ev) => ev.stopPropagation()}>
            {modal.type === 'queue' ? (
              <QueueEditForm
                entry={modal.entry}
                onClose={() => setModal(null)}
                onSave={(body) =>
                  editAttendee.mutate(
                    { attendeeId: modal.entry.attendeeId, body },
                    { onSuccess: () => setModal(null) }
                  )
                }
                onSkip={() =>
                  skipAttendee.mutate(modal.entry.attendeeId, { onSuccess: () => setModal(null) })
                }
                onDelete={() =>
                  deleteAttendee.mutate(modal.entry.attendeeId, { onSuccess: () => setModal(null) })
                }
                isPending={editAttendee.isPending || skipAttendee.isPending || deleteAttendee.isPending}
              />
            ) : (
              <LeaderboardEditForm
                entry={modal.entry}
                onClose={() => setModal(null)}
                onSave={(bestLapMs) =>
                  editLeaderboard.mutate(
                    { attendeeId: modal.entry.attendeeId, body: { bestLapMs } },
                    { onSuccess: () => setModal(null) }
                  )
                }
                onDelete={() =>
                  deleteLeaderboard.mutate(modal.entry.attendeeId, { onSuccess: () => setModal(null) })
                }
                isPending={editLeaderboard.isPending || deleteLeaderboard.isPending}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function QueueEditForm({
  entry,
  onClose,
  onSave,
  onSkip,
  onDelete,
  isPending,
}: {
  entry: QueueEntry
  onClose: () => void
  onSave: (body: { firstName: string; lastName: string; email: string }) => void
  onSkip: () => void
  onDelete: () => void
  isPending: boolean
}) {
  const [firstName, setFirstName] = useState(entry.firstName)
  const [lastName, setLastName] = useState(entry.lastName)
  const [email, setEmail] = useState(entry.email)

  return (
    <>
      <div className={styles.modalHeader}>
        <span className={styles.modalTitle}>Edit Attendee</span>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
      </div>
      <label className={styles.fieldLabel}>First Name</label>
      <input className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <label className={styles.fieldLabel}>Last Name</label>
      <input className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <label className={styles.fieldLabel}>Email</label>
      <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className={styles.modalActions}>
        <button
          className={styles.btnSave}
          onClick={() => onSave({ firstName, lastName, email })}
          disabled={isPending}
        >
          Spremi
        </button>
        <button className={styles.btnSkip} onClick={onSkip} disabled={isPending}>
          Skip
        </button>
        <button className={styles.btnDelete} onClick={onDelete} disabled={isPending}>
          Izbriši
        </button>
      </div>
    </>
  )
}

function LeaderboardEditForm({
  entry,
  onClose,
  onSave,
  onDelete,
  isPending,
}: {
  entry: PlayedEntry
  onClose: () => void
  onSave: (bestLapMs: number) => void
  onDelete: () => void
  isPending: boolean
}) {
  const [lapTime, setLapTime] = useState(entry.lapTime)
  const parsed = parseLapTime(lapTime)

  return (
    <>
      <div className={styles.modalHeader}>
        <span className={styles.modalTitle}>{entry.name}</span>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
      </div>
      <label className={styles.fieldLabel}>Time (M:SS.mmm)</label>
      <input
        className={`${styles.input} ${parsed === null ? styles.inputError : ''}`}
        value={lapTime}
        onChange={(e) => setLapTime(e.target.value)}
        placeholder="1:23.456"
      />
      {parsed === null && (
        <span className={styles.errorHint}>Format: M:SS.mmm — e.g. 1:23.456</span>
      )}
      <div className={styles.modalActions}>
        <button
          className={styles.btnSave}
          onClick={() => parsed !== null && onSave(parsed)}
          disabled={isPending || parsed === null}
        >
          Spremi
        </button>
        <button className={styles.btnDelete} onClick={onDelete} disabled={isPending}>
          Izbriši
        </button>
      </div>
    </>
  )
}
