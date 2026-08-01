'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, CheckCircle, KeyRound, ArrowRight } from 'lucide-react'
import '@/styles/dashboard.css'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'parent' | 'school_admin'>('parent')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedPin, setGeneratedPin] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const roles = [
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
        body: JSON.stringify({ email, role, name })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      
      localStorage.setItem('cbt_user', JSON.stringify(data.user))
      if (data.studentPin) {
        localStorage.setItem('parent_child_pin', data.studentPin)
        setGeneratedPin(data.studentPin)
      } else {
        router.push(role === 'parent' ? '/parent/dashboard' : '/school/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyPin = () => {
    if (!generatedPin) return
    navigator.clipboard.writeText(generatedPin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="authPage">
      <div className="authCard" style={{ maxWidth: 480 }}>
        
        {generatedPin ? (
          /* Success Card displaying Generated Student PIN */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '1rem',
              background: 'linear-gradient(135deg, #22C55E, #16A34A)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', marginBottom: '1rem', boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
            }}>
              <KeyRound size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy)', margin: '0 0 0.5rem 0' }}>
              Registration Successful!
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Give this 6-digit Student Access PIN to your child/student so they can log in and select their 9 WAEC subjects:
            </p>

            <div style={{
              background: 'var(--color-navy)', color: '#38BDF8',
              padding: '1.25rem', borderRadius: '0.75rem',
              fontSize: '2rem', fontWeight: 800, letterSpacing: '0.2em',
              fontFamily: 'var(--font-mono)', marginBottom: '1.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
            }}>
              <span>{generatedPin}</span>
              <button
                onClick={copyPin}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: 'white', padding: '0.4rem 0.6rem', borderRadius: '0.4rem',
                  cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                {copied ? <CheckCircle size={16} color="#22C55E" /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              onClick={() => router.push(role === 'parent' ? '/parent/dashboard' : '/school/dashboard')}
              className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Continue to Dashboard →
            </button>
          </div>
        ) : (
          /* Registration Form */
          <>
            <div className="authCard__logo">
              <div className="authCard__logoMark">E</div>
              <h1 className="authCard__title">Parent & School Registration</h1>
              <p className="authCard__subtitle">Register to issue Student Access PINs & monitor CBT progress</p>
            </div>

            {/* Student Notice Box */}
            <div style={{
              background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '0.75rem', padding: '0.85rem 1rem', marginBottom: '1.5rem',
              fontSize: '0.85rem', color: 'var(--color-navy)', lineHeight: 1.5
            }}>
              🎓 <strong>Are you a Student?</strong> Students do not register here. Ask your Parent or School Admin for your 6-digit Student Access PIN, then{' '}
              <Link href="/auth/login" style={{ color: 'var(--color-teal)', fontWeight: 700, textDecoration: 'underline' }}>
                Log in with your PIN here →
              </Link>
            </div>

            {/* Role Selector */}
            <div className="roleSelector" role="radiogroup" aria-label="Select account type">
              {roles.map(r => (
                <button
                  key={r.id}
                  className={`roleOption${role === r.id ? ' selected' : ''}`}
                  onClick={() => setRole(r.id)}
                  type="button"
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
                <label className="formLabel" htmlFor="reg-name">Full Name / Organization Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="formInput"
                  placeholder="e.g. Mr. & Mrs. Adebayo / Grace High School"
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
                {loading ? 'Creating account & generating PIN...' : 'Register & Issue Student PIN →'}
              </button>

              <div style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
                  Log in
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
