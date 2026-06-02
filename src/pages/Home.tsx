// src/pages/Home.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, LogOut, Plane, ArrowRight } from 'lucide-react'
import { BottomNav } from '@/components/shared/BottomNav'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { GlassPopup } from '@/components/shared/GlassPopup'
import { TripCard } from '@/components/trips/TripCard'
import { CreateTripSheet } from '@/components/sheets/CreateTripSheet'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Lang } from '@/i18n/translations'

const LANGS: { code: Lang }[] = [{ code: 'de' }, { code: 'en' }, { code: 'es' }]

type ActiveSheet = 'create' | 'trips' | 'join' | null

export default function Home() {
  const navigate = useNavigate()
  const { trips, refreshTrips } = useTripContext()
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useLanguage()

  const [sheet, setSheet] = useState<ActiveSheet>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const profileRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  useEffect(() => { refreshTrips() }, [])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  function goJoin() {
    const code = joinCode.trim()
    if (code) navigate(`/join/${code}`)
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-gray-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 glass-bar border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30">
              <span className="text-sm">✈️</span>
            </div>
            <span className="text-base font-bold text-gray-900">GoTrip</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Language */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen(v => !v); setProfileOpen(false) }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Globe size={14} />
                <span>{lang.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 min-w-[120px]">
                  {LANGS.map(({ code }) => (
                    <button key={code} onClick={() => { setLang(code); setLangOpen(false) }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${lang === code ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {t(`language${code.charAt(0).toUpperCase() + code.slice(1)}` as any)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setProfileOpen(v => !v); setLangOpen(false) }}
                className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors">
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 min-w-[200px]">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{initials}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400">{t('profile')}</p>
                    </div>
                  </div>
                  <button onClick={() => { logout(); navigate('/') }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={15} />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main: Hero mit Planet Erde + umkreisendem Flugzeug ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-28 overflow-hidden">

        <p className="text-sm text-gray-500 mb-1">{t('hiUser', { name: user?.name ?? '' })}</p>

        {/* Hero */}
        <div className="relative flex items-center justify-center w-[280px] h-[280px] my-6">
          {/* Glow / Atmosphäre */}
          <div className="absolute w-56 h-56 rounded-full bg-primary/25 blur-3xl" />
          {/* Umlaufbahn (gestrichelt) */}
          <div className="absolute w-[260px] h-[260px] rounded-full border border-dashed border-primary/30" />

          {/* Erde */}
          <div
            className="relative leading-none select-none animate-[earth-float_6s_ease-in-out_infinite] drop-shadow-2xl"
            style={{ fontSize: 150 }}
            aria-hidden="true"
          >
            🌍
          </div>

          {/* Flugzeug auf Umlaufbahn */}
          <div className="absolute w-[260px] h-[260px] animate-[orbit-spin_14s_linear_infinite] pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-11 h-11 rounded-full bg-white shadow-lg shadow-primary/20 flex items-center justify-center">
                <Plane size={22} className="text-primary rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Botschaft */}
        <h1 className="text-2xl font-bold text-gray-900 text-center">Wohin geht die Reise?</h1>
        <p className="text-sm text-gray-500 text-center mt-1.5 max-w-[260px]">
          Plane deine nächste Gruppenreise — tippe unten auf <span className="font-bold text-primary">＋</span>
        </p>

        {/* Primärer Button (zusätzlich zur Leiste, für Klarheit) */}
        <button
          onClick={() => setSheet('create')}
          className="mt-6 h-13 px-6 rounded-2xl bg-black text-white text-base font-bold flex items-center gap-2 active:scale-[0.98] transition-transform shadow-md"
        >
          {t('createNewTrip')}
          <ArrowRight size={18} />
        </button>
      </main>

      <BottomNav
        onCreateClick={() => setSheet('create')}
        onTripsClick={() => setSheet('trips')}
        onJoinClick={() => setSheet('join')}
      />

      {/* ── Pop-up: Neue Reise ── */}
      <GlassPopup open={sheet === 'create'} title={t('createNewTrip')} onClose={() => setSheet(null)}>
        <CreateTripSheet onCreated={() => setSheet(null)} />
      </GlassPopup>

      {/* ── Pop-up: Beitreten (Code) ── */}
      <GlassPopup open={sheet === 'join'} title="Reise beitreten" onClose={() => setSheet(null)}>
        <div className="px-4 py-5 flex flex-col gap-4">
          <p className="text-sm text-gray-500">Gib den Einladungscode ein, den du bekommen hast.</p>
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && goJoin()}
            placeholder="z.B. AB12CD"
            autoFocus
            className="w-full h-13 px-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-900 text-base font-mono tracking-widest text-center placeholder:tracking-normal placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-white transition-colors"
          />
          <button
            onClick={goJoin}
            disabled={!joinCode.trim()}
            className="w-full h-13 rounded-2xl bg-black text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-25 active:scale-[0.98] transition-all"
          >
            Beitreten
            <ArrowRight size={18} />
          </button>
        </div>
      </GlassPopup>

      {/* ── Sheet: Meine Reisen ── */}
      <BottomSheet open={sheet === 'trips'} title={t('myTrips')} onClose={() => setSheet(null)}>
        <div className="px-4 py-4 pb-6 flex flex-col gap-3">
          {trips.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Noch keine Reisen erstellt.
            </div>
          ) : (
            [...trips]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map(trip => (
                <div key={trip.id} onClick={() => setSheet(null)}>
                  <TripCard trip={trip} />
                </div>
              ))
          )}
        </div>
      </BottomSheet>
    </div>
  )
}
