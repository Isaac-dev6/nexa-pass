import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { Search, X, Calendar, MapPin, SlidersHorizontal, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useEvents } from '../hooks/useEvents'
import type { SupabaseEvent } from '../hooks/useEvents'
import { BottomNav } from '../components/ui/BottomNav'

// ── Constants ─────────────────────────────────────────────────────────────────

const FALLBACK_IMG = 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExploreEvent {
  id: string
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

// ── Mapper ────────────────────────────────────────────────────────────────────

function toExploreEvent(e: SupabaseEvent): ExploreEvent {
  const d = e.date ? new Date(e.date) : null
  return {
    id: e.id,
    category: e.category ?? 'Concert',
    title: e.title,
    venue: e.location ?? '',
    city: e.city ?? 'Brazzaville',
    date: d
      ? d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      : 'Date à confirmer',
    dateIso: e.date ? e.date.split('T')[0] : '',
    time: d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '',
    price: 0,
    popularity: 0,
    imageUrl: e.cover_url ?? FALLBACK_IMG,
  }
}

// ── Filter configs ────────────────────────────────────────────────────────────

const CATEGORY_PILLS = ['Tous', 'Concert', 'Sport', 'Culture', 'VIP', 'Cinéma', 'Showcase', 'Festival']

const DATE_FILTERS = [
  { id: 'today',   label: "Aujourd'hui" },
  { id: 'weekend', label: 'Ce weekend' },
  { id: 'week',    label: 'Cette semaine' },
  { id: 'month',   label: 'Ce mois' },
]

const CITY_FILTERS = [
  { id: 'Toutes',       label: '🗺️ Toutes' },
  { id: 'Brazzaville',  label: '🏙️ Brazzaville' },
  { id: 'Pointe-Noire', label: '🌊 Pointe-Noire' },
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
  return price === 0 ? 'Voir les prix' : `${price.toLocaleString('fr-FR')} FCFA`
}

function isInDateRange(dateIso: string, filter: string): boolean {
  if (!dateIso) return true
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

// ── Skeletons ─────────────────────────────────────────────────────────────────

function TrendSkeleton() {
  return <div className="shrink-0 w-[160px] h-[210px] rounded-2xl bg-[#E8E8F0] animate-pulse" />
}

function HorizSkeleton() {
  return (
    <div className="shrink-0 w-[210px] rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden animate-pulse">
      <div className="h-[115px] bg-[#E8E8F0]" />
      <div className="p-3">
        <div className="h-4 w-3/4 bg-[#E8E8F0] rounded-full mb-2" />
        <div className="h-3 w-full bg-[#E8E8F0] rounded-full mb-1.5" />
        <div className="h-3 w-2/3 bg-[#E8E8F0] rounded-full mb-2" />
        <div className="h-4 w-1/3 bg-[#E8E8F0] rounded-full" />
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TrendCard({ event, onNavigate }: { event: ExploreEvent; onNavigate: () => void }) {
  return (
    <button onClick={onNavigate} className="shrink-0 w-[160px] text-left">
      <div className="relative h-[210px] rounded-2xl overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {event.category}
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
          <span className="truncate">{event.venue || event.city}</span>
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
  const { events: rawEvents, loading } = useEvents()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const [searchValue, setSearchValue]           = useState('')
  const [searchFocused, setSearchFocused]       = useState(false)
  const [activeCategory, setActiveCategory]     = useState('Tous')
  const [activeDateFilter, setActiveDateFilter] = useState<string | null>(null)
  const [activeCity, setActiveCity]             = useState('Toutes')
  const [isSearchLoading, setIsSearchLoading]   = useState(false)
  const [displayedSearch, setDisplayedSearch]   = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Map Supabase events once
  const allEvents = useMemo(() => rawEvents.map(toExploreEvent), [rawEvents])

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
      allEvents.filter((e) => {
        const matchCat  = activeCategory === 'Tous' || e.category === activeCategory
        const matchDate = !activeDateFilter || isInDateRange(e.dateIso, activeDateFilter)
        const matchCity = activeCity === 'Toutes' || e.city === activeCity
        return matchCat && matchDate && matchCity
      }),
    [allEvents, activeCategory, activeDateFilter, activeCity]
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

  // Suggestions (instant, from all events)
  const suggestions = useMemo(() => {
    if (!searchValue.trim()) return []
    const q = searchValue.toLowerCase()
    return allEvents
      .filter((e) => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q))
      .slice(0, 5)
  }, [searchValue, allEvents])

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
    (id: string) => navigate(`/event/${id}`),
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
                  <p className="text-xs text-[#12122A]/50 truncate">{event.category} · {event.venue || event.city}</p>
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

      {/* Initial data loading skeleton */}
      {loading && (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 px-5 mb-4">
              <div className="w-4 h-4 rounded-full bg-[#E8E8F0] animate-pulse" />
              <div className="h-4 w-28 bg-[#E8E8F0] rounded-full animate-pulse" />
            </div>
            <div className="pl-5 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {Array.from({ length: 4 }).map((_, i) => <TrendSkeleton key={i} />)}
            </div>
          </div>
          <div className="mb-8">
            <div className="flex justify-between items-center px-5 mb-4">
              <div className="h-4 w-28 bg-[#E8E8F0] rounded-full animate-pulse" />
            </div>
            <div className="pl-5 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {Array.from({ length: 3 }).map((_, i) => <HorizSkeleton key={i} />)}
            </div>
          </div>
        </>
      )}

      {/* Search loading spinner */}
      {!loading && isSearchLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div
            className="w-8 h-8 rounded-full border-[3px] animate-spin"
            style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-[#12122A]/50 font-medium">Recherche en cours…</p>
        </div>
      )}

      {/* Search results */}
      {!loading && !isSearchLoading && isSearchMode && (
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
      {!loading && !isSearchLoading && !isSearchMode && (
        <>
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
