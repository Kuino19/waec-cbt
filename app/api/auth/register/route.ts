import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function POST(req: Request) {
  try {
    const { name, email, role, parentCode } = await req.json()
    
    // For students, their ID acts as their PIN to give to their parents.
    // We generate a 6-digit alphanumeric PIN for students, or standard ID for parents.
    const id = role === 'student' 
      ? Math.random().toString(36).substring(2, 8).toUpperCase()
      : `usr_${Date.now()}`
    
    await db.insert(users).values({
      id,
      name,
      email,
      role,
      parentCode: parentCode || null,
    })

    return NextResponse.json({ user: { id, name, email, role, parentCode } })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}
