'use client'
import { useState } from 'react'
import Link from 'next/link'
import '@/styles/dashboard.css'

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const stats = [
    { value: '10,000+', label: 'Past Questions' },
    { value: '1988', label: 'Questions From' },
    { value: '11', label: 'WAEC Subjects' },
    { value: '98%', label: 'Student Satisfaction' },
  ]

  const features = [
    {
      icon: '🎯',
      title: 'Exam-Realistic CBT',
      desc: 'Experience the exact WAEC/GCE interface — countdown timer, question palette, and auto-submit. No surprises on exam day.',
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      desc: 'Identify your weak topics with detailed performance breakdowns. Study smarter, not harder.',
    },
    {
      icon: '⚡',
      title: 'Offline-First',
      desc: 'Download subject packs and practice anywhere — even without internet. Progress syncs automatically.',
    },
    {
      icon: '🛡️',
      title: 'Anti-Cheat Proctoring',
      desc: 'School mock exams with webcam snapshots, tab-switch detection, and question shuffling.',
    },
    {
      icon: '📱',
      title: 'Multi-Device',
      desc: 'Works perfectly on phones, tablets, and computers. One account across all your devices.',
    },
    {
      icon: '🔔',
      title: 'Exam Reminders',
      desc: 'SMS & WhatsApp alerts 24h, 12h, and 1h before each paper. Never miss a subject.',
    },
  ]

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar__logo">
          <div className="navbar__logoMark">E</div>
          <span className="navbar__brand">Edu<span>CBT</span></span>
        </div>
        <div className="navbar__nav">
          <Link href="/student/dashboard" className="navbar__link">For Students</Link>
          <a className="navbar__link" href="#features">Features</a>
          <a className="navbar__link" href="#pricing">Pricing</a>
          <Link href="/auth/login" className="navbar__link">Log In</Link>
          <Link href="/auth/register" className="navbar__cta">Start Free Trial</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero__eyebrow">
          <span>🇳🇬</span> West Africa&apos;s #1 CBT Exam Platform
        </div>
        <h1 className="hero__title" id="hero-heading">
          Ace Your WAEC & GCE<br />
          with <span className="highlight">Exam-Realistic</span> CBT Practice
        </h1>
        <p className="hero__subtitle">
          10,000+ past questions from 1988 to present. Step-by-step explanations,
          AI-powered mock exams, and real-time analytics for students, parents and schools.
        </p>
        <div className="hero__actions">
          <Link href="/student/dashboard" className="btn btn--primary btn--lg">
            Start Practising Free →
          </Link>
          <Link href="/auth/register?role=school" className="btn btn--outline btn--lg">
            Register Your School
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="statsRow" aria-label="Platform statistics">
        {stats.map(s => (
          <div key={s.label} className="statCard">
            <div className="statCard__value">{s.value}</div>
            <div className="statCard__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section id="features" className="section" aria-labelledby="features-heading">
        <h2 className="section__title" id="features-heading">Everything You Need to Excel</h2>
        <p className="section__subtitle">Built for Nigerian and West African students, by educators who understand the exam system.</p>
        <div className="subjectGrid">
          {features.map(f => (
            <div key={f.title} className="subjectCard">
              <div className="subjectCard__icon" style={{ fontSize: 28 }}>{f.icon}</div>
              <div className="subjectCard__name">{f.title}</div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: 'var(--color-navy)', padding: 'var(--sp-12) var(--sp-6)', textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--sp-4)' }}>
          Ready to Pass Your WAEC?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--text-lg)', marginBottom: 'var(--sp-8)', maxWidth: 500, margin: '0 auto var(--sp-8)' }}>
          Join thousands of students practising smarter every day.
        </p>
        <Link href="/auth/register" className="btn btn--primary btn--lg">
          Create Free Account →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#060e1f', padding: 'var(--sp-8) var(--sp-6)',
        color: 'rgba(255,255,255,0.4)', fontSize: 'var(--text-sm)', textAlign: 'center'
      }}>
        <p>© 2026 EduCBT Platform — Built for West African Students 🌍</p>
        <p style={{ marginTop: 'var(--sp-2)' }}>
          WAEC · NECO · JAMB Past Questions | Optimised for Nigeria
        </p>
      </footer>
    </div>
  )
}
