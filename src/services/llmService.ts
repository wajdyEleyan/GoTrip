// Autor: Mohamad Haj Ahmad
// src/services/llmService.ts
// Calls backend proxy (/api/analyze-destination) or falls back to mock.
// Backend fetches real Copernicus ERA5 climate data (via Open-Meteo)
// and real GBIF biodiversity data before calling the LLM.
import type { LLMAnalysis, ClimateData, BiodiversityData } from '@/types/destination'
import type { MemberPreferences } from '@/types/preferences'
import { getMockLLMAnalysis } from './mock/mockLLM'
import { getMockClimate } from './mock/mockCopernicus'
import { getMockBiodiversity } from './mock/mockGBIF'

export interface AnalyzeRequest {
  destination: string
  startDate: string
  endDate: string
  preferences: MemberPreferences[]
  budgetMin?: number
  budgetMax?: number
}

export interface AnalyzeResult {
  llm: LLMAnalysis
  climate: ClimateData
  biodiversity: BiodiversityData
}

function aggregateInterests(prefs: MemberPreferences[]): string[] {
  const counts = prefs.flatMap((p) => p.interests).reduce<Record<string, number>>((acc, i) => {
    acc[i] = (acc[i] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k]) => k)
}

export async function analyzeDestination(req: AnalyzeRequest): Promise<AnalyzeResult> {
  const interests = aggregateInterests(req.preferences)

  try {
    const resp = await fetch('/api/analyze-destination', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: req.destination,
        startDate: req.startDate,
        endDate: req.endDate,
        interests,
        budgetMin: req.budgetMin,
        budgetMax: req.budgetMax,
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (resp.ok) {
      const data = await resp.json() as {
        score: number
        reasoning: string
        dataPoints: string[]
        climateData?: ClimateData
        biodiversityData?: BiodiversityData
      }

      // Use real data from server if available, otherwise fall back to mock
      const climate = data.climateData ?? getMockClimate(req.destination)
      const biodiversity = data.biodiversityData ?? getMockBiodiversity(req.destination)

      return {
        llm: { score: data.score, reasoning: data.reasoning, dataPoints: data.dataPoints, source: 'llm' },
        climate,
        biodiversity,
      }
    }
  } catch {
    // Backend not running or timeout — full mock fallback
  }

  // Full mock fallback
  const climate = getMockClimate(req.destination)
  const biodiversity = getMockBiodiversity(req.destination)
  const llm = getMockLLMAnalysis({
    destination: req.destination,
    startDate: req.startDate,
    endDate: req.endDate,
    interests,
    budgetMin: req.budgetMin,
    budgetMax: req.budgetMax,
    tempAvg: climate.temp_avg,
    precipitation: climate.precipitation_mm,
    speciesCount: biodiversity.species_count,
  })

  return { llm, climate, biodiversity }
}
