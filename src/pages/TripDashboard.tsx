// src/pages/TripDashboard.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'
import { getTripPreferences } from '@/utils/storage'
import {
  Users, Calendar, Heart, Sparkles, Star, Zap, Trophy, Wallet, ChevronRight
} from 'lucide-react'

export default function TripDashboard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { t } = useLanguage()

  const trip = id ? getTripById(id) : undefined
  const [avgBudget, setAvgBudget] = useState<number | null>(null)
  const [overlapStart, setOverlapStart] = useState<string | null>(null)
  const [overlapEnd, setOverlapEnd] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    const prefs = getTripPreferences(id)
    if (prefs.length > 0) {
      const sum = prefs.reduce((s, p) => s + p.budgetPerPerson, 0)
      setAvgBudget(Math.round(sum / prefs.length))

      // Calculate date overlap: latest start date AND earliest end date
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
    }
  }, [id])

  const STEPS = [
    { labelKey: 'stepMembers' as const, icon: Users, path: 'members', descKey: 'stepMembersDesc' as const },
    { labelKey: 'stepAvailability' as const, icon: Calendar, path: 'availability', descKey: 'stepAvailabilityDesc' as const },
    { labelKey: 'stepPreferences' as const, icon: Heart, path: 'preferences', descKey: 'stepPreferencesDesc' as const },
    { labelKey: 'stepRecommendation' as const, icon: Sparkles, path: 'recommendation', descKey: 'stepRecommendationDesc' as const, highlight: true },
    { labelKey: 'stepVote' as const, icon: Star, path: 'vote', descKey: 'stepVoteDesc' as const },
    { labelKey: 'stepActivities' as const, icon: Zap, path: 'activities', descKey: 'stepActivitiesDesc' as const },
    { labelKey: 'stepFinal' as const, icon: Trophy, path: 'final', descKey: 'stepFinalDesc' as const },
    { labelKey: 'stepBudget' as const, icon: Wallet, path: 'budget', descKey: 'stepBudgetDesc' as const },
  ]

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">{t('tripNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
      </div>
    )
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-gray-50">
      <PageHeader title={trip.name} backTo="/home" />

      <main className="flex-1 px-4 py-5 pb-8 overflow-y-auto flex flex-col gap-3">
        {/* Trip info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">📅 Zeitraum</span>
              <span className="text-gray-700 font-medium">
                {trip.startDate} – {trip.endDate}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">👥 {t('memberCount')}</span>
              <span className="text-gray-700 font-medium">{trip.members.length}</span>
            </div>
            {avgBudget != null && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">💶 {t('avgBudgetLabel')}</span>
                <span className="text-gray-700 font-medium">{avgBudget}€</span>
              </div>
            )}
            {overlapStart && overlapEnd && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">✅ {t('commonPeriod')}</span>
                <span className="text-gray-700 font-medium text-xs">{overlapStart} – {overlapEnd}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section label */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mt-1">
          {t('whatToDo')}
        </p>

        {/* Step tiles */}
        {STEPS.map(({ labelKey, icon: Icon, path, descKey, highlight }) => (
          <button
            key={path}
            onClick={() => navigate(`/trip/${id}/${path}`)}
            className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-all active:scale-[0.98] hover:shadow-md ${
              highlight
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                : 'bg-white border-gray-100 text-gray-900'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              highlight ? 'bg-white/20' : 'bg-primary/10'
            }`}>
              <Icon size={20} className={highlight ? 'text-white' : 'text-primary'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${highlight ? 'text-white' : 'text-gray-900'}`}>
                {t(labelKey)}
              </p>
              <p className={`text-xs mt-0.5 ${highlight ? 'text-white/80' : 'text-gray-400'}`}>
                {t(descKey)}
              </p>
            </div>
            <ChevronRight size={18} className={highlight ? 'text-white/60' : 'text-gray-300'} />
          </button>
        ))}
      </main>
    </div>
  )
}
