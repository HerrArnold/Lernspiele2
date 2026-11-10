# LernSafari 3.1 – eigenständige Vorschau

Dieser Branch enthält die vollständige LernSafari 3.1 **direkt im Wurzelverzeichnis**, einschliesslich 29 Lernspielen und sechs Safari-Hintergrundbildern.

## Wichtig
Dieser Branch ist für ein **separates Preview-Hosting** vorbereitet und ersetzt nicht die bestehende Seite auf `main`.

### Cloudflare Pages einrichten
1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git.
2. Das GitHub-Repository `HerrArnold/Lernspiele2` auswählen.
3. Ein **neues** Pages-Projekt anlegen (nicht das bisherige ändern), beispielsweise `lernsafari-vorschau`.
4. Production branch: `lernsafari-v3-1-preview`.
5. Framework preset: None; Build command: leer; Build output directory: `/` (Projektwurzel).
6. Deploy; danach die eigene `*.pages.dev`-Adresse nutzen.

### Sicherheit
- Die Seite ist auf GitHub/Pages öffentlich abrufbar; **keine echten Schülerdaten als Test eingeben**.
- Die Cloudflare-Worker-API muss Login, Rollen und Berechtigungen serverseitig prüfen.
- Andere Ursprungsdomains können in CORS blockiert sein. Erst die API-Domain-Einstellungen und Rollenprüfung kontrollieren, bevor Testkonten eingesetzt werden.
- Nur den Read-only-Test unter `/diagnose.html` und die öffentliche Gastansicht ohne Zugangsdaten testen.

Die Veröffentlichung selbst kann hier nicht automatisch ausgelöst werden, weil kein Cloudflare-Dashboard-Zugriff verbunden ist.
