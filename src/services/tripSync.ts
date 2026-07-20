// Autor: Amal Najah und Wajdy Eleyan
// Synchronisiert Reisedaten zwischen localStorage und Server (Polling alle 6 s).
import type { Trip } from '@/types/trip'
import type { MemberAvailability } from '@/types/availability'
import type { MemberPreferences } from '@/types/preferences'
import type { Destination, DestinationVote } from '@/types/destination'
import type { Activity } from '@/types/activity'
import type { Expense } from '@/types/expense'
import type { TripItinerary } from '@/types/itinerary'

const K = {
  trips: 'gotrip_trips',
  avail: 'gotrip_availability',
  prefs: 'gotrip_preferences',
  dest: 'gotrip_destinations',
  votes: 'gotrip_dest_votes',
  acts: 'gotrip_activities',
  exps: 'gotrip_expenses',
}

function itinKey(tripId: string) { return `gotrip_itinerary_${tripId}` }

interface TripBundle {
  trip: Trip
  availabilities: MemberAvailability[]
  preferences: MemberPreferences[]
  destinations: Destination[]
  votes: DestinationVote[]
  activities: Activity[]
  expenses: Expense[]
  itinerary?: TripItinerary
}

function readArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]') as T[] } catch { return [] }
}
function writeArr(key: string, arr: unknown[]) {
  localStorage.setItem(key, JSON.stringify(arr))
}

let activeTripId: string | null = null
let activeCode: string | null = null

export function setActiveTrip(tripId: string | null, inviteCode?: string | null) {
  activeTripId = tripId
  activeCode = inviteCode ?? null
}

function collectBundle(tripId: string): TripBundle | null {
  const trip = readArr<Trip>(K.trips).find((t) => t.id === tripId)
  if (!trip) return null
  const destinations = readArr<Destination>(K.dest).filter((d) => d.tripId === tripId)
  const destIds = new Set(destinations.map((d) => d.id))
  const itin = localStorage.getItem(itinKey(tripId))
  return {
    trip,
    availabilities: readArr<MemberAvailability>(K.avail).filter((a) => a.tripId === tripId),
    preferences: readArr<MemberPreferences>(K.prefs).filter((p) => p.tripId === tripId),
    destinations,
    votes: readArr<DestinationVote>(K.votes).filter((v) => destIds.has(v.destinationId)),
    activities: readArr<Activity>(K.acts).filter((a) => a.tripId === tripId),
    expenses: readArr<Expense>(K.exps).filter((e) => e.tripId === tripId),
    itinerary: itin ? JSON.parse(itin) as TripItinerary : undefined,
  }
}

function notify(message: string, tile?: string) {
  window.dispatchEvent(new CustomEvent('gotrip-notification', { detail: { message, tile } }))
}

function fireNotifications(before: TripBundle | null, after: TripBundle): void {
  if (!before) return

  // 1. Neue Reiseziele
  const beforeDestIds = new Set(before.destinations.map(d => d.id))
  for (const dest of after.destinations) {
    if (!beforeDestIds.has(dest.id)) {
      notify(`${dest.proposedByName || 'Jemand'} hat „${dest.name}" vorgeschlagen`, 'recommendation')
    }
  }

  // 2. Neue Stimmen
  const beforeVoteKeys = new Set(before.votes.map(v => `${v.destinationId}-${v.memberId}`))
  for (const vote of after.votes) {
    if (!beforeVoteKeys.has(`${vote.destinationId}-${vote.memberId}`)) {
      const dest = after.destinations.find(d => d.id === vote.destinationId)
      notify(`${vote.memberName || 'Jemand'} hat für „${dest?.name || 'ein Ziel'}" abgestimmt`, 'vote')
    }
  }

  // 3. Neue Mitglieder
  const beforeMemberIds = new Set(before.trip.members.map(m => m.id))
  for (const member of after.trip.members) {
    if (!beforeMemberIds.has(member.id)) {
      notify(`${member.name} ist der Gruppe beigetreten`, 'members')
    }
  }

  // 4. Verfügbarkeit eingetragen / geändert
  const beforeAvailIds = new Set(before.availabilities.map(a => a.memberId))
  for (const avail of after.availabilities) {
    const beforeAvail = before.availabilities.find(a => a.memberId === avail.memberId)
    if (!beforeAvailIds.has(avail.memberId)) {
      notify(`${avail.memberName} hat seine Verfügbarkeit eingetragen`, 'availability')
    } else if (beforeAvail && JSON.stringify(beforeAvail.dates) !== JSON.stringify(avail.dates)) {
      notify(`${avail.memberName} hat seine Verfügbarkeit aktualisiert`, 'availability')
    }
  }

  // 5. Präferenzen / Budget gesetzt oder geändert
  const beforePrefIds = new Set(before.preferences.map(p => p.memberId))
  for (const pref of after.preferences) {
    const beforePref = before.preferences.find(p => p.memberId === pref.memberId)
    const member = after.trip.members.find(m => m.id === pref.memberId)
    const name = member?.name || 'Jemand'
    if (!beforePrefIds.has(pref.memberId)) {
      notify(`${name} hat Präferenzen & Budget gesetzt`, 'preferences')
    } else if (beforePref) {
      if (beforePref.budgetPerPerson !== pref.budgetPerPerson) {
        notify(`${name} hat Budget auf ${pref.budgetPerPerson} € geändert`, 'budget')
      }
      if (JSON.stringify(beforePref.interests) !== JSON.stringify(pref.interests)) {
        notify(`${name} hat Interessen aktualisiert`, 'preferences')
      }
    }
  }

  // 6. Neue Ausgaben
  const beforeExpIds = new Set(before.expenses.map(e => e.id))
  for (const exp of after.expenses) {
    if (!beforeExpIds.has(exp.id)) {
      notify(`${exp.paidByName} hat eine Ausgabe hinzugefügt: „${exp.description}" (${exp.amount} €)`, 'budget')
    }
  }
}

function applyBundle(bundle: TripBundle): boolean {
  if (!bundle?.trip) return false
  const tripId = bundle.trip.id
  const before = collectBundle(tripId)
  const beforeStr = JSON.stringify(before ?? {})

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
  if (bundle.itinerary) localStorage.setItem(itinKey(tripId), JSON.stringify(bundle.itinerary))

  const afterStr = JSON.stringify(collectBundle(tripId) ?? {})
  const changed = beforeStr !== afterStr
  if (changed) fireNotifications(before, bundle)
  return changed
}

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
