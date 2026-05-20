import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminRole(userId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setIsAdmin(false); setLoading(false); return }
    let cancelled = false
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (!cancelled) {
          setIsAdmin(data?.role === 'admin')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [userId])

  return { isAdmin, loading }
}
