// src/components/sheets/PreferencesSheet.tsx
// Präferenzen-Popup: Interessen (Icons) + „Sonstiges" frei + Aktivitäten-Wünsche.
import { saveMemberPreferences, getMemberPreferences } from '@/utils/storage'
import { PreferencesForm } from '@/components/preferences/PreferencesForm'
import { toast } from '@/components/shared/Toast'
import type { MemberPreferences } from '@/types/preferences'
import type { Trip } from '@/types/trip'
import type { StoredAuth } from '@/utils/storage'

interface Props {
  trip: Trip
  user: StoredAuth
  onNext: () => void
}

export function PreferencesSheet({ trip, user, onNext }: Props) {
  const existing = getMemberPreferences(trip.id, user.id)

  function handleSave(partial: Omit<MemberPreferences, 'memberId' | 'tripId'>) {
    saveMemberPreferences({ memberId: user.id, tripId: trip.id, ...partial })
    toast.success('Präferenzen gespeichert!')
    onNext()
  }

  return (
    <div className="px-4 py-4 pb-6">
      <PreferencesForm initial={existing} onSave={handleSave} />
    </div>
  )
}
