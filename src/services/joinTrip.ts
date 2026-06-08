// src/services/joinTrip.ts
// Eine einzige, wiederverwendbare Beitritts-Logik für: Registrieren+Code,
// „Code eingeben" in der App und die /join/:code-Seite.
// Ablauf: Reise vom Server holen → Mitglied hinzufügen (lokal + Push) →
// Code ans Konto hängen → UI über `gotrip-sync` informieren.
import { pullTrip, pushNow } from './tripSync'
import { attachCodeToAccount } from './account'
import { getTripByInviteCode, updateTrip } from '@/utils/storage'
import type { StoredAuth } from '@/utils/storage'
import type { Member } from '@/types/trip'

const AVATAR_COLORS = [
  'bg-violet-400', 'bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-cyan-400',
]

export type JoinResult =
  | { ok: true; tripId: string }
  | { ok: false; error: 'empty' | 'badcode' }

/** Tritt einer Reise per Einladungscode bei (idempotent — kein Doppel-Beitritt). */
export async function joinTripByCode(code: string, user: StoredAuth): Promise<JoinResult> {
  const c = code.trim()
  if (!c) return { ok: false, error: 'empty' }

  // Reise aus der geteilten DB in den lokalen Cache holen.
  await pullTrip(c)
  const trip = getTripByInviteCode(c)
  if (!trip) return { ok: false, error: 'badcode' }

  const already = trip.members.some(
    (m) => m.id === user.id || m.name.toLowerCase() === user.name.toLowerCase(),
  )
  if (!already) {
    const member: Member = {
      id: user.id,
      name: user.name,
      role: 'member',
      joinedAt: new Date().toISOString(),
      avatarColor: AVATAR_COLORS[trip.members.length % AVATAR_COLORS.length],
    }
    const updated = { ...trip, members: [...trip.members, member] }
    updateTrip(updated)              // lokal speichern (+ scheduleSync)
    await pushNow(updated.id, updated.inviteCode) // sofort in die geteilte DB
  }

  // Reise dem Konto zuordnen → erscheint nach Login auf jedem Gerät.
  await attachCodeToAccount(user.name, c)
  window.dispatchEvent(new Event('gotrip-sync'))
  return { ok: true, tripId: trip.id }
}
