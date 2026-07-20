import { useEffect, useRef, useState } from 'react'
import { Trophy, Users, Wallet, Star, ThumbsUp } from 'lucide-react'
import { ScoreRing } from '@/components/recommendations/ScoreRing'
import { WeatherWidget } from '@/components/shared/WeatherWidget'
import { getTripDestinations, getTripVotes, getTripPreferences, getTripActivities } from '@/utils/storage'
import { calcHybridScore } from '@/utils/scoring'
import { destinationImage } from '@/utils/destinationImage'
import type { Destination } from '@/types/destination'
import type { Activity } from '@/types/activity'
import type { Trip } from '@/types/trip'

interface WinnerDest extends Destination {
  hybridScore: number
  starsAvg: number
  voteCount: number
}

interface Props {
  trip: Trip
  onNext: () => void
}

function spawnConfetti() {
  const colors = ['#6C63FF', '#22C55E', '#F59E0B', '#EC4899', '#3B82F6']
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    el.style.left = `${Math.random() * 100}vw`
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    el.style.animationDuration = `${1.5 + Math.random() * 2}s`
    el.style.animationDelay = `${Math.random() * 0.8}s`
    document.body.appendChild(el)
    el.addEventListener('animationend', () => el.remove())
  }
}

export function FinalSheet({ trip, onNext }: Props) {
  const [winner, setWinner] = useState<WinnerDest | null>(null)
  const [avgBudget, setAvgBudget] = useState<number | null>(null)
  const [topActivities, setTopActivities] = useState<Activity[]>([])
  const confettiFired = useRef(false)

  useEffect(() => {
    const dests = getTripDestinations(trip.id)
    const allVotes = getTripVotes(trip.id)
    const ranked = dests.map(d => {
      const votes = allVotes.filter(v => v.destinationId === d.id)
      const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
      return { ...d, starsAvg, voteCount: votes.length, hybridScore: calcHybridScore(d.llmAnalysis?.score ?? 50, starsAvg) }
    }).sort((a, b) => b.hybridScore - a.hybridScore)
    if (ranked.length > 0) setWinner(ranked[0])

    const prefs = getTripPreferences(trip.id)
    if (prefs.length > 0) {
      setAvgBudget(Math.round(prefs.reduce((s, p) => s + p.budgetPerPerson, 0) / prefs.length))
    }
    setTopActivities(getTripActivities(trip.id).sort((a, b) => b.voteCount - a.voteCount).slice(0, 5))

    if (!confettiFired.current) { confettiFired.current = true; spawnConfetti() }
  }, [trip.id])

  return (
    <div className="px-4 py-4 flex flex-col gap-4 pb-6">
      {winner ? (
        <>
          {/* Hero photo */}
          <div className="rounded-2xl overflow-hidden h-44 relative bg-gray-100">
            <img
              src={destinationImage(winner.name, 800)}
              alt={winner.name}
              className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Trophy size={13} className="text-amber-300" />
              <span className="text-xs font-bold text-white">Euer Reiseziel</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
              <h2 className="text-lg font-bold text-white">{winner.name}</h2>
              <p className="text-xs text-white/80">{winner.country}</p>
            </div>
          </div>

          {/* Score + reasoning */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Star size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-xs text-gray-500">
                  {winner.starsAvg > 0 ? winner.starsAvg.toFixed(1) : '–'} · {winner.voteCount} Stimmen
                </span>
              </div>
              {winner.llmAnalysis?.reasoning && (
                <p className="text-xs text-gray-500 leading-relaxed">{winner.llmAnalysis.reasoning}</p>
              )}
              {winner.climate && <div className="mt-2"><WeatherWidget climate={winner.climate} /></div>}
            </div>
            <ScoreRing score={winner.hybridScore} size={60} />
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-500 text-sm">
          Noch kein Reiseziel gewählt. Stimmt zuerst ab.
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Users size={14} />
            <span className="text-xs font-semibold">Mitglieder</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">{trip.members.length}</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Wallet size={14} />
            <span className="text-xs font-semibold">Budget / Person</span>
          </div>
          <span className="text-xl font-bold text-gray-900">{avgBudget != null ? `${avgBudget}€` : '–'}</span>
        </div>
      </div>

      {/* Top activities */}
      {topActivities.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Top Aktivitäten</h3>
          <div className="flex flex-col gap-2">
            {topActivities.map((act, i) => (
              <div key={act.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}.</span>
                <p className="flex-1 text-sm text-gray-800 truncate">{act.name}</p>
                <span className="flex items-center gap-1 text-xs text-green-500 font-semibold"><ThumbsUp size={12} /> {act.voteCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Gruppe</h3>
        <div className="flex flex-wrap gap-2">
          {trip.members.map(m => (
            <div key={m.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white ${m.avatarColor ?? 'bg-primary'}`}>
              {m.name}
              {m.role === 'admin' && <span className="text-white/70">★</span>}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onNext}
        className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        Fertig
      </button>
    </div>
  )
}
