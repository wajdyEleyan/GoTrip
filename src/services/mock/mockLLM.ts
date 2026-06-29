// Autor: Wajdy Eleyan
// src/services/mock/mockLLM.ts
// Mock-Fallback für Anthropic Claude API — stabile Demo ohne echte API
import type { LLMAnalysis } from '@/types/destination'
import type { MemberPreferences } from '@/types/preferences'

interface AnalyzeInput {
  destination: string
  startDate: string
  endDate: string
  interests: string[]
  budgetMin: number
  budgetMax: number
  tempAvg?: number
  precipitation?: number
  speciesCount?: number
}

const BASE_SCORES: Record<string, number> = {
  barcelona: 88,
  lisbon: 82,
  athens: 79,
  amsterdam: 65,
  rome: 84,
  paris: 75,
  berlin: 68,
  madrid: 77,
  vienna: 72,
  prague: 70,
}

const REASONINGS: Record<string, string> = {
  barcelona: 'Barcelona kombiniert perfekt Strand, Kultur und Gastronomie. Die Klimadaten zeigen ideale Sommerbedingungen mit 27°C und wenig Regen. Die mediterrane Biodiversität bietet zusätzlichen Erlebnisraum.',
  lisbon: 'Lissabon punktet mit mildem Atlantikklima, reicher Kulturgeschichte und einem hervorragenden Preis-Leistungs-Verhältnis. Wenig Niederschlag im Sommer macht es zum sicheren Ziel.',
  athens: 'Athen bietet einzigartigen Kulturreichtum, ist jedoch im Hochsommer sehr heiß (33°C+). Ideal für kultur- und geschichtsinteressierte Gruppen mit Hitzetoleranz.',
  amsterdam: 'Amsterdam bietet viel Kultur und Nachtleben, jedoch ist das Wetter im Sommer wechselhaft. Höhere Regenwahrscheinlichkeit kann Outdoor-Aktivitäten einschränken.',
  rome: 'Rom vereint Geschichte, Kulinarik und Architektur. Klimatisch angenehm, aber belebte Touristensaison. Hervorragend für Kultur- und Foodie-Gruppen.',
  paris: 'Paris ist immer eine Reise wert – Kultur, Mode, Gastronomie. Das Klima ist angenehm, obwohl etwas regnerischer als südeuropäische Alternativen.',
  default: 'Dieses Reiseziel bietet eine gute Balance zwischen den Gruppeninteressen und den Klimabedingungen des gewählten Zeitraums. Die Biodiversitätsdaten zeigen eine interessante regionale Artenvielfalt.',
}

export function getMockLLMAnalysis(input: AnalyzeInput): LLMAnalysis {
  const key = input.destination.toLowerCase().split(',')[0].trim()
  let baseScore = BASE_SCORES[key] ?? 70

  // Adjust score based on interests match
  const beachInterests = ['beach', 'relaxation']
  const culturalInterests = ['culture', 'food', 'city']
  const outdoorInterests = ['nature', 'adventure']

  if (input.interests.some((i) => beachInterests.includes(i)) && input.tempAvg && input.tempAvg > 25) {
    baseScore += 5
  }
  if (input.interests.some((i) => culturalInterests.includes(i))) {
    baseScore += 3
  }
  if (input.interests.some((i) => outdoorInterests.includes(i)) && input.speciesCount && input.speciesCount > 1000) {
    baseScore += 4
  }
  if (input.precipitation && input.precipitation < 20) {
    baseScore += 3
  }

  baseScore = Math.min(98, Math.max(40, baseScore))

  const dataPoints = [
    input.tempAvg ? `Ø ${input.tempAvg}°C im Reisezeitraum` : null,
    input.precipitation !== undefined ? `${input.precipitation}mm Niederschlag` : null,
    input.speciesCount ? `${input.speciesCount} Tierarten (GBIF)` : null,
    `Budget €${input.budgetMin}–€${input.budgetMax} pro Person`,
    `Interessen: ${input.interests.join(', ')}`,
  ].filter(Boolean) as string[]

  return {
    score: baseScore,
    reasoning: REASONINGS[key] ?? REASONINGS.default,
    dataPoints,
    source: 'engine',
  }
}

export function getMockGroupPreferences(preferences: MemberPreferences[]): string[] {
  if (preferences.length === 0) return []
  const allInterests = preferences.flatMap((p) => p.interests)
  const counts = allInterests.reduce<Record<string, number>>((acc, i) => {
    acc[i] = (acc[i] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k]) => k)
}
