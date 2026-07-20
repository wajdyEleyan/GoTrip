// Autor: Mohamad Haj Ahmad, Eya Mathlouthi und Wajdy Eleyan
import type { Trip } from '@/types/trip'
import type { MemberAvailability } from '@/types/availability'
import type { MemberPreferences } from '@/types/preferences'
import type { Destination, DestinationVote } from '@/types/destination'
import type { Activity } from '@/types/activity'
import type { Expense } from '@/types/expense'
import type { TripItinerary, ItinerarySlot } from '@/types/itinerary'
import { scheduleSync } from '@/services/tripSync'

const TRIPS_KEY = 'gotrip_trips'
const AUTH_KEY = 'gotrip_auth'

export function saveTrip(trip: Trip): void {
  const trips = getTrips()
  trips.push(trip)
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips))
  scheduleSync()
}

export function getTrips(): Trip[] {
  const raw = localStorage.getItem(TRIPS_KEY)
  return raw ? (JSON.parse(raw) as Trip[]) : []
}

export function getTripByInviteCode(code: string): Trip | undefined {
  return getTrips().find((t) => t.inviteCode === code)
}

export function getTripById(id: string): Trip | undefined {
  return getTrips().find((t) => t.id === id)
}

export function updateTrip(updated: Trip): void {
  const trips = getTrips().map((t) => (t.id === updated.id ? updated : t))
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips))
  scheduleSync()
}

export function deleteTrip(id: string): void {
  const trips = getTrips().filter((t) => t.id !== id)
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips))
  scheduleSync()
}

// Auth helpers
export interface StoredAuth {
  id: string
  name: string
}

export function saveAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
}

export function getAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_KEY)
  return raw ? (JSON.parse(raw) as StoredAuth) : null
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
}


const AVAIL_KEY = 'gotrip_availability'

function getAllAvailabilities(): MemberAvailability[] {
  const raw = localStorage.getItem(AVAIL_KEY)
  return raw ? (JSON.parse(raw) as MemberAvailability[]) : []
}

export function saveMemberAvailability(data: MemberAvailability): void {
  const all = getAllAvailabilities().filter(
    (a) => !(a.memberId === data.memberId && a.tripId === data.tripId)
  )
  all.push(data)
  localStorage.setItem(AVAIL_KEY, JSON.stringify(all))
  scheduleSync()
}

export function getTripAvailabilities(tripId: string): MemberAvailability[] {
  return getAllAvailabilities().filter((a) => a.tripId === tripId)
}

export function getMemberAvailability(tripId: string, memberId: string): MemberAvailability | undefined {
  return getAllAvailabilities().find((a) => a.tripId === tripId && a.memberId === memberId)
}


const PREFS_KEY = 'gotrip_preferences'

function getAllPreferences(): MemberPreferences[] {
  const raw = localStorage.getItem(PREFS_KEY)
  return raw ? (JSON.parse(raw) as MemberPreferences[]) : []
}

export function saveMemberPreferences(prefs: MemberPreferences): void {
  const all = getAllPreferences().filter(
    (p) => !(p.memberId === prefs.memberId && p.tripId === prefs.tripId)
  )
  all.push(prefs)
  localStorage.setItem(PREFS_KEY, JSON.stringify(all))
  scheduleSync()
}

export function getTripPreferences(tripId: string): MemberPreferences[] {
  return getAllPreferences().filter((p) => p.tripId === tripId)
}

export function getMemberPreferences(tripId: string, memberId: string): MemberPreferences | undefined {
  return getAllPreferences().find((p) => p.tripId === tripId && p.memberId === memberId)
}


const DEST_KEY = 'gotrip_destinations'

export function getTripDestinations(tripId: string): Destination[] {
  const raw = localStorage.getItem(DEST_KEY)
  const all: Destination[] = raw ? JSON.parse(raw) : []
  return all.filter((d) => d.tripId === tripId)
}

export function saveDestination(dest: Destination): void {
  const raw = localStorage.getItem(DEST_KEY)
  const all: Destination[] = raw ? JSON.parse(raw) : []
  const idx = all.findIndex((d) => d.id === dest.id)
  if (idx >= 0) all[idx] = dest
  else all.push(dest)
  localStorage.setItem(DEST_KEY, JSON.stringify(all))
  scheduleSync()
}


const VOTES_KEY = 'gotrip_dest_votes'

export function getTripVotes(tripId: string): DestinationVote[] {
  const raw = localStorage.getItem(VOTES_KEY)
  const all: DestinationVote[] = raw ? JSON.parse(raw) : []
  const destIds = new Set(getTripDestinations(tripId).map((d) => d.id))
  return all.filter((v) => destIds.has(v.destinationId))
}

export function saveVote(vote: DestinationVote): void {
  const raw = localStorage.getItem(VOTES_KEY)
  const all: DestinationVote[] = raw ? JSON.parse(raw) : []
  const idx = all.findIndex((v) => v.destinationId === vote.destinationId && v.memberId === vote.memberId)
  if (idx >= 0) all[idx] = vote
  else all.push(vote)
  localStorage.setItem(VOTES_KEY, JSON.stringify(all))
  scheduleSync()
}

export function getMemberVote(destinationId: string, memberId: string): DestinationVote | undefined {
  const raw = localStorage.getItem(VOTES_KEY)
  const all: DestinationVote[] = raw ? JSON.parse(raw) : []
  return all.find((v) => v.destinationId === destinationId && v.memberId === memberId)
}


const ACT_KEY = 'gotrip_activities'

export function getTripActivities(tripId: string): Activity[] {
  const raw = localStorage.getItem(ACT_KEY)
  const all: Activity[] = raw ? JSON.parse(raw) : []
  return all.filter((a) => a.tripId === tripId)
}

export function saveActivity(act: Activity): void {
  const raw = localStorage.getItem(ACT_KEY)
  const all: Activity[] = raw ? JSON.parse(raw) : []
  const idx = all.findIndex((a) => a.id === act.id)
  if (idx >= 0) all[idx] = act
  else all.push(act)
  localStorage.setItem(ACT_KEY, JSON.stringify(all))
  scheduleSync()
}


const EXP_KEY = 'gotrip_expenses'

export function getTripExpenses(tripId: string): Expense[] {
  const raw = localStorage.getItem(EXP_KEY)
  const all: Expense[] = raw ? JSON.parse(raw) : []
  return all.filter((e) => e.tripId === tripId)
}

export function saveExpense(exp: Expense): void {
  const raw = localStorage.getItem(EXP_KEY)
  const all: Expense[] = raw ? JSON.parse(raw) : []
  const idx = all.findIndex((e) => e.id === exp.id)
  if (idx >= 0) all[idx] = exp
  else all.push(exp)
  localStorage.setItem(EXP_KEY, JSON.stringify(all))
  scheduleSync()
}

export function deleteExpense(expId: string): void {
  const raw = localStorage.getItem(EXP_KEY)
  const all: Expense[] = raw ? JSON.parse(raw) : []
  localStorage.setItem(EXP_KEY, JSON.stringify(all.filter((e) => e.id !== expId)))
  scheduleSync()
}

export function getLastVisit(tripId: string, tile: string): string | null {
  return localStorage.getItem(`gotrip_visit_${tripId}_${tile}`)
}

export function markVisited(tripId: string, tile: string): void {
  localStorage.setItem(`gotrip_visit_${tripId}_${tile}`, new Date().toISOString())
}

export function getVisitCount(tripId: string, tile: string): number {
  const raw = localStorage.getItem(`gotrip_count_${tripId}_${tile}`)
  if (raw === null) return -1
  const n = parseInt(raw, 10)
  return isNaN(n) ? -1 : n
}

export function saveVisitCount(tripId: string, tile: string, count: number): void {
  localStorage.setItem(`gotrip_count_${tripId}_${tile}`, String(count))
}

function itineraryKey(tripId: string) { return `gotrip_itinerary_${tripId}` }
function itineraryDestKey(tripId: string) { return `gotrip_itinerary_dest_${tripId}` }

export function getItinerary(tripId: string): TripItinerary | null {
  const raw = localStorage.getItem(itineraryKey(tripId))
  return raw ? JSON.parse(raw) : null
}

export function getItineraryDestination(tripId: string): string | null {
  return localStorage.getItem(itineraryDestKey(tripId))
}

export function saveItinerary(tripId: string, plan: TripItinerary, destination?: string): void {
  localStorage.setItem(itineraryKey(tripId), JSON.stringify(plan))
  if (destination) localStorage.setItem(itineraryDestKey(tripId), destination)
  scheduleSync()
}

export function updateItinerarySlot(tripId: string, dayNumber: number, slot: ItinerarySlot): void {
  const plan = getItinerary(tripId)
  if (!plan) return
  const day = plan.find(d => d.dayNumber === dayNumber)
  if (!day) return
  const idx = day.slots.findIndex(s => s.id === slot.id)
  if (idx >= 0) day.slots[idx] = slot
  saveItinerary(tripId, plan)
}
