// src/pages/InviteFriends.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { InviteLink } from '@/components/members/InviteLink'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'
import { Users } from 'lucide-react'
import { destinationImage, ambientImage } from '@/utils/destinationImage'

export default function InviteFriends() {
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
    <div
      className="app-shell flex flex-col min-h-svh"
      style={{ ['--ambient' as any]: ambientImage(trip?.name ?? '') }}
    >
      <PageHeader title={t('inviteFriends')} />

      <main className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-6">
        {/* Trip photo-card banner */}
        <div className="photo-card h-36 rounded-2xl">
          <img
            src={destinationImage(trip.name, 800)}
            alt={trip.name}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div className="photo-scrim" />
          <div className="photo-title px-4 pb-4">
            <p className="text-xs text-white/70 mb-0.5">{t('inviteLinkFor')}</p>
            <h2 className="text-xl font-bold">{trip.name}</h2>
          </div>
        </div>

        {/* Search + Copy Link wrapped in glass-card */}
        <div className="glass-card rounded-2xl p-4 flex flex-col gap-4">
          <InviteLink inviteCode={trip.inviteCode} trip={trip} />
        </div>

        <Button
          onClick={() => navigate(`/trip/${trip.id}/members`)}
          className="w-full mt-auto h-12 rounded-xl bg-primary hover:bg-primary/90 text-white"
        >
          <Users size={16} className="mr-2" />
          {t('viewMembers')}
        </Button>
      </main>
    </div>
  )
}
