// Autor: Mohamad Haj Ahmad
// src/pages/TripDashboard.tsx — Trip Hub: alle Schritte auf einen Blick
import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { useTripContext } from '@/context/TripContext'
import {
  Users, Calendar, Heart, Sparkles, Star, Zap, Trophy, Wallet, ChevronRight
} from 'lucide-react'

const STEPS = [
  { label: 'Mitglieder',        icon: Users,     path: 'members',        desc: 'Gruppe verwalten & einladen' },
  { label: 'Verfügbarkeit',     icon: Calendar,  path: 'availability',   desc: 'Gemeinsame Termine finden' },
  { label: 'Präferenzen',       icon: Heart,     path: 'preferences',    desc: 'Budget & Interessen eingeben' },
  { label: 'KI-Empfehlung',     icon: Sparkles,  path: 'recommendation', desc: 'Reiseziele von ki-engine analysieren lassen', highlight: true },
  { label: 'Abstimmen',         icon: Star,      path: 'vote',           desc: 'Ziele bewerten & entscheiden' },
  { label: 'Aktivitäten',       icon: Zap,       path: 'activities',     desc: 'Was machen wir dort?' },
  { label: 'Finale Übersicht',  icon: Trophy,    path: 'final',          desc: 'Alles auf einen Blick' },
  { label: 'Budget-Tracker',    icon: Wallet,    path: 'budget',         desc: 'Kosten aufteilen (Splitwise)' },
]

export default function TripDashboard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTripById } = useTripContext()

  const trip = id ? getTripById(id) : undefined

  if (!trip) {
    return (
      <div className="app-shell flex flex-col items-center justify-center min-h-svh px-6 text-center">
        <p className="text-gray-500 mb-4">Reise nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate('/home')}>Zur Übersicht</Button>
      </div>
    )
  }

  return (
    <div className="app-shell flex flex-col min-h-svh bg-gray-50">
      <PageHeader title={trip.name} />

      <main className="flex-1 px-4 py-5 pb-8 overflow-y-auto flex flex-col gap-3">
        {/* Trip Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex justify-between text-sm text-gray-500">
          <span>📅 {trip.startDate} – {trip.endDate}</span>
          <span>💶 {trip.budgetMin}–{trip.budgetMax}€</span>
          <span>👥 {trip.members.length}/{trip.groupSize}</span>
        </div>

        {/* Step tiles */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mt-1">
          Was möchtest du tun?
        </p>

        {STEPS.map(({ label, icon: Icon, path, desc, highlight }) => (
          <button
            key={path}
            onClick={() => navigate(`/trip/${id}/${path}`)}
            className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-all active:scale-[0.98] hover:shadow-md ${
              highlight
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                : 'bg-white border-gray-100 text-gray-900'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              highlight ? 'bg-white/20' : 'bg-primary/10'
            }`}>
              <Icon size={20} className={highlight ? 'text-white' : 'text-primary'} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${highlight ? 'text-white' : 'text-gray-900'}`}>{label}</p>
              <p className={`text-xs mt-0.5 ${highlight ? 'text-white/80' : 'text-gray-400'}`}>{desc}</p>
            </div>
            <ChevronRight size={18} className={highlight ? 'text-white/60' : 'text-gray-300'} />
          </button>
        ))}
      </main>
    </div>
  )
}
