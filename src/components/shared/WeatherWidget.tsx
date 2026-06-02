// Autor: Wajdy Eleyan
// src/components/shared/WeatherWidget.tsx — S4: Wetter-Forecast-Widget
import { Sun, CloudSun, Cloud, CloudRain, Thermometer } from 'lucide-react'
import type { ClimateData } from '@/types/destination'

interface WeatherWidgetProps {
  climate: ClimateData
  destinationName?: string
  compact?: boolean
}

function WeatherBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function WeatherWidget({ climate, destinationName, compact = false }: WeatherWidgetProps) {
  const isHot = climate.temp_avg >= 28
  const isWarm = climate.temp_avg >= 20
  const tempColor = isHot ? 'text-orange-500' : isWarm ? 'text-amber-500' : 'text-blue-500'
  const TempIcon = isHot ? Sun : isWarm ? CloudSun : Cloud

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1"><TempIcon size={13} className={tempColor} /> {climate.temp_avg}°C</span>
        <span className="flex items-center gap-1"><CloudRain size={13} className="text-blue-400" /> {climate.precipitation_mm}mm</span>
        <span className="flex items-center gap-1"><Sun size={13} className="text-amber-400" /> {climate.sunshine_hours}h</span>
        <span className="text-gray-400 text-xs">Copernicus</span>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-100 p-4">
      {destinationName && (
        <p className="text-xs font-semibold text-sky-700 mb-3 uppercase tracking-wide">
          {destinationName} — Klimaübersicht
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Temperature */}
        <div className="flex flex-col items-center gap-1">
          <Thermometer size={24} className="text-orange-400" />
          <span className={`text-xl font-bold ${tempColor}`}>{climate.temp_avg}°</span>
          <span className="text-xs text-gray-500">Ø Temp.</span>
        </div>

        {/* Sunshine */}
        <div className="flex flex-col items-center gap-1">
          <Sun size={24} className="text-amber-400" />
          <span className="text-xl font-bold text-amber-500">{climate.sunshine_hours}h</span>
          <span className="text-xs text-gray-500">Sonne/Tag</span>
        </div>

        {/* Rain */}
        <div className="flex flex-col items-center gap-1">
          <CloudRain size={24} className="text-blue-400" />
          <span className="text-xl font-bold text-blue-500">{climate.precipitation_mm}</span>
          <span className="text-xs text-gray-500">mm Regen</span>
        </div>
      </div>

      {/* Visual bars */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">Temperatur</span>
          <div className="flex-1">
            <WeatherBar value={climate.temp_avg} max={45} color="bg-orange-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 w-10 text-right">
            {climate.temp_min}–{climate.temp_max}°
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">Sonnenstd.</span>
          <div className="flex-1">
            <WeatherBar value={climate.sunshine_hours} max={14} color="bg-amber-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 w-10 text-right">
            {climate.sunshine_hours}h
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-16">Niederschl.</span>
          <div className="flex-1">
            <WeatherBar value={climate.precipitation_mm} max={200} color="bg-blue-400" />
          </div>
          <span className="text-xs font-medium text-gray-700 w-10 text-right">
            {climate.precipitation_mm}mm
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 text-right">
        Quelle: Copernicus ERA5
      </p>
    </div>
  )
}
