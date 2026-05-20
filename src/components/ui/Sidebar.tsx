import { Compass, Search, Ticket, User, Plus, LogOut, LayoutDashboard } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { supabase } from '../../lib/supabase'
import { useIsOrganizer } from '../../hooks/useIsOrganizer'

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

const NAV_ITEMS = [
  { icon: Compass, label: 'Accueil', path: '/home' },
  { icon: Search, label: 'Explorer', path: '/explorer' },
  { icon: Ticket, label: 'Commandes', path: '/orders' },
  { icon: User, label: 'Profil', path: '/profile' },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showToast } = useToast()
  const wip = () => showToast('🚧 Cette section est en cours de construction')

  const { isOrganizer } = useIsOrganizer(user?.id)
  const fullName: string = user?.user_metadata?.full_name ?? 'Utilisateur'
  const initials = getInitials(fullName)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex w-[240px] h-screen sticky top-0 flex-col bg-white border-r border-[#E5E7EB] z-40 shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            <span className="text-white font-extrabold text-sm">N</span>
          </div>
          <span className="font-extrabold text-lg text-[#12122A] tracking-tight">Nexa Pass</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={['/home', '/orders', '/explorer', '/organizer', '/profile'].includes(path) ? () => navigate(path) : wip}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-[#12122A]/60 hover:bg-[#F4F4FB] hover:text-[#12122A]'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Dashboard Pro — only if organizer */}
      {isOrganizer && (
        <div className="px-3 pb-2 border-t border-[#E5E7EB] pt-3 mt-1">
          <button
            onClick={() => navigate('/organizer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              location.pathname === '/organizer'
                ? 'bg-accent/10 text-accent'
                : 'text-[#12122A]/60 hover:bg-[#F4F4FB] hover:text-[#12122A]'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Pro</span>
            <span className="ml-auto text-[10px] font-bold bg-accent/15 text-accent px-2 py-0.5 rounded-full">PRO</span>
          </button>
        </div>
      )}

      {/* Create event button */}
      <div className="px-3 pb-4">
        <button
          onClick={() => navigate('/create-event')}
          className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
        >
          <Plus size={16} />
          Créer un événement
        </button>
      </div>

      {/* User info */}
      <div className="px-3 py-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#12122A] truncate">{fullName}</p>
            <p className="text-xs text-[#12122A]/50 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[#12122A]/40 hover:text-[#12122A]/70 transition-colors shrink-0"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
