import { useState } from 'react'
import {
  ArrowLeft, Heart, Calendar, Clock, MapPin, ExternalLink,
  ChevronRight, Minus, Plus,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'

interface Ticket {
  id: string
  name: string
  description: string
  price: number
  stock: number
}

interface EventData {
  category: string
  title: string
  subtitle: string
  date: string
  time: string
  venue: string
  address: string
  description: string[]
  organizer: { name: string; initials: string }
  popularity: number
  imageUrl: string
  tickets: Ticket[]
}

const MOCK_EVENTS: Record<string, EventData> = {
  '1': {
    category: 'Sport',
    title: 'Derby de Brazzaville',
    subtitle: 'Le choc des titans du football congolais',
    date: 'Samedi 15 Juillet 2025',
    time: '16h00',
    venue: 'Stade Alphonse Massamba-Débat',
    address: 'Brazzaville, Congo',
    description: [
      "Préparez-vous pour le plus grand rendez-vous sportif de l'année au Congo ! Le Derby de Brazzaville oppose les deux clubs les plus emblématiques de la capitale dans une atmosphère électrisante.",
      "Cette confrontation légendaire entre l'ASEC Congo et les Diables Noirs promet des émotions fortes et un spectacle de qualité, sous les yeux de milliers de supporters passionnés.",
      "Ne manquez pas cet événement historique. Réservez vos places dès maintenant et vivez la magie du football congolais en direct.",
    ],
    organizer: { name: 'Fédération Congolaise de Football', initials: 'FC' },
    popularity: 1240,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
    tickets: [
      { id: 'pelouse', name: 'Pelouse', description: 'Accès zone pelouse, place debout', price: 1500, stock: 80 },
      { id: 'tribune', name: 'Tribune', description: 'Place assise en tribune couverte', price: 2000, stock: 45 },
      { id: 'vip', name: 'VIP', description: "Tribune VIP avec cocktail d'accueil", price: 8000, stock: 12 },
    ],
  },
  '2': {
    category: 'Concert',
    title: 'Nuit Jazz du Congo',
    subtitle: 'Une soirée musicale inoubliable',
    date: 'Vendredi 22 Août 2025',
    time: '20h00',
    venue: 'Palais des Congrès',
    address: 'Brazzaville, Congo',
    description: [
      "La Nuit Jazz du Congo réunit les plus grands talents de la musique jazz africaine contemporaine pour une soirée mémorable au cœur de Brazzaville.",
      "Au programme : performances live époustouflantes, fusions musicales entre jazz traditionnel et rythmes afro, ambiance feutrée et élégante tout au long de la nuit.",
      "Un voyage sonore unique qui célèbre l'héritage musical du Congo et son rayonnement international.",
    ],
    organizer: { name: 'Association Jazz Congo', initials: 'JC' },
    popularity: 892,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
    tickets: [
      { id: 'early', name: 'Early Bird', description: 'Tarif préférentiel — quantité limitée', price: 3500, stock: 5 },
      { id: 'standard', name: 'Standard', description: 'Accès salle principale, place libre', price: 5000, stock: 120 },
      { id: 'premium', name: 'Premium', description: 'Place assise en première zone', price: 10000, stock: 30 },
    ],
  },
  '3': {
    category: 'VIP',
    title: 'Soirée Prestige Brazza',
    subtitle: 'Une expérience exclusive et raffinée',
    date: 'Samedi 6 Septembre 2025',
    time: '21h00',
    venue: 'Hotel Ledger Plaza',
    address: 'Avenue des 3 Martyrs, Brazzaville',
    description: [
      "La Soirée Prestige Brazza est l'événement incontournable de la saison pour les personnalités et les amateurs d'expériences d'exception.",
      "Au menu : cocktails de bienvenue, buffet gastronomique, animation musicale live par les meilleurs DJ de la ville, et performances artistiques exclusives dans le cadre luxueux du Ledger Plaza.",
      "Places extrêmement limitées. Dress code : tenue de soirée obligatoire. Réservez maintenant pour ne pas manquer cette nuit unique.",
    ],
    organizer: { name: 'Brazza Events Premium', initials: 'BP' },
    popularity: 456,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg',
    tickets: [
      { id: 'prestige', name: 'Prestige', description: 'Accès soirée + buffet + cocktail', price: 25000, stock: 20 },
      { id: 'table', name: 'Table VIP', description: 'Table privée pour 4 personnes', price: 80000, stock: 5 },
    ],
  },
  '4': {
    category: 'Cinéma',
    title: 'Festival du Film Africain',
    subtitle: 'Le meilleur du cinéma africain contemporain',
    date: 'Du 10 au 14 Octobre 2025',
    time: 'Dès 14h00',
    venue: 'Ciné Vog',
    address: 'Centre-ville, Brazzaville',
    description: [
      "Le Festival du Film Africain de Brazzaville célèbre la richesse et la diversité du cinéma africain. Pendant 5 jours, découvrez les œuvres les plus marquantes des cinéastes du continent.",
      "Projections, débats avec les réalisateurs, ateliers de formation cinématographique et rencontres professionnelles sont au programme de cette édition.",
      "Une occasion unique de soutenir le 7ème art africain et de découvrir des histoires authentiques racontées par des voix du continent.",
    ],
    organizer: { name: 'Institut Français du Congo', initials: 'IF' },
    popularity: 678,
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
    tickets: [
      { id: 'seance', name: 'Séance unique', description: 'Accès à une projection au choix', price: 3000, stock: 60 },
      { id: 'pass3', name: 'Pass 3 jours', description: 'Accès illimité sur 3 jours', price: 7500, stock: 25 },
      { id: 'pass5', name: 'Pass Complet', description: 'Accès illimité sur les 5 jours', price: 12000, stock: 10 },
    ],
  },
}

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA'
}

export function EventDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showToast } = useToast()

  const event = (id && MOCK_EVENTS[id]) ? MOCK_EVENTS[id] : MOCK_EVENTS['1']

  const [liked, setLiked] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>(
    () => Object.fromEntries(event.tickets.map((t) => [t.id, 0]))
  )

  const updateQty = (ticketId: string, delta: number) => {
    setQuantities((prev) => {
      const ticket = event.tickets.find((t) => t.id === ticketId)!
      const next = Math.max(0, Math.min((prev[ticketId] ?? 0) + delta, ticket.stock))
      return { ...prev, [ticketId]: next }
    })
  }

  const total = event.tickets.reduce((sum, t) => sum + t.price * (quantities[t.id] ?? 0), 0)
  const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0)

  const handleReserve = () => {
    if (totalQty === 0) {
      showToast('Sélectionne au moins un billet')
      return
    }
    showToast('🚧 Paiement bientôt disponible')
  }

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Hero image ── */}
      <div className="relative w-full h-[280px] overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top controls */}
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

        {/* Category badge */}
        <div className="absolute bottom-5 left-5">
          <span className="bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {event.category}
          </span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="px-5 pt-5 pb-[100px] md:pb-8">

        {/* Title + popularity */}
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight mb-1">{event.title}</h1>
          <p className="text-sm text-[#12122A]/60 mb-3">{event.subtitle}</p>
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-semibold text-orange-600">
              {event.popularity.toLocaleString('fr-FR')} personnes intéressées
            </span>
          </div>
        </div>

        {/* Date / time / venue card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm mb-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-[#12122A]/50 font-medium uppercase tracking-wide">Date</p>
              <p className="text-sm font-bold">{event.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-[#12122A]/50 font-medium uppercase tracking-wide">Heure</p>
              <p className="text-sm font-bold">{event.time}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#12122A]/50 font-medium uppercase tracking-wide">Lieu</p>
              <p className="text-sm font-bold truncate">{event.venue}</p>
              <p className="text-xs text-[#12122A]/50">{event.address}</p>
            </div>
            <button
              onClick={() => showToast('🚧 Carte bientôt disponible')}
              className="flex items-center gap-1 text-primary text-xs font-semibold shrink-0 hover:underline"
            >
              Voir sur la carte
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h2 className="text-base font-extrabold mb-3">À propos</h2>
          <div className="flex flex-col gap-3">
            {event.description.map((para, i) => (
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
              {event.organizer.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{event.organizer.name}</p>
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

        {/* Ticket section */}
        <div>
          <h2 className="text-base font-extrabold mb-3">Choisir mes billets</h2>
          <div className="flex flex-col gap-3">
            {event.tickets.map((ticket) => {
              const qty = quantities[ticket.id] ?? 0
              const lowStock = ticket.stock <= 15
              return (
                <div
                  key={ticket.id}
                  className={`bg-white rounded-2xl p-4 border shadow-sm transition-all duration-200 ${
                    qty > 0
                      ? 'border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
                      : 'border-[#E5E7EB]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-extrabold">{ticket.name}</p>
                        {lowStock && (
                          <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Plus que {ticket.stock} places !
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#12122A]/50 leading-relaxed">{ticket.description}</p>
                    </div>
                    <p className="text-sm font-extrabold text-primary shrink-0 whitespace-nowrap">
                      {formatPrice(ticket.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F4F4FB]">
                    <p className="text-xs text-[#12122A]/40">{ticket.stock} places dispo.</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQty(ticket.id, -1)}
                        disabled={qty === 0}
                        className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#12122A] disabled:opacity-25 transition-all hover:border-primary hover:text-primary active:scale-90"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center text-sm font-bold tabular-nums">{qty}</span>
                      <button
                        onClick={() => updateQty(ticket.id, 1)}
                        disabled={qty >= ticket.stock}
                        className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#12122A] disabled:opacity-25 transition-all hover:border-primary hover:text-primary active:scale-90"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Fixed footer ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:sticky md:bottom-0 md:left-auto md:translate-x-0 md:max-w-none bg-white/95 backdrop-blur-xl border-t border-[#E5E7EB] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] px-5 py-4 z-30">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-[11px] text-[#12122A]/50 font-medium uppercase tracking-wide">Total</p>
            <p className="text-xl font-extrabold text-[#12122A] leading-tight">
              {total > 0 ? formatPrice(total) : <span className="text-[#12122A]/25">—</span>}
            </p>
          </div>
          <button
            onClick={handleReserve}
            className="flex-1 h-14 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            {totalQty > 0
              ? `Réserver ${totalQty} billet${totalQty > 1 ? 's' : ''}`
              : 'Réserver maintenant'}
          </button>
        </div>
      </div>
    </div>
  )
}
