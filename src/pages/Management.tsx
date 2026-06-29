// src/pages/Management.tsx
// Gesamtübersicht über die Bar: zeigt ALLES, was die Gruppe eingegeben hat —
// gemeinsame Reiseziele (mit echten KI-Werten + Direkt-Bewertung) und pro
// Mitglied Verfügbarkeit, Interessen, Budget, Reiseziel-Wunsch und Bewertungen.
// Ganz oben: eine Schlussfolgerung — die gemeinsame Reise mit den Daten, die
// auf ALLE zutreffen. Bewerten ist hier direkt möglich (kein reines Lesen mehr).
import { useEffect, useState, type ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Users, Star, MapPin, MapPinned, CalendarCheck, Heart, Wallet,
  Umbrella, Building2, Trees, Mountain, Landmark, Music, Flower2, Utensils, ShoppingBag, Zap, ThumbsUp,
  Sparkles, ChevronDown, ChevronUp, Check, Crown, ListChecks, Trophy, CalendarRange,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { BottomNav } from '@/components/shared/BottomNav'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/voting/StarRating'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import {
  getTripDestinations, getTripVotes, getTripPreferences,
  getTripAvailabilities, getTripActivities, saveVote,
} from '@/utils/storage'
import { calcHybridScore } from '@/utils/scoring'
import { setActiveTrip, pullTrip, startPolling, stopPolling } from '@/services/tripSync'
import { TRIP_BG } from '@/utils/destinationImage'
import type { InterestType } from '@/types/preferences'
import type { DestinationVote } from '@/types/destination'

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
  const [openData, setOpenData] = useState<string | null>(null)
  const reload = () => setSyncTick(n => n + 1)

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

  // ── Reiseziele + Bewertung (nach Hybrid-Score sortiert) ──────────────────
  const rankedDest = destinations.map(d => {
    const votes = allVotes.filter(v => v.destinationId === d.id)
    const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
    const dataScore = d.llmAnalysis?.score ?? 0
    return {
      id: d.id, name: d.name, dataScore, starsAvg, voteCount: votes.length,
      hybrid: calcHybridScore(d.llmAnalysis?.score ?? 50, starsAvg),
      votes, dest: d,
    }
  }).sort((a, b) => b.hybrid - a.hybrid)

  const destName = (destId: string) => destinations.find(d => d.id === destId)?.name ?? '—'

  // Reiseziel-Panel öffnen und hinscrollen (z. B. aus der Mitglieder-Zeile).
  function openDestPanel(destId: string) {
    setOpenData(prev => (prev === destId ? null : destId))
    setTimeout(() => document.getElementById(`dest-${destId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
  }

  // Bewertung direkt hier speichern (vorhandenen Kommentar behalten).
  function handleVote(destId: string, stars: number) {
    if (!user) return
    const mine = allVotes.find(v => v.destinationId === destId && v.memberId === user.id)
    saveVote({
      destinationId: destId, memberId: user.id, memberName: user.name,
      stars, comment: mine?.comment, votedAt: new Date().toISOString(),
    })
    reload()
  }

  // ── Schlussfolgerung: Daten, die auf ALLE zutreffen ──────────────────────
  const winner = rankedDest[0]

  // Budget, das für alle passt = das kleinste angegebene (sonst überschreitet es jemanden).
  const budgets = allPrefs.map(p => p.budgetPerPerson).filter((n): n is number => typeof n === 'number')
  const budgetFitAll = budgets.length ? Math.min(...budgets) : null
  const budgetMax = budgets.length ? Math.max(...budgets) : null

  // Tage, an denen ALLE verfügbar sind.
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

  // Interessen, die jedes Mitglied (mit Präferenzen) ausgewählt hat.
  const prefsWithInterests = allPrefs.filter(p => (p.interests?.length ?? 0) > 0)
  const interestCount: Record<string, number> = {}
  prefsWithInterests.forEach(p => p.interests.forEach(i => { interestCount[i] = (interestCount[i] ?? 0) + 1 }))
  const sharedInterests = Object.entries(interestCount)
    .filter(([, c]) => prefsWithInterests.length > 0 && c === prefsWithInterests.length)
    .map(([i]) => i as InterestType)

  // ── Fortschritt der Gruppe ───────────────────────────────────────────────
  const progress = [
    { key: 'av', label: 'Verfügbarkeit', icon: CalendarCheck, done: allAvail.filter(a => Object.keys(a.dates || {}).length > 0).length },
    { key: 'pr', label: 'Präferenzen', icon: Heart, done: allPrefs.filter(p => (p.interests?.length ?? 0) > 0 || (p.customInterests?.length ?? 0) > 0).length },
    { key: 'bu', label: 'Budget', icon: Wallet, done: allPrefs.filter(p => p.budgetPerPerson != null).length },
    { key: 'vo', label: 'Bewertung', icon: Star, done: new Set(allVotes.map(v => v.memberId)).size },
  ]

  return (
    <div className="app-shell relative flex flex-col min-h-svh overflow-hidden">
      {/* Heller Foto-Hintergrund: am Viewport fixiert (siehe TripScreen) */}
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
            Alles, was die Gruppe eingegeben hat — für alle sichtbar. Bewerten geht hier direkt.
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

          {/* Reiseziele & Bewertung — echte KI-Werte + direkt bewerten */}
          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-bold text-ink/50 uppercase tracking-wider px-1 flex items-center gap-1.5">
              <MapPin size={13} /> Reiseziele &amp; Bewertung
            </h2>
            {rankedDest.length === 0 ? (
              <div className="rounded-2xl bg-white/80 border border-white/90 shadow-sm p-4 text-sm text-gray-500 text-center">
                Noch keine Reiseziele vorgeschlagen.
              </div>
            ) : rankedDest.map(d => {
              const open = openData === d.id
              const dest = d.dest
              const an = dest.llmAnalysis
              const isLeader = rankedDest.length > 1 && rankedDest[0].id === d.id
              const myStars = user ? (d.votes.find(v => v.memberId === user.id)?.stars ?? 0) : 0
              return (
                <div key={d.id} id={`dest-${d.id}`} className="rounded-2xl bg-white/85 backdrop-blur-md border border-white/90 shadow-sm overflow-hidden scroll-mt-20">
                  <div className="p-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-ink truncate">{d.name}</p>
                        {isLeader && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            <Crown size={9} /> Spitzenreiter
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink/50 mt-0.5">
                        Vorgeschlagen von {dest.proposedByName} · {d.voteCount} {d.voteCount === 1 ? 'Stimme' : 'Stimmen'}
                      </p>
                    </div>
                    {d.dataScore > 0 && (
                      <span className="text-xs font-bold text-primary shrink-0">{d.dataScore}%</span>
                    )}
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {d.starsAvg > 0 ? d.starsAvg.toFixed(1) : '–'}
                    </span>
                  </div>

                  {/* KI-Analyse-Zeile — Klick zeigt alle gesammelten API-Daten + Bewertung */}
                  <button
                    onClick={() => setOpenData(open ? null : d.id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 border-t border-gray-100 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
                    aria-expanded={open}
                  >
                    <span className="flex items-center gap-1.5"><Sparkles size={13} /> KI-Werte · bewerten · wer hat bewertet</span>
                    {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {open && (
                    <div className="px-3.5 pb-3.5 pt-1 flex flex-col gap-3 text-[12px] text-ink/80 border-t border-gray-50">
                      {/* Echte KI-/API-Werte */}
                      {dest.dataError ? (
                        <p className="text-danger">Echte Daten konnten nicht geladen werden.</p>
                      ) : !an ? (
                        <p className="text-ink/40 italic">Noch keine Analyse — Ziel in „Reiseziel" hinzufügen.</p>
                      ) : (
                        <div className="flex flex-col gap-2.5">
                          {dest.climate && (
                            <DataBlock label="Klima · Copernicus/ERA5">
                              ⌀ {dest.climate.temp_avg}°C ({dest.climate.temp_min}–{dest.climate.temp_max}°C) · {dest.climate.precipitation_mm} mm Niederschlag · {dest.climate.sunshine_hours} h Sonne
                            </DataBlock>
                          )}
                          {dest.biodiversity && (
                            <DataBlock label="Natur · GBIF">
                              {dest.biodiversity.species_count.toLocaleString('de-DE')} Arten · {dest.biodiversity.highlight}
                            </DataBlock>
                          )}
                          {dest.nasa && (
                            <DataBlock label="NASA POWER">
                              {dest.nasa.solar_irradiance != null && <>{dest.nasa.solar_irradiance} kWh/m²/Tag Sonne · </>}
                              {dest.nasa.humidity != null && <>{dest.nasa.humidity}% Luftfeuchte · </>}
                              {dest.nasa.wind_speed != null && <>{dest.nasa.wind_speed} m/s Wind</>}
                            </DataBlock>
                          )}
                          {dest.earthdata && (
                            <DataBlock label="NASA Earthdata">
                              {dest.earthdata.granule_count} Datensätze · {dest.earthdata.dataset}
                            </DataBlock>
                          )}
                          <DataBlock label={`Begründung · Score ${an.score}%`}>
                            {an.reasoning}
                          </DataBlock>
                          {an.dataPoints.length > 0 && (
                            <ul className="flex flex-col gap-1 mt-0.5">
                              {an.dataPoints.map((pt, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5">•</span><span>{pt}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Direkt bewerten */}
                      {!dest.dataError && (
                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-[10px] font-bold text-ink/45 uppercase tracking-wide mb-1.5">Deine Bewertung</p>
                          <StarRating value={myStars} onChange={(v) => handleVote(d.id, v)} size="md" />
                        </div>
                      )}

                      {/* Wer hat bewertet */}
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-[10px] font-bold text-ink/45 uppercase tracking-wide mb-1.5">Wer hat bewertet</p>
                        {d.votes.length === 0 ? (
                          <p className="text-ink/40 italic">Noch keine Bewertung.</p>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {d.votes.map(v => (
                              <VoterRow key={v.memberId} vote={v} isMe={v.memberId === user?.id} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
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
                            <button
                              key={d.id}
                              onClick={() => openDestPanel(d.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 transition-colors active:scale-95"
                            >
                              <Sparkles size={10} />{d.name.split(',')[0]}
                            </button>
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

// Beschrifteter Datenblock für die aufgeklappte KI-Analyse.
function DataBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-ink/45 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="leading-snug">{children}</p>
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

// Eine Stimme in „Wer hat bewertet" (mit Sternen + optionalem Kommentar).
function VoterRow({ vote, isMe }: { vote: DestinationVote; isMe: boolean }) {
  return (
    <div className={`rounded-xl px-2.5 py-2 ${isMe ? 'bg-primary/10' : 'bg-gray-50'}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink truncate flex-1">
          {vote.memberName}{isMe && <span className="text-primary"> · Du</span>}
        </span>
        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
          <Star size={11} className="fill-amber-400 text-amber-400" />{vote.stars.toFixed(1)}
        </span>
      </div>
      {vote.comment?.trim() && <p className="text-[11px] text-ink/60 mt-0.5 leading-snug">{vote.comment}</p>}
    </div>
  )
}
