'use client'

import { ShieldAlert, AlertOctagon, FileText, ArrowRight } from 'lucide-react'

export interface InfringementLog {
  strikeNumber: number
  reason: string
  timestamp: string
}

interface InfringementModalProps {
  isOpen: boolean
  logs: InfringementLog[]
  onProceedToResults: () => void
}

export default function InfringementModal({
  isOpen,
  logs,
  onProceedToResults,
}: InfringementModalProps) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#0F172A',
        border: '1.5px solid #EF4444',
        borderRadius: '1.25rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.3)',
        color: '#F8FAFC',
        overflow: 'hidden',
        animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(239, 68, 68, 0.15)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
          }}>
            <AlertOctagon size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#FCA5A5' }}>
              EXAM TERMINATED
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#CBD5E1' }}>
              Anti-Cheat Policy Violation & Infringement Report
            </p>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '0.75rem',
            marginBottom: '1.25rem',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Primary Reason for Termination
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EF4444' }}>
              Maximum Anti-Cheat Violations Reached (3/3 Strikes Logged)
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.35rem 0 0 0' }}>
              Activities such as taking screenshots, exiting full screen mode, tab switching, or window focus loss are strictly prohibited during WAEC CBT mock exams.
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} color="#0EA5E9" /> Infringement Log & Violation Timestamps:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {logs.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  Multiple window focus loss or screenshot events recorded.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: '#FCA5A5' }}>Strike {log.strikeNumber}:</strong> {log.reason}
                    </div>
                    <div style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {log.timestamp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onProceedToResults}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
            }}
          >
            View Submitted Score & Evaluation <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
