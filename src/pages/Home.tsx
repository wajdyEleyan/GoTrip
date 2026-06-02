// src/pages/Home.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, LogOut, ChevronRight, ArrowRight } from 'lucide-react'
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

type ActiveSheet = 'create' | 'trips' | null

export default function Home() {
  const navigate = useNavigate()
  const { trips, refreshTrips } = useTripContext()
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useLanguage()

  const [sheet, setSheet] = useState<ActiveSheet>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
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

  const latestTrip = trips.length > 0
    ? [...trips].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    : null

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

      {/* ── Main ── */}
      <main className="flex-1 px-4 pt-5 pb-28 overflow-y-auto">

        {/* Greeting */}
        <div className="mb-5">
          <p className="text-sm text-gray-500 mb-0.5">{t('hiUser', { name: user?.name ?? '' })}</p>
          <h1 className="text-2xl font-bold text-gray-900">Was planst du?</h1>
        </div>

        {/* ── Tile grid ── */}
        <div className="flex flex-col gap-3">

          {/* Row 1: Neue Reise (volle Breite, primär) */}
          <button
            onClick={() => setSheet('create')}
            className="w-full rounded-2xl bg-primary text-white p-5 flex items-center gap-4 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 text-2xl">✈️</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base">{t('createNewTrip')}</p>
              <p className="text-sm text-white/70 mt-0.5">Name & Datum — fertig in 3 Taps</p>
            </div>
            <ArrowRight size={20} className="text-white/50 shrink-0" />
          </button>

          {/* Row 2: Meine Reisen + Beitreten */}
          <div className="grid grid-cols-2 gap-3">

            {/* Meine Reisen */}
            <button
              onClick={() => setSheet('trips')}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 active:scale-[0.97] transition-transform text-left shadow-sm"
            >
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🗺️</div>
              <div>
                <p className="font-bold text-sm text-gray-900">{t('myTrips')}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {trips.length === 0 ? 'Keine Reisen' : `${trips.length} ${trips.length === 1 ? 'Reise' : 'Reisen'}`}
                </p>
              </div>
            </button>

            {/* Beitreten — inline expandierbar */}
            <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${joinOpen ? 'border-green-400' : 'border-gray-100'}`}>
              <button
                onClick={() => setJoinOpen(v => !v)}
                className="w-full p-4 flex flex-col gap-3 text-left"
              >
                <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center text-2xl">🔗</div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Beitreten</p>
                  <p className="text-xs text-gray-500 mt-0.5">Mit Code</p>
                </div>
              </button>
              <div className={`grid transition-[grid-template-rows] duration-300 ${joinOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <div className="px-3 pb-3 flex gap-2">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && joinCode.trim() && navigate(`/join/${joinCode.trim()}`)}
                      placeholder="Einladungscode"
                      autoFocus={joinOpen}
                      className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-mono placeholder:text-gray-400 focus:outline-none focus:border-green-400"
                    />
                    <button
                      onClick={() => joinCode.trim() && navigate(`/join/${joinCode.trim()}`)}
                      disabled={!joinCode.trim()}
                      className="h-10 px-3 rounded-xl bg-green-500 text-white text-sm font-bold disabled:opacity-40"
                    >
                      Los
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Zuletzt aktiv (nur wenn Trip vorhanden) */}
          {latestTrip && (
            <button
              onClick={() => navigate(`/trip/${latestTrip.id}/dashboard`)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 active:scale-[0.98] transition-transform text-left shadow-sm"
            >
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-2xl shrink-0">⚡</div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">Zuletzt aktiv</p>
                <p className="font-bold text-sm text-gray-900 truncate">{latestTrip.name}</p>
                <p className="text-xs text-gray-500">{latestTrip.startDate} – {latestTrip.endDate}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          )}
        </div>
      </main>

      <BottomNav onCreateClick={() => setSheet('create')} />

      {/* ── Pop-up: Neue Reise (Glas-Look) ── */}
      <GlassPopup
        open={sheet === 'create'}
        title={t('createNewTrip')}
        onClose={() => setSheet(null)}
      >
        <CreateTripSheet onCreated={() => setSheet(null)} />
      </GlassPopup>

      {/* ── Sheet: Meine Reisen ── */}
      <BottomSheet
        open={sheet === 'trips'}
        title={t('myTrips')}
        onClose={() => setSheet(null)}
      >
        <div className="px-4 py-4 pb-6 flex flex-col gap-3">
          {trips.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Noch keine Reisen erstellt.
            </div>
          ) : (
            trips.map(trip => (
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
