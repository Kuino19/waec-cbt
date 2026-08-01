'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Sparkles, UserCheck, ArrowRight, X } from 'lucide-react'
import '@/styles/dashboard.css'

interface PinAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PinAuthModal({ isOpen, onClose }: PinAuthModalProps) {
  const router = useRouter()
  const [pinInput, setPinInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let pin = pinInput.trim().toUpperCase()

      if (isNewUser) {
        if (!nameInput.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        // Generate new 6-character PIN
        pin = Math.random().toString(36).substring(2, 8).toUpperCase()
      } else {
        if (pin.length < 4) {
          setError('Please enter a valid 6-character Student PIN')
          setLoading(false)
          return
        }
      }

      // Store student user session
      const user = {
        id: pin,
        name: nameInput.trim() || `Student (${pin})`,
        role: 'student',
        studentPin: pin,
      }

      localStorage.setItem('cbt_user', JSON.stringify(user))
      localStorage.setItem('student_pin', pin)
      
      // Set flag to prompt 9-subject picker modal on dashboard
      localStorage.setItem('prompt_subject_picker', 'true')

      onClose()
      router.push('/student/dashboard')
    } catch (err) {
      setError('Failed to authenticate. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#0F172A',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        borderRadius: '1.25rem',
        padding: '2rem',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        position: 'relative',
        animation: 'fadeIn 0.25s ease-out both',
        color: '#F8FAFC',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.25rem', right: '1.25rem',
            background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '1rem',
            background: 'linear-gradient(135deg, #0EA5E9, #2563EB)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', marginBottom: '0.75rem',
            boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)'
          }}>
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'white' }}>
            {isNewUser ? 'Create Student Access PIN' : 'Enter Your Student PIN'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0.35rem 0 0 0' }}>
            {isNewUser ? 'Get your unique 6-digit access code for CBT practice & Parent linking' : 'Enter your 6-digit access code to log in and select your 9 WAEC subjects'}
          </p>
        </div>

        {/* Toggle Mode */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: '0.6rem', padding: 4, marginBottom: '1.25rem'
        }}>
          <button
            type="button"
            onClick={() => { setIsNewUser(false); setError(''); }}
            style={{
              flex: 1, padding: '0.45rem', borderRadius: '0.4rem', border: 'none',
              background: !isNewUser ? '#0EA5E9' : 'transparent',
              color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Existing Student (Enter PIN)
          </button>
          <button
            type="button"
            onClick={() => { setIsNewUser(true); setError(''); }}
            style={{
              flex: 1, padding: '0.45rem', borderRadius: '0.4rem', border: 'none',
              background: isNewUser ? '#0EA5E9' : 'transparent',
              color: 'white', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            New Student (Create PIN)
          </button>
        </div>

        <form onSubmit={handlePinSubmit}>
          {isNewUser && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Chukwuma Adebayo"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                style={{
                  width: '100%', padding: '0.7rem 1rem', background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.6rem',
                  color: 'white', fontSize: '0.9rem', outline: 'none'
                }}
                required={isNewUser}
              />
            </div>
          )}

          {!isNewUser && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                6-Digit Student PIN Code
              </label>
              <input
                type="text"
                placeholder="e.g. A7B9K2"
                value={pinInput}
                onChange={e => setPinInput(e.target.value.toUpperCase())}
                maxLength={6}
                style={{
                  width: '100%', padding: '0.7rem 1rem', background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.6rem',
                  color: '#38BDF8', fontSize: '1.2rem', fontWeight: 800,
                  letterSpacing: '0.2em', textAlign: 'center', outline: 'none'
                }}
                required={!isNewUser}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444', padding: '0.6rem 0.85rem', borderRadius: '0.5rem',
              fontSize: '0.8rem', marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: '0.65rem', border: 'none',
              background: 'linear-gradient(135deg, #0EA5E9, #2563EB)', color: 'white',
              fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)'
            }}
          >
            {loading ? 'Authenticating...' : isNewUser ? 'Generate PIN & Select 9 Subjects →' : 'Log In & Select 9 Subjects →'}
          </button>
        </form>
      </div>
    </div>
  )
}
