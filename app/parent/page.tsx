'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Users, BarChart3, Clock, Trophy, ShieldCheck, Download, 
  ArrowLeft, CheckCircle2, AlertCircle, BookOpen, Printer
} from 'lucide-react'
import { ExamResult } from '@/lib/types'
import { getStoredResults } from '@/lib/examEngine'
import { getTotalStudyHours } from '@/lib/activeTracker'
import { ALL_WAEC_SUBJECTS, getStoredStudentSubjects } from '@/lib/subjects'
import '@/styles/dashboard.css'

export default function ParentPortal() {
  const router = useRouter()
  const [results, setResults] = useState<ExamResult[]>([])
  const [studyHours, setStudyHours] = useState(0)
  const [subjects, setSubjects] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    async function loadData() {
      const loaded = await getStoredResults()
      setResults(loaded)
      setStudyHours(getTotalStudyHours())
      setSubjects(getStoredStudentSubjects())
      setMounted(true)
    }
    loadData()
  }, [])

  const averageScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
    : 0

  const readinessRating = averageScore >= 75 ? 'A1 - Excellent' : averageScore >= 60 ? 'B2 - Very Good' : averageScore >= 50 ? 'C4 - Credit Pass' : 'Needs Focus'

  return (
    <div className="page" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <Users size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Parent Monitoring Portal</h1>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              Track your child&apos;s WAEC CBT mock performance and study habits
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="btn btn--ghost"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Printer size={16} /> Print Report Card
        </button>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '1rem',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
            Overall Average Score
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: averageScore >= 50 ? '#22C55E' : '#EF4444' }}>
            {mounted ? `${averageScore}%` : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Estimated Grade: <strong>{readinessRating}</strong>
          </div>
        </div>

        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '1rem',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
            Total Practice Hours
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0EA5E9' }}>
            {mounted ? `${studyHours}h` : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Active CBT test duration
          </div>
        </div>

        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '1rem',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
            Mock Exams Sat
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B' }}>
            {mounted ? results.length : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Across registered subjects
          </div>
        </div>

        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '1rem',
          padding: '1.25rem',
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>
            Registered Subjects
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8B5CF6' }}>
            {subjects.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
            Full WAEC subject load
          </div>
        </div>
      </div>

      {/* Recent Exam Sessions Table */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '1rem',
        padding: '1.5rem',
      }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
          Recent Mock Exam Performance
        </h2>

        {results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-muted)' }}>
            No mock exam sessions completed yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.slice(0, 10).map((r, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.5rem',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                    {r.subject.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                    {new Date(r.submittedAt).toLocaleDateString()} · {r.correct}/{r.totalQuestions} questions correct
                  </div>
                </div>

                <div style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  background: r.percentage >= 50 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: r.percentage >= 50 ? '#22C55E' : '#EF4444',
                }}>
                  {r.percentage}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
