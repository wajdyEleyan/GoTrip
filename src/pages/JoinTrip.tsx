// Autor: Wajdy Eleyan
// src/pages/JoinTrip.tsx — /join/:code: Einladungslink beitreten
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTripContext } from '@/context/TripContext'
import { getTripByInviteCode } from '@/utils/storage'
import { pullTrip, setActiveTrip } from '@/services/tripSync'
import { joinTripByCode } from '@/services/joinTrip'
import { useAuth } from '@/context/AuthContext'
import type { Trip, Member } from '@/types/trip'
import { Users, Plane, CheckCircle2, XCircle, Loader2, Calendar } from 'lucide-react'
import { ambientImage } from '@/utils/destinationImage'

export default function JoinTrip() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { addMember, refreshTrips } = useTripContext()
  const { user } = useAuth()

  const [trip, setTrip] = useState<Trip | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [memberName, setMemberName] = useState(user?.name ?? '')
  const [nameError, setNameError] = useState('')
  const [joined, setJoined] = useState(false)

  // Reise zuerst aus der geteilten DB holen (Freund hat sie nicht lokal),
  // dann aus dem (nun aktualisierten) localStorage lesen.
  useEffect(() => {
    let active = true
    async function load() {
      if (!code) { setLoading(false); return }
      await pullTrip(code)
      if (!active) return
      const found = getTripByInviteCode(code)
      if (found) setActiveTrip(found.id, code)
      setTrip(found)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [code])

  // Check if user is already a member (Scenario D — re-join edge case)
  const isAlreadyMember = trip?.members.some(
    (m) => m.id === user?.id || m.name.toLowerCase() === memberName.toLowerCase()
  )

  if (loading) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center gap-3">
        <Loader2 size={28} className="text-primary animate-spin" />
        <p className="text-gray-500 text-sm">Reise wird geladen…</p>
      </div>
    )
  }

  if (!trip) {
    return (
      <div
        className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center gap-4"
      >
        <div className="glass-card w-full max-w-sm flex flex-col items-center gap-4 py-10 px-6">
          <div className="w-16 h-16 bg-[var(--color-danger)]/10 rounded-full flex items-center justify-center">
            <XCircle size={32} className="text-[var(--color-danger)]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Link ungültig</h1>
          <p className="text-gray-500 text-sm">
            Dieser Einladungslink ist abgelaufen oder ungültig.
          </p>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary-soft"
            onClick={() => navigate('/home')}
          >
            Zur Startseite
          </Button>
        </div>
      </div>
    )
  }

  if (joined || isAlreadyMember) {
    return (
      <div
        className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center gap-4"
        style={{ ['--ambient' as any]: ambientImage(trip?.name ?? '') }}
      >
        <div className="glass-card w-full max-w-sm flex flex-col items-center gap-4 py-10 px-6">
          <div className="w-16 h-16 bg-[var(--color-success)]/10 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} className="text-[var(--color-success)]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {isAlreadyMember && !joined ? 'Du bist dabei!' : 'Willkommen!'}
          </h1>
          <p className="text-gray-500 text-sm">
            Du bist bereits Mitglied von <strong className="text-gray-800">{trip.name}</strong>.
          </p>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={() => { refreshTrips(); navigate(`/trip/${trip.id}/members`) }}
          >
            <Users size={16} className="mr-2" />
            Mitgliederliste ansehen
          </Button>
        </div>
      </div>
    )
  }

  async function handleJoin() {
    const trimmed = memberName.trim()
    if (!trimmed) {
      setNameError('Bitte gib deinen Namen ein')
      return
    }

    if (user && code) {
      // Eingeloggt → gemeinsame Beitritts-Logik (Mitglied + Konto-Zuordnung).
      const res = await joinTripByCode(code, user)
      if (!res.ok) { setNameError('Einladungscode ungültig.'); return }
      refreshTrips()
      setJoined(true)
      return
    }

    // Nicht eingeloggt → lokal beitreten (kein Konto).
    const newMember: Member = {
      id: crypto.randomUUID(),
      name: trimmed,
      role: 'member',
      joinedAt: new Date().toISOString(),
    }
    addMember(trip!.id, newMember)
    setJoined(true)
  }

  return (
    <div
      className="app-shell flex flex-col items-center justify-center min-h-svh px-4 py-10 gap-4"
      style={{ ['--ambient' as any]: ambientImage(trip?.name ?? '') }}
    >
      <div className="glass-card w-full max-w-sm flex flex-col gap-0 overflow-hidden">
        {/* Decorative header */}
        <div className="flex flex-col items-center gap-3 px-6 py-8 bg-primary/5 border-b border-primary/10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-md shadow-primary/25">
            <Plane size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Du wurdest eingeladen!</h1>
          <p className="text-gray-500 text-sm">
            Tritt <strong className="text-gray-800">{trip.name}</strong> bei
          </p>
        </div>

        {/* Trip Info */}
        <div className="mx-4 mt-4 p-4 rounded-xl bg-primary-soft text-sm text-gray-600 flex flex-col gap-1">
          <p className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            {trip.startDate} – {trip.endDate}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-primary font-medium">
              <Users size={14} className="inline" />
            </span>
            {trip.members.length} Mitglieder
          </p>
        </div>

        {/* Join Form */}
        <div className="px-4 py-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="join-name">Dein Name</Label>
            <Input
              id="join-name"
              className="glass-field"
              placeholder="z.B. Max"
              value={memberName}
              onChange={(e) => {
                setMemberName(e.target.value)
                setNameError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus
              aria-describedby={nameError ? 'join-name-error' : undefined}
            />
            {nameError && (
              <p id="join-name-error" className="text-xs text-[var(--color-danger)]" role="alert">{nameError}</p>
            )}
          </div>

          <Button
            onClick={handleJoin}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
          >
            Beitreten
          </Button>
        </div>
      </div>
    </div>
  )
}
