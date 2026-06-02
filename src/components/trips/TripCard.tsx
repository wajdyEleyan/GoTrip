// src/components/trips/TripCard.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { de, enUS, es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/LanguageContext'
import { useTripContext } from '@/context/TripContext'
import { toast } from '@/components/shared/Toast'
import { destinationImage } from '@/utils/destinationImage'
import type { Trip } from '@/types/trip'

const dateLocales = { de, en: enUS, es }

interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const { deleteTrip } = useTripContext()
  const [showConfirm, setShowConfirm] = useState(false)

  const locale = dateLocales[lang] ?? de
  const startFormatted = format(new Date(trip.startDate), 'd. MMM', { locale })
  const endFormatted = format(new Date(trip.endDate), 'd. MMM yyyy', { locale })
  const memberCount = trip.members.length
  const img = destinationImage(trip.name, 600)

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setShowConfirm(true)
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation()
    navigate(`/trip/${trip.id}/edit`)
  }

  function confirmDelete() {
    deleteTrip(trip.id)
    toast.success(t('tripDeleted'))
    setShowConfirm(false)
  }

  if (showConfirm) {
    return (
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{t('deleteConfirmTitle')}</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {t('deleteConfirmText', { name: trip.name })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowConfirm(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0"
            onClick={confirmDelete}
          >
            {t('delete')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden glass-card">
      {/* Photo cover — clickable */}
      <button
        onClick={() => navigate(`/trip/${trip.id}/dashboard`)}
        className="block w-full text-left photo-card !rounded-none !shadow-none h-36"
        aria-label={`Trip: ${trip.name}`}
      >
        <img src={img} alt="" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        <div className="photo-scrim" />
        {/* member badge */}
        <span className="absolute top-3 right-3 z-[1] inline-flex items-center gap-1 bg-white/90 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full">
          <Users size={12} className="text-gray-700" />
          {memberCount}
        </span>
        {/* title */}
        <div className="photo-title absolute bottom-3 left-3 right-3">
          <h3 className="text-base font-bold line-clamp-1">{trip.name}</h3>
          <div className="flex items-center gap-1.5 text-xs opacity-95 mt-0.5">
            <Calendar size={12} />
            <span>{startFormatted} – {endFormatted}</span>
          </div>
        </div>
      </button>

      {/* Edit / Delete action bar */}
      <div className="flex items-center px-4 py-2 gap-2 border-t border-white/40">
        <button
          onClick={handleEdit}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-primary/5"
          aria-label={`${t('edit')} ${trip.name}`}
        >
          <Pencil size={13} />
          {t('edit')}
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50"
          aria-label={`${t('delete')} ${trip.name}`}
        >
          <Trash2 size={13} />
          {t('delete')}
        </button>
      </div>
    </div>
  )
}
