// Autor: Mohamad Haj Ahmad

export interface ClimateData {
  temp_avg: number           // °C
  temp_min: number
  temp_max: number
  precipitation_mm: number
  sunshine_hours: number
  source: 'copernicus'       // ERA5 via Open-Meteo (echte Daten)
}

export interface BiodiversityData {
  species_count: number
  highlight: string
  source: 'gbif'             // echte GBIF-Daten
}

export interface NasaData {
  temp_avg: number | null          // °C
  solar_irradiance: number | null  // kWh/m²/Tag
  humidity: number | null          // %
  wind_speed: number | null        // m/s
  source: 'nasa_power'
}

export interface EarthdataData {
  granule_count: number
  dataset: string
  source: 'earthdata'
}

export interface DestinationAnalysis {
  score: number              // 0–100
  reasoning: string
  dataPoints: string[]
  source: 'engine'           // regelbasiert aus echten Messdaten (kein LLM)
}

// Rückwärtskompatibler Alias (vormals LLM-basiert, jetzt regelbasiert).
export type LLMAnalysis = DestinationAnalysis

export interface Destination {
  id: string
  tripId: string
  name: string               // "Barcelona, Spanien"
  country: string
  proposedBy: string         // memberId
  proposedByName: string
  createdAt: string
  climate?: ClimateData
  biodiversity?: BiodiversityData
  nasa?: NasaData
  earthdata?: EarthdataData
  llmAnalysis?: DestinationAnalysis
  coastal?: boolean          // Küstenlage — für dynamische Score-Neuberechnung
  population?: number        // Einwohnerzahl — für dynamische Score-Neuberechnung
  isLoading?: boolean
  dataError?: boolean        // true, wenn echte Daten nicht geladen werden konnten
}

export interface DestinationVote {
  destinationId: string
  memberId: string
  memberName: string
  stars: number              // 0.5–5.0 in 0.5 steps
  comment?: string           // optional short reasoning
  votedAt: string
}

export interface RankedDestination extends Destination {
  starsAvg: number
  voteCount: number
  hybridScore: number        // 0–1
  myVote?: number
  myComment?: string
  allVotes?: DestinationVote[]
  dynamicAnalysis?: DestinationAnalysis  // mit aktuellen Präferenzen neu berechnet
}
