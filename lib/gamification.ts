export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

const BADGES_KEY = 'cbt_unlocked_badges'
const STREAK_KEY = 'cbt_streak_data'

export function getStreakData(): { currentStreak: number; lastActiveDate: string } {
  if (typeof window === 'undefined') return { currentStreak: 1, lastActiveDate: new Date().toISOString() }
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) {
      const today = new Date().toISOString().split('T')[0]
      const init = { currentStreak: 1, lastActiveDate: today }
      localStorage.setItem(STREAK_KEY, JSON.stringify(init))
      return init
    }
    const parsed = JSON.parse(raw)
    const today = new Date().toISOString().split('T')[0]
    const lastDate = new Date(parsed.lastActiveDate)
    const currentDate = new Date(today)
    
    const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays === 1) {
      const updated = { currentStreak: parsed.currentStreak + 1, lastActiveDate: today }
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated))
      return updated
    } else if (diffDays > 1) {
      const reset = { currentStreak: 1, lastActiveDate: today }
      localStorage.setItem(STREAK_KEY, JSON.stringify(reset))
      return reset
    }
    return parsed
  } catch (e) {
    return { currentStreak: 1, lastActiveDate: new Date().toISOString() }
  }
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_exam',
    title: 'First Step',
    description: 'Completed your first WAEC mock exam',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Finished an exam in under half the time with >80% score',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'perfect_100',
    title: 'Perfectionist',
    description: 'Scored 100% in a mock exam',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'streak_5',
    title: 'Consistent Scholar',
    description: 'Maintained a 5-day practice streak',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'all_9_subjects',
    title: 'WAEC Master',
    description: 'Completed mock exams in all 9 registered subjects',
    icon: '🏆',
    unlocked: false,
  },
]

export function getStudentBadges(): Badge[] {
  if (typeof window === 'undefined') return ALL_BADGES
  try {
    const raw = localStorage.getItem(BADGES_KEY)
    const unlockedIds: string[] = raw ? JSON.parse(raw) : []
    return ALL_BADGES.map(b => ({
      ...b,
      unlocked: unlockedIds.includes(b.id),
    }))
  } catch (e) {
    return ALL_BADGES
  }
}

export function unlockBadge(badgeId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(BADGES_KEY)
    const unlockedIds: string[] = raw ? JSON.parse(raw) : []
    if (!unlockedIds.includes(badgeId)) {
      unlockedIds.push(badgeId)
      localStorage.setItem(BADGES_KEY, JSON.stringify(unlockedIds))
      return true
    }
    return false
  } catch (e) {
    return false
  }
}
