// Autor: Mohamad Haj Ahmad
// Generates a 6-character alphanumeric invite code (ambiguous chars excluded)
import type { Trip } from '@/types/trip'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

// Lokaler Server (Express) — alle im gleichen WLAN können beitreten
const RENDER_URL = 'http://172.16.200.90:3001'

export function generateInviteCode(): string {
  return Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

function getInviteOrigin(): string {
  const origin = window.location.origin
  // Lokal (localhost oder LAN-IP) → Render-URL verwenden, damit Freunde beitreten können
  if (origin.includes('localhost') || /https?:\/\/\d+\.\d+\.\d+\.\d+/.test(origin)) {
    return RENDER_URL
  }
  return origin
}

// Reisedaten werden base64-kodiert in den Link eingebettet (kein Server nötig).
export function buildInviteLink(code: string, trip?: Trip): string {
  const base = `${getInviteOrigin()}/join/${code}`
  if (!trip) return base
  try {
    const bytes = new TextEncoder().encode(JSON.stringify(trip))
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('')
    return `${base}?d=${encodeURIComponent(btoa(binary))}`
  } catch {
    return base
  }
}
