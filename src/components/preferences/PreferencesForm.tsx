// src/components/preferences/PreferencesForm.tsx
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { InterestChips } from './InterestChips'
import { useLanguage } from '@/context/LanguageContext'
import type { InterestType, MemberPreferences } from '@/types/preferences'

interface PreferencesFormProps {
  initial?: Partial<MemberPreferences>
  onSave: (prefs: Omit<MemberPreferences, 'memberId' | 'tripId'>) => void
}

export function PreferencesForm({ initial, onSave }: PreferencesFormProps) {
  const { t } = useLanguage()
  const [interests, setInterests] = useState<InterestType[]>(initial?.interests ?? [])
  const [interestError, setInterestError] = useState('')

  function handleSubmit() {
    if (interests.length === 0) {
      setInterestError(t('selectAtLeastOne'))
      return
    }
    setInterestError('')
    // Budget wird in der eigenen Budget-Kachel gepflegt — hier nur Interessen.
    onSave({
      budgetPerPerson: initial?.budgetPerPerson ?? 500,
      interests,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Interests */}
      <section className="glass-card rounded-2xl px-4 py-4">
        <Label className="mb-3 block text-sm font-bold text-gray-700">{t('interests')}</Label>
        <InterestChips selected={interests} onChange={setInterests} />
        {interestError && (
          <p className="mt-2 text-xs text-red-500" role="alert">{interestError}</p>
        )}
      </section>

      <button
        onClick={handleSubmit}
        className="w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        {t('savePreferences')}
      </button>
    </div>
  )
}
