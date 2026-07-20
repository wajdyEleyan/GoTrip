// Autor: Mohamad Haj Ahmad und Wajdy Eleyan
// NON-NEGOTIABLE: Hybrid-Score-Formel aus constitution.md

/**
 * Calculates the hybrid ranking score.
 * @param llmScore  0–100 (from LLM analysis)
 * @param starsAvg  0–5  (average of member star ratings)
 * @returns         0–1  (displayed as %)
 */
export function calcHybridScore(llmScore: number, starsAvg: number): number {
  return (llmScore / 100) * 0.4 + (starsAvg / 5) * 0.6
}

export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`
}

export function scoreToLabel(score: number): string {
  if (score >= 0.85) return 'Ausgezeichnet'
  if (score >= 0.7) return 'Sehr gut'
  if (score >= 0.55) return 'Gut'
  if (score >= 0.4) return 'Ok'
  return 'Niedrig'
}
