// Autor: Mohamad Haj Ahmad
// src/context/AuthContext.tsx
// Mock-Auth: stores name + UUID in localStorage — no real OAuth in Sprint 1
import React, { createContext, useContext, useState, useEffect } from 'react'
import { getAuth, saveAuth, clearAuth, type StoredAuth } from '@/utils/storage'
import { loginAccount } from '@/services/account'
import { pullTrip } from '@/services/tripSync'

interface AuthContextType {
  user: StoredAuth | null
  /** Meldet per Username an. Existiert das Konto, werden seine Reisen geladen. */
  login: (name: string) => Promise<{ isNew: boolean }>
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

  // Identität = (eindeutiger) Username. id == name, damit dieselbe Person
  // auf jedem Gerät dasselbe Mitglied ist. Existiert das Konto serverseitig,
  // laden wir seine Reisen; ohne Server bleibt es lokal (App läuft trotzdem).
  async function login(name: string): Promise<{ isNew: boolean }> {
    const username = name.trim()
    const auth: StoredAuth = { id: username, name: username }
    saveAuth(auth)
    setUser(auth)

    const account = await loginAccount(username)
    if (account?.codes?.length) {
      for (const code of account.codes) {
        await pullTrip(code) // Reisen des Kontos in den lokalen Cache holen
      }
    }
    return { isNew: account?.isNew ?? true }
  }

  function logout() {
    clearAuth()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
