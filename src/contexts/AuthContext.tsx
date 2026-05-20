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

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userId)
    .single()
  if (error) console.error('[AuthContext] profiles fetch error:', error.message)
  console.log('Profile loaded:', data)
  console.log('Role set to:', data?.role)
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('participant')
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    // ── Initial load: getSession → fetch profile → setLoading(false)
    // This sequence is stable and fires exactly once, avoiding the
    // 'participant' → 'admin' flash caused by onAuthStateChange firing
    // multiple times (INITIAL_SESSION, TOKEN_REFRESHED, etc.)
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return

      setUser(session?.user ?? null)

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        if (cancelled) return
        setUserRole(profile?.role || 'participant')
        setProfileName(profile?.full_name || null)
      }

      setLoading(false)
    }

    init()

    // ── Subsequent changes: login, logout, token refresh
    // Does NOT touch loading — that is managed by init() above.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchProfile(session.user.id).then((profile) => {
          if (cancelled) return
          setUserRole(profile?.role || 'participant')
          setProfileName(profile?.full_name || null)
        })
      } else {
        setUserRole('participant')
        setProfileName(null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, userRole, profileName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
