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

// Tries RPC first (SECURITY DEFINER — bypasses RLS entirely),
// falls back to direct query if the function doesn't exist yet.
async function fetchProfile(userId: string): Promise<{ role?: string; full_name?: string } | null> {
  const { data: rpcData, error: rpcErr } = await supabase.rpc('get_my_profile')
  if (!rpcErr && rpcData) {
    const p = rpcData as { role?: string; full_name?: string }
    console.log('Profile loaded (RPC):', p, '| Role:', p?.role)
    return p
  }
  console.warn('[AuthContext] get_my_profile RPC failed:', rpcErr?.message, '→ direct query fallback')
  const { data, error } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userId)
    .single()
  if (error) console.error('[AuthContext] direct profiles error:', error.message)
  console.log('Profile loaded (direct):', data, '| Role:', data?.role)
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('participant')
  const [profileName, setProfileName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    // Initial load: sequential getSession → profile → setLoading(false)
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

    // Subsequent auth changes (login, logout, token refresh)
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

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, userRole, profileName }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
