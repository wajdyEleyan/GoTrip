// Autor: Mohamad Haj Ahmad
// server/index.js — Schlanker Backend-Proxy NUR für NASA Earthdata (CMR).
//
// Alle anderen Datenquellen (Copernicus/ERA5, GBIF, NASA POWER) ruft das
// Frontend direkt auf (CORS-fähig). Die Bewertung erfolgt regelbasiert im
// Frontend — KEIN LLM, KEINE Mock-Daten.
//
// Dieser Server existiert nur, weil der Earthdata-Token NICHT ins Frontend
// gehört. Läuft der Server nicht, funktioniert die App trotzdem — dann eben
// ohne die optionalen Earthdata-Satellitendaten.
const path = require('path')
const fs = require('fs')
// .env immer aus dem server-Ordner laden — egal, von wo gestartet wird.
// (Auf Render kommt der Token als echte Env-Var; dotenv überschreibt die nicht.)
require('dotenv').config({ path: path.join(__dirname, '.env') })
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001
const EARTHDATA_TOKEN = process.env.EARTHDATA_TOKEN

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'] }))
app.use(express.json({ limit: '2mb' }))

// ─── Geteilte Reise-Datenbank (Postgres / Neon) ─────────────────────────────
// Speichert pro Reise EIN Dokument (alle Daten) unter ihrem inviteCode, damit
// alle Gruppenmitglieder dieselbe Reise sehen. Ohne DATABASE_URL ist die
// Sync-API inaktiv → die App läuft dann rein lokal pro Browser (wie zuvor).
let pool = null
const DATABASE_URL = process.env.DATABASE_URL
if (DATABASE_URL) {
  const { Pool } = require('pg')
  pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  pool.query(`
    CREATE TABLE IF NOT EXISTS trips (
      invite_code TEXT PRIMARY KEY,
      data        JSONB NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `).then(() => console.log('DB: Tabelle "trips" bereit'))
    .catch((e) => console.error('DB-Init-Fehler:', e.message))
}

// Arrays nach Schlüssel mergen: vorhandene bleiben, eingehende gewinnen bei
// Konflikt. So gehen Beiträge anderer Mitglieder nicht verloren.
function mergeArray(existing = [], incoming = [], keyFn) {
  const map = new Map()
  for (const it of existing) map.set(keyFn(it), it)
  for (const it of incoming) map.set(keyFn(it), it)
  return [...map.values()]
}

function mergeTrip(existing, incoming) {
  if (!existing) return incoming
  // Mitglieder leben in trip.members und müssen vereint werden (Beitreten!).
  const baseTrip = incoming.trip ?? existing.trip
  const members = mergeArray(existing.trip?.members, incoming.trip?.members, (m) => m.id)
  return {
    trip:           { ...baseTrip, members },
    availabilities: mergeArray(existing.availabilities, incoming.availabilities, (a) => a.memberId),
    preferences:    mergeArray(existing.preferences, incoming.preferences, (p) => p.memberId),
    destinations:   mergeArray(existing.destinations, incoming.destinations, (d) => d.id),
    votes:          mergeArray(existing.votes, incoming.votes, (v) => `${v.destinationId}|${v.memberId}`),
    activities:     mergeArray(existing.activities, incoming.activities, (a) => a.id),
    expenses:       mergeArray(existing.expenses, incoming.expenses, (e) => e.id),
  }
}

// GET /api/trips/:code → ganzes Reise-Bündel
app.get('/api/trips/:code', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Keine Datenbank konfiguriert' })
  try {
    const { rows } = await pool.query('SELECT data FROM trips WHERE invite_code = $1', [req.params.code])
    if (!rows.length) return res.status(404).json({ error: 'Reise nicht gefunden' })
    res.json(rows[0].data)
  } catch (e) {
    console.error('DB GET-Fehler:', e.message)
    res.status(500).json({ error: 'DB-Fehler' })
  }
})

// PUT /api/trips/:code → Bündel mit dem gespeicherten Stand mergen & speichern
app.put('/api/trips/:code', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Keine Datenbank konfiguriert' })
  const incoming = req.body
  if (!incoming || typeof incoming !== 'object') return res.status(400).json({ error: 'Ungültige Daten' })
  try {
    const { rows } = await pool.query('SELECT data FROM trips WHERE invite_code = $1', [req.params.code])
    const merged = mergeTrip(rows[0]?.data, incoming)
    await pool.query(
      `INSERT INTO trips (invite_code, data, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (invite_code) DO UPDATE SET data = $2, updated_at = now()`,
      [req.params.code, merged],
    )
    res.json(merged)
  } catch (e) {
    console.error('DB PUT-Fehler:', e.message)
    res.status(500).json({ error: 'DB-Fehler' })
  }
})

// ─── NASA Earthdata (CMR) ───────────────────────────────────────────────────
// Nutzt den Earthdata Login Token (Bearer/JWT) gegen das Common Metadata
// Repository und ermittelt, wie viele MODIS-Aufnahmen (Land Surface
// Temperature, MOD11A1) die Zielregion im Reisemonat abdecken.
const NASA_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

async function fetchEarthdataCoverage(lat, lon, startDate) {
  if (!EARTHDATA_TOKEN) return null

  const d = new Date(startDate)
  const year = d.getFullYear() - 1 // letztes abgeschlossenes Jahr
  const month = d.getMonth()
  const start = new Date(Date.UTC(year, month, 1)).toISOString()
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59)).toISOString()

  const bbox = `${lon - 1},${lat - 1},${lon + 1},${lat + 1}` // W,S,E,N
  const url = [
    'https://cmr.earthdata.nasa.gov/search/granules.json',
    '?short_name=MOD11A1',
    `&bounding_box=${bbox}`,
    `&temporal=${start},${end}`,
    '&page_size=1',
  ].join('')

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${EARTHDATA_TOKEN}` },
    signal: AbortSignal.timeout(10000),
  })

  if (resp.status === 401 || resp.status === 403) {
    return { token_valid: false }
  }
  if (!resp.ok) return null

  const hits = Number(resp.headers.get('CMR-Hits') ?? 0)
  return {
    granule_count: hits,
    dataset: 'MODIS Land Surface Temperature (MOD11A1)',
    token_valid: true,
    source: 'earthdata',
  }
}

// ─── GET /api/earthdata?lat=&lon=&date= ─────────────────────────────────────
app.get('/api/earthdata', async (req, res) => {
  const lat = Number(req.query.lat)
  const lon = Number(req.query.lon)
  const date = String(req.query.date || new Date().toISOString())

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return res.status(400).json({ error: 'lat & lon erforderlich' })
  }
  if (!EARTHDATA_TOKEN) {
    return res.status(503).json({ error: 'Kein EARTHDATA_TOKEN konfiguriert' })
  }

  try {
    const data = await fetchEarthdataCoverage(lat, lon, date)
    if (!data) return res.status(502).json({ error: 'Earthdata nicht erreichbar' })
    const ok = data.token_valid !== false
    console.log(`[earthdata] ${lat.toFixed(2)},${lon.toFixed(2)} → ${ok ? data.granule_count + ' Granules' : 'Token ungültig'}`)
    res.json(data)
  } catch (err) {
    console.error('Earthdata-Fehler:', err.message)
    res.status(502).json({ error: 'Earthdata-Abruf fehlgeschlagen' })
  }
})

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  earthdata: !!EARTHDATA_TOKEN,
  database: !!pool,
}))

// ─── Produktion (z. B. Render): Frontend-Build mit ausliefern ───────────────
// In Produktion liegen Frontend und API auf DERSELBEN Domain — dadurch
// funktioniert der relative Pfad /api/earthdata ohne Cross-Domain-Proxy.
// In der lokalen Entwicklung existiert /dist nicht → dieser Block ist inaktiv,
// dort liefert Vite das Frontend aus und proxyt /api zum Server.
const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  // SPA-Fallback: alle Nicht-API-Routen liefern index.html (Client-Routing).
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`GoTrip-Server läuft auf Port ${PORT}`)
  console.log(`Geteilte Reise-DB: ${pool ? '✓ verbunden (Mehrnutzer aktiv)' : '✗ keine DATABASE_URL (nur lokal pro Browser)'}`)
  console.log(`NASA Earthdata (CMR): ${EARTHDATA_TOKEN ? '✓ Token gesetzt' : '✗ kein Token (EARTHDATA_TOKEN)'}`)
  console.log(`Frontend-Build: ${fs.existsSync(distDir) ? '✓ wird aus /dist ausgeliefert' : '– (Dev: via Vite)'}`)
  console.log(`Übrige Daten (Copernicus, GBIF, NASA POWER) holt das Frontend direkt.`)
})
