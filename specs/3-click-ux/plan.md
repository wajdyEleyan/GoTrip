# Plan — UX-Vereinfachung „3-Klick-Regel"

**Constitution:** `.specify/memory/constitution.md` · **Spec:** `specs/3-click-ux/spec.md`

## Technischer Kontext
- React 19 + TypeScript + Vite 8, React Router v7, Tailwind v4, Context-API, localStorage.
- Routing in `src/App.tsx` (Trip-Routen unter `/trip/:id/...`).
- Zentrale Drehscheibe: `TripDashboard`. Geteilte Nav: `BottomNav`, `PageHeader`.

## Design-Entscheidungen

### D1 — Zentrale Flow-Definition (`src/utils/flow.ts`) [NEU]
Eine einzige Quelle der Wahrheit für die Planungs-Reihenfolge:
```
PLAN_STEPS = ['members','availability','preferences','recommendation','vote','activities','final']
```
- `nextStepPath(tripId, current)` → Pfad des nächsten Schritts (oder Dashboard nach 'final').
- `firstIncompleteStep(tripId)` → erster Schritt ohne gespeicherte Daten (für Smart-Next).
  Completion-Heuristik über vorhandene Storage-Getter (Preferences/Availability/Votes/Activities);
  nicht-trackbare Views (recommendation) gelten als „offen" bis der Folge-Schritt Daten hat.
- Labels über i18n-Keys (bereits vorhanden: `stepMembers` …).

### D2 — „Weiter →" Footer (`src/components/shared/StepNav.tsx`) [NEU]
Sticky-Footer-Button (Glas/Teal), den **jeder** Planungs-Screen rendert:
- Props: `tripId`, `current`, optional `onBeforeNext` (speichert), optional `label`.
- Klick speichert (falls Callback) und navigiert via `nextStepPath` → **1 Tap pro Schritt** (FR-5).
- Erfüllt zugleich „keine reinen Zwischen-Screens" (FR-8).

### D3 — Kontext-sensitive `BottomNav` [ÄNDERN]
- Erkennt Trip-Kontext über `useLocation`/`matchPath` (`/trip/:id/...`).
- **Im Trip:** Übersicht (`dashboard`) · Kalender (`availability`) · zentral „Weiter/+" · Empfehlung (`recommendation`) · Gruppe (`members`) → je 1 Tap (FR-6).
- **Außerhalb:** Trips (`/home`) · Create (`/create`) wie bisher.
- Aktiver Tab teal, sonst grau; Touch-Ziele ≥ 44px.

### D4 — 1-Klick-Login [ÄNDERN `Login.tsx`]
- Großer Primär-Button „Los geht's / Let's travel" → loggt mit eingegebenem Namen **oder** Default „Gast" ein und navigiert zu `/home`. Namensfeld bleibt optional (Tippen zählt nicht). (FR-1)

### D5 — Smart-Next auf Dashboard [ÄNDERN `TripDashboard.tsx`]
- Oben eine prominente Karte „Weiter: <nächster Schritt>" → `firstIncompleteStep` → 1 Tap (FR-7).
- Die 8 Kacheln bleiben als Direktsprung (FR-4).

### D6 — Trip-Karte = 1 Klick [OK]
- `TripCard` öffnet bei Tap das Dashboard (bereits umgesetzt, FR-2).

## Zu ändernde / neue Dateien
| Datei | Art | Zweck |
|---|---|---|
| `src/utils/flow.ts` | neu | Schritt-Reihenfolge, nextStep, firstIncomplete |
| `src/components/shared/StepNav.tsx` | neu | „Weiter →"-Footer |
| `src/components/shared/BottomNav.tsx` | ändern | Kontext-Nav (Trip vs. global) |
| `src/pages/Login.tsx` | ändern | 1-Klick-Login |
| `src/pages/TripDashboard.tsx` | ändern | Smart-Next-Karte |
| `src/pages/GroupMembers.tsx` | ändern | StepNav „Weiter" |
| `src/pages/Availability.tsx` | ändern | StepNav „Weiter" |
| `src/pages/Preferences.tsx` | ändern | StepNav „Weiter" |
| `src/pages/AIRecommendation.tsx` | ändern | StepNav „Weiter" |
| `src/pages/VoteDecide.tsx` | ändern | StepNav „Weiter" |
| `src/pages/ActivitiesVoting.tsx` | ändern | StepNav „Weiter" (→ Final) |
| `src/i18n/translations.ts` | ändern | Keys: `continue`, `nextStep`, `guest`, Nav-Labels |

## Klick-Pfade (Soll, ≤ Budget)
| Aufgabe | Pfad | Klicks |
|---|---|---|
| Login | „Los geht's" | 1 |
| Trip öffnen | Trip-Karte | 1 |
| Trip anlegen | „+" → „Erstellen" | 2 |
| Verfügbarkeit | Trip → Bottom-Nav „Kalender" → Tag(e) markieren | 2 |
| Präferenzen | Dashboard „Weiter"/Kachel → setzen | 2 |
| Empfehlung ansehen | Trip → Bottom-Nav „Empfehlung" | 2 |
| Abstimmen | Trip → Bottom-Nav „Empfehlung"/„Vote" → Stimme | 2 |
| Aktivität voten | Kachel/Weiter → 👍 | 2 |
| Final | „Weiter" am Ende der Kette | 1 (pro Schritt) |
| Sprache/Senioren | Header-Menü → Auswahl | 2 |
| Ganze Planung | Dashboard „Weiter" → je 1 Tap/Schritt | 7 statt ~14+ |

## Risiken / Hinweise
- Storage-Getter für Completion müssen geprüft werden (Fallback: Schritt gilt als offen).
- BottomNav darf bestehende `t()`-Keys nutzen; neue Keys in alle 3 Sprachen.
- Build muss grün bleiben; keine Logik der Score-/Voting-Funktionen ändern.
