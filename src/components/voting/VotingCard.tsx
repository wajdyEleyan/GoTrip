// Autor: Amal Najah
// src/components/voting/VotingCard.tsx
import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { StarRating } from './StarRating'
import { ScoreRing } from '@/components/recommendations/ScoreRing'
import type { RankedDestination } from '@/types/destination'

interface VotingCardProps {
  dest: RankedDestination
  myVote: number
  myComment?: string
  onVote: (stars: number, comment: string) => void
}

export function VotingCard({ dest, myVote, myComment = '', onVote }: VotingCardProps) {
  const [comment, setComment] = useState(myComment)
  const [showComment, setShowComment] = useState(!!myComment)

  function handleStarChange(stars: number) {
    onVote(stars, comment)
  }

  function handleCommentBlur() {
    if (myVote > 0) onVote(myVote, comment)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{dest.name}</h3>
          {dest.climate && (
            <p className="text-xs text-gray-500 mt-0.5">
              🌡️ {dest.climate.temp_avg}°C · ☀️ {dest.climate.sunshine_hours}h Sonne
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Gruppe: ⭐ {dest.starsAvg > 0 ? dest.starsAvg.toFixed(1) : '–'}</span>
            <span>·</span>
            <span>{dest.voteCount} Stimmen</span>
          </div>
        </div>
        {dest.llmAnalysis && <ScoreRing score={dest.hybridScore} size={56} />}
      </div>

      {/* Star rating */}
      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-medium text-gray-600 mb-2">Deine Bewertung:</p>
        <StarRating value={myVote} onChange={handleStarChange} size="lg" />
        {myVote > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Tippe nochmal auf denselben Stern zum Zurücksetzen
          </p>
        )}
      </div>

      {/* Comment toggle */}
      {myVote > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowComment((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary transition-colors"
            aria-expanded={showComment}
          >
            <MessageSquare size={13} />
            {showComment ? 'Kommentar ausblenden' : 'Kommentar hinzufügen'}
          </button>

          {showComment && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={handleCommentBlur}
              placeholder="Warum diese Bewertung? (optional)"
              rows={2}
              className="mt-2 w-full text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-label="Kommentar zur Bewertung"
              maxLength={200}
            />
          )}
        </div>
      )}

      {/* Other members' comments */}
      {dest.allVotes && dest.allVotes.filter((v) => v.comment?.trim()).length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3 flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-500">Gruppenkommentare:</p>
          {dest.allVotes
            .filter((v) => v.comment?.trim())
            .map((v) => (
              <div key={v.memberId} className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs font-medium text-gray-700">{v.memberName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{v.comment}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
