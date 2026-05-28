// Autor: Amal Najah
// src/components/preferences/InterestChips.tsx
import { cn } from '@/lib/utils'
import type { InterestType } from '@/types/preferences'

const INTERESTS: { key: InterestType; label: string; emoji: string }[] = [
  { key: 'beach', label: 'Beach', emoji: '🏖️' },
  { key: 'city', label: 'City', emoji: '🏙️' },
  { key: 'nature', label: 'Nature', emoji: '🌿' },
  { key: 'adventure', label: 'Adventure', emoji: '🧗' },
  { key: 'culture', label: 'Culture', emoji: '🏛️' },
  { key: 'nightlife', label: 'Nightlife', emoji: '🎉' },
  { key: 'relaxation', label: 'Relaxation', emoji: '🧘' },
  { key: 'food', label: 'Food', emoji: '🍜' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️' },
]

interface InterestChipsProps {
  selected: InterestType[]
  onChange: (selected: InterestType[]) => void
}

export function InterestChips({ selected, onChange }: InterestChipsProps) {
  function toggle(key: InterestType) {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key]
    )
  }

  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="group"
      aria-label="Interessen auswählen"
    >
      {INTERESTS.map(({ key, label, emoji }) => {
        const isSelected = selected.includes(key)
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            aria-pressed={isSelected}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border text-xs font-medium transition-all active:scale-95 min-h-[72px]',
              isSelected
                ? 'bg-primary border-primary text-white shadow-sm shadow-primary/25'
                : 'bg-white border-gray-200 text-gray-700 hover:border-primary/40 hover:bg-primary/5'
            )}
          >
            <span className="text-xl leading-none" aria-hidden="true">{emoji}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
