// Autor: Amal Najah
// src/components/recommendations/DestinationCard.tsx
import { useState } from 'react'
import { ChevronDown, ChevronUp, Thermometer, CloudRain, Sun, Star, MessageSquare } from 'lucide-react'
import { DataSourceBadges } from './DataSourceBadges'
import { DestinationSkeleton } from '@/components/shared/SkeletonCard'
import { StarRating } from '@/components/voting/StarRating'
import { ScoreRing } from '@/components/recommendations/ScoreRing'
import { cn } from '@/lib/utils'
import type { RankedDestination } from '@/types/destination'

interface DestinationCardProps {
  dest: RankedDestination
  rank: number
  myVote?: number
  myComment?: string
  onVote?: (stars: number, comment: string) => void
}

export function DestinationCard({ dest, rank, myVote = 0, myComment = '', onVote }: DestinationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [comment, setComment] = useState(myComment)
  const [showComment, setShowComment] = useState(!!myComment)

  const rankColors = ['bg-amber-400', 'bg-gray-300', 'bg-amber-600']
  const rankColor = rankColors[rank - 1] ?? 'bg-gray-200'

  if (dest.isLoading) return <DestinationSkeleton />

  if (dest.dataError) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs font-bold shrink-0 mt-0.5">{rank}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{dest.name}</h3>
            <p className="text-xs text-red-500 mt-1">Echte Daten konnten nicht geladen werden (offline?). Erneut versuchen.</p>
          </div>
        </div>
      </div>
    )
  }

  function handleStarChange(stars: number) {
    onVote?.(stars, comment)
  }

  function handleCommentBlur() {
    if (myVote > 0) onVote?.(myVote, comment)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Header: Rang + Name + Score-Ring */}
        <div className="flex items-start gap-3">
          <div className={cn('flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0 mt-0.5', rankColor)}>
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{dest.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Vorgeschlagen von {dest.proposedByName}</p>

            {dest.climate && (
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Thermometer size={12} className="text-orange-400" />{dest.climate.temp_avg}°C</span>
                <span className="flex items-center gap-1"><CloudRain size={12} className="text-blue-400" />{dest.climate.precipitation_mm}mm</span>
                <span className="flex items-center gap-1"><Sun size={12} className="text-amber-400" />{dest.climate.sunshine_hours}h</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span>{dest.starsAvg > 0 ? dest.starsAvg.toFixed(1) : '–'} ({dest.voteCount} Stimmen)</span>
            </div>
          </div>

          {(dest.dynamicAnalysis ?? dest.llmAnalysis) && <ScoreRing score={dest.hybridScore} size={52} />}
        </div>

        {/* Datenquellen */}
        {dest.llmAnalysis && (
          <div className="mt-3">
            <DataSourceBadges
              hasClimate={!!dest.climate}
              hasBiodiv={!!dest.biodiversity}
              hasNasa={!!dest.nasa}
              hasEarthdata={!!dest.earthdata}
            />
          </div>
        )}

        {/* Warum dieser Score? — zeigt dynamisch berechnete Begründung */}
        {(() => {
          const analysis = dest.dynamicAnalysis ?? dest.llmAnalysis
          if (!analysis?.reasoning) return null
          return (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 mt-3 text-xs text-primary font-medium"
                aria-expanded={expanded}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded ? 'Weniger' : 'Warum dieser Score?'}
              </button>
              {expanded && (
                <div className="mt-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed">
                  <p className="mb-2">{analysis.reasoning}</p>
                  <ul className="space-y-1">
                    {analysis.dataPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )
        })()}

        {/* Bewertung */}
        {onVote && (
          <div className="mt-4 border-t border-gray-100 pt-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-600">Deine Bewertung:</p>
            <StarRating value={myVote} onChange={handleStarChange} size="lg" />
            {myVote > 0 && (
              <p className="text-xs text-gray-400">Tippe nochmal auf denselben Stern zum Zurücksetzen</p>
            )}

            {myVote > 0 && (
              <div className="border-t border-gray-100 pt-2">
                <button
                  onClick={() => setShowComment(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary transition-colors"
                >
                  <MessageSquare size={13} />
                  {showComment ? 'Kommentar ausblenden' : 'Kommentar hinzufügen'}
                </button>
                {showComment && (
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onBlur={handleCommentBlur}
                    placeholder="Warum diese Bewertung? (optional)"
                    rows={2}
                    className="mt-2 w-full text-sm text-gray-700 placeholder-gray-400 border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                    maxLength={200}
                  />
                )}
              </div>
            )}

            {/* Gruppenkommentare */}
            {dest.allVotes && dest.allVotes.filter(v => v.comment?.trim()).length > 0 && (
              <div className="border-t border-gray-100 pt-2 flex flex-col gap-2">
                <p className="text-xs font-medium text-gray-500">Gruppenkommentare:</p>
                {dest.allVotes.filter(v => v.comment?.trim()).map(v => (
                  <div key={v.memberId} className="bg-gray-50 rounded-xl px-3 py-2">
                    <p className="text-xs font-medium text-gray-700">{v.memberName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{v.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
