import { useState, useEffect } from 'react'
import { CalendarRange } from 'lucide-react'
import { AvailabilityCalendar } from '@/components/calendar/AvailabilityCalendar'
import { GroupHeatmap } from '@/components/calendar/GroupHeatmap'
import { HeatmapLegend } from '@/components/calendar/HeatmapLegend'
import {
  saveMemberAvailability, getMemberAvailability,
  getTripAvailabilities, getTripPreferences,
} from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { AvailabilityStatus } from '@/types/availability'
import type { Trip } from '@/types/trip'
import type { StoredAuth } from '@/utils/storage'

interface Props {
  trip: Trip
  user: StoredAuth
  onNext: () => void
}

export function AvailabilitySheet({ trip, user, onNext }: Props) {
  const [myDates, setMyDates] = useState<Record<string, AvailabilityStatus>>({})
  const [allAvailabilities, setAllAvailabilities] = useState(() => getTripAvailabilities(trip.id))
  const [overlapStart, setOverlapStart] = useState<string | null>(null)
  const [overlapEnd, setOverlapEnd] = useState<string | null>(null)

  useEffect(() => {
    const existing = getMemberAvailability(trip.id, user.id)
    if (existing) setMyDates(existing.dates)

    const prefs = getTripPreferences(trip.id)
    const starts = prefs.map(p => p.preferredStartDate).filter(Boolean) as string[]
    const ends = prefs.map(p => p.preferredEndDate).filter(Boolean) as string[]
    if (starts.length > 0 && ends.length > 0) {
      const latestStart = starts.reduce((a, b) => a > b ? a : b)
      const earliestEnd = ends.reduce((a, b) => a < b ? a : b)
      if (latestStart <= earliestEnd) { setOverlapStart(latestStart); setOverlapEnd(earliestEnd) }
    }
  }, [trip.id, user.id])

  function handleSaveAndNext() {
    saveMemberAvailability({ memberId: user.id, memberName: user.name, tripId: trip.id, dates: myDates })
    setAllAvailabilities(getTripAvailabilities(trip.id))
    toast.success('Verfügbarkeit gespeichert!')
    onNext()
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4 pb-6">
      {overlapStart && overlapEnd && (
        <div className="bg-green-50 rounded-2xl px-4 py-3 flex items-center gap-3 border-l-4 border-green-400">
          <CalendarRange size={16} className="text-green-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-green-600">Gemeinsamer Zeitraum</p>
            <p className="text-sm font-semibold text-gray-800">{overlapStart} – {overlapEnd}</p>
          </div>
        </div>
      )}

      <HeatmapLegend />

      <AvailabilityCalendar
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        dates={myDates}
        onChange={setMyDates}
      />

      {allAvailabilities.length > 0 && (
        <GroupHeatmap
          tripStartDate={trip.startDate}
          tripEndDate={trip.endDate}
          memberAvailabilities={allAvailabilities}
          totalMembers={trip.members.length}
        />
      )}

      <button
        onClick={handleSaveAndNext}
        className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        Speichern
      </button>
    </div>
  )
}
