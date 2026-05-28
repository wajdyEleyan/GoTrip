// Autor: Eya Mathlouthi
// src/components/preferences/PreferencesForm.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { InterestChips } from './InterestChips'
import { BudgetSlider } from './BudgetSlider'
import type { InterestType, MemberPreferences } from '@/types/preferences'

interface PreferencesFormProps {
  initial?: Partial<MemberPreferences>
  tripStartDate: string
  tripEndDate: string
  onSave: (prefs: Omit<MemberPreferences, 'memberId' | 'tripId'>) => void
}

export function PreferencesForm({
  initial,
  tripStartDate,
  tripEndDate,
  onSave,
}: PreferencesFormProps) {
  const [budget, setBudget] = useState(initial?.budgetPerPerson ?? 500)
  const [interests, setInterests] = useState<InterestType[]>(initial?.interests ?? [])
  const [prefStart, setPrefStart] = useState(initial?.preferredStartDate ?? tripStartDate)
  const [prefEnd, setPrefEnd] = useState(initial?.preferredEndDate ?? tripEndDate)
  const [interestError, setInterestError] = useState('')

  function handleSubmit() {
    if (interests.length === 0) {
      setInterestError('Bitte mindestens ein Interesse auswählen')
      return
    }
    setInterestError('')
    onSave({
      budgetPerPerson: budget,
      interests,
      preferredStartDate: prefStart || undefined,
      preferredEndDate: prefEnd || undefined,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Budget Slider */}
      <section>
        <BudgetSlider value={budget} onChange={setBudget} />
      </section>

      {/* Interests */}
      <section>
        <Label className="mb-3 block">Interessen *</Label>
        <InterestChips selected={interests} onChange={setInterests} />
        {interestError && (
          <p className="mt-2 text-xs text-red-500" role="alert">{interestError}</p>
        )}
      </section>

      {/* Preferred travel window (optional) */}
      <section>
        <Label className="mb-2 block text-sm text-gray-500">
          Bevorzugter Zeitraum <span className="text-gray-400">(optional)</span>
        </Label>
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="pref-start" className="text-xs text-gray-400">Von</Label>
            <Input
              id="pref-start"
              type="date"
              value={prefStart}
              min={tripStartDate}
              max={tripEndDate}
              onChange={(e) => setPrefStart(e.target.value)}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="pref-end" className="text-xs text-gray-400">Bis</Label>
            <Input
              id="pref-end"
              type="date"
              value={prefEnd}
              min={tripStartDate}
              max={tripEndDate}
              onChange={(e) => setPrefEnd(e.target.value)}
            />
          </div>
        </div>
      </section>

      <Button onClick={handleSubmit} className="w-full">
        Präferenzen speichern
      </Button>
    </div>
  )
}
