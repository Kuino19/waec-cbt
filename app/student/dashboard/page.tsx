'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Library, CalendarDays, LineChart, 
  Zap, Pencil, Clock, CheckCircle2, Trophy, Calculator, 
  BookOpen, Atom, FlaskConical, Dna, LogOut, BarChart3
} from 'lucide-react'
import { SUBJECT_LABELS, SUBJECT_COLORS, type Subject } from '@/lib/types'
import { getStoredResults } from '@/lib/examEngine'
import { getTotalStudyHours } from '@/lib/activeTracker'
import '@/styles/dashboard.css'

const TIMETABLE = [
  { subject: 'English Language',  date: 'Mon', day: 4,  time: '9:00am – 12:00pm' },
  { subject: 'Mathematics',       date: 'Tue', day: 5,  time: '9:00am – 11:30am' },
  { subject: 'Physics',           date: 'Wed', day: 6,  time: '3:00pm – 5:00pm' },
  { subject: 'Chemistry',         date: 'Thu', day: 7,  time: '9:00am – 11:30am' },
  { subject: 'Biology',           date: 'Fri', day: 8,  time: '3:00pm – 5:00pm' },
]

const SUBJECTS: { key: Subject; icon: React.ElementType; total: number }[] = [
  { key: 'mathematics', icon: Calculator,   total: 40 },
  { key: 'english',     icon: BookOpen,     total: 40 },
  { key: 'physics',     icon: Atom,         total: 40 },
  { key: 'chemistry',   icon: FlaskConical, total: 40 },
  { key: 'biology',     icon: Dna,          total: 40 },
]

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [studyHours, setStudyHours] = useState(0)
  const [resultsCount, setResultsCount] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'timetable' | 'results'>('dashboard')
  const [mounted, setMounted] = useState(false)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('cbt_user')
    if (raw) setUser(JSON.parse(raw))
    setStudyHours(getTotalStudyHours())
    const loaded = getStoredResults()
    setResults(loaded)
    setResultsCount(loaded.length)
    if (loaded.length > 0) {
      setBestScore(Math.max(...loaded.map(r => r.percentage)))
    }
    setMounted(true)
  }, [])

  function startExam(subject: Subject, mode: 'mock' | 'practice') {
    sessionStorage.setItem('cbt_exam_config', JSON.stringify({ subject, mode }))
    router.push(`/student/exam?subject=${subject}&mode=${mode}`)
  }

  const getSubjectScore = (subject: Subject) => {
    if (!mounted) return null
    const subjResults = results.filter(r => r.subject === subject)
    if (!subjResults.length) return null
    return Math.round(subjResults.reduce((a, r) => a + r.percentage, 0) / subjResults.length)
  }

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar" aria-label="Student navigation">
        <div className="navbar__logo">
          <div className="navbar__logoMark">E</div>
          <span className="navbar__brand">Edu<span>CBT</span></span>
        </div>
        <div className="navbar__nav">
          {(['dashboard', 'subjects', 'timetable', 'results'] as const).map(tab => (
            <button
              key={tab}
              className={`navbar__link${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            className="navbar__link"
            onClick={() => {
              localStorage.removeItem('cbt_user')
              router.push('/')
            }}
            style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboardPage">
        {/* Sidebar */}
        <aside className="sidebar" aria-label="Sidebar navigation">
          <div className="sidebar__section">
            <div className="sidebar__label">Menu</div>
            {[
              { icon: LayoutDashboard, label: 'Dashboard',  tab: 'dashboard' },
              { icon: Library,         label: 'Subjects',   tab: 'subjects' },
              { icon: CalendarDays,    label: 'Timetable',  tab: 'timetable' },
              { icon: LineChart,       label: 'My Results', tab: 'results' },
            ].map(item => (
              <button
                key={item.tab}
                className={`sidebar__item${activeTab === item.tab ? ' active' : ''}`}
                onClick={() => setActiveTab(item.tab as any)}
              >
                <item.icon size={18} className="sidebar__icon" strokeWidth={2.5} />
                {item.label}
              </button>
            ))}
          </div>
          <div className="sidebar__section">
            <div className="sidebar__label">Quick Start</div>
            <button
              className="sidebar__item"
              onClick={() => startExam('mathematics', 'mock')}
            >
              <Zap size={18} className="sidebar__icon" color="var(--color-yellow)" strokeWidth={2.5} />
              Maths Mock Exam
            </button>
            <button
              className="sidebar__item"
              onClick={() => startExam('english', 'practice')}
            >
              <Pencil size={18} className="sidebar__icon" color="var(--color-teal)" strokeWidth={2.5} />
              English Practice
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboardMain" id="main-content">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <div className="welcomeBanner">
                <div className="welcomeBanner__greeting">Good day, champion</div>
                <h1 className="welcomeBanner__name">
                  {user?.name ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome to EduCBT!'}
                </h1>
                <p className="welcomeBanner__meta">
                  WAEC 2026 · Science Bundle · 5 Subjects Selected
                </p>
              </div>

              {/* Quick Stats */}
              <div className="quickStats" aria-label="Study statistics">
                <div className="quickStatCard">
                  <div className="quickStatCard__icon" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-teal)' }}>
                    <Clock size={24} />
                  </div>
                  <div className="quickStatCard__data">
                    <div className="quickStatCard__value">{mounted ? studyHours : '--'}h</div>
                    <div className="quickStatCard__label">Total Study Time</div>
                  </div>
                </div>
                <div className="quickStatCard">
                  <div className="quickStatCard__icon" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--color-green)' }}>
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="quickStatCard__data">
                    <div className="quickStatCard__value">{mounted ? resultsCount : '--'}</div>
                    <div className="quickStatCard__label">Exams Completed</div>
                  </div>
                </div>
                <div className="quickStatCard">
                  <div className="quickStatCard__icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--color-yellow-dark)' }}>
                    <Trophy size={24} />
                  </div>
                  <div className="quickStatCard__data">
                    <div className="quickStatCard__value">{mounted ? (bestScore || '--') : '--'}%</div>
                    <div className="quickStatCard__label">Best Score</div>
                  </div>
                </div>
                <div className="quickStatCard">
                  <div className="quickStatCard__icon" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--color-purple)' }}>
                    <CalendarDays size={24} />
                  </div>
                  <div className="quickStatCard__data">
                    <div className="quickStatCard__value">4</div>
                    <div className="quickStatCard__label">Days to Next Exam</div>
                  </div>
                </div>
              </div>

              {/* Subject Cards */}
              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <h2 className="section__title" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--sp-2)' }}>
                  Your Subjects
                </h2>
              </div>
              <div className="subjectGrid">
                {SUBJECTS.map(s => {
                  const score = getSubjectScore(s.key)
                  const color = SUBJECT_COLORS[s.key]
                  return (
                    <div
                      key={s.key}
                      className="subjectCard"
                      style={{ '--card-accent': color, '--card-accent-light': `${color}18` } as React.CSSProperties}
                    >
                      <div className="subjectCard__icon" style={{ color: color }}>
                        <s.icon size={28} />
                      </div>
                      <div className="subjectCard__name">{SUBJECT_LABELS[s.key]}</div>
                      <div className="subjectCard__count">{s.total} questions available</div>
                      {score !== null && (
                        <>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                            Avg score: <strong style={{ color }}>{score}%</strong>
                          </div>
                          <div className="subjectCard__progress">
                            <div className="subjectCard__progressFill" style={{ width: `${score}%` }} />
                          </div>
                        </>
                      )}
                      <div className="subjectCard__actions">
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={() => startExam(s.key, 'mock')}
                          style={{ flex: 1 }}
                        >
                          Mock Exam
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => startExam(s.key, 'practice')}
                          style={{ flex: 1 }}
                        >
                          Practice
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* SUBJECTS TAB */}
          {activeTab === 'subjects' && (
            <div className="fade-in">
              <h1 className="section__title">Choose a Subject</h1>
              <p className="section__subtitle" style={{ marginBottom: 'var(--sp-6)' }}>
                Select how you want to practise — timed mock exam or instant-feedback practice mode.
              </p>
              <div className="subjectGrid">
                {SUBJECTS.map(s => {
                  const color = SUBJECT_COLORS[s.key]
                  return (
                    <div
                      key={s.key}
                      className="subjectCard"
                      style={{ '--card-accent': color, '--card-accent-light': `${color}18` } as React.CSSProperties}
                    >
                      <div className="subjectCard__icon" style={{ color: color }}>
                        <s.icon size={28} />
                      </div>
                      <div className="subjectCard__name">{SUBJECT_LABELS[s.key]}</div>
                      <div className="subjectCard__count">{s.total} WAEC questions · Multiple topics</div>
                      <div className="subjectCard__actions" style={{ marginTop: 'var(--sp-2)' }}>
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={() => startExam(s.key, 'mock')}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          title={`Start a timed mock exam for ${SUBJECT_LABELS[s.key]}`}
                        >
                          <Clock size={14} /> Mock (45 min)
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => startExam(s.key, 'practice')}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          title={`Practise ${SUBJECT_LABELS[s.key]} with instant answers`}
                        >
                          <Pencil size={14} /> Practice
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TIMETABLE TAB */}
          {activeTab === 'timetable' && (
            <div className="fade-in">
              <h1 className="section__title">Exam Timetable</h1>
              <p className="section__subtitle" style={{ marginBottom: 'var(--sp-6)' }}>
                WAEC 2026 schedule for your registered subjects.
              </p>
              <div className="timetableGrid">
                {TIMETABLE.map((item, i) => (
                  <div
                    key={i}
                    className={`timetableCard${i === 0 ? ' today' : ''}`}
                  >
                    <div className="timetableCard__date">
                      <div className="timetableCard__day">{item.date}</div>
                      <div className="timetableCard__dayNum">{item.day}</div>
                    </div>
                    <div className="timetableCard__info">
                      <div className="timetableCard__subject">{item.subject}</div>
                      <div className="timetableCard__time">
                        <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: '-2px' }} />
                        {item.time}
                      </div>
                    </div>
                    <div>
                      <span className={`countdownBadge ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : 'upcoming'}`}>
                        {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${i + 3}d`}
                      </span>
                    </div>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => startExam(item.subject.toLowerCase().replace(' ', '') as Subject, 'mock')}
                    >
                      Practise
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULTS TAB */}
          {activeTab === 'results' && (
            <div className="fade-in">
              <h1 className="section__title">My Results</h1>
              <p className="section__subtitle" style={{ marginBottom: 'var(--sp-6)' }}>
                Your exam history and performance trends.
              </p>
              {(() => {
                if (!mounted) return null
                if (results.length === 0) {
                  return (
                    <div style={{
                      textAlign: 'center', padding: 'var(--sp-16)',
                      background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
                      border: '1px solid var(--color-border)',
                    }}>
                      <div style={{ color: 'var(--color-teal)', marginBottom: 'var(--sp-4)', display: 'flex', justifyContent: 'center' }}>
                        <BarChart3 size={48} strokeWidth={1.5} />
                      </div>
                      <h3 style={{ marginBottom: 'var(--sp-3)' }}>No results yet</h3>
                      <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--sp-6)' }}>
                        Complete your first mock exam to see results here.
                      </p>
                      <button
                        className="btn btn--primary"
                        onClick={() => setActiveTab('subjects')}
                      >
                        Start an Exam →
                      </button>
                    </div>
                  )
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                    {results.map((r, i) => (
                      <div
                        key={r.sessionId}
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-xl)',
                          padding: 'var(--sp-5) var(--sp-6)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--sp-5)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{
                          width: 60, height: 60, borderRadius: 'var(--radius-full)',
                          background: r.percentage >= 50
                            ? 'linear-gradient(135deg, var(--color-green), var(--color-green-dark))'
                            : 'linear-gradient(135deg, var(--color-red), var(--color-red-dark))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontFamily: 'var(--font-mono)',
                          fontWeight: 800, fontSize: 'var(--text-lg)',
                        }}>
                          {r.percentage}%
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
                            {SUBJECT_LABELS[r.subject] ?? r.subject}
                          </div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 2 }}>
                            {r.correct}/{r.totalQuestions} correct ·{' '}
                            {Math.round(r.timeSpentSeconds / 60)} min ·{' '}
                            {new Date(r.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 12px', borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)', fontWeight: 700,
                          background: r.percentage >= 70
                            ? 'var(--color-green-light)' : r.percentage >= 50
                            ? 'var(--color-yellow-light)' : 'var(--color-red-light)',
                          color: r.percentage >= 70
                            ? 'var(--color-green-dark)' : r.percentage >= 50
                            ? 'var(--color-yellow-dark)' : 'var(--color-red-dark)',
                        }}>
                          {r.percentage >= 70 ? 'Excellent' : r.percentage >= 50 ? 'Pass' : 'Needs Work'}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
