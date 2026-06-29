// Autor: Mohamad Haj Ahmad
// src/utils/linkGenerator.ts
// Generates a 6-character alphanumeric invite code (ambiguous chars excluded)
import type { Trip } from '@/types/trip'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

export function generateInviteCode(): string {
  return Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

// Reisedaten werden base64-kodiert in den Link eingebettet (kein Server nötig).
export function buildInviteLink(code: string, trip?: Trip): string {
  const base = `${window.location.origin}/join/${code}`
  if (!trip) return base
  try {
    const bytes = new TextEncoder().encode(JSON.stringify(trip))
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
    return `${base}?d=${encodeURIComponent(btoa(binary))}`
  } catch {
    return base
  }
}
