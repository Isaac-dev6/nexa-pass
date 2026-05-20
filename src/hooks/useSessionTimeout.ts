import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { logSecurityEvent } from '../lib/securityLogger'

const INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000 // 24 hours
const WARN_BEFORE_MS = 10 * 60 * 1000            // warn 10 min before
const CHECK_INTERVAL_MS = 60_000                  // check every minute
const STORAGE_KEY = 'nexa_last_activity'

function touchActivity() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString())
}

function getLastActivity(): number {
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10) || Date.now()
}

export function useSessionTimeout(userId: string | null | undefined) {
  const [showWarning, setShowWarning] = useState(false)
  const [minutesLeft, setMinutesLeft] = useState(10)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  const extendSession = useCallback(() => {
    touchActivity()
    setShowWarning(false)
  }, [])

  const signOut = useCallback(async () => {
    if (userId) await logSecurityEvent('session_expired', userId)
    localStorage.removeItem(STORAGE_KEY)
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Record activity on any user interaction
    touchActivity()
    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'] as const
    events.forEach((e) => window.addEventListener(e, touchActivity, { passive: true }))

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - getLastActivity()
      if (elapsed >= INACTIVITY_LIMIT_MS) {
        signOut()
        return
      }
      const remaining = INACTIVITY_LIMIT_MS - elapsed
      if (remaining <= WARN_BEFORE_MS) {
        setMinutesLeft(Math.ceil(remaining / 60_000))
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      events.forEach((e) => window.removeEventListener(e, touchActivity))
      clearInterval(intervalRef.current)
    }
  }, [userId, signOut])

  return { showWarning, minutesLeft, extendSession, signOut }
}
