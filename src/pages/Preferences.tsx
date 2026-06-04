// src/pages/Preferences.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { TripScreen } from '@/components/shared/TripScreen'
import { Button } from '@/components/ui/button'
import { PreferencesForm } from '@/components/preferences/PreferencesForm'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { saveMemberPreferences, getMemberPreferences } from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { MemberPreferences } from '@/types/preferences'
import { nextStepPath } from '@/utils/flow'

export default function Preferences() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()
  const { t } = useLanguage()

  const trip = id ? getTripById(id) : undefined
  const existing = id && user ? getMemberPreferences(id, user.id) : undefined

  if (!trip || !user) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">{t('tripNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
      </div>
    )
  }

  function handleSave(partial: Omit<MemberPreferences, 'memberId' | 'tripId'>) {
    const prefs: MemberPreferences = { memberId: user!.id, tripId: trip!.id, ...partial }
    saveMemberPreferences(prefs)
    toast.success(t('preferencesSaved'))
    navigate(nextStepPath(trip!.id, 'preferences'))
  }

  return (
    <TripScreen title={t('yourPreferences')} backTo={`/trip/${id}/dashboard`} ambientName={trip.name}>
      <main className="flex-1 px-4 py-5 overflow-y-auto pb-28">
        {/* Trip title header */}
        <div className="glass-card rounded-2xl px-4 py-3 mb-5">
          <h2 className="text-lg font-bold text-gray-900">{trip.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t('whatAreYourIdeas')}</p>
        </div>

        <PreferencesForm
          initial={existing}
          onSave={handleSave}
        />
      </main>
    </TripScreen>
  )
}
