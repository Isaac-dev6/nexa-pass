import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, MapPin, Download, Share2, Ticket } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import type { SupabaseTicket } from '../hooks/useEvents'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return 'Date à confirmer'
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtTime(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase() ?? '').join('')
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TicketSkeleton() {
  return (
    <div className="bg-[#F4F4FB] min-h-screen px-5 pt-[80px]">
      <div className="bg-white rounded-3xl overflow-hidden animate-pulse">
        <div className="h-[180px] bg-[#E8E8F0]" />
        <div className="p-5 flex flex-col gap-3">
          <div className="h-6 w-3/4 bg-[#E8E8F0] rounded-full" />
          <div className="h-4 w-1/2 bg-[#E8E8F0] rounded-full" />
          <div className="h-4 w-2/3 bg-[#E8E8F0] rounded-full" />
          <div className="flex justify-center py-4">
            <div className="w-[190px] h-[190px] bg-[#E8E8F0] rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#E8E8F0] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Detail chip ───────────────────────────────────────────────────────────────

function DetailChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#F4F4FB] rounded-xl p-3">
      <p className="text-[10px] text-[#12122A]/40 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-extrabold leading-tight ${accent ? 'text-primary' : 'text-[#12122A]'}`}>
        {value}
      </p>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function TicketView() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [ticket, setTicket] = useState<SupabaseTicket | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { navigate('/orders', { replace: true }); return }
    let cancelled = false
    supabase
      .from('tickets')
      .select('*, events(id, title, date, location, city, cover_url)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) { navigate('/orders', { replace: true }); return }
        setTicket(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [id, navigate])

  if (loading) return <TicketSkeleton />
  if (!ticket) return null

  const event = ticket.events
  const displayDate = fmtDate(event?.date ?? null)
  const displayTime = fmtTime(event?.date ?? null)
  const fullName: string = user?.user_metadata?.full_name ?? 'Utilisateur'
  const initials = getInitials(fullName)
  const orderRef = `NXP-${ticket.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`
  const qrData = ticket.qr_code ? `NEXA-${ticket.qr_code}` : ticket.id

  async function handleShare() {
    const shareData = {
      title: `Mon billet — ${event?.title ?? 'Nexa Pass'}`,
      text: `J'ai un billet pour ${event?.title ?? 'cet événement'} ! Réf: ${orderRef}`,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(orderRef)
      showToast('Référence copiée dans le presse-papiers !')
    }
  }

  function handleDownload() {
    window.print()
  }

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen pb-10"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 pt-12 md:pt-8 pb-5">
        <button
          onClick={() => navigate('/orders')}
          className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm hover:bg-[#F4F4FB] transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Mon billet</h1>
          <p className="text-xs text-[#12122A]/40 mt-0.5">{orderRef}</p>
        </div>
      </div>

      <div className="px-5">
        {/* ── Physical ticket card ── */}
        <div
          id="ticket-print"
          className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden"
        >
          {/* Cover image */}
          <div className="relative h-[180px]">
            {event?.cover_url ? (
              <img src={event.cover_url} alt={event?.title} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full"
                style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Nexa badge top-left */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
              >
                <span className="text-white font-extrabold text-[10px]">N</span>
              </div>
              <span className="text-white/80 text-[11px] font-bold">Nexa Pass</span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h2 className="text-white font-extrabold text-xl leading-tight line-clamp-2 mb-0.5">
                {event?.title ?? 'Événement'}
              </h2>
              <p className="text-white/60 text-xs font-medium">
                {ticket.category}
              </p>
            </div>
          </div>

          {/* Date / venue */}
          <div className="px-5 pt-4 pb-2 flex flex-col gap-2">
            <div className="flex items-center gap-2.5 text-sm text-[#12122A]/65">
              <Calendar size={14} className="shrink-0 text-primary" />
              <span className="font-semibold">
                {displayDate}{displayTime ? ` · ${displayTime}` : ''}
              </span>
            </div>
            {(event?.location || event?.city) && (
              <div className="flex items-center gap-2.5 text-sm text-[#12122A]/65">
                <MapPin size={14} className="shrink-0 text-primary" />
                <span className="font-semibold truncate">
                  {[event?.location, event?.city].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Perforation separator */}
          <div className="relative flex items-center my-4">
            <div className="w-7 h-7 rounded-full bg-[#F4F4FB] shrink-0 -ml-3.5 z-10" />
            <div className="flex-1 border-t-2 border-dashed border-[#E5E7EB]" />
            <div className="w-7 h-7 rounded-full bg-[#F4F4FB] shrink-0 -mr-3.5 z-10" />
          </div>

          {/* QR code */}
          <div className="px-5 pb-5 flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-sm mb-3">
              {ticket.qr_code ? (
                <QRCodeSVG
                  value={qrData}
                  size={190}
                  level="H"
                  marginSize={1}
                  fgColor="#12122A"
                />
              ) : (
                <div className="w-[190px] h-[190px] flex flex-col items-center justify-center gap-3 text-[#12122A]/25">
                  <Ticket size={44} />
                  <p className="text-xs font-semibold text-center">QR code non disponible</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-[#12122A]/35 font-medium text-center mb-5">
              Présente ce code à l'entrée de l'événement
            </p>

            {/* Ticket detail chips */}
            <div className="w-full grid grid-cols-2 gap-2.5 mb-3">
              <DetailChip label="Catégorie"  value={ticket.category} />
              <DetailChip label="Quantité"   value={`${ticket.quantity} billet${ticket.quantity > 1 ? 's' : ''}`} />
              <DetailChip label="Référence"  value={orderRef} />
              <DetailChip label="Prix payé"  value={fmt(ticket.total_price)} accent />
            </div>

            {/* Buyer */}
            <div className="w-full bg-[#F4F4FB] rounded-xl p-3 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
              >
                {initials}
              </div>
              <div>
                <p className="text-[10px] text-[#12122A]/40 font-bold uppercase tracking-wide">Acheteur</p>
                <p className="text-sm font-extrabold">{fullName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            className="flex-1 py-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-sm font-bold flex items-center justify-center gap-2 text-[#12122A]/65 shadow-sm hover:border-primary/30 hover:text-primary transition-all active:scale-[0.98]"
          >
            <Download size={16} />
            Télécharger
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            <Share2 size={16} />
            Partager
          </button>
        </div>
      </div>

      {/* ── Print styles ── */}
      <style>{`
        @media print {
          body > *:not(#ticket-print) { display: none !important; }
          #ticket-print { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  )
}
