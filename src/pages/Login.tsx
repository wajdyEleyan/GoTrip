// src/pages/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Lang } from '@/i18n/translations'

const LANGS: { code: Lang; native: string }[] = [
  { code: 'de', native: 'DE' },
  { code: 'en', native: 'EN' },
  { code: 'es', native: 'ES' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t, lang, setLang } = useLanguage()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(t('nameRequired'))
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
    <div className="app-shell flex flex-col min-h-svh bg-gradient-to-b from-primary/8 to-white">
      {/* Language selector — top right */}
      <div className="flex justify-end px-4 pt-4 gap-1">
        {LANGS.map(({ code, native }) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              lang === code
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {native}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-8">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/25">
            <span className="text-3xl">✈️</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('appName')}</h1>
        <p className="text-gray-500 text-center text-sm mb-7 max-w-xs leading-relaxed">
          {t('tagline')}
        </p>

        {/* How it works */}
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{t('howItWorks')}</p>
          <div className="flex flex-col gap-2.5">
            {([t('step1'), t('step2'), t('step3')] as string[]).map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username" className="text-sm font-semibold text-gray-700">{t('yourName')}</Label>
            <Input
              id="username"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              autoFocus
              className="h-12 rounded-xl"
              aria-describedby={error ? 'name-err' : undefined}
            />
            {error && (
              <p id="name-err" className="text-xs text-red-500" role="alert">{error}</p>
            )}
          </div>

          <Button onClick={handleLogin} className="w-full h-12 rounded-xl text-base font-semibold">
            {t('signIn')}
          </Button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{t('or')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button variant="outline" onClick={handleGuest} className="w-full h-12 rounded-xl text-base">
            {t('continueAsGuest')}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-8 px-4">
        {t('privacyNote')}
      </p>
    </div>
  )
}
