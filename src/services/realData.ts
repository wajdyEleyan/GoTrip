// src/services/realData.ts
// Holt ECHTE Daten direkt im Browser (alle CORS-fähig, kostenlos, kein Key):
//  • Open-Meteo Geocoding  → Koordinaten + Ländercode
//  • Open-Meteo Archive    → Copernicus/ERA5-Klima
//  • GBIF                  → Biodiversität
//  • NASA POWER            → Sonne/Feuchte/Wind
// NASA Earthdata (Token) ist optional und läuft nur über den lokalen Server.
import type { ClimateData, BiodiversityData, NasaData, EarthdataData } from '@/types/destination'

export interface GeoPoint {
  lat: number
  lon: number
  countryCode: string
  name: string
  country: string
}

const timeout = (ms: number) => AbortSignal.timeout(ms)

// ── Geocoding ──────────────────────────────────────────────────────────────
export async function geocode(destination: string): Promise<GeoPoint | null> {
  const city = destination.split(',')[0].trim()
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=de&format=json`
  const resp = await fetch(url, { signal: timeout(7000) })
  if (!resp.ok) return null
  const data = await resp.json()
  const r = data.results?.[0]
  if (!r) return null
  return {
    lat: r.latitude,
    lon: r.longitude,
    countryCode: r.country_code ?? 'DE',
    name: r.name,
    country: r.country ?? '',
  }
}

// ── Copernicus ERA5 (via Open-Meteo Archive) ─────────────────────────────────
export async function fetchClimate(lat: number, lon: number, startDate: string): Promise<ClimateData | null> {
  const tripDate = new Date(startDate)
  const baseYear = tripDate.getFullYear() - 2 // Archiv hat ~5 Monate Verzug
  const month = tripDate.getMonth()
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const start = fmt(new Date(baseYear, month, 1))
  const end = fmt(new Date(baseYear, month + 1, 0))

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_mean,temperature_2m_min,temperature_2m_max,precipitation_sum,sunshine_duration&timezone=auto`
  const resp = await fetch(url, { signal: timeout(9000) })
  if (!resp.ok) return null
  const data = await resp.json()
  const d = data.daily
  if (!d?.temperature_2m_mean?.length) return null

  const valid = (a: (number | null)[]) => a.filter((v): v is number => v !== null)
  const avg = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0)
  const mean = valid(d.temperature_2m_mean)
  const min = valid(d.temperature_2m_min)
  const max = valid(d.temperature_2m_max)
  const prec = valid(d.precipitation_sum)
  const sun = valid(d.sunshine_duration) // Sekunden/Tag

  return {
    temp_avg: Math.round(avg(mean) * 10) / 10,
    temp_min: min.length ? Math.round(Math.min(...min) * 10) / 10 : 0,
    temp_max: max.length ? Math.round(Math.max(...max) * 10) / 10 : 0,
    precipitation_mm: Math.round(prec.reduce((s, v) => s + v, 0) * 10) / 10,
    sunshine_hours: Math.round((avg(sun) / 3600) * 10) / 10,
    source: 'copernicus',
  }
}

// ── GBIF Biodiversität ───────────────────────────────────────────────────────
export async function fetchBiodiversity(countryCode: string, name: string): Promise<BiodiversityData | null> {
  const base = `https://api.gbif.org/v1/occurrence/search?country=${countryCode}&limit=0`
  const resp = await fetch(base, { signal: timeout(7000) })
  if (!resp.ok) return null
  const data = await resp.json()
  const count = data.count ?? 0

  let highlight = `Artenreiche Natur in ${name}`
  try {
    const famResp = await fetch(`${base}&facet=family&facetLimit=3`, { signal: timeout(7000) })
    const famData = await famResp.json()
    const families = famData.facets?.[0]?.counts?.slice(0, 3).map((f: { name: string }) => f.name).join(', ')
    if (families) highlight = `Häufige Familien: ${families}`
  } catch { /* Standard behalten */ }

  return { species_count: count, highlight, source: 'gbif' }
}

// ── NASA POWER ────────────────────────────────────────────────────────────────
const NASA_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

export async function fetchNasaPower(lat: number, lon: number, startDate: string): Promise<NasaData | null> {
  const month = NASA_MONTHS[new Date(startDate).getMonth()] ?? 'JAN'
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,ALLSKY_SFC_SW_DWN,RH2M,WS2M&community=RE&longitude=${lon}&latitude=${lat}&format=JSON`
  const resp = await fetch(url, { signal: timeout(9000) })
  if (!resp.ok) return null
  const data = await resp.json()
  const p = data?.properties?.parameter
  if (!p) return null
  const pick = (param: string) => {
    const v = p[param]?.[month]
    return typeof v === 'number' && v > -900 ? Math.round(v * 10) / 10 : null
  }
  return {
    temp_avg: pick('T2M'),
    solar_irradiance: pick('ALLSKY_SFC_SW_DWN'),
    humidity: pick('RH2M'),
    wind_speed: pick('WS2M'),
    source: 'nasa_power',
  }
}

// ── NASA Earthdata (optional, nur wenn lokaler Server + Token läuft) ──────────
export async function fetchEarthdata(lat: number, lon: number, startDate: string): Promise<EarthdataData | null> {
  try {
    const url = `/api/earthdata?lat=${lat}&lon=${lon}&date=${encodeURIComponent(startDate)}`
    const resp = await fetch(url, { signal: timeout(11000) })
    if (!resp.ok) return null
    const data = await resp.json()
    if (data?.token_valid === false || data?.granule_count == null) return null
    return { granule_count: data.granule_count, dataset: data.dataset, source: 'earthdata' }
  } catch {
    return null // Server nicht erreichbar → Earthdata einfach weglassen
  }
}
