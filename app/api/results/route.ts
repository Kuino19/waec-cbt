import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { examResults } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const results = await db.select().from(examResults)
      .where(eq(examResults.userId, userId))
      .orderBy(desc(examResults.submittedAt))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Fetch results error:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { id, userId, subject, score, percentage, correct, wrong, unanswered, totalQuestions, timeSpentSeconds } = data
    
    await db.insert(examResults).values({
      id,
      userId,
      subject,
      score,
      percentage,
      correct,
      wrong,
      unanswered,
      totalQuestions,
      timeSpentSeconds,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save result error:', error)
    return NextResponse.json({ error: 'Failed to save result' }, { status: 500 })
  }
}
