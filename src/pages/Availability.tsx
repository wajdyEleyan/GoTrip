import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CalendarRange } from 'lucide-react'
import { TripScreen } from '@/components/shared/TripScreen'
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
import { StepNav } from '@/components/shared/StepNav'
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
  const [, setSaved] = useState(false)
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


  return (
    <TripScreen title={t('setAvailabilityTitle')} backTo={`/trip/${id}/dashboard`}>
      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-5 pb-28">
        {/* Group overlap banner */}
        {overlapStart && overlapEnd ? (
          <div className="glass-card rounded-2xl px-4 py-3 flex items-center gap-3 border-l-4 border-[#3FBF6A]">
            <CalendarRange size={18} className="shrink-0" style={{ color: '#3FBF6A' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: '#3FBF6A' }}>{t('groupOverlap')}</p>
              <p className="text-sm font-semibold text-primary">{overlapStart} – {overlapEnd}</p>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-400 italic">{t('noOverlap')}</p>
          </div>
        )}

        {/* Personal calendar */}
        <section className="glass-card rounded-2xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-primary">
            {t('yourAvailabilityFor', { tripName: trip.name })}
          </h2>
          <HeatmapLegend />
          <div className="mt-1">
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
          <section className="glass-card rounded-2xl p-4">
            <GroupHeatmap
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              memberAvailabilities={allAvailabilities}
              totalMembers={trip.members.length}
            />
          </section>
        )}

        {/* Actions */}
        <StepNav
          tripId={id ?? ''}
          current="availability"
          onBeforeNext={handleSave}
          label={`${t('save')} & ${t('continue')}`}
        />
      </main>
    </TripScreen>
  )
}
