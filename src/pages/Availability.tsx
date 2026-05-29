// src/pages/Availability.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, CalendarRange } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { AvailabilityCalendar } from '@/components/calendar/AvailabilityCalendar'
import { GroupHeatmap } from '@/components/calendar/GroupHeatmap'
import { HeatmapLegend } from '@/components/calendar/HeatmapLegend'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import {
  saveMemberAvailability,
  getMemberAvailability,
  getTripAvailabilities,
  getTripPreferences,
} from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { AvailabilityStatus } from '@/types/availability'

export default function Availability() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()
  const { t } = useLanguage()

  const trip = id ? getTripById(id) : undefined

  const [myDates, setMyDates] = useState<Record<string, AvailabilityStatus>>({})
  const [allAvailabilities, setAllAvailabilities] = useState(
    id ? getTripAvailabilities(id) : []
  )
  const [saved, setSaved] = useState(false)
  const [overlapStart, setOverlapStart] = useState<string | null>(null)
  const [overlapEnd, setOverlapEnd] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) return
    const existing = getMemberAvailability(id, user.id)
    if (existing) setMyDates(existing.dates)
  }, [id, user])

  // Compute overlap from preferences
  useEffect(() => {
    if (!id) return
    const prefs = getTripPreferences(id)
    const starts = prefs.map((p) => p.preferredStartDate).filter(Boolean) as string[]
    const ends = prefs.map((p) => p.preferredEndDate).filter(Boolean) as string[]
    if (starts.length > 0 && ends.length > 0) {
      const latestStart = starts.reduce((a, b) => (a > b ? a : b))
      const earliestEnd = ends.reduce((a, b) => (a < b ? a : b))
      if (latestStart <= earliestEnd) {
        setOverlapStart(latestStart)
        setOverlapEnd(earliestEnd)
      }
    }
  }, [id])

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">{t('tripNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
      </div>
    )
  }

  function handleSave() {
    if (!user || !id) return
    const data = { memberId: user.id, memberName: user.name, tripId: id, dates: myDates }
    saveMemberAvailability(data)
    const updated = getTripAvailabilities(id)
    setAllAvailabilities(updated)
    setSaved(true)
    toast.success(t('availabilitySaved'))
    setTimeout(() => setSaved(false), 2000)
  }

  function handleNext() {
    handleSave()
    navigate(`/trip/${trip!.id}/preferences`)
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title={t('setAvailabilityTitle')} />

      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-6 pb-8">
        {/* Group overlap banner (if computed) */}
        {overlapStart && overlapEnd ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center gap-3">
            <CalendarRange size={18} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-700">{t('groupOverlap')}</p>
              <p className="text-sm text-emerald-600 font-medium">{overlapStart} – {overlapEnd}</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-400">{t('noOverlap')}</p>
          </div>
        )}

        {/* Personal calendar */}
        <section>
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            {t('yourAvailabilityFor', { tripName: trip.name })}
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
          <Button variant="outline" onClick={handleSave} className="w-full h-12 rounded-xl">
            {saved ? (
              <><Check size={16} className="mr-2 text-success" />{t('saved')}</>
            ) : t('save')}
          </Button>
          <Button onClick={handleNext} className="w-full h-12 rounded-xl">
            {t('nextPreferences')}
          </Button>
        </div>
      </main>
    </div>
  )
}
