'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy, Clock, CheckCircle, ArrowLeft, Play, ShieldAlert, Sparkles, Medal } from 'lucide-react'
import { ALL_WAEC_SUBJECTS, getStoredStudentSubjects, WAECSubject } from '@/lib/subjects'
import '@/styles/dashboard.css'

export default function GrandSimulationPage() {
  const router = useRouter()
  const studentSubjectIds = getStoredStudentSubjects()
  const mySubjects = ALL_WAEC_SUBJECTS.filter(s => studentSubjectIds.includes(s.id))
  const [completedMap, setCompletedMap] = useState<Record<string, number>>({})

  function getGrade(score: number) {
    if (score >= 75) return { letter: 'A1', label: 'Excellent', color: '#22C55E' }
    if (score >= 70) return { letter: 'B2', label: 'Very Good', color: '#16A34A' }
    if (score >= 65) return { letter: 'B3', label: 'Good', color: '#0EA5E9' }
    if (score >= 60) return { letter: 'C4', label: 'Credit', color: '#3B82F6' }
    if (score >= 55) return { letter: 'C5', label: 'Credit', color: '#6366F1' }
    if (score >= 50) return { letter: 'C6', label: 'Credit Pass', color: '#8B5CF6' }
    if (score >= 45) return { letter: 'D7', label: 'Pass', color: '#F59E0B' }
    if (score >= 40) return { letter: 'E8', label: 'Pass', color: '#EAB308' }
    return { letter: 'F9', label: 'Fail', color: '#EF4444' }
  }

  function startSubjectPaper(subjectId: string) {
    sessionStorage.setItem('cbt_exam_config', JSON.stringify({
      subject: subjectId,
      mode: 'mock',
      isGrandSimulation: true,
    }))
    router.push(`/student/exam?subject=${subjectId}&mode=mock`)
  }

  return (
    <div className="page" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/student/dashboard')}
          className="btn btn--ghost btn--sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B' }}>
          <Trophy size={20} />
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Official WAEC Grand Simulation</span>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(14, 165, 233, 0.15))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '1.25rem',
        padding: '2rem',
        marginBottom: '2.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} /> 9-SUBJECT COMBINATION SIMULATION
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
          WAEC Examination Hall Simulation Day
        </h1>
        <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.95rem', maxWidth: '700px' }}>
          Simulate the complete WAEC examination day for all your 9 registered subjects. Take timed papers back-to-back and receive your final official WAEC Grade Result Card (A1 - F9 breakdown).
        </p>
      </div>

      {/* 9 Subjects Schedule Grid */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
          Your 9 Examination Papers
        </h2>
        <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
          Timed Paper 1 & 2 CBT Mode
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {mySubjects.map((sub, idx) => {
          const score = completedMap[sub.id]
          const grade = score !== undefined ? getGrade(score) : null

          return (
            <div
              key={sub.id}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    background: `${sub.color}22`,
                    color: sub.color,
                    textTransform: 'uppercase',
                  }}>
                    Paper {idx + 1}
                  </span>

                  {grade && (
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      background: `${grade.color}22`,
                      color: grade.color,
                    }}>
                      {grade.letter} ({grade.label})
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                  {sub.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: '0 0 1.25rem 0' }}>
                  40 Questions · 45 Minutes
                </p>
              </div>

              <button
                onClick={() => startSubjectPaper(sub.id)}
                className="btn btn--primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 700,
                }}
              >
                <Play size={16} /> Start Paper {idx + 1}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
