// Autor: Wajdy Eleyan
// src/components/calendar/AvailabilityCalendar.tsx
// Interactive monthly calendar for marking personal availability
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns'
import { de } from 'date-fns/locale'
import { CalendarDay } from './CalendarDay'
import type { AvailabilityStatus } from '@/types/availability'

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Cycles: null → available → maybe → not-available → null
const NEXT_STATUS: Record<string, AvailabilityStatus | null> = {
  available: 'maybe',
  maybe: 'not-available',
  'not-available': null,
}

interface AvailabilityCalendarProps {
  tripStartDate: string
  tripEndDate: string
  dates: Record<string, AvailabilityStatus>
  onChange: (dates: Record<string, AvailabilityStatus>) => void
}

export function AvailabilityCalendar({
  tripStartDate,
  tripEndDate,
  dates,
  onChange,
}: AvailabilityCalendarProps) {
  const tripStart = new Date(tripStartDate)
  const tripEnd = new Date(tripEndDate)

  const [viewDate, setViewDate] = useState(() => tripStart)

  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)

  const daysInMonth = useMemo(
    () => eachDayOfInterval({ start: monthStart, end: monthEnd }),
    [viewDate]
  )

  // Leading empty cells so Mon = col 0
  const leadingBlanks = useMemo(() => {
    const dow = getDay(monthStart)
    return dow === 0 ? 6 : dow - 1 // convert Sun=0 → 6, Mon=1 → 0
  }, [monthStart])

  function toggleDate(dateStr: string) {
    const current = dates[dateStr] ?? null
    const next = current === null ? 'available' : NEXT_STATUS[current]
    const updated = { ...dates }
    if (next === null) {
      delete updated[dateStr]
    } else {
      updated[dateStr] = next
    }
    onChange(updated)
  }

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const monthLabel = format(viewDate, 'MMMM yyyy', { locale: de })

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-900 capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Nächster Monat"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {daysInMonth.map((day) => {
          const dateStr = day.toISOString().split('T')[0]
          const inRange = day >= tripStart && day <= tripEnd
          return (
            <CalendarDay
              key={dateStr}
              date={dateStr}
              dayNumber={day.getDate()}
              status={dates[dateStr] ?? null}
              onClick={() => toggleDate(dateStr)}
              isToday={isToday(day)}
              isInRange={inRange}
              disabled={!inRange}
            />
          )
        })}
      </div>

      {/* Status hint */}
      <p className="text-xs text-gray-400 text-center mt-3">
        Tippe auf einen Tag um zu wechseln: Verfügbar → Vielleicht → Nicht frei
      </p>
    </div>
  )
}
