# GoTrip — Project Constitution

> Verbindliche Regeln für **alles**, was in GoTrip gebaut wird. Jede neue Funktion,
> jeder Screen, jeder Refactor MUSS diese Prinzipien einhalten. Bei Konflikt gewinnt
> dieses Dokument.

**Version:** 1.0.0 · **Ratified:** 2026-06-01

---

## Prinzip 1 — Die 3-Klick-Regel (NICHT VERHANDELBAR)

**Jede Kernaufgabe ist in höchstens 3 Klicks/Taps abgeschlossen** — gemessen ab dem
Screen, auf dem der Nutzer realistisch startet (i. d. R. Home/Dashboard).

**Was zählt als „Klick":** ein Tap auf einen Button, Link, Tab, eine Karte oder ein
Auswahl-Element, das eine **Navigation oder eine abschließende Aktion** auslöst.
- **Zählt NICHT:** Tippen in ein Textfeld, Scrollen, Wischen, das Verstellen eines
  Sliders, Mehrfachauswahl innerhalb **eines** Schritts (z. B. mehrere Interessen-Chips),
  das Öffnen/Schließen eines Inline-Pickers (Datum) auf demselben Screen.
- Ein „Weiter/Speichern"-Tap, der zum nächsten nötigen Schritt führt, zählt als 1 Klick.

**Kern-Aufgaben & Klick-Budget (Obergrenzen):**
| Aufgabe | Start | max. Klicks |
|---|---|---|
| Neue Reise anlegen | Home | 3 |
| Freunde einladen | Trip | 3 (idealerweise 1–2) |
| Verfügbarkeit eintragen | Trip | 3 |
| Präferenzen setzen | Trip | 3 |
| KI-Empfehlung ansehen | Trip | 2 |
| Für ein Ziel abstimmen | Trip | 2 |
| Aktivität vorschlagen/voten | Trip | 3 |
| Finale Übersicht öffnen | Trip | 2 |
| Sprache / Senioren-Modus wechseln | überall | 2 |

**Konsequenzen für den Bau:**
- Lange Wizards werden zu **einem Screen mit Abschnitten** (Scroll statt Klick-Kette)
  ODER zu einem klar geführten Stepper, der je Schritt **einen** Vorwärts-Tap braucht.
- Häufige Aktionen liegen als **Quick-Action / Shortcut** direkt auf Home/Dashboard.
- Keine Zwischen-Screens, die nur „Weiter" anzeigen. Keine versteckten Tiefen-Menüs.
- Das Trip-Dashboard ist die zentrale Drehscheibe: von dort ist jeder Trip-Screen in **1 Klick** erreichbar.

**Definition of Done (jede UI-Aufgabe):** Klick-Pfad dokumentiert und ≤ Budget. Wird
das Budget überschritten, ist das Feature **nicht** fertig.

---

## Prinzip 2 — Design-System „Variante C" (verbindlich)

Siehe `Projektdoku` & `docs/intern/specs/2026-06-01-gotrip-ui-design.md`.
- Teal `#0F7D8C` als einziger Akzent; Glas-Karten (`.glass-card/.glass-field/.glass-bar`);
  Ambient-Foto-Blur-Hintergrund; Foto-Karten (`.photo-card`) mit Fallback.
- **Lesbarkeit vor Effekt:** Kontrast muss immer ausreichen (Schrift klar lesbar).
- YES/MAYBE/NO bleiben grün/gelb/rot.

## Prinzip 3 — Funktion bleibt erhalten
i18n (DE/EN/ES via `t(...)`), Senioren-Modus, Hybrid-Score
`(llmScore/100)*0.4 + (starsAvg/5)*0.6`, Mock-Fallback (LLM/Copernicus/GBIF),
API-Key nur im Backend. Kein Feature darf diese brechen.

## Prinzip 4 — Mobile-First & Barrierefreiheit
App-Shell ≤ 430px. Touch-Ziele ≥ 44px (Senioren-Modus ≥ 52px). `aria`-Labels,
Tastatur-Bedienbarkeit, Fokus sichtbar.

## Prinzip 5 — Qualität
`npm run build` muss grün sein. Kein Commit ohne ausdrückliche Ansage des Nutzers.
Antworten/Erklärungen auf Deutsch. Auf diesem Windows: PowerShell statt Bash.

---

## Governance
Änderungen an dieser Constitution nur auf ausdrücklichen Wunsch des Nutzers.
Bei Zielkonflikt zwischen „schön" und „wenige Klicks" gewinnt **Prinzip 1**.
