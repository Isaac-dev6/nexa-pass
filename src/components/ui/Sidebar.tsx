import { Compass, Search, Ticket, User, Plus, LogOut, LayoutDashboard, Moon, Sun, Shield } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useTheme } from '../../contexts/ThemeContext'
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

  const { isOrganizer: hasEvents } = useIsOrganizer(user?.id)
  const { userRole } = useAuth()
  const isOrganizer = hasEvents || userRole === 'organizer' || userRole === 'admin'
  const { isDark, toggleTheme } = useTheme()

  const fullName: string =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Utilisateur'
  const initials = getInitials(fullName)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const border = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'

  return (
    <aside
      className="hidden md:flex w-[240px] h-screen sticky top-0 flex-col z-40 shrink-0 border-r"
      style={{ background: isDark ? '#0F172A' : 'white', borderColor: border }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: border }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Nexa Pass" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <span
            className="font-extrabold text-lg tracking-tight"
            style={{ color: isDark ? '#F0F0FF' : '#12122A' }}
          >
            Nexa Pass
          </span>
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
                  : isDark
                    ? 'hover:bg-white/5'
                    : 'hover:bg-[#F4F4FB]'
              }`}
              style={!isActive ? { color: isDark ? '#F0F0FF' : 'rgba(18,18,42,0.6)' } : undefined}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Dashboard Pro — only if organizer */}
      {isOrganizer && (
        <div className="px-3 pb-2 border-t pt-3 mt-1" style={{ borderColor: border }}>
          <button
            onClick={() => navigate('/organizer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              location.pathname === '/organizer'
                ? 'bg-accent/10 text-accent'
                : isDark ? 'hover:bg-white/5' : 'hover:bg-[#F4F4FB]'
            }`}
            style={location.pathname !== '/organizer' ? { color: isDark ? '#F0F0FF' : 'rgba(18,18,42,0.6)' } : undefined}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Pro</span>
            <span className="ml-auto text-[10px] font-bold bg-accent/15 text-accent px-2 py-0.5 rounded-full">PRO</span>
          </button>
        </div>
      )}

      {/* Administration — only for admins */}
      {userRole === 'admin' && (
        <div className="px-3 pb-2 border-t pt-3" style={{ borderColor: border }}>
          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              location.pathname === '/admin'
                ? 'bg-red-500/10 text-red-500'
                : isDark ? 'hover:bg-white/5' : 'hover:bg-[#F4F4FB]'
            }`}
            style={location.pathname !== '/admin' ? { color: isDark ? '#F0F0FF' : 'rgba(18,18,42,0.6)' } : undefined}
          >
            <Shield size={18} />
            <span>Administration</span>
            <span className="ml-auto text-[10px] font-extrabold bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          </button>
        </div>
      )}

      {/* Dark mode toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#F4F4FB]'}`}
          style={{ color: isDark ? '#F0F0FF' : 'rgba(18,18,42,0.6)' }}
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
          {isDark ? 'Mode sombre' : 'Mode clair'}
          <span
            className="ml-auto w-9 h-5 rounded-full relative transition-colors duration-200 shrink-0"
            style={{ background: isDark ? '#2563EB' : '#D1D5DB' }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: isDark ? 'translateX(1.125rem)' : 'translateX(0.125rem)' }}
            />
          </span>
        </button>
      </div>

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
      <div className="px-3 py-4 border-t" style={{ borderColor: border }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate" style={{ color: isDark ? '#F0F0FF' : '#12122A' }}>
              {fullName}
            </p>
            <p className="text-xs truncate" style={{ color: isDark ? '#9494B8' : 'rgba(18,18,42,0.5)' }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="transition-colors shrink-0"
            style={{ color: isDark ? '#9494B8' : 'rgba(18,18,42,0.4)' }}
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
