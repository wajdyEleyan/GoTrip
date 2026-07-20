// Autor: Eya Mathlouthi
import { Minus, Plus } from 'lucide-react'

interface GroupSizeStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function GroupSizeStepper({ value, onChange, min = 2, max = 50 }: GroupSizeStepperProps) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label="Gruppengröße">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Verringern"
      >
        <Minus size={18} />
      </button>

      <span
        className="w-10 text-center text-lg font-semibold text-gray-900 tabular-nums"
        aria-live="polite"
        aria-label={`${value} Personen`}
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Erhöhen"
      >
        <Plus size={18} />
      </button>

      <span className="text-sm text-gray-500">Personen</span>
    </div>
  )
}
