// src/components/shared/TripScreen.tsx
// Gemeinsames Layout für alle Trip-Seiten: heller Foto-Hintergrund (Bild bleibt
// unter hellem Schleier), heller Header MIT Zurück-Button und die helle Bottom-Nav.
// So sehen Dashboard, Management und alle Planungs-Schritte einheitlich aus.
import type { ReactNode } from 'react'
import { PageHeader } from './PageHeader'
import { BottomNav } from './BottomNav'
import { TRIP_BG } from '@/utils/destinationImage'

interface TripScreenProps {
  title: string
  /** Ziel des Zurück-Buttons (Default: Browser-zurück). */
  backTo?: string
  rightSlot?: ReactNode
  children: ReactNode
}

export function TripScreen({ title, backTo, rightSlot, children }: TripScreenProps) {
  return (
    <div className="app-shell relative flex flex-col min-h-svh overflow-hidden">
      {/* Heller Foto-Hintergrund: am Viewport fixiert (wächst NICHT mit der Seite),
          Schleier unten deckend → unterer Rand bleibt immer weiß, egal wie weit gescrollt. */}
      <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: TRIP_BG, filter: 'blur(2px)', transform: 'scale(1.08)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/65 via-white/92 to-white" />
      </div>

      <div className="relative z-10 flex flex-col min-h-svh">
        <PageHeader title={title} backTo={backTo} transparent onLight rightSlot={rightSlot} />
        {children}
        <BottomNav />
      </div>
    </div>
  )
}
