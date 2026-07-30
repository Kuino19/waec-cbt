'use client'

import { useState } from 'react'
import { BookOpen, X, Calculator, Atom, FlaskConical, Search } from 'lucide-react'
import MathText from '@/components/ui/MathText'

interface FormulaSheetModalProps {
  isOpen: boolean
  onClose: () => void
}

const FORMULAS = [
  {
    category: 'Mathematics',
    icon: Calculator,
    color: '#0EA5E9',
    items: [
      { name: 'Quadratic Formula', formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', notes: 'For ax² + bx + c = 0' },
      { name: 'Pythagoras Theorem', formula: 'a^2 + b^2 = c^2', notes: 'Right-angled triangles' },
      { name: 'Area of Circle', formula: 'A = \\pi r^2', notes: 'r = radius' },
      { name: 'Circumference of Circle', formula: 'C = 2\\pi r', notes: 'r = radius' },
      { name: 'Volume of Sphere', formula: 'V = \\frac{4}{3}\\pi r^3', notes: 'r = radius' },
      { name: 'Logarithm Product Rule', formula: '\\log_b(xy) = \\log_b(x) + \\log_b(y)', notes: 'Logarithm properties' },
      { name: 'Arithmetic Progression (nth term)', formula: 'T_n = a + (n-1)d', notes: 'a = first term, d = common diff' },
      { name: 'Geometric Progression (nth term)', formula: 'T_n = a r^{n-1}', notes: 'r = common ratio' },
    ]
  },
  {
    category: 'Physics',
    icon: Atom,
    color: '#F59E0B',
    items: [
      { name: 'Newton\'s Second Law', formula: 'F = ma', notes: 'F = Force, m = mass, a = accel' },
      { name: 'Kinematic Equation 1', formula: 'v = u + at', notes: 'u = initial, v = final, t = time' },
      { name: 'Kinematic Equation 2', formula: 's = ut + \\frac{1}{2}at^2', notes: 's = displacement' },
      { name: 'Ohm\'s Law', formula: 'V = IR', notes: 'V = Voltage, I = Current, R = Resistance' },
      { name: 'Kinetic Energy', formula: 'E_k = \\frac{1}{2}m v^2', notes: 'm = mass, v = velocity' },
      { name: 'Gravitational Potential Energy', formula: 'E_p = mgh', notes: 'g = 9.8 m/s², h = height' },
      { name: 'Wave Equation', formula: 'v = f \\lambda', notes: 'v = wave speed, f = freq, λ = wavelength' },
    ]
  },
  {
    category: 'Chemistry',
    icon: FlaskConical,
    color: '#EF4444',
    items: [
      { name: 'Ideal Gas Law', formula: 'PV = nRT', notes: 'R = 8.314 J/(mol·K)' },
      { name: 'Molarity / Concentration', formula: 'C = \\frac{n}{V}', notes: 'n = moles, V = volume (L)' },
      { name: 'pH Definition', formula: 'pH = -\\log_{10}[H^+]', notes: '[H+] = hydrogen ion conc' },
      { name: 'Boyle\'s Law', formula: 'P_1 V_1 = P_2 V_2', notes: 'Constant temperature' },
      { name: 'Charles\'s Law', formula: '\\frac{V_1}{T_1} = \\frac{V_2}{T_2}', notes: 'Constant pressure' },
    ]
  }
]

export default function FormulaSheetModal({ isOpen, onClose }: FormulaSheetModalProps) {
  const [activeTab, setActiveTab] = useState<string>('Mathematics')
  const [search, setSearch] = useState<string>('')

  if (!isOpen) return null

  const activeCategory = FORMULAS.find(f => f.category === activeTab) || FORMULAS[0]

  const filteredItems = activeCategory.items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.notes.toLowerCase().includes(search.toLowerCase())
  )

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
        maxWidth: '750px',
        width: '100%',
        maxHeight: '85vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <BookOpen size={22} color="#0EA5E9" />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                WAEC Official Formula Sheet
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                Quick reference guide for Mathematics, Physics & Chemistry
              </p>
            </div>
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

        {/* Tabs & Search */}
        <div style={{ padding: '1rem 1.5rem 0.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {FORMULAS.map(f => {
              const Icon = f.icon
              const isActive = activeTab === f.category
              return (
                <button
                  key={f.category}
                  onClick={() => setActiveTab(f.category)}
                  style={{
                    flex: 1,
                    padding: '0.6rem 1rem',
                    borderRadius: '0.6rem',
                    border: 'none',
                    background: isActive ? f.color : 'rgba(255,255,255,0.06)',
                    color: isActive ? 'white' : '#94A3B8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={16} />
                  {f.category}
                </button>
              )
            })}
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#64748B' }} />
            <input
              type="text"
              placeholder={`Search ${activeTab} formulas...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.4rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Formula Cards */}
        <div style={{
          padding: '1rem 1.5rem',
          overflowY: 'auto',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '0.75rem',
        }}>
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: activeCategory.color }}>
                  {item.name}
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '1.05rem',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '0.5rem',
                  margin: '0.5rem 0',
                  color: '#F8FAFC',
                  borderLeft: `3px solid ${activeCategory.color}`,
                }}>
                  <MathText text={item.formula} />
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                {item.notes}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
