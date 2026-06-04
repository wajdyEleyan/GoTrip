// src/components/sheets/BudgetSheet.tsx
// Eigenes Reise-Budget pro Person festlegen (fließt in die KI-Bewertung ein).
import { useState, useMemo } from 'react'
import { Wallet } from 'lucide-react'
import { BudgetSlider } from '@/components/preferences/BudgetSlider'
import { getMemberPreferences, getTripPreferences, saveMemberPreferences } from '@/utils/storage'
import { toast } from '@/components/shared/Toast'
import type { Trip } from '@/types/trip'
import type { StoredAuth } from '@/utils/storage'

interface Props {
  trip: Trip
  user: StoredAuth
  onNext: () => void
}

export function BudgetSheet({ trip, user, onNext }: Props) {
  const existing = useMemo(() => getMemberPreferences(trip.id, user.id), [trip.id, user.id])
  const [budget, setBudget] = useState(existing?.budgetPerPerson ?? 500)

  // Gruppendurchschnitt (ohne mich) als Orientierung.
  const groupAvg = useMemo(() => {
    const others = getTripPreferences(trip.id).filter(p => p.memberId !== user.id)
    if (others.length === 0) return null
    return Math.round(others.reduce((s, p) => s + p.budgetPerPerson, 0) / others.length)
  }, [trip.id, user.id])

  function handleSave() {
    saveMemberPreferences({
      memberId: user.id,
      tripId: trip.id,
      budgetPerPerson: budget,
      interests: existing?.interests ?? [],
      preferredStartDate: existing?.preferredStartDate,
      preferredEndDate: existing?.preferredEndDate,
    })
    toast.success('Budget gespeichert!')
    onNext()
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4 pb-6">
      {/* Eigenes Budget — kompakte Anzeige */}
      <div className="bg-primary rounded-xl px-3.5 py-2.5 text-white flex items-center gap-2.5">
        <Wallet size={16} className="text-white/90 shrink-0" />
        <p className="text-xs text-white/80 flex-1">Pro Person</p>
        <p className="text-lg font-bold">{budget.toLocaleString('de-DE')} €</p>
      </div>

      <p className="text-sm text-gray-600">
        Wie viel möchtest <strong className="text-gray-900">du</strong> für diese Reise ausgeben?
      </p>

      <section className="glass-card rounded-2xl px-4 py-4">
        <BudgetSlider value={budget} onChange={setBudget} max={5000} />
      </section>

      {groupAvg != null && (
        <p className="text-xs text-gray-500 text-center">
          Ø Budget der anderen: <strong className="text-gray-700">{groupAvg.toLocaleString('de-DE')} €</strong>
        </p>
      )}

      <button
        onClick={handleSave}
        className="mt-2 w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        Budget speichern
      </button>
    </div>
  )
}
