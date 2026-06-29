// Autor: Wajdy Eleyan
// src/services/mock/mockGBIF.ts
// Mock-Fallback für GBIF Biodiversitätsdaten (Priorität 2)
import type { BiodiversityData } from '@/types/destination'

const MOCK_GBIF: Record<string, BiodiversityData> = {
  barcelona: { species_count: 1240, highlight: 'Mittelmeer-Küstenflora & Seevögel', source: 'gbif' },
  lisbon: { species_count: 980, highlight: 'Atlantik-Küstenvegetation & Zugvögel', source: 'gbif' },
  athens: { species_count: 1450, highlight: 'Mediterrane Macchia & Wildblumen', source: 'gbif' },
  amsterdam: { species_count: 620, highlight: 'Wattvogel-Kolonien & Feuchtgebiete', source: 'gbif' },
  rome: { species_count: 1100, highlight: 'Italiens Stadtflora & Mauereidechsen', source: 'gbif' },
  paris: { species_count: 540, highlight: 'Stadtparks mit Stadtfüchsen', source: 'gbif' },
  berlin: { species_count: 580, highlight: 'Stadtwald-Ökosystem Grunewald', source: 'gbif' },
  madrid: { species_count: 890, highlight: 'Kastilische Steppenvögel', source: 'gbif' },
  default: { species_count: 750, highlight: 'Regionale Artenvielfalt', source: 'gbif' },
}

export function getMockBiodiversity(destination: string): BiodiversityData {
  const key = destination.toLowerCase().split(',')[0].trim()
  return MOCK_GBIF[key] ?? MOCK_GBIF.default
}
