import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Search, X, Calendar, MapPin, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { BottomNav } from '../components/ui/BottomNav'

// ── Image aliases ─────────────────────────────────────────────────────────────

const IMG_CONCERT = 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg'
const IMG_SPORT   = 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExploreEvent {
  id: number
  category: string
  title: string
  venue: string
  city: string
  date: string
  dateIso: string
  time: string
  price: number
  popularity: number
  imageUrl: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ALL_EVENTS: ExploreEvent[] = [
  // Concerts
  { id: 10, category: 'Concert', title: 'Fally Ipupa Live à Brazza', venue: 'Palais des Congrès', city: 'Brazzaville', date: 'Sam. 18 Juil. 2026', dateIso: '2026-07-18', time: '21h00', price: 10000, popularity: 2341, imageUrl: IMG_CONCERT },
  { id: 11, category: 'Concert', title: 'Nuit R&B Brazzaville', venue: 'Club Émeraude', city: 'Brazzaville', date: 'Ven. 12 Juin 2026', dateIso: '2026-06-12', time: '22h00', price: 5000, popularity: 987, imageUrl: IMG_SPORT },
  { id: 12, category: 'Concert', title: 'Festival des Grands Lacs', venue: 'Stade Éboué', city: 'Brazzaville', date: 'Sam. 8 Août 2026', dateIso: '2026-08-08', time: '18h00', price: 7500, popularity: 1456, imageUrl: IMG_CONCERT },
  { id: 13, category: 'Concert', title: 'Soirée Afrobeats Pointe-Noire', venue: 'Espace Samba', city: 'Pointe-Noire', date: 'Sam. 27 Juin 2026', dateIso: '2026-06-27', time: '21h00', price: 6000, popularity: 743, imageUrl: IMG_SPORT },

  // Sport
  { id: 20, category: 'Sport', title: 'Derby de Brazzaville', venue: 'Stade Massamba-Débat', city: 'Brazzaville', date: 'Ven. 5 Juin 2026', dateIso: '2026-06-05', time: '16h00', price: 2000, popularity: 1240, imageUrl: IMG_SPORT },
  { id: 21, category: 'Sport', title: 'Marathon de Brazzaville', venue: 'Corniche de Brazzaville', city: 'Brazzaville', date: 'Dim. 26 Juil. 2026', dateIso: '2026-07-26', time: '07h00', price: 0, popularity: 654, imageUrl: IMG_CONCERT },
  { id: 22, category: 'Sport', title: 'Tournoi de Basketball CNSS', venue: 'Salle INJS', city: 'Brazzaville', date: 'Sam. 20 Juin 2026', dateIso: '2026-06-20', time: '14h00', price: 1000, popularity: 432, imageUrl: IMG_SPORT },
  { id: 23, category: 'Sport', title: 'Open de Tennis Côte Sauvage', venue: 'Club Tennis', city: 'Pointe-Noire', date: 'Sam. 11 Juil. 2026', dateIso: '2026-07-11', time: '09h00', price: 0, popularity: 289, imageUrl: IMG_CONCERT },

  // Culture
  { id: 30, category: 'Culture', title: 'Expo Art Contemporain Congolais', venue: 'Musée National', city: 'Brazzaville', date: 'Jeu. 11 Juin 2026', dateIso: '2026-06-11', time: '10h00', price: 1500, popularity: 312, imageUrl: IMG_CONCERT },
  { id: 31, category: 'Culture', title: 'Soirée Littéraire Congo Écrit', venue: 'Institut Français', city: 'Brazzaville', date: 'Mar. 23 Juin 2026', dateIso: '2026-06-23', time: '18h30', price: 0, popularity: 225, imageUrl: IMG_SPORT },
  { id: 32, category: 'Culture', title: 'Théâtre Molière en Lingala', venue: 'Théâtre de Verdure', city: 'Brazzaville', date: 'Sam. 4 Juil. 2026', dateIso: '2026-07-04', time: '19h00', price: 2500, popularity: 387, imageUrl: IMG_CONCERT },
  { id: 33, category: 'Culture', title: 'Semaine de la Mode Brazza', venue: 'CCI Congo', city: 'Brazzaville', date: 'Ven. 17 Oct. 2026', dateIso: '2026-10-17', time: '16h00', price: 5000, popularity: 512, imageUrl: IMG_SPORT },

  // VIP
  { id: 40, category: 'VIP', title: 'Brazza Vibe Fest', venue: 'Stade Éboué', city: 'Brazzaville', date: 'Sam. 23 Mai 2026', dateIso: '2026-05-23', time: '20h00', price: 15000, popularity: 1823, imageUrl: IMG_CONCERT },
  { id: 41, category: 'VIP', title: 'Soirée Prestige Hotel Ledger', venue: 'Hotel Ledger Plaza', city: 'Brazzaville', date: 'Sam. 6 Sept. 2026', dateIso: '2026-09-06', time: '21h00', price: 25000, popularity: 456, imageUrl: IMG_SPORT },
  { id: 42, category: 'VIP', title: 'Gala de Charité Brazzaville', venue: 'Sofitel Brazza', city: 'Brazzaville', date: 'Sam. 11 Juil. 2026', dateIso: '2026-07-11', time: '19h00', price: 50000, popularity: 389, imageUrl: IMG_CONCERT },

  // Cinéma
  { id: 50, category: 'Cinéma', title: 'Festival du Film Africain', venue: 'Ciné Vog', city: 'Brazzaville', date: 'Ven. 9 Oct. 2026', dateIso: '2026-10-09', time: '14h00', price: 3000, popularity: 678, imageUrl: IMG_SPORT },
  { id: 51, category: 'Cinéma', title: 'Ciné en Plein Air Pointe-Noire', venue: 'Plage de Songolo', city: 'Pointe-Noire', date: 'Sam. 27 Juin 2026', dateIso: '2026-06-27', time: '20h00', price: 2000, popularity: 512, imageUrl: IMG_CONCERT },
  { id: 52, category: 'Cinéma', title: 'Avant-Première Film Congolais', venue: 'Ciné Vog', city: 'Brazzaville', date: 'Ven. 3 Juil. 2026', dateIso: '2026-07-03', time: '19h30', price: 3500, popularity: 445, imageUrl: IMG_SPORT },

  // Showcases
  { id: 60, category: 'Showcase', title: 'Comedy Night Brazzaville', venue: 'Le New Palace', city: 'Brazzaville', date: 'Sam. 13 Juin 2026', dateIso: '2026-06-13', time: '21h00', price: 5000, popularity: 734, imageUrl: IMG_SPORT },
  { id: 61, category: 'Showcase', title: 'DJ Afro House Night', venue: 'Club XY Brazzaville', city: 'Brazzaville', date: 'Ven. 19 Juin 2026', dateIso: '2026-06-19', time: '23h00', price: 8000, popularity: 891, imageUrl: IMG_CONCERT },
  { id: 62, category: 'Showcase', title: 'Battle de Danse Urbaine', venue: 'Salle omnisports INJS', city: 'Brazzaville', date: 'Sam. 25 Juil. 2026', dateIso: '2026-07-25', time: '16h00', price: 2000, popularity: 567, imageUrl: IMG_SPORT },

  // Festivals
  { id: 70, category: 'Festival', title: 'Festival des Arts du Congo', venue: 'Centre Culturel Français', city: 'Brazzaville', date: 'Du 1 au 5 Août 2026', dateIso: '2026-08-01', time: 'Dès 10h00', price: 3000, popularity: 1102, imageUrl: IMG_CONCERT },
  { id: 71, category: 'Festival', title: 'Ponton Fest Pointe-Noire', venue: "Ponton de l'Agip", city: 'Pointe-Noire', date: 'Sam. 15 Août 2026', dateIso: '2026-08-15', time: '16h00', price: 6000, popularity: 876, imageUrl: IMG_SPORT },
  { id: 72, category: 'Festival', title: 'Brazza Urban Culture Fest', venue: 'Place de la République', city: 'Brazzaville', date: 'Du 3 au 5 Oct. 2026', dateIso: '2026-10-03', time: 'Dès 12h00', price: 4000, popularity: 934, imageUrl: IMG_CONCERT },
]

// ── Filter configs ────────────────────────────────────────────────────────────

const CATEGORY_PILLS = ['Tous', 'Concert', 'Sport', 'Culture', 'VIP', 'Cinéma', 'Showcase', 'Festival']

const DATE_FILTERS = [
  { id: 'today',   label: "Aujourd'hui" },
  { id: 'weekend', label: 'Ce weekend' },
  { id: 'week',    label: 'Cette semaine' },
  { id: 'month',   label: 'Ce mois' },
]

const CITY_FILTERS = [
  { id: 'Toutes',         label: '🗺️ Toutes' },
  { id: 'Brazzaville',    label: '🏙️ Brazzaville' },
  { id: 'Pointe-Noire',   label: '🌊 Pointe-Noire' },
]

const CATEGORY_SECTIONS = [
  { key: 'Concert',   label: '🎵 Concerts' },
  { key: 'Sport',     label: '⚽ Sport' },
  { key: 'Culture',   label: '🎨 Culture & Art' },
  { key: 'VIP',       label: '✨ VIP & Soirées' },
  { key: 'Showcase',  label: '🎤 Showcases' },
  { key: 'Festival',  label: '🎪 Festivals' },
  { key: 'Cinéma',    label: '🎬 Cinéma' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`
}

function isInDateRange(dateIso: string, filter: string): boolean {
  const date = new Date(dateIso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (filter === 'today') {
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    return date >= today && date < tomorrow
  }
  if (filter === 'weekend') {
    const day = today.getDay()
    const toSat = (6 - day + 7) % 7 || 7
    const sat = new Date(today); sat.setDate(today.getDate() + toSat)
    const mon = new Date(sat);   mon.setDate(sat.getDate() + 2)
    return date >= sat && date < mon
  }
  if (filter === 'week') {
    const end = new Date(today); end.setDate(today.getDate() + 7)
    return date >= today && date <= end
  }
  if (filter === 'month') {
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }
  return true
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TrendCard({ event, onNavigate }: { event: ExploreEvent; onNavigate: () => void }) {
  return (
    <button onClick={onNavigate} className="shrink-0 w-[160px] text-left">
      <div className="relative h-[210px] rounded-2xl overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          🔥 {event.popularity.toLocaleString('fr-FR')}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-xs font-extrabold leading-tight line-clamp-2 mb-1">{event.title}</p>
          <p className="text-white/60 text-[10px] mb-0.5">{event.date}</p>
          <p className="text-[10px] font-bold" style={{ color: '#c084fc' }}>{formatPrice(event.price)}</p>
        </div>
      </div>
    </button>
  )
}

function HorizCard({ event, onNavigate }: { event: ExploreEvent; onNavigate: () => void }) {
  return (
    <button
      onClick={onNavigate}
      className="shrink-0 w-[210px] text-left bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="relative h-[115px]">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 bg-primary/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {event.category}
        </span>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-extrabold leading-tight line-clamp-1 mb-1.5">{event.title}</h4>
        <div className="flex items-center gap-1 text-[11px] text-[#12122A]/55 mb-0.5">
          <Calendar size={10} className="shrink-0" />
          <span className="truncate">{event.date}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#12122A]/55 mb-2">
          <MapPin size={10} className="shrink-0" />
          <span className="truncate">{event.venue}</span>
        </div>
        <p className="text-sm font-extrabold text-primary">{formatPrice(event.price)}</p>
      </div>
    </button>
  )
}

function SearchResultCard({ event, onNavigate }: { event: ExploreEvent; onNavigate: () => void }) {
  return (
    <button
      onClick={onNavigate}
      className="bg-white rounded-2xl p-3 flex gap-3 items-center border border-[#E5E7EB] shadow-sm text-left w-full transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
    >
      <img src={event.imageUrl} alt={event.title} className="w-[72px] h-[72px] rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-primary text-[11px] font-bold mb-0.5">{event.category}</p>
        <h4 className="font-bold text-sm leading-tight line-clamp-1 mb-1">{event.title}</h4>
        <div className="flex items-center gap-1 text-[11px] text-[#12122A]/55 mb-0.5">
          <Calendar size={10} className="shrink-0" />
          <span className="truncate">{event.date}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-[#12122A]/55">
          <MapPin size={10} className="shrink-0" />
          <span className="truncate">{event.venue} · {event.city}</span>
        </div>
      </div>
      <p className="text-sm font-extrabold text-primary whitespace-nowrap shrink-0">
        {formatPrice(event.price)}
      </p>
    </button>
  )
}

function FilterPill({
  active, label, onClick,
}: {
  active: boolean; label: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 ${
        active
          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm'
          : 'bg-white text-[#12122A]/70 border border-[#E5E7EB] hover:border-primary/30'
      }`}
    >
      {label}
    </button>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function Explorer() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const [searchValue, setSearchValue]       = useState('')
  const [searchFocused, setSearchFocused]   = useState(false)
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [activeDateFilter, setActiveDateFilter] = useState<string | null>(null)
  const [activeCity, setActiveCity]         = useState('Toutes')
  const [isSearchLoading, setIsSearchLoading] = useState(false)
  const [displayedSearch, setDisplayedSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Debounced search (400ms)
  useEffect(() => {
    if (!searchValue.trim()) {
      setDisplayedSearch('')
      setIsSearchLoading(false)
      return
    }
    setIsSearchLoading(true)
    const t = setTimeout(() => {
      setDisplayedSearch(searchValue)
      setIsSearchLoading(false)
    }, 400)
    return () => clearTimeout(t)
  }, [searchValue])

  const toggleDate = (id: string) =>
    setActiveDateFilter((prev) => (prev === id ? null : id))

  // Base filtered pool (category + date + city)
  const filteredPool = useMemo(
    () =>
      ALL_EVENTS.filter((e) => {
        const matchCat  = activeCategory === 'Tous' || e.category === activeCategory
        const matchDate = !activeDateFilter || isInDateRange(e.dateIso, activeDateFilter)
        const matchCity = activeCity === 'Toutes' || e.city === activeCity
        return matchCat && matchDate && matchCity
      }),
    [activeCategory, activeDateFilter, activeCity]
  )

  const trending = useMemo(
    () => [...filteredPool].sort((a, b) => b.popularity - a.popularity).slice(0, 8),
    [filteredPool]
  )

  const categoryGroups = useMemo(
    () =>
      CATEGORY_SECTIONS.map((sec) => ({
        ...sec,
        events: filteredPool.filter((e) => e.category === sec.key),
      })).filter((g) => g.events.length > 0),
    [filteredPool]
  )

  // Suggestions (instant, from ALL events)
  const suggestions = useMemo(() => {
    if (!searchValue.trim()) return []
    const q = searchValue.toLowerCase()
    return ALL_EVENTS.filter(
      (e) => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [searchValue])

  // Search results (debounced, respect filters)
  const searchResults = useMemo(() => {
    if (!displayedSearch.trim()) return []
    const q = displayedSearch.toLowerCase()
    return filteredPool.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q)
    )
  }, [displayedSearch, filteredPool])

  const isSearchMode = displayedSearch.trim().length > 0

  const goToEvent = useCallback(
    (id: number) => navigate(`/event/${id}`),
    [navigate]
  )

  return (
    <div
      className="bg-[#F4F4FB] text-[#12122A] min-h-screen pb-24 md:pb-10"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-12 md:pt-8 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight leading-tight">Explorer</h1>
        <p className="text-sm text-[#12122A]/50 mt-0.5">Découvre les meilleurs événements</p>
      </div>

      {/* ── Search bar ── */}
      <div className="px-5 mb-4 relative z-20">
        <div
          className={`bg-white rounded-2xl flex items-center gap-3 px-4 py-3.5 border transition-all duration-200 ${
            searchFocused
              ? 'border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
              : 'border-[#E5E7EB] shadow-sm'
          }`}
        >
          <Search size={18} className={searchFocused ? 'text-primary' : 'text-[#12122A]/40'} />
          <input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Événement, artiste, lieu..."
            className="flex-1 bg-transparent text-sm text-[#12122A] outline-none placeholder-[#12122A]/35 font-medium"
          />
          {searchValue ? (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setSearchValue(''); searchRef.current?.focus() }}
              className="text-[#12122A]/40 hover:text-[#12122A]/70 transition-colors"
            >
              <X size={16} />
            </button>
          ) : (
            <button
              onClick={wip}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
            >
              <SlidersHorizontal size={14} className="text-white" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {searchFocused && searchValue.trim() && suggestions.length > 0 && (
          <div className="absolute top-full left-5 right-5 mt-1 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-30 overflow-hidden">
            {suggestions.map((event, idx) => (
              <button
                key={event.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setSearchValue(event.title); goToEvent(event.id) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F4F4FB] transition-colors ${
                  idx < suggestions.length - 1 ? 'border-b border-[#E5E7EB]' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{event.title}</p>
                  <p className="text-xs text-[#12122A]/50 truncate">{event.category} · {event.venue}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="pl-5 mb-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1 pr-5">
        {CATEGORY_PILLS.map((cat) => (
          <FilterPill
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      <div className="pl-5 mb-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1 pr-5">
        {DATE_FILTERS.map(({ id, label }) => (
          <FilterPill
            key={id}
            label={label}
            active={activeDateFilter === id}
            onClick={() => toggleDate(id)}
          />
        ))}
        <button
          onClick={wip}
          className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border border-dashed border-[#E5E7EB] text-[#12122A]/40 shrink-0 hover:border-primary/30 hover:text-primary/70 transition-all"
        >
          📅 Choisir une date
        </button>
      </div>

      <div className="pl-5 mb-6 flex gap-2 overflow-x-auto scrollbar-hide pb-1 pr-5">
        {CITY_FILTERS.map(({ id, label }) => (
          <FilterPill
            key={id}
            label={label}
            active={activeCity === id}
            onClick={() => setActiveCity(id)}
          />
        ))}
      </div>

      {/* ── Content ── */}

      {/* Loader */}
      {isSearchLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div
            className="w-8 h-8 rounded-full border-[3px] animate-spin"
            style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-[#12122A]/50 font-medium">Recherche en cours…</p>
        </div>
      )}

      {/* Search results */}
      {!isSearchLoading && isSearchMode && (
        <div className="px-5">
          <p className="text-sm text-[#12122A]/50 font-medium mb-4">
            {searchResults.length > 0
              ? `${searchResults.length} résultat${searchResults.length > 1 ? 's' : ''} pour « ${displayedSearch} »`
              : `Aucun résultat pour « ${displayedSearch} »`}
          </p>
          {searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#E8E8F0] flex items-center justify-center mb-3">
                <Search size={22} className="text-[#12122A]/25" />
              </div>
              <h3 className="font-extrabold text-[#12122A] mb-1">Aucun résultat</h3>
              <p className="text-sm text-[#12122A]/50 max-w-[220px] leading-relaxed">
                Essaie un autre mot-clé ou modifie tes filtres.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2">
              {searchResults.map((event) => (
                <SearchResultCard key={event.id} event={event} onNavigate={() => goToEvent(event.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Discover view */}
      {!isSearchLoading && !isSearchMode && (
        <>
          {/* Trending section */}
          {trending.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 px-5 mb-4">
                <TrendingUp size={18} className="text-orange-500" />
                <h2 className="text-base font-extrabold">Hype du moment</h2>
              </div>
              <div className="pl-5 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {trending.map((event) => (
                  <TrendCard key={event.id} event={event} onNavigate={() => goToEvent(event.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state when all filters combine to nothing */}
          {trending.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
              <div className="w-14 h-14 rounded-full bg-[#E8E8F0] flex items-center justify-center mb-3">
                <Search size={22} className="text-[#12122A]/25" />
              </div>
              <h3 className="font-extrabold text-[#12122A] mb-1">Aucun événement</h3>
              <p className="text-sm text-[#12122A]/50 max-w-[220px] leading-relaxed mb-5">
                Aucun événement ne correspond à ces filtres pour l'instant.
              </p>
              <button
                onClick={() => { setActiveCategory('Tous'); setActiveDateFilter(null); setActiveCity('Toutes') }}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* Category sections */}
          {categoryGroups.map((group) => (
            <div key={group.key} className="mb-8">
              <div className="flex justify-between items-center px-5 mb-4">
                <h2 className="text-base font-extrabold">{group.label}</h2>
                <button onClick={wip} className="text-primary text-sm font-semibold">
                  Voir tout
                </button>
              </div>
              <div className="pl-5 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {group.events.map((event) => (
                  <HorizCard key={event.id} event={event} onNavigate={() => goToEvent(event.id)} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <BottomNav />
    </div>
  )
}
