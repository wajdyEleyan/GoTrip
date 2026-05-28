// Autor: Eya Mathlouthi
// src/pages/Login.tsx — Screen 1: Welcome / Mock-Auth
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Bitte gib deinen Namen ein')
      return
    }
    login(trimmed)
    navigate('/home')
  }

  function handleGuest() {
    login('Gast')
    navigate('/home')
  }

  return (
    <div className="app-shell flex flex-col min-h-svh">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 bg-gradient-to-b from-primary/5 to-white">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="text-3xl">✈️</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">GoTrip</h1>
        <p className="text-gray-500 text-center text-sm mb-6 max-w-xs">
          Plane deine nächste Gruppenreise — einfach, gemeinsam, unvergesslich.
        </p>

        {/* Onboarding steps */}
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">So funktioniert GoTrip</p>
          <div className="flex flex-col gap-2.5">
            {[
              { step: '1', label: 'Reise erstellen & Freunde einladen' },
              { step: '2', label: 'Verfügbarkeit + Präferenzen eingeben' },
              { step: '3', label: 'KI empfiehlt Ziele — gemeinsam abstimmen' },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{step}</span>
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username">Dein Name</Label>
            <Input
              id="username"
              placeholder="z.B. Anna"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoFocus
              aria-describedby={error ? 'name-err' : undefined}
            />
            {error && (
              <p id="name-err" className="text-xs text-red-500" role="alert">{error}</p>
            )}
          </div>

          <Button onClick={handleLogin} className="w-full">
            Anmelden
          </Button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">oder</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button variant="outline" onClick={handleGuest} className="w-full">
            Als Gast fortfahren
          </Button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 pb-8 px-4">
        Mit der Anmeldung stimmst du unserer Datenschutzerklärung zu.
      </p>
    </div>
  )
}
