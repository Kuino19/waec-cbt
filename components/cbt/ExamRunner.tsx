'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ExamSession, Question, Subject } from '@/lib/types'
import { SUBJECT_LABELS } from '@/lib/types'
import {
  setAnswer, toggleReview, navigateTo,
  calculateResults, saveResult, shuffleQuestions, createExamSession,
} from '@/lib/examEngine'
import * as antiCheat from '@/lib/antiCheat'
import { startTracking, stopTracking } from '@/lib/activeTracker'
import ExamTimer from './ExamTimer'
import QuestionPalette from './QuestionPalette'
import Calculator from './Calculator'
import MathText from '@/components/ui/MathText'
import { useToast, ToastProvider } from '@/components/ui/Toast'
import '@/styles/cbt.css'

interface ExamRunnerProps {
  questions: Question[]
  subject: string
  durationMinutes?: number
  mode?: 'practice' | 'mock'
}

export default function ExamRunner(props: ExamRunnerProps) {
  return (
    <>
      <ToastProvider />
      <ExamRunnerInner {...props} />
    </>
  )
}

function ExamRunnerInner({
  questions,
  subject,
  durationMinutes = 45,
  mode = 'mock',
}: ExamRunnerProps) {
  const router = useRouter()
  const { addToast } = useToast()

  const [session, setSession] = useState<ExamSession>(() => {
    const shuffled = mode === 'mock' ? shuffleQuestions(questions) : questions
    return createExamSession(shuffled, subject, durationMinutes)
  })
  const [fontSize, setFontSize] = useState(16)
  const [showCalc, setShowCalc] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showOnlineToast, setShowOnlineToast] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [optionAnim, setOptionAnim] = useState<string | null>(null)
  const questionPanelRef = useRef<HTMLDivElement>(null)

  const currentQuestion = session.questions[session.currentIndex]
  const currentAnswer   = session.answers[currentQuestion?.id]
  const currentStatus   = session.statuses[currentQuestion?.id]

  // ---- Anti-Cheat ----
  useEffect(() => {
    antiCheat.activate({
      maxStrikes: 3,
      onStrike: (count, reason) => {
        addToast(
          `⚠️ Warning ${count}/3: ${reason}. ${count >= 2 ? 'Next violation auto-submits!' : ''}`,
          'warning'
        )
      },
      onAutoSubmit: () => {
        addToast('🚨 Exam auto-submitted due to repeated violations.', 'error')
        handleSubmitForced()
      },
    })
    return () => antiCheat.deactivate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Active Time Tracker ----
  useEffect(() => {
    startTracking(subject, currentQuestion?.topic ?? 'General', {
      onIdleStart: () => setIsIdle(true),
      onIdleEnd:   () => setIsIdle(false),
    })
    return () => stopTracking()
  }, [subject, currentQuestion?.topic])

  // ---- Network Status ----
  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false)
      addToast('⚡ You are offline. Progress is saved locally.', 'warning')
    }
    const handleOnline = () => {
      setIsOnline(true)
      setShowOnlineToast(true)
      addToast('✓ Back online — progress synced.', 'success')
      setTimeout(() => setShowOnlineToast(false), 3000)
    }
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online',  handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online',  handleOnline)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- Keyboard Navigation ----
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showCalc || showSubmitModal) return
      const key = e.key.toUpperCase()
      if (['A','B','C','D'].includes(key)) {
        handleAnswer(key as 'A'|'B'|'C'|'D')
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (session.currentIndex < session.questions.length - 1) handleNavigate(session.currentIndex + 1)
      } else if (e.key === 'ArrowLeft') {
        if (session.currentIndex > 0) handleNavigate(session.currentIndex - 1)
      } else if (e.key === 'r' || e.key === 'R') {
        handleReview()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, showCalc, showSubmitModal, showExplanation])

  // ---- Scroll to top on question change ----
  useEffect(() => {
    questionPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setShowExplanation(false)
    setOptionAnim(null)
  }, [session.currentIndex])

  const handleSubmitForced = useCallback(() => {
    antiCheat.deactivate()
    stopTracking()
    const submitted = { ...session, isSubmitted: true, submittedAt: Date.now() }
    const result = calculateResults(submitted)
    saveResult(result)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cbt_last_result', JSON.stringify(result))
    }
    router.push('/student/results')
  }, [session, router])

  const handleSubmit = useCallback((forced = false) => {
    if (!forced) { setShowSubmitModal(true); return }
    handleSubmitForced()
  }, [handleSubmitForced])

  const handleAnswer = useCallback((option: 'A'|'B'|'C'|'D') => {
    if (showExplanation && mode === 'practice') return // Already answered in practice
    setOptionAnim(option)
    setSession(s => setAnswer(s, currentQuestion.id, option))
    if (mode === 'practice') {
      setTimeout(() => setShowExplanation(true), 180)
    }
  }, [currentQuestion?.id, mode, showExplanation])

  const handleReview = useCallback(() => {
    setSession(s => {
      const next = toggleReview(s, currentQuestion.id)
      const isNowReview = next.statuses[currentQuestion.id] === 'review'
      addToast(
        isNowReview ? '⭐ Marked for review' : '✓ Review mark removed',
        isNowReview ? 'warning' : 'info'
      )
      return next
    })
  }, [currentQuestion?.id, addToast])

  const handleNavigate = useCallback((index: number) => {
    setSession(s => navigateTo(s, index))
  }, [])

  if (!currentQuestion) return null

  const answeredCount   = Object.values(session.statuses).filter(s => s === 'answered').length
  const reviewCount     = Object.values(session.statuses).filter(s => s === 'review').length
  const unansweredCount = session.questions.length - answeredCount - reviewCount

  return (
    <div className="examShell">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="offlineBanner offline" role="status">
          ⚡ Offline Mode — Progress saved locally
        </div>
      )}

      {/* Idle Banner */}
      {isIdle && (
        <div className="idleBanner" role="status">
          ⏸ Idle — Timer paused
        </div>
      )}

      {/* ── Top Bar ── */}
      <header className="examTopBar">
        <div className="examTopBar__subject">
          {SUBJECT_LABELS[subject as Subject] ?? subject}
          <span style={{
            marginLeft: 8, padding: '2px 8px',
            background: mode === 'practice' ? 'rgba(34,197,94,0.25)' : 'rgba(14,165,233,0.25)',
            color: mode === 'practice' ? 'var(--color-green)' : 'var(--color-teal-light)',
            borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600,
          }}>
            {mode === 'practice' ? 'PRACTICE' : 'MOCK EXAM'}
          </span>
        </div>

        <div className="examTopBar__info">
          {/* Question counter */}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.5)' }}>
            {session.currentIndex + 1} / {session.questions.length}
          </span>

          {/* Timer */}
          {mode === 'mock' && (
            <ExamTimer session={session} onExpire={() => handleSubmit(true)} isPaused={isIdle} />
          )}

          {/* Calculator */}
          <button
            id="calc-btn"
            onClick={() => setShowCalc(true)}
            aria-label="Open calculator"
            style={{
              padding: '5px 12px', background: 'rgba(255,255,255,0.1)',
              color: 'white', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(14,165,233,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            𝑥 Calc
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="examBody">
        {/* Left: Question Panel */}
        <div className="questionPanel" ref={questionPanelRef}>
          {/* Font size + Review controls */}
          <div className="fontControls">
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginRight: 4 }}>Text:</span>
            <button className="fontBtn" onClick={() => setFontSize(f => Math.max(13, f - 2))} aria-label="Decrease font size">A−</button>
            <button className="fontBtn" onClick={() => setFontSize(16)} aria-label="Reset font size">A</button>
            <button className="fontBtn" onClick={() => setFontSize(f => Math.min(24, f + 2))} aria-label="Increase font size">A+</button>

            {currentStatus === 'review' && (
              <span style={{
                marginLeft: 'auto', background: 'var(--color-yellow-light)',
                color: 'var(--color-yellow-dark)', padding: '3px 12px',
                borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
              }}>
                ⭐ Marked for Review
              </span>
            )}
          </div>

          {/* Question Metadata */}
          <div className="questionNumber">
            <span>Question {session.currentIndex + 1} of {session.questions.length}</span>
            {currentQuestion.topic && (
              <span style={{
                marginLeft: 10, padding: '1px 8px',
                background: 'var(--color-teal-glow)', color: 'var(--color-teal-dark)',
                borderRadius: 'var(--radius-full)', fontSize: '0.7rem',
              }}>
                {currentQuestion.topic}
              </span>
            )}
            <span style={{ marginLeft: 8, color: 'var(--color-muted)' }}>
              WAEC {currentQuestion.year}
            </span>
            <span style={{
              marginLeft: 8, padding: '1px 8px',
              background: currentQuestion.difficulty === 'hard'
                ? 'var(--color-red-light)' : currentQuestion.difficulty === 'medium'
                ? 'var(--color-yellow-light)' : 'var(--color-green-light)',
              color: currentQuestion.difficulty === 'hard'
                ? 'var(--color-red-dark)' : currentQuestion.difficulty === 'medium'
                ? 'var(--color-yellow-dark)' : 'var(--color-green-dark)',
              borderRadius: 'var(--radius-full)', fontSize: '0.68rem', fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {currentQuestion.difficulty}
            </span>
          </div>

          {/* Question Text — with KaTeX */}
          <div className="questionText" style={{ fontSize }}>
            <MathText text={currentQuestion.question} />
          </div>

          {/* Options */}
          <div className="optionsList" role="radiogroup" aria-label="Answer options">
            {(Object.entries(currentQuestion.options) as ['A'|'B'|'C'|'D', string][]).map(([letter, text]) => {
              const isSelected = currentAnswer === letter
              const isCorrectAnswer = letter === currentQuestion.answer
              let cls = 'optionItem'

              if (showExplanation && mode === 'practice') {
                if (isCorrectAnswer) cls += ' correct'
                else if (isSelected)  cls += ' incorrect'
              } else if (isSelected) {
                cls += ' selected'
              }

              return (
                <button
                  key={letter}
                  id={`option-${letter}`}
                  className={cls}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleAnswer(letter)}
                  disabled={showExplanation && mode === 'practice'}
                  style={{
                    width: '100%', textAlign: 'left',
                    animationDelay: ({ A:0, B:50, C:100, D:150 }[letter]) + 'ms',
                    animation: 'fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1) both',
                  }}
                >
                  <span className="optionLetter">{letter}</span>
                  <span className="optionText" style={{ fontSize: Math.max(13, fontSize - 2) }}>
                    <MathText text={text} inline />
                  </span>
                  {showExplanation && mode === 'practice' && isCorrectAnswer && (
                    <span style={{ marginLeft: 'auto', fontSize: 18, flexShrink: 0 }}>✅</span>
                  )}
                  {showExplanation && mode === 'practice' && isSelected && !isCorrectAnswer && (
                    <span style={{ marginLeft: 'auto', fontSize: 18, flexShrink: 0 }}>❌</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation — Practice Mode */}
          {showExplanation && mode === 'practice' && (
            <div className="explanationBox scale-in">
              <div className="explanationBox__label">
                {currentAnswer === currentQuestion.answer
                  ? '✅ Correct!'
                  : `❌ Incorrect — Correct Answer: ${currentQuestion.answer}`}
              </div>
              <p className="explanationBox__text">
                <MathText text={currentQuestion.explanation} />
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="navButtons" style={{ marginTop: 'var(--sp-8)' }}>
            <button
              id="prev-btn"
              className="navBtn navBtn--prev"
              onClick={() => handleNavigate(session.currentIndex - 1)}
              disabled={session.currentIndex === 0}
              aria-label="Previous question"
            >
              ← Prev
            </button>
            <button
              id="review-btn"
              className="navBtn navBtn--review"
              onClick={handleReview}
              aria-label={currentStatus === 'review' ? 'Remove review mark' : 'Mark for review'}
            >
              {currentStatus === 'review' ? '★ Unmark' : '☆ Review'}
            </button>
            <button
              id="next-btn"
              className="navBtn navBtn--next"
              onClick={() => handleNavigate(session.currentIndex + 1)}
              disabled={session.currentIndex >= session.questions.length - 1}
              aria-label="Next question"
            >
              Next →
            </button>
          </div>

          {/* Keyboard hint */}
          <p style={{
            marginTop: 'var(--sp-4)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)',
            display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap',
          }}>
            <span>Keyboard: <kbd style={{ padding: '1px 5px', background: 'var(--color-subtle)', border: '1px solid var(--color-border)', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>A</kbd>–<kbd style={{ padding: '1px 5px', background: 'var(--color-subtle)', border: '1px solid var(--color-border)', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>D</kbd> answer</span>
            <span><kbd style={{ padding: '1px 5px', background: 'var(--color-subtle)', border: '1px solid var(--color-border)', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>← →</kbd> navigate</span>
            <span><kbd style={{ padding: '1px 5px', background: 'var(--color-subtle)', border: '1px solid var(--color-border)', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>R</kbd> review</span>
          </p>
        </div>

        {/* Right: Control Panel */}
        <div className="controlPanel">
          {/* Progress Stats */}
          <div className="controlSection">
            <p className="controlSection__title">Progress</p>
            <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
              <StatPill color="var(--color-green)" label="Done"   value={answeredCount} />
              <StatPill color="var(--color-yellow)" label="Review" value={reviewCount} />
              <StatPill color="var(--color-muted)"  label="Left"  value={unansweredCount} />
            </div>
            {/* Mini progress bar */}
            <div style={{
              marginTop: 'var(--sp-3)', height: 5, background: 'var(--color-subtle)',
              borderRadius: 'var(--radius-full)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 'var(--radius-full)',
                background: `linear-gradient(90deg, var(--color-green) ${(answeredCount/session.questions.length)*100}%, var(--color-yellow) ${((answeredCount+reviewCount)/session.questions.length)*100}%, transparent 0)`,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 4 }}>
              {Math.round((answeredCount / session.questions.length) * 100)}% complete
            </p>
          </div>

          {/* Question Grid */}
          <div className="controlSection">
            <p className="controlSection__title">Questions</p>
            <QuestionPalette session={session} onNavigate={handleNavigate} />
            <div className="gridLegend">
              {[
                { color: 'var(--color-green)', label: 'Answered' },
                { color: 'var(--color-yellow)', label: 'Review' },
                { color: 'var(--color-subtle)', label: 'Pending' },
              ].map(l => (
                <div key={l.label} className="legendItem">
                  <div className="legendDot" style={{
                    background: l.color,
                    border: l.label === 'Pending' ? '1px solid var(--color-border)' : 'none',
                  }} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="controlSection" style={{ marginTop: 'auto' }}>
            <button
              id="submit-btn"
              className="submitBtn"
              onClick={() => setShowSubmitModal(true)}
            >
              Submit Paper
            </button>
          </div>
        </div>
      </div>

      {/* ── Calculator ── */}
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}

      {/* ── Submit Confirmation ── */}
      {showSubmitModal && (
        <div className="modalOverlay" role="dialog" aria-modal="true" aria-labelledby="submit-modal-title">
          <div className="modalBox scale-in">
            <div style={{ fontSize: 40, marginBottom: 'var(--sp-3)' }}>📝</div>
            <h2 id="submit-modal-title">Submit Your Paper?</h2>
            <p>
              Answered <strong style={{ color: 'var(--color-green)' }}>{answeredCount}</strong>{' '}
              of <strong>{session.questions.length}</strong> questions.
              {unansweredCount > 0 && (
                <> <span style={{ color: 'var(--color-red)', fontWeight: 600 }}>
                  {unansweredCount} unanswered.
                </span></>
              )}
              {reviewCount > 0 && (
                <> <span style={{ color: 'var(--color-yellow-dark)', fontWeight: 600 }}>
                  {reviewCount} marked for review.
                </span></>
              )}
              {' '}This cannot be undone.
            </p>
            <div className="modalActions">
              <button
                className="navBtn navBtn--prev"
                onClick={() => setShowSubmitModal(false)}
                style={{ padding: '12px 24px' }}
              >
                Keep Going
              </button>
              <button
                id="confirm-submit-btn"
                className="submitBtn"
                onClick={() => handleSubmit(true)}
                style={{ width: 'auto', padding: '12px 24px' }}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatPill({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: 'var(--color-subtle)', borderRadius: 'var(--radius-md)',
      padding: '8px 4px',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontWeight: 800,
        fontSize: 'var(--text-xl)', color, lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: 2 }}>{label}</span>
    </div>
  )
}
