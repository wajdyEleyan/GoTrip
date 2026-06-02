// src/components/sheets/RecommendationSheet.tsx
import { useState, useEffect, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { DestinationCard } from '@/components/recommendations/DestinationCard'
import { AddDestinationForm } from '@/components/recommendations/AddDestinationForm'
import {
  getTripDestinations, saveDestination, getTripVotes,
  getMemberVote, getTripPreferences,
} from '@/utils/storage'
import { analyzeDestination } from '@/services/llmService'
import { calcHybridScore } from '@/utils/scoring'
import { toast } from '@/components/shared/Toast'
import type { Destination, RankedDestination } from '@/types/destination'
import type { Trip } from '@/types/trip'
import type { StoredAuth } from '@/utils/storage'

interface Props {
  trip: Trip
  user: StoredAuth
  onNext: () => void
}

export function RecommendationSheet({ trip, user, onNext }: Props) {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const load = useCallback(() => {
    setDestinations(getTripDestinations(trip.id))
  }, [trip.id])

  useEffect(() => { load() }, [load])

  const ranked: RankedDestination[] = destinations
    .map(d => {
      const votes = getTripVotes(trip.id).filter(v => v.destinationId === d.id)
      const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
      return {
        ...d,
        starsAvg,
        voteCount: votes.length,
        hybridScore: calcHybridScore(d.llmAnalysis?.score ?? 50, starsAvg),
        myVote: getMemberVote(d.id, user.id)?.stars,
      }
    })
    .sort((a, b) => b.hybridScore - a.hybridScore)

  async function handleAddDestination(name: string, country: string) {
    setIsAdding(true)
    const dest: Destination = {
      id: crypto.randomUUID(),
      tripId: trip.id,
      name: country ? `${name}, ${country}` : name,
      country,
      proposedBy: user.id,
      proposedByName: user.name,
      createdAt: new Date().toISOString(),
      isLoading: true,
    }
    saveDestination(dest)
    setDestinations(prev => [...prev, dest])

    try {
      const prefs = getTripPreferences(trip.id)
      const budgets = prefs.map(p => p.budgetPerPerson)
      const result = await analyzeDestination({
        destination: dest.name,
        startDate: trip.startDate,
        endDate: trip.endDate,
        preferences: prefs,
        budgetMin: budgets.length > 0 ? Math.min(...budgets) : undefined,
        budgetMax: budgets.length > 0 ? Math.max(...budgets) : undefined,
      })
      const analyzed: Destination = {
        ...dest, isLoading: false, dataError: false,
        climate: result.climate,
        biodiversity: result.biodiversity,
        nasa: result.nasa,
        earthdata: result.earthdata,
        llmAnalysis: result.llm,
      }
      saveDestination(analyzed)
      setDestinations(prev => prev.map(d => d.id === dest.id ? analyzed : d))
    } catch (err) {
      // Kein Mock-Fallback — echte Daten waren nicht verfügbar.
      toast.error(err instanceof Error ? err.message : 'Daten nicht verfügbar')
      const failed: Destination = { ...dest, isLoading: false, dataError: true }
      saveDestination(failed)
      setDestinations(prev => prev.map(d => d.id === dest.id ? failed : d))
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4 pb-6">
      <p className="text-xs text-gray-500 text-center">Score = KI × 40% + Sterne × 60%</p>

      {ranked.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2 text-center">
          <Sparkles size={32} className="text-primary opacity-50" />
          <p className="text-sm text-gray-500">Schlage das erste Reiseziel vor!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ranked.map((d, i) => (
            <DestinationCard key={d.id} dest={d} rank={i + 1} showVoteButton={false} />
          ))}
        </div>
      )}

      <AddDestinationForm onAdd={handleAddDestination} isLoading={isAdding} />

      {ranked.length > 0 && (
        <button
          onClick={onNext}
          className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
        >
          Fertig
        </button>
      )}
    </div>
  )
}
