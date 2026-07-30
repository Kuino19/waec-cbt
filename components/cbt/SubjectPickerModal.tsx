'use client'

import { useState } from 'react'
import { Check, Lock, Search, Sparkles, X, ShieldAlert } from 'lucide-react'
import { ALL_WAEC_SUBJECTS, WAECSubject } from '@/lib/subjects'

interface SubjectPickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentSubjects: string[]
  onSave: (newSubjects: string[]) => void
}

export default function SubjectPickerModal({
  isOpen,
  onClose,
  currentSubjects,
  onSave,
}: SubjectPickerModalProps) {
  const [selected, setSelected] = useState<string[]>(currentSubjects)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const toggleSubject = (sub: WAECSubject) => {
    if (sub.isCompulsory) return // Mandatory

    setErrorMsg(null)
    if (selected.includes(sub.id)) {
      setSelected(selected.filter(id => id !== sub.id))
    } else {
      if (selected.length >= 9) {
        setErrorMsg('You can only select up to 9 WAEC subjects.')
        return
      }
      setSelected([...selected, sub.id])
    }
  }

  const handleSave = () => {
    if (selected.length !== 9) {
      setErrorMsg(`Please select exactly 9 subjects. Currently selected: ${selected.length}`)
      return
    }
    onSave(selected)
    onClose()
  }

  const filteredSubjects = ALL_WAEC_SUBJECTS.filter(s => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#0F172A',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '1.25rem',
        maxWidth: '850px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        color: '#F8FAFC',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#0EA5E9" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Select Your 9 WAEC Subjects
              </h2>
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#94A3B8' }}>
              Customise your 9 registered exam subjects for your mock tests and study dashboard.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Bar */}
        <div style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(14, 165, 233, 0.1)',
          borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            Subjects Selected:{' '}
            <span style={{
              color: selected.length === 9 ? '#22C55E' : '#F59E0B',
              fontWeight: 800,
              fontSize: '1rem',
            }}>
              {selected.length} / 9
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            Mathematics & English Language are compulsory
          </div>
        </div>

        {errorMsg && (
          <div style={{
            margin: '0.75rem 1.5rem 0 1.5rem',
            padding: '0.6rem 1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            color: '#FCA5A5',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <ShieldAlert size={16} />
            {errorMsg}
          </div>
        )}

        {/* Filters & Search */}
        <div style={{
          padding: '1rem 1.5rem 0.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{
            position: 'relative',
          }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748B' }} />
            <input
              type="text"
              placeholder="Search subject by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'science', label: 'Science' },
              { id: 'commercial', label: 'Commercial' },
              { id: 'arts', label: 'Arts' },
              { id: 'vocational', label: 'Vocational' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: activeCategory === cat.id ? '#0EA5E9' : 'rgba(255, 255, 255, 0.08)',
                  color: activeCategory === cat.id ? 'white' : '#94A3B8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Subjects Grid */}
        <div style={{
          padding: '1rem 1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '0.75rem',
        }}>
          {filteredSubjects.map(sub => {
            const isSelected = selected.includes(sub.id)
            const isComp = sub.isCompulsory

            return (
              <div
                key={sub.id}
                onClick={() => toggleSubject(sub)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '0.75rem',
                  border: isSelected
                    ? '1.5px solid #0EA5E9'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected
                    ? 'rgba(14, 165, 233, 0.12)'
                    : 'rgba(255, 255, 255, 0.03)',
                  cursor: isComp ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isSelected ? 'white' : '#CBD5E1',
                  }}>
                    {sub.name}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: sub.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: '2px',
                    fontWeight: 700,
                  }}>
                    {sub.category}
                  </div>
                </div>

                <div>
                  {isComp ? (
                    <span style={{
                      padding: '2px 6px',
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: '#C084FC',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}>
                      <Lock size={10} /> LOCK
                    </span>
                  ) : isSelected ? (
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#0EA5E9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}>
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.95)',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Selected: <strong style={{ color: 'white' }}>{selected.length}</strong> of 9
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'transparent',
                color: '#94A3B8',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: selected.length === 9 ? 'linear-gradient(135deg, #0EA5E9, #0284C7)' : 'rgba(255,255,255,0.1)',
                color: selected.length === 9 ? 'white' : '#64748B',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: selected.length === 9 ? 'pointer' : 'not-allowed',
                boxShadow: selected.length === 9 ? '0 4px 14px rgba(14, 165, 233, 0.4)' : 'none',
              }}
            >
              Confirm 9 Subjects
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
