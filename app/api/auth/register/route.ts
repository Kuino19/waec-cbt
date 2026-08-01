import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

export async function POST(req: Request) {
  try {
    const { name, email, role } = await req.json()

    if (role === 'student') {
      return NextResponse.json({
        error: 'Students cannot register directly. A Parent or School Admin must register to issue a Student Access PIN.'
      }, { status: 400 })
    }

    const parentId = `usr_${Date.now()}`
    // Generate unique 6-digit Student Access PIN for the child/student
    const studentPin = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Save Parent / School Admin user
    await db.insert(users).values({
      id: parentId,
      name,
      email,
      role,
      parentCode: studentPin,
    })

    // Pre-create Student profile bound to this studentPin
    await db.insert(users).values({
      id: studentPin,
      name: `${name}'s Student`,
      email: `student_${studentPin.toLowerCase()}@educbt.com`,
      role: 'student',
      parentCode: parentId,
    })

    return NextResponse.json({
      user: { id: parentId, name, email, role, studentPin },
      studentPin,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 })
  }
}
