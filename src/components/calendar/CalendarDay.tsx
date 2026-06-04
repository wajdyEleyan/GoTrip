// Autor: Wajdy Eleyan
// src/components/calendar/CalendarDay.tsx
import { cn } from '@/lib/utils'
import type { AvailabilityStatus } from '@/types/availability'

interface CalendarDayProps {
  date: string           // ISO "2026-07-10"
  dayNumber: number
  status: AvailabilityStatus | null
  onClick: () => void
  isToday?: boolean
  isInRange?: boolean    // within trip date range
  disabled?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  available: 'bg-success text-white border-success',
  maybe: 'bg-amber-400 text-white border-amber-400',
  'not-available': 'bg-red-400 text-white border-red-400',
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Verfügbar',
  maybe: 'Vielleicht',
  'not-available': 'Nicht verfügbar',
}

export function CalendarDay({
  dayNumber,
  status,
  onClick,
  isToday,
  isInRange,
  disabled,
}: CalendarDayProps) {
  const statusStyle = status ? STATUS_STYLES[status] : 'bg-white border-gray-200'
  const label = status ? STATUS_LABEL[status] : 'Kein Status'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative flex items-center justify-center w-full aspect-square rounded-lg border text-xs font-medium transition-all active:scale-90',
        statusStyle,
        !isInRange && 'opacity-30 cursor-not-allowed',
        isToday && !status && 'border-primary text-primary',
        disabled && 'pointer-events-none opacity-20'
      )}
      aria-label={`${dayNumber}. – ${label}`}
      aria-pressed={status !== null}
    >
      {dayNumber}
      {isToday && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
      )}
    </button>
  )
}
