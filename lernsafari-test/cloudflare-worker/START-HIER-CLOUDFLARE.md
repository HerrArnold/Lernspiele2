# LernSafari 2 – START HIER: Cloudflare anschliessen

**Stand:** 11. November 2026. Nur auf dem Test-Worker/Test-D1 einrichten.
**Hauptseite:** `HerrArnold/lernspiele` niemals ändern.

## Was im GitHub-Entwicklungszweig bereits fertig ist

- Anmeldung über dasselbe Logbuch (Flamingo + bestehender Admincode für Lehrperson,
  Kinder über ihre Cloudflare-Konten). **Keine Passwörter in GitHub.**
- Kein Gastzugang, keine Demo als Kind, keine Demo-Verwaltung, kein separates Lehrer-Login.
- Lehrpersonen-Dashboard mit Lernaufträgen, Unterrichtsmodus, Berichten,
  Live-Aktivität, Nachrichten, Projekten.
- Für Unterrichtsmodi und Nachrichten **authentifizierte** API-Routen als
  separat getestete Erweiterungen vorbereitet; das Frontend erkennt
  `available:true` von echten Worker-Antworten.
- Die drei Bilddateien sind als WebP im Bildpaket vorbereitet.
  **Sie liegen noch nicht im GitHub-Branch**, siehe unten.

## Vorbereitete Worker-Dateien (alle in diesem Ordner)

| Zweck | Javascript-Modul | Datenbankschema | Anleitung |
| --- | --- | --- | --- |
| Ankunft, Fachlektion, Entdecken | `classroom-service.mjs`, `classroom-d1-store.mjs` | `classroom-migration.sql` | `INTEGRATION.md` |
| Nachrichten + Live-Aktivität | `communications-service.mjs`, `communications-d1-store.mjs` | `communications-migration.sql` | `COMMUNICATIONS-INTEGRATION.md` |
| Polaroids / Projekte | `projects-service.mjs`, `projects-d1-store.mjs` | `projects-migration.sql` | `PROJECTS-INTEGRATION.md` |

## Zu Hause: Reihenfolge in Cloudflare

1. **Cloudflare-Dashboard** öffnen, unter *Workers & Pages* den bestehenden
   Worker `lernsafari-api` öffnen. Bei bestehendem Worker **nicht** auf
   «Create Worker» für den Produktivnamen klicken.
2. Unter *Edit Code* oder über Wrangler zuerst den **gesamten bestehenden
   Worker-Quellcode sichern** (und D1-Datenbank sichern). Ein reiner
   Screenshot reicht nicht: Die Login-, Session- und vorhandenen
   Datenbankfunktionen werden zur Integration benötigt.
3. **Testkopie** des Workers und der D1-Datenbank verwenden. Bestehende
   Cloudflare-Variablen/Secrets unverändert lassen, Adminpasswort **niemals
   in GitHub ablegen**.
4. Auf der Test-D1 die drei SQL-Dateien oben in der Reihenfolge
   `classroom-migration.sql`, `communications-migration.sql`,
   `projects-migration.sql` ausführen. Vorher Backup.
5. Die Module als zusätzliche Dateien in das **bestehende Worker-Projekt**
   kopieren und mit dessen bereits vorhandenen authentischen
   Authentifizierungs- und Assignment-DB-Funktionen verbinden.
   Die konkreten Adapter stehen in den drei verlinkten Anleitungen.
   **Nie die Worker-Hauptdatei durch eines dieser Module ersetzen.**
6. Im Worker die Module **vor** den bestehenden Routen aufrufen und nur
   bei unterstützter Route deren Antwort zurückgeben. Die vorhandenen
   Login-, Konto-, Logbuch-, Kalender- und Aufgabenendpunkte müssen
   weiterfunktionieren. CORS nur für die beiden freigegebenen
   LernSafari-Domains, nicht mit `*` für Zugangsdaten.
7. Das Ergebnis von `GET /learning-plan` für Kinder mit
   `classroomService.childPlan(username,previousPlan)` ergänzen.
   Sonst zeigt das Frontend zwar einen Modus, kann ihn aber nicht korrekt
   anwenden.
8. Spiel-IDs für Mathe, Deutsch, NMG, Musik, Englisch inklusive
   `hoerverstehen-...` in eine **serverseitige** Allowlist eintragen;
   kein frei wählbarer Dateipfad aus Benutzereingaben.
9. Erst im **Test-Worker** mit einem Kinder-Testkonto und dem
   Lehrpersonenkonto prüfen:
   - **Ankunftszeit:** Nur Tagesaufgaben freigeschaltet; ungeprüft
     bleiben andere Bereiche blockiert. Lehrperson bestätigt Erledigung,
     anschliessend entsperrt die Seite.
   - **Lektionsmodus:** Nur das gewählte Fach und die zugewiesenen
     Pflichtaufträge; nach bestätigter Erledigung wieder frei.
   - **Entdeckungszeit:** Alle Lernbereiche frei, aber **nur nach Login**.
   - **Nachrichten:** Lehrperson sendet an ein Kind und an die Klasse,
     beide können nur ihre berechtigten Postfächer abrufen.
   - **Live-Aktivität:** Nur angemeldete Kinder, maximal 120 Sekunden
     alte Meldungen.
   - **Projekte und Erlebnisse:** Nur Lehrperson veröffentlicht und löscht
     Fotos; öffentliche Rückblicke enthalten keine unberechtigt
     veröffentlichten Kinderbilder.
10. Die Änderungen an einem zweiten Gerät und in einem privaten
    Browserfenster gegenprüfen, bevor Kinder sie benutzen.

## Drei wichtige Sicherheitsgrenzen

**A. Kein automatisches Bestehen durch ein Häkchen.** Die vorbereitete
automatische Freigabe kann nur nach serverseitig **überprüften**
Lösungen oder einer Lehrpersonenbestätigung sicher einschalten. Vom
Browser gesendete Punkte oder `correct:true` sind kein Beweis.
Ohne den vertrauenswürdigen Worker-Auswerter gilt weiter die
Lehrpersonenbestätigung.

**B. Ein gesperrter Button ist kein Schutz der Dateiadresse.**
Werden einzelne Spiele als statische, öffentliche HTML-Dateien
gehostet, können sie möglicherweise trotz Menü-Sperre direkt
aufgerufen werden. Für vollständig erzwungene Sperren ist
Cloudflare Pages Functions / eine geschützte Auslieferung der
Spielressourcen erforderlich.

**C. Klassenkonten ohne Zugang zu anderen Tierkonten.**
Parallelklassen benötigen serverseitig eigene Klassenkonten und eine
klar eingeschränkte Rolle. Login-Daten nur im Worker/D1 mit
sicher gehashten Passwörtern verwalten, niemals als Klartext in GitHub.

## Bilddateien aus dem bereitgestellten ZIP einfügen

GitHub-Entwicklungszweig `lernsafari-camp-direkt`:
- `lernsafari-test/assets/karte-stickerwelt.webp`
- `lernsafari-test/assets/baobab-stickerwelt.webp`
- `lernsafari-test/original/assets/hornvogel-zahl-des-tages.webp`

Der HTML-Code verweist bereits auf exakt diese Pfade und nutzt
solange SVG-Fallbackgrafiken, wie sie nicht vorhanden sind. Nach
Upload wird die richtige Illustration automatisch angezeigt.
Keine Bildunterschriften in die Grafiken einzeichnen: Die Schilder
sind echte HTML-Buttons mit passenden Klickflächen.

## Status der Freigabe

Die Worker-Module und D1-Migrationen sind vorbereitet, jedoch **nicht
auf die aktive Cloudflare-Datenbank oder den laufenden Worker angewendet**.
Ein Worker-Login durch ChatGPT ist nicht verbunden. Die sichere
Aktivierung erfordert den bestehenden Worker-Code und das Testkonto
bei Cloudflare; die Modulfunktionen allein sind kein Produktiv-Worker.
