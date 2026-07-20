// Autor: Wajdy Eleyan, Mohamad Haj Ahmad
import { useEffect, useState, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Users, Star, MapPinned, CalendarCheck, Heart, Wallet,
  Umbrella, Building2, Trees, Mountain, Landmark, Music, Flower2, Utensils, ShoppingBag, Zap, ThumbsUp,
  Sparkles, Check, Crown, ListChecks, Trophy, CalendarRange,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BottomNav } from '@/components/shared/BottomNav'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import {
  getTripDestinations, getTripVotes, getTripPreferences,
  getTripAvailabilities, getTripActivities,
} from '@/utils/storage'
import { calcHybridScore } from '@/utils/scoring'
import { setActiveTrip, pullTrip, startPolling, stopPolling } from '@/services/tripSync'
import { TRIP_BG } from '@/utils/destinationImage'
import type { InterestType } from '@/types/preferences'

const INTEREST_ICON: Record<InterestType, LucideIcon> = {
  beach: Umbrella, city: Building2, nature: Trees, adventure: Mountain, culture: Landmark,
  nightlife: Music, relaxation: Flower2, food: Utensils, shopping: ShoppingBag,
}

const fmtDay = (iso: string) => {
  try { return format(parseISO(iso), 'd. MMM', { locale: de }) } catch { return iso }
}

export default function Management() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()
  const { t } = useLanguage()

  const trip = id ? getTripById(id) : undefined
  const [, setSyncTick] = useState(0)

  const tripCode = trip?.inviteCode
  useEffect(() => {
    if (!id || !tripCode) return
    setActiveTrip(id, tripCode)
    void pullTrip(tripCode)
    startPolling()
    const onSync = () => setSyncTick(n => n + 1)
    window.addEventListener('gotrip-sync', onSync)
    return () => {
      window.removeEventListener('gotrip-sync', onSync)
      stopPolling()
      setActiveTrip(null)
    }
  }, [id, tripCode])

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">{t('tripNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
      </div>
    )
  }

  const destinations = getTripDestinations(trip.id)
  const allVotes = getTripVotes(trip.id)
  const allPrefs = getTripPreferences(trip.id)
  const allAvail = getTripAvailabilities(trip.id)
  const activities = getTripActivities(trip.id)
  const memberCount = trip.members.length

  const rankedDest = destinations.map(d => {
    const votes = allVotes.filter(v => v.destinationId === d.id)
    const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
    return {
      id: d.id, name: d.name, starsAvg, voteCount: votes.length,
      hybrid: calcHybridScore(d.llmAnalysis?.score ?? 50, starsAvg),
    }
  }).sort((a, b) => b.hybrid - a.hybrid)

  const destName = (destId: string) => destinations.find(d => d.id === destId)?.name ?? '—'

  const winner = rankedDest[0]

  const budgets = allPrefs.map(p => p.budgetPerPerson).filter((n): n is number => typeof n === 'number')
  const budgetFitAll = budgets.length ? Math.min(...budgets) : null
  const budgetMax = budgets.length ? Math.max(...budgets) : null

  const dayCount: Record<string, number> = {}
  allAvail.forEach(a => Object.entries(a.dates || {}).forEach(([d, s]) => {
    if (s === 'available') dayCount[d] = (dayCount[d] ?? 0) + 1
  }))
  const commonDays = Object.entries(dayCount)
    .filter(([, c]) => memberCount > 0 && c === memberCount)
    .map(([d]) => d).sort()
  const commonRange = commonDays.length
    ? (commonDays.length === 1 ? fmtDay(commonDays[0]) : `${fmtDay(commonDays[0])} – ${fmtDay(commonDays[commonDays.length - 1])}`)
    : null

  const prefsWithInterests = allPrefs.filter(p => (p.interests?.length ?? 0) > 0)
  const interestCount: Record<string, number> = {}
  prefsWithInterests.forEach(p => p.interests.forEach(i => { interestCount[i] = (interestCount[i] ?? 0) + 1 }))
  const sharedInterests = Object.entries(interestCount)
    .filter(([, c]) => prefsWithInterests.length > 0 && c === prefsWithInterests.length)
    .map(([i]) => i as InterestType)

  const progress = [
    { key: 'av', label: 'Verfügbarkeit', icon: CalendarCheck, done: allAvail.filter(a => Object.keys(a.dates || {}).length > 0).length },
    { key: 'pr', label: 'Präferenzen', icon: Heart, done: allPrefs.filter(p => (p.interests?.length ?? 0) > 0 || (p.customInterests?.length ?? 0) > 0).length },
    { key: 'bu', label: 'Budget', icon: Wallet, done: allPrefs.filter(p => p.budgetPerPerson != null).length },
    { key: 'vo', label: 'Bewertung', icon: Star, done: new Set(allVotes.map(v => v.memberId)).size },
  ]

  return (
    <div className="app-shell relative flex flex-col min-h-svh overflow-hidden">
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: TRIP_BG, filter: 'blur(2px)', transform: 'scale(1.08)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/92 to-white" />
      </div>

      <div className="relative z-10 flex flex-col min-h-svh">
        <PageHeader title={t('navManagement')} backTo={`/trip/${trip.id}/dashboard`} transparent onLight />

        <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto flex flex-col gap-4">
          <p className="text-xs text-ink/55 px-1">
            Alles, was die Gruppe eingegeben hat — für alle sichtbar.
          </p>

          {/* ════════ SCHLUSSFOLGERUNG — die gemeinsame Reise ════════ */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-bold text-primary uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Sparkles size={13} /> Schlussfolgerung · Eure Reise
            </h2>
            <div className="rounded-2xl bg-primary/95 text-white shadow-lg shadow-primary/25 p-4 flex flex-col gap-3.5">
              <p className="text-[11px] text-white/80 leading-snug">
                Automatisch aus euren Eingaben — die Daten, die auf <b>alle</b> zutreffen.
              </p>

              <ConclusionRow icon={Trophy} label="Reiseziel">
                {winner
                  ? <>{winner.name} <span className="text-white/70">· {Math.round(winner.hybrid * 100)}%{winner.starsAvg > 0 ? ` · ${winner.starsAvg.toFixed(1)}★` : ''}</span></>
                  : <span className="text-white/60">noch kein Ziel bewertet</span>}
              </ConclusionRow>

              <ConclusionRow icon={CalendarRange} label="Zeitraum für alle">
                {commonRange
                  ? <>{commonRange} <span className="text-white/70">· {commonDays.length} {commonDays.length === 1 ? 'Tag' : 'Tage'}, an dem alle können</span></>
                  : <span className="text-white/60">noch kein gemeinsamer Tag</span>}
              </ConclusionRow>

              <ConclusionRow icon={Wallet} label="Budget für alle">
                {budgetFitAll != null
                  ? <>bis {budgetFitAll.toLocaleString('de-DE')} € p. P.{budgetMax != null && budgetMax !== budgetFitAll && <span className="text-white/70"> · Spanne bis {budgetMax.toLocaleString('de-DE')} €</span>}</>
                  : <span className="text-white/60">noch kein Budget angegeben</span>}
              </ConclusionRow>

              <ConclusionRow icon={Heart} label="Gemeinsame Interessen">
                {sharedInterests.length > 0
                  ? <span className="flex flex-wrap gap-1">
                      {sharedInterests.map(i => {
                        const Icon = INTEREST_ICON[i]
                        return (
                          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-semibold capitalize">
                            <Icon size={11} />{i}
                          </span>
                        )
                      })}
                    </span>
                  : <span className="text-white/60">keine, die alle teilen</span>}
              </ConclusionRow>
            </div>
          </section>

          {/* Status / Fortschritt der Gruppe */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-bold text-ink/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <ListChecks size={13} /> Status der Gruppe
            </h2>
            <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-sm p-3.5 grid grid-cols-2 gap-3.5">
              {progress.map(({ key, label, icon: Icon, done }) => {
                const complete = memberCount > 0 && done >= memberCount
                return (
                  <div key={key} className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${complete ? 'bg-success/15' : 'bg-primary/10'}`}>
                      {complete ? <Check size={15} className="text-success" /> : <Icon size={15} className="text-primary" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-ink/45 uppercase tracking-wide leading-none">{label}</p>
                      <p className={`text-sm font-bold leading-tight mt-0.5 ${complete ? 'text-success' : 'text-ink'}`}>{done}/{memberCount}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Pro Mitglied — eigenes Profil hervorgehoben */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-bold text-ink/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Users size={13} /> Pro Mitglied
            </h2>
            {trip.members.map(m => {
              const isMe = m.id === user?.id
              const av = allAvail.find(a => a.memberId === m.id)
              const counts = { available: 0, maybe: 0, 'not-available': 0 } as Record<string, number>
              if (av) Object.values(av.dates).forEach(s => { counts[s] = (counts[s] ?? 0) + 1 })
              const pref = allPrefs.find(p => p.memberId === m.id)
              const myVotes = allVotes.filter(v => v.memberId === m.id)
              const myDests = destinations.filter(d => d.proposedBy === m.id)
              const initials = m.name.charAt(0).toUpperCase()

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl backdrop-blur-md shadow-sm p-3.5 flex flex-col gap-2.5 ${
                    isMe
                      ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20'
                      : 'bg-white/85 border border-white/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? 'bg-primary ring-2 ring-white' : 'bg-primary/70'}`}>{initials}</div>
                    <span className="flex-1 text-sm font-bold text-ink truncate">{m.name}</span>
                    {isMe && <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full">Du</span>}
                    {m.role === 'admin' && <span className="text-[10px] font-bold text-primary flex items-center gap-0.5"><Crown size={11} />Admin</span>}
                  </div>

                  <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5 text-[12px] text-ink/80">
                    {/* Reiseziel-Wunsch */}
                    <span className="flex items-center gap-1.5 text-ink/45"><MapPinned size={13} /> Reiseziel</span>
                    <span className="flex flex-wrap gap-1">
                      {myDests.length > 0
                        ? myDests.map(d => (
                            <span
                              key={d.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold"
                            >
                              <Sparkles size={10} />{d.name.split(',')[0]}
                            </span>
                          ))
                        : <span className="text-ink/35">noch keins vorgeschlagen</span>}
                    </span>

                    {/* Verfügbarkeit */}
                    <span className="flex items-center gap-1.5 text-ink/45"><CalendarCheck size={13} /> Verfügbar</span>
                    <span>
                      {av
                        ? <>
                            <b className="text-success">{counts.available}</b> Ja
                            {counts.maybe > 0 && <> · <b className="text-warning">{counts.maybe}</b> Vielleicht</>}
                            {counts['not-available'] > 0 && <> · <b className="text-danger">{counts['not-available']}</b> Nein</>}
                          </>
                        : <span className="text-ink/35">noch offen</span>}
                    </span>

                    {/* Interessen */}
                    <span className="flex items-center gap-1.5 text-ink/45"><Heart size={13} /> Interessen</span>
                    <span className="flex flex-wrap gap-1">
                      {pref && pref.interests.length > 0
                        ? pref.interests.map(i => {
                            const Icon = INTEREST_ICON[i]
                            return (
                              <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold capitalize">
                                <Icon size={11} />{i}
                              </span>
                            )
                          })
                        : <span className="text-ink/35">noch offen</span>}
                      {pref?.customInterests?.map(c => (
                        <span key={c} className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">{c}</span>
                      ))}
                    </span>

                    {/* Budget */}
                    <span className="flex items-center gap-1.5 text-ink/45"><Wallet size={13} /> Budget</span>
                    <span>{pref ? `${pref.budgetPerPerson.toLocaleString('de-DE')} €` : <span className="text-ink/35">noch offen</span>}</span>

                    {/* Bewertungen */}
                    <span className="flex items-center gap-1.5 text-ink/45"><Star size={13} /> Bewertung</span>
                    <span>
                      {myVotes.length > 0
                        ? myVotes.map(v => `${destName(v.destinationId).split(',')[0]}: ${v.stars}★`).join(' · ')
                        : <span className="text-ink/35">noch offen</span>}
                    </span>
                  </div>
                </div>
              )
            })}
          </section>

          {/* Aktivitäten-Wünsche der Gruppe */}
          {activities.length > 0 && (
            <section className="flex flex-col gap-2">
              <h2 className="text-[11px] font-bold text-ink/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <Zap size={13} /> Aktivitäten-Wünsche
              </h2>
              <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-sm p-3.5 flex flex-col divide-y divide-gray-100">
                {[...activities].sort((a, b) => b.voteCount - a.voteCount).map(a => (
                  <div key={a.id} className="flex items-center gap-2 py-2 first:pt-0 last:pb-0">
                    <span className="flex-1 text-sm font-medium text-ink truncate">{a.name}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-success shrink-0"><ThumbsUp size={12} />{a.voteCount}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  )
}

// Zeile in der Schlussfolgerungs-Karte (weiß auf Petrol).
function ConclusionRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-white/70 uppercase tracking-wide leading-none">{label}</p>
        <div className="text-sm font-semibold leading-tight mt-1">{children}</div>
      </div>
    </div>
  )
}
