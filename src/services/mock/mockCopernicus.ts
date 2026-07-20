// Autor: Amal Najah und Wajdy Eleyan
// Mock-Fallback für Copernicus ERA5 Klimadaten (Priorität 1)
import type { ClimateData } from '@/types/destination'

const MOCK_CLIMATE: Record<string, ClimateData> = {
  barcelona: { temp_avg: 27, temp_min: 22, temp_max: 31, precipitation_mm: 18, sunshine_hours: 10, source: 'copernicus' },
  lisbon: { temp_avg: 25, temp_min: 19, temp_max: 29, precipitation_mm: 5, sunshine_hours: 11, source: 'copernicus' },
  athens: { temp_avg: 33, temp_min: 27, temp_max: 38, precipitation_mm: 2, sunshine_hours: 12, source: 'copernicus' },
  amsterdam: { temp_avg: 18, temp_min: 13, temp_max: 22, precipitation_mm: 65, sunshine_hours: 6, source: 'copernicus' },
  rome: { temp_avg: 30, temp_min: 23, temp_max: 35, precipitation_mm: 15, sunshine_hours: 10, source: 'copernicus' },
  paris: { temp_avg: 22, temp_min: 16, temp_max: 27, precipitation_mm: 55, sunshine_hours: 7, source: 'copernicus' },
  berlin: { temp_avg: 20, temp_min: 14, temp_max: 25, precipitation_mm: 58, sunshine_hours: 7, source: 'copernicus' },
  madrid: { temp_avg: 32, temp_min: 22, temp_max: 38, precipitation_mm: 8, sunshine_hours: 11, source: 'copernicus' },
  vienna: { temp_avg: 23, temp_min: 16, temp_max: 28, precipitation_mm: 70, sunshine_hours: 7, source: 'copernicus' },
  prague: { temp_avg: 21, temp_min: 14, temp_max: 27, precipitation_mm: 60, sunshine_hours: 7, source: 'copernicus' },
  default: { temp_avg: 24, temp_min: 18, temp_max: 29, precipitation_mm: 30, sunshine_hours: 8, source: 'copernicus' },
}

export function getMockClimate(destination: string): ClimateData {
  const key = destination.toLowerCase().split(',')[0].trim()
  return MOCK_CLIMATE[key] ?? MOCK_CLIMATE.default
}
