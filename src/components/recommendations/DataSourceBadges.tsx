// Autor: Eya Mathlouthi
// src/components/recommendations/DataSourceBadges.tsx
// Zeigt, welche ECHTEN Datenquellen in die Bewertung eingeflossen sind.
import { Satellite, Leaf, Rocket, SatelliteDish, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataSourceBadgesProps {
  hasClimate?: boolean
  hasBiodiv?: boolean
  hasNasa?: boolean
  hasEarthdata?: boolean
}

const BADGES: { key: string; label: string; color: string; icon: LucideIcon }[] = [
  { key: 'copernicus', label: 'Copernicus ERA5', color: 'bg-blue-100 text-blue-700', icon: Satellite },
  { key: 'gbif', label: 'GBIF', color: 'bg-green-100 text-green-700', icon: Leaf },
  { key: 'nasa', label: 'NASA POWER', color: 'bg-indigo-100 text-indigo-700', icon: Rocket },
  { key: 'earthdata', label: 'NASA Earthdata', color: 'bg-violet-100 text-violet-700', icon: SatelliteDish },
]

export function DataSourceBadges({ hasClimate, hasBiodiv, hasNasa, hasEarthdata }: DataSourceBadgesProps) {
  const active = new Set<string>()
  if (hasClimate) active.add('copernicus')
  if (hasBiodiv) active.add('gbif')
  if (hasNasa) active.add('nasa')
  if (hasEarthdata) active.add('earthdata')

  if (active.size === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Echte Datenquellen">
      {BADGES.filter((b) => active.has(b.key)).map((b) => {
        const Icon = b.icon
        return (
          <span
            key={b.key}
            className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full', b.color)}
            title={b.label}
          >
            <Icon size={11} aria-hidden="true" />
            {b.label}
          </span>
        )
      })}
    </div>
  )
}
