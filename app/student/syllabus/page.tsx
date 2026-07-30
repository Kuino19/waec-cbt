'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Search, ExternalLink } from 'lucide-react'
import { localDb } from '@/lib/db/local'

type Syllabus = {
  title: string
  source: string
  contentHtml: string
  textContent: string
}

export default function SyllabusPage() {
  const [syllabusList, setSyllabusList] = useState<Syllabus[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('Offline')
        }
        const res = await fetch('/api/syllabus')
        if (res.ok) {
          const data = await res.json()
          setSyllabusList(data)
          try {
            await localDb.cachedSyllabus.bulkPut(data)
          } catch (e) {
            console.warn('Failed to cache syllabus', e)
          }
        }
      } catch (e) {
        console.warn('Network fetch failed, falling back to local DB', e)
        try {
          const cached = await localDb.cachedSyllabus.toArray()
          if (cached && cached.length > 0) {
            setSyllabusList(cached)
          }
        } catch (err) {
          console.error('Failed to load from Dexie', err)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredList = syllabusList.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (selectedSyllabus) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, fontFamily: 'var(--font-primary)' }}>
        <button
          onClick={() => setSelectedSyllabus(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
            color: 'var(--color-navy)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
            marginBottom: 24, padding: 0
          }}
        >
          <ArrowLeft size={16} /> Back to subjects
        </button>
        
        <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-navy)', marginBottom: 8 }}>
          {selectedSyllabus.title} Syllabus
        </h1>
        
        <a 
          href={selectedSyllabus.source} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--color-teal)', textDecoration: 'none', fontSize: 'var(--text-sm)',
            fontWeight: 600, marginBottom: 32
          }}
        >
          View original source <ExternalLink size={14} />
        </a>

        <div 
          className="syllabus-content"
          style={{
            lineHeight: 1.8,
            color: 'var(--color-slate)',
            whiteSpace: 'pre-wrap',
            background: 'white',
            padding: 32,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {selectedSyllabus.textContent || 'No content available.'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', fontFamily: 'var(--font-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-navy)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <BookOpen size={32} color="var(--color-teal)" />
            WAEC 2026 Syllabus
          </h1>
          <p style={{ color: 'var(--color-muted)', marginTop: 8 }}>
            Browse official syllabuses for {syllabusList.length || '...'} subjects
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 32 }}>
        <Search style={{ position: 'absolute', left: 16, top: 14, color: 'var(--color-muted)' }} size={20} />
        <input
          type="text"
          placeholder="Search subjects (e.g., Mathematics, Biology)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px 14px 48px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #e2e8f0',
            fontSize: 'var(--text-base)',
            outline: 'none',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
          Loading syllabus data...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16
        }}>
          {filteredList.map((syllabus, i) => (
            <div
              key={i}
              onClick={() => setSelectedSyllabus(syllabus)}
              style={{
                background: 'white',
                padding: 20,
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-teal)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <h3 style={{ margin: 0, color: 'var(--color-navy)', fontSize: 'var(--text-lg)' }}>
                {syllabus.title}
              </h3>
              <p style={{ margin: '8px 0 0 0', color: 'var(--color-muted)', fontSize: 'var(--text-sm)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {syllabus.textContent.slice(0, 100)}...
              </p>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
              No subjects found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
