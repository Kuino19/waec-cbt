'use client'
import Link from 'next/link'
import '@/styles/dashboard.css'

export default function SchoolDashboard() {
  return (
    <div className="page">
      <nav className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logoMark">E</div>
          <span className="navbar__brand">Edu<span>CBT</span></span>
        </div>
        <div className="navbar__nav">
          <span style={{ color: 'var(--color-teal-light)', fontSize: 'var(--text-sm)' }}>School Admin</span>
          <Link href="/" className="navbar__link">Home</Link>
        </div>
      </nav>
      <div className="dashboardPage">
        <main className="dashboardMain" style={{ maxWidth: 900 }}>
          <div className="welcomeBanner">
            <div className="welcomeBanner__greeting">School Administration Portal</div>
            <h1 className="welcomeBanner__name">Manage Your Students & Mock Exams</h1>
            <p className="welcomeBanner__meta">Coming in Phase 3 — Bulk seats, PIN generation, class analytics & PDF reports</p>
          </div>
          <div className="quickStats">
            {[
              { icon: '👥', label: 'Total Students',   value: '—' },
              { icon: '🎫', label: 'Seats Activated',  value: '—' },
              { icon: '📊', label: 'Avg Class Score',  value: '—' },
              { icon: '📋', label: 'Exams Conducted',  value: '—' },
            ].map(s => (
              <div key={s.label} className="quickStatCard">
                <div className="quickStatCard__icon" style={{ background: 'var(--color-subtle)', fontSize: 22 }}>{s.icon}</div>
                <div className="quickStatCard__data">
                  <div className="quickStatCard__value" style={{ color: 'var(--color-muted)' }}>{s.value}</div>
                  <div className="quickStatCard__label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="subjectGrid">
            {[
              { icon: '🎫', title: 'Bulk Seat Purchase', desc: 'Purchase seats with Paystack DVA bank transfer. Track activation rates.' },
              { icon: '🔐', title: 'PIN Generator',      desc: 'Generate 6-digit student access codes in bulk. One click.' },
              { icon: '📸', title: 'Mock Proctoring',    desc: 'Webcam snapshots, question shuffle, and tab-switch enforcement.' },
              { icon: '📄', title: 'PDF Reports',        desc: 'Export class performance and attendance reports as PDF.' },
            ].map(f => (
              <div key={f.title} className="subjectCard">
                <div className="subjectCard__icon" style={{ fontSize: 28 }}>{f.icon}</div>
                <div className="subjectCard__name">{f.title}</div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 1.6 }}>{f.desc}</p>
                <span style={{
                  display: 'inline-block', marginTop: 8,
                  padding: '2px 10px', borderRadius: 'var(--radius-full)',
                  background: 'var(--color-yellow-light)', color: 'var(--color-yellow-dark)',
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                }}>Phase 3</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
