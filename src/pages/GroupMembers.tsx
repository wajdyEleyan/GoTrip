// Autor: Wajdy Eleyan
// src/pages/GroupMembers.tsx — Screen 5: Mitgliederliste
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Settings, UserPlus, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MemberList } from '@/components/members/MemberList'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'

export default function GroupMembers() {
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

  const memberCount = trip.members.length
  const hasEnoughMembers = memberCount >= 1

  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader
        title={trip.name}
        rightSlot={
          <button
            className="flex items-center justify-center w-11 h-11 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Reise-Einstellungen"
          >
            <Settings size={20} />
          </button>
        }
      />

      <main className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-4 pb-8">
        {/* Counter + Invite Link */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Members ({memberCount}/{trip.groupSize})
          </h2>
          <Link
            to={`/trip/${trip.id}/invite`}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            aria-label="Weitere Mitglieder einladen"
          >
            <UserPlus size={14} />
            + Invite
          </Link>
        </div>

        {/* Member List */}
        <div className="flex-1">
          <MemberList members={trip.members} />
        </div>

        {/* Next Button */}
        <Button
          onClick={() => navigate(`/trip/${trip.id}/availability`)}
          disabled={!hasEnoughMembers}
          className="w-full"
          aria-label={hasEnoughMembers ? 'Weiter zur Verfügbarkeit' : 'Mindestens 2 Mitglieder benötigt'}
        >
          Next: Set Availability
          <ChevronRight size={16} className="ml-1" />
        </Button>

      </main>
    </div>
  )
}
