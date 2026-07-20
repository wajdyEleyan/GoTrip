// Autor: Mohamad Haj Ahmad und Wajdy Eleyan
// Server-Proxy für NASA Earthdata. Earthdata-Token bleibt serverseitig — alle anderen APIs ruft das Frontend direkt auf.
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}
function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const test = crypto.scryptSync(password, salt, 64).toString('hex')
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(test, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
require('dotenv').config({ path: path.join(__dirname, '.env') })
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001
const EARTHDATA_TOKEN = process.env.EARTHDATA_TOKEN

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173']
}))
app.use(express.json({ limit: '2mb' }))

const mem = { trips: new Map(), users: new Map() }

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

  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      username      TEXT PRIMARY KEY,
      password_hash TEXT,
      codes         JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `).then(() => pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT'))
    .then(() => console.log('DB: Tabelle "users" bereit'))
    .catch((e) => console.error('DB-Init-Fehler (users):', e.message))
}

function mergeArray(existing = [], incoming = [], keyFn) {
  const map = new Map()
  for (const it of existing) map.set(keyFn(it), it)
  for (const it of incoming) map.set(keyFn(it), it)
  return [...map.values()]
}

function mergeTrip(existing, incoming) {
  if (!existing) return incoming
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
  if (!pool) {
    const data = mem.trips.get(req.params.code)
    if (!data) return res.status(404).json({ error: 'Reise nicht gefunden' })
    return res.json(data)
  }
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
  const incoming = req.body
  if (!incoming || typeof incoming !== 'object') return res.status(400).json({ error: 'Ungültige Daten' })
  if (!pool) {
    const existing = mem.trips.get(req.params.code)
    const merged = mergeTrip(existing, incoming)
    mem.trips.set(req.params.code, merged)
    return res.json(merged)
  }
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

app.post('/api/signin', async (req, res) => {
  if (!pool) {
    const username = String(req.body?.username || '').trim()
    const password = String(req.body?.password || '')
    if (!username || !password) return res.status(400).json({ error: 'Username & Passwort erforderlich' })
    const user = mem.users.get(username)
    if (!user) return res.status(404).json({ error: 'notfound' })
    if (user.password_hash && !verifyPassword(password, user.password_hash))
      return res.status(401).json({ error: 'wrongpass' })
    if (!user.password_hash) { user.password_hash = hashPassword(password) }
    return res.json({ username, codes: user.codes ?? [] })
  }
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  if (!username || !password) return res.status(400).json({ error: 'Username & Passwort erforderlich' })
  try {
    const { rows } = await pool.query('SELECT password_hash, codes FROM users WHERE username = $1', [username])
    if (!rows.length) return res.status(404).json({ error: 'notfound' })

    const stored = rows[0].password_hash
    if (!stored) {
      // Alt-Konto ohne Passwort (vor dieser Funktion angelegt) → jetzt Passwort setzen.
      await pool.query('UPDATE users SET password_hash = $2 WHERE username = $1', [username, hashPassword(password)])
    } else if (!verifyPassword(password, stored)) {
      return res.status(401).json({ error: 'wrongpass' })
    }
    res.json({ username, codes: rows[0].codes ?? [] })
  } catch (e) {
    console.error('DB signin-Fehler:', e.message)
    res.status(500).json({ error: 'DB-Fehler' })
  }
})

app.post('/api/register', async (req, res) => {
  if (!pool) {
    const username = String(req.body?.username || '').trim()
    const password = String(req.body?.password || '')
    const code = String(req.body?.code || '').trim()
    if (!username || !password) return res.status(400).json({ error: 'Username & Passwort erforderlich' })
    if (code && !mem.trips.has(code)) return res.status(404).json({ error: 'badcode' })
    if (mem.users.has(username)) return res.status(409).json({ error: 'taken' })
    const codes = code ? [code] : []
    mem.users.set(username, { password_hash: hashPassword(password), codes })
    return res.json({ username, codes })
  }
  const username = String(req.body?.username || '').trim()
  const password = String(req.body?.password || '')
  const code = String(req.body?.code || '').trim()
  if (!username || !password) return res.status(400).json({ error: 'Username & Passwort erforderlich' })
  try {
    if (code) {
      const t = await pool.query('SELECT 1 FROM trips WHERE invite_code = $1', [code])
      if (!t.rows.length) return res.status(404).json({ error: 'badcode' })
    }
    const ins = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
      [username, hashPassword(password)],
    )
    if (ins.rowCount === 0) return res.status(409).json({ error: 'taken' })
    if (code) {
      await pool.query(
        `UPDATE users SET codes = (
           SELECT jsonb_agg(DISTINCT e) FROM jsonb_array_elements_text(codes || to_jsonb($2::text)) e
         ) WHERE username = $1`,
        [username, code],
      )
    }
    const { rows } = await pool.query('SELECT codes FROM users WHERE username = $1', [username])
    res.json({ username, codes: rows[0]?.codes ?? [] })
  } catch (e) {
    console.error('DB register-Fehler:', e.message)
    res.status(500).json({ error: 'DB-Fehler' })
  }
})

// POST /api/users/:username/codes {code} → Reise (inviteCode) dem Konto zuordnen.
app.post('/api/users/:username/codes', async (req, res) => {
  if (!pool) {
    const username = String(req.params.username || '').trim()
    const code = String(req.body?.code || '').trim()
    if (!username || !code) return res.status(400).json({ error: 'username & code erforderlich' })
    const user = mem.users.get(username) ?? { codes: [] }
    if (!user.codes.includes(code)) user.codes.push(code)
    mem.users.set(username, user)
    return res.json({ ok: true })
  }
  const username = String(req.params.username || '').trim()
  const code = String(req.body?.code || '').trim()
  if (!username || !code) return res.status(400).json({ error: 'username & code erforderlich' })
  try {
    await pool.query('INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO NOTHING', [username])
    await pool.query(
      `UPDATE users SET codes = (
         SELECT jsonb_agg(DISTINCT e) FROM jsonb_array_elements_text(codes || to_jsonb($2::text)) e
       ) WHERE username = $1`,
      [username, code],
    )
    res.json({ ok: true })
  } catch (e) {
    console.error('DB codes-Fehler:', e.message)
    res.status(500).json({ error: 'DB-Fehler' })
  }
})

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
  database: pool ? 'postgres' : 'memory',
  trips: mem.trips.size,
}))

const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`GoTrip-Server läuft auf Port ${PORT}`)
  console.log(`Geteilte Reise-DB: ${pool ? '✓ verbunden (Mehrnutzer aktiv)' : '✗ keine DATABASE_URL (nur lokal pro Browser)'}`)
  console.log(`NASA Earthdata (CMR): ${EARTHDATA_TOKEN ? '✓ Token gesetzt' : '✗ kein Token (EARTHDATA_TOKEN)'}`)
  console.log(`Frontend-Build: ${fs.existsSync(distDir) ? '✓ wird aus /dist ausgeliefert' : '– (Dev: via Vite)'}`)
  console.log(`Übrige Daten (Copernicus, GBIF, NASA POWER) holt das Frontend direkt.`)
})
