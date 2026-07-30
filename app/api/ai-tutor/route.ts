import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { subject, topic, questionText } = await request.json()

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }

    // Read syllabus context if available
    let syllabusContext = ''
    try {
      const syllabusPath = join(process.cwd(), 'data', 'syllabus.json')
      if (existsSync(syllabusPath)) {
        const raw = readFileSync(syllabusPath, 'utf-8')
        const map = JSON.parse(raw)
        if (map[subject]) {
          syllabusContext = JSON.stringify(map[subject])
        }
      }
    } catch (e) {}

    const userPrompt = questionText
      ? `Explain this WAEC ${subject.toUpperCase()} question step-by-step based on the official WAEC syllabus: "${questionText}"`
      : `Explain the WAEC ${subject.toUpperCase()} syllabus topic: "${topic || 'General Overview'}".`

    const systemPrompt = `You are an expert Senior WAEC Chief Examiner and Master Tutor for ${subject.toUpperCase()}.
Your goal is to provide a clear, encouraging, and comprehensive explanation aligned with the official West African Examinations Council (WAEC) SSCE syllabus.

OFFICIAL SYLLABUS CONTEXT:
${syllabusContext}

STRUCTURE YOUR EXPLANATION IN MARKDOWN:
1. 🎯 **WAEC Syllabus Objectives**: What WAEC expects students to know.
2. 💡 **Core Theory & Concept**: Simple, intuitive explanation of the concept.
3. 📐 **Key Formulas / Definitions**: Use LaTeX inline \\(...\\) for math/chemistry formulas.
4. 📝 **Worked WAEC Standard Example**: Step-by-step solution to a typical WAEC past question on this topic.
5. ⚠️ **Common Exam Pitfalls**: Mistakes WAEC candidates frequently make and how to avoid them.`

    // Try Gemini API first
    if (GEMINI_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }]
          })
        })

        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (text) {
          return NextResponse.json({ success: true, explanation: text, provider: 'Gemini AI' })
        }
      } catch (geminiErr) {
        console.warn('Gemini API failed, attempting Groq fallback...', geminiErr)
      }
    }

    // Fallback to Groq API
    if (GROQ_API_KEY) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      })

      const groqData = await groqRes.json()
      const groqText = groqData.choices?.[0]?.message?.content

      if (groqText) {
        return NextResponse.json({ success: true, explanation: groqText, provider: 'Groq Llama-3' })
      }
    }

    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 })
  }
}
