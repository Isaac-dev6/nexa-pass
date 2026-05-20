import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── Interfaces ────────────────────────────────────────────────────────────────

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
  validated: boolean
  created_at: string
}

export interface SupabaseTicket {
  id: string
  event_id: string
  user_id: string
  category: string
  quantity: number
  total_price: number
  status: string
  qr_code: string | null
  used_at: string | null
  used_by: string | null
  created_at: string
  events: {
    id: string
    title: string
    date: string | null
    location: string | null
    city: string | null
    cover_url: string | null
  } | null
}

export interface OrgTicketStat {
  id: string
  event_id: string
  category: string
  total_price: number
  quantity: number
  status: string
  created_at: string
  user_id: string
}

export interface OrgStats {
  ticketCount: number
  totalSold: number
  revenue: number
  scannedCount: number
  activeTicketsCount: number
  recentTickets: OrgTicketStat[]
  buyerNames: Record<string, string>
  chartData: { day: string; ventes: number }[]
  perEvent: Record<string, { sold: number; revenue: number }>
  fetchError: string | null
  lastFetched: Date | null
  loading: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Il y a ${hrs}h`
  return `Il y a ${Math.floor(hrs / 24)}j`
}

// ── All active validated events ───────────────────────────────────────────────

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
      .order('date', { ascending: true })
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

// ── Single event by ID ────────────────────────────────────────────────────────

export function useEventById(id: string | undefined) {
  const [event, setEvent] = useState<SupabaseEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setEvent(null)
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err.message)
        else setEvent(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  return { event, loading, error }
}

// ── Events by organizer ───────────────────────────────────────────────────────

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

// ── Tickets for a user ────────────────────────────────────────────────────────

export function useTickets(userId: string | undefined) {
  const [tickets, setTickets] = useState<SupabaseTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    let cancelled = false
    supabase
      .from('tickets')
      .select('*, events(id, title, date, location, city, cover_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err.message)
        else setTickets(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [userId])

  return { tickets, loading, error }
}

// ── Organizer stats (real data for dashboard) ─────────────────────────────────

export function useOrganizerStats(organizerId: string | undefined): OrgStats & { refetch: () => void } {
  const [stats, setStats] = useState<OrgStats>({
    ticketCount: 0,
    totalSold: 0,
    revenue: 0,
    scannedCount: 0,
    activeTicketsCount: 0,
    recentTickets: [],
    buyerNames: {},
    chartData: [],
    perEvent: {},
    fetchError: null,
    lastFetched: null,
    loading: true,
  })
  const [tick, setTick] = useState(0)
  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    if (!organizerId) {
      setStats((s) => ({ ...s, fetchError: null, loading: false }))
      return
    }

    let cancelled = false

    async function load() {
      console.log('Fetching stats for organizer:', organizerId)

      // 1. Get organizer's event IDs
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', organizerId)

      if (cancelled) return

      console.log('Events found:', eventsData, 'Error:', eventsError)

      if (eventsError) {
        setStats((s) => ({ ...s, fetchError: eventsError.message, lastFetched: new Date(), loading: false }))
        return
      }

      const eventIds = (eventsData ?? []).map((e) => e.id as string)

      if (eventIds.length === 0) {
        setStats({ ticketCount: 0, totalSold: 0, revenue: 0, scannedCount: 0, activeTicketsCount: 0, recentTickets: [], buyerNames: {}, chartData: buildEmptyChart(), perEvent: {}, fetchError: null, lastFetched: new Date(), loading: false })
        return
      }

      // 2. Fetch all tickets for those events
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, event_id, category, total_price, quantity, status, created_at, user_id')
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })

      if (cancelled) return

      console.log('Tickets found:', ticketsData, 'Error:', ticketsError)

      if (ticketsError) {
        setStats((s) => ({ ...s, fetchError: ticketsError.message, lastFetched: new Date(), loading: false }))
        return
      }

      const rows = (ticketsData ?? []) as OrgTicketStat[]

      // 3. Aggregate
      const revenue = rows.reduce((s, t) => s + t.total_price, 0)
      const totalSold = rows.reduce((s, t) => s + t.quantity, 0)
      const scannedCount = rows.filter((t) => t.status === 'used').length
      const activeTicketsCount = rows.filter((t) => t.status === 'upcoming').length

      // 4. Per-event breakdown
      const perEvent: Record<string, { sold: number; revenue: number }> = {}
      for (const t of rows) {
        if (!perEvent[t.event_id]) perEvent[t.event_id] = { sold: 0, revenue: 0 }
        perEvent[t.event_id].sold += t.quantity
        perEvent[t.event_id].revenue += t.total_price
      }

      // 5. Chart: last 7 days
      const now = new Date()
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (6 - i))
        d.setHours(0, 0, 0, 0)
        const nextD = new Date(d)
        nextD.setDate(nextD.getDate() + 1)
        const dayVentes = rows
          .filter((t) => { const c = new Date(t.created_at); return c >= d && c < nextD })
          .reduce((s, t) => s + t.total_price, 0)
        return {
          day: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          ventes: dayVentes,
        }
      })

      // 6. Buyer display names from profiles
      const recentRows = rows.slice(0, 5)
      const uniqueUserIds = [...new Set(recentRows.map((t) => t.user_id))]
      const buyerNames: Record<string, string> = {}
      if (uniqueUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', uniqueUserIds)
        for (const p of (profilesData ?? [])) {
          const prof = p as { id: string; full_name?: string | null }
          if (prof.full_name) buyerNames[prof.id] = prof.full_name
        }
      }

      setStats({ ticketCount: rows.length, totalSold, revenue, scannedCount, activeTicketsCount, recentTickets: recentRows, buyerNames, chartData, perEvent, fetchError: null, lastFetched: new Date(), loading: false })
    }

    load().catch((err) => {
      console.error('useOrganizerStats load error:', err)
      setStats((s) => ({ ...s, fetchError: String(err?.message ?? err), lastFetched: new Date(), loading: false }))
    })
    return () => { cancelled = true }
  }, [organizerId, tick])

  return { ...stats, refetch }
}

function buildEmptyChart(): { day: string; ventes: number }[] {
  const now = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (6 - i))
    return { day: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), ventes: 0 }
  })
}
