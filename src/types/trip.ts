// Autor: Mohamad Haj Ahmad
// src/types/trip.ts

export interface Member {
  id: string
  name: string
  role: 'admin' | 'member'
  joinedAt: string
  avatarColor?: string
}

export interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
  budgetMin: number
  budgetMax: number
  groupSize: number
  inviteCode: string
  createdAt: string
  members: Member[]
}

export interface CreateTripFormData {
  name: string
  startDate: string
  endDate: string
  budgetMin: number
  budgetMax: number
  groupSize: number
}
