// Autor: Mohamad Haj Ahmad
// server/index.js — Backend-Proxy für Anthropic Claude API + Copernicus ERA5 + GBIF
// API-Key wird NIEMALS im Frontend gespeichert
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Anthropic = require('@anthropic-ai/sdk')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Geocoding (Open-Meteo) ─────────────────────────────────────────────────
// Converts city name → { lat, lon, country_code }
async function geocodeCity(cityName) {
  const query = encodeURIComponent(cityName.split(',')[0].trim())
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=de&format=json`
  const resp = await fetch(url, { signal: AbortSignal.timeout(5000) })
  const data = await resp.json()
  if (!data.results?.length) return null
  const r = data.results[0]
  return { lat: r.latitude, lon: r.longitude, countryCode: r.country_code ?? 'DE' }
}

// ─── Copernicus ERA5 via Open-Meteo Historical API ──────────────────────────
// Uses ERA5 reanalysis data (Copernicus Climate Data Store)
// Returns climate averages for the travel month
async function fetchClimateData(lat, lon, startDate) {
  // Use same month from 2 years ago as climate baseline (archive has ~5 month delay)
  const tripDate = new Date(startDate)
  const baseYear = tripDate.getFullYear() - 2
  const month = tripDate.getMonth()
  const baseStart = new Date(baseYear, month, 1)
  const baseEnd = new Date(baseYear, month + 1, 0)

  const fmt = (d) => d.toISOString().split('T')[0]
  const url = [
    'https://archive-api.open-meteo.com/v1/archive',
    `?latitude=${lat}&longitude=${lon}`,
    `&start_date=${fmt(baseStart)}&end_date=${fmt(baseEnd)}`,
    '&daily=temperature_2m_mean,temperature_2m_min,temperature_2m_max,precipitation_sum,sunshine_duration',
    '&timezone=auto',
  ].join('')

  const resp = await fetch(url, { signal: AbortSignal.timeout(8000) })
  const data = await resp.json()
  if (!data.daily?.temperature_2m_mean?.length) return null

  const d = data.daily
  const validMean = d.temperature_2m_mean.filter((v) => v !== null)
  const validMin  = d.temperature_2m_min.filter((v) => v !== null)
  const validMax  = d.temperature_2m_max.filter((v) => v !== null)
  const validPrec = d.precipitation_sum.filter((v) => v !== null)
  const validSun  = d.sunshine_duration.filter((v) => v !== null) // seconds/day

  const avg = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0

  return {
    temp_avg:          Math.round(avg(validMean) * 10) / 10,
    temp_min:          Math.round(Math.min(...validMin) * 10) / 10,
    temp_max:          Math.round(Math.max(...validMax) * 10) / 10,
    precipitation_mm:  Math.round(validPrec.reduce((s, v) => s + v, 0) * 10) / 10, // monthly total
    sunshine_hours:    Math.round(avg(validSun) / 3600 * 10) / 10, // seconds → hours per day
    source: 'copernicus', // ERA5 data sourced from Copernicus
  }
}

// ─── GBIF Biodiversity API ──────────────────────────────────────────────────
// https://www.gbif.org/developer/occurrence
async function fetchBiodiversityData(countryCode, destination) {
  const url = `https://api.gbif.org/v1/occurrence/search?country=${countryCode}&limit=0`
  const resp = await fetch(url, { signal: AbortSignal.timeout(5000) })
  const data = await resp.json()
  const count = data.count ?? 0

  // Get top species families for highlight text
  let highlight = `Artenreiche Natur in ${destination}`
  try {
    const famUrl = `https://api.gbif.org/v1/occurrence/search?country=${countryCode}&limit=0&facet=family&facetLimit=3`
    const famResp = await fetch(famUrl, { signal: AbortSignal.timeout(5000) })
    const famData = await famResp.json()
    const families = famData.facets?.[0]?.counts?.slice(0, 3).map((f) => f.name).join(', ')
    if (families) highlight = `Häufige Familien: ${families}`
  } catch { /* use default */ }

  return {
    species_count: Math.min(count, 9999999),
    highlight,
    source: 'gbif',
  }
}

// ─── POST /api/analyze-destination ─────────────────────────────────────────
app.post('/api/analyze-destination', async (req, res) => {
  const {
    destination,
    startDate,
    endDate,
    interests = [],
    budgetMin,
    budgetMax,
  } = req.body

  if (!destination) {
    return res.status(400).json({ error: 'destination is required' })
  }

  // 1. Geocode the city
  let geo = null
  try { geo = await geocodeCity(destination) } catch { /* fall through */ }

  // 2. Fetch real climate data (Copernicus ERA5 via Open-Meteo)
  let climateData = null
  if (geo) {
    try {
      climateData = await fetchClimateData(geo.lat, geo.lon, startDate ?? new Date().toISOString())
    } catch (err) {
      console.warn('Climate API error:', err.message)
    }
  }

  // 3. Fetch biodiversity data (GBIF)
  let biodiversityData = null
  if (geo) {
    try {
      biodiversityData = await fetchBiodiversityData(geo.countryCode, destination)
    } catch (err) {
      console.warn('GBIF API error:', err.message)
    }
  }

  console.log(`[analyze] ${destination} | geo:${geo ? '✓' : '✗'} | climate:${climateData ? '✓ (ERA5)' : '✗'} | gbif:${biodiversityData ? '✓' : '✗'}`)

  // 4. LLM analysis with Claude
  const systemPrompt = `Du bist ein Reise-Analyse-Assistent. Bewerte Reiseziele auf Basis von Klimadaten, Jahreszeit und Gruppeninteressen.
Antworte NUR mit validem JSON ohne Markdown-Blöcke: { "score": number (0-100), "reasoning": string (max 200 Zeichen, Deutsch), "dataPoints": string[] (3-5 Punkte) }`

  const userPrompt = `Analysiere folgendes Reiseziel:
- Ort: ${destination}
- Zeitraum: ${startDate} bis ${endDate}
- Gruppeninteressen: ${interests.join(', ') || 'keine Angabe'}
- Budget: €${budgetMin}–€${budgetMax} pro Person
- Klimadaten (Copernicus ERA5): ${climateData ? JSON.stringify(climateData) : 'nicht verfügbar'}
- Biodiversität (GBIF): ${biodiversityData ? JSON.stringify(biodiversityData) : 'nicht verfügbar'}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(text)
    res.json({ ...parsed, climateData, biodiversityData })
  } catch (err) {
    console.error('LLM error:', err.message)
    // Return available data even if LLM fails
    res.status(500).json({ error: 'LLM unavailable', climateData, biodiversityData })
  }
})

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  apis: { anthropic: !!process.env.ANTHROPIC_API_KEY, openMeteo: true, gbif: true }
}))

app.listen(PORT, () => {
  console.log(`GoTrip Backend-Proxy läuft auf http://localhost:${PORT}`)
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? '✓ gesetzt' : '✗ fehlt — Mock-Modus aktiv'}`)
  console.log(`Copernicus ERA5: via Open-Meteo Historical API (kein Key nötig)`)
  console.log(`GBIF API: öffentlich (kein Key nötig)`)
})
