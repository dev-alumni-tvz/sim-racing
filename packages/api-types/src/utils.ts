/**
 * Formats milliseconds to "M:SS.mmm", e.g. 87432 → "1:27.432"
 */
export function formatLapMs(ms: number): string {
  const totalSeconds = ms / 1000
  const minutes = Math.floor(totalSeconds / 60)
  const remaining = (totalSeconds % 60).toFixed(3).padStart(6, '0')
  return `${minutes}:${remaining}`
}

/**
 * Gap from leader in +S.mmm format, e.g. "+0.633". Returns null for the leader.
 */
export function computeGap(entryMs: number, leaderMs: number): string | null {
  if (entryMs <= leaderMs) return null
  return `+${((entryMs - leaderMs) / 1000).toFixed(3)}`
}

/** Joins first + last name for display. */
export function fullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

/** Parses a 3-digit ticket number string to an integer, e.g. "047" → 47. */
export function ticketToPosition(ticketNumber: string): number {
  const n = parseInt(ticketNumber, 10)
  return isNaN(n) ? 0 : n
}
