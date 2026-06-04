// src/pages/GroupMembers.tsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UserPlus, ChevronDown, ChevronUp } from 'lucide-react'
import { TripScreen } from '@/components/shared/TripScreen'
import { MemberList } from '@/components/members/MemberList'
import { InviteLink } from '@/components/members/InviteLink'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'
import { StepNav } from '@/components/shared/StepNav'

export default function GroupMembers() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { t } = useLanguage()
  const [showInvite, setShowInvite] = useState(false)

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
    <TripScreen title={trip.name} backTo={`/trip/${id}/dashboard`}>
      <main className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-4 pb-28">
        {/* Counter + Invite Toggle */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-gray-800">
            {t('membersCount', { count: String(memberCount) })}
          </h2>
          <button
            onClick={() => setShowInvite((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <UserPlus size={14} />
            {t('inviteMore')}
            {showInvite ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Inline Invite Panel */}
        {showInvite && (
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t('inviteFriends')}
            </p>
            <InviteLink inviteCode={trip.inviteCode} />
          </div>
        )}

        {/* Member List inside glass-card */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <MemberList members={trip.members} />
        </div>

        <StepNav tripId={id ?? ''} current="members" />
      </main>
    </TripScreen>
  )
}
