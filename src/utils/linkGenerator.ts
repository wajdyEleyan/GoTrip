// Autor: Mohamad Haj Ahmad
// src/utils/linkGenerator.ts
// Generates a 6-character alphanumeric invite code (ambiguous chars excluded)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

export function generateInviteCode(): string {
  return Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

export function buildInviteLink(code: string): string {
  return `${window.location.origin}/join/${code}`
}
