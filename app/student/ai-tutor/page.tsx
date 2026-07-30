'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Sparkles, BookOpen, Search, HelpCircle, ArrowLeft,
  CheckCircle, Copy, Share2, RefreshCw, Cpu, MessageSquareText, Zap
} from 'lucide-react'
import { getStoredStudentSubjects, ALL_WAEC_SUBJECTS } from '@/lib/subjects'
import FormattedMarkdown from '@/components/ui/FormattedMarkdown'
import '@/styles/dashboard.css'

function AITutorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [registeredSubjects, setRegisteredSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('mathematics')
  const [topicInput, setTopicInput] = useState('')
  const [customQuestion, setCustomQuestion] = useState('')
  const [explanation, setExplanation] = useState('')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const subs = getStoredStudentSubjects()
    setRegisteredSubjects(subs)
    
    const paramSub = searchParams.get('subject')
    const paramTopic = searchParams.get('topic')
    const paramQ = searchParams.get('question')

    if (paramSub) setSelectedSubject(paramSub)
    else if (subs.length > 0) setSelectedSubject(subs[0])

    if (paramTopic) setTopicInput(paramTopic)
    if (paramQ) setCustomQuestion(paramQ)

    if (paramSub && (paramTopic || paramQ)) {
      triggerExplain(paramSub, paramTopic || '', paramQ || '')
    }
  }, [searchParams])

  const triggerExplain = async (sub: string, top: string, q: string) => {
    setLoading(true)
    setExplanation('')

    try {
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: sub,
          topic: top,
          questionText: q,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setExplanation(data.explanation)
        setProvider(data.provider || 'Gemini AI')
      } else {
        setExplanation('❌ Failed to load AI explanation. Please check your network and try again.')
      }
    } catch (err) {
      setExplanation('❌ Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleExplain = () => {
    triggerExplain(selectedSubject, topicInput, customQuestion)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(explanation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeSubjectObj = ALL_WAEC_SUBJECTS.find(s => s.id === selectedSubject)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-navy)', color: '#F8FAFC', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <button
            onClick={() => router.push('/student/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: '#94A3B8', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)',
            padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', color: '#38BDF8', fontWeight: 700
          }}>
            <Cpu size={14} /> Powered by Gemini AI
          </div>
        </div>

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.2) 0%, rgba(139,92,246,0.2) 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '1.25rem',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#38BDF8', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <Sparkles size={18} /> WAEC Syllabus AI Explainer
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'white' }}>
            Master Any Topic Based on Official WAEC Syllabus
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0, maxWidth: 680 }}>
            Select any of your 9 registered subjects and ask Gemini AI to break down complex theory, formulas, worked examples, and common WAEC exam traps.
          </p>
        </div>

        {/* Input Form Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* 1. Subject Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.5rem' }}>
              1. Select Subject (Your 9 Registered Subjects)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {registeredSubjects.map(subId => {
                const sub = ALL_WAEC_SUBJECTS.find(s => s.id === subId)
                const isSelected = selectedSubject === subId
                return (
                  <button
                    key={subId}
                    onClick={() => setSelectedSubject(subId)}
                    style={{
                      padding: '0.5rem 0.85rem',
                      borderRadius: '0.6rem',
                      border: isSelected ? '1px solid #0EA5E9' : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(14,165,233,0.25)' : 'rgba(255,255,255,0.04)',
                      color: isSelected ? '#38BDF8' : '#94A3B8',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {sub ? sub.name : subId}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Topic Input */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.5rem' }}>
                2. Syllabus Topic Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Quadratic Equations, Organic Chemistry, Genetics..."
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '0.6rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.5rem' }}>
                3. Specific Question or Doubt (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. How do I solve 2x^2 - 5x + 3 = 0 using the formula?"
                value={customQuestion}
                onChange={e => setCustomQuestion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '0.6rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={14} color="#F59E0B" /> Quick AI Prompt Shortcuts:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {[
                'Explain key formulas & definitions',
                'What are common WAEC exam traps on this topic?',
                'Give a step-by-step WAEC worked example',
                'How to score full marks in Paper 1 and Paper 2',
              ].map(promptText => (
                <button
                  key={promptText}
                  onClick={() => {
                    setCustomQuestion(promptText)
                    triggerExplain(selectedSubject, topicInput, promptText)
                  }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#CBD5E1',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  💬 {promptText}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleExplain}
            disabled={loading}
            style={{
              padding: '0.85rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: loading ? '#475569' : 'linear-gradient(135deg, #0EA5E9, #2563EB)',
              color: 'white',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.35)',
            }}
          >
            {loading ? <RefreshCw className="spinner" size={18} /> : <Sparkles size={18} />}
            {loading ? 'Consulting Gemini AI Syllabus Tutor...' : `Explain ${activeSubjectObj?.name || 'Subject'} Topic with Gemini AI`}
          </button>
        </div>

        {/* Explanation Output */}
        {explanation && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(14, 165, 233, 0.4)',
            borderRadius: '1.25rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease both',
          }}>
            {/* Output Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 800, textTransform: 'uppercase' }}>
                  {provider} Syllabus Guide
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: '0.2rem 0 0 0' }}>
                  {activeSubjectObj?.name} Study Explanation
                </h3>
              </div>

              <button
                onClick={copyToClipboard}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.85rem', background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem',
                  color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {copied ? <CheckCircle size={14} color="#22C55E" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Explanation'}
              </button>
            </div>

            {/* Explanation Content formatted with Markdown + KaTeX */}
            <div>
              <FormattedMarkdown content={explanation} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AITutorPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-navy)', color: 'white' }}>
        Loading Gemini AI Tutor...
      </div>
    }>
      <AITutorInner />
    </Suspense>
  )
}
