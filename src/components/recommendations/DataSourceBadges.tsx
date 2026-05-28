// Autor: Eya Mathlouthi
// src/components/recommendations/DataSourceBadges.tsx
import { cn } from '@/lib/utils'

interface DataSourceBadgesProps {
  climateSrc: 'copernicus' | 'mock'
  biodivSrc: 'gbif' | 'mock'
  llmSrc: 'llm' | 'mock'
}

const BADGES = [
  { key: 'copernicus', label: 'Copernicus', color: 'bg-blue-100 text-blue-700', icon: '🛰️' },
  { key: 'gbif', label: 'GBIF', color: 'bg-green-100 text-green-700', icon: '🌿' },
  { key: 'ki-engine', label: 'ki-engine AI', color: 'bg-violet-100 text-violet-700', icon: '✨' },
  { key: 'mock', label: 'Mock-Daten', color: 'bg-gray-100 text-gray-500', icon: '🔧' },
]

export function DataSourceBadges({ climateSrc, biodivSrc, llmSrc }: DataSourceBadgesProps) {
  const active = new Set<string>()
  if (climateSrc === 'copernicus') active.add('copernicus')
  else active.add('mock')
  if (biodivSrc === 'gbif') active.add('gbif')
  if (llmSrc === 'llm') active.add('ki-engine')
  else if (!active.has('mock')) active.add('mock')

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Datenquellen">
      {BADGES.filter((b) => active.has(b.key)).map((b) => (
        <span
          key={b.key}
          className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full', b.color)}
          title={b.label}
        >
          <span aria-hidden="true">{b.icon}</span>
          {b.label}
        </span>
      ))}
    </div>
  )
}
