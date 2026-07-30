export interface WAECSubject {
  id: string
  name: string
  category: 'compulsory' | 'science' | 'commercial' | 'arts' | 'vocational'
  isCompulsory?: boolean
  iconName?: string
  color: string
}

export const ALL_WAEC_SUBJECTS: WAECSubject[] = [
  // Compulsory
  { id: 'mathematics', name: 'Mathematics', category: 'compulsory', isCompulsory: true, color: '#0EA5E9' },
  { id: 'english', name: 'English Language', category: 'compulsory', isCompulsory: true, color: '#8B5CF6' },

  // Sciences
  { id: 'physics', name: 'Physics', category: 'science', color: '#F59E0B' },
  { id: 'chemistry', name: 'Chemistry', category: 'science', color: '#EF4444' },
  { id: 'biology', name: 'Biology', category: 'science', color: '#22C55E' },
  { id: 'agricultural_science', name: 'Agricultural Science', category: 'science', color: '#10B981' },
  { id: 'further_mathematics', name: 'Further Mathematics', category: 'science', color: '#6366F1' },
  { id: 'computer_science', name: 'Computer Science', category: 'science', color: '#0284C7' },
  { id: 'data_processing', name: 'Data Processing', category: 'science', color: '#06B6D4' },
  { id: 'digital_technology', name: 'Digital Technology (ICT)', category: 'science', color: '#3B82F6' },
  { id: 'geography', name: 'Geography', category: 'science', color: '#84CC16' },
  { id: 'health_education', name: 'Health Education', category: 'science', color: '#EC4899' },

  // Commercial
  { id: 'economics', name: 'Economics', category: 'commercial', color: '#06B6D4' },
  { id: 'commerce', name: 'Commerce', category: 'commercial', color: '#F97316' },
  { id: 'accounting', name: 'Financial Accounting / Book Keeping', category: 'commercial', color: '#10B981' },
  { id: 'business_management', name: 'Business Management', category: 'commercial', color: '#8B5CF6' },
  { id: 'insurance', name: 'Insurance', category: 'commercial', color: '#3B82F6' },
  { id: 'marketing', name: 'Marketing', category: 'commercial', color: '#EAB308' },
  { id: 'office_practice', name: 'Office Practice / Clerical Duties', category: 'commercial', color: '#64748B' },
  { id: 'store_management', name: 'Store Management', category: 'commercial', color: '#D97706' },
  { id: 'tourism', name: 'Tourism', category: 'commercial', color: '#14B8A6' },

  // Arts & Humanities
  { id: 'civic_education', name: 'Civic Education', category: 'arts', color: '#64748B' },
  { id: 'government', name: 'Government', category: 'arts', color: '#475569' },
  { id: 'literature', name: 'Literature in English', category: 'arts', color: '#EC4899' },
  { id: 'history', name: 'History', category: 'arts', color: '#B45309' },
  { id: 'crs', name: 'Christian Religious Studies (CRS)', category: 'arts', color: '#8B5CF6' },
  { id: 'irs', name: 'Islamic Studies (IRS)', category: 'arts', color: '#059669' },
  { id: 'french', name: 'French', category: 'arts', color: '#2563EB' },
  { id: 'art', name: 'Visual Art', category: 'arts', color: '#F43F5E' },
  { id: 'music', name: 'Music', category: 'arts', color: '#A855F7' },
  { id: 'yoruba', name: 'Yoruba Language', category: 'arts', color: '#D97706' },
  { id: 'igbo', name: 'Igbo Language', category: 'arts', color: '#16A34A' },
  { id: 'hausa', name: 'Hausa Language', category: 'arts', color: '#DC2626' },

  // Vocational & Trade
  { id: 'foods_and_nutrition', name: 'Foods & Nutrition / Catering', category: 'vocational', color: '#F97316' },
  { id: 'animal_husbandry', name: 'Animal Husbandry', category: 'vocational', color: '#15803D' },
  { id: 'fisheries', name: 'Fisheries', category: 'vocational', color: '#0284C7' },
  { id: 'building_construction', name: 'Building Construction', category: 'vocational', color: '#78350F' },
  { id: 'auto_mechanics', name: 'Auto Mechanics / Electrical', category: 'vocational', color: '#EA580C' },
  { id: 'gsm_repairs', name: 'Computer Hardware & GSM Repairs', category: 'vocational', color: '#4338CA' },
  { id: 'electronics', name: 'Radio, TV & Electronics Works', category: 'vocational', color: '#0369A1' },
  { id: 'woodwork', name: 'Woodwork / Furniture', category: 'vocational', color: '#B45309' },
  { id: 'welding', name: 'Welding & Fabrication', category: 'vocational', color: '#525252' },
  { id: 'home_management', name: 'Home Management', category: 'vocational', color: '#DB2777' },
]

export const DEFAULT_9_SUBJECTS = [
  'mathematics',
  'english',
  'physics',
  'chemistry',
  'biology',
  'economics',
  'agricultural_science',
  'civic_education',
  'further_mathematics',
]

const STORAGE_KEY = 'cbt_student_9_subjects'

export function getStoredStudentSubjects(): string[] {
  if (typeof window === 'undefined') return DEFAULT_9_SUBJECTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_9_SUBJECTS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length === 9) {
      return parsed
    }
    return DEFAULT_9_SUBJECTS
  } catch (e) {
    return DEFAULT_9_SUBJECTS
  }
}

export function saveStudentSubjects(subjects: string[]): boolean {
  if (typeof window === 'undefined') return false
  if (subjects.length !== 9) return false
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects))
    return true
  } catch (e) {
    return false
  }
}
