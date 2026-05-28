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
import { Sparkles } from 'lucide-react'

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
      const result = await analyzeDestination({
        destination: dest.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        preferences: prefs,
        budgetMin: trip.budgetMin,
        budgetMax: trip.budgetMax,
      })

      const analyzed: Destination = {
        ...dest,
        isLoading: false,
        climate: result.climate,
        biodiversity: result.biodiversity,
        llmAnalysis: result.llm,
      }
      saveDestination(analyzed)
      setDestinations((prev) => prev.map((d) => d.id === dest.id ? analyzed : d))
    } catch {
      const failed: Destination = { ...dest, isLoading: false }
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

  return (
    <div className="app-shell flex flex-col min-h-svh bg-gray-50">
      <PageHeader
        title="AI Recommendation"
        rightSlot={<Sparkles size={20} className="text-primary" />}
      />

      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-4 pb-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Basierend auf Verfügbarkeit, Budget & Präferenzen
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Score = KI×40% + Sterne×60%
          </p>
        </div>

        {ranked.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Sparkles size={28} className="text-primary" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Noch keine Reiseziele</p>
            <p className="text-xs text-gray-400">Schlage das erste Ziel vor!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ranked.map((d, i) => (
              <DestinationCard
                key={d.id}
                dest={d}
                rank={i + 1}
                onVoteClick={() => navigate(`/trip/${id}/vote`)}
              />
            ))}
          </div>
        )}

        <AddDestinationForm onAdd={handleAddDestination} isLoading={isAdding} />

        {ranked.length > 0 && (
          <Button onClick={() => navigate(`/trip/${id}/vote`)} className="w-full mt-2">
            Abstimmen & Entscheiden
          </Button>
        )}
      </main>
    </div>
  )
}
