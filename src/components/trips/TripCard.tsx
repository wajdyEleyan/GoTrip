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
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{t('deleteConfirmTitle')}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Main clickable area */}
      <button
        onClick={() => navigate(`/trip/${trip.id}/dashboard`)}
        className="w-full text-left p-4 pb-3"
        aria-label={`Trip: ${trip.name}`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-gray-900 line-clamp-1">{trip.name}</h3>
          <span className="shrink-0 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full whitespace-nowrap">
            {memberCount} {memberCount === 1 ? t('membersLabel') : t('membersLabelPlural')}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0 text-gray-400" />
            <span>{startFormatted} – {endFormatted}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="shrink-0 text-gray-400" />
            <span>{memberCount} {memberCount === 1 ? t('membersLabel') : t('membersLabelPlural')}</span>
          </div>
        </div>
      </button>

      {/* Edit / Delete action bar */}
      <div className="flex items-center border-t border-gray-50 px-4 py-2 gap-2">
        <button
          onClick={handleEdit}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-primary/5"
          aria-label={`${t('edit')} ${trip.name}`}
        >
          <Pencil size={13} />
          {t('edit')}
        </button>
        <div className="w-px h-4 bg-gray-100" />
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50"
          aria-label={`${t('delete')} ${trip.name}`}
        >
          <Trash2 size={13} />
          {t('delete')}
        </button>
      </div>
    </div>
  )
}
