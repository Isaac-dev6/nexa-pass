import { useState } from 'react'
import {
  ShoppingBag, Calendar, MapPin, Clock,
  QrCode, ChevronRight, Ticket, Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { BottomNav } from '../components/ui/BottomNav'

// ── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = 'upcoming' | 'transferred' | 'cancelled' | 'past'
type SubTab = TicketStatus
type MainTab = 'tickets' | 'contributions'

interface MockTicket {
  id: string
  status: TicketStatus
  eventTitle: string
  dateIso: string
  dateLabel: string
  time: string
  venue: string
  ticketType: string
  quantity: number
  price: number
  imageUrl: string
  orderRef: string
}

interface MockContrib {
  id: string
  title: string
  description: string
  contributed: number
  goal: number
  participants: number
  imageUrl: string
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TICKETS: MockTicket[] = [
  {
    id: 'T001',
    status: 'upcoming',
    eventTitle: 'Brazza Vibe Fest',
    dateIso: '2026-05-23',
    dateLabel: 'Sam. 23 Mai 2026',
    time: '20h00',
    venue: 'Stade Éboué, Brazzaville',
    ticketType: 'VIP',
    quantity: 1,
    price: 15000,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg',
    orderRef: 'NXP-2026-002',
  },
  {
    id: 'T002',
    status: 'upcoming',
    eventTitle: 'Derby de Brazzaville',
    dateIso: '2026-06-05',
    dateLabel: 'Ven. 5 Juin 2026',
    time: '16h00',
    venue: 'Stade Massamba-Débat',
    ticketType: 'Tribune',
    quantity: 2,
    price: 2000,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
    orderRef: 'NXP-2026-001',
  },
  {
    id: 'T003',
    status: 'past',
    eventTitle: 'Nuit Jazz du Congo',
    dateIso: '2026-03-14',
    dateLabel: 'Ven. 14 Mars 2026',
    time: '20h00',
    venue: 'Palais des Congrès',
    ticketType: 'Standard',
    quantity: 1,
    price: 5000,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
    orderRef: 'NXP-2026-003',
  },
  {
    id: 'T004',
    status: 'cancelled',
    eventTitle: 'Soirée Prestige Brazza',
    dateIso: '2026-04-12',
    dateLabel: 'Dim. 12 Avril 2026',
    time: '21h00',
    venue: 'Hotel Ledger Plaza',
    ticketType: 'Prestige',
    quantity: 1,
    price: 25000,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg',
    orderRef: 'NXP-2026-004',
  },
]

const MOCK_CONTRIBS: MockContrib[] = [
  {
    id: 'C001',
    title: 'Cagnotte Anniversaire Sarah',
    description: "On collecte pour offrir une surprise à Sarah pour ses 30 ans — concert + dîner !",
    contributed: 45000,
    goal: 100000,
    participants: 12,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg',
  },
  {
    id: 'C002',
    title: 'Sortie Concert Groupe',
    description: "Collecte pour les billets du prochain grand concert de Brazzaville — on y va à 6 !",
    contributed: 55000,
    goal: 80000,
    participants: 6,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
  },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'upcoming', label: 'À venir' },
  { id: 'transferred', label: 'Transférés' },
  { id: 'cancelled', label: 'Annulés' },
  { id: 'past', label: 'Passés' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateIso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateIso)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function statusConfig(status: TicketStatus) {
  switch (status) {
    case 'upcoming':    return { label: 'Actif',      cls: 'bg-emerald-500 text-white' }
    case 'transferred': return { label: 'Transféré',  cls: 'bg-blue-500 text-white' }
    case 'cancelled':   return { label: 'Annulé',     cls: 'bg-red-500 text-white' }
    case 'past':        return { label: 'Passé',      cls: 'bg-gray-400 text-white' }
  }
}

function emptyConfig(tab: SubTab) {
  switch (tab) {
    case 'upcoming':    return { title: 'Aucun ticket à venir',   desc: "Tu n'as pas encore réservé d'événement. Explore et trouve ton prochain coup de cœur !" }
    case 'transferred': return { title: 'Aucun ticket transféré', desc: "Tu n'as pas encore transféré de billets à quelqu'un." }
    case 'cancelled':   return { title: 'Aucune annulation',      desc: "Aucun de tes billets n'a été annulé. Bonne nouvelle !" }
    case 'past':        return { title: 'Aucun événement passé',  desc: "Tes événements passés apparaîtront ici après tes premières sorties." }
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ tab, onExplore }: { tab: SubTab; onExplore: () => void }) {
  const { title, desc } = emptyConfig(tab)
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      <div className="w-16 h-16 rounded-full bg-[#E8E8F0] flex items-center justify-center mb-4">
        <Ticket size={26} className="text-[#12122A]/25" />
      </div>
      <h3 className="font-extrabold text-[#12122A] mb-2">{title}</h3>
      <p className="text-sm text-[#12122A]/50 max-w-[240px] leading-relaxed mb-6">{desc}</p>
      {tab === 'upcoming' && (
        <button
          onClick={onExplore}
          className="px-6 py-3 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          Explorer les événements
        </button>
      )}
    </div>
  )
}

function TicketCard({ ticket, onWip }: { ticket: MockTicket; onWip: () => void }) {
  const { label, cls } = statusConfig(ticket.status)
  const days = daysUntil(ticket.dateIso)
  const showCountdown = ticket.status === 'upcoming' && days > 0 && days <= 7

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
      {/* Image banner */}
      <div className="relative h-[140px] rounded-t-2xl overflow-hidden">
        <img
          src={ticket.imageUrl}
          alt={ticket.eventTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}>
          {label}
        </span>
        <span className="absolute bottom-3 left-3 text-white/60 text-[10px] font-medium tracking-wide">
          {ticket.orderRef}
        </span>
      </div>

      {/* Event info */}
      <div className="px-4 pt-3">
        <h3 className="font-extrabold text-[15px] leading-tight mb-2">{ticket.eventTitle}</h3>
        <div className="flex items-center gap-1.5 text-xs text-[#12122A]/55 mb-1">
          <Calendar size={12} className="shrink-0" />
          <span>{ticket.dateLabel} · {ticket.time}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#12122A]/55 mb-3">
          <MapPin size={12} className="shrink-0" />
          <span>{ticket.venue}</span>
        </div>

        {showCountdown && (
          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full mb-3">
            <Clock size={11} className="text-orange-500" />
            <span className="text-xs font-semibold text-orange-600">
              Dans {days} jour{days > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Ticket perforation separator */}
      <div className="relative flex items-center my-1">
        <div className="w-6 h-6 rounded-full bg-[#F4F4FB] shrink-0 -ml-3 z-10" />
        <div className="flex-1 border-t-2 border-dashed border-[#E5E7EB]" />
        <div className="w-6 h-6 rounded-full bg-[#F4F4FB] shrink-0 -mr-3 z-10" />
      </div>

      {/* Ticket footer */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-[11px] text-[#12122A]/40 font-medium uppercase tracking-wide mb-0.5">Type</p>
            <p className="text-sm font-bold">
              {ticket.ticketType}
              {ticket.quantity > 1 && (
                <span className="ml-1.5 text-xs font-semibold text-[#12122A]/40">× {ticket.quantity}</span>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#12122A]/40 font-medium uppercase tracking-wide mb-0.5">Prix payé</p>
            <p className="text-sm font-bold text-primary">{formatPrice(ticket.price * ticket.quantity)}</p>
          </div>
        </div>

        {ticket.status === 'upcoming' && (
          <button
            onClick={onWip}
            className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            <QrCode size={16} />
            Voir mon billet
          </button>
        )}
        {ticket.status === 'past' && (
          <button
            onClick={onWip}
            className="w-full h-11 rounded-xl border border-[#E5E7EB] flex items-center justify-center gap-2 text-sm font-semibold text-[#12122A]/50 transition-colors hover:border-[#12122A]/20"
          >
            <QrCode size={16} />
            Voir le billet archivé
          </button>
        )}
        {ticket.status === 'cancelled' && (
          <div className="w-full h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-red-400">Billet annulé</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ContribCard({ contrib, onWip }: { contrib: MockContrib; onWip: () => void }) {
  const pct = Math.min(100, Math.round((contrib.contributed / contrib.goal) * 100))
  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
          <img src={contrib.imageUrl} alt={contrib.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-sm leading-tight mb-0.5 truncate">{contrib.title}</h3>
          <p className="text-xs text-[#12122A]/50 leading-relaxed line-clamp-2">{contrib.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#12122A]/50 mb-3">
        <Users size={12} />
        <span>{contrib.participants} participants</span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-[#12122A]/50">Progression</span>
          <span className="text-primary">{formatPrice(contrib.contributed)} / {formatPrice(contrib.goal)}</span>
        </div>
        <div className="h-2 bg-[#F4F4FB] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #2563EB, #9333EA)',
            }}
          />
        </div>
        <p className="text-right text-[11px] text-[#12122A]/40 mt-1 font-medium">{pct}% de l'objectif atteint</p>
      </div>

      <button
        onClick={onWip}
        className="w-full h-10 rounded-xl border border-primary text-primary text-sm font-bold flex items-center justify-center gap-1.5 transition-colors hover:bg-primary/5 active:scale-[0.98]"
      >
        Voir la cagnotte
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function Orders() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const [mainTab, setMainTab] = useState<MainTab>('tickets')
  const [subTab, setSubTab] = useState<SubTab>('upcoming')

  const upcomingCount = MOCK_TICKETS.filter((t) => t.status === 'upcoming').length
  const filtered = MOCK_TICKETS.filter((t) => t.status === subTab)

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen pb-24 md:pb-10"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="relative flex items-center px-5 pt-12 md:pt-8 pb-4">
        <h1 className="flex-1 text-center text-xl font-extrabold tracking-tight">Mes commandes</h1>
        <button
          onClick={wip}
          className="absolute right-5 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          <ShoppingBag size={18} className="text-white" />
        </button>
      </header>

      {/* ── Segmented control ── */}
      <div className="px-5 mb-5">
        <div className="bg-[#E8E8F0] rounded-xl p-1 flex">
          {(['tickets', 'contributions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                mainTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-[#12122A]/50'
              }`}
            >
              {tab === 'tickets' ? 'Mes tickets' : 'Mes contributions'}
            </button>
          ))}
        </div>
      </div>

      {/* ── TICKETS TAB ── */}
      {mainTab === 'tickets' && (
        <>
          {/* Sub-navigation */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-[#E5E7EB] mb-5 px-5 gap-6">
            {SUB_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSubTab(id)}
                className={`pb-3 text-sm font-bold whitespace-nowrap flex items-center gap-2 border-b-2 -mb-px transition-all ${
                  subTab === id
                    ? 'text-primary border-primary'
                    : 'text-[#12122A]/45 border-transparent'
                }`}
              >
                {label}
                {id === 'upcoming' && upcomingCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {upcomingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Ticket list or empty state */}
          {filtered.length === 0 ? (
            <EmptyState tab={subTab} onExplore={() => navigate('/')} />
          ) : (
            <div className="px-5 flex flex-col gap-4 md:grid md:grid-cols-2">
              {filtered.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onWip={wip} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── CONTRIBUTIONS TAB ── */}
      {mainTab === 'contributions' && (
        <>
          {MOCK_CONTRIBS.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
              <div className="w-16 h-16 rounded-full bg-[#E8E8F0] flex items-center justify-center mb-4">
                <Users size={26} className="text-[#12122A]/25" />
              </div>
              <h3 className="font-extrabold text-[#12122A] mb-2">Aucune contribution</h3>
              <p className="text-sm text-[#12122A]/50 max-w-[240px] leading-relaxed mb-6">
                Tu n'as pas encore participé à une cagnotte. Rejoins une cagnotte ou crée la tienne !
              </p>
              <button
                onClick={wip}
                className="px-6 py-3 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
              >
                Découvrir les cagnottes
              </button>
            </div>
          ) : (
            <div className="px-5 flex flex-col gap-4 md:grid md:grid-cols-2">
              {MOCK_CONTRIBS.map((c) => (
                <ContribCard key={c.id} contrib={c} onWip={wip} />
              ))}
            </div>
          )}
        </>
      )}

      <BottomNav />
    </div>
  )
}
