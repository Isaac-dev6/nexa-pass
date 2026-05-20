const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

interface State { attempts: number; lockedUntil: number | null }

function key(id: string) { return `rl_${id}` }

function read(id: string): State {
  try {
    const raw = localStorage.getItem(key(id))
    return raw ? (JSON.parse(raw) as State) : { attempts: 0, lockedUntil: null }
  } catch {
    return { attempts: 0, lockedUntil: null }
  }
}

function write(id: string, state: State) {
  localStorage.setItem(key(id), JSON.stringify(state))
}

export interface RateLimitStatus {
  blocked: boolean
  minutesLeft: number
  attemptsLeft: number
}

export function checkRateLimit(id: string): RateLimitStatus {
  const state = read(id)
  if (state.lockedUntil) {
    const remaining = state.lockedUntil - Date.now()
    if (remaining > 0) return { blocked: true, minutesLeft: Math.ceil(remaining / 60_000), attemptsLeft: 0 }
    write(id, { attempts: 0, lockedUntil: null }) // expired — reset
  }
  return { blocked: false, minutesLeft: 0, attemptsLeft: MAX_ATTEMPTS - read(id).attempts }
}

export function recordFailedAttempt(id: string): RateLimitStatus {
  const state = read(id)
  const attempts = state.attempts + 1
  if (attempts >= MAX_ATTEMPTS) {
    write(id, { attempts, lockedUntil: Date.now() + LOCKOUT_MS })
    return { blocked: true, minutesLeft: 15, attemptsLeft: 0 }
  }
  write(id, { attempts, lockedUntil: null })
  return { blocked: false, minutesLeft: 0, attemptsLeft: MAX_ATTEMPTS - attempts }
}

export function resetRateLimit(id: string) {
  localStorage.removeItem(key(id))
}
