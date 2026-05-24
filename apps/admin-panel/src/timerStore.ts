import { create } from 'zustand'

const DEFAULT_SECONDS = 5 * 60

interface TimerStore {
  seconds: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: () => void
  expire: () => void
  addTime: (delta: number) => void
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const useTimerStore = create<TimerStore>((set, get) => {
  let interval: ReturnType<typeof setInterval> | null = null

  function clearTimer() {
    if (interval !== null) {
      clearInterval(interval)
      interval = null
    }
  }

  return {
    seconds: DEFAULT_SECONDS,
    isRunning: false,

    start() {
      if (get().isRunning) return
      interval = setInterval(() => {
        const remaining = get().seconds
        if (remaining <= 1) {
          clearTimer()
          set({ seconds: 0, isRunning: false })
        } else {
          set({ seconds: remaining - 1 })
        }
      }, 1000)
      set({ isRunning: true })
    },

    pause() {
      clearTimer()
      set({ isRunning: false })
    },

    expire() {
      clearTimer()
      set({ seconds: 0, isRunning: false })
    },

    reset() {
      clearTimer()
      set({ seconds: DEFAULT_SECONDS, isRunning: false })
    },

    addTime(delta: number) {
      set((state) => ({ seconds: Math.max(0, state.seconds + delta) }))
    },
  }
})
