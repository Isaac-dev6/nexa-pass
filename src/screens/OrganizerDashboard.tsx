import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Ticket, TrendingUp, BarChart2, Calendar,
  Plus, Pencil, QrCode, ChevronRight,
  TrendingDown, ArrowUpRight, Trash2, PauseCircle, PlayCircle, X, AlertTriangle, RefreshCw,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useOrganizerEvents, useOrganizerStats, formatTimeAgo } from '../hooks/useEvents'
import type { SupabaseEvent } from '../hooks/useEvents'
import { BottomNav } from '../components/ui/BottomNav'

// ── Confirm Delete Modal ──────────────────────────────────────────────────────

function DeleteEventModal({
  title, onConfirm, onClose, loading,
}: { title: string; onConfirm: () => void; onClose: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-[430px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-6"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 className="text-base font-extrabold text-[#12122A]">Supprimer l'événement</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F4F4FB] flex items-center justify-center text-[#12122A]/50 hover:text-[#12122A]">
            <X size={15} />
          </button>
        </div>
        <p className="text-sm text-[#12122A]/60 mb-1 leading-relaxed">
          Êtes-vous sûr de vouloir supprimer l'événement
        </p>
        <p className="text-sm font-bold text-[#12122A] mb-5">« {title} » ?</p>
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
          Cette action est irréversible. Les billets déjà vendus ne seront pas remboursés automatiquement.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#12122A]/60 hover:text-[#12122A] hover:border-[#12122A]/20 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Trash2 size={15} />}
            {loading ? 'Suppression…' : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

type EventStatus = 'Actif' | 'Complet' | 'Brouillon' | 'Terminé' | 'En pause'

interface OrgEvent {
  id: string
  title: string
  date: string
  venue: string
  status: EventStatus
  sold: number
  total: number
  revenue: number
  imageUrl: string
}

const FALLBACK_IMG = 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#2563EB,#9333EA)',
  'linear-gradient(135deg,#9333EA,#ec4899)',
  'linear-gradient(135deg,#10b981,#2563EB)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#2563EB,#10b981)',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function toEventStatus(status: string): EventStatus {
  switch (status) {
    case 'active':    return 'Actif'
    case 'draft':     return 'Brouillon'
    case 'cancelled': return 'Terminé'
    case 'paused':    return 'En pause'
    default:          return 'Brouillon'
  }
}

function toOrgEvent(e: SupabaseEvent): OrgEvent {
  const d = e.date ? new Date(e.date) : null
  return {
    id: e.id,
    title: e.title,
    date: d
      ? d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : 'Date à confirmer',
    venue: e.location ?? e.city ?? '',
    status: toEventStatus(e.status),
    sold: 0,
    total: 0,
    revenue: 0,
    imageUrl: e.cover_url ?? FALLBACK_IMG,
  }
}

function formatRevenue(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2).replace('.', ',')} M FCFA`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)} K FCFA`
  return `${n.toLocaleString('fr-FR')} FCFA`
}

function pct(sold: number, total: number) {
  return total === 0 ? 0 : Math.round((sold / total) * 100)
}

function statusStyle(status: EventStatus): { bg: string; text: string } {
  switch (status) {
    case 'Actif':    return { bg: 'bg-emerald-500',   text: 'text-white' }
    case 'Complet':  return { bg: 'bg-primary',        text: 'text-white' }
    case 'Brouillon': return { bg: 'bg-gray-300',     text: 'text-gray-700' }
    case 'Terminé':  return { bg: 'bg-[#12122A]/40',  text: 'text-white' }
    case 'En pause': return { bg: 'bg-amber-400',     text: 'text-white' }
  }
}

function progressColor(p: number) {
  if (p >= 90) return 'linear-gradient(90deg,#ef4444,#f97316)'
  if (p >= 60) return 'linear-gradient(90deg,#2563EB,#9333EA)'
  return 'linear-gradient(90deg,#10b981,#2563EB)'
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden animate-pulse">
      <div className="h-[110px] bg-[#E8E8F0]" />
      <div className="p-4">
        <div className="h-4 w-3/4 bg-[#E8E8F0] rounded-full mb-2" />
        <div className="h-3 w-1/2 bg-[#E8E8F0] rounded-full mb-3" />
        <div className="h-2 w-full bg-[#E8E8F0] rounded-full mb-3" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 h-9 bg-[#E8E8F0] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#12122A] text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-[#c084fc]">{payload[0].value.toLocaleString('fr-FR')} FCFA</p>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function OrganizerDashboard() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user } = useAuth()
  const { events: rawEvents, loading: eventsLoading } = useOrganizerEvents(user?.id)
  const { refetch: refetchStats, ...orgStats } = useOrganizerStats(user?.id)
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [pausingId, setPausingId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Stop spinner when Supabase fetch completes (lastFetched updates)
  useEffect(() => {
    if (orgStats.lastFetched) setRefreshing(false)
  }, [orgStats.lastFetched])

  // Polling every 10s
  useEffect(() => {
    if (!user?.id) return
    const interval = setInterval(() => { refetchStats() }, 10_000)
    return () => clearInterval(interval)
  }, [user?.id])

  function handleManualRefresh() {
    setRefreshing(true)
    refetchStats()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('events').delete().eq('id', deleteTarget.id).eq('organizer_id', user?.id!)
    setDeleting(false)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast('Événement supprimé')
    setDeleteTarget(null)
    navigate(0)
  }

  async function handleTogglePause(event: OrgEvent, rawStatus: string) {
    setPausingId(event.id)
    const newStatus = rawStatus === 'paused' ? 'active' : 'paused'
    const { error } = await supabase.from('events').update({ status: newStatus }).eq('id', event.id).eq('organizer_id', user?.id!)
    setPausingId(null)
    if (error) { showToast('Erreur : ' + error.message); return }
    showToast(newStatus === 'paused' ? 'Événement mis en pause' : 'Événement réactivé')
    navigate(0)
  }

  const orgName = user?.user_metadata?.full_name ?? 'Organisateur'
  const activeCount = rawEvents.filter((e) => e.status === 'active').length

  const orgEvents: OrgEvent[] = rawEvents.map((e) => {
    const perEvent = orgStats.perEvent[e.id] ?? { sold: 0, revenue: 0 }
    return {
      ...toOrgEvent(e),
      sold: perEvent.sold,
      revenue: perEvent.revenue,
    }
  })

  const scanRate = orgStats.totalSold > 0
    ? Math.round((orgStats.scannedCount / orgStats.totalSold) * 100)
    : 0

  const STATS = [
    {
      label: 'Billets vendus',
      value: orgStats.loading ? '—' : orgStats.totalSold.toLocaleString('fr-FR'),
      icon: Ticket,
      iconBg: 'linear-gradient(135deg,#2563EB,#3b82f6)',
      delta: `${orgStats.ticketCount} commandes`,
      up: true,
    },
    {
      label: 'Revenus totaux',
      value: orgStats.loading ? '—' : formatRevenue(orgStats.revenue),
      icon: TrendingUp,
      iconBg: 'linear-gradient(135deg,#9333EA,#ec4899)',
      delta: `7j: ${formatRevenue(orgStats.chartData.reduce((s, d) => s + d.ventes, 0))}`,
      up: true,
    },
    {
      label: 'Billets scannés',
      value: orgStats.loading ? '—' : orgStats.scannedCount.toLocaleString('fr-FR'),
      icon: BarChart2,
      iconBg: 'linear-gradient(135deg,#f59e0b,#ef4444)',
      delta: `${scanRate}% taux`,
      up: scanRate > 0,
    },
    {
      label: 'Événements actifs',
      value: eventsLoading ? '—' : String(activeCount),
      icon: Calendar,
      iconBg: 'linear-gradient(135deg,#10b981,#2563EB)',
      delta: `${rawEvents.length} total`,
      up: true,
    },
  ]

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen pb-24 md:pb-10"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-12 md:pt-8 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-tight">Mon Dashboard</h1>
            <p className="text-sm text-[#12122A]/50 mt-0.5">{orgName}</p>
            {orgStats.lastFetched && (
              <p className="text-[11px] text-[#12122A]/35 mt-0.5">
                Dernière mise à jour : {orgStats.lastFetched.toLocaleTimeString('fr-FR')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[#E5E7EB] bg-white text-[#12122A] transition-all hover:border-primary/40 hover:text-primary active:scale-[0.97] disabled:opacity-50"
            >
              {refreshing
                ? <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                : <RefreshCw size={16} />
              }
              <span className="hidden sm:inline">Actualiser</span>
            </button>
            <button
              onClick={() => navigate('/scanner')}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-[#E5E7EB] bg-white text-[#12122A] transition-all hover:border-primary/40 hover:text-primary active:scale-[0.97]"
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">Scanner</span>
            </button>
            <button
              onClick={() => navigate('/create-event')}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Créer un événement</span>
              <span className="sm:hidden">Créer</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {orgStats.fetchError && (
        <div className="mx-5 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2.5">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 font-semibold flex-1 leading-snug">
            Erreur Supabase : {orgStats.fetchError}
          </p>
        </div>
      )}

      {/* ── Quick stats ── */}
      <div className="px-5 mb-6 grid grid-cols-2 gap-3">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: stat.iconBg }}
                >
                  <Icon size={18} className="text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.delta}
                </div>
              </div>
              <p className="text-2xl font-extrabold leading-none tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-[#12122A]/50 font-medium mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* ── Sales chart ── */}
      <div className="px-5 mb-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-extrabold">Ventes récentes</h2>
              <p className="text-xs text-[#12122A]/50 mt-0.5">7 derniers jours</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-bold">
              <ArrowUpRight size={14} />
              +24%
            </div>
          </div>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orgStats.chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#12122A', opacity: 0.4 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#12122A', opacity: 0.4 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : String(v)}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 2' }} />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                  dot={{ fill: '#2563EB', strokeWidth: 2, r: 3, stroke: '#fff' }}
                  activeDot={{ r: 5, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── My events (real data) ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-5 mb-4">
          <h2 className="text-base font-extrabold">Mes événements</h2>
          <button onClick={wip} className="text-primary text-sm font-semibold flex items-center gap-1">
            Voir tout <ChevronRight size={14} />
          </button>
        </div>

        <div className="px-5 flex flex-col gap-3 md:grid md:grid-cols-2">
          {eventsLoading ? (
            Array.from({ length: 2 }).map((_, i) => <EventCardSkeleton key={i} />)
          ) : orgEvents.length === 0 ? (
            <div className="md:col-span-2 flex flex-col items-center justify-center py-10 text-center bg-white rounded-2xl border border-[#E5E7EB]">
              <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-3">
                <Calendar size={26} className="text-primary/40" />
              </div>
              <p className="text-sm font-bold text-[#12122A]/60 mb-1">Aucun événement créé</p>
              <p className="text-xs text-[#12122A]/35 mb-4 max-w-[200px] leading-relaxed">
                Crée ton premier événement pour le voir apparaître ici.
              </p>
              <button
                onClick={() => navigate('/create-event')}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
              >
                Créer un événement
              </button>
            </div>
          ) : (
            orgEvents.map((event, idx) => {
              const rawEvent = rawEvents[idx]
              const rawStatus = rawEvent?.status ?? 'active'
              const fill = pct(event.sold, event.total)
              const { bg, text } = statusStyle(event.status)
              const isPaused = rawStatus === 'paused'
              const isPausing = pausingId === event.id
              return (
                <div key={event.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                  {/* Image */}
                  <div className="relative h-[110px]">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className={`absolute top-3 right-3 ${bg} ${text} text-[11px] font-bold px-2.5 py-1 rounded-full`}>
                      {event.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-extrabold text-[15px] leading-tight mb-1 truncate">{event.title}</h3>
                    <p className="text-xs text-[#12122A]/50 mb-1">{event.date}</p>
                    {event.venue && (
                      <p className="text-xs text-[#12122A]/40 mb-3 truncate">{event.venue}</p>
                    )}

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[#12122A]/50">
                          {event.total === 0
                            ? 'Billetterie non configurée'
                            : `${event.sold.toLocaleString('fr-FR')} / ${event.total.toLocaleString('fr-FR')} billets`}
                        </span>
                        {event.total > 0 && (
                          <span className={fill >= 90 ? 'text-red-500' : fill >= 60 ? 'text-primary' : 'text-emerald-500'}>
                            {fill}%
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 bg-[#F4F4FB] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${fill}%`, background: progressColor(fill) }}
                        />
                      </div>
                    </div>

                    {event.revenue > 0 && (
                      <p className="text-sm font-extrabold text-primary mb-4">{formatRevenue(event.revenue)}</p>
                    )}

                    {/* Action buttons — row 1 */}
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => navigate(`/event/edit/${event.id}`)}
                        className="flex-1 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center gap-1.5 text-xs font-bold text-[#12122A]/70 hover:border-primary/40 hover:text-primary transition-all"
                      >
                        <Pencil size={13} />
                        Modifier
                      </button>
                      <button
                        onClick={() => navigate('/scanner')}
                        className="flex-1 h-9 rounded-xl border border-[#E5E7EB] flex items-center justify-center gap-1.5 text-xs font-bold text-[#12122A]/70 hover:border-primary/40 hover:text-primary transition-all"
                      >
                        <QrCode size={13} />
                        Scanner
                      </button>
                    </div>
                    {/* Action buttons — row 2 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePause(event, rawStatus)}
                        disabled={isPausing}
                        className={`flex-1 h-9 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all disabled:opacity-50 ${
                          isPaused
                            ? 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
                            : 'border-amber-300 text-amber-600 hover:bg-amber-50'
                        }`}
                      >
                        {isPausing
                          ? <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          : isPaused ? <PlayCircle size={13} /> : <PauseCircle size={13} />
                        }
                        {isPaused ? 'Réactiver' : 'Pause'}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ id: event.id, title: event.title })}
                        className="flex-1 h-9 rounded-xl border border-red-100 flex items-center justify-center gap-1.5 text-xs font-bold text-red-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={13} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ── Recent sales ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold">Dernières ventes</h2>
          <button onClick={wip} className="text-primary text-sm font-semibold flex items-center gap-1">
            Voir tout <ChevronRight size={14} />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm divide-y divide-[#F4F4FB]">
          {orgStats.loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-[#E8E8F0] shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-28 bg-[#E8E8F0] rounded-full mb-1.5" />
                  <div className="h-2.5 w-20 bg-[#E8E8F0] rounded-full" />
                </div>
                <div className="h-3 w-16 bg-[#E8E8F0] rounded-full" />
              </div>
            ))
          ) : orgStats.recentTickets.length === 0 ? (
            <p className="text-sm text-[#12122A]/40 text-center py-8">Aucune vente pour l'instant</p>
          ) : (
            orgStats.recentTickets.map((ticket, i) => {
              const buyerName = orgStats.buyerNames[ticket.user_id]
              const displayName = buyerName ?? `Acheteur #${ticket.user_id.slice(0, 8)}`
              const initials = buyerName
                ? buyerName.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
                : ticket.user_id.slice(0, 2).toUpperCase()
              return (
                <div key={ticket.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{displayName}</p>
                    <p className="text-xs text-[#12122A]/50">{ticket.category} · {formatTimeAgo(ticket.created_at)}</p>
                  </div>
                  <p className="text-sm font-extrabold text-primary shrink-0 whitespace-nowrap">
                    +{ticket.total_price.toLocaleString('fr-FR')} F
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>

      <BottomNav />

      {deleteTarget && (
        <DeleteEventModal
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
