# Spec — UX-Vereinfachung „3-Klick-Regel"

**Feature-Verzeichnis:** `specs/3-click-ux`
**Datum:** 2026-06-01 · **Constitution:** `.specify/memory/constitution.md`

## Überblick
GoTrip fühlt sich „klicklastig" an: die Reiseplanung ist eine lange Kette aus 8 getrennten
Screens, zwischen denen man über das Dashboard zurückspringt. Ziel: **jede Kernaufgabe in
≤ 3 Klicks** (Constitution, Prinzip 1) und ein durchgängiger, geführter Fluss ohne Umwege.

## Ist-Analyse (Klick-Audit)
- **Login:** Name tippen + „Login" → Home. (Tippen zählt nicht; 1 Klick) ✅ – aber Gast-Start fehlt.
- **Trip öffnen:** Home → Trip-Karte → Dashboard (1 Klick) ✅
- **Planungs-Schritt:** Dashboard → Kachel → Screen → Aktion = 2–3 Klicks ab Dashboard, aber
  **kein „Weiter"** zum nächsten Schritt → Nutzer muss zurück zum Dashboard (= +1 Klick je Schritt).
- **Bottom-Nav:** nur „Trips" + „Create" — keine 1-Tap-Sprünge zu Kalender/Empfehlung/Gruppe.
- **Gesamte Planung:** gefühlt sehr viele Klicks, weil 8× Dashboard↔Screen.

## Funktionale Anforderungen (testbar)

- **FR-1 (Login ≤ 1 Klick):** Auf dem Welcome/Login-Screen führt **ein** Tap auf „Let's travel/Los"
  zur Home (Gast-Login mit Default-Name möglich; Namensfeld optional). *Test:* Von Login zu Home in 1 Klick.
- **FR-2 (Trip öffnen = 1 Klick):** Tap auf eine Trip-Karte öffnet das Dashboard. *Test:* Home→Dashboard = 1 Klick.
- **FR-3 (Trip anlegen ≤ 3 Klicks):** Home → „+" (1) → Formular ausfüllen (Tippen/Slider zählt nicht) →
  „Reise erstellen" (2) → Dashboard. *Test:* ≤ 2 Klicks ab Home.
- **FR-4 (Jeder Schritt 1 Klick ab Dashboard):** Jede der 8 Kacheln öffnet ihren Screen in 1 Klick. ✅ (halten)
- **FR-5 (Weiter-Kontinuität):** Jeder Planungs-Screen hat einen **„Weiter →"**-Button, der die Aktion
  speichert und direkt zum **nächsten sinnvollen Schritt** navigiert (Members→Availability→Preferences→
  Recommendation→Vote→Activities→Final). Kein Rücksprung zum Dashboard nötig. *Test:* Kompletter
  Durchlauf = 1 Tap pro Schritt.
- **FR-6 (Kontext-Bottom-Nav):** Innerhalb eines Trips zeigt die Bottom-Nav 1-Tap-Ziele:
  **Übersicht (Dashboard) · Kalender (Availability) · Empfehlung · Gruppe** + zentralen „+/Weiter".
  Außerhalb eines Trips: **Trips · Create**. *Test:* Von jedem Trip-Screen zu diesen Zielen in 1 Klick.
- **FR-7 (Smart-Next auf Dashboard):** Das Dashboard zeigt **eine** prominente „Weiter: <nächster Schritt>"-
  Aktion, die zum ersten unerledigten Schritt springt. *Test:* Planung fortsetzen in 1 Klick.
- **FR-8 (Keine reinen Zwischen-Screens):** Es gibt keinen Screen, dessen einzige Funktion „Weiter"-Anzeige ist.
- **FR-9 (Klick-Pfad dokumentiert):** Für jede Kernaufgabe ist der Pfad in `plan.md` notiert und ≤ Budget
  (Constitution-Tabelle).

## Nutzer-Szenarien (Ziel-Klick-Pfade)
1. **Schnell eine Reise planen:** Home → „+" → „Erstellen" → (Dashboard) „Weiter" → je 1 Tap durch die Schritte.
2. **Direkt abstimmen:** Home → Trip → Bottom-Nav „Empfehlung"/„Vote" (≤ 2 Klicks). 
3. **Verfügbarkeit eintragen:** Home → Trip → Bottom-Nav „Kalender" → Tage markieren (≤ 2 Klicks bis zum Eintragen).
4. **Freund einladen:** Trip → „Einladen" → „Link kopieren" (≤ 2 Klicks).

## Erfolgs-Kriterien (messbar)
- Alle Aufgaben aus der Constitution-Tabelle erfüllen ihr Klick-Budget (manuell nachgezählt, in `plan.md` belegt).
- Kompletter Planungs-Durchlauf ab Dashboard: **1 Klick pro Schritt** (7 Schritte = 7 Klicks statt vorher ~14+).
- `npm run build` grün; i18n/Senioren-Modus/Hybrid-Score unverändert funktionsfähig.
- Keine Funktionalität entfernt; nur Navigation/Flow vereinfacht.

## Nicht im Scope
- Keine neue Backend-Logik, keine Änderung der Score-Formel, kein Redesign der Farben (Variante C bleibt).

## Offene Annahmen (informierte Defaults)
- Gast-Login nutzt vorhandenen Mock-Auth (Default-Name „Gast", falls leer).
- „Nächster Schritt" wird heuristisch bestimmt (erster Schritt ohne gespeicherte Daten).
