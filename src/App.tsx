// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { TripProvider } from '@/context/TripContext'
import { AccessibilityProvider } from '@/context/AccessibilityContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { Toaster } from '@/components/shared/Toast'
import type { ReactNode } from 'react'

// Pages
import Login from '@/pages/Login'
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
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/join/:code" element={<JoinTrip />} />

      {/* Protected */}
      <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
      <Route path="/create" element={<RequireAuth><CreateTrip /></RequireAuth>} />
      <Route path="/trip/:id/edit" element={<RequireAuth><EditTrip /></RequireAuth>} />
      <Route path="/trip/:id/dashboard" element={<RequireAuth><TripDashboard /></RequireAuth>} />
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
              <AppRoutes />
              <Toaster position="top-center" richColors />
            </TripProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
