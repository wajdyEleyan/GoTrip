// Autor: Eya Mathlouthi
// src/components/preferences/BudgetSlider.tsx
interface BudgetSliderProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}

export function BudgetSlider({ value, onChange, min = 0, max = 2000 }: BudgetSliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-3">
      {/* Current value display */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Budget pro Person</span>
        <span className="text-lg font-bold text-primary">€{value.toLocaleString('de-DE')}</span>
      </div>

      {/* Slider track */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={25}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 appearance-none rounded-full outline-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #0F7D8C 0%, #0F7D8C ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`,
          }}
          aria-label={`Budget: ${value} Euro`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>€{min}</span>
        <span>€{max.toLocaleString('de-DE')}</span>
      </div>
    </div>
  )
}
