// src/pages/TripDashboard.tsx
// Ein Screen: alle Planungsdaten als Kacheln in einem 2-Spalten-Raster.
// Antippen öffnet den Inhalt in einem Glas-Pop-up (Blur dahinter).
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { PageHeader } from '@/components/shared/PageHeader'
import { BottomNav } from '@/components/shared/BottomNav'
import { GlassPopup } from '@/components/shared/GlassPopup'
import { Button } from '@/components/ui/button'
import { DatesSheet } from '@/components/sheets/DatesSheet'
import { MembersSheet } from '@/components/sheets/MembersSheet'
import { AvailabilitySheet } from '@/components/sheets/AvailabilitySheet'
import { PreferencesSheet } from '@/components/sheets/PreferencesSheet'
import { RecommendationSheet } from '@/components/sheets/RecommendationSheet'
import { VoteSheet } from '@/components/sheets/VoteSheet'
import { ActivitiesSheet } from '@/components/sheets/ActivitiesSheet'
import { FinalSheet } from '@/components/sheets/FinalSheet'
import { BudgetSheet } from '@/components/sheets/BudgetSheet'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { getMemberPreferences, getTripDestinations } from '@/utils/storage'
import { setActiveTrip, pullTrip, startPolling, stopPolling } from '@/services/tripSync'
import { ambientImage } from '@/utils/destinationImage'
import { firstIncompleteStep, stepLabelKey, type PlanStep } from '@/utils/flow'
import type { InterestType } from '@/types/preferences'
import {
  Users, Calendar, Heart, Sparkles, Star, Zap, Trophy, Wallet, CalendarRange,
  MapPin, Wallet as WalletIcon, ChevronRight, ArrowRight,
  Umbrella, Building2, Trees, Mountain, Landmark, Music, Flower2, Utensils, ShoppingBag,
  type LucideIcon,
} from 'lucide-react'

type TileKey = PlanStep | 'budget' | 'dates'

const INTEREST_ICON: Record<InterestType, LucideIcon> = {
  beach: Umbrella, city: Building2, nature: Trees, adventure: Mountain, culture: Landmark,
  nightlife: Music, relaxation: Flower2, food: Utensils, shopping: ShoppingBag,
}

const STEPS = [
  { key: 'dates' as TileKey, labelKey: 'stepDates' as const, icon: CalendarRange, descKey: 'stepDatesDesc' as const },
  { key: 'members' as TileKey, labelKey: 'stepMembers' as const, icon: Users, descKey: 'stepMembersDesc' as const },
  { key: 'availability' as TileKey, labelKey: 'stepAvailability' as const, icon: Calendar, descKey: 'stepAvailabilityDesc' as const },
  { key: 'preferences' as TileKey, labelKey: 'stepPreferences' as const, icon: Heart, descKey: 'stepPreferencesDesc' as const },
  { key: 'recommendation' as TileKey, labelKey: 'stepRecommendation' as const, icon: Sparkles, descKey: 'stepRecommendationDesc' as const, highlight: true },
  { key: 'vote' as TileKey, labelKey: 'stepVote' as const, icon: Star, descKey: 'stepVoteDesc' as const },
  { key: 'activities' as TileKey, labelKey: 'stepActivities' as const, icon: Zap, descKey: 'stepActivitiesDesc' as const },
  { key: 'final' as TileKey, labelKey: 'stepFinal' as const, icon: Trophy, descKey: 'stepFinalDesc' as const },
  { key: 'budget' as TileKey, labelKey: 'stepBudget' as const, icon: Wallet, descKey: 'stepBudgetDesc' as const },
]

export default function TripDashboard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()
  const { t } = useLanguage()

  const trip = id ? getTripById(id) : undefined
  const [openTile, setOpenTile] = useState<TileKey | null>(null)
  const [myBudget, setMyBudget] = useState<number | null>(null)
  const [myInterests, setMyInterests] = useState<InterestType[]>([])
  const [destCount, setDestCount] = useState(0)
  const [syncTick, setSyncTick] = useState(0)

  useEffect(() => {
    if (!id || !user) return
    const mine = getMemberPreferences(id, user.id)
    setMyBudget(mine?.budgetPerPerson ?? null)
    setMyInterests(mine?.interests ?? [])
    setDestCount(getTripDestinations(id).length)
  }, [id, user, openTile, syncTick])

  // Geteilte Reise: vom Server laden, regelmäßig aktualisieren, bei Updates neu rendern.
  const tripCode = trip?.inviteCode
  useEffect(() => {
    if (!id || !tripCode) return
    setActiveTrip(id, tripCode)
    void pullTrip(tripCode)
    startPolling()
    const onSync = () => setSyncTick((t) => t + 1)
    window.addEventListener('gotrip-sync', onSync)
    return () => {
      window.removeEventListener('gotrip-sync', onSync)
      stopPolling()
      setActiveTrip(null)
    }
  }, [id, tripCode])

  function closePopup() { setOpenTile(null) }

  if (!trip || !user) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">{t('tripNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
      </div>
    )
  }

  const nextStep = firstIncompleteStep(trip.id)
  const openStep = STEPS.find(s => s.key === openTile)

  const datesSet = trip.startDate !== trip.endDate
  const fmtDate = (iso: string) => {
    try { return format(parseISO(iso), 'd. MMM', { locale: de }) } catch { return iso }
  }
  const dateRange = datesSet ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` : 'Noch festlegen'

  function renderTileContent(key: TileKey) {
    switch (key) {
      case 'dates':
        return <DatesSheet trip={trip!} onNext={closePopup} />
      case 'members':
        return <MembersSheet trip={trip!} onNext={closePopup} />
      case 'availability':
        return <AvailabilitySheet trip={trip!} user={user!} onNext={closePopup} />
      case 'preferences':
        return <PreferencesSheet trip={trip!} user={user!} onNext={closePopup} />
      case 'recommendation':
        return <RecommendationSheet trip={trip!} user={user!} onNext={closePopup} />
      case 'vote':
        return <VoteSheet trip={trip!} user={user!} onNext={closePopup} />
      case 'activities':
        return <ActivitiesSheet trip={trip!} user={user!} onNext={closePopup} />
      case 'final':
        return <FinalSheet trip={trip!} onNext={closePopup} />
      case 'budget':
        return <BudgetSheet trip={trip!} user={user!} onNext={closePopup} />
    }
  }

  return (
    <div className="app-shell relative flex flex-col min-h-svh overflow-hidden">
      {/* Dunkler Foto-Hintergrund (wie „Explore"-Home) */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: ambientImage(trip.name), filter: 'blur(3px) brightness(0.6)', transform: 'scale(1.08)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E2E33]/85 via-[#0E2E33]/72 to-[#0E2E33]/92" />
      </div>

      <div className="relative z-10 flex flex-col min-h-svh">
        <PageHeader title={trip.name} backTo="/home" transparent />

        <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto flex flex-col gap-3">
          {/* Zusammenfassung — Glas auf dunklem Grund */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <SummaryItem icon={CalendarRange} label={t('travelPeriod').replace(' *', '')} value={dateRange} muted={!datesSet} />
              <SummaryItem icon={Users} label={t('memberCount')} value={`${trip.members.length}`} />
            </div>

            {myBudget != null && (
              <div className="border-t border-white/15 pt-3">
                <SummaryItem icon={WalletIcon} label={t('stepBudget')} value={`${myBudget.toLocaleString('de-DE')} €`} />
              </div>
            )}

            {myInterests.length > 0 && (
              <div className="border-t border-white/15 pt-3 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">{t('interests')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {myInterests.map(i => {
                    const Icon = INTEREST_ICON[i]
                    return (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold capitalize">
                        <Icon size={13} aria-hidden="true" />{i}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {destCount > 0 && (
              <div className="border-t border-white/15 pt-3">
                <SummaryItem icon={MapPin} label="Vorgeschlagene Ziele" value={`${destCount}`} />
              </div>
            )}
          </div>

          {/* Smart Next — nächster offener Schritt */}
          <button
            onClick={() => setOpenTile(nextStep)}
            className="w-full rounded-2xl bg-primary text-white p-4 flex items-center gap-3 shadow-lg shadow-black/30 active:scale-[0.98] transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ArrowRight size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">Vorschlag</p>
              <p className="font-bold text-sm truncate">{t(stepLabelKey(nextStep) as any)}</p>
            </div>
            <ChevronRight size={18} className="text-white/70" />
          </button>

          {/* Section label */}
          <p className="text-xs font-bold text-white/60 uppercase tracking-wider px-1 mt-1">{t('whatToDo')}</p>

          {/* Kacheln — zwei Spalten, Glas auf dunklem Grund */}
          <div className="grid grid-cols-2 gap-3">
            {STEPS.map(({ key, labelKey, icon: Icon, descKey, highlight }) => (
              <button
                key={key}
                onClick={() => setOpenTile(key)}
                className={`text-left rounded-2xl border p-4 flex flex-col gap-3 min-h-[124px] transition-all active:scale-[0.97] ${
                  highlight
                    ? 'bg-primary text-white border-primary shadow-lg shadow-black/30'
                    : 'bg-white/10 backdrop-blur-md border-white/15 text-white hover:bg-white/15'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  highlight ? 'bg-white/20' : 'bg-white/15'
                }`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-end">
                  <p className="font-semibold text-sm leading-tight text-white">{t(labelKey)}</p>
                  <p className={`text-xs mt-0.5 leading-snug ${highlight ? 'text-white/80' : 'text-white/65'}`}>{t(descKey)}</p>
                </div>
              </button>
            ))}
          </div>
        </main>

        <BottomNav />
      </div>

      {/* Glas-Pop-up mit dem Inhalt der angetippten Kachel */}
      <GlassPopup
        open={openTile !== null}
        title={openStep ? t(openStep.labelKey) : ''}
        onClose={closePopup}
      >
        {openTile && renderTileContent(openTile)}
      </GlassPopup>
    </div>
  )
}

// Kompakte Zeile für die Zusammenfassung (Icon · Label · Wert)
function SummaryItem({
  icon: Icon, label, value, muted,
}: {
  icon: typeof Users
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-white" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-white/55 uppercase tracking-wider leading-none">{label}</span>
        <span className={`text-sm font-semibold truncate leading-tight mt-0.5 ${muted ? 'text-white/55 italic font-normal' : 'text-white'}`}>
          {value}
        </span>
      </div>
    </div>
  )
}
