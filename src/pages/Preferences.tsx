// Autor: Eya Mathlouthi
// src/pages/Preferences.tsx — Screen 7: Präferenzen & Interessen
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { PreferencesForm } from '@/components/preferences/PreferencesForm'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import {
  saveMemberPreferences,
  getMemberPreferences,
} from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { MemberPreferences } from '@/types/preferences'

export default function Preferences() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()

  const trip = id ? getTripById(id) : undefined
  const existing = id && user ? getMemberPreferences(id, user.id) : undefined

  if (!trip || !user) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">Reise nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>Zur Übersicht</Button>
      </div>
    )
  }

  function handleSave(partial: Omit<MemberPreferences, 'memberId' | 'tripId'>) {
    const prefs: MemberPreferences = {
      memberId: user!.id,
      tripId: trip!.id,
      ...partial,
    }
    saveMemberPreferences(prefs)
    toast.success('Präferenzen gespeichert!')
    navigate(`/trip/${trip!.id}/recommendation`)
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title="Deine Präferenzen" />

      <main className="flex-1 px-4 py-5 overflow-y-auto pb-8">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{trip.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Was sind deine Vorstellungen für diese Reise?
          </p>
        </div>

        <PreferencesForm
          initial={existing}
          tripStartDate={trip.startDate}
          tripEndDate={trip.endDate}
          onSave={handleSave}
        />
      </main>
    </div>
  )
}
