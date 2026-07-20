// Autor: Amal Najah

export interface Activity {
  id: string
  tripId: string
  destinationId?: string
  name: string
  addedBy: string            // memberId
  addedByName: string
  createdAt: string
  voteCount: number
  votedBy: string[]          // memberIds who voted
}
