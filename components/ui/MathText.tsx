'use client'
/**
 * MathText — Renders a string that may contain LaTeX math expressions.
 *
 * Supported delimiters (matching the seed question format):
 *   Inline:   \(...\)   or   $...$
 *   Display:  \[...\]   or   $$...$$
 *
 * Falls back to plain text if KaTeX fails to parse.
 */

import { useMemo } from 'react'
import katex from 'katex'

interface MathTextProps {
  text: string
  /** If true, block-level display math is rendered inline instead */
  inline?: boolean
  className?: string
  style?: React.CSSProperties
}

type Segment =
  | { type: 'text'; content: string }
  | { type: 'math-inline'; content: string }
  | { type: 'math-display'; content: string }

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = []
  // Match \(...\), \[...\], $...$, $$...$$
  const PATTERN = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^\$\n]*?\$)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    const raw = match[0]
    if (raw.startsWith('\\[') || raw.startsWith('$$')) {
      const inner = raw.startsWith('\\[')
        ? raw.slice(2, -2)
        : raw.slice(2, -2)
      segments.push({ type: 'math-display', content: inner.trim() })
    } else {
      const inner = raw.startsWith('\\(')
        ? raw.slice(2, -2)
        : raw.slice(1, -1)
      segments.push({ type: 'math-inline', content: inner.trim() })
    }
    lastIndex = match.index + raw.length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) })
  }

  return segments
}

function renderMath(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      trust: false,
      macros: {
        '\\R': '\\mathbb{R}',
        '\\N': '\\mathbb{N}',
        '\\Z': '\\mathbb{Z}',
      },
    })
  } catch {
    return `<span style="color:var(--color-red);font-size:0.85em">[Math error: ${latex}]</span>`
  }
}

export default function MathText({ text, inline = false, className, style }: MathTextProps) {
  const segments = useMemo(() => parseSegments(text), [text])

  const parts = segments.map((seg, i) => {
    if (seg.type === 'text') {
      // Preserve line breaks
      return <span key={i}>{seg.content}</span>
    }
    const isDisplay = seg.type === 'math-display' && !inline
    const html = renderMath(seg.content, isDisplay)
    return (
      <span
        key={i}
        className={`math-text${isDisplay ? ' math-display' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
        style={isDisplay ? { display: 'block', overflowX: 'auto', margin: '8px 0' } : undefined}
      />
    )
  })

  return (
    <span className={className} style={style}>
      {parts}
    </span>
  )
}
