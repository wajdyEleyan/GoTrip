// src/services/scoreEngine.ts
// Transparente, regelbasierte Reiseziel-Bewertung — KEIN LLM, KEINE Mock-Daten.
// Rechnet einen Score (0–100) deterministisch aus den ECHTEN Messdaten
// (Copernicus/ERA5, GBIF, NASA POWER, optional NASA Earthdata) plus den
// Gruppen-Interessen und dem Budget.
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
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const round = (n: number) => Math.round(n)

export function computeDestinationScore(input: ScoreInput): DestinationAnalysis {
  const { climate, biodiversity, nasa, earthdata, interests } = input
  const reasons: string[] = []   // fließt in reasoning ein
  const dataPoints: string[] = []

  // Neutraler Startwert; echte Daten verschieben ihn auf/ab.
  let score = 60

  // ── Temperatur-Komfort ──────────────────────────────────────────────
  const temp = climate?.temp_avg ?? nasa?.temp_avg ?? null
  if (temp != null) {
    if (temp >= 20 && temp <= 26) { score += 15; reasons.push(`angenehme ${temp}°C`) }
    else if ((temp >= 15 && temp < 20) || (temp > 26 && temp <= 30)) { score += 8; reasons.push(`milde ${temp}°C`) }
    else if (temp > 30 && temp <= 34) { score += 0; reasons.push(`heiße ${temp}°C`) }
    else if (temp > 34) { score -= 10; reasons.push(`sehr heiße ${temp}°C`) }
    else { score -= 8; reasons.push(`kühle ${temp}°C`) }
    dataPoints.push(`🌡️ Ø ${temp}°C im Reisezeitraum (Copernicus ERA5)`)
  }

  // ── Niederschlag ────────────────────────────────────────────────────
  if (climate?.precipitation_mm != null) {
    const p = climate.precipitation_mm
    if (p < 20) { score += 10; reasons.push('kaum Regen') }
    else if (p <= 50) { score += 4 }
    else if (p <= 90) { score += 0 }
    else { score -= 8; reasons.push('viel Regen') }
    dataPoints.push(`🌧️ ${p} mm Niederschlag im Monat (Copernicus ERA5)`)
  }

  // ── Sonne ───────────────────────────────────────────────────────────
  if (climate?.sunshine_hours != null && climate.sunshine_hours > 0) {
    const s = climate.sunshine_hours
    if (s >= 9) { score += 8; reasons.push(`${s} h Sonne/Tag`) }
    else if (s >= 6) { score += 4 }
    dataPoints.push(`☀️ ${s} h Sonne/Tag (Copernicus ERA5)`)
  }

  // ── NASA POWER: Sonneneinstrahlung, Luftfeuchte, Wind ───────────────
  if (nasa?.solar_irradiance != null) {
    if (nasa.solar_irradiance >= 5) score += 4
    dataPoints.push(`🛰️ ${nasa.solar_irradiance} kWh/m²/Tag Sonneneinstrahlung (NASA POWER)`)
  }
  if (nasa?.humidity != null) {
    if (nasa.humidity > 80) { score -= 4; reasons.push('schwül') }
    dataPoints.push(`💧 ${nasa.humidity} % Luftfeuchte (NASA POWER)`)
  }
  if (nasa?.wind_speed != null) {
    if (nasa.wind_speed > 8) { score -= 3; reasons.push('windig') }
    dataPoints.push(`💨 ${nasa.wind_speed} m/s Wind (NASA POWER)`)
  }

  // ── Biodiversität (GBIF) ────────────────────────────────────────────
  if (biodiversity?.species_count != null) {
    const n = biodiversity.species_count
    const wantsNature = interests.some(i => ['nature', 'adventure'].includes(i))
    if (wantsNature && n > 50000) { score += 8; reasons.push('hohe Artenvielfalt') }
    else if (n > 100000) { score += 3 }
    dataPoints.push(`🦋 ${n.toLocaleString('de-DE')} dokumentierte Artvorkommen (GBIF)`)
  }

  // ── Interessen-Abgleich mit dem Klima ───────────────────────────────
  const wantsBeach = interests.some(i => ['beach', 'relaxation'].includes(i))
  const wantsCulture = interests.some(i => ['culture', 'food', 'city'].includes(i))
  if (wantsBeach && temp != null && temp >= 24 && (climate?.precipitation_mm ?? 0) < 40) {
    score += 6; reasons.push('ideal für Strand & Erholung')
  }
  if (wantsCulture) score += 3

  // ── Budget (informativ; leichter Einfluss) ──────────────────────────
  if (input.budgetMin != null && input.budgetMax != null) {
    dataPoints.push(`💶 Budget €${input.budgetMin}–€${input.budgetMax} pro Person`)
  }
  if (interests.length > 0) {
    dataPoints.push(`🎯 Interessen: ${interests.join(', ')}`)
  }

  // ── NASA Earthdata: Satelliten-Abdeckung (Nachweis echter Coverage) ─
  if (earthdata?.granule_count != null) {
    dataPoints.push(`🛰️ ${earthdata.granule_count} NASA-Satellitenaufnahmen decken die Region ab (NASA Earthdata)`)
  }

  score = clamp(round(score))

  // ── Begründung dynamisch zusammenbauen ──────────────────────────────
  const verdict =
    score >= 80 ? 'Sehr gut geeignet'
    : score >= 65 ? 'Gut geeignet'
    : score >= 50 ? 'Bedingt geeignet'
    : 'Weniger geeignet'

  const factorText = reasons.length
    ? reasons.slice(0, 3).join(', ')
    : 'auf Basis der verfügbaren Messdaten'
  const reasoning = `${verdict} für den gewählten Zeitraum — ${factorText}. Bewertung aus echten Messdaten (Copernicus, GBIF, NASA), ohne KI-Sprachmodell.`

  return { score, reasoning, dataPoints, source: 'engine' }
}
