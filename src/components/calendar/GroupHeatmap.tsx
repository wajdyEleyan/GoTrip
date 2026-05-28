// Autor: Mohamad Haj Ahmad
// src/components/calendar/GroupHeatmap.tsx
// Shows group availability heatmap for the trip date range
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { MemberAvailability, DateSummary } from '@/types/availability'

interface GroupHeatmapProps {
  tripStartDate: string
  tripEndDate: string
  memberAvailabilities: MemberAvailability[]
  totalMembers: number
}

function buildDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const cur = new Date(start)
  const last = new Date(end)
  while (cur <= last) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

function heatmapColor(summary: DateSummary): string {
  if (summary.totalMembers === 0) return 'bg-gray-100'
  const pct = summary.availableCount / summary.totalMembers
  if (pct >= 1) return 'bg-success text-white'
  if (pct >= 0.5) return 'bg-emerald-300 text-white'
  if (pct > 0) return 'bg-amber-300 text-gray-800'
  if (summary.maybeCount > 0) return 'bg-amber-200 text-gray-700'
  return 'bg-gray-200 text-gray-500'
}

export function GroupHeatmap({
  tripStartDate,
  tripEndDate,
  memberAvailabilities,
  totalMembers,
}: GroupHeatmapProps) {
  const dates = useMemo(() => buildDateRange(tripStartDate, tripEndDate), [tripStartDate, tripEndDate])

  const summaries = useMemo<DateSummary[]>(() =>
    dates.map((date) => {
      let available = 0, maybe = 0, not = 0
      memberAvailabilities.forEach(({ dates: d }) => {
        if (d[date] === 'available') available++
        else if (d[date] === 'maybe') maybe++
        else if (d[date] === 'not-available') not++
      })
      return { date, availableCount: available, maybeCount: maybe, notCount: not, totalMembers }
    }),
    [dates, memberAvailabilities, totalMembers]
  )

  if (dates.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Gruppen-Heatmap</h3>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${Math.min(dates.length, 7)}, 1fr)` }}>
        {summaries.map((s) => {
          const day = new Date(s.date).getDate()
          const color = heatmapColor(s)
          return (
            <div
              key={s.date}
              className={cn('flex flex-col items-center justify-center rounded-lg py-2 text-xs font-medium', color)}
              title={`${s.date}: ${s.availableCount}/${s.totalMembers} verfügbar`}
              aria-label={`${s.date}: ${s.availableCount} von ${s.totalMembers} Personen verfügbar`}
            >
              <span className="text-[11px] leading-none">{day}</span>
              <span className="text-[10px] leading-none mt-0.5 opacity-80">{s.availableCount}/{s.totalMembers}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
