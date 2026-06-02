// Autor: Mohamad Haj Ahmad
// src/pages/AIRecommendation.tsx — Screen 8: KI-Reiseziel-Empfehlung
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { DestinationCard } from '@/components/recommendations/DestinationCard'
import { AddDestinationForm } from '@/components/recommendations/AddDestinationForm'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { getTripDestinations, saveDestination, getTripVotes, getMemberVote } from '@/utils/storage'
import { getTripPreferences } from '@/utils/storage'
import { analyzeDestination } from '@/services/llmService'
import { calcHybridScore } from '@/utils/scoring'
import type { Destination, RankedDestination } from '@/types/destination'
import { Sparkles, Thermometer, Sun, Star } from 'lucide-react'
import { destinationImage, ambientImage } from '@/utils/destinationImage'
import { StepNav } from '@/components/shared/StepNav'

export default function AIRecommendation() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()

  const trip = id ? getTripById(id) : undefined

  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const loadDestinations = useCallback(() => {
    if (!id) return
    setDestinations(getTripDestinations(id))
  }, [id])

  useEffect(() => { loadDestinations() }, [loadDestinations])

  const ranked: RankedDestination[] = destinations
    .map((d) => {
      const votes = id ? getTripVotes(id).filter((v) => v.destinationId === d.id) : []
      const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
      const llmScore = d.llmAnalysis?.score ?? 50
      const myVote = user ? getMemberVote(d.id, user.id)?.stars : undefined
      return {
        ...d,
        starsAvg,
        voteCount: votes.length,
        hybridScore: calcHybridScore(llmScore, starsAvg),
        myVote,
      }
    })
    .sort((a, b) => b.hybridScore - a.hybridScore)

  async function handleAddDestination(name: string, country: string) {
    if (!id || !user || !trip) return
    setIsAdding(true)

    const dest: Destination = {
      id: crypto.randomUUID(),
      tripId: id,
      name: country ? `${name}, ${country}` : name,
      country,
      proposedBy: user.id,
      proposedByName: user.name,
      createdAt: new Date().toISOString(),
      isLoading: true,
    }
    saveDestination(dest)
    setDestinations((prev) => [...prev, dest])

    try {
      const prefs = getTripPreferences(id)
      const budgets = prefs.map((p) => p.budgetPerPerson)
      const budgetMin = budgets.length > 0 ? Math.min(...budgets) : undefined
      const budgetMax = budgets.length > 0 ? Math.max(...budgets) : undefined
      const result = await analyzeDestination({
        destination: dest.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        preferences: prefs,
        budgetMin,
        budgetMax,
      })

      const analyzed: Destination = {
        ...dest,
        isLoading: false,
        dataError: false,
        climate: result.climate,
        biodiversity: result.biodiversity,
        nasa: result.nasa,
        earthdata: result.earthdata,
        llmAnalysis: result.llm,
      }
      saveDestination(analyzed)
      setDestinations((prev) => prev.map((d) => d.id === dest.id ? analyzed : d))
    } catch {
      const failed: Destination = { ...dest, isLoading: false, dataError: true }
      saveDestination(failed)
      setDestinations((prev) => prev.map((d) => d.id === dest.id ? failed : d))
    } finally {
      setIsAdding(false)
    }
  }

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">Reise nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>Zur Übersicht</Button>
      </div>
    )
  }

  const topDest = ranked[0]
  const restDests = ranked.slice(1)

  return (
    <div
      className="app-shell flex flex-col min-h-svh"
      style={{ ['--ambient' as any]: topDest ? ambientImage(topDest.name) : undefined }}
    >
      <PageHeader
        title="AI Recommendation"
        rightSlot={<Sparkles size={20} className="text-primary" />}
      />

      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-4 pb-8">
        {/* Subtitle */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Basierend auf Verfügbarkeit, Budget &amp; Präferenzen
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Score = KI×40% + Sterne×60%
          </p>
        </div>

        {ranked.length === 0 ? (
          /* Empty state */
          <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Sparkles size={28} className="text-primary" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Noch keine Reiseziele</p>
            <p className="text-xs text-gray-500">Schlage das erste Ziel vor!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* ── Hero: top ranked destination ── */}
            {topDest && !topDest.isLoading && (
              <div className="flex flex-col gap-3">
                {/* Photo hero card */}
                <div className="photo-card h-52">
                  <img
                    src={destinationImage(topDest.name, 1000)}
                    alt={topDest.name}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="photo-scrim" />

                  {/* Best Match badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: '#5BE59B', color: '#0a4025' }}
                    >
                      Best Match
                    </span>
                  </div>

                  {/* Destination name + score */}
                  <div className="photo-title absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-medium opacity-80 mb-0.5">
                        #{1} Empfehlung
                      </p>
                      <h2 className="text-lg font-bold leading-tight">{topDest.name}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold">
                        {Math.round(topDest.hybridScore * 100)}
                        <span className="text-sm font-normal">%</span>
                      </p>
                      <p className="text-xs opacity-80">Match</p>
                    </div>
                  </div>
                </div>

                {/* 3 stat tiles below hero */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Weather tile */}
                  <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-1 text-center">
                    <Thermometer size={16} className="text-orange-400" />
                    <p className="text-base font-bold text-gray-800">
                      {topDest.climate ? `${topDest.climate.temp_avg}°` : '–'}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">Temperatur</p>
                  </div>

                  {/* Sunshine tile */}
                  <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-1 text-center">
                    <Sun size={16} className="text-amber-400" />
                    <p className="text-base font-bold text-gray-800">
                      {topDest.climate ? `${topDest.climate.sunshine_hours}h` : '–'}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">Sonnenstunden</p>
                  </div>

                  {/* Match % tile */}
                  <div className="glass-card rounded-xl p-3 flex flex-col items-center gap-1 text-center">
                    <Star size={16} className="text-primary" />
                    <p className="text-base font-bold text-primary">
                      {Math.round(topDest.hybridScore * 100)}%
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">KI-Score</p>
                  </div>
                </div>

                {/* View full card for top dest */}
                <div className="glass-card rounded-2xl overflow-hidden">
                  <DestinationCard
                    dest={topDest}
                    rank={1}
                    onVoteClick={() => navigate(`/trip/${id}/vote`)}
                  />
                </div>
              </div>
            )}

            {/* Loading state for top dest */}
            {topDest && topDest.isLoading && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <DestinationCard
                  dest={topDest}
                  rank={1}
                  onVoteClick={() => navigate(`/trip/${id}/vote`)}
                />
              </div>
            )}

            {/* Rest of ranked destinations */}
            {restDests.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                  Weitere Optionen
                </p>
                {restDests.map((d, i) => (
                  <div key={d.id} className="glass-card rounded-2xl overflow-hidden">
                    <DestinationCard
                      dest={d}
                      rank={i + 2}
                      onVoteClick={() => navigate(`/trip/${id}/vote`)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <AddDestinationForm onAdd={handleAddDestination} isLoading={isAdding} />

        <StepNav tripId={id ?? ''} current="recommendation" />
      </main>
    </div>
  )
}
