// src/components/sheets/DatesSheet.tsx
// Inline-Kachelinhalt: Reisezeitraum (Von/Bis) per Rad festlegen.
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import { WheelDatePicker } from '@/components/ui/WheelDatePicker'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'
import { toast } from '@/components/shared/Toast'
import type { Trip } from '@/types/trip'

const today = new Date().toISOString().split('T')[0]

function fmt(iso: string) {
  try { return format(parseISO(iso), 'd. MMM yyyy', { locale: de }) } catch { return iso }
}

interface Props {
  trip: Trip
  onNext: () => void
}

export function DatesSheet({ trip, onNext }: Props) {
  const { updateTrip } = useTripContext()
  const { t } = useLanguage()

  const [startDate, setStartDate] = useState(trip.startDate || today)
  const [endDate, setEndDate] = useState(trip.endDate || today)
  const [openWheel, setOpenWheel] = useState<'start' | 'end' | null>('start')

  function toggleWheel(f: 'start' | 'end') {
    setOpenWheel(p => (p === f ? null : f))
  }

  function handleSave() {
    updateTrip({ ...trip, startDate, endDate })
    toast.success(t('save'))
    onNext()
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-3 pb-6">
      <div className="grid grid-cols-2 gap-2">
        {/* VON */}
        <button
          type="button"
          onClick={() => toggleWheel('start')}
          className={`flex flex-col gap-0.5 px-4 py-3 rounded-2xl border text-left transition-all active:scale-[0.97] ${
            openWheel === 'start'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('from')}</span>
          <span className="text-sm font-bold text-gray-900">{fmt(startDate)}</span>
        </button>

        {/* BIS */}
        <button
          type="button"
          onClick={() => toggleWheel('end')}
          className={`flex flex-col gap-0.5 px-4 py-3 rounded-2xl border text-left transition-all active:scale-[0.97] ${
            openWheel === 'end'
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t('to')}</span>
          <span className="text-sm font-bold text-gray-900">{fmt(endDate)}</span>
        </button>
      </div>

      {/* Rad — klappt unter den Kacheln auf */}
      <div className={`grid transition-[grid-template-rows] duration-300 ${openWheel ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="pt-2 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
            {openWheel === 'start' && (
              <WheelDatePicker
                value={startDate}
                min={today}
                onChange={v => {
                  setStartDate(v)
                  if (endDate < v) setEndDate(v)
                }}
              />
            )}
            {openWheel === 'end' && (
              <WheelDatePicker
                value={endDate}
                min={startDate || today}
                onChange={setEndDate}
              />
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        {t('save')}
      </button>
    </div>
  )
}
