// Autor: Amal Najah
// src/components/preferences/InterestChips.tsx
import {
  Check, Umbrella, Building2, Trees, Mountain, Landmark, Music, Flower2, Utensils, ShoppingBag,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterestType } from '@/types/preferences'
import { destinationImage } from '@/utils/destinationImage'

const INTERESTS: { key: InterestType; label: string; icon: LucideIcon }[] = [
  { key: 'beach', label: 'Beach', icon: Umbrella },
  { key: 'city', label: 'City', icon: Building2 },
  { key: 'nature', label: 'Nature', icon: Trees },
  { key: 'adventure', label: 'Adventure', icon: Mountain },
  { key: 'culture', label: 'Culture', icon: Landmark },
  { key: 'nightlife', label: 'Nightlife', icon: Music },
  { key: 'relaxation', label: 'Relaxation', icon: Flower2 },
  { key: 'food', label: 'Food', icon: Utensils },
  { key: 'shopping', label: 'Shopping', icon: ShoppingBag },
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
      {INTERESTS.map(({ key, label, icon: Icon }) => {
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

            <div className="photo-title absolute inset-0 flex flex-col items-center justify-end pb-2 px-1 gap-1">
              <Icon size={18} className="text-white drop-shadow" aria-hidden="true" />
              <span className="text-[11px] font-semibold leading-tight text-center">{label}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
