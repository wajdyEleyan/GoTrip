// src/pages/CreateTrip.tsx
import { PageHeader } from '@/components/shared/PageHeader'
import { TripForm } from '@/components/trips/TripForm'
import { useLanguage } from '@/context/LanguageContext'

export default function CreateTrip() {
  const { t } = useLanguage()
  return (
    <div className="app-shell flex flex-col min-h-svh bg-white">
      <PageHeader title={t('createNewTrip')} backTo="/home" />
      <main className="flex-1 px-4 py-6 overflow-y-auto">
        <TripForm />
      </main>
    </div>
  )
}
