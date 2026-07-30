'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { BarChart3, Trophy, Target, Sparkles, ThumbsUp, BookOpen, RefreshCw } from 'lucide-react'
import type { ExamResult } from '@/lib/types'
import { SUBJECT_LABELS, SUBJECT_COLORS } from '@/lib/types'
import { formatTime } from '@/lib/examEngine'
import MathText from '@/components/ui/MathText'
import '@/styles/dashboard.css'

export default function ResultsPage() {
  const router = useRouter()
  const [result, setResult] = useState<ExamResult | null>(null)
  const [reviewMode, setReviewMode] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('cbt_last_result')
    if (raw) {
      try { setResult(JSON.parse(raw)) } catch {}
    }
  }, [])

  if (!result) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: 16, fontFamily: 'var(--font-primary)',
        background: 'var(--color-canvas)',
      }}>
        <div style={{ color: 'var(--color-teal)', animation: 'bounceDot 1s infinite' }}>
          <BarChart3 size={64} strokeWidth={1.5} />
        </div>
        <h2>No results to display</h2>
        <button className="btn btn--primary" onClick={() => router.push('/student/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  const isPassed = result.percentage >= 50
  const subjectColor = SUBJECT_COLORS[result.subject] ?? '#0EA5E9'

  const chartData = [
    { name: 'Correct', value: result.correct, color: 'var(--color-green)' },
    { name: 'Wrong', value: result.wrong, color: 'var(--color-red)' },
    { name: 'Skipped', value: result.unanswered, color: 'var(--color-muted)' },
  ].filter(d => d.value > 0)

  return (
    <div className="resultsPage">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 'var(--sp-8)', maxWidth: 800, margin: '0 auto var(--sp-8)',
      }}>
        <button className="btn btn--ghost btn--sm" onClick={() => router.push('/student/dashboard')}>
          ← Dashboard
        </button>
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Exam Results</h1>
        <button className="btn btn--outline btn--sm" onClick={() => setReviewMode(!reviewMode)}>
          {reviewMode ? 'Hide Review' : 'Review Answers'}
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-8)', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--sp-8)' }}>
        {/* Score Hero */}
        <div className="resultsHero fade-in" style={{ flex: 1, minWidth: 300, margin: 0 }}>
          <div className={`scoreCircle ${isPassed ? 'scoreCircle--pass' : 'scoreCircle--fail'}`} style={{ animation: 'celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div className="scoreCircle__percent">{result.percentage}%</div>
            <div className="scoreCircle__label">{isPassed ? 'PASS ✓' : 'FAIL ✗'}</div>
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--sp-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {isPassed ? (
              <><Trophy className="text-yellow-500" size={28} /> Great Work!</>
            ) : (
              <><Target className="text-blue-500" size={28} /> Keep Practising!</>
            )}
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-base)' }}>
            {SUBJECT_LABELS[result.subject]} · WAEC Mock Exam
          </p>
        </div>

        {/* Breakdown Chart */}
        <div className="fade-in stagger-1" style={{ flex: 1, minWidth: 300, height: 250, background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', textAlign: 'center', marginBottom: -20, zIndex: 1 }}>Performance Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationDuration={800}
                animationBegin={200}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-primary)' }}
                itemStyle={{ color: 'var(--color-navy)', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats */}
      <div className="resultsStats fade-in stagger-2">
        {[
          { label: 'Score',      value: `${result.score}/${result.totalQuestions}`, color: subjectColor },
          { label: 'Correct',   value: result.correct,   color: 'var(--color-green)' },
          { label: 'Wrong',     value: result.wrong,     color: 'var(--color-red)' },
          { label: 'Skipped',   value: result.unanswered, color: 'var(--color-muted)' },
          { label: 'Time Used', value: formatTime(result.timeSpentSeconds), color: 'var(--color-teal)' },
        ].map(s => (
          <div key={s.label} className="resultsStat">
            <div className="resultsStat__value" style={{ color: s.color }}>{s.value}</div>
            <div className="resultsStat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Performance Badge */}
      <div className="fade-in stagger-3" style={{ maxWidth: 800, margin: '0 auto var(--sp-8)', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          padding: 'var(--sp-3) var(--sp-6)',
          borderRadius: 'var(--radius-full)',
          background: result.percentage >= 70
            ? 'var(--color-green-light)' : result.percentage >= 50
            ? 'var(--color-yellow-light)' : 'var(--color-red-light)',
          color: result.percentage >= 70
            ? 'var(--color-green-dark)' : result.percentage >= 50
            ? 'var(--color-yellow-dark)' : 'var(--color-red-dark)',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {result.percentage >= 70 ? (
            <><Sparkles size={18} /> Excellent performance — Keep it up!</>
          ) : result.percentage >= 50 ? (
            <><ThumbsUp size={18} /> Good job — A bit more practice will get you to an A grade.</>
          ) : (
            <><BookOpen size={18} /> You need more practice on this subject. Review the explanations below.</>
          )}
        </div>
      </div>

      {/* Answer Review */}
      {reviewMode && (
        <div style={{ maxWidth: 800, margin: '0 auto' }} className="fade-in">
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--sp-5)' }}>
            Question Review
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
            {result.questions.map((q, idx) => {
              const yourAnswer = result.answers[q.id]
              const isCorrect = yourAnswer === q.answer
              return (
                <div
                  key={q.id}
                  style={{
                    background: 'var(--color-surface)',
                    border: `1px solid ${isCorrect ? 'var(--color-green)' : yourAnswer ? 'var(--color-red)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--sp-5) var(--sp-6)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                      color: 'var(--color-muted)', flexShrink: 0,
                    }}>
                      Q{idx + 1}
                    </span>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-navy)' }}>
                      <MathText text={q.question} />
                    </div>
                  </div>

                  {/* Options Summary */}
                  <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-3)' }}>
                    {(Object.entries(q.options) as ['A'|'B'|'C'|'D', string][]).map(([letter, text]) => {
                      const isCorrectOpt = letter === q.answer
                      const isYourOpt = letter === yourAnswer
                      return (
                        <div key={letter} style={{
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 600,
                          background: isCorrectOpt
                            ? 'var(--color-green-light)'
                            : isYourOpt && !isCorrectOpt
                            ? 'var(--color-red-light)'
                            : 'var(--color-subtle)',
                          color: isCorrectOpt
                            ? 'var(--color-green-dark)'
                            : isYourOpt && !isCorrectOpt
                            ? 'var(--color-red-dark)'
                            : 'var(--color-muted)',
                          border: `1px solid ${isCorrectOpt ? 'var(--color-green)' : isYourOpt ? 'var(--color-red)' : 'transparent'}`,
                          display: 'flex', gap: 6, alignItems: 'center'
                        }}>
                          <span>{letter}:</span>
                          <MathText text={text} inline />
                          {isCorrectOpt && ' ✓'}
                          {isYourOpt && !isCorrectOpt && ' ✗'}
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="explanationBox" style={{ marginTop: 0 }}>
                    <div className="explanationBox__label">
                      {isCorrect ? '✅ Correct' : yourAnswer ? '❌ Incorrect' : '— Not Answered'}
                      {' '}· Correct Answer: {q.answer} · {q.topic} ({q.year})
                    </div>
                    <div className="explanationBox__text">
                      <MathText text={q.explanation} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="fade-in stagger-4" style={{ maxWidth: 800, margin: 'var(--sp-8) auto', display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          className="btn btn--primary"
          onClick={() => {
            sessionStorage.removeItem('cbt_last_result')
            router.push('/student/dashboard')
          }}
        >
          ← Back to Dashboard
        </button>
        <button
          className="btn btn--outline"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => {
            sessionStorage.removeItem('cbt_last_result')
            router.push(`/student/exam?subject=${result.subject}&mode=mock`)
          }}
        >
          <RefreshCw size={16} />
          Retake Mock
        </button>
      </div>
    </div>
  )
}
