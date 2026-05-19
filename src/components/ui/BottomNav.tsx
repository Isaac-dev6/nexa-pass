import { Compass, Search, Plus, Ticket, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const active = (path: string) =>
    location.pathname === path ? 'text-primary' : 'text-[#12122A]/40'

  return (
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-xl border-t border-[#E5E7EB] flex justify-between items-center px-6 py-4 z-50">
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 ${active('/')}`}
      >
        <Compass size={20} />
        <span className="text-[10px] font-semibold">Accueil</span>
      </button>

      <button
        onClick={() => navigate('/explorer')}
        className={`flex flex-col items-center gap-1 ${active('/explorer')}`}
      >
        <Search size={20} />
        <span className="text-[10px]">Explorer</span>
      </button>

      <button
        onClick={() => navigate('/register')}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 -mt-6 border-4 border-[#F4F4FB]"
      >
        <Plus size={24} className="text-white" />
      </button>

      <button
        onClick={() => navigate('/orders')}
        className={`flex flex-col items-center gap-1 ${active('/orders')}`}
      >
        <Ticket size={20} />
        <span className="text-[10px]">Commandes</span>
      </button>

      <button
        onClick={wip}
        className={`flex flex-col items-center gap-1 ${active('/profile')}`}
      >
        <User size={20} />
        <span className="text-[10px]">Profil</span>
      </button>
    </nav>
  )
}
