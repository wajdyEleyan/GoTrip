import { useState, useEffect, useCallback } from 'react'
import { VotingCard } from '@/components/voting/VotingCard'
import { DestinationImage } from '@/components/shared/DestinationImage'
import { getTripDestinations, getTripVotes, saveVote, getMemberVote } from '@/utils/storage'
import { calcHybridScore } from '@/utils/scoring'
import { toast } from '@/components/shared/Toast'
import type { RankedDestination } from '@/types/destination'
import type { Trip } from '@/types/trip'
import type { StoredAuth } from '@/utils/storage'

interface Props {
  trip: Trip
  user: StoredAuth
  onNext: () => void
}

export function VoteSheet({ trip, user, onNext }: Props) {
  const [ranked, setRanked] = useState<RankedDestination[]>([])
  const [myVotes, setMyVotes] = useState<Record<string, number>>({})

  const buildRanked = useCallback(() => {
    const dests = getTripDestinations(trip.id)
    const allVotes = getTripVotes(trip.id)
    const built: RankedDestination[] = dests.map(d => {
      const votes = allVotes.filter(v => v.destinationId === d.id)
      const starsAvg = votes.length > 0 ? votes.reduce((s, v) => s + v.stars, 0) / votes.length : 0
      const myVoteObj = getMemberVote(d.id, user.id)
      return {
        ...d,
        starsAvg,
        voteCount: votes.length,
        hybridScore: calcHybridScore(d.llmAnalysis?.score ?? 50, starsAvg),
        myVote: myVoteObj?.stars ?? 0,
        myComment: myVoteObj?.comment ?? '',
        allVotes: votes,
      }
    }).sort((a, b) => b.hybridScore - a.hybridScore)
    setRanked(built)
    const votes: Record<string, number> = {}
    built.forEach(d => { votes[d.id] = d.myVote ?? 0 })
    setMyVotes(votes)
  }, [trip.id, user.id])

  useEffect(() => { buildRanked() }, [buildRanked])

  function handleVote(destId: string, stars: number, comment = '') {
    saveVote({ destinationId: destId, memberId: user.id, memberName: user.name, stars, comment, votedAt: new Date().toISOString() })
    setMyVotes(prev => ({ ...prev, [destId]: stars }))
    buildRanked()
    if (stars > 0) toast.success(`${stars}★ gespeichert!`)
  }

  const hasVoted = Object.values(myVotes).some(v => v > 0)

  if (ranked.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-gray-500 text-sm">
        Noch keine Reiseziele. Gehe zurück zu KI-Empfehlung.
      </div>
    )
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4 pb-6">
      <p className="text-sm text-gray-600 text-center">Bewerte jedes Ziel mit 0,5–5 Sternen</p>

      {ranked.map(d => (
        <div key={d.id} className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="relative h-24 bg-gray-100">
            <DestinationImage name={d.name} width={600} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <p className="absolute bottom-2 left-3 text-sm font-bold text-white truncate right-3">{d.name}</p>
          </div>
          <div className="bg-white">
            <VotingCard
              dest={d}
              myVote={myVotes[d.id] ?? 0}
              myComment={d.myComment}
              onVote={(stars, comment) => handleVote(d.id, stars, comment)}
            />
          </div>
        </div>
      ))}

      <button
        onClick={onNext}
        disabled={!hasVoted}
        className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center disabled:opacity-40 active:scale-[0.98] transition-transform"
      >
        Fertig
      </button>
    </div>
  )
}
