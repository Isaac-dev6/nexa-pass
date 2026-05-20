import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useIsOrganizer(userId: string | undefined) {
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setIsOrganizer(false); setLoading(false); return }

    let cancelled = false

    async function check() {
      // Try RPC first (SECURITY DEFINER — bypasses RLS)
      const { data: rpcData, error: rpcErr } = await supabase.rpc('get_my_events_count')
      if (!rpcErr && rpcData !== null) {
        if (!cancelled) {
          setIsOrganizer(Number(rpcData) > 0)
          setLoading(false)
        }
        return
      }
      console.warn('[useIsOrganizer] RPC failed:', rpcErr?.message, '→ direct query fallback')

      // Fallback: direct query (requires organizer SELECT policy on events)
      const { count } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('organizer_id', userId)
      if (!cancelled) {
        setIsOrganizer((count ?? 0) > 0)
        setLoading(false)
      }
    }

    check()
    return () => { cancelled = true }
  }, [userId])

  return { isOrganizer, loading }
}
