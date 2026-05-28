# GoTrip – Gruppen-Reiseplanung mit KI-Unterstützung

**Modul:** Mensch-Computer-Interaktion (HCI) – SoSe 2026, Meilenstein 3 (Implementierung)  
**Hochschule:** h_da – Hochschule Darmstadt  
**Team:** Mohamad Haj Ahmad · Wajdy Eleyan · Amal Najah · Eya Mathlouthi

---

## Über GoTrip

GoTrip ist eine mobile Web-App, mit der Gruppen gemeinsam Reisen planen können. Die KI empfiehlt Reiseziele basierend auf Klimadaten, Gruppenpräferenzen und einem LLM-gestützten Analyse-Score.

### Kern-Features

| Screen | Feature |
|--------|---------|
| 1 | Login (Mock-Auth, kein Account nötig) |
| 2 | My Trips – Übersicht aller Reisen |
| 3 | Trip erstellen (Name, Zeitraum, Budget, Gruppengröße) |
| 4 | Freunde einladen (Link, WhatsApp, Instagram, Web-Share) |
| 5 | Gruppenmitglieder verwalten |
| 6 | Verfügbarkeits-Kalender (Available / Maybe / Not available) |
| 7 | Präferenzen (Budget, Interessen-Chips, Zeitraum-Wunsch) |
| 8 | KI-Empfehlung (Hybrid-Score: KI×40% + Sterne×60%) |
| 9 | Vote & Decide (Sterne 0,5–5,0 pro Reiseziel) |
| 10 | Final Trip Overview (Gewinner, Statistiken, Top-Aktivitäten) |
| 11 | Aktivitäten-Voting (Vorschläge hinzufügen + Thumbs-up) |

---

## Tech-Stack

| Schicht | Technologie |
|---------|------------|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router v7 |
| Formulare | React Hook Form + Zod |
| UI-Komponenten | Eigene Komponenten (shadcn-Stil) + lucide-react |
| State | React Context API (AuthContext, TripContext) |
| Persistenz | localStorage (Mock-Backend) |
| Backend-Proxy | Express.js auf Port 3001 |
| LLM | Anthropic Claude (claude-haiku-4-5) via Backend-Proxy |
| Klimadaten | Copernicus ERA5 (Priorität 1) · Mock-Fallback |
| Biodiversität | GBIF API (Priorität 2) · Mock-Fallback |

---

## Installation & Start

### Voraussetzungen

- Node.js ≥ 18
- npm ≥ 9

### Frontend starten

```bash
# In den gotrip-Ordner wechseln
cd gotrip

# Abhängigkeiten installieren (nur einmalig)
npm install

# Entwicklungsserver starten
npm run dev
```

Dann im Browser: **http://localhost:5173**

### Backend-Proxy starten (für KI-Features)

```bash
# In einem zweiten Terminal
cd gotrip/server

# Abhängigkeiten installieren (nur einmalig)
npm install

# API-Key konfigurieren
cp .env.example .env
# Dann ANTHROPIC_API_KEY in server/.env eintragen

# Server starten
node index.js
```

> **Hinweis:** Das Frontend funktioniert auch **ohne** laufendes Backend — alle KI-Scores fallen automatisch auf realistische Mock-Daten zurück.

### Produktions-Build

```bash
cd gotrip
npm run build
# Build liegt in gotrip/dist/
```

---

## Projektstruktur

```
gotrip/
├── src/
│   ├── components/
│   │   ├── activities/     # ActivityCard
│   │   ├── calendar/       # AvailabilityCalendar, GroupHeatmap
│   │   ├── members/        # InviteLink, MemberCard, MemberList
│   │   ├── preferences/    # BudgetSlider, InterestChips, PreferencesForm
│   │   ├── recommendations/# DestinationCard, AddDestinationForm, ScoreRing
│   │   ├── shared/         # PageHeader, BottomNav, Toast, SkeletonCard, ErrorState
│   │   ├── trips/          # TripCard, TripForm, BudgetRangeInput, GroupSizeStepper
│   │   ├── ui/             # Button, Input, Label, Card, Sonner
│   │   └── voting/         # StarRating, VotingCard
│   ├── context/
│   │   ├── AuthContext.tsx  # Mock-Authentifizierung
│   │   └── TripContext.tsx  # Trip-State + CRUD
│   ├── pages/              # Alle 12 Screens (Login → FinalOverview)
│   ├── services/
│   │   ├── llmService.ts   # LLM-Aufruf mit Mock-Fallback
│   │   └── mock/           # mockLLM, mockCopernicus, mockGBIF
│   ├── types/              # TypeScript-Interfaces (trip, destination, activity, …)
│   └── utils/              # storage, scoring, linkGenerator, tripSchema
├── server/
│   ├── index.js            # Express-Proxy für Anthropic API
│   ├── .env.example        # API-Key-Template
│   └── package.json
├── vite.config.ts
└── README.md
```

---

## Hybrid-Score-Formel (NON-NEGOTIABLE)

```
hybridScore = (llmScore / 100) × 0.4 + (starsAvg / 5) × 0.6
```

- **LLM-Score (0–100):** Anthropic Claude bewertet das Reiseziel basierend auf Klimadaten, Präferenzen und Reisezeitraum
- **Sterne-Durchschnitt (0–5):** Gruppenabstimmung in 0,5-Schritten (WCAG-konform)
- **Score-Ring-Farben:** Grün ≥80% · Violett ≥60% · Amber ≥40% · Rot <40%

---

## Datenschutz & Sicherheit

- **API-Key niemals im Frontend** — ausschließlich in `server/.env` (nicht committed)
- Kein Tracking, keine Cookies, DSGVO-konform
- Alle Daten bleiben im Browser (localStorage) — kein echtes Backend in der Basis-Version
- `server/.env` ist in `.gitignore` eingetragen

---

## Autoren-Tags

Jede Datei enthält einen `// Autor:` Tag gemäß MS3-Anforderung:

| Datei-Bereich | Autor |
|---------------|-------|
| Backend, Storage, Scoring, LLM-Integration | Mohamad Haj Ahmad |
| Routing, VoteDecide, Heatmap, Context | Wajdy Eleyan |
| UI-Komponenten, DestinationCard, Recommendations | Amal Najah |
| Sterne-Voting, Forms, Preferences, Login | Eya Mathlouthi |

---

## Release Notes

### v1.0.0 – 2026-05-28 (Meilenstein 3 Abgabe)

#### Sprint 0 – Setup & Architektur
- React 19 + Vite 8 + TypeScript + Tailwind CSS v4 aufgesetzt
- Routing mit React Router v7 + Auth-Guard eingerichtet
- GoTrip-Theme-Tokens definiert (`#6C63FF`, `#22C55E`)
- shadcn-style UI-Komponenten manuell erstellt (Button, Input, Label, Card)

#### Sprint 1 – Core: Trip + Auth + Members
- Mock-Login (Name-Eingabe, kein Account nötig)
- Trip-Erstellung mit Zod-Validierung (Datum-Cross-Validation, Budget-Prüfung)
- Eindeutiger 6-stelliger Einladungslink (Base-57-Alphabet)
- Share via WhatsApp, Instagram, Web-Share-API
- Mitglieder-Verwaltung mit Avatar-Farben

#### Sprint 2 – Availability + Preferences
- Verfügbarkeits-Kalender (Available / Maybe / Not available, Toggle-Zyklus)
- Gruppen-Heatmap mit Farbkodierung (grün = alle verfügbar)
- Präferenzen: Budget-Slider + 9 Interessen-Chips

#### Sprint 3 – KI-Empfehlung
- Anthropic Claude API via Backend-Proxy (Port 3001)
- Copernicus ERA5 Echtdaten via Open-Meteo Historical API (Temperatur, Niederschlag, Sonnenstunden)
- GBIF Biodiversitäts-Echtdaten (Artenvorkommen per Land)
- Automatischer Mock-Fallback wenn Backend nicht erreichbar
- Hybrid-Score-Berechnung (40% LLM + 60% Sterne)
- Score-Ring SVG-Komponente

#### Sprint 4 – Voting + Aktivitäten + Final
- Sterne-Bewertung 0,5–5,0 in 0,5-Schritten (Half-Star via Mouse-Position)
- VoteDecide-Screen mit Sterne-Voting pro Reiseziel
- Aktivitäten-Voting (Hinzufügen + Thumbs-up)
- Final-Overview mit Gewinner-Ziel, Stats-Grid, Top-Aktivitäten, Mitgliederliste

#### Sprint 5 – Polish & Abgabe
- Loading-Skeleton-Komponenten (`DestinationSkeleton`, `TripCardSkeleton`)
- ErrorState-Komponente für konsistente Fehlermeldungen
- Onboarding-Schritte auf Login-Screen
- Accessibility-Pass: aria-labels, role-Attribute, Keyboard-Navigation
- README + Release Notes vollständig

---

## Externe Datenquellen

| Quelle | Priorität | Verwendung | Fallback |
|--------|-----------|-----------|---------|
| [Copernicus ERA5](https://www.copernicus.eu/en/access-data) | 1 | Klimadaten (Temp, Regen, Sonne) | mockCopernicus.ts |
| [GBIF](https://www.gbif.org/) | 2 | Biodiversitäts-Score | mockGBIF.ts |
| [NASA Earthdata](https://www.earthdata.nasa.gov/) | 3 | Satellitendaten (Backlog) | – |
| [Anthropic Claude](https://www.anthropic.com/) | – | LLM-Reiseziel-Analyse | mockLLM.ts |

---

## Bekannte Einschränkungen (MS3-Scope)

- Kein echtes User-Backend (Authentifizierung ist Mock via localStorage)
- Keine Echtzeit-Synchronisation zwischen Geräten
- Copernicus ERA5 und GBIF: Echtdaten via Open-Meteo Archive API und GBIF Occurrence API
- Instagram-Share öffnet nur eine Info (Instagram hat keine Web-Share-API)
- Keine echten Push-Notifications

---

## Abgabe-Checkliste

- [x] Code sauber strukturiert mit Autoren-Tags
- [x] README mit Installation, Architektur, Release Notes
- [x] Hybrid-Score-Formel korrekt implementiert
- [x] Sterne-Voting 0,5–5,0 in 0,5-Schritten
- [x] Mock-Fallback für alle externen APIs
- [x] API-Key nur im Backend (`server/.env`)
- [x] `node_modules` nicht in der Abgabe
- [x] App läuft auf Chrome, Firefox, Edge (Mobile-First 380px)
