import { useState, useEffect } from 'react'
import {
  ArrowLeft, Heart, Calendar, Clock, MapPin, ExternalLink,
  ChevronRight, Ticket,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import type { SupabaseEvent } from '../hooks/useEvents'

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
      <div className="px-5 pt-5 pb-[100px] md:pb-8">

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

        {/* Ticket section — placeholder until tickets table is implemented */}
        <div>
          <h2 className="text-base font-extrabold mb-3">Réserver</h2>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-3">
              <Ticket size={28} className="text-primary/40" />
            </div>
            <p className="text-sm font-bold text-[#12122A]/60 mb-1">Billetterie bientôt disponible</p>
            <p className="text-xs text-[#12122A]/35 leading-relaxed max-w-[200px]">
              L'organisateur configure les catégories de billets.
            </p>
          </div>
        </div>
      </div>

      {/* ── Fixed footer ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:sticky md:bottom-0 md:left-auto md:translate-x-0 md:max-w-none bg-white/95 backdrop-blur-xl border-t border-[#E5E7EB] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] px-5 py-4 z-30">
        <button
          onClick={() => showToast('🚧 Paiement bientôt disponible')}
          className="w-full h-14 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          Réserver maintenant
        </button>
      </div>
    </div>
  )
}
