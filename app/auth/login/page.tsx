'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard.css'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'student' | 'parent' | 'school_admin'>('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roles = [
    { id: 'student',      icon: '🎓', label: 'Student' },
    { id: 'parent',       icon: '👨‍👩‍👧', label: 'Parent' },
    { id: 'school_admin', icon: '🏫', label: 'School' },
  ] as const

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Mock auth: store in localStorage and redirect
    await new Promise(r => setTimeout(r, 800))

    try {
      const user = { email, role, name: email.split('@')[0], id: `user_${Date.now()}` }
      localStorage.setItem('cbt_user', JSON.stringify(user))

      if (role === 'student') router.push('/student/dashboard')
      else if (role === 'parent') router.push('/parent/dashboard')
      else router.push('/school/dashboard')
    } catch {
      setError('Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authCard__logo">
          <div className="authCard__logoMark">E</div>
          <h1 className="authCard__title">Welcome back</h1>
          <p className="authCard__subtitle">Log in to continue your exam preparation</p>
        </div>

        {/* Role Selector */}
        <div className="roleSelector" role="radiogroup" aria-label="Select your role">
          {roles.map(r => (
            <button
              key={r.id}
              className={`roleOption${role === r.id ? ' selected' : ''}`}
              onClick={() => setRole(r.id)}
              role="radio"
              aria-checked={role === r.id}
            >
              <div className="roleOption__icon">{r.icon}</div>
              <div className="roleOption__label">{r.label}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin}>
          <div className="formGroup">
            <label className="formLabel" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="formInput"
              placeholder="yourname@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="formGroup">
            <label className="formLabel" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="formInput"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--color-red-light)', color: 'var(--color-red-dark)',
              padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', marginBottom: 'var(--sp-4)',
            }}>
              {error}
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--sp-4)' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In →'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
              Register free
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
