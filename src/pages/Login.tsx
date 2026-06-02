// src/pages/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Lang } from '@/i18n/translations'
import { destinationImage } from '@/utils/destinationImage'

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

  // 1-Klick-Login: Name ist optional, sonst „Gast" (3-Klick-Regel, FR-1)
  function handleStart() {
    login(name.trim() || 'Gast')
    navigate('/home')
  }

  return (
    <div className="app-shell flex flex-col min-h-svh">
      {/* Full-bleed hero video background (Foto als Fallback/Poster) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={destinationImage('beach', 1200)}
          className="w-full h-full object-cover object-center"
        >
          <source src="/welcome.mp4" type="video/mp4" />
        </video>
        {/* Dark gradient scrim for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/65" />
      </div>

      {/* Language selector — top right, above hero */}
      <div className="relative z-10 flex justify-end px-4 pt-4 gap-1">
        {LANGS.map(({ code, native }) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              lang === code
                ? 'bg-white text-primary shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/15'
            }`}
          >
            {native}
          </button>
        ))}
      </div>

      {/* Hero title area */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pt-6 pb-4">
        {/* Logo */}
        <div className="mb-5">
          <div className="w-20 h-20 bg-white/20 border-2 border-white/50 rounded-3xl flex items-center justify-center shadow-xl backdrop-blur-sm">
            <Plane size={36} className="text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">{t('appName')}</h1>
        <p className="text-white/85 text-center text-sm mb-8 max-w-xs leading-relaxed drop-shadow">
          {t('tagline')}
        </p>

        {/* How it works — glass card */}
        <div className="glass-card w-full max-w-sm rounded-2xl p-4 mb-5">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">{t('howItWorks')}</p>
          <div className="flex flex-col gap-2.5">
            {([t('step1'), t('step2'), t('step3')] as string[]).map((label, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login Form — glass card */}
        <div className="glass-card w-full max-w-sm rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username" className="text-sm font-semibold text-gray-700">{t('yourName')}</Label>
            <div className="glass-field rounded-xl overflow-hidden">
              <Input
                id="username"
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                autoFocus
                className="h-12 rounded-xl border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
              />
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30"
          >
            {t('guestStart')}
          </Button>
        </div>
      </div>

      <p className="relative z-10 text-center text-xs text-white/60 pb-8 px-4">
        {t('privacyNote')}
      </p>
    </div>
  )
}
