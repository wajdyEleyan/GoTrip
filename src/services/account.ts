// src/services/account.ts
// Account-API: Anmelden (signin) und Registrieren (register) per eindeutigem
// Username, passwortlos.
//
// Eindeutigkeit:
//  • Server mit DB (z. B. Render) erzwingt GLOBALE Eindeutigkeit (username PK → 409).
//  • Zusätzlich ein lokales Konten-Register (localStorage) als Fallback, damit
//    auch ohne erreichbare DB derselbe Name nicht doppelt registriert werden kann
//    und Anmelden nur für bekannte Namen klappt.

export interface Account {
  username: string
  codes: string[]
}

export type AuthError = 'taken' | 'badcode' | 'notfound'
export type AuthResult =
  | { ok: true; account: Account }
  | { ok: false; error: AuthError }

const TIMEOUT = 10000
const ACCT_KEY = 'gotrip_accounts'

function localAccounts(): string[] {
  try { return JSON.parse(localStorage.getItem(ACCT_KEY) || '[]') as string[] } catch { return [] }
}
function rememberLocalAccount(username: string): void {
  const a = localAccounts()
  if (!a.includes(username)) { a.push(username); localStorage.setItem(ACCT_KEY, JSON.stringify(a)) }
}

/** Meldet ein bestehendes Konto an. Unbekannt → 'notfound'. */
export async function signinAccount(username: string): Promise<AuthResult> {
  try {
    const resp = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (resp.ok) {
      rememberLocalAccount(username)
      return { ok: true, account: (await resp.json()) as Account }
    }
    if (resp.status === 404) return { ok: false, error: 'notfound' }
    // 503/sonstiges → keine DB → lokaler Fallback unten
  } catch {
    // Server nicht erreichbar → lokaler Fallback unten
  }
  // Lokaler Fallback: nur bekannte Namen dürfen rein.
  if (localAccounts().includes(username)) return { ok: true, account: { username, codes: [] } }
  return { ok: false, error: 'notfound' }
}

/** Legt ein neues Konto an (optional + Code). Vergeben → 'taken', Code ungültig → 'badcode'. */
export async function registerAccount(username: string, code?: string): Promise<AuthResult> {
  try {
    const resp = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, code: code?.trim() || undefined }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (resp.ok) {
      rememberLocalAccount(username)
      return { ok: true, account: (await resp.json()) as Account }
    }
    if (resp.status === 409) return { ok: false, error: 'taken' }
    if (resp.status === 404) return { ok: false, error: 'badcode' }
    // 503/sonstiges → keine DB → lokaler Fallback unten
  } catch {
    // Server nicht erreichbar → lokaler Fallback unten
  }
  // Lokaler Fallback (keine DB): Eindeutigkeit pro Gerät erzwingen.
  if (localAccounts().includes(username)) return { ok: false, error: 'taken' }
  rememberLocalAccount(username)
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
