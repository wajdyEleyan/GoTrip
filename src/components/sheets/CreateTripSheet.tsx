// src/components/sheets/CreateTripSheet.tsx
// Reise erstellen = nur der Name. Datum & alle weiteren Daten werden danach
// auf dem Planungs-Screen als aufklappbare Kacheln festgelegt.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTripContext } from '@/context/TripContext'
import { useLanguage } from '@/context/LanguageContext'

const today = new Date().toISOString().split('T')[0]

interface Props { onCreated?: () => void }

export function CreateTripSheet({ onCreated }: Props) {
  const navigate  = useNavigate()
  const { createTrip } = useTripContext()
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleCreate() {
    if (!name.trim()) { setError('Bitte gib einen Reisenamen ein.'); return }
    setError('')
    // Datum bewusst als Platzhalter (heute) — wird danach via Datum-Kachel gesetzt.
    const trip = createTrip({ name: name.trim(), startDate: today, endDate: today })
    onCreated?.()
    navigate(`/trip/${trip.id}/dashboard`)
  }

  return (
    <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
      {/* ── Name ── */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
          Reisename
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleCreate() }}
          placeholder="z.B. Sommerurlaub Barcelona"
          autoFocus
          className="w-full h-13 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
        />
        <p className="text-xs text-gray-400 italic px-1">
          Datum & Details legst du gleich auf dem Planungs-Screen fest.
        </p>
      </div>

      {/* Fehler */}
      {error && <p className="text-sm text-red-500 px-1 -mt-1">{error}</p>}

      {/* ── Erstellen-Button ── */}
      <button
        type="button"
        onClick={handleCreate}
        disabled={!name.trim()}
        className="w-full h-14 rounded-2xl bg-black text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-25 active:scale-[0.98] transition-all shadow-md mt-1"
      >
        {t('createTripBtn')}
        <ArrowRight size={20} />
      </button>
    </div>
  )
}
