// Autor: Amal Najah
// src/components/shared/BottomNav.tsx
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/shared/Toast'

export function BottomNav() {
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100"
      aria-label="Hauptnavigation"
    >
      <ul className="flex items-center justify-around h-16 px-2 list-none m-0 p-0">
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
            aria-label="Meine Reisen"
          >
            {({ isActive }) => (
              <>
                <Home size={22} className={isActive ? 'text-primary' : 'text-gray-400'} aria-hidden="true" />
                <span>Reisen</span>
              </>
            )}
          </NavLink>
        </li>

        {/* Create Trip — center FAB-style */}
        <li className="flex-1 flex justify-center">
          <button
            onClick={() => navigate('/create')}
            className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] w-full text-xs font-medium text-gray-400 hover:text-primary transition-colors"
            aria-label="Neue Reise erstellen"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-sm shadow-primary/30 -mt-3">
              <Plus size={20} className="text-white" aria-hidden="true" />
            </div>
            <span className="mt-0.5">Erstellen</span>
          </button>
        </li>

        {/* Profil (coming soon) */}
        <li className="flex-1">
          <button
            onClick={() => toast.info('Profil-Feature kommt bald!')}
            className="flex flex-col items-center justify-center gap-0.5 h-full min-h-[44px] w-full text-xs font-medium text-gray-400 hover:text-gray-500 transition-colors"
            aria-label="Profil (demnächst verfügbar)"
          >
            <User size={22} aria-hidden="true" />
            <span>Profil</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
