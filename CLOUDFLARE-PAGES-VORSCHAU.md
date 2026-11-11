# LernSafari 3.1 – eigenständige Cloudflare-Pages-Testwebseite

**Stand:** 222/222 Dateien sind bytegenau identisch mit dem lokalen Paket Version 3.1. GitHub Actions: erfolgreich. `main` bleibt unverändert.

## Sichere Online-Vorschau einrichten
In Cloudflare unter **Workers & Pages → Create → Pages → Connect to Git** ein eigenes **neues Pages-Projekt** anlegen.

- GitHub-Repository: `HerrArnold/Lernspiele2`
- Produktionsbranch **für dieses neue Testprojekt**: `lernsafari-v3-1-test` (nicht `main`)
- Framework preset: **None**
- Build command: **leer** (statische Dateien; kein Build notwendig)
- Build output directory: `lernsafari-test`
- Root directory: `/` (Repository-Stamm); falls Cloudflare im UI stattdessen einen Root-Pfad verlangt, alternativ Root `lernsafari-test` und Output `.` einstellen
- Projektname z. B. `lernsafari-vorschau-3b`

Danach erzeugt Cloudflare eine eigene **.pages.dev-Adresse** für dieses Testprojekt. Das Hosting der bisherigen GitHub-Pages-Seite bleibt unverändert.

## Testen
1. Die neue Pages-Adresse ohne Anmeldung öffnen. Startbild, Camp, Karten, Lern-Lagune und Baobab-Baum betrachten.
2. `/diagnose.html` an dieselbe Pages-Adresse anhängen und **Diagnose starten** anklicken.
3. Die 29 Spiele über die Fachwahl testen, besonders Navigation und Lesbarkeit.
4. **Keine echten Schülerkonten** in dieser Testversion einsetzen.
5. Die Cloudflare-Worker-API kann Anmeldungen wegen der neuen Origin zunächst ablehnen. CORS **gezielt nur für die neue Pages-Testdomain** freigeben; keine pauschale `*`-Freigabe.
6. Vor einem echten Kinderkonto-Test die Rollen-, Token- und Besitzrechtsprüfung im Worker mit eigens erzeugten **Testkonten** kontrollieren.

## Achtung
- GitHub Pages **nicht** auf den Testbranch umstellen; das könnte die bestehende Seite ersetzen.
- Den Pull Request **nicht** zusammenführen, solange die neue Version nicht vollständig getestet wurde.
- Die öffentliche Pages-Vorschau ist keine Zugangssperre. Geschützte Informationen dürfen nicht im Frontend oder in öffentlich zugänglichen statischen Dateien liegen.
- Die GitHub Action erzeugt zusätzlich unter **Actions → LernSafari · Staging-Prüfung → Artifacts** ein automatisch geprüftes Paket `LernSafari-v3.1-Testpaket`.
