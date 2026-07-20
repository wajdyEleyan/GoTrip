// Offline-Fallback: SHA-256-Hash in localStorage, wenn Server nicht erreichbar.
export interface Account {
  username: string
  codes: string[]
}

export type AuthError = 'taken' | 'badcode' | 'notfound' | 'wrongpass'
export type AuthResult =
  | { ok: true; account: Account }
  | { ok: false; error: AuthError }

const TIMEOUT = 2000
const ACCT_KEY = 'gotrip_accounts'

function readLocal(): Record<string, string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCT_KEY) || '{}')
    if (Array.isArray(parsed)) {
      // Migration: frühere Liste von Namen → ohne Passwort ('').
      return Object.fromEntries(parsed.map((u) => [u, '']))
    }
    return parsed as Record<string, string>
  } catch {
    return {}
  }
}
function writeLocal(map: Record<string, string>): void {
  localStorage.setItem(ACCT_KEY, JSON.stringify(map))
}
async function sha256(text: string): Promise<string> {
  // crypto.subtle nur auf localhost/HTTPS verfügbar — einfacher Fallback für LAN-IP
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Einfacher deterministischer Hash als Fallback (ausreichend für Demo)
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (Math.imul(31, hash) + text.charCodeAt(i)) | 0
  }
  return Math.abs(hash).toString(36).padStart(8, '0')
}

/** Meldet ein bestehendes Konto an. Unbekannt → 'notfound', Passwort falsch → 'wrongpass'. */
export async function signinAccount(username: string, password: string): Promise<AuthResult> {
  try {
    const resp = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (resp.ok) {
      const account = (await resp.json()) as Account
      writeLocal({ ...readLocal(), [username]: await sha256(password) })
      return { ok: true, account }
    }
    if (resp.status === 404) return { ok: false, error: 'notfound' }
    if (resp.status === 401) return { ok: false, error: 'wrongpass' }
    // 503/sonstiges → keine DB → lokaler Fallback unten
  } catch {
    // Server nicht erreichbar → lokaler Fallback unten
  }
  // Lokaler Fallback: nur bekannte Namen, Passwort vergleichen.
  const map = readLocal()
  if (!(username in map)) return { ok: false, error: 'notfound' }
  const stored = map[username]
  const hash = await sha256(password)
  if (stored && stored !== hash) return { ok: false, error: 'wrongpass' }
  if (!stored) { map[username] = hash; writeLocal(map) } // Alt-Konto: Passwort setzen
  return { ok: true, account: { username, codes: [] } }
}

/** Legt ein neues Konto an (Username + Passwort, optional + Code). Vergeben → 'taken'. */
export async function registerAccount(username: string, password: string, code?: string): Promise<AuthResult> {
  try {
    const resp = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, code: code?.trim() || undefined }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (resp.ok) {
      const account = (await resp.json()) as Account
      writeLocal({ ...readLocal(), [username]: await sha256(password) })
      return { ok: true, account }
    }
    if (resp.status === 409) return { ok: false, error: 'taken' }
    if (resp.status === 404) return { ok: false, error: 'badcode' }
    // 503/sonstiges → keine DB → lokaler Fallback unten
  } catch {
    // Server nicht erreichbar → lokaler Fallback unten
  }
  // Lokaler Fallback (keine DB): Eindeutigkeit pro Gerät erzwingen.
  const map = readLocal()
  if (username in map) return { ok: false, error: 'taken' }
  map[username] = await sha256(password)
  writeLocal(map)
  return { ok: true, account: { username, codes: code?.trim() ? [code.trim()] : [] } }
}

/** Ordnet eine Reise (inviteCode) dem Konto zu, damit sie überall sichtbar ist. */
export async function attachCodeToAccount(username: string, code: string): Promise<void> {
  try {
    await fetch(`/api/users/${encodeURIComponent(username)}/codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
  } catch {
    /* offline → bleibt lokal */
  }
}
