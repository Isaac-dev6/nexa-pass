import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const access_token = sessionStorage.getItem('oauth_access_token')
    const refresh_token = sessionStorage.getItem('oauth_refresh_token')

    sessionStorage.removeItem('oauth_access_token')
    sessionStorage.removeItem('oauth_refresh_token')

    if (!access_token) {
      navigate('/login', { replace: true })
      return
    }

    supabase.auth
      .setSession({ access_token, refresh_token: refresh_token ?? '' })
      .then(({ error }) => {
        if (error) {
          navigate('/login', { replace: true })
        } else {
          navigate('/home', { replace: true })
        }
      })
  }, [navigate])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#F4F4FB' }}
    >
      <div
        className="w-10 h-10 rounded-full border-[3px] animate-spin"
        style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
      />
      <p className="text-sm mt-4" style={{ color: '#12122A', opacity: 0.5 }}>
        Connexion en cours…
      </p>
    </div>
  )
}
