import Dexie, { type Table } from 'dexie'
import type { ExamResult, Question } from '@/lib/types'

export class EduCBTLocalDB extends Dexie {
  offlineResults!: Table<ExamResult, string> // Primary key is string (sessionId)
  cachedQuestions!: Table<Question, string>  // Primary key is string (id)
  cachedSyllabus!: Table<any, string>        // Primary key is string (title)

  constructor() {
    super('EduCBTLocalDB')
    this.version(2).stores({
      offlineResults: 'sessionId', 
      cachedQuestions: 'id, subject, topic',
      cachedSyllabus: 'title'
    })
  }
}

export const localDb = new EduCBTLocalDB()
