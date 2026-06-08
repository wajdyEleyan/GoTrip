// src/pages/GroupMembers.tsx
// „Gruppe"-Tab: Mitglieder sehen + einladen. Kein Onboarding-Flow („Weiter").
import { useParams, useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { TripScreen } from '@/components/shared/TripScreen'
import { MemberList } from '@/components/members/MemberList'
import { InviteLink } from '@/components/members/InviteLink'
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

  return (
    <TripScreen title={trip.name} backTo={`/trip/${id}/dashboard`}>
      <main className="flex-1 px-4 py-4 overflow-y-auto flex flex-col gap-4 pb-28">
        {/* Mitgliederzahl */}
        <h2 className="text-sm font-bold text-gray-800 px-1">
          {t('membersCount', { count: String(trip.members.length) })}
        </h2>

        {/* Mitgliederliste */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <MemberList members={trip.members} />
        </div>

        {/* Einladen — direkt sichtbar (Hauptzweck dieses Tabs) */}
        <div className="glass-card rounded-2xl p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            <UserPlus size={14} className="text-primary" />
            {t('inviteFriends')}
          </p>
          <InviteLink inviteCode={trip.inviteCode} />
        </div>
      </main>
    </TripScreen>
  )
}
