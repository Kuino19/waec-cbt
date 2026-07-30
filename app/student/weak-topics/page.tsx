'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, CheckCircle, Target, Zap, ShieldAlert, Sparkles, BookOpen } from 'lucide-react'
import { ExamResult } from '@/lib/types'
import { getStoredResults } from '@/lib/examEngine'
import { analyzeTopicPerformance, TopicDiagnostic } from '@/lib/analytics'
import '@/styles/dashboard.css'

export default function WeakTopicsPage() {
  const router = useRouter()
  const [diagnostics, setDiagnostics] = useState<TopicDiagnostic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDiagnostics() {
      const results = await getStoredResults()
      const analyzed = analyzeTopicPerformance(results)
      setDiagnostics(analyzed)
      setLoading(false)
    }
    loadDiagnostics()
  }, [])

  function startTargetedPractice(subject: string, topic: string) {
    sessionStorage.setItem('cbt_exam_config', JSON.stringify({
      subject,
      mode: 'practice',
      topicFilter: topic,
    }))
    router.push(`/student/exam?subject=${subject}&mode=practice&topic=${encodeURIComponent(topic)}`)
  }

  const criticalTopics = diagnostics.filter(d => d.status === 'critical')
  const warningTopics = diagnostics.filter(d => d.status === 'warning')
  const strongTopics = diagnostics.filter(d => d.status === 'strong')

  return (
    <div className="page" style={{ padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/student/dashboard')}
          className="btn btn--ghost btn--sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0EA5E9' }}>
          <Sparkles size={20} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AI Weak-Topic Diagnostic</span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Topic Performance & Diagnostic
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', margin: 0 }}>
          Detailed accuracy breakdown calculated from your mock exam sessions. Focus on your critical topics to boost your aggregate WAEC score.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-muted)' }}>
          Analyzing your exam history...
        </div>
      ) : diagnostics.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '1rem',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}>
          <Target size={48} color="#0EA5E9" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No Topic Diagnostics Available Yet
          </h3>
          <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Complete a few mock exams or practice sessions first. The platform will automatically track your wrong answers and analyze your weak topics!
          </p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="btn btn--primary"
          >
            Go to Dashboard & Start Mock Exam
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Critical Topics Section */}
          {criticalTopics.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#EF4444' }}>
                <ShieldAlert size={20} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Critical Priority ({criticalTopics.length}) — Accuracy &lt; 50%
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {criticalTopics.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(239, 68, 68, 0.05)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '0.85rem',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#EF4444' }}>
                          {item.subject}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#EF4444' }}>
                          {item.percentage}%
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {item.topic}
                      </h3>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                        {item.correct} correct out of {item.totalAttempted} questions
                      </div>
                    </div>

                    <button
                      onClick={() => startTargetedPractice(item.subject, item.topic)}
                      className="btn btn--sm"
                      style={{
                        background: '#EF4444',
                        color: 'white',
                        fontWeight: 700,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Zap size={14} /> Fix Weak Topic
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Topics Section */}
          {warningTopics.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#F59E0B' }}>
                <AlertTriangle size={20} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Needs Improvement ({warningTopics.length}) — Accuracy 50% – 69%
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {warningTopics.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(245, 158, 11, 0.05)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '0.85rem',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#F59E0B' }}>
                          {item.subject}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>
                          {item.percentage}%
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {item.topic}
                      </h3>

                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                        {item.correct} correct out of {item.totalAttempted} questions
                      </div>
                    </div>

                    <button
                      onClick={() => startTargetedPractice(item.subject, item.topic)}
                      className="btn btn--sm"
                      style={{
                        background: '#F59E0B',
                        color: 'white',
                        fontWeight: 700,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <Zap size={14} /> Practise Topic
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strong Topics Section */}
          {strongTopics.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#22C55E' }}>
                <CheckCircle size={20} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  Strong Mastery ({strongTopics.length}) — Accuracy 70%+
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {strongTopics.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(34, 197, 94, 0.05)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '0.85rem',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#22C55E' }}>
                        {item.subject}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22C55E' }}>
                        {item.percentage}%
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                      {item.topic}
                    </h3>

                    <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                      {item.correct} correct out of {item.totalAttempted} questions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
