# LernSafari 3.1 – getrennte Cloudflare-Pages-Vorschau

## Status (10.11.2026)
- GitHub: `HerrArnold/Lernspiele2`, Branch `lernsafari-v3-1-test`
- **222/222 Dateien vollständig und bytegenau** gegenüber dem lokalen LernSafari-3.1-Paket (Git-Blob-Prüfsummen).
- Alle **29** Originalspiele und alle **6** grossen Safari-Szenen vorhanden.
- `main` bleibt unverändert; PR #1 bleibt Entwurf.
- Eine eigenständige Vorschau-URL ist **noch nicht eingerichtet**. Die Einrichtung erfolgt in deinem Cloudflare-Konto.

## Sichere Veröffentlichung als separates Cloudflare-Pages-Projekt
1. Öffne [Cloudflare](https://dash.cloudflare.com/) → **Workers & Pages**.
2. **Create application** → **Pages** → **Connect to Git** / **Import existing Git repository**.
3. GitHub autorisieren (falls nötig) und das Repository `HerrArnold/Lernspiele2` auswählen.
4. **Unbedingt ein NEUES Pages-Projekt** anlegen, z. B. `lernsafari-klasse3b-test`. **Nicht** ein bestehendes Pages-Projekt der bisherigen Webseite umstellen.
5. Als **Production branch in diesem neuen Testprojekt** `lernsafari-v3-1-test` wählen, nicht `main`.
6. Framework: **None / kein Framework**. Build command: `exit 0` oder leer. **Build output directory: `lernsafari-test`**. Root directory: Repository-Stamm (leer bzw. `/`).
7. **Save and Deploy**. Cloudflare erstellt für das neue Projekt eine eigene `*.pages.dev`-Adresse. Diese URL muss nach dem Deploy aus dem Cloudflare-Dashboard abgelesen werden.
8. Öffne **`https://<dein-neues-testprojekt>.pages.dev/diagnose.html`**, drücke **Diagnose starten** und kontrolliere alle Ergebnisse.

## Sicherheit / Funktionstest
- GitHub und Cloudflare Pages liefern **öffentliche** HTML-/JS-/Bilddateien. Im Test nur Gastzugang oder ausdrücklich eingerichtete Testkonten verwenden.
- Die API läuft über den bisherigen Cloudflare Worker `https://lernsafari-api.ergohd02.workers.dev`.
- **Keine echten Schülerdaten** über die Testseite eingeben, bevor die serverseitige Rollenprüfung und CORS-Freigabe dieser Test-Domain bestätigt sind.
- Falls die API CORS blockiert: die Test-Domain **gezielt** in der Worker-CORS-Konfiguration erlauben, nicht pauschal `*` für authentifizierte Aufrufe.
- Nach der Diagnose mit einem dafür vorgesehenen **Test-Kinderkonto** prüfen: anmelden → Logbuch öffnen → zugewiesene Testaufgabe sehen → abhaken → neu laden → Status erhalten.
- Mit **separatem Test-Adminzugang** prüfen: Adminrolle, Aufträge nur für vorgesehenes Testkonto, kein Zugriff eines Kindes auf Adminendpunkte.
- Nicht mit dem produktiven Admincode und nicht mit echten Schülerkonten experimentieren.

## Automatische GitHub-Prüfung
Das Workflow-Skript `.github/workflows/lernsafari-staging-check.yml` prüft:
- Dateistruktur, 29 Spielseiten und Cloudflare-Schnittstellen im Code
- die sechs grossen Safari-Bilder sowie direkte Dateiverweise in `index.html`
- JavaScript-Syntax
- und erstellt ein `LernSafari-v3.1-Testpaket` als GitHub-Actions-Artefakt

GitHub Actions ist kein Ersatz für einen Live-Test mit Login und Cloudflare-Rollenprüfung.

## Nicht tun
- **PR #1 nicht mergen**: Das Testpaket enthält viele zusätzliche Dateien und ist noch nicht für `main` bestimmt.
- **GitHub Pages nicht auf den Testbranch umstellen**, sonst kann die produktive Webseite ersetzt werden.
- Die neuen Test-Pages niemals als technisch geschützte/private Plattform betrachten.
