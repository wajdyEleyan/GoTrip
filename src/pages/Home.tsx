// src/pages/Home.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Globe, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/shared/BottomNav'
import { TripCard } from '@/components/trips/TripCard'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Lang } from '@/i18n/translations'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'de', label: 'DE' },
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
]

export default function Home() {
  const navigate = useNavigate()
  const { trips, refreshTrips } = useTripContext()
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useLanguage()

  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    refreshTrips()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="app-shell flex flex-col min-h-svh bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30">
              <span className="text-sm">✈️</span>
            </div>
            <span className="text-base font-bold text-gray-900">GoTrip</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen((v) => !v); setProfileOpen(false) }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
                aria-label={t('language')}
              >
                <Globe size={14} />
                <span>{lang.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 min-w-[120px]">
                  {LANGS.map(({ code }) => (
                    <button
                      key={code}
                      onClick={() => { setLang(code); setLangOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        lang === code
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t(`language${code.charAt(0).toUpperCase() + code.slice(1)}` as any)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen((v) => !v); setLangOpen(false) }}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
                aria-label={t('profile')}
              >
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 min-w-[200px]">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400">{t('profile')}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        {/* Hero greeting */}
        <div className="px-4 pt-5 pb-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-0.5">{t('hiUser', { name: user?.name ?? '' })}</p>
              <h1 className="text-2xl font-bold text-gray-900">{t('myTrips')}</h1>
            </div>
            <Button
              onClick={() => navigate('/create')}
              size="sm"
              className="shrink-0 h-9 rounded-xl px-3 text-sm"
            >
              <Plus size={15} className="mr-1.5" />
              {t('create')}
            </Button>
          </div>
        </div>

        {/* Trip list / Empty state */}
        <div className="px-4">
          {trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <MapPin size={36} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('noTripsTitle')}</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
                {t('noTripsText')}
              </p>
              <Button onClick={() => navigate('/create')} className="rounded-xl px-6">
                <Plus size={16} className="mr-2" />
                {t('createFirstTrip')}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3" role="list">
              {trips.map((trip) => (
                <div key={trip.id} role="listitem">
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
