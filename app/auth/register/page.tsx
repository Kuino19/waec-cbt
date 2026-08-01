'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard.css'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'student' | 'parent' | 'school_admin'>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const roles = [
    { id: 'student',      icon: '🎓', label: 'Student' },
    { id: 'parent',       icon: '👨‍👩‍👧', label: 'Parent' },
    { id: 'school_admin', icon: '🏫', label: 'School Admin' },
  ] as const

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, name, parentCode: schoolCode })
      })
      if (!res.ok) throw new Error('Registration failed')
      
      const { user } = await res.json()
      localStorage.setItem('cbt_user', JSON.stringify(user))
      if (user.id) localStorage.setItem('student_pin', user.id)
      
      if (role === 'student') {
        localStorage.setItem('prompt_subject_picker', 'true')
        router.push('/student/dashboard')
      }
      else if (role === 'parent') router.push('/parent/dashboard')
      else router.push('/school/dashboard')
    } catch {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="authPage">
      <div className="authCard" style={{ maxWidth: 480 }}>
        <div className="authCard__logo">
          <div className="authCard__logoMark">E</div>
          <h1 className="authCard__title">Create your account</h1>
          <p className="authCard__subtitle">Join thousands of students preparing smarter</p>
        </div>

        <div className="roleSelector" role="radiogroup" aria-label="Select account type">
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

        <form onSubmit={handleRegister}>
          <div className="formGroup">
            <label className="formLabel" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="formInput"
              placeholder="Your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="formGroup">
            <label className="formLabel" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
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
            <label className="formLabel" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="formInput"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>

          {role === 'student' && (
            <div className="formGroup">
              <label className="formLabel" htmlFor="reg-code">
                School PIN or Parent Code <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="reg-code"
                type="text"
                className="formInput"
                placeholder="6-digit access code"
                value={schoolCode}
                onChange={e => setSchoolCode(e.target.value)}
                maxLength={6}
              />
            </div>
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
            id="register-btn"
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 'var(--sp-4)' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>

          <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
