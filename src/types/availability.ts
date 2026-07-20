// Autor: Wajdy Eleyan

export type AvailabilityStatus = 'available' | 'maybe' | 'not-available'

export interface MemberAvailability {
  memberId: string
  memberName: string
  tripId: string
  // Key: ISO-date "2026-07-10" → status
  dates: Record<string, AvailabilityStatus>
}

// Per-date summary used for heatmap rendering
export interface DateSummary {
  date: string
  availableCount: number
  maybeCount: number
  notCount: number
  totalMembers: number
}
