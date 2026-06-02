// Autor: Amal Najah
// src/components/preferences/InterestChips.tsx
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterestType } from '@/types/preferences'
import { destinationImage } from '@/utils/destinationImage'

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
              'photo-card min-h-[78px] transition-all active:scale-95 focus:outline-none',
              isSelected
                ? 'ring-[3px] ring-primary shadow-lg shadow-primary/30 scale-[1.02]'
                : 'ring-0 opacity-80 grayscale-[0.35] hover:opacity-100 hover:grayscale-0'
            )}
          >
            <img
              src={destinationImage(label, 200)}
              alt=""
              aria-hidden="true"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <div
              className="photo-scrim"
              style={isSelected ? { background: 'linear-gradient(180deg, rgba(15,125,140,0.25), rgba(15,125,140,0.7))' } : undefined}
            />

            {/* Auswahl-Häkchen */}
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-md ring-2 ring-white">
                <Check size={12} strokeWidth={3} className="text-white" />
              </div>
            )}

            <div className="photo-title absolute inset-0 flex flex-col items-center justify-end pb-2 px-1 gap-0.5">
              <span className="text-base leading-none" aria-hidden="true">{emoji}</span>
              <span className="text-[11px] font-semibold leading-tight text-center">{label}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
