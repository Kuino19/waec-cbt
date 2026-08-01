'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Link2, Clock, AlertTriangle, Bell, CheckCircle } from 'lucide-react'
import '@/styles/dashboard.css'
import type { ExamResult } from '@/lib/types'
import { SUBJECT_LABELS, SUBJECT_COLORS } from '@/lib/types'

export default function ParentDashboard() {
  const [mounted, setMounted] = useState(false)
  const [pin, setPin] = useState('')
  const [linkedPin, setLinkedPin] = useState<string | null>(null)
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedPin = localStorage.getItem('parent_child_pin')
    if (savedPin) {
      setLinkedPin(savedPin)
      fetchChildData(savedPin)
    }
  }, [])

  async function fetchChildData(childPin: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/results?userId=${childPin}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setResults(data)
          return
        }
      }

      // Local fallback for offline / client sessions
      const localData = localStorage.getItem('cbt_exam_results')
      if (localData) {
        try {
          setResults(JSON.parse(localData))
        } catch (e) {}
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleLink(e: React.FormEvent) {
    e.preventDefault()
    if (!pin) return
    localStorage.setItem('parent_child_pin', pin)
    setLinkedPin(pin)
    fetchChildData(pin)
  }

  function calculateWeaknesses() {
    const stats: Record<string, { total: number, count: number }> = {}
    results.forEach(r => {
       if (!stats[r.subject]) stats[r.subject] = { total: 0, count: 0 }
       stats[r.subject].total += r.percentage
       stats[r.subject].count += 1
    })
    return Object.entries(stats).map(([subject, data]) => ({
       subject: SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS] || subject,
       color: SUBJECT_COLORS[subject as keyof typeof SUBJECT_COLORS] || '#666',
       average: Math.round(data.total / data.count)
    })).sort((a,b) => a.average - b.average)
  }

  const activityData = [
    { name: 'Mon', time: 1.5 },
    { name: 'Tue', time: 2.0 },
    { name: 'Wed', time: 1.8 },
    { name: 'Thu', time: 3.2 },
    { name: 'Fri', time: 2.5 },
    { name: 'Sat', time: 4.0 },
    { name: 'Sun', time: 3.5 },
  ]

  if (!mounted) return null

  const weaknesses = calculateWeaknesses()

  return (
    <div className="page">
      <nav className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logoMark">E</div>
          <span className="navbar__brand">Edu<span>CBT</span></span>
        </div>
        <div className="navbar__nav">
          <span style={{ color: 'var(--color-teal-light)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>Parent Portal</span>
          <Link href="/parent" className="navbar__link" style={{ color: '#38BDF8', fontWeight: 600 }}>🖨️ Printable Report Card</Link>
          <Link href="/" className="navbar__link">Sign Out</Link>
        </div>
      </nav>

      <div className="dashboardPage">
        <main className="dashboardMain" style={{ maxWidth: 1000 }}>
          
          <div className="welcomeBanner" style={{ background: 'linear-gradient(135deg, var(--color-indigo-dark) 0%, #1e1b4b 100%)' }}>
            <div className="welcomeBanner__greeting">Parent Dashboard</div>
            <h1 className="welcomeBanner__name">Monitor Progress & Alerts</h1>
            <p className="welcomeBanner__meta">Track your child&apos;s performance and manage study schedules</p>
          </div>

          {!linkedPin ? (
            <div className="card" style={{ maxWidth: 500, margin: '2rem auto', textAlign: 'center' }}>
              <Link2 size={48} style={{ color: 'var(--color-indigo)', margin: '0 auto 1rem' }} />
              <h2 style={{ marginBottom: '1rem' }}>Link Child Account</h2>
              <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
                Enter the 6-digit PIN generated from your child&apos;s account to view their progress and set up SMS alerts.
              </p>
              <form onSubmit={handleLink} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="formInput"
                  placeholder="e.g. 8X9A2F"
                  value={pin}
                  onChange={e => setPin(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                />
                <button type="submit" className="btn btn--primary" style={{ flexShrink: 0 }}>
                  Connect
                </button>
              </form>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
              
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Clock style={{ color: 'var(--color-blue)' }} />
                  <h3 style={{ margin: 0 }}>Study Time Tracker</h3>
                </div>
                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--color-bg)' }}
                        formatter={(value: number) => [`${value} hrs`, 'Time']}
                      />
                      <Line type="monotone" dataKey="time" stroke="var(--color-blue)" strokeWidth={3} dot={{ fill: 'var(--color-blue)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <AlertTriangle style={{ color: 'var(--color-red)' }} />
                  <h3 style={{ margin: 0 }}>Weakness Heatmap</h3>
                </div>
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>Loading...</div>
                ) : weaknesses.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-muted)' }}>
                    No exam results yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {weaknesses.slice(0, 4).map(w => (
                      <div key={w.subject}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: 'var(--text-sm)' }}>
                          <span style={{ fontWeight: 600 }}>{w.subject}</span>
                          <span style={{ color: w.average < 50 ? 'var(--color-red)' : 'var(--color-text)' }}>{w.average}%</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--color-bg-alt)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${w.average}%`, 
                            background: w.average < 40 ? 'var(--color-red)' : w.average < 60 ? 'var(--color-yellow)' : 'var(--color-teal)'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <Bell style={{ color: 'var(--color-teal)' }} />
                  <h3 style={{ margin: 0 }}>SMS Notifications</h3>
                </div>
                <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.5rem' }}>
                  Receive instant SMS alerts when your child completes a mock exam.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--color-teal)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Active for Student PIN: {linkedPin}</span>
                </div>
                <button className="btn btn--secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => {
                  localStorage.removeItem('parent_child_pin');
                  setLinkedPin(null);
                  setResults([]);
                }}>
                  Unlink Account
                </button>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  )
}
