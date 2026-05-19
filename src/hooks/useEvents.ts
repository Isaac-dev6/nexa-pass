import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface SupabaseEvent {
  id: string
  title: string
  description: string | null
  category: string | null
  date: string | null
  location: string | null
  city: string | null
  cover_url: string | null
  organizer_id: string | null
  status: string
  created_at: string
}

export function useEvents() {
  const [events, setEvents] = useState<SupabaseEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err.message)
        else setEvents(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  return { events, loading, error }
}

export function useOrganizerEvents(organizerId: string | undefined) {
  const [events, setEvents] = useState<SupabaseEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!organizerId) { setLoading(false); return }
    let cancelled = false
    supabase
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err.message)
        else setEvents(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [organizerId])

  return { events, loading, error }
}
