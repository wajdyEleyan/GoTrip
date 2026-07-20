// Autor: Mohamad Haj Ahmad und Wajdy Eleyan
// „Weiter →"-Button für 1-Tap-Kontinuität zwischen Planungs-Schritten (3-Klick-Regel).
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { nextStepPath, type PlanStep } from '@/utils/flow'
import { useLanguage } from '@/context/LanguageContext'

interface StepNavProps {
  tripId: string
  current: PlanStep
  /** Optional: vor der Navigation speichern. */
  onBeforeNext?: () => void
  /** Optional: eigenes Label statt „Weiter". */
  label?: string
  disabled?: boolean
}

export function StepNav({ tripId, current, onBeforeNext, label, disabled }: StepNavProps) {
  const navigate = useNavigate()
  const { t } = useLanguage()

  function go() {
    onBeforeNext?.()
    navigate(nextStepPath(tripId, current))
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={disabled}
      className="mt-2 w-full h-12 rounded-xl bg-primary text-white text-base font-semibold flex items-center justify-center gap-2 shadow-md shadow-primary/30 transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:pointer-events-none"
    >
      {label ?? t('continue')}
      <ArrowRight size={18} />
    </button>
  )
}
