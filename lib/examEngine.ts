// ================================================================
// EXAM ENGINE — Core session logic
// ================================================================
import type { ExamSession, Question, ExamResult, QuestionStatus } from './types'

export function createExamSession(
  questions: Question[],
  subject: string,
  durationMinutes: number
): ExamSession {
  const answers: Record<string, 'A' | 'B' | 'C' | 'D' | null> = {}
  const statuses: Record<string, QuestionStatus> = {}
  questions.forEach(q => {
    answers[q.id] = null
    statuses[q.id] = 'unanswered'
  })

  return {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    subject: subject as any,
    questions,
    durationSeconds: durationMinutes * 60,
    startedAt: Date.now(),
    answers,
    statuses,
    currentIndex: 0,
    strikes: 0,
    isSubmitted: false,
  }
}

export function setAnswer(
  session: ExamSession,
  questionId: string,
  answer: 'A' | 'B' | 'C' | 'D'
): ExamSession {
  return {
    ...session,
    answers: { ...session.answers, [questionId]: answer },
    statuses: {
      ...session.statuses,
      [questionId]:
        session.statuses[questionId] === 'review' ? 'review' : 'answered',
    },
  }
}

export function toggleReview(
  session: ExamSession,
  questionId: string
): ExamSession {
  const current = session.statuses[questionId]
  const next: QuestionStatus =
    current === 'review'
      ? session.answers[questionId]
        ? 'answered'
        : 'unanswered'
      : 'review'
  return {
    ...session,
    statuses: { ...session.statuses, [questionId]: next },
  }
}

export function navigateTo(session: ExamSession, index: number): ExamSession {
  return { ...session, currentIndex: Math.max(0, Math.min(index, session.questions.length - 1)) }
}

export function calculateResults(session: ExamSession): ExamResult {
  let correct = 0
  let wrong = 0
  let unanswered = 0

  session.questions.forEach(q => {
    const answer = session.answers[q.id]
    if (!answer) {
      unanswered++
    } else if (answer === q.answer) {
      correct++
    } else {
      wrong++
    }
  })

  const total = session.questions.length
  const score = correct // WAEC: 1 mark per correct
  const percentage = Math.round((correct / total) * 100)
  const timeSpentSeconds = session.submittedAt
    ? Math.round((session.submittedAt - session.startedAt) / 1000)
    : session.durationSeconds

  return {
    sessionId: session.id,
    subject: session.subject,
    totalQuestions: total,
    correct,
    wrong,
    unanswered,
    score,
    percentage,
    timeSpentSeconds,
    answers: session.answers,
    questions: session.questions,
    submittedAt: session.submittedAt ?? Date.now(),
  }
}

export function getElapsedSeconds(session: ExamSession): number {
  return Math.round((Date.now() - session.startedAt) / 1000)
}

export function getRemainingSeconds(session: ExamSession): number {
  return Math.max(0, session.durationSeconds - getElapsedSeconds(session))
}

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function shuffleQuestions(questions: Question[]): Question[] {
  return [...questions].sort(() => Math.random() - 0.5)
}

// Store exam results in localStorage
const RESULTS_KEY = 'cbt_exam_results'

export function saveResult(result: ExamResult) {
  try {
    const raw = localStorage.getItem(RESULTS_KEY)
    const results: ExamResult[] = raw ? JSON.parse(raw) : []
    results.unshift(result) // newest first
    // Keep last 50 results
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 50)))
  } catch {/* ignore */}
}

export function getStoredResults(): ExamResult[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
