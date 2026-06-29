# Plan: Auth-Redesign

Bezug: `specs/auth-redesign/spec.md`. Stack: React 19 + TS + Vite + Tailwind v4; Express + Postgres (Neon).

## Technischer Ansatz
- Identität = `auth.id == username` (eindeutig). Passwortlos.
- Zwei Backend-Endpoints ersetzen das auto-anlegende `/api/login`:
  `POST /api/register` (anlegen, 409 bei Konflikt, optional Code), `POST /api/signin` (nur lesen, 404 wenn fehlt).
- Frontend: ein gemeinsamer Beitritts-Helper, AuthContext mit `signIn`/`register`, Home als einziger Startscreen mit Modus-Umschalter + eingeloggtem Zustand, „Meine Reisen"-Sheet, „Code eingeben".
- Offline-Fallback bleibt (Service-Funktionen geben bei Netzfehler `{ok:false, error:'offline'}` → AuthContext lässt lokal rein).

## Komponenten / Schnittstellen
1. **server/index.js**
   - `POST /api/register {username, code?}` → 200 `{username,codes}` | 409 `{error:'taken'}` | 404 `{error:'badcode'}`.
   - `POST /api/signin {username}` → 200 `{username,codes}` | 404 `{error:'notfound'}`.
   - `/api/login` entfernen. `/api/users/:username/codes` bleibt.
2. **src/services/account.ts**
   - `registerAccount(username, code?) → {ok, account?, error?}`
   - `signinAccount(username) → {ok, account?, error?}`
   - `attachCodeToAccount` (bleibt).
3. **src/services/joinTrip.ts** (neu) — `joinTripByCode(code, user) → {ok, tripId?, error?}` (pull → addMember → attachCode). Wird von Register+Code, In-App-Code, JoinTrip genutzt. Braucht Zugriff auf Storage-Funktionen (kein React) — addMember-Logik aus TripContext als Storage-Funktion bereitstellen oder Helper, der Storage direkt schreibt + `gotrip-sync` Event feuert.
4. **src/context/AuthContext.tsx** — `signIn(name)`, `register(name, code?)`; laden der Reisen via `pullTrip` je Code; lokaler Fallback.
5. **src/pages/Home.tsx** — Umschalter Anmelden/Registrieren (nicht eingeloggt); eingeloggt: „Neue Reise", „Meine Reisen" (Sheet), „Code eingeben" (Sheet).
6. **src/pages/JoinTrip.tsx** — nutzt `joinTripByCode`.
7. **i18n** — neue Keys.

## Build-Reihenfolge
1. Backend-Endpoints (register/signin) + lokaler Test (curl/Health).
2. account.ts (register/signin).
3. joinTripByCode-Helper (Beitritt entkoppeln).
4. AuthContext signIn/register.
5. Home: Modus-Umschalter + Fehleranzeige + eingeloggter Zustand + Meine-Reisen/Code-Sheets.
6. JoinTrip auf Helper umstellen; /api/login-Aufrufer entfernen.
7. i18n-Keys (DE/EN/ES).
8. tsc + build + Playwright-Smoke.

## Risiken
- joinTripByCode ohne React-Kontext: Storage direkt nutzen + Event feuern; nach Beitritt `refreshTrips` in der aufrufenden Komponente.
- Ungültiger Code bei Register: erst Code prüfen, dann Konto anlegen (keine Karteileiche).
- Bestehende Aufrufer von `/api/login`/`loginAccount` vollständig umstellen.
