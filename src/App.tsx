// src/App.tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { TripProvider } from '@/context/TripContext'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { Toaster, toast } from '@/components/shared/Toast'
import { getTripById as getTripByIdStorage } from '@/utils/storage'
import { setActiveTrip, pullTrip, startPolling, stopPolling } from '@/services/tripSync'
import type { ReactNode } from 'react'

// Läuft auf allen Seiten: Toasts + Polling wenn innerhalb einer Reise
function GlobalSync() {
  const location = useLocation()

  // Toast bei jedem gotrip-notification Event
  useEffect(() => {
    function onNotification(e: Event) {
      const { message } = (e as CustomEvent).detail ?? {}
      if (message) toast.info(message)
    }
    window.addEventListener('gotrip-notification', onNotification)
    return () => window.removeEventListener('gotrip-notification', onNotification)
  }, [])

  // Polling starten/stoppen je nach Seite
  useEffect(() => {
    const match = location.pathname.match(/^\/trip\/([^/]+)/)
    if (!match) {
      stopPolling()
      setActiveTrip(null)
      return
    }
    const tripId = match[1]
    const trip = getTripByIdStorage(tripId)
    if (!trip?.inviteCode) return
    setActiveTrip(tripId, trip.inviteCode)
    void pullTrip(trip.inviteCode)
    startPolling()
  }, [location.pathname])

  useEffect(() => {
    return () => { stopPolling(); setActiveTrip(null) }
  }, [])

  return null
}

// Pages
import Home from '@/pages/Home'
import CreateTrip from '@/pages/CreateTrip'
import EditTrip from '@/pages/EditTrip'
import InviteFriends from '@/pages/InviteFriends'
import GroupMembers from '@/pages/GroupMembers'
import JoinTrip from '@/pages/JoinTrip'
import Availability from '@/pages/Availability'
import Preferences from '@/pages/Preferences'
import AIRecommendation from '@/pages/AIRecommendation'
import VoteDecide from '@/pages/VoteDecide'
import ActivitiesVoting from '@/pages/ActivitiesVoting'
import FinalOverview from '@/pages/FinalOverview'
import BudgetTracker from '@/pages/BudgetTracker'
import TripDashboard from '@/pages/TripDashboard'
import Management from '@/pages/Management'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="app-shell flex items-center justify-center min-h-svh">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public — EIN Startscreen: Willkommen + Login zugleich */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/join/:code" element={<JoinTrip />} />

      {/* Protected */}
      <Route path="/create" element={<RequireAuth><CreateTrip /></RequireAuth>} />
      <Route path="/trip/:id/edit" element={<RequireAuth><EditTrip /></RequireAuth>} />
      <Route path="/trip/:id/dashboard" element={<RequireAuth><TripDashboard /></RequireAuth>} />
      <Route path="/trip/:id/management" element={<RequireAuth><Management /></RequireAuth>} />
      <Route path="/trip/:id/invite" element={<RequireAuth><InviteFriends /></RequireAuth>} />
      <Route path="/trip/:id/members" element={<RequireAuth><GroupMembers /></RequireAuth>} />
      <Route path="/trip/:id/availability" element={<RequireAuth><Availability /></RequireAuth>} />
      <Route path="/trip/:id/preferences" element={<RequireAuth><Preferences /></RequireAuth>} />
      <Route path="/trip/:id/recommendation" element={<RequireAuth><AIRecommendation /></RequireAuth>} />
      <Route path="/trip/:id/vote" element={<RequireAuth><VoteDecide /></RequireAuth>} />
      <Route path="/trip/:id/activities" element={<RequireAuth><ActivitiesVoting /></RequireAuth>} />
      <Route path="/trip/:id/final" element={<RequireAuth><FinalOverview /></RequireAuth>} />
      <Route path="/trip/:id/budget" element={<RequireAuth><BudgetTracker /></RequireAuth>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <TripProvider>
              <GlobalSync />
              <AppRoutes />
              <Toaster position="top-center" richColors duration={2000} />
            </TripProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
