'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Question, Subject } from '@/lib/types'
import ExamRunner from '@/components/cbt/ExamRunner'
import { SkeletonExamPage } from '@/components/ui/Skeleton'

function ExamPageInner() {
  const params = useSearchParams()
  const subject = (params.get('subject') ?? 'mathematics') as Subject
  const mode    = (params.get('mode')    ?? 'mock') as 'mock' | 'practice'

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading,   setLoading  ] = useState(true)
  const [error,     setError    ] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/questions?subject=${subject}`)
        if (!res.ok) throw new Error('API error')
        const data: Question[] = await res.json()
        if (!cancelled) setQuestions(data)
      } catch {
        if (!cancelled) setError('Failed to load questions. Please go back and try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [subject])

  if (loading) return <SkeletonExamPage />

  if (error || questions.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: 20,
        fontFamily: 'var(--font-primary)', background: 'var(--color-canvas)',
        textAlign: 'center', padding: 24,
      }}>
        <div style={{ fontSize: 56 }}>😞</div>
        <h2 style={{ color: 'var(--color-navy)' }}>
          {error || 'No questions found for this subject'}
        </h2>
        <p style={{ color: 'var(--color-muted)', maxWidth: 360 }}>
          Check that the seed file exists at <code>data/seed-questions.json</code> and the server is running.
        </p>
        <a
          href="/student/dashboard"
          style={{
            padding: '12px 24px', background: 'var(--color-teal)',
            color: 'white', borderRadius: 8, fontWeight: 600, textDecoration: 'none',
          }}
        >
          ← Back to Dashboard
        </a>
      </div>
    )
  }

  return (
    <ExamRunner
      questions={questions}
      subject={subject}
      durationMinutes={mode === 'mock' ? 45 : 999}
      mode={mode}
    />
  )
}

export default function ExamPage() {
  return (
    <Suspense fallback={<SkeletonExamPage />}>
      <ExamPageInner />
    </Suspense>
  )
}
