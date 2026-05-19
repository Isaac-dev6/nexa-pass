import { useState, useRef } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { BottomNav } from '../components/ui/BottomNav'
import { HeroCard } from '../components/home/HeroCard'
import { CategoryPills } from '../components/home/CategoryPills'
import { EventCard } from '../components/home/EventCard'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

const heroEvent = {
  badge: 'VIP',
  title: 'Brazza Vibe Fest',
  subtitle: "Le plus grand événement de l'année",
  date: '15 Juillet 2024',
  venue: 'Stade Éboué',
  priceLabel: 'À partir de',
  price: '15 000 FCFA',
  imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg',
}

const recommendedEvents = [
  {
    id: 1,
    category: 'Sport',
    title: 'Derby de Brazzaville',
    venue: 'Stade Massamba',
    price: '2 000 FCFA',
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
  },
  {
    id: 2,
    category: 'Concert',
    title: 'Nuit Jazz du Congo',
    venue: 'Palais des Congrès',
    price: '5 000 FCFA',
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
  },
  {
    id: 3,
    category: 'VIP',
    title: 'Soirée Prestige Brazza',
    venue: 'Hotel Ledger Plaza',
    price: '25 000 FCFA',
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg',
  },
  {
    id: 4,
    category: 'Cinéma',
    title: 'Festival du Film Africain',
    venue: 'Ciné Vog',
    price: '3 000 FCFA',
    imageUrl: 'https://storage.googleapis.com/banani-generated-images/generated-images/0f12b0b8-3b8c-43c9-aefb-09bda3b3548a.jpg',
  },
]

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

export function Home() {
  const { showToast } = useToast()
  const { user } = useAuth()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const [activeCategory, setActiveCategory] = useState('Tous')
  const [searchValue, setSearchValue] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const fullName: string = user?.user_metadata?.full_name ?? 'Utilisateur'
  const initials = getInitials(fullName)
  const firstName = fullName.split(' ')[0]

  const filteredEvents =
    activeCategory === 'Tous'
      ? recommendedEvents
      : recommendedEvents.filter(
          (e) => e.category === (CATEGORY_MAP[activeCategory] ?? activeCategory)
        )

  const displayedEvents = searchValue.trim()
    ? filteredEvents.filter((e) =>
        e.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        e.venue.toLowerCase().includes(searchValue.toLowerCase())
      )
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
      <HeroCard {...heroEvent} />

      <div className="px-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recommandés pour vous</h3>
          <button onClick={wip} className="text-primary text-sm font-semibold">
            Voir tout
          </button>
        </div>
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
          {displayedEvents.length > 0 ? (
            displayedEvents.map((event) => <EventCard key={event.id} {...event} />)
          ) : (
            <p className="text-center text-sm text-[#12122A]/40 py-8 md:col-span-2">
              Aucun événement dans cette catégorie.
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
