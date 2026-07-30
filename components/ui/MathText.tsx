'use client'
/**
 * MathText — Renders LaTeX math expressions, HTML formatting (<sup>, <sub>),
 * slash fractions (1/3x, 1/2), and unwrapped LaTeX math (\frac{a}{b}, x^2, \x^2\).
 */

import { useMemo } from 'react'
import katex from 'katex'

interface MathTextProps {
  text: string
  inline?: boolean
  className?: string
  style?: React.CSSProperties
}

type Segment =
  | { type: 'text'; content: string }
  | { type: 'math-inline'; content: string }
  | { type: 'math-display'; content: string }

function preprocessText(raw: string): string {
  if (!raw) return ''
  let cleaned = raw

  // 1. Normalize multiple backslashes (\\\\ -> \)
  cleaned = cleaned.replace(/\\\\+/g, '\\')

  // 2. Clean up stray leading/trailing backslashes around variables like \x^2\ -> x^2
  cleaned = cleaned.replace(/\\([a-zA-Z0-9\^_\-+*/=().{}]+)\\([^\w]|$)/g, '$1$2')

  // 3. Convert HTML superscript and subscript tags to LaTeX math
  cleaned = cleaned.replace(/<sup>(.*?)<\/sup>/gi, '^{$1}')
  cleaned = cleaned.replace(/<sub>(.*?)<\/sub>/gi, '_{$1}')

  // 4. Convert matrix unicode symbols (⎡⎣⎢x101x101x⎤⎦⎥)
  if (/[⎡⎣⎢⎤⎦⎥]/.test(cleaned)) {
    cleaned = cleaned.replace(/⎡\s*⎣\s*⎢([\s\S]*?)⎤\s*⎦\s*⎥/g, (_, matrixBody) => {
      const chars = matrixBody.trim().replace(/\s+/g, '')
      if (chars.length === 9) {
        return `\\(\\begin{pmatrix} ${chars[0]} & ${chars[1]} & ${chars[2]} \\\\ ${chars[3]} & ${chars[4]} & ${chars[5]} \\\\ ${chars[6]} & ${chars[7]} & ${chars[8]} \\end{pmatrix}\\)`
      }
      return `\\(\\begin{pmatrix} ${chars} \\end{pmatrix}\\)`
    })
    cleaned = cleaned.replace(/[⎡⎣⎢⎤⎦⎥]/g, '|')
  }

  // 5. Wrap unwrapped \frac{a}{b} in LaTeX inline delimiters \(\frac{a}{b}\) if missing
  cleaned = cleaned.replace(/(?<!\\\(|\\\[|\$)\\frac\{([^{}]+)\}\{([^{}]+)\}(?!\\\)|\\\]|\$)/g, '\\(\\frac{$1}{$2}\\)')

  // 6. Wrap unwrapped exponents like x^2, x^{2}, (x+1)^2 into \((x+1)^2\) if missing
  cleaned = cleaned.replace(/(?<!\\\(|\\\[|\$|\w)([a-zA-Z0-9().]+[\^\_]\{?[0-9a-zA-Z\-+]+\}?)(?!\\\)|\\\]|\$)/g, '\\($1\\)')

  // 7. Convert slash fractions like 1/3x, 1/2, 1/4x, -1/6 into KaTeX \frac{1}{3x}
  cleaned = cleaned.replace(/(?<![a-zA-Z0-9_\/])(-?\b[0-9a-zA-Z]+)\/([0-9a-zA-Z]+)(?![a-zA-Z0-9_\/])/g, (match, num, den) => {
    if (/^\d{4}$/.test(num) && /^\d{4}$/.test(den)) return match
    return `\\(\\frac{${num}}{${den}}\\)`
  })

  return cleaned
}

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = []
  const PATTERN = /(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^\$\n]*?\$)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) })
    }
    const raw = match[0]
    if (raw.startsWith('\\[') || raw.startsWith('$$')) {
      const inner = raw.startsWith('\\[') ? raw.slice(2, -2) : raw.slice(2, -2)
      segments.push({ type: 'math-display', content: inner.trim() })
    } else {
      const inner = raw.startsWith('\\(') ? raw.slice(2, -2) : raw.slice(1, -1)
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
      trust: true,
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
  const processed = useMemo(() => preprocessText(text), [text])
  const segments = useMemo(() => parseSegments(processed), [processed])

  const parts = segments.map((seg, i) => {
    if (seg.type === 'text') {
      const hasHtml = /<[a-z][\s\S]*>/i.test(seg.content)
      if (hasHtml) {
        return (
          <span
            key={i}
            dangerouslySetInnerHTML={{ __html: seg.content }}
          />
        )
      }
      return <span key={i}>{seg.content}</span>
    }
    const isDisplay = seg.type === 'math-display' && !inline
    const html = renderMath(seg.content, isDisplay)
    return (
      <span
        key={i}
        className={`math-text${isDisplay ? ' math-display' : ''}`}
        dangerouslySetInnerHTML={{ __html: html }}
        style={isDisplay ? { display: 'inline-block', verticalAlign: 'middle', margin: '0 2px' } : undefined}
      />
    )
  })

  return (
    <span className={className} style={style}>
      {parts}
    </span>
  )
}
