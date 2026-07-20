// Autor: Eya Mathlouthi
import { cn } from '@/lib/utils'

interface BudgetRangeInputProps {
  minValue: number
  maxValue: number
  onMinChange: (v: number) => void
  onMaxChange: (v: number) => void
  minError?: string
  maxError?: string
}

function EuroInput({
  value,
  onChange,
  placeholder,
  id,
  'aria-label': ariaLabel,
}: {
  value: number
  onChange: (v: number) => void
  placeholder?: string
  id?: string
  'aria-label'?: string
}) {
  return (
    <div className="relative flex-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
        €
      </span>
      <input
        id={id}
        type="number"
        min={0}
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder ?? '0'}
        aria-label={ariaLabel}
        className={cn(
          'h-11 w-full rounded-xl border border-gray-200 bg-white pl-7 pr-3 py-2 text-base text-gray-900',
          'placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors'
        )}
      />
    </div>
  )
}

export function BudgetRangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  minError,
  maxError,
}: BudgetRangeInputProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <EuroInput
          id="budget-min"
          value={minValue}
          onChange={onMinChange}
          placeholder="Min"
          aria-label="Mindestbudget in Euro"
        />
        <span className="text-sm text-gray-500 shrink-0">bis</span>
        <EuroInput
          id="budget-max"
          value={maxValue}
          onChange={onMaxChange}
          placeholder="Max"
          aria-label="Maximalbudget in Euro"
        />
      </div>
      {minError && <p className="mt-1 text-xs text-red-500">{minError}</p>}
      {maxError && <p className="mt-1 text-xs text-red-500">{maxError}</p>}
    </div>
  )
}
