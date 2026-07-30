'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-navy)',
      color: 'white',
      fontFamily: 'var(--font-primary)',
      padding: '24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        fontSize: '120px',
        fontWeight: 800,
        fontFamily: 'var(--font-mono)',
        background: 'linear-gradient(135deg, var(--color-teal-light), var(--color-teal-dark))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: '24px'
      }} className="scale-in">
        404
      </div>
      
      <h1 style={{ fontSize: '32px', marginBottom: '16px', color: 'white' }} className="fade-in stagger-1">
        Page Not Found
      </h1>
      
      <p style={{
        fontSize: '18px',
        color: 'rgba(255,255,255,0.7)',
        maxWidth: '400px',
        marginBottom: '40px',
        lineHeight: 1.6
      }} className="fade-in stagger-2">
        We couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>
      
      <div className="fade-in stagger-3">
        <Link href="/" className="btn btn--primary btn--lg">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  )
}
