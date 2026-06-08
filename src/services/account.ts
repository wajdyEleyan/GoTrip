// src/services/account.ts
// Account-API: Anmelden (signin) und Registrieren (register) per eindeutigem
// Username, passwortlos. Ohne Server/DB → error 'offline' (Aufrufer lässt dann
// lokal rein, App läuft weiter).

export interface Account {
  username: string
  codes: string[]
}

export type AuthError = 'taken' | 'badcode' | 'notfound' | 'offline' | 'server'
export type AuthResult =
  | { ok: true; account: Account }
  | { ok: false; error: AuthError }

const TIMEOUT = 10000

/** Meldet ein bestehendes Konto an. 404 → 'notfound'. */
export async function signinAccount(username: string): Promise<AuthResult> {
  try {
    const resp = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (resp.ok) return { ok: true, account: (await resp.json()) as Account }
    if (resp.status === 404) return { ok: false, error: 'notfound' }
    if (resp.status === 503) return { ok: false, error: 'offline' }
    return { ok: false, error: 'server' }
  } catch {
    return { ok: false, error: 'offline' }
  }
}

/** Legt ein neues Konto an (optional mit Einladungscode). 409 → 'taken', 404 → 'badcode'. */
export async function registerAccount(username: string, code?: string): Promise<AuthResult> {
  try {
    const resp = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, code: code?.trim() || undefined }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (resp.ok) return { ok: true, account: (await resp.json()) as Account }
    if (resp.status === 409) return { ok: false, error: 'taken' }
    if (resp.status === 404) return { ok: false, error: 'badcode' }
    if (resp.status === 503) return { ok: false, error: 'offline' }
    return { ok: false, error: 'server' }
  } catch {
    return { ok: false, error: 'offline' }
  }
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
