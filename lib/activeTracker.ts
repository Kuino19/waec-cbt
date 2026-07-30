'use client'
// ================================================================
// ACTIVE TIME TRACKER
// Heartbeat listener: tracks clicks, touches, scrolls, keypresses
// Idle detection: pauses after 60s of no interaction
// Per-subject time recording stored in localStorage
// ================================================================

const IDLE_THRESHOLD_MS = 60_000 // 60 seconds

export interface TimeTrackerCallbacks {
  onIdleStart?: () => void
  onIdleEnd?: () => void
  onTick?: (activeSeconds: number) => void
}

let _isTracking = false
let _isIdle = false
let _lastInteractionAt = 0
let _activeSeconds = 0
let _subject = ''
let _topic = ''
let _callbacks: TimeTrackerCallbacks = {}
let _tickInterval: ReturnType<typeof setInterval> | null = null
let _idleCheckInterval: ReturnType<typeof setInterval> | null = null

function recordInteraction() {
  const now = Date.now()
  _lastInteractionAt = now
  if (_isIdle) {
    _isIdle = false
    _callbacks.onIdleEnd?.()
  }
}

function tick() {
  if (!_isTracking || _isIdle) return
  _activeSeconds += 1
  _callbacks.onTick?.(_activeSeconds)
}

function checkIdle() {
  if (!_isTracking) return
  const now = Date.now()
  if (!_isIdle && now - _lastInteractionAt > IDLE_THRESHOLD_MS) {
    _isIdle = true
    _callbacks.onIdleStart?.()
  }
}

export function startTracking(
  subject: string,
  topic: string,
  callbacks: TimeTrackerCallbacks = {}
) {
  _subject = subject
  _topic = topic
  _callbacks = callbacks
  _isTracking = true
  _isIdle = false
  _lastInteractionAt = Date.now()
  _activeSeconds = getStoredActiveSeconds(subject, topic)

  const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
  events.forEach(ev => window.addEventListener(ev, recordInteraction, { passive: true }))

  _tickInterval = setInterval(tick, 1000)
  _idleCheckInterval = setInterval(checkIdle, 5000)
}

export function stopTracking() {
  if (!_isTracking) return
  _isTracking = false

  const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
  events.forEach(ev => window.removeEventListener(ev, recordInteraction))

  if (_tickInterval) clearInterval(_tickInterval)
  if (_idleCheckInterval) clearInterval(_idleCheckInterval)

  // Persist to localStorage
  persistActiveSeconds(_subject, _topic, _activeSeconds)
}

export function getActiveSeconds() {
  return _activeSeconds
}

export function isCurrentlyIdle() {
  return _isIdle
}

// ---- Persistence Layer (localStorage) ----

export interface SubjectTimeRecord {
  subject: string
  topic: string
  totalSeconds: number
  lastUpdated: number
}

const STORAGE_KEY = 'cbt_time_records'

function getStoredActiveSeconds(subject: string, topic: string): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const records: SubjectTimeRecord[] = JSON.parse(raw)
    const found = records.find(r => r.subject === subject && r.topic === topic)
    return found?.totalSeconds ?? 0
  } catch {
    return 0
  }
}

function persistActiveSeconds(subject: string, topic: string, seconds: number) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const records: SubjectTimeRecord[] = raw ? JSON.parse(raw) : []
    const idx = records.findIndex(r => r.subject === subject && r.topic === topic)
    const record: SubjectTimeRecord = {
      subject,
      topic,
      totalSeconds: seconds,
      lastUpdated: Date.now(),
    }
    if (idx >= 0) {
      records[idx] = record
    } else {
      records.push(record)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {/* ignore quota errors */}
}

export function getAllTimeRecords(): SubjectTimeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getTotalStudyHours(): number {
  const records = getAllTimeRecords()
  const totalSeconds = records.reduce((sum, r) => sum + r.totalSeconds, 0)
  return Math.round((totalSeconds / 3600) * 10) / 10
}
