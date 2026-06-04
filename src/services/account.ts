// src/services/account.ts
// Schlanke Account-API: Anmelden per (eindeutigem) Username und Reisen dem
// Konto zuordnen. Ist kein Server/DB erreichbar, geben die Funktionen null
// zurück → die App läuft dann rein lokal pro Browser (wie zuvor).

export interface Account {
  username: string
  codes: string[]
  isNew: boolean
}

/** Meldet einen Username an (legt das Konto bei Bedarf an) und liefert dessen Reise-Codes. */
export async function loginAccount(username: string): Promise<Account | null> {
  try {
    const resp = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
      signal: AbortSignal.timeout(10000),
    })
    if (!resp.ok) return null
    return (await resp.json()) as Account
  } catch {
    return null // Server nicht erreichbar → lokal weiterarbeiten
  }
}

/** Ordnet eine Reise (inviteCode) dem Konto zu, damit sie überall sichtbar ist. */
export async function attachCodeToAccount(username: string, code: string): Promise<void> {
  try {
    await fetch(`/api/users/${encodeURIComponent(username)}/codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    /* offline → bleibt lokal */
  }
}
