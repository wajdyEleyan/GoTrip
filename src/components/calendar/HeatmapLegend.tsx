// Autor: Wajdy Eleyan
// src/components/calendar/HeatmapLegend.tsx
const ITEMS = [
  { color: 'bg-success', label: 'Verfügbar' },
  { color: 'bg-amber-400', label: 'Vielleicht' },
  { color: 'bg-red-400', label: 'Nicht frei' },
  { color: 'bg-gray-100 border border-gray-200', label: 'Kein Status' },
]

export function HeatmapLegend() {
  return (
    <div className="flex flex-wrap gap-3" role="list" aria-label="Legende">
      {ITEMS.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5" role="listitem">
          <span className={`w-3 h-3 rounded-sm ${color}`} aria-hidden="true" />
          <span className="text-xs text-gray-600">{label}</span>
        </div>
      ))}
    </div>
  )
}
