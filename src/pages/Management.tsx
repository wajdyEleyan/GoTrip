// src/pages/Management.tsx
// Gesamtübersicht über die Bar: zeigt ALLES, was die Gruppe eingegeben hat —
// gemeinsame Reiseziele + Bewertungen und pro Mitglied Verfügbarkeit, Interessen,
// Budget und abgegebene Bewertungen. Reine Lese-Ansicht (für alle sichtbar).
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Users, Star, MapPin, CalendarCheck, Heart, Wallet,
  Umbrella, Building2, Trees, Mountain, Landmark, Music, Flower2, Utensils, ShoppingBag, Zap, ThumbsUp,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BottomNav } from '@/components/shared/BottomNav'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
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

export default function Management() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
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

  // Reiseziele + Bewertung (nach Hybrid-Score sortiert)
  const rankedDest = destinations.map(d => {
    const votes = allVotes.filter(v => v.destinationId === d.id)
    const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
    const dataScore = d.llmAnalysis?.score ?? 0
    return {
      id: d.id, name: d.name, dataScore, starsAvg, voteCount: votes.length,
      hybrid: calcHybridScore(d.llmAnalysis?.score ?? 50, starsAvg),
    }
  }).sort((a, b) => b.hybrid - a.hybrid)

  const destName = (destId: string) => destinations.find(d => d.id === destId)?.name ?? '—'

  return (
    <div className="app-shell relative flex flex-col min-h-svh overflow-hidden">
      {/* Heller Foto-Hintergrund (Bild bleibt unter hellem Schleier) */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: TRIP_BG, filter: 'blur(2px)', transform: 'scale(1.08)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/72 via-white/90 to-white/96" />
      </div>

      <div className="relative z-10 flex flex-col min-h-svh">
        <PageHeader title={t('navManagement')} backTo={`/trip/${trip.id}/dashboard`} transparent onLight />

        <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto flex flex-col gap-4">
          <p className="text-xs text-ink/55 px-1">
            Alles, was die Gruppe eingegeben hat — für alle sichtbar.
          </p>

          {/* Reiseziele & Bewertung */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-bold text-ink/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <MapPin size={13} /> Reiseziele &amp; Bewertung
            </h2>
            {rankedDest.length === 0 ? (
              <div className="rounded-2xl bg-white/80 border border-white/90 shadow-sm p-4 text-sm text-gray-500 text-center">
                Noch keine Reiseziele vorgeschlagen.
              </div>
            ) : rankedDest.map(d => (
              <div key={d.id} className="rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-sm p-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{d.name}</p>
                  <p className="text-[11px] text-ink/50 mt-0.5">{d.voteCount} {d.voteCount === 1 ? 'Stimme' : 'Stimmen'}</p>
                </div>
                {d.dataScore > 0 && (
                  <span className="text-xs font-bold text-primary shrink-0">{d.dataScore}%</span>
                )}
                <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {d.starsAvg > 0 ? d.starsAvg.toFixed(1) : '–'}
                </span>
              </div>
            ))}
          </section>

          {/* Pro Mitglied — alles im Überblick */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-bold text-ink/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <Users size={13} /> Pro Mitglied
            </h2>
            {trip.members.map(m => {
              const av = allAvail.find(a => a.memberId === m.id)
              const counts = { available: 0, maybe: 0, 'not-available': 0 } as Record<string, number>
              if (av) Object.values(av.dates).forEach(s => { counts[s] = (counts[s] ?? 0) + 1 })
              const pref = allPrefs.find(p => p.memberId === m.id)
              const myVotes = allVotes.filter(v => v.memberId === m.id)
              const initials = m.name.charAt(0).toUpperCase()

              return (
                <div key={m.id} className="rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-sm p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">{initials}</div>
                    <span className="flex-1 text-sm font-bold text-ink truncate">{m.name}</span>
                    {m.role === 'admin' && <span className="text-[10px] font-bold text-primary">Admin</span>}
                  </div>

                  <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5 text-[12px] text-ink/80">
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
