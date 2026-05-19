import { Heart, Calendar, MapPin } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'

interface HeroCardProps {
  badge: string
  title: string
  subtitle: string
  date: string
  venue: string
  priceLabel: string
  price: string
  imageUrl: string
}

export function HeroCard({ badge, title, subtitle, date, venue, priceLabel, price, imageUrl }: HeroCardProps) {
  const { showToast } = useToast()

  return (
    <div className="px-5 mb-8">
      <div
        className="rounded-[20px] h-[360px] relative overflow-hidden flex flex-col justify-end p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
          {badge}
        </div>
        <button
          onClick={() => showToast('🚧 Cette section est en cours de construction')}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white border border-white/30 transition-all hover:bg-white/30"
        >
          <Heart size={18} />
        </button>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-1">{title}</h2>
          <p className="text-accent text-sm font-semibold mb-3">{subtitle}</p>
          <div className="flex items-center gap-4 text-xs text-white/90 mb-4">
            <div className="flex items-center gap-1 font-medium">
              <Calendar size={14} />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1 font-medium">
              <MapPin size={14} />
              <span>{venue}</span>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-white/80 mb-0.5 font-medium">{priceLabel}</p>
              <p className="text-2xl font-bold text-white">{price}</p>
            </div>
            <button
              onClick={() => showToast('🚧 Achat de billets bientôt disponible')}
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:scale-95"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        <div className="w-6 h-1.5 bg-primary rounded-full" />
        <div className="w-1.5 h-1.5 bg-[#E5E7EB] rounded-full" />
        <div className="w-1.5 h-1.5 bg-[#E5E7EB] rounded-full" />
      </div>
    </div>
  )
}
