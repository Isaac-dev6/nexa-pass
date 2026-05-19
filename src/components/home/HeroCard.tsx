import { useState, useEffect, useRef } from 'react'
import { Heart, Calendar, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SupabaseEvent } from '../../hooks/useEvents'

// Lowest ticket tier price from EventDetail TICKET_TYPES
const MIN_PRICE = 2_000
const FALLBACK_IMG = 'https://storage.googleapis.com/banani-generated-images/generated-images/43fb3cd6-fae1-4df7-8647-ab16c585f2b3.jpg'
const AUTO_ADVANCE_MS = 4000

function fmtDate(iso: string | null): string {
  if (!iso) return 'Date à confirmer'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface HeroCardProps {
  events: SupabaseEvent[]
}

export function HeroCard({ events }: HeroCardProps) {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const touchStartX = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const n = events.length

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (n <= 1) return
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % n), AUTO_ADVANCE_MS)
  }

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n])

  if (n === 0) return null

  const event = events[Math.min(idx, n - 1)]
  const imageUrl = event.cover_url ?? FALLBACK_IMG

  function goTo(i: number) {
    setIdx(i)
    startTimer()
  }
  const next = () => goTo((idx + 1) % n)
  const prev = () => goTo((idx - 1 + n) % n)

  function toggleLike(id: string) {
    setLiked((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <div className="px-5 mb-8">
      <div
        className="rounded-[20px] h-[360px] relative overflow-hidden flex flex-col justify-end p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] cursor-pointer"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const dx = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(dx) > 50) dx > 0 ? next() : prev()
        }}
        onClick={() => navigate(`/event/${event.id}`)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Category badge */}
        <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          {event.category ?? 'Événement'}
        </div>

        {/* Like button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleLike(event.id) }}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white border border-white/30 transition-all hover:bg-white/30 z-10"
        >
          <Heart size={18} fill={liked.has(event.id) ? 'currentColor' : 'none'} />
        </button>

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-1 line-clamp-2">
            {event.title}
          </h2>
          <p className="text-accent text-sm font-semibold mb-3 line-clamp-1">
            {event.description?.split('\n')[0]?.slice(0, 70) ?? 'Découvrez cet événement'}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/90 mb-4">
            <div className="flex items-center gap-1 font-medium">
              <Calendar size={14} />
              <span>{fmtDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <MapPin size={14} />
              <span>{event.location ?? event.city ?? 'Brazzaville'}</span>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-white/80 mb-0.5 font-medium">À partir de</p>
              <p className="text-2xl font-bold text-white">
                {MIN_PRICE.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/event/${event.id}`) }}
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      {n > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {events.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === idx
                  ? 'w-6 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-[#E5E7EB] hover:bg-[#D1D5DB]'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
