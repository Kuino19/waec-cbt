// ================================================================
// EXAM ENGINE — Core session logic & WAEC SSCE Standards
// ================================================================
import type { ExamSession, Question, ExamResult, QuestionStatus } from './types'
import { localDb } from './db/local'

export interface WAECSubjectSpec {
  subject: string
  officialQuestionsCount: number
  durationMinutes: number
  paperName: string
}

export const OFFICIAL_WAEC_SPECS: Record<string, WAECSubjectSpec> = {
  mathematics: { subject: 'mathematics', officialQuestionsCount: 50, durationMinutes: 90, paperName: 'Paper 1 (Objective Test)' },
  english: { subject: 'english', officialQuestionsCount: 80, durationMinutes: 60, paperName: 'Paper 1 (Lexis, Structure & Comprehension)' },
  physics: { subject: 'physics', officialQuestionsCount: 50, durationMinutes: 75, paperName: 'Paper 1 (Objective Test)' },
  chemistry: { subject: 'chemistry', officialQuestionsCount: 50, durationMinutes: 60, paperName: 'Paper 1 (Objective Test)' },
  biology: { subject: 'biology', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
  further_mathematics: { subject: 'further_mathematics', officialQuestionsCount: 40, durationMinutes: 90, paperName: 'Paper 1 (Objective Test)' },
  economics: { subject: 'economics', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
  civic_education: { subject: 'civic_education', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
  government: { subject: 'government', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
  financial_accounting: { subject: 'financial_accounting', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
  commerce: { subject: 'commerce', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
  geography: { subject: 'geography', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
  agricultural_science: { subject: 'agricultural_science', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
  christian_religious_studies: { subject: 'christian_religious_studies', officialQuestionsCount: 50, durationMinutes: 50, paperName: 'Paper 1 (Objective Test)' },
}

export function getWAECSpec(subject: string): WAECSubjectSpec {
  const norm = subject.toLowerCase().replace(/[^a-z0-9_]/g, '')
  return OFFICIAL_WAEC_SPECS[norm] || {
    subject: norm,
    officialQuestionsCount: 50,
    durationMinutes: 60,
    paperName: 'Paper 1 (Objective Test)',
  }
}

export function getWAECGrade(percentage: number): { grade: string; remark: string; color: string } {
  if (percentage >= 75) return { grade: 'A1', remark: 'Excellent', color: '#22C55E' }
  if (percentage >= 70) return { grade: 'B2', remark: 'Very Good', color: '#16A34A' }
  if (percentage >= 65) return { grade: 'B3', remark: 'Good', color: '#0EA5E9' }
  if (percentage >= 60) return { grade: 'C4', remark: 'Credit', color: '#38BDF8' }
  if (percentage >= 55) return { grade: 'C5', remark: 'Credit', color: '#F59E0B' }
  if (percentage >= 50) return { grade: 'C6', remark: 'Credit', color: '#D97706' }
  if (percentage >= 45) return { grade: 'D7', remark: 'Pass', color: '#F97316' }
  if (percentage >= 40) return { grade: 'E8', remark: 'Pass', color: '#EF4444' }
  return { grade: 'F9', remark: 'Fail', color: '#DC2626' }
}

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
  const score = correct // WAEC: 1 mark per correct answer
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
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

export async function saveResult(result: ExamResult) {
  try {
    const rawUser = localStorage.getItem('cbt_user')
    if (!rawUser) return
    const user = JSON.parse(rawUser)

    const raw = localStorage.getItem(RESULTS_KEY)
    const results: ExamResult[] = raw ? JSON.parse(raw) : []
    results.unshift(result)
    localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 50)))

    // Sync to DB
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('Offline')
    }

    const studentPin = user.studentPin || user.id || 'default_user'

    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: result.sessionId,
        userId: studentPin,
        subject: result.subject,
        score: result.score,
        percentage: result.percentage,
        correct: result.correct,
        wrong: result.wrong,
        unanswered: result.unanswered,
        totalQuestions: result.totalQuestions,
        timeSpentSeconds: result.timeSpentSeconds,
      })
    })

    if (!res.ok) throw new Error('API error')

    // Trigger SMS Notification
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '08000000000',
        message: `EduCBT: Your child just completed a ${result.subject} mock exam with a score of ${result.percentage}%! Log in to view detailed analytics.`
      })
    })
  } catch (e) {
    console.warn('Failed to sync result online, saving to Dexie offline store', e)
    try {
      await localDb.offlineResults.put(result)
    } catch (err) {
      console.error('Dexie save failed', err)
    }
  }
}

export async function syncOfflineData() {
  try {
    const rawUser = localStorage.getItem('cbt_user')
    if (!rawUser) return
    const user = JSON.parse(rawUser)

    const offlineRecords = await localDb.offlineResults.toArray()
    if (offlineRecords.length === 0) return

    console.log(`Syncing ${offlineRecords.length} offline results...`)

    for (const result of offlineRecords) {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: result.sessionId,
          userId: user.id,
          subject: result.subject,
          score: result.score,
          percentage: result.percentage,
          correct: result.correct,
          wrong: result.wrong,
          unanswered: result.unanswered,
          totalQuestions: result.totalQuestions,
          timeSpentSeconds: result.timeSpentSeconds,
        })
      })

      if (res.ok) {
        await localDb.offlineResults.delete(result.sessionId)
      }
    }
    console.log('Sync complete!')
  } catch (e) {
    console.error('Sync failed', e)
  }
}

export async function getStoredResults(): Promise<any[]> {
  try {
    const rawUser = localStorage.getItem('cbt_user')
    if (!rawUser) return []
    const user = JSON.parse(rawUser)

    try {
      const res = await fetch(`/api/results?userId=${user.id}`)
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // Fallback to local storage
    }

    const raw = localStorage.getItem(RESULTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
