export interface ItinerarySlot {
  id: string
  time: string       // "08:00"
  activity: string   // "Frühstück im lokalen Café"
  emoji: string
  type: 'meal' | 'activity'
  votedBy: string[]  // memberIds die 👍 gedrückt haben
}

export interface ItineraryDay {
  dayNumber: number  // 1, 2, 3...
  date: string       // "2026-07-01"
  slots: ItinerarySlot[]
}

export type TripItinerary = ItineraryDay[]
