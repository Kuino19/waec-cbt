'use client'
/**
 * Skeleton loaders — plug-and-play shimmer placeholders.
 * Usage:
 *   <SkeletonText lines={3} />
 *   <SkeletonCard />
 *   <SkeletonStatCard />
 */

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, borderRadius = '6px', style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, flexShrink: 0, ...style }}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, lastWidth = '60%' }: { lines?: number; lastWidth?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} aria-busy="true" aria-label="Loading…">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? lastWidth : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
      aria-hidden="true"
    >
      <Skeleton width={48} height={48} borderRadius="12px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={24} width="50%" />
        <Skeleton height={12} width="70%" />
      </div>
    </div>
  )
}

export function SkeletonSubjectCard() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      aria-hidden="true"
    >
      <Skeleton width={44} height={44} borderRadius="12px" />
      <Skeleton height={18} width="70%" />
      <Skeleton height={13} width="90%" />
      <Skeleton height={6} borderRadius="999px" />
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton height={34} style={{ flex: 1, borderRadius: '8px' }} />
        <Skeleton height={34} style={{ flex: 1, borderRadius: '8px' }} />
      </div>
    </div>
  )
}

export function SkeletonQuestion() {
  return (
    <div style={{ padding: '32px' }} aria-busy="true" aria-label="Loading question…">
      {/* Question number */}
      <Skeleton height={12} width="30%" style={{ marginBottom: 20 }} />
      {/* Question text */}
      <SkeletonText lines={3} lastWidth="40%" />
      <div style={{ height: 24 }} />
      {/* Options */}
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <Skeleton width={32} height={32} borderRadius="50%" />
          <Skeleton height={16} width={`${70 + Math.random() * 20}%`} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonExamPage() {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'var(--color-canvas)',
        display: 'flex', flexDirection: 'column', zIndex: 400,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 56, background: 'var(--color-navy)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 24px',
        }}
      >
        <Skeleton height={14} width={180} style={{ background: 'rgba(255,255,255,0.12)' }} />
        <Skeleton height={36} width={90} borderRadius="8px" style={{ background: 'rgba(255,255,255,0.12)' }} />
      </div>
      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Question panel */}
        <div style={{ flex: 1, padding: 32 }}>
          <SkeletonQuestion />
        </div>
        {/* Control panel */}
        <div
          style={{
            width: 320, borderLeft: '1px solid var(--color-border)',
            background: 'var(--color-surface)', padding: 20,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}
        >
          <Skeleton height={12} width="40%" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {[...Array(40)].map((_, i) => (
              <Skeleton key={i} height={32} borderRadius="6px" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
