# LernSafari 3.1 – sicherer Testablauf

## Status
- Quell-Repository: `HerrArnold/Lernspiele2`
- Produktionszweig: `main` — unverändert
- Testzweig: `lernsafari-v3-1-test`
- Der erste Test ist bewusst **nur lesend**.
- Die 51-MB-Version 3.1 ist **noch nicht auf diesen Branch übertragen**. Dieser PR enthält zunächst die Diagnose für die bestehende Infrastruktur.

## So testen
1. Öffne `lernsafari-verbindungstest.html` auf einer eigenen, für diesen Testzweig konfigurierten GitHub-Pages-Testseite oder auf einem lokalen HTTP-Server.
2. Klicke **Diagnose starten**. Dateien und Cloudflare-API werden ohne Zugangsdaten geprüft.
3. Erwartet wird: wichtige Dateien erreichbar, Cloudflare Worker antwortet und verweigert den Zugriff auf `/me` ohne Anmeldung (falls dieser Endpunkt so vorgesehen ist).
4. Bei CORS-Problemen die freigegebene **Test-Domain** im Worker kontrollieren; keine öffentliche Freigabe aller Ursprünge als kurzfristigen Workaround einrichten.
5. Login, Kinderberechtigungen, Aufgaben-Zuweisung und Speicherung erst mit eigenen Testkonten und ausdrücklich dafür bestimmten Testdaten prüfen.

## Datenschutz und Betrieb
GitHub Pages stellt nur statische, öffentlich abrufbare Dateien bereit. Eine JavaScript-Sperre von Lernspielen ist keine Zugriffskontrolle. Der Cloudflare Worker muss Rollen, Token und Besitzrechte bei **jeder Anfrage** serverseitig prüfen. Zugangsdaten gehören niemals in das Repository.

**Nicht auf `main` zusammenführen**, bevor die vollständige Version 3.1 separat bereitsteht und die Rollen- und Speicherungstests bestanden sind.
