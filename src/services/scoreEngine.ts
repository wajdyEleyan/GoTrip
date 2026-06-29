// src/services/scoreEngine.ts
// Transparente, regelbasierte Reiseziel-Bewertung — KEIN LLM, KEINE Mock-Daten.
//
// Die Bewertung besteht aus zwei Teilen, die aus ECHTEN Daten kommen:
//   • Klima-Komfort (40 %): Temperatur, Niederschlag, Sonne, Wind, Feuchte
//   • Interessen-Erfüllung (60 %): Passt das Ziel zu den gewählten Interessen?
//
// Wichtig: Ein NICHT erfüllbares Interesse senkt den Score deutlich.
// Beispiel: Interesse „Strand", aber das Ziel liegt im Binnenland (kein Meer)
// → niedrige Erfüllung → niedriger Gesamt-Score.
import type {
  ClimateData, BiodiversityData, NasaData, EarthdataData, DestinationAnalysis,
} from '@/types/destination'

export interface ScoreInput {
  climate?: ClimateData | null
  biodiversity?: BiodiversityData | null
  nasa?: NasaData | null
  earthdata?: EarthdataData | null
  interests: string[]
  budgetMin?: number
  budgetMax?: number
  coastal?: boolean        // liegt das Ziel am Meer? (Open-Meteo Marine)
  population?: number       // Einwohnerzahl (Open-Meteo Geocoding)
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const round = (n: number) => Math.round(n)

const INTEREST_LABEL: Record<string, string> = {
  beach: 'Strand', relaxation: 'Erholung', city: 'Stadt', nightlife: 'Nachtleben',
  shopping: 'Shopping', culture: 'Kultur', food: 'Kulinarik', nature: 'Natur',
  adventure: 'Abenteuer',
}

export function computeDestinationScore(input: ScoreInput): DestinationAnalysis {
  const { climate, biodiversity, nasa, earthdata, interests, coastal, population } = input
  const dataPoints: string[] = []

  // ════════════════════════ 1) KLIMA-KOMFORT (0–100) ════════════════════════
  let climateScore = 50
  const temp = climate?.temp_avg ?? nasa?.temp_avg ?? null
  if (temp != null) {
    if (temp >= 20 && temp <= 26) climateScore += 25
    else if ((temp >= 15 && temp < 20) || (temp > 26 && temp <= 30)) climateScore += 12
    else if (temp > 30 && temp <= 34) climateScore -= 5
    else if (temp > 34) climateScore -= 20
    else climateScore -= 15 // < 15 °C
    dataPoints.push(`🌡️ Ø ${temp}°C im Reisezeitraum (Copernicus ERA5)`)
  }
  if (climate?.precipitation_mm != null) {
    const p = climate.precipitation_mm
    if (p < 20) climateScore += 12
    else if (p <= 50) climateScore += 5
    else if (p > 90) climateScore -= 12
    dataPoints.push(`🌧️ ${p} mm Niederschlag im Monat (Copernicus ERA5)`)
  }
  if (climate?.sunshine_hours != null && climate.sunshine_hours > 0) {
    if (climate.sunshine_hours >= 9) climateScore += 8
    else if (climate.sunshine_hours >= 6) climateScore += 4
    dataPoints.push(`☀️ ${climate.sunshine_hours} h Sonne/Tag (Copernicus ERA5)`)
  }
  if (nasa?.solar_irradiance != null) {
    dataPoints.push(`🛰️ ${nasa.solar_irradiance} kWh/m²/Tag Sonneneinstrahlung (NASA POWER)`)
  }
  if (nasa?.humidity != null) {
    if (nasa.humidity > 80) climateScore -= 5
    dataPoints.push(`💧 ${nasa.humidity} % Luftfeuchte (NASA POWER)`)
  }
  if (nasa?.wind_speed != null) {
    if (nasa.wind_speed > 8) climateScore -= 3
    dataPoints.push(`💨 ${nasa.wind_speed} m/s Wind (NASA POWER)`)
  }
  climateScore = clamp(climateScore)

  // ════════════════════ 2) INTERESSEN-ERFÜLLUNG (0–100) ═════════════════════
  const species = biodiversity?.species_count ?? null
  const pop = population ?? 0
  const warm = temp != null && temp >= 22

  // Erfüllungsgrad je Interesse (0 = gar nicht, 100 = perfekt) aus echten Daten.
  function fit(i: string): number {
    switch (i) {
      case 'beach':       return !coastal ? 8 : (warm ? 95 : 65)      // ohne Meer ~0
      case 'relaxation':  return coastal ? 85 : 62
      case 'city':        return pop >= 500000 ? 92 : pop >= 100000 ? 72 : pop >= 30000 ? 45 : 18
      case 'nightlife':   return pop >= 300000 ? 90 : pop >= 80000 ? 60 : pop >= 30000 ? 38 : 14
      case 'shopping':    return pop >= 300000 ? 88 : pop >= 80000 ? 62 : pop >= 30000 ? 42 : 20
      case 'culture':     return pop >= 100000 ? 82 : pop >= 30000 ? 62 : 45
      case 'food':        return pop >= 50000 ? 75 : 58
      case 'nature':      return species != null ? (species > 1_000_000 ? 85 : species > 100_000 ? 70 : 55) : 60
      case 'adventure':   return species != null && species > 500_000 ? 80 : 60
      default:            return 60
    }
  }

  const fits = interests.map(i => ({ key: i, value: fit(i) }))
  const interestScore = fits.length
    ? round(fits.reduce((s, f) => s + f.value, 0) / fits.length)
    : 70 // keine Interessen angegeben → neutral

  const unmet = fits.filter(f => f.value < 35).map(f => INTEREST_LABEL[f.key] ?? f.key)
  const met = fits.filter(f => f.value >= 70).map(f => INTEREST_LABEL[f.key] ?? f.key)

  // ════════════════════ 3) GESAMT: Interessen dominieren ════════════════════
  const score = clamp(round(climateScore * 0.4 + interestScore * 0.6))

  // ── Datenpunkte zu Lage & Interessen ──
  if (coastal != null) {
    dataPoints.push(coastal ? '🏖️ Küstenlage — Meer/Strand vorhanden' : '🏔️ Binnenland — kein Meer')
  }
  if (population != null) dataPoints.push(`👥 ${population.toLocaleString('de-DE')} Einwohner`)
  if (species != null) dataPoints.push(`🦋 ${species.toLocaleString('de-DE')} Artvorkommen (GBIF)`)
  if (interests.length) dataPoints.push(`🎯 Interessen: ${interests.join(', ')}`)
  if (input.budgetMin != null && input.budgetMax != null) {
    dataPoints.push(`💶 Budget €${input.budgetMin}–€${input.budgetMax} pro Person`)
  }
  if (earthdata?.granule_count != null) {
    dataPoints.push(`📡 ${earthdata.granule_count} NASA-Satellitenaufnahmen decken die Region ab (NASA Earthdata)`)
  }

  // ── Begründung ──
  const verdict =
    score >= 80 ? 'Sehr gut geeignet'
    : score >= 65 ? 'Gut geeignet'
    : score >= 50 ? 'Bedingt geeignet'
    : 'Weniger geeignet'

  const parts: string[] = []
  if (met.length) parts.push(`passt zu ${met.join(', ')}`)
  if (unmet.length) parts.push(`aber ${unmet.join(', ')} kaum erfüllbar`)
  if (temp != null) parts.push(`Ø ${temp}°C`)
  const reasoning = `${verdict} — ${parts.join('; ') || 'auf Basis der Messdaten'}. Regelbasiert aus echten Daten (Copernicus, GBIF, NASA), ohne KI-Sprachmodell.`

  return { score, reasoning, dataPoints, source: 'engine' }
}
