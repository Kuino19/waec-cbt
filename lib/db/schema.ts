import { pgTable, text, serial, timestamp, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  role: text('role').notNull(), // 'student' | 'parent' | 'school_admin'
  email: text('email'),
  name: text('name'),
  parentCode: text('parent_code'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const examResults = pgTable('exam_results', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  subject: text('subject').notNull(),
  score: integer('score').notNull(),
  percentage: integer('percentage').notNull(),
  correct: integer('correct').notNull().default(0),
  wrong: integer('wrong').notNull().default(0),
  unanswered: integer('unanswered').notNull().default(0),
  totalQuestions: integer('total_questions').notNull().default(40),
  timeSpentSeconds: integer('time_spent_seconds').notNull(),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
})

export const studySessions = pgTable('study_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  subject: text('subject').notNull(),
  activeSeconds: integer('active_seconds').notNull(),
  date: timestamp('date').defaultNow().notNull(),
})
