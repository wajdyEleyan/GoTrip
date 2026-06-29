// src/components/sheets/MembersSheet.tsx
import { useState } from 'react'
import { UserPlus, ChevronDown, ChevronUp } from 'lucide-react'
import { MemberList } from '@/components/members/MemberList'
import { InviteLink } from '@/components/members/InviteLink'
import type { Trip } from '@/types/trip'

interface Props {
  trip: Trip
  onNext: () => void
}

export function MembersSheet({ trip, onNext }: Props) {
  const [showInvite, setShowInvite] = useState(false)

  return (
    <div className="px-4 py-4 flex flex-col gap-4 pb-6">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">{trip.members.length} Mitglied(er)</p>
        <button
          onClick={() => setShowInvite(v => !v)}
          className="flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <UserPlus size={14} />
          Einladen
          {showInvite ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {showInvite && (
        <div className="bg-gray-50 rounded-2xl p-4">
          <InviteLink inviteCode={trip.inviteCode} />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <MemberList members={trip.members} />
      </div>

      <button
        onClick={onNext}
        className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        Fertig
      </button>
    </div>
  )
}
