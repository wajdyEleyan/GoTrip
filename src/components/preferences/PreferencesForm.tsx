import { useState, type ReactNode } from 'react'
import { Plus, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { InterestChips } from './InterestChips'
import { useLanguage } from '@/context/LanguageContext'
import type { InterestType, MemberPreferences } from '@/types/preferences'

interface PreferencesFormProps {
  initial?: Partial<MemberPreferences>
  onSave: (prefs: Omit<MemberPreferences, 'memberId' | 'tripId'>) => void
  /** Optionaler Bereich (z. B. Aktivitäten-Wünsche), wird vor dem Speichern-Button gezeigt. */
  children?: ReactNode
}

export function PreferencesForm({ initial, onSave, children }: PreferencesFormProps) {
  const { t } = useLanguage()
  const [interests, setInterests] = useState<InterestType[]>(initial?.interests ?? [])
  const [custom, setCustom] = useState<string[]>(initial?.customInterests ?? [])
  const [customInput, setCustomInput] = useState('')
  const [interestError, setInterestError] = useState('')

  function addCustom() {
    const v = customInput.trim()
    if (!v || custom.includes(v)) { setCustomInput(''); return }
    setCustom(prev => [...prev, v])
    setCustomInput('')
  }

  function handleSubmit() {
    if (interests.length === 0 && custom.length === 0) {
      setInterestError(t('selectAtLeastOne'))
      return
    }
    setInterestError('')
    // Budget wird in der eigenen Budget-Kachel gepflegt — hier nur Interessen.
    onSave({
      budgetPerPerson: initial?.budgetPerPerson ?? 500,
      interests,
      customInterests: custom,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Interests */}
      <section className="glass-card rounded-2xl px-4 py-4">
        <Label className="mb-3 block text-sm font-bold text-gray-700">{t('interests')}</Label>
        <InterestChips selected={interests} onChange={setInterests} />

        {/* Sonstiges — frei eingeben */}
        <Label className="mt-4 mb-2 block text-xs font-semibold text-gray-500">Sonstiges (frei eingeben)</Label>
        {custom.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {custom.map(c => (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                {c}
                <button type="button" onClick={() => setCustom(prev => prev.filter(x => x !== c))} aria-label={`${c} entfernen`}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="z. B. Tauchen…"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customInput.trim()}
            className="shrink-0 w-11 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
            aria-label="Hinzufügen"
          >
            <Plus size={18} />
          </button>
        </div>

        {interestError && (
          <p className="mt-2 text-xs text-red-500" role="alert">{interestError}</p>
        )}
      </section>

      {children}

      <button
        onClick={handleSubmit}
        className="w-full h-12 rounded-xl bg-black text-white text-base font-semibold flex items-center justify-center active:scale-[0.98] transition-transform"
      >
        {t('savePreferences')}
      </button>
    </div>
  )
}
