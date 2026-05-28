// Autor: Wajdy Eleyan
// src/pages/VoteDecide.tsx — Screen 9: Abstimmen & Entscheiden
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { VotingCard } from '@/components/voting/VotingCard'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import {
  getTripDestinations,
  getTripVotes,
  saveVote,
  getMemberVote,
} from '@/utils/storage'
import { calcHybridScore } from '@/utils/scoring'
import type { RankedDestination } from '@/types/destination'
import { toast } from '@/components/shared/Toast'

export default function VoteDecide() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()
  const { user } = useAuth()

  const trip = id ? getTripById(id) : undefined
  const [ranked, setRanked] = useState<RankedDestination[]>([])
  const [myVotes, setMyVotes] = useState<Record<string, number>>({})

  const buildRanked = useCallback(() => {
    if (!id) return
    const dests = getTripDestinations(id)
    const allVotes = getTripVotes(id)

    const built: RankedDestination[] = dests.map((d) => {
      const votes = allVotes.filter((v) => v.destinationId === d.id)
      const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
      const llmScore = d.llmAnalysis?.score ?? 50
      const myVoteObj = user ? getMemberVote(d.id, user.id) : undefined
      return {
        ...d,
        starsAvg,
        voteCount: votes.length,
        hybridScore: calcHybridScore(llmScore, starsAvg),
        myVote: myVoteObj?.stars ?? 0,
        myComment: myVoteObj?.comment ?? '',
        allVotes: votes,
      }
    }).sort((a, b) => b.hybridScore - a.hybridScore)

    setRanked(built)

    const votes: Record<string, number> = {}
    built.forEach((d) => { votes[d.id] = d.myVote ?? 0 })
    setMyVotes(votes)
  }, [id, user])

  useEffect(() => { buildRanked() }, [buildRanked])

  function handleVote(destId: string, stars: number, comment = '') {
    if (!user) return
    const vote = {
      destinationId: destId,
      memberId: user.id,
      memberName: user.name,
      stars,
      comment,
      votedAt: new Date().toISOString(),
    }
    saveVote(vote)
    setMyVotes((prev) => ({ ...prev, [destId]: stars }))
    buildRanked()
    if (stars > 0) toast.success(`${stars}★ gespeichert!`)
  }

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">Reise nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>Zur Übersicht</Button>
      </div>
    )
  }

  const hasVoted = Object.values(myVotes).some((v) => v > 0)

  return (
    <div className="app-shell flex flex-col min-h-svh bg-gray-50">
      <PageHeader title="Vote & Decide" />

      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-4 pb-8">
        <p className="text-sm text-gray-500 text-center">
          Bewerte jedes Reiseziel mit 0,5–5 Sternen
        </p>

        {ranked.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Noch keine Reiseziele vorgeschlagen.
          </div>
        ) : (
          ranked.map((d) => (
            <VotingCard
              key={d.id}
              dest={d}
              myVote={myVotes[d.id] ?? 0}
              myComment={d.myComment}
              onVote={(stars, comment) => handleVote(d.id, stars, comment)}
            />
          ))
        )}

        <Button
          onClick={() => navigate(`/trip/${id}/final`)}
          disabled={!hasVoted && ranked.length > 0}
          className="w-full"
        >
          Ergebnis ansehen
        </Button>
      </main>
    </div>
  )
}
