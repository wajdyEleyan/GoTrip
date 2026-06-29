// src/context/TripContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Trip, Member, CreateTripFormData } from '@/types/trip'
import {
  getTrips,
  saveTrip,
  updateTrip as persistUpdateTrip,
  deleteTrip as persistDeleteTrip,
  getTripById as storageFindById,
} from '@/utils/storage'
import { generateInviteCode } from '@/utils/linkGenerator'
import { generateUUID } from '@/utils/uuid'
import { pushNow } from '@/services/tripSync'
import { attachCodeToAccount } from '@/services/account'
import { useAuth } from './AuthContext'

const AVATAR_COLORS = [
  'bg-violet-400',
  'bg-blue-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-rose-400',
  'bg-cyan-400',
]

interface TripContextType {
  trips: Trip[]
  createTrip: (data: CreateTripFormData) => Trip
  updateTrip: (trip: Trip) => void
  deleteTrip: (id: string) => void
  getTripById: (id: string) => Trip | undefined
  addMember: (tripId: string, member: Member) => void
  refreshTrips: () => void
}

const TripContext = createContext<TripContextType | null>(null)

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([])
  const { user } = useAuth()

  useEffect(() => {
    setTrips(getTrips())
  }, [])

  function refreshTrips() {
    setTrips(getTrips())
  }

  function createTrip(data: CreateTripFormData): Trip {
    const adminMember: Member = {
      id: user?.id ?? generateUUID(),
      name: user?.name ?? 'Admin',
      role: 'admin',
      joinedAt: new Date().toISOString(),
      avatarColor: AVATAR_COLORS[0],
    }

    const trip: Trip = {
      id: generateUUID(),
      ...data,
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
      members: [adminMember],
    }

    saveTrip(trip)
    setTrips((prev) => [...prev, trip])
    // Reise sofort in die geteilte DB schieben, damit Freunde beitreten können.
    void pushNow(trip.id, trip.inviteCode)
    // Reise dem Konto zuordnen → erscheint nach Login auf jedem Gerät.
    if (user) void attachCodeToAccount(user.name, trip.inviteCode)
    return trip
  }

  function updateTrip(updated: Trip) {
    persistUpdateTrip(updated)
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  function deleteTrip(id: string) {
    persistDeleteTrip(id)
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  function getTripById(id: string): Trip | undefined {
    return storageFindById(id)
  }

  function addMember(tripId: string, member: Member) {
    const trip = storageFindById(tripId)
    if (!trip) return

    const colorIndex = trip.members.length % AVATAR_COLORS.length
    const newMember: Member = { ...member, avatarColor: AVATAR_COLORS[colorIndex] }
    const updated: Trip = { ...trip, members: [...trip.members, newMember] }

    persistUpdateTrip(updated)
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)))
    // Neues Mitglied sofort in die geteilte DB schieben.
    void pushNow(updated.id, updated.inviteCode)
  }

  return (
    <TripContext.Provider value={{ trips, createTrip, updateTrip, deleteTrip, getTripById, addMember, refreshTrips }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTripContext() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTripContext must be used within TripProvider')
  return ctx
}
