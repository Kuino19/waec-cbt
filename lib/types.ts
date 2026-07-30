// ================================================================
// WAEC CBT PLATFORM — SHARED TYPES
// ================================================================

export type UserRole = 'student' | 'parent' | 'school_admin'

export type Subject =
  | 'mathematics'
  | 'english'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'government'
  | 'economics'
  | 'commerce'
  | 'literature'
  | 'geography'
  | 'agricultural_science'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionStatus = 'unanswered' | 'answered' | 'review'

export interface Question {
  id: string
  subject: Subject
  topic: string
  year: number
  difficulty: Difficulty
  type: 'mcq'
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  imageUrl?: string
}

export interface ExamSession {
  id: string
  subject: Subject
  questions: Question[]
  durationSeconds: number
  startedAt: number
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>
  statuses: Record<string, QuestionStatus>
  currentIndex: number
  submittedAt?: number
  score?: number
  strikes: number
  isSubmitted: boolean
}

export interface ExamResult {
  sessionId: string
  subject: Subject
  totalQuestions: number
  correct: number
  wrong: number
  unanswered: number
  score: number
  percentage: number
  timeSpentSeconds: number
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | null>
  questions: Question[]
  submittedAt: number
}

export interface StudySession {
  id: string
  subject: Subject
  topic: string
  startedAt: number
  endedAt?: number
  activeSeconds: number
  idleSeconds: number
}

export interface SubjectBundle {
  id: string
  name: string
  subjects: Subject[]
  description: string
  color: string
}

export const SUBJECT_LABELS: Record<Subject, string> = {
  mathematics: 'Mathematics',
  english: 'English Language',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  government: 'Government',
  economics: 'Economics',
  commerce: 'Commerce',
  literature: 'Literature',
  geography: 'Geography',
  agricultural_science: 'Agricultural Science',
}

export const SUBJECT_COLORS: Record<Subject, string> = {
  mathematics: '#0EA5E9',
  english: '#8B5CF6',
  physics: '#F59E0B',
  chemistry: '#EF4444',
  biology: '#22C55E',
  government: '#64748B',
  economics: '#06B6D4',
  commerce: '#F97316',
  literature: '#EC4899',
  geography: '#84CC16',
  agricultural_science: '#10B981',
}

export const EXAM_BUNDLES: SubjectBundle[] = [
  {
    id: 'science',
    name: 'Science Bundle',
    subjects: ['mathematics', 'english', 'physics', 'chemistry', 'biology'],
    description: 'Core science subjects for WAEC/GCE',
    color: '#0EA5E9',
  },
  {
    id: 'commercial',
    name: 'Commercial Bundle',
    subjects: ['mathematics', 'english', 'economics', 'commerce', 'government'],
    description: 'Business and commercial subjects',
    color: '#F97316',
  },
  {
    id: 'arts',
    name: 'Arts Bundle',
    subjects: ['english', 'literature', 'government', 'geography', 'economics'],
    description: 'Humanities and arts subjects',
    color: '#8B5CF6',
  },
]
