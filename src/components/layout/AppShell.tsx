import type { ReactNode } from 'react'
import { Sidebar } from '../ui/Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { useSessionTimeout } from '../../hooks/useSessionTimeout'

function SessionWarningModal({
  minutesLeft,
  onExtend,
  onLogout,
}: {
  minutesLeft: number
  onExtend: () => void
  onLogout: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-[380px] bg-white rounded-2xl shadow-2xl p-6"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⏰</span>
        </div>
        <h3 className="text-center text-base font-extrabold text-[#12122A] mb-2">
          Session sur le point d'expirer
        </h3>
        <p className="text-center text-sm text-[#12122A]/60 mb-5">
          Vous serez déconnecté dans{' '}
          <strong className="text-amber-600">
            {minutesLeft} minute{minutesLeft > 1 ? 's' : ''}
          </strong>{' '}
          en raison d'inactivité.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 h-11 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#12122A]/60 hover:text-[#12122A] transition-colors"
          >
            Se déconnecter
          </button>
          <button
            onClick={onExtend}
            className="flex-1 h-11 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #2563EB, #9333EA)' }}
          >
            Rester connecté
          </button>
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { showWarning, minutesLeft, extendSession, signOut } = useSessionTimeout(user?.id)

  return (
    <div className="min-h-screen bg-[#F4F4FB] md:flex md:bg-[#F0F0F8]">
      <Sidebar />
      <main className="flex-1 min-h-screen md:flex md:justify-center">
        <div className="w-full md:max-w-[900px] min-h-screen bg-[#F4F4FB]">
          {children}
        </div>
      </main>
      {showWarning && (
        <SessionWarningModal
          minutesLeft={minutesLeft}
          onExtend={extendSession}
          onLogout={signOut}
        />
      )}
    </div>
  )
}
