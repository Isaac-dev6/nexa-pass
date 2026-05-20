// ── Input sanitization ────────────────────────────────────────────────────────

/** Strip HTML tags and escape dangerous chars. Use before storing user text. */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[<>&"'`]/g, (c) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;' }[c] ?? c)
    )
}

// ── Email ─────────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/

export function validateEmail(email: string): string | null {
  const v = email.trim()
  if (!v) return 'Email requis'
  if (!EMAIL_RE.test(v)) return 'Format email invalide (ex: nom@domaine.com)'
  return null
}

// ── Password ──────────────────────────────────────────────────────────────────

export function validatePassword(password: string): string | null {
  if (!password) return 'Mot de passe requis'
  if (password.length < 8) return 'Minimum 8 caractères'
  if (!/[A-Z]/.test(password)) return 'Au moins 1 majuscule requise (ex: A)'
  if (!/[0-9]/.test(password)) return 'Au moins 1 chiffre requis (ex: 1)'
  return null
}

/** 0 = empty, 1 = faible, 2 = moyen, 3 = fort */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 3) as 0 | 1 | 2 | 3
}
