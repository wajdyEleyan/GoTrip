// src/components/shared/BottomNav.tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

export function BottomNav() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur border-t border-gray-100"
      aria-label="Hauptnavigation"
    >
      <ul className="flex items-center justify-around h-16 px-8 list-none m-0 p-0">
        {/* Home */}
        <li className="flex-1">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 h-full min-h-[44px] text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              )
            }
            aria-label={t('trips')}
          >
            {({ isActive }) => (
              <>
                <Home size={22} className={isActive ? 'text-primary' : 'text-gray-400'} />
                <span>{t('trips')}</span>
              </>
            )}
          </NavLink>
        </li>

        {/* Create Trip — center FAB-style */}
        <li className="flex-1 flex justify-center">
          <button
            onClick={() => navigate('/create')}
            className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] w-full text-xs font-medium text-gray-400 hover:text-primary transition-colors"
            aria-label={t('create')}
          >
            <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-md shadow-primary/30 -mt-4">
              <Plus size={22} className="text-white" />
            </div>
            <span className="mt-0.5">{t('create')}</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
