import { useState, useEffect } from 'react'
import {
  ArrowLeft, Heart, Calendar, Clock, MapPin, ExternalLink,
  ChevronRight, Ticket, Minus, Plus,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import type { SupabaseEvent } from '../hooks/useEvents'

// Ticket types proposed at checkout (organizer pricing not yet stored in DB)
const TICKET_TYPES = [
  { id: 'tribune',  name: 'Tribune',  price: 2_000,  desc: 'Accès tribune' },
  { id: 'standard', name: 'Standard', price: 5_000,  desc: 'Accès général' },
  { id: 'vip',      name: 'VIP',      price: 15_000, desc: 'Accès VIP + lounge' },
]

const FALLBACK_IMG = 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg'

function fmtDate(iso: string | null): string {
  if (!iso) return 'Date à confirmer'
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')
}

function DetailSkeleton() {
  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      <div className="w-full h-[280px] bg-[#E8E8F0] animate-pulse" />
      <div className="px-5 pt-5 pb-[100px] flex flex-col gap-4">
        <div>
          <div className="h-7 w-3/4 bg-[#E8E8F0] rounded-full mb-2 animate-pulse" />
          <div className="h-4 w-1/2 bg-[#E8E8F0] rounded-full animate-pulse" />
        </div>
        <div className="h-[130px] bg-[#E8E8F0] rounded-2xl animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full bg-[#E8E8F0] rounded-full animate-pulse" />
          <div className="h-3 w-full bg-[#E8E8F0] rounded-full animate-pulse" />
          <div className="h-3 w-3/4 bg-[#E8E8F0] rounded-full animate-pulse" />
        </div>
        <div className="h-[80px] bg-[#E8E8F0] rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

export function EventDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()

  const [event, setEvent] = useState<SupabaseEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!id) { navigate('/explorer', { replace: true }); return }
    let cancelled = false
    setLoading(true)
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          navigate('/explorer', { replace: true })
          return
        }
        setEvent(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, navigate])

  if (loading) return <DetailSkeleton />
  if (!event) return null

  const imageUrl = event.cover_url ?? FALLBACK_IMG
  const displayDate = fmtDate(event.date)
  const displayTime = fmtTime(event.date)
  const descriptionParagraphs = event.description
    ? event.description.split('\n').filter(Boolean)
    : ['Aucune description disponible pour cet événement.']

  // Derive organizer display from organizer_id (no auth.users join on client)
  const orgInitials = getInitials('Organisateur Nexa')

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Hero image ── */}
      <div className="relative w-full h-[280px] overflow-hidden">
        <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-5 pt-12 md:pt-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 text-white transition-all hover:bg-black/50"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() => setLiked((v) => !v)}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
              liked
                ? 'bg-rose-500 border-rose-400 text-white'
                : 'bg-black/30 border-white/20 text-white hover:bg-black/50'
            }`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="absolute bottom-5 left-5">
          <span className="bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {event.category ?? 'Événement'}
          </span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="px-5 pt-5 pb-[176px] md:pb-8">

        {/* Title */}
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight mb-1">{event.title}</h1>
          {event.city && (
            <p className="text-sm text-[#12122A]/60">{event.city}</p>
          )}
        </div>

        {/* Date / time / venue card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm mb-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-[#12122A]/50 font-medium uppercase tracking-wide">Date</p>
              <p className="text-sm font-bold">{displayDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-[#12122A]/50 font-medium uppercase tracking-wide">Heure</p>
              <p className="text-sm font-bold">{displayTime}</p>
            </div>
          </div>

          {(event.location || event.city) && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#12122A]/50 font-medium uppercase tracking-wide">Lieu</p>
                {event.location && <p className="text-sm font-bold truncate">{event.location}</p>}
                {event.city && <p className="text-xs text-[#12122A]/50">{event.city}</p>}
              </div>
              <button
                onClick={() => showToast('🚧 Carte bientôt disponible')}
                className="flex items-center gap-1 text-primary text-xs font-semibold shrink-0 hover:underline"
              >
                Voir sur la carte
                <ExternalLink size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-5">
          <h2 className="text-base font-extrabold mb-3">À propos</h2>
          <div className="flex flex-col gap-3">
            {descriptionParagraphs.map((para, i) => (
              <p key={i} className="text-sm text-[#12122A]/70 leading-relaxed">{para}</p>
            ))}
          </div>
        </div>

        {/* Organizer */}
        <div className="mb-6">
          <h2 className="text-base font-extrabold mb-3">Organisateur</h2>
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
            >
              {orgInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Organisateur Nexa Pass</p>
              <p className="text-xs text-[#12122A]/50">Organisateur vérifié ✓</p>
            </div>
            <button
              onClick={() => showToast('🚧 Profil organisateur bientôt disponible')}
              className="w-8 h-8 rounded-full bg-[#F4F4FB] flex items-center justify-center text-[#12122A]/40 hover:text-[#12122A] transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Ticket selection */}
        <div>
          <h2 className="text-base font-extrabold mb-3">Réserver</h2>

          {/* Type selector */}
          <div className="flex flex-col gap-2 mb-3">
            {TICKET_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedTypeId(type.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedTypeId === type.id
                    ? 'border-primary bg-primary/5'
                    : 'border-[#E5E7EB] bg-white hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selectedTypeId === type.id ? 'border-primary' : 'border-[#D1D5DB]'
                  }`}>
                    {selectedTypeId === type.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold">{type.name}</p>
                    <p className="text-xs text-[#12122A]/40">{type.desc}</p>
                  </div>
                </div>
                <p className="text-sm font-extrabold text-primary shrink-0 ml-3">
                  {type.price.toLocaleString('fr-FR')} F
                </p>
              </button>
            ))}
          </div>

          {/* Quantity selector — shown only after a type is selected */}
          {selectedTypeId && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-bold">Quantité</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full bg-[#F4F4FB] border border-[#E5E7EB] flex items-center justify-center text-[#12122A]/60 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Minus size={14} />
                </button>
                <span className="text-lg font-extrabold w-5 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white hover:opacity-90 transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed footer — z-[60] places it above BottomNav (z-50) and Sidebar (z-40) ── */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:sticky md:bottom-0 md:left-auto md:translate-x-0 md:max-w-none bg-white/95 backdrop-blur-xl border-t border-[#E5E7EB] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] px-5 pt-4 z-[60]"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {selectedTypeId && (() => {
          const sel = TICKET_TYPES.find((t) => t.id === selectedTypeId)
          if (!sel) return null
          return (
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs text-[#12122A]/45 font-medium">
                {sel.name} × {quantity}
              </p>
              <p className="text-base font-extrabold text-primary">
                {(sel.price * quantity).toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          )
        })()}
        <button
          onClick={() => {
            if (!selectedTypeId) {
              showToast('Sélectionne un type de billet pour continuer')
              return
            }
            const sel = TICKET_TYPES.find((t) => t.id === selectedTypeId)
            if (!sel) return
            navigate('/checkout', {
              state: {
                eventId: event.id,
                eventTitle: event.title,
                eventDate: event.date,
                eventLocation: event.location,
                eventCity: event.city,
                eventCoverUrl: event.cover_url,
                category: sel.name,
                unitPrice: sel.price,
                quantity,
              },
            })
          }}
          className="w-full h-14 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          {selectedTypeId ? 'Réserver maintenant' : 'Sélectionne un billet'}
        </button>
      </div>
    </div>
  )
}
