import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'
import { PhoneInput } from '../components/ui/PhoneInput'
import { sanitizeText, validateEmail, validatePassword, passwordStrength } from '../lib/security'
import { logSecurityEvent } from '../lib/securityLogger'

function getErrorMessage(error: AuthError): string {
  const msg = error.message
  if (msg.includes('User already registered') || msg.includes('already registered'))
    return 'Un compte existe déjà avec cette adresse email'
  if (msg.includes('Password should be at least') || msg.includes('password'))
    return 'Le mot de passe ne respecte pas les critères requis'
  if (msg.includes('Unable to validate email') || msg.includes('Invalid email'))
    return 'Adresse email invalide'
  if (msg.includes('rate limit') || msg.includes('Email rate limit'))
    return 'Trop de tentatives. Réessaie dans quelques minutes'
  return `Erreur : ${error.message}`
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#12122A] text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#12122A]/40'

const STRENGTH_CONFIG = [
  { label: 'Faible',  color: '#EF4444' },
  { label: 'Moyen',  color: '#F59E0B' },
  { label: 'Fort',   color: '#10B981' },
]

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null
  const score = passwordStrength(password) // 0–3
  const cfg = STRENGTH_CONFIG[score - 1]
  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? cfg?.color ?? '#E5E7EB' : '#E5E7EB' }}
          />
        ))}
      </div>
      {cfg && <p className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>}
    </div>
  )
}

export function Register() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://nexa-pass-dvbs.vercel.app/auth/callback' },
    })
  }

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate name
    const name = form.fullName.trim()
    if (name.length < 2) { setError('Saisis ton prénom et ton nom (min. 2 caractères)'); return }
    if (name.length > 80) { setError('Le nom est trop long (max 80 caractères)'); return }

    // Validate email
    const emailErr = validateEmail(form.email)
    if (emailErr) { setError(emailErr); return }

    // Validate password
    const pwErr = validatePassword(form.password)
    if (pwErr) { setError(pwErr); return }

    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: sanitizeText(name),
            phone: form.phone,
          },
        },
      })

      if (authError) {
        setError(getErrorMessage(authError))
        return
      }

      await logSecurityEvent('register_success', data.user?.id, { email: form.email.trim() })

      if (data.session) {
        showToast('✅ Compte créé avec succès !')
        navigate('/home')
      } else {
        showToast('📧 Vérifie ton email pour confirmer ton compte')
        navigate('/login')
      }
    } catch {
      setError('Erreur de connexion. Vérifie ta connexion internet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-5 py-12"
      style={{ background: '#F4F4FB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="w-full max-w-[400px] bg-white rounded-2xl px-8 py-10 shadow-[0_4px_30px_rgba(0,0,0,0.08)]">

        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Nexa Pass" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
        </div>

        <h1 className="text-center font-bold text-[#12122A] mb-1" style={{ fontSize: '22px', letterSpacing: '-0.3px' }}>
          Créer ton compte
        </h1>
        <p className="text-center text-sm text-[#12122A]/50 mb-7 font-medium">
          Rejoins Nexa Pass et réserve tes événements
        </p>

        <div className="flex flex-col gap-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#12122A] text-sm font-semibold hover:bg-[#F4F4FB] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>
          <button
            type="button"
            onClick={wip}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#12122A] text-white text-sm font-semibold hover:bg-[#1e1e35] transition-colors"
          >
            <svg width="17" height="20" viewBox="0 0 17 20" fill="none">
              <path d="M13.687 10.607c-.022-2.547 2.08-3.784 2.175-3.845-1.187-1.733-3.03-1.97-3.685-1.993-1.567-.16-3.065.928-3.861.928-.796 0-2.025-.907-3.328-.882-1.71.026-3.293 1-4.177 2.534-1.782 3.088-.457 7.668 1.281 10.178.847 1.227 1.855 2.601 3.177 2.551 1.28-.052 1.762-.823 3.311-.823 1.55 0 1.987.823 3.336.795 1.375-.022 2.243-1.25 3.083-2.48.975-1.42 1.374-2.801 1.395-2.871-.03-.013-2.673-1.024-2.707-4.092zM11.26 3.2C11.96 2.35 12.435 1.18 12.3 0c-1.009.042-2.231.671-2.955 1.52-.647.746-1.213 1.941-1.062 3.084 1.127.087 2.278-.572 2.977-1.404z" fill="white"/>
            </svg>
            Continuer avec Apple
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-xs text-[#12122A]/40 font-medium">ou</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nom complet"
            autoComplete="name"
            maxLength={80}
            className={inputClass}
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Adresse email"
            autoComplete="email"
            className={inputClass}
          />

          <PhoneInput
            value={form.phone}
            onChange={(fullNumber) => { setError(null); setForm((p) => ({ ...p, phone: fullNumber })) }}
          />

          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Mot de passe"
                autoComplete="new-password"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#12122A]/40 hover:text-[#12122A]/70 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrengthBar password={form.password} />
            <p className="text-[11px] text-[#12122A]/40 mt-1">
              8 caractères minimum · 1 majuscule · 1 chiffre
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium px-1 -mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-bold mt-1 transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            {loading && <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
            {loading ? 'Création en cours…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-[#12122A]/50 mt-5">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-[#2563EB] hover:underline">Se connecter</Link>
        </p>
      </div>

      <p className="text-center text-xs text-[#12122A]/35 mt-6 max-w-[320px] leading-relaxed">
        En créant un compte, tu acceptes nos{' '}
        <button onClick={wip} className="underline hover:text-[#12122A]/60 transition-colors">Conditions d'utilisation</button>
        {' '}et notre{' '}
        <button onClick={wip} className="underline hover:text-[#12122A]/60 transition-colors">Politique de confidentialité</button>.
      </p>
    </div>
  )
}
