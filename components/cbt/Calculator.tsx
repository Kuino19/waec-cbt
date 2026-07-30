'use client'
import { useState } from 'react'

export default function Calculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0')
  const [expression, setExpression] = useState('')
  const [justEvaled, setJustEvaled] = useState(false)

  function handleInput(val: string) {
    if (val === 'C') {
      setDisplay('0')
      setExpression('')
      setJustEvaled(false)
      return
    }
    if (val === '⌫') {
      setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0')
      return
    }
    if (val === '=') {
      try {
        // Safe eval: only allow numeric and operator characters
        const cleaned = expression.replace(/[^0-9+\-*/().]/g, '')
        const result = Function('"use strict"; return (' + cleaned + ')')()
        const resultStr = String(parseFloat(result.toFixed(10)))
        setDisplay(resultStr)
        setExpression(resultStr)
        setJustEvaled(true)
      } catch {
        setDisplay('Error')
        setExpression('')
        setJustEvaled(true)
      }
      return
    }
    if (val === '±') {
      setDisplay(d => String(parseFloat(d) * -1))
      setExpression(e => e ? String(parseFloat(e) * -1) : '')
      return
    }
    if (val === '%') {
      setDisplay(d => String(parseFloat(d) / 100))
      return
    }

    const isOp = ['+', '-', '*', '/'].includes(val)
    if (justEvaled && !isOp) {
      setExpression(val === '.' ? '0.' : val)
      setDisplay(val === '.' ? '0.' : val)
      setJustEvaled(false)
      return
    }
    setJustEvaled(false)

    const newExpr = justEvaled && isOp
      ? expression + val
      : display === '0' && !isOp && val !== '.'
      ? val
      : expression + val

    setExpression(newExpr)
    setDisplay(isOp ? val : newExpr)
  }

  const buttons: { label: string; type: 'num' | 'op' | 'eq' | 'clear'; span?: number }[] = [
    { label: 'C',   type: 'clear' },
    { label: '⌫',  type: 'op' },
    { label: '%',   type: 'op' },
    { label: '/',   type: 'op' },
    { label: '7',   type: 'num' },
    { label: '8',   type: 'num' },
    { label: '9',   type: 'num' },
    { label: '*',   type: 'op' },
    { label: '4',   type: 'num' },
    { label: '5',   type: 'num' },
    { label: '6',   type: 'num' },
    { label: '-',   type: 'op' },
    { label: '1',   type: 'num' },
    { label: '2',   type: 'num' },
    { label: '3',   type: 'num' },
    { label: '+',   type: 'op' },
    { label: '±',   type: 'num' },
    { label: '0',   type: 'num' },
    { label: '.',   type: 'num' },
    { label: '=',   type: 'eq' },
  ]

  return (
    <div className="calculatorOverlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="calculatorBox">
        <div className="calcDisplay">
          <div className="calcDisplay__expr">{expression || ' '}</div>
          <div className="calcDisplay__value">{display}</div>
        </div>
        <div className="calcGrid">
          {buttons.map(btn => (
            <button
              key={btn.label}
              className={`calcBtn calcBtn--${btn.type}`}
              onClick={() => handleInput(btn.label)}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <button className="calcClose" onClick={onClose}>Close Calculator</button>
      </div>
    </div>
  )
}
