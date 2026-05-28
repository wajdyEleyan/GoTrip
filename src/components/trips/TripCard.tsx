// Autor: Eya Mathlouthi
// src/components/trips/TripCard.tsx
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Euro } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Trip } from '@/types/trip'

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const navigate = useNavigate()

  const startFormatted = format(new Date(trip.startDate), 'd. MMM', { locale: de })
  const endFormatted = format(new Date(trip.endDate), 'd. MMM yyyy', { locale: de })

  return (
    <button
      onClick={() => navigate(`/trip/${trip.id}/dashboard`)}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow active:scale-[0.99]"
      aria-label={`Trip: ${trip.name}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{trip.name}</h3>
        <span className="shrink-0 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
          {trip.members.length}/{trip.groupSize}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
          <span>{startFormatted} – {endFormatted}</span>
        </div>
        <div className="flex items-center gap-2">
          <Euro size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
          <span>{trip.budgetMin} – {trip.budgetMax} pro Person</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
          <span>{trip.members.length} Mitglied{trip.members.length !== 1 ? 'er' : ''}</span>
        </div>
      </div>
    </button>
  )
}
