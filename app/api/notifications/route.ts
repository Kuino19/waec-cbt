import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { to, message } = await req.json()
    const apiKey = process.env.TERMII_API_KEY
    const senderId = process.env.TERMII_SENDER_ID || 'EduCBT'

    if (!apiKey) {
      console.log(`\n[SMS Sandbox] To: ${to}\nMessage: ${message}\n`)
      return NextResponse.json({ success: true, sandbox: true })
    }

    const payload = {
      to,
      from: senderId,
      sms: message,
      type: "plain",
      channel: "generic",
      api_key: apiKey,
    }

    const res = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    return NextResponse.json({ success: true, termii: data })
  } catch (error) {
    console.error('SMS Notification Error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
