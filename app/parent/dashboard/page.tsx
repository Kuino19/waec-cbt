'use client'
import Link from 'next/link'
import '@/styles/dashboard.css'

export default function ParentDashboard() {
  return (
    <div className="page">
      <nav className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logoMark">E</div>
          <span className="navbar__brand">Edu<span>CBT</span></span>
        </div>
        <div className="navbar__nav">
          <span style={{ color: 'var(--color-teal-light)', fontSize: 'var(--text-sm)' }}>Parent Portal</span>
          <Link href="/" className="navbar__link">Home</Link>
        </div>
      </nav>
      <div className="dashboardPage">
        <main className="dashboardMain" style={{ maxWidth: 800 }}>
          <div className="welcomeBanner">
            <div className="welcomeBanner__greeting">Parent Dashboard</div>
            <h1 className="welcomeBanner__name">Monitor Your Child's Progress</h1>
            <p className="welcomeBanner__meta">Coming in Phase 2 — Analytics, study time tracking & SMS alerts</p>
          </div>
          <div className="subjectGrid">
            {[
              { icon: '⏱️', title: 'Study Time Tracker', desc: 'See daily & weekly active study time per subject.' },
              { icon: '🔥', title: 'Weakness Heatmap', desc: 'Identify which topics need the most attention.' },
              { icon: '📱', title: 'SMS/WhatsApp Alerts', desc: 'Get notified 24h before each exam paper.' },
              { icon: '💳', title: 'Subscription', desc: 'Manage your monthly or exam season pass.' },
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
                }}>
                  Phase 2
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
