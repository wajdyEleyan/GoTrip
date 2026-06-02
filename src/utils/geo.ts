// src/utils/geo.ts
// Länder-Liste + Stadt/Land-Validierung über echte Geocoding-Daten
// (Open-Meteo Geocoding API — kostenlos, kein Key, CORS-fähig).
// Verhindert unsinnige Kombinationen wie Land=Spanien / Stadt=Frankfurt.

export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string // deutscher Name
  flag: string // Emoji-Flagge
}

// Kuratierte Liste beliebter Reiseländer.
export const COUNTRIES: Country[] = [
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
  { code: 'ES', name: 'Spanien', flag: '🇪🇸' },
  { code: 'IT', name: 'Italien', flag: '🇮🇹' },
  { code: 'FR', name: 'Frankreich', flag: '🇫🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Griechenland', flag: '🇬🇷' },
  { code: 'NL', name: 'Niederlande', flag: '🇳🇱' },
  { code: 'AT', name: 'Österreich', flag: '🇦🇹' },
  { code: 'CH', name: 'Schweiz', flag: '🇨🇭' },
  { code: 'GB', name: 'Großbritannien', flag: '🇬🇧' },
  { code: 'IE', name: 'Irland', flag: '🇮🇪' },
  { code: 'BE', name: 'Belgien', flag: '🇧🇪' },
  { code: 'HR', name: 'Kroatien', flag: '🇭🇷' },
  { code: 'CZ', name: 'Tschechien', flag: '🇨🇿' },
  { code: 'PL', name: 'Polen', flag: '🇵🇱' },
  { code: 'HU', name: 'Ungarn', flag: '🇭🇺' },
  { code: 'SE', name: 'Schweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norwegen', flag: '🇳🇴' },
  { code: 'DK', name: 'Dänemark', flag: '🇩🇰' },
  { code: 'TR', name: 'Türkei', flag: '🇹🇷' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'CA', name: 'Kanada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexiko', flag: '🇲🇽' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'AE', name: 'V. A. Emirate', flag: '🇦🇪' },
  { code: 'EG', name: 'Ägypten', flag: '🇪🇬' },
  { code: 'MA', name: 'Marokko', flag: '🇲🇦' },
  { code: 'AU', name: 'Australien', flag: '🇦🇺' },
  { code: 'BR', name: 'Brasilien', flag: '🇧🇷' },
]

export function countryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code)
}

export interface GeocodeMatch {
  name: string
  countryCode: string
  country: string
  admin1?: string
  latitude: number
  longitude: number
}

interface OpenMeteoResult {
  name: string
  country_code?: string
  country?: string
  admin1?: string
  latitude: number
  longitude: number
}

/**
 * Sucht eine Stadt und gibt das beste Ergebnis im gewünschten Land zurück.
 * Gibt `null` zurück, wenn die Stadt im gewählten Land nicht gefunden wird
 * (z. B. „Frankfurt" in „Spanien").
 *
 * Wirft `GeoNetworkError`, wenn der Dienst nicht erreichbar ist — der Aufrufer
 * kann dann entscheiden, ob er die Eingabe trotzdem zulässt.
 */
export async function findCityInCountry(
  city: string,
  countryCode: string,
): Promise<GeocodeMatch | null> {
  const query = encodeURIComponent(city.trim())
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=10&language=de&format=json`

  const resp = await fetch(url, { signal: AbortSignal.timeout(7000) })
  if (!resp.ok) throw new GeoNetworkError()
  const data = (await resp.json()) as { results?: OpenMeteoResult[] }
  const results = data.results ?? []

  const match = results.find((r) => r.country_code === countryCode)
  if (!match) return null

  return {
    name: match.name,
    countryCode: match.country_code ?? countryCode,
    country: match.country ?? '',
    admin1: match.admin1,
    latitude: match.latitude,
    longitude: match.longitude,
  }
}

export class GeoNetworkError extends Error {
  constructor() {
    super('Geocoding-Dienst nicht erreichbar')
    this.name = 'GeoNetworkError'
  }
}
