// Autor: Amal Najah, Eya Mathlouthi, Wajdy Eleyan
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, LogOut, ArrowRight, Plane, FolderHeart } from 'lucide-react'
import { BottomSheet } from '@/components/shared/BottomSheet'
import { GlassPopup } from '@/components/shared/GlassPopup'
import { TripCard } from '@/components/trips/TripCard'
import { CreateTripSheet } from '@/components/sheets/CreateTripSheet'
import { useTripContext } from '@/context/TripContext'
import { useAuth, type AuthOutcome } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import type { Lang } from '@/i18n/translations'

const LANGS: { code: Lang }[] = [{ code: 'de' }, { code: 'en' }, { code: 'es' }]
const HERO_IMG = 'https://images.unsplash.com/photo-1764276266750-4d6316e972e0?q=80&w=1400&auto=format&fit=crop'

type ActiveSheet = 'create' | 'trips' | null
type Mode = 'signin' | 'register'

export default function Home() {
  const navigate = useNavigate()
  const { trips, refreshTrips } = useTripContext()
  const { user, signIn, register, logout, isLoading } = useAuth()
  const { t, lang, setLang } = useLanguage()

  const [sheet, setSheet] = useState<ActiveSheet>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  // Auth-Formular (nicht eingeloggt)
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [authError, setAuthError] = useState('')

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

  function errorText(error?: string): string {
    switch (error) {
      case 'notfound': return t('errNotRegistered')
      case 'taken': return t('errNameTaken')
      case 'badcode': return t('errBadCode')
      case 'wrongpass': return t('errWrongPass')
      default: return t('genericError')
    }
  }

  async function handleAuth() {
    const username = name.trim()
    if (!username || !password || busy) return
    setBusy(true)
    setAuthError('')
    const res: AuthOutcome = mode === 'signin'
      ? await signIn(username, password)
      : await register(username, password)
    setBusy(false)
    if (!res.ok) setAuthError(errorText(res.error))
    // bei Erfolg: user gesetzt → derselbe Screen zeigt den eingeloggten Zustand
  }

  // Kurzer Ladezustand, bis die gespeicherte Sitzung gelesen ist.
  if (isLoading) {
    return (
      <div className="app-shell flex items-center justify-center min-h-svh">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="app-shell relative flex flex-col min-h-svh overflow-hidden">
      {/* Hintergrund: Video, leicht geblurt + Dunkel-Overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay muted loop playsInline poster={HERO_IMG}
          className="w-full h-full object-cover scale-105"
          style={{ filter: 'blur(2px) brightness(0.92)' }}
        >
          <source src="/welcome.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/75" />
      </div>

      {/* Header */}
      <header className="relative z-20">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center ring-1 ring-white/30">
              <Plane size={16} className="text-white" />
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

            {/* Profil — nur wenn eingeloggt */}
            {user && (
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
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
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
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pb-10">
        <div className="mt-6">
          <h1 className="text-4xl font-extrabold text-white leading-[1.08] tracking-tight drop-shadow-lg">
            {t('sloganLine1')}<br />{t('sloganLine2')}<br />{t('sloganLine3')}
          </h1>
          <p className="text-sm text-white/85 mt-4 max-w-[260px] drop-shadow">
            {user ? `${t('hiUser', { name: user.name })} — ${t('homeTagline')}.` : t('tagline')}
          </p>
        </div>

        <div className="flex-1" />

        {user ? (
          /* Eingeloggt: Aktionen */
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSheet('create')}
              className="w-full h-14 rounded-2xl bg-primary/90 hover:bg-primary text-white text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-black/20"
            >
              {t('createNewTrip')}
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => { refreshTrips(); setSheet('trips') }}
              className="h-12 rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/40 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <FolderHeart size={16} />{t('myTrips')}
            </button>
          </div>
        ) : (
          /* Nicht eingeloggt: Anmelden / Registrieren auf DEMSELBEN Screen */
          <div className="flex flex-col gap-3 rounded-2xl bg-white/12 backdrop-blur-md ring-1 ring-white/25 p-4">
            {/* Umschalter */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-black/20">
              {(['signin', 'register'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setAuthError('') }}
                  className={`h-9 rounded-lg text-sm font-bold transition-colors ${
                    mode === m ? 'bg-white text-primary' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {m === 'signin' ? t('signInTab') : t('registerTab')}
                </button>
              ))}
            </div>

            <input
              id="auth-username"
              value={name}
              onChange={e => { setName(e.target.value); setAuthError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleAuth() }}
              placeholder={t('usernameLabel')}
              autoFocus
              autoComplete="username"
              className="w-full h-12 px-4 rounded-xl bg-white/92 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setAuthError('') }}
              onKeyDown={e => { if (e.key === 'Enter') handleAuth() }}
              placeholder={t('passwordLabel')}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full h-12 px-4 rounded-xl bg-white/92 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

{authError && <p className="text-xs text-red-200 font-medium" role="alert">{authError}</p>}

            <button
              onClick={handleAuth}
              disabled={!name.trim() || !password || busy}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-hover text-white text-base font-bold flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-black/20"
            >
              {busy ? '…' : (mode === 'signin' ? t('signIn') : t('registerTab'))}
              {!busy && <ArrowRight size={18} />}
            </button>
            <p className="text-[11px] text-white/70 leading-snug">{t('usernameHint')}</p>
          </div>
        )}
      </main>

      {/* Pop-up: Neue Reise */}
      <GlassPopup open={sheet === 'create'} title={t('createNewTrip')} onClose={() => setSheet(null)}>
        <CreateTripSheet onCreated={() => setSheet(null)} />
      </GlassPopup>

      {/* Sheet: Meine Reisen */}
      <BottomSheet open={sheet === 'trips'} title={t('myTrips')} onClose={() => setSheet(null)}>
        <div className="px-4 py-4 pb-6 flex flex-col gap-3">
          {trips.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              {t('noTripsTitle')}
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
