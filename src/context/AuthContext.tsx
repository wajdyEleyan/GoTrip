// Autor: Mohamad Haj Ahmad
// src/context/AuthContext.tsx
// Passwortlose Konten: Identität = eindeutiger Username (auth.id == name).
// signIn meldet ein bestehendes Konto an, register legt eines an (optional + Code).
// Ohne Server (error 'offline') kommt der Nutzer lokal rein → App läuft weiter.
import React, { createContext, useContext, useState, useEffect } from 'react'
import { getAuth, saveAuth, clearAuth, type StoredAuth } from '@/utils/storage'
import { signinAccount, registerAccount, type AuthError } from '@/services/account'
import { joinTripByCode } from '@/services/joinTrip'
import { pullTrip } from '@/services/tripSync'

export interface AuthOutcome {
  ok: boolean
  error?: AuthError
}

interface AuthContextType {
  user: StoredAuth | null
  /** Bestehendes Konto anmelden. Unbekannt → { ok:false, error:'notfound' }. */
  signIn: (name: string) => Promise<AuthOutcome>
  /** Neues Konto anlegen (optional + Einladungscode). Vergeben → 'taken', Code ungültig → 'badcode'. */
  register: (name: string, code?: string) => Promise<AuthOutcome>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredAuth | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getAuth()
    if (stored) setUser(stored)
    setIsLoading(false)
  }, [])

  function enter(username: string): StoredAuth {
    const auth: StoredAuth = { id: username, name: username }
    saveAuth(auth)
    setUser(auth)
    return auth
  }

  async function loadTrips(codes: string[]) {
    for (const code of codes) await pullTrip(code)
  }

  async function signIn(name: string): Promise<AuthOutcome> {
    const username = name.trim()
    if (!username) return { ok: false, error: 'notfound' }
    const r = await signinAccount(username)
    if (!r.ok) return { ok: false, error: r.error } // 'notfound'
    enter(username)
    await loadTrips(r.account.codes)
    return { ok: true }
  }

  async function register(name: string, code?: string): Promise<AuthOutcome> {
    const username = name.trim()
    if (!username) return { ok: false, error: 'taken' }
    const r = await registerAccount(username, code)
    if (!r.ok) return { ok: false, error: r.error } // 'taken' | 'badcode'
    const auth = enter(username)
    await loadTrips(r.account.codes)
    // Mit Code: direkt der Reise beitreten (Mitgliedschaft hinzufügen).
    if (code?.trim()) await joinTripByCode(code.trim(), auth)
    return { ok: true }
  }

  function logout() {
    clearAuth()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
