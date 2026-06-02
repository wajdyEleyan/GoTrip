// src/pages/FinalOverview.tsx
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Users, Wallet, Thermometer, Star, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { ScoreRing } from '@/components/recommendations/ScoreRing'
import { WeatherWidget } from '@/components/shared/WeatherWidget'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'
import {
  getTripDestinations,
  getTripVotes,
  getTripPreferences,
  getTripActivities,
} from '@/utils/storage'
import { calcHybridScore } from '@/utils/scoring'
import { destinationImage, ambientImage } from '@/utils/destinationImage'
import type { Destination } from '@/types/destination'
import type { Activity } from '@/types/activity'

interface WinnerDest extends Destination {
  hybridScore: number
  starsAvg: number
  voteCount: number
}

export default function FinalOverview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { t } = useLanguage()

  const trip = id ? getTripById(id) : undefined
  const [winner, setWinner] = useState<WinnerDest | null>(null)
  const confettiRef = useRef<boolean>(false)
  const [avgBudget, setAvgBudget] = useState<number | null>(null)
  const [topActivities, setTopActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (!id) return

    const dests = getTripDestinations(id)
    const allVotes = getTripVotes(id)

    const ranked = dests.map((d) => {
      const votes = allVotes.filter((v) => v.destinationId === d.id)
      const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
      const llmScore = d.llmAnalysis?.score ?? 50
      return { ...d, starsAvg, voteCount: votes.length, hybridScore: calcHybridScore(llmScore, starsAvg) }
    }).sort((a, b) => b.hybridScore - a.hybridScore)

    if (ranked.length > 0) setWinner(ranked[0])

    const prefs = getTripPreferences(id)
    if (prefs.length > 0) {
      const sum = prefs.reduce((s, p) => s + p.budgetPerPerson, 0)
      setAvgBudget(Math.round(sum / prefs.length))
    }

    const acts = getTripActivities(id).sort((a, b) => b.voteCount - a.voteCount)
    setTopActivities(acts.slice(0, 5))

    if (!confettiRef.current) {
      confettiRef.current = true
      spawnConfetti()
    }
  }, [id])

  function spawnConfetti() {
    const colors = ['#6C63FF', '#22C55E', '#F59E0B', '#EC4899', '#3B82F6', '#EF4444']
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div')
      el.className = 'confetti-piece'
      el.style.left = `${Math.random() * 100}vw`
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      el.style.animationDuration = `${1.5 + Math.random() * 2}s`
      el.style.animationDelay = `${Math.random() * 0.8}s`
      el.style.transform = `rotate(${Math.random() * 360}deg)`
      document.body.appendChild(el)
      el.addEventListener('animationend', () => el.remove())
    }
  }

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">{t('tripNotFound')}</p>
        <Button variant="outline" onClick={() => navigate('/home')}>{t('backToOverview')}</Button>
      </div>
    )
  }

  const scorePercent = winner ? Math.round(winner.hybridScore * 100) : 0

  return (
    <div
      className="app-shell flex flex-col min-h-svh"
      style={{ ['--ambient' as any]: ambientImage(winner?.name ?? trip.name ?? '') }}
    >
      <PageHeader title={t('stepFinal')} />

      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-4 pb-8">

        {/* Destination HERO photo-card */}
        {winner ? (
          <div className="photo-card" style={{ height: '220px' }}>
            <img
              src={destinationImage(winner.name, 800)}
              alt={winner.name}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <div className="photo-scrim" />
            {/* Trophy badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Trophy size={14} className="text-amber-300" />
              <span className="text-xs font-bold text-white">{t('yourDestination')}</span>
            </div>
            {/* Celebration badge */}
            <div className="absolute top-3 right-3 text-2xl">🎉</div>
            {/* Bottom title block */}
            <div className="photo-title absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
              <h1 className="text-xl font-bold leading-tight">{winner.name}</h1>
              <p className="text-sm text-white/80 mt-0.5">{winner.country}</p>
              <p className="text-xs text-white/70 mt-1">
                {new Date(trip.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                {' – '}
                {new Date(trip.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        ) : (
          /* Fallback hero when no winner yet */
          <div className="glass-card rounded-3xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h1 className="text-xl font-bold text-[#16323B] mb-1">{t('tripFinished')}</h1>
            <p className="text-primary text-sm font-medium">{trip.name}</p>
          </div>
        )}

        {/* Winning destination details */}
        {winner ? (
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={15} className="text-amber-500 shrink-0" />
                  <h2 className="text-base font-bold text-[#16323B] truncate">{winner.name}</h2>
                </div>
                {winner.climate && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    🌡️ {winner.climate.temp_avg}°C · ☀️ {winner.climate.sunshine_hours}h
                  </p>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-600">
                    {winner.starsAvg > 0 ? winner.starsAvg.toFixed(1) : '–'} · {winner.voteCount} Stimmen
                  </span>
                </div>
              </div>
              <ScoreRing score={winner.hybridScore} size={64} />
            </div>
            {winner.llmAnalysis?.reasoning && (
              <div className="mt-3 bg-primary-soft/60 rounded-xl px-3 py-2">
                <p className="text-xs text-[#16323B]/70 leading-relaxed">{winner.llmAnalysis.reasoning}</p>
              </div>
            )}
            {winner.climate && (
              <div className="mt-3">
                <WeatherWidget climate={winner.climate} />
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-4 text-center text-gray-400 text-sm py-8">
            {t('noDestinationChosen')}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Users size={15} />
              <span className="text-xs font-semibold">{t('memberCount')}</span>
            </div>
            <span className="text-2xl font-bold text-[#16323B]">{trip.members.length}</span>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Wallet size={15} />
              <span className="text-xs font-semibold">{t('budgetPerPersonLabel')}</span>
            </div>
            <span className="text-xl font-bold text-[#16323B]">
              {avgBudget != null ? `${avgBudget}€` : '–'}
            </span>
            <span className="text-xs text-gray-500">
              {avgBudget != null ? t('avgBudget') : ''}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <MapPin size={15} />
              <span className="text-xs font-semibold">{t('period')}</span>
            </div>
            <span className="text-sm font-bold text-[#16323B]">
              {new Date(trip.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
            </span>
            <span className="text-xs text-gray-500">
              bis {new Date(trip.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Thermometer size={15} />
              <span className="text-xs font-semibold">{t('aiScore')}</span>
            </div>
            <span className="text-2xl font-bold text-[#16323B]">{scorePercent}%</span>
            <span className="text-xs text-gray-500">{t('hybridScore')}</span>
          </div>
        </div>

        {/* Top Activities */}
        {topActivities.length > 0 && (
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-sm font-bold text-[#16323B] mb-3">{t('topActivities')}</h3>
            <div className="flex flex-col gap-2">
              {topActivities.map((act, i) => (
                <div key={act.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary/60 w-4">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#16323B] truncate">{act.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-success font-semibold">
                    <span>👍</span>
                    <span>{act.voteCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-bold text-[#16323B] mb-3">{t('group')}</h3>
          <div className="flex flex-wrap gap-2">
            {trip.members.map((m) => (
              <div
                key={m.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${m.avatarColor ?? 'bg-primary'}`}
              >
                {m.name}
                {m.role === 'admin' && <span className="text-white/70">★</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={() => navigate(`/trip/${id}/budget`)}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold"
          >
            {t('openBudgetTracker')}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/trip/${id}/activities`)}
            className="w-full h-12 rounded-xl border-primary/30 text-primary hover:bg-primary-soft"
          >
            {t('editActivities')}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="w-full h-12 rounded-xl border-primary/30 text-primary hover:bg-primary-soft"
          >
            {t('toHomePage')}
          </Button>
        </div>
      </main>
    </div>
  )
}
