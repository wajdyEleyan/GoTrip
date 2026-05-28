// Autor: Wajdy Eleyan
// src/pages/Availability.tsx — Screen 6: Verfügbarkeits-Kalender
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { AvailabilityCalendar } from '@/components/calendar/AvailabilityCalendar'
import { GroupHeatmap } from '@/components/calendar/GroupHeatmap'
import { HeatmapLegend } from '@/components/calendar/HeatmapLegend'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import {
  saveMemberAvailability,
  getMemberAvailability,
  getTripAvailabilities,
} from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { AvailabilityStatus } from '@/types/availability'

export default function Availability() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()

  const trip = id ? getTripById(id) : undefined

  const [myDates, setMyDates] = useState<Record<string, AvailabilityStatus>>({})
  const [allAvailabilities, setAllAvailabilities] = useState(
    id ? getTripAvailabilities(id) : []
  )
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id || !user) return
    const existing = getMemberAvailability(id, user.id)
    if (existing) setMyDates(existing.dates)
  }, [id, user])

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">Reise nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>Zur Übersicht</Button>
      </div>
    )
  }

  function handleSave() {
    if (!user || !id) return
    const data = {
      memberId: user.id,
      memberName: user.name,
      tripId: id,
      dates: myDates,
    }
    saveMemberAvailability(data)
    const updated = getTripAvailabilities(id)
    setAllAvailabilities(updated)
    setSaved(true)
    toast.success('Verfügbarkeit gespeichert!')
    setTimeout(() => setSaved(false), 2000)
  }

  function handleNext() {
    handleSave()
    navigate(`/trip/${trip!.id}/preferences`)
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title="Set Availability" />

      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-6 pb-8">
        {/* Personal calendar */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Deine Verfügbarkeit – {trip.name}
          </h2>
          <HeatmapLegend />
          <div className="mt-4">
            <AvailabilityCalendar
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              dates={myDates}
              onChange={setMyDates}
            />
          </div>
        </section>

        {/* Group heatmap */}
        {allAvailabilities.length > 0 && (
          <section className="bg-gray-50 rounded-2xl p-4">
            <GroupHeatmap
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              memberAvailabilities={allAvailabilities}
              totalMembers={trip.members.length}
            />
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            className="w-full"
            aria-label="Verfügbarkeit speichern"
          >
            {saved ? (
              <><Check size={16} className="mr-2 text-success" />Gespeichert</>
            ) : 'Speichern'}
          </Button>
          <Button onClick={handleNext} className="w-full">
            Weiter: Präferenzen
          </Button>
        </div>
      </main>
    </div>
  )
}
