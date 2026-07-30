'use client'
import { useEffect, useState } from 'react'
import { syncOfflineData } from '@/lib/examEngine'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineSync() {
  const [isOffline, setIsOffline] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    // Initial check
    if (typeof navigator !== 'undefined') {
      setIsOffline(!navigator.onLine)
    }

    const handleOnline = async () => {
      setIsOffline(false)
      setIsSyncing(true)
      await syncOfflineData()
      setIsSyncing(false)
    }

    const handleOffline = () => {
      setIsOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Also try to sync on mount if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      syncOfflineData()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline && !isSyncing) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      background: isOffline ? 'var(--color-red-dark)' : 'var(--color-teal)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: 'var(--radius-full)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      boxShadow: 'var(--shadow-lg)',
      zIndex: 9999,
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      animation: 'slideUp 0.3s ease-out'
    }}>
      {isOffline ? (
        <>
          <WifiOff size={18} />
          <span>You are offline. Results will be saved locally.</span>
        </>
      ) : (
        <>
          <Wifi size={18} />
          <span>Syncing offline results...</span>
        </>
      )}
    </div>
  )
}
