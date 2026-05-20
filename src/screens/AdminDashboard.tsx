import { useState, useCallback, useEffect } from 'react'
import {
  Shield, Users, Calendar, TrendingUp, Ticket,
  RefreshCw, CheckCircle2, XCircle, Ban,
  Search, X, UserCheck, Trash2, AlertTriangle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useTheme } from '../contexts/ThemeContext'
import { BottomNav } from '../components/ui/BottomNav'

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalUsers: number
  totalEvents: number
  pendingCount: number
  totalTickets: number
  totalRevenue: number
}

interface AdminEvent {
  id: string
  title: string
  status: string
  validated: boolean
  date: string | null
  city: string | null
  category: string | null
  cover_url: string | null
  created_at: string
  organizer_id: string | null
  organizerName: string
}

interface AdminUser {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  created_at: string
}

interface AdminTicket {
  id: string
  user_id: string
  category: string
  quantity: number
  total_price: number
  status: string
  created_at: string
  eventTitle: string
  buyerName: string
}

type AdminTab = 'validation' | 'events' | 'users' | 'transactions'

// ── Constants ──────────────────────────────────────────────────────────────────

const FALLBACK_IMG = 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg'

const EVENT_STATUS: Record<string, { label: string; cls: string }> = {
  active:             { label: 'Actif',       cls: 'bg-emerald-100 text-emerald-700' },
  draft:              { label: 'Brouillon',   cls: 'bg-gray-100 text-gray-500' },
  pending_validation: { label: 'En attente',  cls: 'bg-amber-100 text-amber-700' },
  rejected:           { label: 'Refusé',      cls: 'bg-red-100 text-red-700' },
  cancelled:          { label: 'Annulé',      cls: 'bg-gray-200 text-gray-500' },
  paused:             { label: 'En pause',    cls: 'bg-amber-100 text-amber-600' },
}

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  admin:       { label: 'Admin',        cls: 'bg-red-100 text-red-700' },
  organizer:   { label: 'Organisateur', cls: 'bg-blue-100 text-blue-700' },
  participant: { label: 'Participant',  cls: 'bg-gray-100 text-gray-500' },
  suspended:   { label: 'Suspendu',     cls: 'bg-red-50 text-red-400' },
}

const TICKET_STATUS: Record<string, { label: string; cls: string }> = {
  upcoming:  { label: 'Actif',   cls: 'bg-emerald-100 text-emerald-700' },
  used:      { label: 'Scanné',  cls: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Annulé', cls: 'bg-red-100 text-red-600' },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtRevenue(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M FCFA`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)} K FCFA`
  return `${n.toLocaleString('fr-FR')} FCFA`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; cls: string }> }) {
  const cfg = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

function Spinner({ size = 14, cls = 'border-current' }: { size?: number; cls?: string }) {
  return (
    <div
      className={`rounded-full border-2 border-t-transparent animate-spin ${cls}`}
      style={{ width: size, height: size }}
    />
  )
}

function StatCard({ icon: Icon, label, value, gradient, sub }: {
  icon: React.ElementType; label: string; value: string; gradient: string; sub?: string
}) {
  return (
    <div className="rounded-2xl p-4 border border-[#E5E7EB] shadow-sm" style={{ background: 'var(--surface)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: gradient }}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-extrabold leading-none tracking-tight" style={{ color: 'var(--text)' }}>{value}</p>
      <p className="text-xs font-medium mt-1" style={{ color: 'var(--text2)' }}>{label}</p>
      {sub && <p className="text-[10px] font-bold text-amber-600 mt-0.5">{sub}</p>}
    </div>
  )
}

function RejectModal({ title, onConfirm, onClose }: {
  title: string; onConfirm: (reason: string) => void; onClose: () => void
}) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-[430px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-6"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-extrabold text-[#12122A]">Refuser l'événement</h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F4FB] flex items-center justify-center text-[#12122A]/50 hover:text-[#12122A]">
            <X size={15} />
          </button>
        </div>
        <p className="text-sm text-[#12122A]/60 mb-4">« {title} »</p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Motif du refus (optionnel)…"
          rows={3}
          className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#12122A] outline-none resize-none mb-4 focus:border-red-300 transition-colors"
        />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#12122A]/60 hover:text-[#12122A] transition-all">
            Annuler
          </button>
          <button onClick={() => onConfirm(reason)}
            className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <XCircle size={15} />
            Refuser
          </button>
        </div>
      </div>
    </div>
  )
}

function RowSkeleton({ border }: { border: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b animate-pulse" style={{ borderColor: border }}>
      <div className="w-9 h-9 rounded-lg bg-[#E8E8F0] shrink-0" />
      <div className="flex-1">
        <div className="h-3 w-36 bg-[#E8E8F0] rounded-full mb-1.5" />
        <div className="h-2.5 w-24 bg-[#E8E8F0] rounded-full" />
      </div>
      <div className="h-5 w-16 bg-[#E8E8F0] rounded-full" />
    </div>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { isDark } = useTheme()

  const [activeTab, setActiveTab]   = useState<AdminTab>('validation')
  const [loading, setLoading]       = useState(true)
  const [actionId, setActionId]     = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null)

  const [stats, setStats]             = useState<AdminStats>({ totalUsers: 0, totalEvents: 0, pendingCount: 0, totalTickets: 0, totalRevenue: 0 })
  const [pendingEvents, setPendingEvents] = useState<AdminEvent[]>([])
  const [allEvents, setAllEvents]     = useState<AdminEvent[]>([])
  const [users, setUsers]             = useState<AdminUser[]>([])
  const [transactions, setTransactions] = useState<AdminTicket[]>([])

  const [eventStatusFilter, setEventStatusFilter] = useState('all')
  const [userRoleFilter, setUserRoleFilter]       = useState('all')
  const [searchEvents, setSearchEvents]           = useState('')
  const [searchUsers, setSearchUsers]             = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        { count: usersCount },
        { data: eventsRaw, error: eventsErr },
        { data: ticketsRaw, error: ticketsErr },
        { data: profilesRaw, error: profilesErr },
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('*').order('created_at', { ascending: false }),
        supabase.from('tickets')
          .select('id, event_id, user_id, category, quantity, total_price, status, created_at, events(id, title, city, category)')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase.from('profiles')
          .select('id, full_name, email, role, created_at')
          .order('created_at', { ascending: false }),
      ])

      if (eventsErr)   showToast('Erreur événements : ' + eventsErr.message)
      if (ticketsErr)  showToast('Erreur tickets : ' + ticketsErr.message)
      if (profilesErr) showToast('Erreur profils : ' + profilesErr.message)

      const nameMap: Record<string, string> = {}
      for (const p of (profilesRaw ?? [])) {
        if (p.full_name) nameMap[p.id] = p.full_name
      }

      const events: AdminEvent[] = (eventsRaw ?? []).map(e => ({
        id: e.id, title: e.title, status: e.status, validated: e.validated,
        date: e.date, city: e.city, category: e.category, cover_url: e.cover_url,
        created_at: e.created_at, organizer_id: e.organizer_id,
        organizerName: (e.organizer_id && nameMap[e.organizer_id]) ? nameMap[e.organizer_id] : 'Inconnu',
      }))

      const tickets: AdminTicket[] = (ticketsRaw ?? []).map(t => ({
        id: t.id, user_id: t.user_id, category: t.category,
        quantity: t.quantity, total_price: t.total_price,
        status: t.status, created_at: t.created_at,
        eventTitle: (t.events as { title?: string } | null)?.title ?? 'Inconnu',
        buyerName: nameMap[t.user_id] ?? `#${(t.user_id as string)?.slice(0, 8) ?? '?'}`,
      }))

      const totalRevenue = tickets.reduce((s, t) => s + t.total_price, 0)

      setStats({
        totalUsers: usersCount ?? 0,
        totalEvents: events.length,
        pendingCount: events.filter(e => e.status === 'pending_validation').length,
        totalTickets: tickets.length,
        totalRevenue,
      })
      setPendingEvents(events.filter(e => e.status === 'pending_validation'))
      setAllEvents(events)
      setUsers(profilesRaw ?? [])
      setTransactions(tickets)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadData() }, [loadData])

  async function handleValidate(eventId: string) {
    setActionId(eventId)
    const { error } = await supabase.from('events')
      .update({ status: 'active', validated: true }).eq('id', eventId)
    setActionId(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('✅ Événement validé et publié')
    loadData()
  }

  async function handleReject(eventId: string, reason: string) {
    setActionId(eventId)
    const { error } = await supabase.from('events')
      .update({ status: 'rejected', validated: false }).eq('id', eventId)
    setActionId(null)
    setRejectTarget(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('❌ Événement refusé' + (reason ? ` — ${reason.slice(0, 50)}` : ''))
    loadData()
  }

  async function handleSuspendEvent(eventId: string) {
    setActionId(eventId)
    const { error } = await supabase.from('events')
      .update({ status: 'paused' }).eq('id', eventId)
    setActionId(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('⏸ Événement suspendu')
    loadData()
  }

  async function handleDeleteEvent(eventId: string) {
    setActionId(eventId)
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    setActionId(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('🗑 Événement supprimé')
    loadData()
  }

  async function handlePromote(userId: string) {
    setActionId(userId)
    const { error } = await supabase.from('profiles')
      .update({ role: 'organizer' }).eq('id', userId)
    setActionId(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('👑 Promu organisateur')
    loadData()
  }

  async function handleSuspendUser(userId: string) {
    setActionId(userId)
    const { error } = await supabase.from('profiles')
      .update({ role: 'suspended' }).eq('id', userId)
    setActionId(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('🚫 Utilisateur suspendu')
    loadData()
  }

  const filteredEvents = allEvents
    .filter(e => eventStatusFilter === 'all' || e.status === eventStatusFilter)
    .filter(e => !searchEvents ||
      e.title.toLowerCase().includes(searchEvents.toLowerCase()) ||
      e.organizerName.toLowerCase().includes(searchEvents.toLowerCase()) ||
      (e.city ?? '').toLowerCase().includes(searchEvents.toLowerCase()))

  const filteredUsers = users
    .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
    .filter(u => !searchUsers ||
      (u.full_name ?? '').toLowerCase().includes(searchUsers.toLowerCase()) ||
      (u.email ?? '').toLowerCase().includes(searchUsers.toLowerCase()))

  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'

  const TABS = [
    { id: 'validation' as AdminTab, label: 'Validation',    badge: stats.pendingCount },
    { id: 'events'     as AdminTab, label: 'Événements',    badge: 0 },
    { id: 'users'      as AdminTab, label: 'Utilisateurs',  badge: 0 },
    { id: 'transactions' as AdminTab, label: 'Transactions', badge: 0 },
  ]

  return (
    <div className="min-h-screen pb-24 md:pb-10"
      style={{ background: 'var(--bg)', fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <div className="px-5 pt-12 md:pt-8 pb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={22} className="text-red-500" />
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              Panel Admin
            </h1>
            <span className="text-[10px] font-extrabold bg-red-500 text-white px-2.5 py-0.5 rounded-full tracking-widest">
              ADMIN
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>Nexa Pass — Gestion plateforme</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          title="Actualiser"
          className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all hover:border-primary/40 hover:text-primary shrink-0 disabled:opacity-50"
          style={{ background: 'var(--surface)', borderColor: border, color: 'var(--text2)' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Stats globales ── */}
      <div className="px-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users}     label="Utilisateurs inscrits" value={loading ? '—' : stats.totalUsers.toLocaleString('fr-FR')} gradient="linear-gradient(135deg,#2563EB,#3b82f6)" />
        <StatCard icon={Calendar}  label="Événements"            value={loading ? '—' : stats.totalEvents.toLocaleString('fr-FR')} gradient="linear-gradient(135deg,#9333EA,#ec4899)" sub={stats.pendingCount > 0 ? `${stats.pendingCount} en attente` : undefined} />
        <StatCard icon={Ticket}    label="Billets vendus"         value={loading ? '—' : stats.totalTickets.toLocaleString('fr-FR')} gradient="linear-gradient(135deg,#f59e0b,#ef4444)" />
        <StatCard icon={TrendingUp} label="Revenus plateforme"   value={loading ? '—' : fmtRevenue(stats.totalRevenue)} gradient="linear-gradient(135deg,#10b981,#2563EB)" />
      </div>

      {/* ── Tab navigation ── */}
      <div className="flex overflow-x-auto scrollbar-hide border-b px-5 gap-6 mb-5" style={{ borderColor: border }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold whitespace-nowrap flex items-center gap-2 border-b-2 -mb-px transition-all ${
              activeTab === tab.id ? 'text-primary border-primary' : 'border-transparent'
            }`}
            style={activeTab !== tab.id ? { color: 'var(--text2)' } : undefined}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-5">

        {/* ════════════════════════ VALIDATION ════════════════════════ */}
        {activeTab === 'validation' && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text2)' }}>
              {pendingEvents.length} événement{pendingEvents.length !== 1 ? 's' : ''} en attente
            </p>

            {loading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border h-[220px] animate-pulse" style={{ background: 'var(--surface)', borderColor: border }} />
                ))}
              </div>
            ) : pendingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <p className="font-extrabold" style={{ color: 'var(--text)' }}>Aucune validation en attente</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Tous les événements ont été traités.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {pendingEvents.map(event => (
                  <div key={event.id} className="rounded-2xl border overflow-hidden shadow-sm" style={{ background: 'var(--surface)', borderColor: border }}>
                    <div className="relative h-[130px]">
                      <img src={event.cover_url ?? FALLBACK_IMG} alt={event.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute top-3 right-3 bg-amber-400 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                        En attente
                      </span>
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-extrabold text-sm leading-tight truncate">{event.title}</h3>
                        <p className="text-white/60 text-xs mt-0.5">Soumis le {fmtDate(event.created_at)}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {[
                          { label: 'Organisateur', value: event.organizerName },
                          { label: 'Date',         value: event.date ? fmtDate(event.date) : '—' },
                          { label: 'Ville',        value: event.city ?? '—' },
                          { label: 'Catégorie',    value: event.category ?? '—' },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'var(--text2)' }}>{label}</p>
                            <p className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleValidate(event.id)}
                          disabled={actionId === event.id}
                          className="flex-1 h-10 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {actionId === event.id ? <Spinner cls="border-white" /> : <CheckCircle2 size={15} />}
                          Valider
                        </button>
                        <button
                          onClick={() => setRejectTarget({ id: event.id, title: event.title })}
                          disabled={actionId === event.id}
                          className="flex-1 h-10 rounded-xl border border-red-200 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={15} />
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════ ÉVÉNEMENTS ════════════════════════ */}
        {activeTab === 'events' && (
          <div>
            {/* Status filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
              {(['all', 'active', 'pending_validation', 'rejected', 'draft', 'paused', 'cancelled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setEventStatusFilter(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    eventStatusFilter === s ? 'bg-primary text-white border-primary' : 'border-[#E5E7EB]'
                  }`}
                  style={eventStatusFilter !== s ? { background: 'var(--surface)', color: 'var(--text2)' } : undefined}
                >
                  {s === 'all' ? 'Tous' : (EVENT_STATUS[s]?.label ?? s)}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 border" style={{ background: 'var(--surface)', borderColor: border }}>
              <Search size={14} style={{ color: 'var(--text2)' }} className="shrink-0" />
              <input
                value={searchEvents}
                onChange={e => setSearchEvents(e.target.value)}
                placeholder="Titre, organisateur, ville…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text)' }}
              />
              {searchEvents && (
                <button onClick={() => setSearchEvents('')}><X size={13} style={{ color: 'var(--text2)' }} /></button>
              )}
            </div>
            {/* List */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: border }}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} border={border} />)
              ) : filteredEvents.length === 0 ? (
                <p className="text-center py-10 text-sm" style={{ color: 'var(--text2)' }}>Aucun événement</p>
              ) : (
                filteredEvents.map((event, idx) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${idx < filteredEvents.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: border }}
                  >
                    <img src={event.cover_url ?? FALLBACK_IMG} alt={event.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{event.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text2)' }}>
                        {event.organizerName} · {event.city ?? '—'} · {event.date ? fmtDate(event.date) : '?'}
                      </p>
                    </div>
                    <StatusBadge status={event.status} map={EVENT_STATUS} />
                    <div className="flex gap-1 shrink-0 ml-1">
                      {event.status === 'pending_validation' && (
                        <button
                          onClick={() => handleValidate(event.id)}
                          disabled={actionId === event.id}
                          title="Valider"
                          className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                        >
                          {actionId === event.id ? <Spinner size={12} cls="border-emerald-600" /> : <CheckCircle2 size={14} />}
                        </button>
                      )}
                      {event.status === 'pending_validation' && (
                        <button
                          onClick={() => setRejectTarget({ id: event.id, title: event.title })}
                          disabled={actionId === event.id}
                          title="Refuser"
                          className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      {event.status !== 'paused' && event.status !== 'rejected' && (
                        <button
                          onClick={() => handleSuspendEvent(event.id)}
                          disabled={actionId === event.id}
                          title="Suspendre"
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E8E8F0] disabled:opacity-50 transition-colors"
                          style={{ color: 'var(--text2)' }}
                        >
                          <Ban size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={actionId === event.id}
                        title="Supprimer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        {actionId === event.id ? <Spinner size={12} cls="border-red-400" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-center mt-3" style={{ color: 'var(--text2)' }}>
              {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* ════════════════════════ UTILISATEURS ════════════════════════ */}
        {activeTab === 'users' && (
          <div>
            {/* Role filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-3">
              {(['all', 'participant', 'organizer', 'admin', 'suspended'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    userRoleFilter === r ? 'bg-primary text-white border-primary' : 'border-[#E5E7EB]'
                  }`}
                  style={userRoleFilter !== r ? { background: 'var(--surface)', color: 'var(--text2)' } : undefined}
                >
                  {r === 'all' ? 'Tous' : (ROLE_BADGE[r]?.label ?? r)}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 border" style={{ background: 'var(--surface)', borderColor: border }}>
              <Search size={14} style={{ color: 'var(--text2)' }} className="shrink-0" />
              <input
                value={searchUsers}
                onChange={e => setSearchUsers(e.target.value)}
                placeholder="Nom ou email…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text)' }}
              />
              {searchUsers && (
                <button onClick={() => setSearchUsers('')}><X size={13} style={{ color: 'var(--text2)' }} /></button>
              )}
            </div>
            {/* List */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: border }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} border={border} />)
              ) : filteredUsers.length === 0 ? (
                <p className="text-center py-10 text-sm" style={{ color: 'var(--text2)' }}>Aucun utilisateur</p>
              ) : (
                filteredUsers.map((u, idx) => {
                  const name = u.full_name ?? 'Utilisateur'
                  const initials = name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
                  const isCurrentUser = u.id === user?.id
                  return (
                    <div
                      key={u.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${idx < filteredUsers.length - 1 ? 'border-b' : ''}`}
                      style={{ borderColor: border }}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ background: 'linear-gradient(135deg,#2563EB,#9333EA)' }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
                          {name}{isCurrentUser && <span className="ml-1 text-[10px] text-primary font-normal">(vous)</span>}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text2)' }}>
                          {u.email ?? `ID: ${u.id.slice(0, 12)}…`} · {fmtDate(u.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={u.role ?? 'participant'} map={ROLE_BADGE} />
                      {!isCurrentUser && (
                        <div className="flex gap-1 shrink-0 ml-1">
                          {u.role !== 'organizer' && u.role !== 'admin' && (
                            <button
                              onClick={() => handlePromote(u.id)}
                              disabled={actionId === u.id}
                              title="Promouvoir organisateur"
                              className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                            >
                              {actionId === u.id ? <Spinner size={12} cls="border-blue-600" /> : <UserCheck size={14} />}
                            </button>
                          )}
                          {u.role !== 'admin' && u.role !== 'suspended' && (
                            <button
                              onClick={() => handleSuspendUser(u.id)}
                              disabled={actionId === u.id}
                              title="Suspendre"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              {actionId === u.id ? <Spinner size={12} cls="border-red-400" /> : <Ban size={14} />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
            <p className="text-xs text-center mt-3" style={{ color: 'var(--text2)' }}>
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* ════════════════════════ TRANSACTIONS ════════════════════════ */}
        {activeTab === 'transactions' && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text2)' }}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              {transactions.length > 0 && ` · ${fmtRevenue(transactions.reduce((s, t) => s + t.total_price, 0))} total`}
            </p>
            <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: border }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} border={border} />)
              ) : transactions.length === 0 ? (
                <p className="text-center py-10 text-sm" style={{ color: 'var(--text2)' }}>Aucune transaction</p>
              ) : (
                transactions.map((tx, idx) => (
                  <div
                    key={tx.id}
                    className={`flex items-center gap-3 px-4 py-3.5 ${idx < transactions.length - 1 ? 'border-b' : ''}`}
                    style={{ borderColor: border }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
                        {tx.buyerName}
                        <span className="font-normal" style={{ color: 'var(--text2)' }}> → {tx.eventTitle}</span>
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text2)' }}>
                        {tx.category} · ×{tx.quantity} · {fmtDateTime(tx.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-extrabold text-primary mb-0.5">
                        {tx.total_price.toLocaleString('fr-FR')} F
                      </p>
                      <StatusBadge status={tx.status} map={TICKET_STATUS} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      <BottomNav />

      {rejectTarget && (
        <RejectModal
          title={rejectTarget.title}
          onConfirm={reason => handleReject(rejectTarget.id, reason)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  )
}
