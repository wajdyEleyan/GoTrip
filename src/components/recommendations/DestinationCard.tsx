// Autor: Amal Najah
// src/components/recommendations/DestinationCard.tsx
import { useState } from 'react'
import { ChevronDown, ChevronUp, Thermometer, CloudRain, Sun } from 'lucide-react'
import { ScoreRing } from './ScoreRing'
import { DataSourceBadges } from './DataSourceBadges'
import { DestinationSkeleton } from '@/components/shared/SkeletonCard'
import { cn } from '@/lib/utils'
import type { RankedDestination } from '@/types/destination'

interface DestinationCardProps {
  dest: RankedDestination
  rank: number
  onVoteClick?: () => void
  showVoteButton?: boolean
}

export function DestinationCard({ dest, rank, onVoteClick, showVoteButton = true }: DestinationCardProps) {
  const [expanded, setExpanded] = useState(false)

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
            <p className="text-xs text-red-500 mt-1">
              Echte Daten konnten nicht geladen werden (offline?). Erneut versuchen.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <div className={cn('flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0 mt-0.5', rankColor)}>
            {rank}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{dest.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Vorgeschlagen von {dest.proposedByName}
            </p>

            {dest.climate && (
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Thermometer size={12} className="text-orange-400" />
                  {dest.climate.temp_avg}°C
                </span>
                <span className="flex items-center gap-1">
                  <CloudRain size={12} className="text-blue-400" />
                  {dest.climate.precipitation_mm}mm
                </span>
                <span className="flex items-center gap-1">
                  <Sun size={12} className="text-amber-400" />
                  {dest.climate.sunshine_hours}h
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">
                ⭐ {dest.starsAvg > 0 ? dest.starsAvg.toFixed(1) : '–'} ({dest.voteCount} Stimmen)
              </span>
            </div>
          </div>

          {/* Score ring — zeigt den reinen Daten-Score (Sterne separat unten) */}
          {dest.llmAnalysis && (
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <ScoreRing score={dest.llmAnalysis.score / 100} size={60} />
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Daten</span>
            </div>
          )}
        </div>

        {/* Data source badges */}
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

        {/* Expand/collapse reasoning */}
        {dest.llmAnalysis?.reasoning && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-3 text-xs text-primary font-medium"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Weniger' : 'Warum dieser Score?'}
          </button>
        )}

        {expanded && dest.llmAnalysis && (
          <div className="mt-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed">
            <p className="mb-2">{dest.llmAnalysis.reasoning}</p>
            <ul className="space-y-1">
              {dest.llmAnalysis.dataPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Vote button */}
      {showVoteButton && onVoteClick && (
        <button
          onClick={onVoteClick}
          className="w-full py-2.5 border-t border-gray-100 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          {dest.myVote ? `Meine Wertung: ${dest.myVote}★ · Ändern` : 'Jetzt bewerten'}
        </button>
      )}
    </div>
  )
}
