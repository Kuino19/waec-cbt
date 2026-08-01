'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { KeyRound, ArrowRight, CheckCircle } from 'lucide-react'
import '@/styles/dashboard.css'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'student' | 'parent' | 'school_admin'>('student')
  const [pinInput, setPinInput] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roles = [
    { id: 'student',      icon: '🎓', label: 'Student (PIN)' },
    { id: 'parent',       icon: '👨‍👩‍👧', label: 'Parent' },
    { id: 'school_admin', icon: '🏫', label: 'School' },
  ] as const

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (role === 'student') {
        const pin = pinInput.trim().toUpperCase()
        if (pin.length < 4) {
          setError('Please enter a valid 6-character Student PIN given by your Parent or School.')
          setLoading(false)
          return
        }

        const studentUser = {
          id: pin,
          name: `Student (${pin})`,
          role: 'student',
          studentPin: pin,
        }

        localStorage.setItem('cbt_user', JSON.stringify(studentUser))
        localStorage.setItem('student_pin', pin)
        localStorage.setItem('prompt_subject_picker', 'true')

        router.push('/student/dashboard')
      } else {
        const user = { email, role, name: email.split('@')[0], id: `usr_${Date.now()}` }
        localStorage.setItem('cbt_user', JSON.stringify(user))

        if (role === 'parent') router.push('/parent/dashboard')
        else router.push('/school/dashboard')
      }
    } catch {
      setError('Login failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authPage">
      <div className="authCard" style={{ maxWidth: 460 }}>
        <div className="authCard__logo">
          <div className="authCard__logoMark">E</div>
          <h1 className="authCard__title">Welcome to EduCBT</h1>
          <p className="authCard__subtitle">
            {role === 'student'
              ? 'Enter the 6-digit Student Access PIN given by your Parent or School'
              : 'Log in to manage Student PINs and view progress'}
          </p>
        </div>

        {/* Role Selector */}
        <div className="roleSelector" role="radiogroup" aria-label="Select your role">
          {roles.map(r => (
            <button
              key={r.id}
              className={`roleOption${role === r.id ? ' selected' : ''}`}
              onClick={() => { setRole(r.id); setError(''); }}
              type="button"
              role="radio"
              aria-checked={role === r.id}
            >
              <div className="roleOption__icon">{r.icon}</div>
              <div className="roleOption__label">{r.label}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin}>
          {role === 'student' ? (
            /* Student PIN Input Field */
            <div className="formGroup">
              <label className="formLabel" htmlFor="student-pin">
                6-Digit Student Access PIN
              </label>
              <input
                id="student-pin"
                type="text"
                className="formInput"
                placeholder="e.g. 8X9A2F"
                value={pinInput}
                onChange={e => setPinInput(e.target.value.toUpperCase())}
                maxLength={6}
                style={{
                  color: '#38BDF8',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textAlign: 'center',
                }}
                required
                autoComplete="off"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
                Your Parent or School received this PIN upon registration.
              </p>
            </div>
          ) : (
            /* Parent & School Login Fields */
            <>
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
            </>
          )}

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
            {loading ? 'Logging in...' : role === 'student' ? 'Enter PIN & Start Practising →' : 'Log In →'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Need a Student Access PIN?{' '}
            <Link href="/auth/register" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
              Parent & School Registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
