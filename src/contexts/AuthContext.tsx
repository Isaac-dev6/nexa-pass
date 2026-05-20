import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  userRole: string
  profileName: string | null
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  userRole: 'participant',
  profileName: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('participant')
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) console.error('[AuthContext] profiles fetch error:', error.message)
            setUserRole(profile?.role || 'participant')
            setProfileName(profile?.full_name || null)
            setLoading(false)
          })
      } else {
        setUserRole('participant')
        setProfileName(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, userRole, profileName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
