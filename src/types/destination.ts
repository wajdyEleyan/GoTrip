// Autor: Mohamad Haj Ahmad
// src/types/destination.ts

export interface ClimateData {
  temp_avg: number           // °C
  temp_min: number
  temp_max: number
  precipitation_mm: number
  sunshine_hours: number
  source: 'copernicus' | 'mock'
}

export interface BiodiversityData {
  species_count: number
  highlight: string
  source: 'gbif' | 'mock'
}

export interface LLMAnalysis {
  score: number              // 0–100
  reasoning: string
  dataPoints: string[]
  source: 'llm' | 'mock'
}

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
  llmAnalysis?: LLMAnalysis
  isLoading?: boolean
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
}
