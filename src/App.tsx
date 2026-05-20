import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ToastProvider } from './contexts/ToastContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { Home } from './screens/Home'
import { Login } from './screens/Login'
import { Register } from './screens/Register'
import { EventDetail } from './screens/EventDetail'
import { Orders } from './screens/Orders'
import { Explorer } from './screens/Explorer'
import { OrganizerDashboard } from './screens/OrganizerDashboard'
import { CreateEvent } from './screens/CreateEvent'
import { Profile } from './screens/Profile'
import { Checkout } from './screens/Checkout'
import { TicketView } from './screens/TicketView'
import { QRScanner } from './screens/QRScanner'
import { Landing } from './screens/Landing'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#F4F4FB' }}
      >
        <div
          className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
