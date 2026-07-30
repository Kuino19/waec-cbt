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

    const filtered = subject
      ? all.filter(q => q.subject === subject)
      : all

    // Shuffle for mock mode variety
    const shuffled = filtered.sort(() => Math.random() - 0.5)

    return NextResponse.json(shuffled, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load questions' }, { status: 500 })
  }
}
