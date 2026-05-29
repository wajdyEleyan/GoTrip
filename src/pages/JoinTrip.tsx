// Autor: Wajdy Eleyan
// src/pages/JoinTrip.tsx — /join/:code: Einladungslink beitreten
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTripContext } from '@/context/TripContext'
import { getTripByInviteCode } from '@/utils/storage'
import { useAuth } from '@/context/AuthContext'
import type { Member } from '@/types/trip'
import { Users } from 'lucide-react'

export default function JoinTrip() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { addMember, refreshTrips } = useTripContext()
  const { user } = useAuth()

  const trip = code ? getTripByInviteCode(code) : undefined

  const [memberName, setMemberName] = useState(user?.name ?? '')
  const [nameError, setNameError] = useState('')
  const [joined, setJoined] = useState(false)

  // Check if user is already a member (Scenario D — re-join edge case)
  const isAlreadyMember = trip?.members.some(
    (m) => m.id === user?.id || m.name.toLowerCase() === memberName.toLowerCase()
  )

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center gap-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
          <span className="text-2xl">❌</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Link ungültig</h1>
        <p className="text-gray-500 text-sm">
          Dieser Einladungslink ist abgelaufen oder ungültig.
        </p>
        <Button variant="outline" onClick={() => navigate('/home')}>
          Zur Startseite
        </Button>
      </div>
    )
  }

  if (joined || isAlreadyMember) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center gap-4">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-2">
          <span className="text-2xl">✅</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          {isAlreadyMember && !joined ? 'Du bist dabei!' : 'Willkommen!'}
        </h1>
        <p className="text-gray-500 text-sm">
          Du bist bereits Mitglied von <strong>{trip.name}</strong>.
        </p>
        <Button onClick={() => { refreshTrips(); navigate(`/trip/${trip.id}/members`) }}>
          <Users size={16} className="mr-2" />
          Mitgliederliste ansehen
        </Button>
      </div>
    )
  }

  function handleJoin() {
    const trimmed = memberName.trim()
    if (!trimmed) {
      setNameError('Bitte gib deinen Namen ein')
      return
    }

    const newMember: Member = {
      id: user?.id ?? crypto.randomUUID(),
      name: trimmed,
      role: 'member',
      joinedAt: new Date().toISOString(),
    }

    addMember(trip!.id, newMember)
    setJoined(true)
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      {/* Decorative header */}
      <div className="bg-gradient-to-b from-primary/10 to-white px-6 py-10 text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary/25">
          <span className="text-2xl">✈️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Du wurdest eingeladen!</h1>
        <p className="text-gray-500 text-sm">
          Tritt <strong className="text-gray-800">{trip.name}</strong> bei
        </p>
      </div>

      {/* Trip Info */}
      <div className="mx-4 mt-4 p-4 bg-muted rounded-xl text-sm text-gray-600">
        <p>📅 {trip.startDate} – {trip.endDate}</p>
        <p>👥 {trip.members.length} Mitglieder</p>
      </div>

      {/* Join Form */}
      <div className="px-4 py-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-name">Dein Name</Label>
          <Input
            id="join-name"
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
            <p id="join-name-error" className="text-xs text-red-500" role="alert">{nameError}</p>
          )}
        </div>

        <Button onClick={handleJoin} className="w-full">
          Beitreten
        </Button>
      </div>
    </div>
  )
}
