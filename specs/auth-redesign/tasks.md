# Tasks: Auth-Redesign

Bezug: `specs/auth-redesign/{spec,plan}.md`.

- [ ] **T1 Backend:** `POST /api/register` (Code-Validierung → 404 badcode; INSERT → 409 taken; Code anhängen) + `POST /api/signin` (404 notfound). `/api/login` entfernen. `server/index.js`.
- [ ] **T2 account.ts:** `registerAccount(username, code?)`, `signinAccount(username)` mit `{ok, account?, error}` (error: taken|badcode|notfound|offline). `attachCodeToAccount` bleibt.
- [ ] **T3 joinTrip-Helper:** `src/services/joinTrip.ts` → `joinTripByCode(code, user)` (pull → Mitglied hinzufügen via Storage → attachCode → `gotrip-sync`). Rückgabe `{ok, tripId?, error?}`.
- [ ] **T4 AuthContext:** `signIn(name)` + `register(name, code?)`; bei Erfolg Reisen laden (`pullTrip` je Code); lokaler Fallback bei `offline`.
- [ ] **T5 Home (Startscreen):** Modus-Umschalter Anmelden/Registrieren; Felder (Anmelden: Username; Registrieren: Username + optional Code); Inline-Fehler; nach Login: „Neue Reise", „Meine Reisen"-Sheet, „Code eingeben"-Sheet (nutzt joinTripByCode → refreshTrips).
- [ ] **T6 JoinTrip:** auf `joinTripByCode` umstellen (Duplikat entfernen).
- [ ] **T7 i18n:** Keys DE/EN/ES (signInTab, registerTab, inviteCodeOptional, enterCode, errNotRegistered, errNameTaken, errBadCode …).
- [ ] **T8 Verify:** `npx tsc --noEmit -p tsconfig.app.json`, `npm run build`, Playwright-Smoke (Szenarien 1–7), bestehende Funktionen unberührt.
