# GoTrip auf Render hosten (kostenlos)

GoTrip läuft als **ein** Web-Service: Der Express-Server liefert das gebaute
Frontend **und** den `/api/earthdata`-Endpoint aus. Dadurch sind Frontend und
API auf derselben Domain — kein Cross-Domain-Problem.

> Die Bewertung (Copernicus/ERA5, GBIF, NASA POWER) läuft im Browser und
> braucht den Server **nicht**. Der Server wird nur für NASA Earthdata
> (Token) gebraucht. Ohne gesetzten Token funktioniert die App trotzdem —
> dann eben mit 3 statt 4 Datenquellen.

## Schritt für Schritt

1. **Code auf GitHub pushen** (falls noch nicht geschehen).

2. Auf **https://render.com** mit dem **GitHub-Account** anmelden (kostenlos,
   keine Kreditkarte nötig).

3. Oben rechts **New +** → **Blueprint**.

4. Dein **GoTrip-Repository** auswählen. Render erkennt automatisch die
   Datei **`render.yaml`** und schlägt den Web-Service „gotrip" vor →
   **Apply** / **Create**.

5. **EARTHDATA_TOKEN setzen** (nur falls du NASA Earthdata nutzen willst):
   - Service **gotrip** öffnen → Reiter **Environment**.
   - **Add Environment Variable**:
     - Key: `EARTHDATA_TOKEN`
     - Value: dein Token von https://urs.earthdata.nasa.gov/profile
   - **Save** → Render deployt automatisch neu.

6. Warten, bis der Build „**Live**" zeigt. Deine App ist dann unter
   `https://gotrip-XXXX.onrender.com` erreichbar.

## Wichtig zu wissen

- **Token-Sicherheit:** Den `EARTHDATA_TOKEN` **nur** in den Render-Umgebungs-
  variablen setzen — niemals die `server/.env` ins Repo committen (ist bereits
  per `.gitignore` ausgeschlossen).
- **Token läuft ab** (~60 Tage). Danach neuen generieren und den Wert in
  Render → Environment ersetzen.
- **Free-Tier schläft ein:** Nach ~15 Min ohne Zugriff schläft der Server.
  Der erste Aufruf danach dauert ~30 s (danach wieder schnell). Vor einer
  Präsentation einfach kurz die Seite öffnen, damit der Server „aufwacht".

## Lokal testen (wie in Produktion)

```powershell
npm install --include=dev
npm run build                 # erzeugt dist/
npm install --prefix server   # einmalig
node server/index.js          # serviert dist/ + /api auf http://localhost:3001
```
