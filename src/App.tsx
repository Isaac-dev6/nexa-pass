import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { Home } from './screens/Home'
import { Login } from './screens/Login'
import { Register } from './screens/Register'
import { EventDetail } from './screens/EventDetail'
import { Orders } from './screens/Orders'
import { Explorer } from './screens/Explorer'
import { OrganizerDashboard } from './screens/OrganizerDashboard'
import { AdminDashboard } from './screens/AdminDashboard'
import { CreateEvent } from './screens/CreateEvent'
import { Profile } from './screens/Profile'
import { Checkout } from './screens/Checkout'
import { TicketView } from './screens/TicketView'
import { QRScanner } from './screens/QRScanner'
import { Landing } from './screens/Landing'
import { EditEvent } from './screens/EditEvent'
import AuthCallback from './screens/AuthCallback'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAdminRole } from './hooks/useAdminRole'

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4F4FB' }}>
    <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin"
      style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
  </div>
)

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AccessDenied() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  useEffect(() => {
    showToast('🚫 Accès refusé — réservé aux administrateurs')
    navigate('/home', { replace: true })
  }, [navigate, showToast])
  return <Spinner />
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const { isAdmin, loading: roleLoading } = useAdminRole(user?.id)
  if (loading || roleLoading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <AccessDenied />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<PrivateRoute><AppShell><Home /></AppShell></PrivateRoute>} />
            <Route path="/event/:id" element={<PrivateRoute><AppShell><EventDetail /></AppShell></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><AppShell><Orders /></AppShell></PrivateRoute>} />
            <Route path="/explorer" element={<PrivateRoute><AppShell><Explorer /></AppShell></PrivateRoute>} />
            <Route path="/organizer" element={<PrivateRoute><AppShell><OrganizerDashboard /></AppShell></PrivateRoute>} />
            <Route path="/create-event" element={<PrivateRoute><AppShell><CreateEvent /></AppShell></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><AppShell><Profile /></AppShell></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><AppShell><Checkout /></AppShell></PrivateRoute>} />
            <Route path="/ticket/:id" element={<PrivateRoute><AppShell><TicketView /></AppShell></PrivateRoute>} />
            <Route path="/scanner" element={<PrivateRoute><QRScanner /></PrivateRoute>} />
            <Route path="/event/edit/:id" element={<PrivateRoute><AppShell><EditEvent /></AppShell></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AppShell><AdminDashboard /></AppShell></AdminRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
