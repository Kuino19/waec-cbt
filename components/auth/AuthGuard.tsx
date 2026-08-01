'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: Array<'student' | 'parent' | 'school_admin'>
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rawUser = localStorage.getItem('cbt_user')
    const studentPin = localStorage.getItem('student_pin')

    if (!rawUser && !studentPin) {
      // User is NOT registered / logged in -> redirect to registration
      setIsAuthenticated(false)
      setLoading(false)
      router.replace(`/auth/register?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    try {
      if (rawUser) {
        const user = JSON.parse(rawUser)
        if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
          // Wrong role -> redirect to appropriate portal
          if (user.role === 'parent') router.replace('/parent/dashboard')
          else if (user.role === 'student') router.replace('/student/dashboard')
          else router.replace('/auth/login')
          return
        }
      }
      setIsAuthenticated(true)
    } catch (e) {
      router.replace('/auth/register')
    } finally {
      setLoading(false)
    }
  }, [router, pathname, allowedRoles])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0F172A',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid rgba(14, 165, 233, 0.2)',
          borderTopColor: '#0EA5E9',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94A3B8' }}>
          Verifying registration session...
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
