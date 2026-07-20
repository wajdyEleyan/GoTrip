// Autor: Wajdy Eleyan, Amal Najah
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
import {
  getMemberPreferences, getTripDestinations, getTripPreferences,
  getTripVotes, getTripAvailabilities, getTripExpenses,
  getLastVisit, markVisited, getVisitCount, saveVisitCount,
  getTripById as getTripByIdFromStorage,
} from '@/utils/storage'
import { TRIP_BG } from '@/utils/destinationImage'
import type { PlanStep } from '@/utils/flow'
import type { InterestType } from '@/types/preferences'
import {
  Users, Calendar, Heart, MapPinned, Star, Zap, Trophy, Wallet, CalendarRange,
  MapPin, Wallet as WalletIcon, Lock,
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
  { key: 'recommendation' as TileKey, labelKey: 'tileDestination' as const, icon: MapPinned, descKey: 'stepRecommendationDesc' as const },
  { key: 'vote' as TileKey, labelKey: 'stepVote' as const, icon: Star, descKey: 'stepVoteDesc' as const },
  { key: 'activities' as TileKey, labelKey: 'stepActivities' as const, icon: Zap, descKey: 'stepActivitiesDesc' as const },
  { key: 'final' as TileKey, labelKey: 'stepFinal' as const, icon: Trophy, descKey: 'stepFinalDesc' as const },
  { key: 'budget' as TileKey, labelKey: 'stepBudget' as const, icon: Wallet, descKey: 'stepBudgetDesc' as const },
]

const TILE_KEYS: TileKey[] = ['dates', 'members', 'availability', 'preferences', 'recommendation', 'budget', 'activities']
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
  const [activitiesUnlocked, setActivitiesUnlocked] = useState(false)
  const [badges, setBadges] = useState<Partial<Record<TileKey, number>>>({})

  useEffect(() => {
    if (!id || !user) return
    const mine = getMemberPreferences(id, user.id)
    setMyBudget(mine?.budgetPerPerson ?? null)
    setMyInterests(mine?.interests ?? [])
    const dests = getTripDestinations(id)
    setDestCount(dests.length)
    // Aktivitäten freischalten
    const hasDates = trip && trip.startDate !== trip.endDate
    const hasDestination = dests.length > 0
    const allPrefs = getTripPreferences(id)
    const hasPrefs = allPrefs.some(p => p.interests.length > 0 && p.budgetPerPerson > 0)
    setActivitiesUnlocked(!!(hasDates && hasDestination && hasPrefs))
    // Badges berechnen
    const newBadges: Partial<Record<TileKey, number>> = {}

    // Timestamp-basiert: Reiseziele & Votes
    const lastDest = getLastVisit(id, 'recommendation')
    if (lastDest) {
      const count = dests.filter(d => d.createdAt > lastDest).length
      if (count > 0) newBadges['recommendation'] = count
    }
    const lastVote = getLastVisit(id, 'vote')
    if (lastVote) {
      const count = getTripVotes(id).filter(v => v.votedAt > lastVote).length
      if (count > 0) newBadges['vote'] = count
    }

    // Zählbasiert: Mitglieder, Verfügbarkeit, Präferenzen, Budget
    function countBadge(tile: TileKey, current: number) {
      const saved = getVisitCount(id!, tile)
      if (saved >= 0 && current > saved) newBadges[tile] = current - saved
    }
    countBadge('members', getTripByIdFromStorage(id)?.members.length ?? 0)
    countBadge('availability', getTripAvailabilities(id).length)
    countBadge('preferences', getTripPreferences(id).length)
    countBadge('budget', getTripExpenses(id).length)

    setBadges(newBadges)
  }, [id, user, openTile, syncTick])

  // Counts beim ersten Öffnen initialisieren (damit spätere Änderungen Badges auslösen)
  useEffect(() => {
    if (!id) return
    if (getVisitCount(id, 'members') < 0) {
      const t = getTripByIdFromStorage(id)
      saveVisitCount(id, 'members', t?.members.length ?? 0)
    }
    if (getVisitCount(id, 'availability') < 0)
      saveVisitCount(id, 'availability', getTripAvailabilities(id).length)
    if (getVisitCount(id, 'preferences') < 0)
      saveVisitCount(id, 'preferences', getTripPreferences(id).length)
    if (getVisitCount(id, 'budget') < 0)
      saveVisitCount(id, 'budget', getTripExpenses(id).length)
    if (!getLastVisit(id, 'recommendation'))
      markVisited(id, 'recommendation')
    if (!getLastVisit(id, 'vote'))
      markVisited(id, 'vote')
  }, [id]) // nur einmal beim Öffnen

  // Badge-Updates: bei jedem Sync-Event UND alle 4s als Fallback
  useEffect(() => {
    const tick = () => setSyncTick((t) => t + 1)
    window.addEventListener('gotrip-sync', tick)
    const timer = setInterval(tick, 4000)
    return () => { window.removeEventListener('gotrip-sync', tick); clearInterval(timer) }
  }, [])

  function closePopup() { setOpenTile(null) }

  if (!trip || !user) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">{t('tripNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
      </div>
    )
  }

  const openStep = STEPS.find(s => s.key === openTile)

  const datesSet = trip.startDate !== trip.endDate
  const fmtDate = (iso: string) => {
    try { return format(parseISO(iso), 'd. MMM', { locale: de }) } catch { return iso }
  }
  const dateRange = datesSet ? `${fmtDate(trip.startDate)} – ${fmtDate(trip.endDate)}` : t('notSetYet')

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
      {/* Heller Foto-Hintergrund: am Viewport fixiert (wächst nicht mit der Seite) */}
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: TRIP_BG, filter: 'blur(2px)', transform: 'scale(1.08)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/80 to-white" />
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

          {/* Section label */}
          <p className="text-xs font-bold text-ink/60 uppercase tracking-wider px-1 mt-1">{t('whatToDo')}</p>

          {/* Kacheln — zwei Spalten, kompakt, neutral; Petrol nur bei Hover */}
          <div className="grid grid-cols-2 gap-3">
            {DASHBOARD_TILES.map(({ key, labelKey, icon: Icon }) => {
              const locked = key === 'activities' && !activitiesUnlocked
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (locked) return
                    if (id) {
                      markVisited(id, key)
                      // Zählbasierte Tiles: aktuellen Stand merken
                      if (key === 'members') saveVisitCount(id, 'members', trip!.members.length)
                      if (key === 'availability') saveVisitCount(id, 'availability', getTripAvailabilities(id).length)
                      if (key === 'preferences') saveVisitCount(id, 'preferences', getTripPreferences(id).length)
                      if (key === 'budget') saveVisitCount(id, 'budget', getTripExpenses(id).length)
                    }
                    setBadges(prev => ({ ...prev, [key]: 0 }))
                    setOpenTile(key)
                  }}
                  disabled={locked}
                  title={locked ? 'Erst Urlaubstage, Reiseziel, Präferenzen & Budget ausfüllen' : undefined}
                  className={`group relative text-left rounded-2xl border shadow-sm p-4 flex items-center gap-3 transition-all ${
                    locked
                      ? 'border-gray-200/50 bg-white/50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200/80 bg-white/85 backdrop-blur-md active:scale-[0.97] hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Badge */}
                  {!locked && (badges[key] ?? 0) > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10">
                      {badges[key]}
                    </span>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${locked ? 'bg-gray-100' : 'bg-primary/10 group-hover:bg-white/20'}`}>
                    {locked
                      ? <Lock size={16} className="text-gray-400" />
                      : <Icon size={18} className="text-primary transition-colors group-hover:text-white" />
                    }
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className={`font-semibold text-sm leading-tight transition-colors ${locked ? 'text-gray-400' : 'text-ink group-hover:text-white'}`}>{t(labelKey)}</p>
                    {locked && <p className="text-[10px] text-gray-400 mt-0.5">Alle Schritte ausfüllen</p>}
                  </div>
                </button>
              )
            })}
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
