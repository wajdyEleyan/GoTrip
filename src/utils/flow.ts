// Autor: Mohamad Haj Ahmad
// Zentrale Definition des Planungs-Flows für die 3-Klick-Regel.
// Eine Quelle der Wahrheit für Reihenfolge, „nächster Schritt" und Smart-Next.
import {
  getTripAvailabilities, getTripPreferences, getTripVotes, getTripActivities,
} from '@/utils/storage'

export const PLAN_STEPS = [
  'members', 'availability', 'preferences', 'recommendation', 'vote', 'activities', 'final',
] as const
export type PlanStep = (typeof PLAN_STEPS)[number]

const STEP_LABEL_KEY: Record<PlanStep, string> = {
  members: 'stepMembers',
  availability: 'stepAvailability',
  preferences: 'stepPreferences',
  recommendation: 'stepRecommendation',
  vote: 'stepVote',
  activities: 'stepActivities',
  final: 'stepFinal',
}

export function stepLabelKey(step: PlanStep): string {
  return STEP_LABEL_KEY[step]
}

/** Pfad des nächsten Schritts; nach 'final' zurück zum Dashboard. */
export function nextStepPath(tripId: string, current: PlanStep): string {
  const i = PLAN_STEPS.indexOf(current)
  if (i < 0 || i >= PLAN_STEPS.length - 1) return `/trip/${tripId}/dashboard`
  return `/trip/${tripId}/${PLAN_STEPS[i + 1]}`
}

function isStepDone(tripId: string, step: PlanStep): boolean {
  switch (step) {
    case 'members': return true // Ersteller ist immer Mitglied
    case 'availability': return getTripAvailabilities(tripId).length > 0
    case 'preferences': return getTripPreferences(tripId).length > 0
    case 'recommendation': return getTripPreferences(tripId).length > 0 // View nach Präferenzen
    case 'vote': return getTripVotes(tripId).length > 0
    case 'activities': return getTripActivities(tripId).length > 0
    case 'final': return false
  }
}

/** Erster noch nicht erledigter Schritt (für die Smart-Next-Karte). */
export function firstIncompleteStep(tripId: string): PlanStep {
  for (const s of PLAN_STEPS) {
    if (!isStepDone(tripId, s)) return s
  }
  return 'final'
}
