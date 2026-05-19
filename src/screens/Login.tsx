import { useState } from 'react'
import { Eye, EyeOff, X, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'

function getErrorMessage(error: AuthError): string {
  const msg = error.message
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Email ou mot de passe incorrect'
  }
  if (msg.includes('Email not confirmed')) {
    return 'Vérifie ton email pour confirmer ton compte avant de te connecter'
  }
  if (msg.includes('User not found')) {
    return 'Aucun compte trouvé avec cet email'
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Trop de tentatives. Réessaie dans quelques minutes'
  }
  return 'Une erreur est survenue. Réessaie plus tard'
}

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

const AppleLogo = () => (
  <svg width="16" height="19" viewBox="0 0 17 20" fill="none">
    <path d="M13.687 10.607c-.022-2.547 2.08-3.784 2.175-3.845-1.187-1.733-3.03-1.97-3.685-1.993-1.567-.16-3.065.928-3.861.928-.796 0-2.025-.907-3.328-.882-1.71.026-3.293 1-4.177 2.534-1.782 3.088-.457 7.668 1.281 10.178.847 1.227 1.855 2.601 3.177 2.551 1.28-.052 1.762-.823 3.311-.823 1.55 0 1.987.823 3.336.795 1.375-.022 2.243-1.25 3.083-2.48.975-1.42 1.374-2.801 1.395-2.871-.03-.013-2.673-1.024-2.707-4.092zM11.26 3.2C11.96 2.35 12.435 1.18 12.3 0c-1.009.042-2.231.671-2.955 1.52-.647.746-1.213 1.941-1.062 3.084 1.127.087 2.278-.572 2.977-1.404z" fill="white"/>
  </svg>
)

export function Login() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const [step, setStep] = useState<'identifier' | 'password'>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Step 1 → Step 2: just advance, no API call
    if (step === 'identifier') {
      if (!identifier.trim()) return
      setStep('password')
      return
    }

    // Step 2: authenticate
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      })

      if (authError) {
        setError(getErrorMessage(authError))
      } else {
        navigate('/')
      }
    } catch {
      setError('Erreur de connexion. Vérifie ta connexion internet')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    setStep('identifier')
    setPassword('')
    setError(null)
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-5 py-12"
      style={{ background: '#F4F4FB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="w-full max-w-[400px] bg-white rounded-2xl px-8 py-10 shadow-[0_4px_30px_rgba(0,0,0,0.08)]">

        {/* Logo */}
        <div className="flex justify-center mb-7">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            <span className="text-white font-extrabold text-2xl tracking-tight">N</span>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-center font-bold text-[#12122A] mb-2"
          style={{ fontSize: '22px', letterSpacing: '-0.3px' }}
        >
          Bon retour 👋
        </h1>
        <p className="text-center text-sm text-[#12122A]/50 mb-8 font-medium">
          Connecte-toi pour accéder à tes billets
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-5">

          {step === 'identifier' ? (
            /* ── Step 1: email/phone ── */
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(null) }}
                placeholder="Email ou téléphone"
                autoComplete="username"
                autoFocus
                className="w-full px-4 py-3.5 pr-11 rounded-xl border border-[#E5E7EB] bg-white text-[#12122A] text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#12122A]/40 font-medium"
              />
              {identifier.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIdentifier('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#12122A]/10 flex items-center justify-center hover:bg-[#12122A]/20 transition-colors"
                >
                  <X size={11} className="text-[#12122A]/60" strokeWidth={2.5} />
                </button>
              )}
            </div>
          ) : (
            /* ── Step 2: locked email + password ── */
            <>
              {/* Email locked row */}
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F4F4FB] border border-[#E5E7EB]">
                <span className="text-sm text-[#12122A] font-medium truncate">{identifier}</span>
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1 text-xs text-[#2563EB] font-semibold hover:opacity-75 transition-opacity ml-3 shrink-0"
                >
                  <ArrowLeft size={12} />
                  Modifier
                </button>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null) }}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  autoFocus
                  className="w-full px-4 py-3.5 pr-11 rounded-xl border border-[#E5E7EB] bg-white text-[#12122A] text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-all placeholder:text-[#12122A]/40 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#12122A]/40 hover:text-[#12122A]/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={wip}
                  className="text-xs text-[#12122A]/50 font-medium hover:text-[#2563EB] transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </>
          )}

          {/* Inline error */}
          {error && (
            <p className="text-xs text-red-500 font-medium px-1 -mt-1">{error}</p>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            {loading && (
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {loading ? 'Connexion…' : step === 'identifier' ? 'Continuer' : 'Se connecter'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-xs text-[#12122A]/40 font-medium px-1">ou</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        {/* Social buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={wip}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-[#12122A] text-sm font-semibold hover:bg-[#F4F4FB] transition-colors"
          >
            <GoogleLogo />
            Continuer avec Google
          </button>

          <button
            type="button"
            onClick={wip}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#12122A] text-white text-sm font-semibold hover:bg-[#1e1e35] transition-colors"
          >
            <AppleLogo />
            Continuer avec Apple
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-[#12122A]/50 mt-7">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-[#9333EA] hover:opacity-80 transition-opacity">
            Créer un compte
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-[#12122A]/35 mt-6 max-w-[320px] leading-relaxed">
        En continuant, tu acceptes nos{' '}
        <button onClick={wip} className="underline hover:text-[#12122A]/60 transition-colors">
          Conditions d'utilisation
        </button>{' '}
        et notre{' '}
        <button onClick={wip} className="underline hover:text-[#12122A]/60 transition-colors">
          Politique de confidentialité
        </button>.
      </p>
    </div>
  )
}
