'use client'
import { useEffect, useState } from 'react'
import { formatTime, getRemainingSeconds } from '@/lib/examEngine'
import type { ExamSession } from '@/lib/types'

interface ExamTimerProps {
  session: ExamSession
  onExpire: () => void
  isPaused?: boolean
}

export default function ExamTimer({ session, onExpire, isPaused }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(getRemainingSeconds(session))

  useEffect(() => {
    if (session.isSubmitted) return
    const interval = setInterval(() => {
      if (isPaused) return
      const r = getRemainingSeconds(session)
      setRemaining(r)
      if (r <= 0) {
        clearInterval(interval)
        onExpire()
        return
      }
      // Audio alerts at 5 min and 1 min remaining
      if (r === 300 || r === 60) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.type = 'sine'
          osc.frequency.value = r === 60 ? 880 : 660
          gain.gain.setValueAtTime(0.25, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
          osc.start()
          osc.stop(ctx.currentTime + 1.2)
        } catch {
          /* audio blocked — silent fail */
        }
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [session, onExpire, isPaused])

  const isDanger  = remaining <= 60
  const isWarning = !isDanger && remaining <= 300

  return (
    <div
      className={`timerDisplay${isDanger ? ' danger' : isWarning ? ' warning' : ''}`}
      role="timer"
      aria-label={`Time remaining: ${formatTime(remaining)}`}
      aria-live="off"
    >
      {formatTime(remaining)}
    </div>
  )
}
