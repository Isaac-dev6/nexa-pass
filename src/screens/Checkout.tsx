import { useState } from 'react'
import { ArrowLeft, CreditCard, Check, Smartphone, ShieldCheck } from 'lucide-react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CheckoutState {
  eventId: string
  eventTitle: string
  eventDate: string | null
  eventLocation: string | null
  eventCity: string | null
  eventCoverUrl: string | null
  category: string
  unitPrice: number
  quantity: number
}

type PaymentMethod = 'mtn' | 'airtel'

// ── Helpers ───────────────────────────────────────────────────────────────────

const FALLBACK_IMG = 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg'

function fmtDate(iso: string | null): string {
  if (!iso) return 'Date à confirmer'
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmt(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
}

// ── Payout method card ────────────────────────────────────────────────────────

function MethodCard({
  id, label, sub, logoText, logoBg, logoText2,
  active, onSelect,
}: {
  id: PaymentMethod; label: string; sub: string; logoText: string
  logoBg: string; logoText2: string; active: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex-1 flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all ${
        active
          ? `${id === 'mtn' ? 'border-yellow-400 bg-yellow-50' : 'border-red-400 bg-red-50'}`
          : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
      }`}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0"
        style={{ background: logoBg, color: logoText2 }}
      >
        {logoText}
      </div>
      <div className="text-center">
        <p className="text-xs font-extrabold">{label}</p>
        <p className="text-[10px] text-[#12122A]/40 mt-0.5">{sub}</p>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        active
          ? id === 'mtn'
            ? 'border-yellow-400 bg-yellow-400'
            : 'border-red-400 bg-red-400'
          : 'border-[#D1D5DB]'
      }`}>
        {active && <Check size={10} className={id === 'mtn' ? 'text-black' : 'text-white'} />}
      </div>
    </button>
  )
}

// ── Success overlay ───────────────────────────────────────────────────────────

function SuccessOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F4F4FB]">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
      >
        <Check size={44} className="text-white" />
      </div>
      <h2 className="text-2xl font-extrabold text-[#12122A] mb-2">Paiement réussi !</h2>
      <p className="text-sm text-[#12122A]/50 text-center px-8">
        Ton billet est généré. Redirection vers tes commandes…
      </p>
    </div>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()

  // Read state passed by EventDetail via navigate('/checkout', { state })
  const state = (location.state ?? null) as CheckoutState | null

  const [method, setMethod] = useState<PaymentMethod>('mtn')
  const [phone, setPhone] = useState('')
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  if (!state) return null

  const totalPrice = state.unitPrice * state.quantity

  async function handlePayment() {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9) {
      showToast('Entre un numéro de téléphone valide (+242 XX XXX XXXX)')
      return
    }
    if (!user) return

    setPaying(true)
    try {
      // Simulated payment delay (2 s)
      await new Promise<void>((r) => setTimeout(r, 2000))

      const qrCode = crypto.randomUUID()

      const { error } = await supabase.from('tickets').insert({
        event_id: state.eventId,
        user_id: user.id,
        category: state.category,
        quantity: state.quantity,
        total_price: totalPrice,
        status: 'upcoming',
        qr_code: qrCode,
      })

      if (error) {
        showToast(`Erreur: ${error.message}`)
        return
      }

      setPaid(true)
      await new Promise<void>((r) => setTimeout(r, 1600))
      showToast('🎉 Billet confirmé ! Retrouve-le dans tes commandes.')
      navigate('/orders', { replace: true })
    } finally {
      setPaying(false)
    }
  }

  // Guard: no state means user landed here directly (not from EventDetail)
  // Using declarative <Navigate> avoids the useEffect-then-redirect timing issue
  if (!state?.eventId) return <Navigate to="/explorer" replace />

  if (paid) return <SuccessOverlay />

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen pb-10"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 pt-12 md:pt-8 pb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shadow-sm hover:bg-[#F4F4FB] transition-colors shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Paiement</h1>
          <p className="text-xs text-[#12122A]/40 mt-0.5">Finalise ta commande</p>
        </div>
      </div>

      <div className="px-5 flex flex-col gap-6">

        {/* ── Order summary ── */}
        <div>
          <p className="text-[11px] font-bold text-[#12122A]/40 uppercase tracking-widest mb-2">Récapitulatif</p>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            {/* Miniature cover */}
            <div className="relative h-[110px]">
              <img
                src={state.eventCoverUrl ?? FALLBACK_IMG}
                alt={state.eventTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <h2 className="absolute bottom-3 left-4 right-4 text-white font-extrabold text-base leading-tight line-clamp-2">
                {state.eventTitle}
              </h2>
            </div>

            <div className="p-4">
              {state.eventDate && (
                <p className="text-xs text-[#12122A]/45 mb-4">{fmtDate(state.eventDate)}</p>
              )}

              {/* Perforation */}
              <div className="relative flex items-center mb-4">
                <div className="w-5 h-5 rounded-full bg-[#F4F4FB] shrink-0 -ml-6 z-10" />
                <div className="flex-1 border-t border-dashed border-[#E5E7EB]" />
                <div className="w-5 h-5 rounded-full bg-[#F4F4FB] shrink-0 -mr-6 z-10" />
              </div>

              {/* Line item */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-extrabold">{state.category}</p>
                  <p className="text-xs text-[#12122A]/40 mt-0.5">
                    {state.quantity} billet{state.quantity > 1 ? 's' : ''} × {fmt(state.unitPrice)}
                  </p>
                </div>
                <p className="text-sm font-extrabold text-primary">{fmt(state.unitPrice * state.quantity)}</p>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-[#F4F4FB]">
                <p className="text-sm font-bold text-[#12122A]/60">Total à payer</p>
                <p className="text-xl font-extrabold text-primary">{fmt(totalPrice)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Payment method ── */}
        <div>
          <p className="text-[11px] font-bold text-[#12122A]/40 uppercase tracking-widest mb-2">Mode de paiement</p>
          <div className="flex gap-3">
            <MethodCard
              id="mtn"
              label="MTN Money"
              sub="Mobile Money"
              logoText="MTN"
              logoBg="#FFCC00"
              logoText2="#000"
              active={method === 'mtn'}
              onSelect={() => setMethod('mtn')}
            />
            <MethodCard
              id="airtel"
              label="Airtel Money"
              sub="Mobile Money"
              logoText="Airtel"
              logoBg="#E3000E"
              logoText2="#fff"
              active={method === 'airtel'}
              onSelect={() => setMethod('airtel')}
            />
          </div>
        </div>

        {/* ── Phone number ── */}
        <div>
          <p className="text-[11px] font-bold text-[#12122A]/40 uppercase tracking-widest mb-2">
            Numéro {method === 'mtn' ? 'MTN' : 'Airtel'} Mobile Money
          </p>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-3 px-4 py-3.5">
            <span className="text-lg leading-none">🇨🇬</span>
            <span className="text-sm font-bold text-[#12122A]/50">+242</span>
            <div className="w-px h-5 bg-[#E5E7EB] shrink-0" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="06 XXX XXXX"
              className="flex-1 bg-transparent text-sm text-[#12122A] outline-none placeholder-[#12122A]/30 font-semibold"
            />
            <Smartphone size={16} className="text-[#12122A]/25 shrink-0" />
          </div>
          <p className="text-xs text-[#12122A]/35 mt-1.5 px-1">
            Un SMS de confirmation sera envoyé à ce numéro
          </p>
        </div>

        {/* ── Security notice ── */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
          <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
          <p className="text-xs text-emerald-700 font-semibold leading-relaxed">
            Paiement sécurisé — Ton billet QR est généré instantanément après confirmation
          </p>
        </div>

        {/* ── Pay button ── */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handlePayment}
            disabled={paying}
            className="w-full h-14 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            {paying ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Traitement en cours…
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Payer {fmt(totalPrice)}
              </>
            )}
          </button>
          <p className="text-center text-xs text-[#12122A]/25 pt-1">
            En continuant, tu acceptes les{' '}
            <span className="underline cursor-pointer">CGU Nexa Pass</span>
          </p>
        </div>

      </div>
    </div>
  )
}
