import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Map, Plus, Link2, LayoutGrid, ClipboardList, Sparkles, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

interface BottomNavProps {
  onCreateClick?: () => void
  onTripsClick?: () => void
  onJoinClick?: () => void
}

export function BottomNav({ onCreateClick, onTripsClick, onJoinClick }: BottomNavProps = {}) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { pathname } = useLocation()

  // Trip-Kontext erkennen: /trip/:id/...
  const tripMatch = pathname.match(/^\/trip\/([^/]+)/)
  const tripId = tripMatch?.[1]

  const itemCls = (active: boolean) =>
    cn(
      'flex flex-col items-center justify-center gap-0.5 h-full min-h-[44px] flex-1 text-[11px] font-medium transition-colors',
      active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
    )

  // ── Trip-Kontext: 1-Tap-Sprünge (helle Variante) ──
  if (tripId) {
    const base = `/trip/${tripId}`
    const items = [
      { to: `${base}/dashboard`, icon: LayoutGrid, label: t('navOverview') },
      { to: `${base}/management`, icon: ClipboardList, label: t('navManagement') },
      { to: `${base}/recommendation`, icon: Sparkles, label: t('navRecommendation') },
      { to: `${base}/members`, icon: Users, label: t('navGroup') },
    ]
    return (
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] glass-bar border-t z-30"
        aria-label="Trip-Navigation"
      >
        <ul className="flex items-center justify-around h-16 px-3 list-none m-0 p-0">
          {items.map(({ to, icon: Icon, label }) => (
            <li key={to} className="flex-1">
              <NavLink to={to} end className={({ isActive }) => itemCls(isActive)} aria-label={label}>
                {({ isActive }) => (
                  <>
                    <Icon size={21} className={isActive ? 'text-primary' : 'text-gray-400'} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  // ── Global: Meine Reisen · Neue Reise · Beitreten ──
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] glass-bar border-t z-30"
      aria-label="Hauptnavigation"
    >
      <ul className="flex items-center justify-around h-16 px-4 list-none m-0 p-0">
        {/* Meine Reisen */}
        <li className="flex-1">
          <button
            onClick={() => onTripsClick ? onTripsClick() : navigate('/home')}
            className={itemCls(false)}
            aria-label={t('myTrips')}
          >
            <Map size={22} className="text-gray-400" />
            <span>{t('trips')}</span>
          </button>
        </li>

        {/* Neue Reise (mittig, hervorgehoben) */}
        <li className="flex-1 flex justify-center">
          <button
            onClick={() => onCreateClick ? onCreateClick() : navigate('/create')}
            className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] w-full text-[11px] font-medium text-gray-400 hover:text-primary transition-colors"
            aria-label={t('create')}
          >
            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/40 -mt-4">
              <Plus size={22} className="text-white" />
            </div>
            <span className="mt-0.5">{t('create')}</span>
          </button>
        </li>

        {/* Beitreten */}
        <li className="flex-1">
          <button
            onClick={() => onJoinClick ? onJoinClick() : navigate('/home')}
            className={itemCls(false)}
            aria-label={t('join')}
          >
            <Link2 size={22} className="text-gray-400" />
            <span>{t('join')}</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
