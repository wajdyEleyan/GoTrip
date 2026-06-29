# Spec: Tabs „Management" & „Gruppe"

Design: `docs/intern/specs/2026-06-08-management-gruppe-tabs-design.md`

## FR-1 Gruppe (Mitglieder)
- Kein „Weiter"/StepNav (kein Flow-Sprung von einem Nav-Tab).
- Zeigt: Mitgliederzahl, Mitgliederliste (Avatar, Name, Rolle), Einladen (Link/Code) direkt sichtbar.

## FR-2 Management — Status/Fortschritt (neu)
- Oben Sektion „Status der Gruppe": je Kategorie X/N erledigt — Verfügbarkeit, Präferenzen, Budget, Bewertung.
- X = Anzahl Mitglieder mit Daten; N = `trip.members.length`. Häkchen, wenn X===N.

## FR-3 Management — Reiseziele & Bewertung
- Rangliste (Hybrid-Score) mit Daten-Score % + Gruppen-Ø-Sternen.
- Spitzenreiter (Rang 1) markiert.
- Aufklappbar „KI-Analyse · alle Daten" (Copernicus/GBIF/NASA/Earthdata + Begründung).

## FR-4 Management — Pro Mitglied
- Je Mitglied: Verfügbarkeit (Ja/Vielleicht/Nein), Interessen (+ Sonstiges), Budget, abgegebene Bewertung.

## FR-5 Management — Aktivitäten-Wünsche
- Liste mit Stimmen, wenn vorhanden.

## Erfolgskriterien
- Gruppe ohne „Weiter". Management mit Fortschritt + Spitzenreiter.
- tsc sauber, build grün, bestehende Funktionen unberührt.

## Out of Scope
Eingaben/Bearbeiten in Management (bleibt read-only), Backend-Änderungen.
