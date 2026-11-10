# LernSafari 3.1: vollständiges Paket in den Testzweig hochladen

**Repo:** HerrArnold/Lernspiele2  
**Branch:** lernsafari-v3-1-test  
**Nicht auf main arbeiten.**

1. GitHub Desktop öffnen und `HerrArnold/Lernspiele2` klonen (falls noch nicht lokal vorhanden).
2. Oben **Current Branch** → **lernsafari-v3-1-test** wählen.
3. `LernSafari-Prototyp-v3.1.zip` lokal entpacken.
4. Im geklonten Repository einen Ordner `lernsafari-test` erstellen. **Den Inhalt** von `LernSafari-Prototyp-v3.1` in diesen Ordner kopieren (nicht den äusseren ZIP-Ordner).
5. In GitHub Desktop die Änderungen ansehen; prüfen, dass nur Dateien unter `lernsafari-test/` hinzukommen.
6. Commit-Text: `test: stage complete LernSafari 3.1 website`.
7. **Push origin**. Anschliessend im Pull Request #1 unter **Checks** die automatische Prüfung kontrollieren.

Damit bleiben alle bisherigen Dateien am Repository-Stamm erhalten und die alte Webseite unverändert. Der Testzweig ist noch **keine separate GitHub-Pages-Veröffentlichung**. Dafür braucht es einen eigenen Test-Hosting-Ort oder eine sichere Preview-Lösung. Nicht einfach GitHub Pages auf diesen Testzweig umstellen: Das könnte die Live-Seite ersetzen.

## Wichtige Voraussetzungen vor dem Einsatz mit Kindern
- Keine produktiven Admin-Zugangsdaten im Repository
- Cloudflare überprüft Rollen, Token und Besitzrechte bei jeder Anfrage serverseitig
- CORS nur für freigegebene GitHub-/Test-Domains
- Login und Datenspeicherung zuerst mit Testkonten prüfen
