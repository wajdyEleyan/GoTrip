// Autor: Mohamad Haj Ahmad
// src/services/llmService.ts
// Reiseziel-Analyse OHNE LLM und OHNE Mock-Daten.
// Holt echte Daten direkt im Browser (Copernicus/ERA5, GBIF, NASA POWER;
// NASA Earthdata optional via Server) und bewertet regelbasiert (scoreEngine).
import type {
  ClimateData, BiodiversityData, NasaData, EarthdataData, DestinationAnalysis,
} from '@/types/destination'
import type { MemberPreferences } from '@/types/preferences'
import { computeDestinationScore } from './scoreEngine'
import {
  geocode, fetchClimate, fetchBiodiversity, fetchNasaPower, fetchEarthdata,
} from './realData'

export interface AnalyzeRequest {
  destination: string
  startDate: string
  endDate: string
  preferences: MemberPreferences[]
  budgetMin?: number
  budgetMax?: number
}

export interface AnalyzeResult {
  llm: DestinationAnalysis      // regelbasierte Analyse (source: 'engine')
  climate?: ClimateData
  biodiversity?: BiodiversityData
  nasa?: NasaData
  earthdata?: EarthdataData
}

function aggregateInterests(prefs: MemberPreferences[]): string[] {
  const counts = prefs.flatMap((p) => p.interests).reduce<Record<string, number>>((acc, i) => {
    acc[i] = (acc[i] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k]) => k)
}

/**
 * Bewertet ein Reiseziel ausschließlich anhand ECHTER Daten.
 * Wirft einen Fehler, wenn der Ort nicht gefunden wird oder gar keine
 * Wetterdaten verfügbar sind — es gibt KEINEN Mock-Fallback.
 */
export async function analyzeDestination(req: AnalyzeRequest): Promise<AnalyzeResult> {
  const interests = aggregateInterests(req.preferences)

  const geo = await geocode(req.destination)
  if (!geo) {
    throw new Error(`Ort „${req.destination}" konnte nicht gefunden werden.`)
  }

  const [climate, biodiversity, nasa, earthdata] = await Promise.all([
    fetchClimate(geo.lat, geo.lon, req.startDate).catch(() => null),
    fetchBiodiversity(geo.countryCode, geo.name).catch(() => null),
    fetchNasaPower(geo.lat, geo.lon, req.startDate).catch(() => null),
    fetchEarthdata(geo.lat, geo.lon, req.startDate).catch(() => null),
  ])

  // Ohne jegliche Klimaquelle ist keine sinnvolle Bewertung möglich.
  if (!climate && !nasa) {
    throw new Error('Keine Wetterdaten verfügbar — bitte später erneut versuchen.')
  }

  const llm = computeDestinationScore({
    climate, biodiversity, nasa, earthdata,
    interests,
    budgetMin: req.budgetMin,
    budgetMax: req.budgetMax,
  })

  return {
    llm,
    climate: climate ?? undefined,
    biodiversity: biodiversity ?? undefined,
    nasa: nasa ?? undefined,
    earthdata: earthdata ?? undefined,
  }
}
