// Autor: Wajdy Eleyan
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TripScreen } from '@/components/shared/TripScreen'
import { Button } from '@/components/ui/button'
import { StepNav } from '@/components/shared/StepNav'
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
import { destinationImage } from '@/utils/destinationImage'

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
    <TripScreen title="Abstimmen" backTo={`/trip/${id}/dashboard`}>
      <main className="flex-1 px-4 py-5 overflow-y-auto flex flex-col gap-5 pb-28">
        <p className="text-sm text-gray-600 text-center">
          Bewerte jedes Reiseziel mit 0,5–5 Sternen
        </p>

        {ranked.length === 0 ? (
          <div className="glass-card rounded-2xl px-6 py-10 text-center text-sm text-gray-500">
            Noch keine Reiseziele vorgeschlagen.
          </div>
        ) : (
          ranked.map((d) => (
            <div key={d.id} className="flex flex-col gap-0">
              {/* Photo header strip */}
              <div className="photo-card h-28">
                <img
                  src={destinationImage(d.name, 600)}
                  alt={d.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div className="photo-scrim" />
                <div className="photo-title absolute inset-0 flex flex-col justify-end px-4 pb-3">
                  <h3 className="text-base font-bold leading-tight truncate">{d.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/80 mt-0.5">
                    {d.country && <span>{d.country}</span>}
                    {d.climate && (
                      <>
                        {d.country && <span>·</span>}
                        <span>{d.climate.temp_avg}°C · {d.climate.sunshine_hours}h Sonne</span>
                      </>
                    )}
                  </div>
                  {/* Vote summary chip */}
                  <div className="absolute right-3 bottom-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow text-xs font-semibold text-gray-700">
                    <span className="text-yellow-500">★</span>
                    <span>{d.starsAvg > 0 ? d.starsAvg.toFixed(1) : '–'}</span>
                    <span className="text-gray-400 font-normal">({d.voteCount})</span>
                  </div>
                </div>
              </div>

              {/* Voting controls — glass surface flush below photo */}
              <div className="glass-card rounded-b-2xl rounded-t-none overflow-hidden shadow-[0_12px_30px_-18px_rgba(15,60,70,0.45)]">
                <VotingCard
                  dest={d}
                  myVote={myVotes[d.id] ?? 0}
                  myComment={d.myComment}
                  onVote={(stars, comment) => handleVote(d.id, stars, comment)}
                />
              </div>
            </div>
          ))
        )}

        <StepNav tripId={id ?? ''} current="vote" disabled={!hasVoted} />
      </main>
    </TripScreen>
  )
}
