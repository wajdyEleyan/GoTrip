# Spec: Auth-Redesign — Ein Startscreen mit Anmelden / Registrieren

**Feature-Verzeichnis:** `specs/auth-redesign` · **Datum:** 2026-06-08
**Volldesign:** `docs/intern/specs/2026-06-08-gotrip-auth-redesign-design.md`

## Überblick
GoTrip bekommt EINEN Startscreen (Willkommen = Login) mit zwei Modi: **Anmelden** (bestehender
Benutzername) und **Registrieren** (Benutzername, optional + Einladungscode). Identität ist der
**eindeutige Username**, **passwortlos**. Reisen hängen serverseitig am Konto (`codes[]`) und
erscheinen geräteübergreifend unter **„Meine Reisen"**. Registrierte Nutzer können in der App
jederzeit einen Einladungscode eingeben, um einer Reise beizutreten. Ohne Server/DB läuft die App
weiter (lokaler Fallback).

## Funktionale Anforderungen

### FR-1 Ein Startscreen, zwei Modi
- App-Start zeigt genau einen Screen (Hero + Modus-Umschalter **Anmelden | Registrieren**).
- Moduswechsel erfolgt inline (kein Seitenwechsel, gleiche URL).

### FR-2 Anmelden (Sign in)
- Eingabe: Benutzername.
- Existiert das Konto → eingeloggt; alle Reisen des Kontos werden geladen.
- Existiert es nicht → Inline-Fehler **„Noch nicht registriert"** (kein Konto wird angelegt).

### FR-3 Registrieren (Sign up)
- Eingabe: Benutzername + **optionaler** Einladungscode.
- Name bereits vergeben → Inline-Fehler **„Name bereits vergeben"** (kein Login).
- Sonst: Konto wird angelegt, Nutzer ist eingeloggt.
- Mit gültigem Code: Nutzer tritt der Reise sofort bei (wird Mitglied), Code hängt am Konto.
- Mit ungültigem Code: Inline-Fehler **„Code ungültig"**; es wird **kein** Konto angelegt.

### FR-4 Eingeloggter Startscreen
- Derselbe Screen zeigt nach Login: Begrüßung + Buttons **„Neue Reise erstellen"**,
  **„Meine Reisen"**, **„Code eingeben"**.

### FR-5 Meine Reisen
- „Meine Reisen" öffnet ein eigenes Sheet/Seite mit den Reisen des Kontos als Kacheln.
- Reisen stammen aus den `codes[]` des Kontos (server-geladen) + lokalem Cache.

### FR-6 Code in der App eingeben
- Eingeloggter Nutzer gibt Einladungscode ein → Beitritt → Code wird ans Konto gehängt →
  Reise erscheint unter „Meine Reisen" (auch auf anderen Geräten nach Anmeldung).
- Gültigkeit wird geprüft; ungültiger Code → Fehler.

### FR-7 Eindeutige Usernames
- Zwei Konten mit gleichem Username sind unmöglich (DB-PrimaryKey `username`).

### FR-8 Wiederverwendbare Beitritts-Logik
- Register+Code, In-App-Code und `/join/:code` nutzen **eine** gemeinsame Funktion
  `joinTripByCode(code, user)` (pull → addMember → attachCode → refresh). Keine Duplikate.

### FR-9 Offline-/Server-Fallback
- Kein erreichbarer Server/DB → kein harter Fehler; Nutzer kommt lokal rein (ohne echte
  „existiert?"-Prüfung), Reisen nur lokal.

## Backend-Vertrag
- **`POST /api/register {username, code?}`**
  - Code zuerst validieren (falls vorhanden): Reise existiert? Nein → `404 {error:'badcode'}`.
  - `INSERT users(username)`; Konflikt → `409 {error:'taken'}`.
  - Code an `codes` anhängen (distinct). → `200 {username, codes}`.
- **`POST /api/signin {username}`**
  - Konto vorhanden? Nein → `404 {error:'notfound'}`. Ja → `200 {username, codes}`.
- **`POST /api/users/:username/codes {code}`** (Bestand) — Code ans Konto hängen.
- `POST /api/login` wird entfernt (Aufrufer auf register/signin umgestellt).

## User-Szenarien
1. **Neuer Nutzer ohne Code:** Registrieren mit „lena" → eingeloggt, leere „Meine Reisen", erstellt neue Reise.
2. **Neuer Nutzer mit Code:** Registrieren „tom" + Code „AB12CD" → tritt Reise bei → unter „Meine Reisen" sichtbar.
3. **Rückkehrer:** Anmelden „lena" auf neuem Gerät → sieht ihre Reisen.
4. **Tippfehler beim Anmelden:** „lenaa" → „Noch nicht registriert".
5. **Name vergeben:** Registrieren „lena" → „Name bereits vergeben".
6. **In-App beitreten:** eingeloggte „lena" gibt Code ein → Reise erscheint unter „Meine Reisen".
7. **Offline:** kein Server → „lena" kommt lokal rein.

## Erfolgskriterien (testbar)
- Szenarien 1–7 verhalten sich wie beschrieben.
- Doppelter Username serverseitig unmöglich (409).
- Ungültiger Code legt kein Konto an.
- `npx tsc --noEmit` fehlerfrei, `npm run build` grün.
- Bestehende Funktionen unverändert: i18n, Score-Engine, Trip-Sync, Senioren-Modus.

## Out of Scope (YAGNI)
Passwörter/PIN, E-Mail, OAuth, Konto-Löschung/Umbenennung, Avatare.
