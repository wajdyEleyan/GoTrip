// src/pages/EditTrip.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { TripForm } from '@/components/trips/TripForm'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'

export default function EditTrip() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { t } = useLanguage()

  const trip = id ? getTripById(id) : undefined

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">{t('tripNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
      </div>
    )
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title={t('editTrip')} backTo={`/trip/${trip.id}/dashboard`} />
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <TripForm editTrip={trip} />
      </main>
    </div>
  )
}
