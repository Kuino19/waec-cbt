'use client'
/**
 * Lightweight toast notification system using Zustand.
 * Usage:
 *   const { addToast } = useToast()
 *   addToast('Saved!', 'success')
 *
 * Mount <ToastProvider /> once near the root of your app.
 */
import { create } from 'zustand'
import { useEffect } from 'react'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
  id: string
  message: string
  type: ToastType
  icon?: string
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, icon?: string) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', icon) => {
    const id = `toast_${Date.now()}_${Math.random()}`
    set(s => ({ toasts: [...s.toasts, { id, message, type, icon }] }))
    // Auto-remove after 3.5s
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
    }, 3500)
  },
  removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

export const useToast = () => {
  const { addToast } = useToastStore()
  return { addToast }
}

const ICONS: Record<ToastType, string> = {
  info:    'ℹ️',
  success: '✅',
  warning: '⚠️',
  error:   '❌',
}

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="toastContainer" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          role="alert"
          onClick={() => removeToast(t.id)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: 16 }}>{t.icon ?? ICONS[t.type]}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={e => { e.stopPropagation(); removeToast(t.id) }}
            style={{
              color: 'rgba(255,255,255,0.5)', fontSize: 'var(--text-sm)',
              lineHeight: 1, padding: '2px 4px',
            }}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
