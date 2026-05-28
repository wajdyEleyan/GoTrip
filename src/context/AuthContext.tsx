// Autor: Mohamad Haj Ahmad
// src/context/AuthContext.tsx
// Mock-Auth: stores name + UUID in localStorage — no real OAuth in Sprint 1
import React, { createContext, useContext, useState, useEffect } from 'react'
import { getAuth, saveAuth, clearAuth, type StoredAuth } from '@/utils/storage'

interface AuthContextType {
  user: StoredAuth | null
  login: (name: string) => void
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

  function login(name: string) {
    const auth: StoredAuth = { id: crypto.randomUUID(), name: name.trim() }
    saveAuth(auth)
    setUser(auth)
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
