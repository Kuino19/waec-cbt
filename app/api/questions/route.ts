import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Question } from '@/lib/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const subject = searchParams.get('subject')

  try {
    const filePath = join(process.cwd(), 'data', 'seed-questions.json')
    const raw = readFileSync(filePath, 'utf-8')
    const all: Question[] = JSON.parse(raw)

    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '')

    let filtered = subject
      ? all.filter(q => normalize(q.subject) === normalize(subject) || normalize(q.subject).includes(normalize(subject)))
      : all

    // Fallback if subject has no specific questions loaded
    if (filtered.length === 0) {
      filtered = all
    }

    // Shuffle for mock mode variety
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)

    return NextResponse.json(shuffled, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 })
  }
}
