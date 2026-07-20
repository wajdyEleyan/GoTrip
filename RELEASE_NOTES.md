# GoTrip – Release Notes

**Projekt:** GoTrip – KI-gestützte Gruppenreiseplanung  
**Modul:** Mensch-Computer-Interaktion (HCI) – SoSe 2026  
**Hochschule:** h_da – Hochschule Darmstadt

---

## v1.3.0 – 2026-07-20 (Aktueller Stand)

### Neue Features
- **Dynamischer KI-Score:** Score wird bei jeder Anzeige live mit den aktuellen Gruppenpräferenzen neu berechnet – kein veralteter gecachter Wert mehr. Frankfurt + Strand-Präferenz → niedriger Score, weil Frankfurt im Binnenland liegt.
- **`coastal` und `population` gespeichert:** Beim Analysieren eines Reiseziels werden Küstenlage und Einwohnerzahl dauerhaft im Ziel-Objekt gespeichert, damit spätere Neuberechnungen ohne neue API-Calls möglich sind.
- **Dynamische Begründung:** „Warum dieser Score?" zeigt jetzt die Begründung basierend auf den aktuellen Präferenzen, nicht mehr auf den Präferenzen zum Zeitpunkt der ersten Analyse.

### Bug-Fixes
- **WheelDatePicker:** Datum ging beim ersten Versuch verloren, wenn der Nutzer vom Start- zum End-Wheel wechselte (100 ms Debounce-Timer wurde abgebrochen beim Unmount). Fix: `pendingVal`-Ref speichert letzten Scroll, `useEffect`-Cleanup feuert `onSelect` beim Unmount.
- **StarRating – Bewertung übernahm sich auf andere Ziele:** SVG `clipPath`-IDs waren global identisch (`half-1` bis `half-5`). Fix: `useId()` (React 18+) erzeugt pro Instanz eindeutige IDs.
- **StarRating – Reset-Button zeigte falsche Sterne:** Gleicher clipPath-Bug zeigte leere Sterne trotz gesetztem Wert. Behoben durch eindeutige IDs.

---

## v1.2.0 – 2026-07-15

### Neue Features
- **KI-Daten aus Management-Seite entfernt:** KI-Analyse-Daten (Klima, NASA, Biodiversität, Begründung) erscheinen jetzt nur noch auf der KI-Seite, nicht mehr doppelt auf der Übersicht-Seite.
- **DestinationCard + VotingCard zusammengeführt:** Es gibt jetzt nur noch eine einzige Karte pro Reiseziel – mit KI-Daten, Score-Ring und Sterne-Bewertung in einem.
- **Navigation umbenannt:** „Übersicht" → „Startseite", „Management" → „Übersicht" (alle 3 Sprachen).
- **StarRating – Normales Hover-Klick-Verhalten:** Sterne leuchten beim Überfahren auf (kein Toggle mehr). Separat: ↺-Reset-Button erscheint neben den Sternen, wenn eine Bewertung gesetzt ist.

### Bug-Fixes
- TypeScript-Fehler in `AIRecommendation.tsx`: `onVoteClick`-Prop nach Zusammenführung der Karten entfernt.

---

## v1.1.0 – 2026-07-10

### Neue Features
- **Globale Benachrichtigungen:** Toast-Meldungen erscheinen auf allen Seiten der App, nicht mehr nur auf der Dashboard-Seite. Implementiert via `GlobalSync`-Komponente in `App.tsx`.
- **Erweiterte Benachrichtigungen:** Alle Mitglieder-Aktionen lösen Benachrichtigungen aus – Verfügbarkeit, Präferenzen, Budget, Ausgaben, Reiseziel-Bewertungen.
- **Rote Badges (zuverlässig):** 4-Sekunden-Intervall als Fallback + `gotrip-sync`-Event-Listener. Count-basiertes Badge-Tracking via `getVisitCount`/`saveVisitCount` in localStorage.
- **Toast-Dauer verkürzt:** Benachrichtigungen verschwinden nach 2 Sekunden (vorher länger).
- **„Budget" statt „Budget-Tracker":** Button-Beschriftung in allen 3 Sprachen vereinfacht.

---

## v1.0.0 – 2026-06-28 (Meilenstein 3 Basis)

### Deployment & Infrastruktur
- **Render.com Deployment:** App unter https://gotrip-9id7.onrender.com erreichbar. Frontend-Build wird vom Express-Server ausgeliefert (ein Service).
- **Neon PostgreSQL:** Cloud-Datenbank für Gruppensynchronisation. Verbindungsstring via `server/.env` (nicht im Repository).
- **CORS für Production:** Server erlaubt alle Origins in Production (`NODE_ENV=production`).
- **GitHub:** Code veröffentlicht unter https://github.com/mo518525/Trip-Planer

### Echtzeit-Synchronisation
- **HTTP-Polling alle 6 Sekunden:** Alle Mitglieder einer Reise erhalten automatisch die neuesten Daten.
- **`TripBundle`-Sync:** Verfügbarkeit, Präferenzen, Reiseziele, Votes, Aktivitäten, Ausgaben, Itinerary werden gebündelt synchronisiert.
- **`scheduleSync()`:** Debounced Push nach jeder localStorage-Änderung.

### KI-Empfehlung
- **Keine Mock-Daten mehr:** Alle Scores basieren auf echten API-Daten. Kein Fallback auf Mock-Werte.
- **5 Datenquellen:** Copernicus ERA5 (Klima), GBIF (Biodiversität), NASA POWER (Sonne/Wind/Feuchte), NASA Earthdata (Satelliten), Open-Meteo Marine (Küste).
- **Score-Engine:** Regelbasierte Bewertung (kein LLM): Klimakomfort 40% + Interessenerfüllung 60%.
- **Hybrid-Score:** `(llmScore / 100) × 0,4 + (starsAvg / 5) × 0,6`
- **Score-Ring:** SVG-Komponente mit Farbkodierung (Grün ≥80%, Lila ≥60%, Amber ≥40%, Rot <40%).

---

## v0.4.0 – 2026-06-10 (Sprint 4)

### Neue Features
- **Sterne-Bewertung:** 0,5–5,0 in 0,5-Schritten via Maus-Position (Half-Star). WCAG-konform mit aria-labels.
- **Aktivitäten-Voting:** Aktivitäten vorschlagen, Thumbs-up vergeben, sortiert nach Popularität.
- **Budget-Tracker:** Ausgaben pro Mitglied erfassen, Gesamtsumme und Aufschlüsselung.
- **Reiseplan (Itinerary):** Zeitslots für jeden Tag der Reise.
- **Final-Overview:** Gewinner-Reiseziel, Statistiken, Top-Aktivitäten, Mitgliederliste.
- **Mehrsprachigkeit:** Deutsch, Englisch, Spanisch – alle UI-Texte in `translations.ts`.

---

## v0.3.0 – 2026-05-25 (Sprint 3)

### Neue Features
- **KI-Empfehlung (erste Version):** Reiseziele vorschlagen, Klimadaten und Biodiversitätsdaten abrufen.
- **Copernicus ERA5:** Echte historische Klimadaten via Open-Meteo Archive API.
- **GBIF:** Echte Biodiversitätsdaten (Artenvielfalt pro Land).
- **NASA POWER:** Sonneneinstrahlung, Luftfeuchte, Windgeschwindigkeit.
- **Geocoding:** Koordinaten + Einwohnerzahl via Open-Meteo Geocoding.
- **DataSourceBadges:** Zeigt welche echten Datenquellen verwendet wurden.
- **Loading-Skeleton:** `DestinationSkeleton` während KI-Analyse läuft.

---

## v0.2.0 – 2026-05-10 (Sprint 2)

### Neue Features
- **Verfügbarkeits-Kalender:** Toggle-Zyklus Verfügbar → Vielleicht → Nicht verfügbar → Leer.
- **Gruppen-Heatmap:** Farbkodierte Übersicht aller Mitglieder-Verfügbarkeiten.
- **Gemeinsame freie Tage:** Automatisch berechnet aus allen Verfügbarkeiten.
- **Präferenzen:** Budget-Picker + 9 Interessen-Chips (Strand, Stadt, Natur, Abenteuer, Kultur, Nachtleben, Entspannung, Kulinarik, Shopping).
- **WheelDatePicker:** iOS-ähnlicher Datum-Picker (Tag, Monat, Jahr).
- **Management-Seite:** Schlussfolgerung aus allen Gruppendaten (gemeinsamer Zeitraum, Budget, Interessen).

---

## v0.1.0 – 2026-04-28 (Sprint 1)

### Neue Features
- **Projekt-Setup:** React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + React Router v7.
- **GoTrip-Theme:** Primärfarbe Petrol (#0F7D8C), Erfolgsgrün, mobile-first (max-width 430px).
- **Mock-Login:** Name eingeben, kein Account oder Passwort nötig.
- **Trip erstellen:** Name, Zeitraum, Budget, Gruppenname mit Zod-Validierung.
- **Einladungslink:** 6-stelliger eindeutiger Code (Base-57-Alphabet), kein ähnliche Zeichen (0/O, 1/l).
- **Share-Funktion:** WhatsApp, Web-Share-API (mobile), Clipboard-Fallback.
- **Gruppenmitglieder:** Beitreten via Einladungslink, Admin-Rolle.
- **BottomNav:** Navigationsleiste mit Badge-Anzeige für ungesehene Änderungen.
- **Context API:** `AuthContext` (Authentifizierung) + `TripContext` (Trip-CRUD).
