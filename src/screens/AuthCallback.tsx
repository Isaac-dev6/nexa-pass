import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (handled.current) return
      if (event === 'SIGNED_IN' && session) {
        handled.current = true
        setTimeout(() => navigate('/home', { replace: true }), 500)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (handled.current) return
      if (session) {
        setTimeout(() => {
          if (!handled.current) {
            handled.current = true
            navigate('/home', { replace: true })
          }
        }, 500)
      } else {
        setTimeout(() => {
          if (!handled.current) {
            handled.current = true
            navigate('/login', { replace: true })
          }
        }, 10000)
      }
    })

    return () => subscription.unsubscribe()
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
