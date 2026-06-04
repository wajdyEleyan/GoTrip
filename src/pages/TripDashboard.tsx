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
import { TRIP_BG } from '@/utils/destinationImage'
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
  { key: 'recommendation' as TileKey, labelKey: 'stepRecommendation' as const, icon: Sparkles, descKey: 'stepRecommendationDesc' as const },
  { key: 'vote' as TileKey, labelKey: 'stepVote' as const, icon: Star, descKey: 'stepVoteDesc' as const },
  { key: 'activities' as TileKey, labelKey: 'stepActivities' as const, icon: Zap, descKey: 'stepActivitiesDesc' as const },
  { key: 'final' as TileKey, labelKey: 'stepFinal' as const, icon: Trophy, descKey: 'stepFinalDesc' as const },
  { key: 'budget' as TileKey, labelKey: 'stepBudget' as const, icon: Wallet, descKey: 'stepBudgetDesc' as const },
]

// Auf dem Dashboard sichtbare Kacheln (Abstimmen & Aktivitäten sind keine eigenen Kacheln mehr:
// Bewerten passiert in der KI-Empfehlung, Aktivitäten in den Präferenzen).
// 'vote'/'activities'/'final' bleiben im Switch erreichbar (Smart-Next).
const TILE_KEYS: TileKey[] = ['dates', 'members', 'availability', 'preferences', 'recommendation', 'budget']
const DASHBOARD_TILES = TILE_KEYS.map(k => STEPS.find(s => s.key === k)!)

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
      {/* Heller Foto-Hintergrund: Bild bleibt sichtbar, liegt aber unter einem hellen Schleier */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: TRIP_BG, filter: 'blur(2px)', transform: 'scale(1.08)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/72 via-white/90 to-white/96" />
      </div>

      <div className="relative z-10 flex flex-col min-h-svh">
        <PageHeader title={trip.name} backTo="/home" transparent onLight />

        <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto flex flex-col gap-3">
          {/* Zusammenfassung — weiße Frost-Karte */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm p-4 flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <SummaryItem icon={CalendarRange} label={t('travelPeriod').replace(' *', '')} value={dateRange} muted={!datesSet} />
              <SummaryItem icon={Users} label={t('memberCount')} value={`${trip.members.length}`} />
            </div>

            {myBudget != null && (
              <div className="border-t border-gray-100 pt-3">
                <SummaryItem icon={WalletIcon} label={t('stepBudget')} value={`${myBudget.toLocaleString('de-DE')} €`} />
              </div>
            )}

            {myInterests.length > 0 && (
              <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">{t('interests')}</span>
                <div className="flex flex-wrap gap-1.5">
                  {myInterests.map(i => {
                    const Icon = INTEREST_ICON[i]
                    return (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold capitalize">
                        <Icon size={13} aria-hidden="true" />{i}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {destCount > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <SummaryItem icon={MapPin} label="Vorgeschlagene Ziele" value={`${destCount}`} />
              </div>
            )}
          </div>

          {/* Smart Next — nächster offener Schritt (einziger kräftiger Petrol-Block) */}
          <button
            onClick={() => setOpenTile(nextStep)}
            className="w-full rounded-2xl bg-primary text-white p-4 flex items-center gap-3 shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
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
          <p className="text-xs font-bold text-ink/50 uppercase tracking-wider px-1 mt-1">{t('whatToDo')}</p>

          {/* Kacheln — zwei Spalten, kompakt, neutral; Petrol nur bei Hover */}
          <div className="grid grid-cols-2 gap-3">
            {DASHBOARD_TILES.map(({ key, labelKey, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setOpenTile(key)}
                className="group text-left rounded-2xl border border-gray-200/80 bg-white/85 backdrop-blur-md shadow-sm p-4 flex items-center gap-3 transition-all active:scale-[0.97] hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-white/20">
                  <Icon size={18} className="text-primary transition-colors group-hover:text-white" />
                </div>
                <p className="font-semibold text-sm leading-tight text-ink transition-colors group-hover:text-white">{t(labelKey)}</p>
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
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-ink/45 uppercase tracking-wider leading-none">{label}</span>
        <span className={`text-sm font-semibold truncate leading-tight mt-0.5 ${muted ? 'text-ink/45 italic font-normal' : 'text-ink'}`}>
          {value}
        </span>
      </div>
    </div>
  )
}
