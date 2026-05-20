import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useIsOrganizer(userId: string | undefined) {
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsOrganizer(false)
      setLoading(false)
      return
    }

    let cancelled = false
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('organizer_id', userId)
      .then(({ count }) => {
        if (!cancelled) {
          setIsOrganizer((count ?? 0) > 0)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [userId])

  return { isOrganizer, loading }
}
