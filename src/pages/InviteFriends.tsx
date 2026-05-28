// Autor: Amal Najah
// src/pages/InviteFriends.tsx — Screen 4: Freunde einladen
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { InviteLink } from '@/components/members/InviteLink'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import { Users } from 'lucide-react'

export default function InviteFriends() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()

  const trip = id ? getTripById(id) : undefined

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">Reise nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>Zur Übersicht</Button>
      </div>
    )
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title="Freunde einladen" />

      <main className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-6">
        {/* Trip name reminder */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Einladungslink für</p>
          <h2 className="text-lg font-semibold text-gray-900">{trip.name}</h2>
        </div>

        <InviteLink inviteCode={trip.inviteCode} />

        <Button
          onClick={() => navigate(`/trip/${trip.id}/members`)}
          className="w-full mt-auto"
          aria-label="Zur Mitgliederliste"
        >
          <Users size={16} className="mr-2" />
          Mitglieder ansehen
        </Button>
      </main>
    </div>
  )
}
