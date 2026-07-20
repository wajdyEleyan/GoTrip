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
  inviteCode: string
  createdAt: string
  members: Member[]
}

export interface CreateTripFormData {
  name: string
  startDate: string
  endDate: string
}
