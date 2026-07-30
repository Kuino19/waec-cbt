import { ExamResult, Question } from './types'

export interface TopicDiagnostic {
  topic: string
  subject: string
  totalAttempted: number
  correct: number
  wrong: number
  percentage: number
  status: 'critical' | 'warning' | 'strong'
}

export function analyzeTopicPerformance(results: ExamResult[]): TopicDiagnostic[] {
  const topicMap: Record<string, { subject: string; total: number; correct: number }> = {}

  results.forEach(result => {
    result.questions.forEach(q => {
      const topicName = q.topic || 'General Topic'
      const key = `${result.subject}::${topicName}`
      if (!topicMap[key]) {
        topicMap[key] = { subject: result.subject, total: 0, correct: 0 }
      }
      topicMap[key].total += 1
      const studentAns = result.answers[q.id]
      if (studentAns && studentAns === q.answer) {
        topicMap[key].correct += 1
      }
    })
  })

  const diagnostics: TopicDiagnostic[] = Object.entries(topicMap).map(([key, data]) => {
    const [_, topic] = key.split('::')
    const wrong = data.total - data.correct
    const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    let status: 'critical' | 'warning' | 'strong' = 'strong'
    if (percentage < 50) status = 'critical'
    else if (percentage < 70) status = 'warning'

    return {
      topic,
      subject: data.subject,
      totalAttempted: data.total,
      correct: data.correct,
      wrong,
      percentage,
      status,
    }
  })

  // Sort by lowest percentage first
  return diagnostics.sort((a, b) => a.percentage - b.percentage)
}
