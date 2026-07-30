'use client'

import React from 'react'
import MathText from './MathText'

interface FormattedMarkdownProps {
  content: string
  className?: string
  style?: React.CSSProperties
}

export default function FormattedMarkdown({ content, className, style }: FormattedMarkdownProps) {
  if (!content) return null

  // Split lines into blocks
  const lines = content.split(/\r?\n/)
  const elements: React.ReactNode[] = []

  let inList = false
  let listItems: React.ReactNode[] = []

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          style={{
            margin: '0.75rem 0 1.25rem 1.25rem',
            paddingLeft: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            color: '#E2E8F0',
          }}
        >
          {listItems}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()

    // 1. Empty lines
    if (!trimmed) {
      flushList()
      return
    }

    // 2. Headings (###, ##, #)
    if (trimmed.startsWith('#')) {
      flushList()
      const level = (trimmed.match(/^#+/)?.[0] || '#').length
      const text = trimmed.replace(/^#+\s*/, '')

      const isMainHeading = level <= 2
      elements.push(
        <div
          key={`h-${idx}`}
          style={{
            marginTop: isMainHeading ? '1.75rem' : '1.25rem',
            marginBottom: '0.75rem',
            paddingBottom: isMainHeading ? '0.5rem' : '0.25rem',
            borderBottom: isMainHeading ? '1px solid rgba(255,255,255,0.1)' : 'none',
          }}
        >
          <h3
            style={{
              fontSize: isMainHeading ? '1.25rem' : '1.05rem',
              fontWeight: 800,
              color: isMainHeading ? '#38BDF8' : '#F8FAFC',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <MathText text={text} inline />
          </h3>
        </div>
      )
      return
    }

    // 3. Bullet points (* or - or •)
    if (/^[*•\-]\s+/.test(trimmed)) {
      inList = true
      const itemText = trimmed.replace(/^[*•\-]\s+/, '')
      listItems.push(
        <li key={`li-${idx}`} style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
          {renderFormattedInline(itemText)}
        </li>
      )
      return
    }

    // 4. Numbered lists (1. , 2. )
    if (/^\d+\.\s+/.test(trimmed)) {
      inList = true
      const itemText = trimmed.replace(/^\d+\.\s+/, '')
      listItems.push(
        <li key={`li-${idx}`} style={{ lineHeight: 1.6, fontSize: '0.95rem' }}>
          {renderFormattedInline(itemText)}
        </li>
      )
      return
    }

    // 5. Blockquotes (>)
    if (trimmed.startsWith('>')) {
      flushList()
      const quoteText = trimmed.replace(/^>\s*/, '')
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          style={{
            margin: '0.85rem 0',
            padding: '0.75rem 1rem',
            background: 'rgba(14, 165, 233, 0.1)',
            borderLeft: '4px solid #0EA5E9',
            borderRadius: '0 0.5rem 0.5rem 0',
            color: '#F1F5F9',
            fontSize: '0.9rem',
          }}
        >
          <MathText text={quoteText} />
        </blockquote>
      )
      return
    }

    // 6. Regular Paragraphs
    flushList()
    elements.push(
      <p key={`p-${idx}`} style={{ margin: '0.65rem 0', lineHeight: 1.7, fontSize: '0.95rem', color: '#E2E8F0' }}>
        {renderFormattedInline(trimmed)}
      </p>
    )
  })

  flushList()

  return (
    <div className={className} style={{ fontFamily: 'var(--font-primary)', ...style }}>
      {elements}
    </div>
  )
}

function renderFormattedInline(text: string): React.ReactNode {
  // Parse **bold** parts
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldContent = part.slice(2, -2)
      return (
        <strong key={i} style={{ color: '#F8FAFC', fontWeight: 800 }}>
          <MathText text={boldContent} inline />
        </strong>
      )
    }
    return <MathText key={i} text={part} inline />
  })
}
