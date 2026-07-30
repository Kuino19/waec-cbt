import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { Question } from '@/lib/types'

const GROQ_API_KEY = process.env.GROQ_API_KEY

function parseUnsafeJson(str: string) {
  let cleaned = str.trim()
  cleaned = cleaned.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim()
  cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
  return JSON.parse(cleaned)
}

export async function POST(request: NextRequest) {
  try {
    const { subject, count = 3 } = await request.json()
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
    }

    const prompt = `You are a Senior WAEC Chief Examiner for ${String(subject).toUpperCase()}.
Generate exactly ${count} authentic WAEC Senior School Certificate Examination (SSCE) Multiple Choice CBT Questions.

STRICT FORMAT RULES:
1. Provide 4 options: A, B, C, D.
2. For math/science, use standard LaTeX inline delimiters \\(x^2\\) or \\frac{a}{b}.
3. Provide a clear 2-sentence explanation for the answer.
4. Set realistic year (2015-2024) and difficulty (easy, medium, hard).

Return ONLY a raw JSON array starting with [ and ending with ]:
[
  {
    "subject": "${subject}",
    "topic": "Topic Name",
    "year": 2022,
    "difficulty": "medium",
    "type": "mcq",
    "question": "Question text here",
    "options": { "A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D" },
    "answer": "A",
    "explanation": "Explanation here."
  }
]`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You generate JSON WAEC CBT questions. Output strictly raw JSON array.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    const data = await res.json()
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 429 })
    }

    const content = data.choices?.[0]?.message?.content || '[]'
    const newQuestions: Question[] = parseUnsafeJson(content)

    // Save to seed-questions.json
    const seedPath = join(process.cwd(), 'data', 'seed-questions.json')
    let allQuestions: Question[] = []
    if (existsSync(seedPath)) {
      try {
        allQuestions = JSON.parse(readFileSync(seedPath, 'utf-8'))
      } catch (e) {}
    }

    newQuestions.forEach((q, idx) => {
      q.id = `groq_${subject}_${Date.now()}_${idx}`
      q.subject = subject
    })

    allQuestions.push(...newQuestions)
    writeFileSync(seedPath, JSON.stringify(allQuestions, null, 2))

    return NextResponse.json({
      success: true,
      count: newQuestions.length,
      questions: newQuestions,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate questions' }, { status: 500 })
  }
}
