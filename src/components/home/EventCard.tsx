import { MapPin, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface EventCardProps {
  id: number
  category: string
  title: string
  venue: string
  price: string
  imageUrl: string
}

export function EventCard({ id, category, title, venue, price, imageUrl }: EventCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/event/${id}`)}
      className="bg-white rounded-2xl p-3 flex gap-4 items-center shadow-sm border border-[#E5E7EB] text-left w-full transition-all duration-200 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
    >
      <img
        src={imageUrl}
        style={{ aspectRatio: '1/1' }}
        className="w-20 h-20 rounded-xl object-cover shrink-0"
        alt={title}
      />
      <div className="flex-1 min-w-0">
        <p className="text-primary text-xs font-bold mb-1">{category}</p>
        <h4 className="font-bold text-sm leading-tight mb-1">{title}</h4>
        <div className="text-xs text-[#12122A]/60 flex items-center gap-1 mb-1 font-medium">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{venue}</span>
        </div>
        <p className="text-sm font-bold">{price}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-sm shrink-0">
        <ChevronRight size={20} />
      </div>
    </button>
  )
}
