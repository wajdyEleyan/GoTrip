# Tasks — UX-Vereinfachung „3-Klick-Regel"

Constitution: `.specify/memory/constitution.md` · Spec/Plan im selben Ordner.
Format: `- [ ] [ID] Beschreibung (Datei)`

## Phase 1 — Setup / Foundational
- [ ] T1 Storage-Getter prüfen (Availability/Votes/Activities/Preferences) zur Completion-Erkennung (`src/utils/storage.ts`, nur lesen)
- [ ] T2 i18n-Keys ergänzen: `continue`, `nextStep`, `guestStart`, `navOverview`, `navCalendar`, `navRecommendation`, `navGroup` in DE/EN/ES (`src/i18n/translations.ts`)
- [ ] T3 Flow-Util erstellen: `PLAN_STEPS`, `nextStepPath`, `firstIncompleteStep` (`src/utils/flow.ts`)
- [ ] T4 `StepNav`-Footer-Komponente „Weiter →" (`src/components/shared/StepNav.tsx`)

## Phase 2 — Navigation (FR-1, FR-2, FR-6, FR-7)
- [ ] T5 Kontext-sensitive `BottomNav` (Trip vs. global) (`src/components/shared/BottomNav.tsx`)
- [ ] T6 1-Klick-Login „Los geht's" (Gast-Default) (`src/pages/Login.tsx`)
- [ ] T7 Smart-Next-Karte oben im Dashboard (`src/pages/TripDashboard.tsx`)

## Phase 3 — Weiter-Kontinuität je Planungs-Screen (FR-5, FR-8)
- [ ] T8 `GroupMembers`: StepNav „Weiter" → availability (`src/pages/GroupMembers.tsx`)
- [ ] T9 `Availability`: StepNav „Weiter" → preferences (`src/pages/Availability.tsx`)
- [ ] T10 `Preferences`: StepNav „Weiter" → recommendation (`src/pages/Preferences.tsx`)
- [ ] T11 `AIRecommendation`: StepNav „Weiter" → vote (`src/pages/AIRecommendation.tsx`)
- [ ] T12 `VoteDecide`: StepNav „Weiter" → activities (`src/pages/VoteDecide.tsx`)
- [ ] T13 `ActivitiesVoting`: StepNav „Weiter" → final (`src/pages/ActivitiesVoting.tsx`)

## Phase 4 — Verifikation / Politur (Erfolgs-Kriterien)
- [ ] T14 Klick-Pfade manuell nachzählen, in `plan.md` bestätigen (≤ Budget)
- [ ] T15 `npm run build` grün; i18n/Senioren-Modus/Score unverändert
- [ ] T16 App im Browser gegen die 4 Nutzer-Szenarien prüfen

## Abhängigkeiten
T1→T3 ; T2→{T4,T5,T6,T7} ; T3→{T4,T7,T8–T13} ; T4→{T8–T13} ; T5/T6/T7 parallel ; T8–T13 parallel ; danach T14–T16.
