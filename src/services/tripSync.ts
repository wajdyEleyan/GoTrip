// src/services/tripSync.ts
// Synchronisiert eine Reise zwischen localStorage (lokaler Cache) und dem
// Server (geteilte DB), damit alle Gruppenmitglieder dieselbe Reise sehen.
//
// Ablauf:
//   • pull(code)  → holt das Reise-Bündel vom Server in den localStorage
//   • scheduleSync() → schiebt lokale Änderungen (debounced) zum Server
//   • Polling     → holt regelmäßig Updates anderer Mitglieder
// Ohne erreichbaren Server bleibt alles lokal (App funktioniert trotzdem).
import type { Trip } from '@/types/trip'
import type { MemberAvailability } from '@/types/availability'
import type { MemberPreferences } from '@/types/preferences'
import type { Destination, DestinationVote } from '@/types/destination'
import type { Activity } from '@/types/activity'
import type { Expense } from '@/types/expense'

const K = {
  trips: 'gotrip_trips',
  avail: 'gotrip_availability',
  prefs: 'gotrip_preferences',
  dest: 'gotrip_destinations',
  votes: 'gotrip_dest_votes',
  acts: 'gotrip_activities',
  exps: 'gotrip_expenses',
}

interface TripBundle {
  trip: Trip
  availabilities: MemberAvailability[]
  preferences: MemberPreferences[]
  destinations: Destination[]
  votes: DestinationVote[]
  activities: Activity[]
  expenses: Expense[]
}

function readArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') as T[] } catch { return [] }
}
function writeArr(key: string, arr: unknown[]) {
  localStorage.setItem(key, JSON.stringify(arr))
}

// ── aktive Reise (die gerade geöffnete) ──────────────────────────────────────
let activeTripId: string | null = null
let activeCode: string | null = null

export function setActiveTrip(tripId: string | null, inviteCode?: string | null) {
  activeTripId = tripId
  activeCode = inviteCode ?? null
}

// ── Bündel aus localStorage einsammeln ───────────────────────────────────────
function collectBundle(tripId: string): TripBundle | null {
  const trip = readArr<Trip>(K.trips).find((t) => t.id === tripId)
  if (!trip) return null
  const destinations = readArr<Destination>(K.dest).filter((d) => d.tripId === tripId)
  const destIds = new Set(destinations.map((d) => d.id))
  return {
    trip,
    availabilities: readArr<MemberAvailability>(K.avail).filter((a) => a.tripId === tripId),
    preferences: readArr<MemberPreferences>(K.prefs).filter((p) => p.tripId === tripId),
    destinations,
    votes: readArr<DestinationVote>(K.votes).filter((v) => destIds.has(v.destinationId)),
    activities: readArr<Activity>(K.acts).filter((a) => a.tripId === tripId),
    expenses: readArr<Expense>(K.exps).filter((e) => e.tripId === tripId),
  }
}

// ── Bündel in localStorage anwenden (andere Reisen bleiben erhalten) ─────────
function applyBundle(bundle: TripBundle): boolean {
  if (!bundle?.trip) return false
  const tripId = bundle.trip.id
  const before = JSON.stringify(collectBundle(tripId) ?? {})

  const trips = readArr<Trip>(K.trips).filter((t) => t.id !== tripId)
  trips.push(bundle.trip)
  writeArr(K.trips, trips)

  writeArr(K.avail, [...readArr<MemberAvailability>(K.avail).filter((a) => a.tripId !== tripId), ...(bundle.availabilities || [])])
  writeArr(K.prefs, [...readArr<MemberPreferences>(K.prefs).filter((p) => p.tripId !== tripId), ...(bundle.preferences || [])])
  writeArr(K.dest, [...readArr<Destination>(K.dest).filter((d) => d.tripId !== tripId), ...(bundle.destinations || [])])

  const newDestIds = new Set((bundle.destinations || []).map((d) => d.id))
  writeArr(K.votes, [...readArr<DestinationVote>(K.votes).filter((v) => !newDestIds.has(v.destinationId)), ...(bundle.votes || [])])
  writeArr(K.acts, [...readArr<Activity>(K.acts).filter((a) => a.tripId !== tripId), ...(bundle.activities || [])])
  writeArr(K.exps, [...readArr<Expense>(K.exps).filter((e) => e.tripId !== tripId), ...(bundle.expenses || [])])

  const after = JSON.stringify(collectBundle(tripId) ?? {})
  return before !== after // true, wenn sich etwas geändert hat
}

// ── Server-Kommunikation ─────────────────────────────────────────────────────
/** Holt eine Reise per inviteCode vom Server. Gibt das Bündel oder null zurück. */
export async function pullTrip(inviteCode: string): Promise<TripBundle | null> {
  try {
    const resp = await fetch(`/api/trips/${encodeURIComponent(inviteCode)}`, { signal: AbortSignal.timeout(10000) })
    if (resp.status === 404) return null
    if (!resp.ok) return null
    const bundle = (await resp.json()) as TripBundle
    const changed = applyBundle(bundle)
    if (changed) window.dispatchEvent(new Event('gotrip-sync'))
    return bundle
  } catch {
    return null // Server nicht erreichbar → lokal weiterarbeiten
  }
}

async function pushBundle(tripId: string, code: string): Promise<void> {
  const bundle = collectBundle(tripId)
  if (!bundle) return
  try {
    await fetch(`/api/trips/${encodeURIComponent(code)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bundle),
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    /* offline → bleibt lokal, nächster Sync versucht es erneut */
  }
}

// ── Debounced Push (von storage.ts nach jeder Änderung aufgerufen) ───────────
let pushTimer: ReturnType<typeof setTimeout> | undefined
export function scheduleSync(): void {
  if (!activeTripId || !activeCode) return
  const tripId = activeTripId, code = activeCode
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => { void pushBundle(tripId, code) }, 800)
}

/** Sofortiger Push (z. B. direkt nach dem Erstellen einer Reise). */
export async function pushNow(tripId: string, code: string): Promise<void> {
  setActiveTrip(tripId, code)
  await pushBundle(tripId, code)
}

// ── Polling (holt Updates anderer Mitglieder) ────────────────────────────────
let pollTimer: ReturnType<typeof setInterval> | undefined
export function startPolling(intervalMs = 6000): void {
  stopPolling()
  pollTimer = setInterval(() => {
    if (activeCode) void pullTrip(activeCode)
  }, intervalMs)
}
export function stopPolling(): void {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = undefined
}
