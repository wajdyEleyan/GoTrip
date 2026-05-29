// src/components/preferences/PreferencesForm.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { InterestChips } from './InterestChips'
import { BudgetSlider } from './BudgetSlider'
import { useLanguage } from '@/context/LanguageContext'
import type { InterestType, MemberPreferences } from '@/types/preferences'

interface PreferencesFormProps {
  initial?: Partial<MemberPreferences>
  tripStartDate: string
  tripEndDate: string
  onSave: (prefs: Omit<MemberPreferences, 'memberId' | 'tripId'>) => void
}

export function PreferencesForm({ initial, tripStartDate, tripEndDate, onSave }: PreferencesFormProps) {
  const { t } = useLanguage()
  const [budget, setBudget] = useState(initial?.budgetPerPerson ?? 500)
  const [interests, setInterests] = useState<InterestType[]>(initial?.interests ?? [])
  const [prefStart, setPrefStart] = useState(initial?.preferredStartDate ?? tripStartDate)
  const [prefEnd, setPrefEnd] = useState(initial?.preferredEndDate ?? tripEndDate)
  const [interestError, setInterestError] = useState('')

  function handleSubmit() {
    if (interests.length === 0) {
      setInterestError(t('selectAtLeastOne'))
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
    <div className="flex flex-col gap-7">
      {/* Budget per person */}
      <section>
        <p className="text-sm font-bold text-gray-700 mb-3">{t('budgetPerPerson')}</p>
        <BudgetSlider value={budget} onChange={setBudget} />
      </section>

      {/* Interests */}
      <section>
        <Label className="mb-3 block text-sm font-bold text-gray-700">{t('interests')}</Label>
        <InterestChips selected={interests} onChange={setInterests} />
        {interestError && (
          <p className="mt-2 text-xs text-red-500" role="alert">{interestError}</p>
        )}
      </section>

      {/* Preferred travel window */}
      <section>
        <p className="text-sm font-bold text-gray-700 mb-1">
          {t('preferredTimeframe')}{' '}
          <span className="font-normal text-gray-400">({t('optional')})</span>
        </p>
        <p className="text-xs text-gray-400 mb-3">
          {t('groupOverlap')}
        </p>
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="pref-start" className="text-xs text-gray-400">{t('from')}</Label>
            <Input
              id="pref-start"
              type="date"
              value={prefStart}
              min={tripStartDate}
              max={tripEndDate}
              className="h-11 rounded-xl"
              onChange={(e) => setPrefStart(e.target.value)}
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Label htmlFor="pref-end" className="text-xs text-gray-400">{t('to')}</Label>
            <Input
              id="pref-end"
              type="date"
              value={prefEnd}
              min={tripStartDate}
              max={tripEndDate}
              className="h-11 rounded-xl"
              onChange={(e) => setPrefEnd(e.target.value)}
            />
          </div>
        </div>
      </section>

      <Button onClick={handleSubmit} className="w-full h-12 rounded-xl text-base font-semibold">
        {t('savePreferences')}
      </Button>
    </div>
  )
}
