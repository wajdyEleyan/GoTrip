// Autor: Eya Mathlouthi
// src/pages/CreateTrip.tsx — Screen 3: Neue Reise erstellen
import { PageHeader } from '@/components/shared/PageHeader'
import { TripForm } from '@/components/trips/TripForm'

export default function CreateTrip() {
  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title="Create New Trip" />
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <TripForm />
      </main>
    </div>
  )
}
