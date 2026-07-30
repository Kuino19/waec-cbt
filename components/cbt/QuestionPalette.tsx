'use client'
import type { ExamSession, QuestionStatus } from '@/lib/types'

interface QuestionPaletteProps {
  session: ExamSession
  onNavigate: (index: number) => void
}

const STATUS_CLASS: Record<QuestionStatus, string> = {
  unanswered: '',
  answered: 'answered',
  review: 'review',
}

export default function QuestionPalette({ session, onNavigate }: QuestionPaletteProps) {
  return (
    <div className="questionGrid">
      {session.questions.map((q, idx) => {
        const status = session.statuses[q.id] ?? 'unanswered'
        const isCurrent = idx === session.currentIndex
        const isAnswered = !!session.answers[q.id]
        let cellClass = 'gridCell'
        if (isCurrent) cellClass += ' current'
        if (status === 'answered') cellClass += ' answered'
        if (status === 'review' && isAnswered) cellClass += ' reviewAnswered'
        else if (status === 'review') cellClass += ' review'

        return (
          <button
            key={q.id}
            className={cellClass}
            onClick={() => onNavigate(idx)}
            aria-label={`Go to question ${idx + 1}`}
          >
            {idx + 1}
          </button>
        )
      })}
    </div>
  )
}
