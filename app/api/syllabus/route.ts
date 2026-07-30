import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'syllabus.json')
    const file = await fs.readFile(dataPath, 'utf8')
    return NextResponse.json(JSON.parse(file))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load syllabus' }, { status: 500 })
  }
}
