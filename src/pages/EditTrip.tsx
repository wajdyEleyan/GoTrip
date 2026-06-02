// src/pages/EditTrip.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { TripForm } from '@/components/trips/TripForm'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'
import { ambientImage } from '@/utils/destinationImage'

export default function EditTrip() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { t } = useLanguage()

  const trip = id ? getTripById(id) : undefined

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 w-full max-w-sm">
          <p className="text-[#16323B] mb-2">{t('tripNotFound')}</p>
          <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="app-shell flex flex-col min-h-svh"
      style={{ ['--ambient' as any]: ambientImage(trip?.name ?? '') }}
    >
      <PageHeader title={t('editTrip')} backTo={`/trip/${trip.id}/dashboard`} />
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="glass-card rounded-2xl p-4">
          <TripForm editTrip={trip} />
        </div>
      </main>
    </div>
  )
}
