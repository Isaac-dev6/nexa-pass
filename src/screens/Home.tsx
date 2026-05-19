import { useState, useRef } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { BottomNav } from '../components/ui/BottomNav'
import { HeroCard } from '../components/home/HeroCard'
import { CategoryPills } from '../components/home/CategoryPills'
import { EventCard } from '../components/home/EventCard'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { useEvents } from '../hooks/useEvents'

const FALLBACK_IMG = 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg'

const CATEGORY_MAP: Record<string, string> = {
  Concerts: 'Concert',
  Sport: 'Sport',
  VIP: 'VIP',
  'Cinéma': 'Cinéma',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

const HERO_COUNT = 5

function HeroSkeleton() {
  return (
    <div className="px-5 mb-8">
      <div className="rounded-[20px] h-[360px] bg-[#E8E8F0] animate-pulse" />
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-6 h-1.5 bg-[#E8E8F0] rounded-full" />
        <div className="w-1.5 h-1.5 bg-[#E8E8F0] rounded-full" />
        <div className="w-1.5 h-1.5 bg-[#E8E8F0] rounded-full" />
      </div>
    </div>
  )
}

function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 flex gap-4 items-center border border-[#E5E7EB] animate-pulse">
      <div className="w-20 h-20 rounded-xl bg-[#E8E8F0] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-3 w-14 bg-[#E8E8F0] rounded-full mb-2" />
        <div className="h-4 w-full bg-[#E8E8F0] rounded-full mb-2" />
        <div className="h-3 w-2/3 bg-[#E8E8F0] rounded-full mb-2" />
        <div className="h-3 w-1/4 bg-[#E8E8F0] rounded-full" />
      </div>
      <div className="w-10 h-10 rounded-full bg-[#E8E8F0] shrink-0" />
    </div>
  )
}

export function Home() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const { events, loading } = useEvents()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const [activeCategory, setActiveCategory] = useState('Tous')
  const [searchValue, setSearchValue] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const fullName: string = user?.user_metadata?.full_name ?? 'Utilisateur'
  const initials = getInitials(fullName)
  const firstName = fullName.split(' ')[0]

  // First HERO_COUNT events populate the carousel; the rest appear in the list
  const heroEvents = events.slice(0, HERO_COUNT)

  const filteredEvents = events.filter((e) => {
    const matchCat =
      activeCategory === 'Tous' ||
      e.category === (CATEGORY_MAP[activeCategory] ?? activeCategory)
    const q = searchValue.toLowerCase()
    const matchSearch =
      !searchValue.trim() ||
      e.title.toLowerCase().includes(q) ||
      (e.location ?? '').toLowerCase().includes(q) ||
      (e.city ?? '').toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  // When no filters active, skip the hero events from the list to avoid duplication
  const displayedEvents =
    activeCategory === 'Tous' && !searchValue.trim()
      ? filteredEvents.slice(heroEvents.length)
      : filteredEvents

  return (
    <div className="bg-[#F4F4FB] text-[#12122A] pb-24 md:pb-10 font-body w-full min-h-screen relative overflow-x-hidden">
      <header className="flex justify-between items-center px-5 pt-12 md:pt-8 pb-4">
        <div>
          <p className="text-sm text-[#12122A]/70">Bonjour 👋</p>
          <h1 className="text-2xl font-bold">{firstName}</h1>
        </div>
        <button onClick={wip}>
          <div
            className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center text-white font-bold text-sm select-none"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            {initials}
          </div>
        </button>
      </header>

      <div className="px-5 mb-6 flex gap-3">
        <div
          className={`flex-1 bg-white rounded-xl px-4 py-3 flex items-center gap-3 border shadow-sm transition-all duration-200 ${
            searchFocused
              ? 'border-primary shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
              : 'border-[#E5E7EB]'
          }`}
        >
          <Search size={16} className="text-[#12122A]/50 shrink-0" />
          <input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Rechercher un événement..."
            className={`flex-1 bg-transparent text-sm text-[#12122A] outline-none placeholder-[#12122A]/40 ${
              !searchFocused && !searchValue ? 'search-input-idle' : ''
            }`}
          />
          {searchValue && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setSearchValue('')
                searchRef.current?.focus()
              }}
              className="text-[#12122A]/40 hover:text-[#12122A]/70 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={wip}
          className="bg-gradient-to-br from-primary to-accent p-3 rounded-xl shadow-md shadow-primary/20"
        >
          <SlidersHorizontal size={20} className="text-white" />
        </button>
      </div>

      <CategoryPills activeCategory={activeCategory} onChange={setActiveCategory} />

      {/* Hero carousel */}
      {loading ? (
        <HeroSkeleton />
      ) : heroEvents.length > 0 ? (
        <HeroCard events={heroEvents} />
      ) : null}

      {/* Event list */}
      <div className="px-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recommandés pour vous</h3>
          <button onClick={wip} className="text-primary text-sm font-semibold">
            Voir tout
          </button>
        </div>
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)
          ) : displayedEvents.length > 0 ? (
            displayedEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                category={event.category ?? 'Événement'}
                title={event.title}
                venue={event.location ?? event.city ?? 'Brazzaville'}
                price="Voir les prix"
                imageUrl={event.cover_url ?? FALLBACK_IMG}
              />
            ))
          ) : (
            <p className="text-center text-sm text-[#12122A]/40 py-8 md:col-span-2">
              {events.length === 0
                ? 'Aucun événement disponible pour le moment.'
                : 'Aucun événement dans cette catégorie.'}
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
