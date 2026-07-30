import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import OfflineSync from '@/components/cbt/OfflineSync'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'EduCBT — WAEC & GCE Exam Prep Platform',
    template: '%s | EduCBT',
  },
  description:
    "Nigeria's most comprehensive WAEC, NECO & JAMB CBT practice platform. 10,000+ past questions, AI-powered mock exams, real-time analytics for students, parents and schools across West Africa.",
  manifest: '/manifest.json',
  keywords: 'WAEC CBT, GCE past questions, NECO practice, JAMB preparation, Nigeria exam prep',
  openGraph: {
    title: 'EduCBT — WAEC & GCE Exam Prep',
    description:
      'Ace your exams with exam-realistic CBT simulation, 10,000+ past questions, and AI-powered analytics.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d9488',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        <OfflineSync />
      </body>
    </html>
  )
}
