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

export interface SupabaseTicket {
  id: string
  event_id: string
  user_id: string
  category: string
  quantity: number
  total_price: number
  status: string
  qr_code: string | null
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

// ── All active events ─────────────────────────────────────────────────────────

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
/*
 * SQL — run once in Supabase SQL Editor
 *
 * create table if not exists public.tickets (
 *   id          uuid default gen_random_uuid() primary key,
 *   event_id    uuid references public.events(id) on delete cascade,
 *   user_id     uuid references auth.users(id) on delete cascade,
 *   category    text not null,
 *   quantity    int not null default 1,
 *   total_price numeric not null default 0,
 *   status      text not null default 'upcoming',
 *   qr_code     text,
 *   created_at  timestamptz default now()
 * );
 *
 * alter table public.tickets enable row level security;
 *
 * -- Buyer can read / insert / update their own tickets
 * create policy "owner_select" on public.tickets
 *   for select using (auth.uid() = user_id);
 * create policy "owner_insert" on public.tickets
 *   for insert with check (auth.uid() = user_id);
 * create policy "owner_update" on public.tickets
 *   for update using (auth.uid() = user_id);
 *
 * -- Organizer can read tickets for their events
 * create policy "organizer_select" on public.tickets
 *   for select using (
 *     exists (
 *       select 1 from public.events
 *       where events.id = tickets.event_id
 *         and events.organizer_id = auth.uid()
 *     )
 *   );
 */

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
