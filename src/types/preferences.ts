// Autor: Eya Mathlouthi
// src/types/preferences.ts

export type InterestType =
  | 'beach'
  | 'city'
  | 'nature'
  | 'adventure'
  | 'culture'
  | 'nightlife'
  | 'relaxation'
  | 'food'
  | 'shopping'

export interface MemberPreferences {
  memberId: string
  tripId: string
  budgetPerPerson: number
  interests: InterestType[]
  preferredStartDate?: string
  preferredEndDate?: string
}
