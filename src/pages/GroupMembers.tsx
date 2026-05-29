// src/pages/GroupMembers.tsx
import { useParams, useNavigate, Link } from 'react-router-dom'
import { UserPlus, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { MemberList } from '@/components/members/MemberList'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'

export default function GroupMembers() {
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

  const memberCount = trip.members.length

  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title={trip.name} />

      <main className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-4 pb-8">
        {/* Counter + Invite Link */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">
            {t('membersCount', { count: String(memberCount) })}
          </h2>
          <Link
            to={`/trip/${trip.id}/invite`}
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <UserPlus size={14} />
            {t('inviteMore')}
          </Link>
        </div>

        {/* Member List */}
        <div className="flex-1">
          <MemberList members={trip.members} />
        </div>

        {/* Next Button */}
        <Button
          onClick={() => navigate(`/trip/${trip.id}/availability`)}
          className="w-full h-12 rounded-xl"
        >
          {t('nextAvailability')}
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </main>
    </div>
  )
}
