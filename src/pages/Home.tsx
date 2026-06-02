// src/pages/Home.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, LogOut, ArrowRight } from 'lucide-react'
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

// Vestrahorn / Stokksnes, Island — Unsplash-Lizenz (frei, kommerziell, ohne Attribution).
const HERO_IMG = 'https://images.unsplash.com/photo-1764276266750-4d6316e972e0?q=80&w=1400&auto=format&fit=crop'

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
    <div className="app-shell relative flex flex-col min-h-svh overflow-hidden">

      {/* ── Hintergrund: echtes Erd-Foto, leicht geblurt + Dunkel-Overlay ── */}
      <div className="absolute inset-0 -z-10">
        <img
          src={HERO_IMG}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover scale-105"
          style={{ filter: 'blur(2px) brightness(0.92)' }}
        />
        {/* Overlay für Lesbarkeit (oben + unten dunkler) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/75" />
      </div>

      {/* ── Header (über dem Bild, heller Text) ── */}
      <header className="relative z-20">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center ring-1 ring-white/30">
              <span className="text-sm">✈️</span>
            </div>
            <span className="text-base font-bold text-white drop-shadow">GoTrip</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Language */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => { setLangOpen(v => !v); setProfileOpen(false) }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white/90 hover:bg-white/15 transition-colors"
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
                className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/30 text-white font-bold text-xs hover:bg-white/25 transition-colors">
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

      {/* ── Main: „Explore. Travel. Inspire." — Hero oben, Buttons unten ── */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pb-28">
        {/* Hero-Slogan oben links */}
        <div className="mt-6">
          <h1 className="text-5xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-lg">
            Explore.<br />Travel.<br />Inspire.
          </h1>
          <p className="text-sm text-white/85 mt-4 max-w-[230px] drop-shadow">
            {t('hiUser', { name: user?.name ?? '' })} — plane deine nächste Gruppenreise.
          </p>
        </div>

        {/* Abstand */}
        <div className="flex-1" />

        {/* Buttons unten */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setSheet('create')}
            className="w-full h-14 rounded-2xl text-white text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xl shadow-black/20"
            style={{ background: '#34C2AC' }}
          >
            {t('createNewTrip')}
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => setSheet('join')}
            className="w-full h-12 rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/40 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {t('join')}
          </button>
        </div>
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
