import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        navigate('/home', { replace: true })
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000))

        const { data: { session: session2 } } = await supabase.auth.getSession()

        if (session2) {
          navigate('/home', { replace: true })
        } else {
          navigate('/login', { replace: true })
        }
      }
    }

    checkSession()
  }, [])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#F4F4FB',
    }}>
      <img src="/logo.png" alt="Nexa Pass" style={{ width: 64, marginBottom: 24 }} />
      <p style={{ color: '#6B7280', fontSize: 14 }}>Connexion en cours...</p>
    </div>
  )
}
