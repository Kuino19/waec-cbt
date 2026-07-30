'use client'
// ================================================================
// ANTI-CHEATING SUITE
// Handles: tab-switch detection, context-menu block, copy-paste block,
//          single-session locking, text selection prevention
// ================================================================

export interface AntiCheatConfig {
  maxStrikes: number
  onStrike: (strikeCount: number, reason: string) => void
  onAutoSubmit: () => void
}

let _config: AntiCheatConfig | null = null
let _strikes = 0
let _isActive = false

function handleVisibilityChange() {
  if (document.hidden && _isActive) {
    addStrike('Tab switch / window hidden detected')
  }
}

function handleWindowBlur() {
  if (_isActive) {
    addStrike('Window focus lost')
  }
}

function handleContextMenu(e: MouseEvent) {
  if (_isActive) e.preventDefault()
}

function handleCopy(e: ClipboardEvent) {
  if (_isActive) e.preventDefault()
}

function handleSelectStart(e: Event) {
  if (_isActive) {
    const target = e.target as HTMLElement
    // Allow selection in input/textarea for accessibility
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      e.preventDefault()
    }
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!_isActive) return
  // Block PrintScreen
  if (e.key === 'PrintScreen') {
    e.preventDefault()
    addStrike('Screenshot attempt detected')
  }
  // Block Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+S
  if (e.ctrlKey && ['c', 'v', 'p', 's', 'a'].includes(e.key.toLowerCase())) {
    if (e.key.toLowerCase() !== 'a' || e.target instanceof HTMLInputElement) return
    e.preventDefault()
  }
  // Block F12 (DevTools)
  if (e.key === 'F12') {
    e.preventDefault()
  }
}

function addStrike(reason: string) {
  if (!_config) return
  _strikes += 1
  _config.onStrike(_strikes, reason)
  if (_strikes >= _config.maxStrikes) {
    deactivate()
    _config.onAutoSubmit()
  }
}

export function activate(config: AntiCheatConfig) {
  _config = config
  _strikes = 0
  _isActive = true

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('blur', handleWindowBlur)
  document.addEventListener('contextmenu', handleContextMenu)
  document.addEventListener('copy', handleCopy)
  document.addEventListener('selectstart', handleSelectStart)
  document.addEventListener('keydown', handleKeyDown)

  // Session lock: mark this tab as the active exam session
  const sessionToken = `exam_session_${Date.now()}`
  try {
    sessionStorage.setItem('cbt_active_session', sessionToken)
  } catch {/* ignore */}
}

export function deactivate() {
  _isActive = false
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('blur', handleWindowBlur)
  document.removeEventListener('contextmenu', handleContextMenu)
  document.removeEventListener('copy', handleCopy)
  document.removeEventListener('selectstart', handleSelectStart)
  document.removeEventListener('keydown', handleKeyDown)
}

export function getStrikes() {
  return _strikes
}

export function resetStrikes() {
  _strikes = 0
}
