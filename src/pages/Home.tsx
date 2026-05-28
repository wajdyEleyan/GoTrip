// Autor: Eya Mathlouthi
// src/pages/Home.tsx — Screen 2: My Trips Liste
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Bell, Menu, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/shared/BottomNav'
import { TripCard } from '@/components/trips/TripCard'
import { useTripContext } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function Home() {
  const navigate = useNavigate()
  const { trips, refreshTrips } = useTripContext()
  const { user } = useAuth()
  const { seniorenModus, toggleSeniorenModus } = useAccessibility()

  useEffect(() => {
    refreshTrips()
  }, [])

  return (
    <div className="app-shell flex flex-col min-h-svh bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100 sticky top-0 z-10">
        <button
          className="flex items-center justify-center w-11 h-11 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Menü"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-base font-semibold text-gray-900">GoTrip</h1>

        <button
          onClick={toggleSeniorenModus}
          className={`flex items-center justify-center w-11 h-11 -mr-2 rounded-xl transition-colors ${
            seniorenModus
              ? 'bg-primary/10 text-primary'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          aria-label={seniorenModus ? 'Senioren-Modus deaktivieren' : 'Senioren-Modus aktivieren'}
          title={seniorenModus ? 'Senioren-Modus AN' : 'Senioren-Modus AUS'}
        >
          <span className="text-lg" aria-hidden="true">👁️</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-24 pt-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Trips</h2>
            {user && (
              <p className="text-sm text-gray-500">Hi, {user.name}! 👋</p>
            )}
          </div>
          <Button
            onClick={() => navigate('/create')}
            size="sm"
            className="shrink-0"
            aria-label="Neue Reise erstellen"
          >
            <Plus size={16} className="mr-1" />
            Erstellen
          </Button>
        </div>

        {trips.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MapPin size={36} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Reisen</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Erstelle deine erste Gruppenreise und lade deine Freunde ein!
            </p>
            <Button onClick={() => navigate('/create')}>
              <Plus size={16} className="mr-2" />
              Erste Reise erstellen
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3" role="list" aria-label="Meine Reisen">
            {trips.map((trip) => (
              <div key={trip.id} role="listitem">
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
