# LernSafari 2 – START HIER: Cloudflare anschliessen

**Stand:** 11. November 2026. Nur auf dem Test-Worker/Test-D1 einrichten.
**Hauptseite:** `HerrArnold/lernspiele` niemals ändern.

## Aktueller Stand der Live-API (11. November 2026)

Der **lesende GitHub-Actions-Test** erreicht die Worker-Adresse. Mit dem
`Origin` der LernSafari-Testseite antworten die sechs neuen Endpunkte
`/admin-classroom-mode`, `/admin-messages`, `/messages`,
`/admin-live-activity`, `/admin-projects` und `/projects` aktuell
alle mit **HTTP 401**. Eine zufällig gewählte unbekannte Adresse dient
als Vergleich, damit ein allgemeines 401/403 **nicht als installierter
Endpunkt** fehlgedeutet wird. Die neuen Funktionen sind daher noch
**nicht als aktiv nachgewiesen**. Vollständige Anbindung und
Authentifizierungstests sind weiterhin notwendig.

[Cloudflare-Testreport auf GitHub](https://github.com/HerrArnold/Lernspiele2/actions/workflows/check-cloudflare-readiness.yml)

**Neue Anmeldung:** Kinder-Sitzungen werden auf der Testseite nur noch in
`sessionStorage` gehalten. Ein Tab-Neustart verlangt eine Anmeldung;
nach dem blossen Aktualisieren bleibt die Tab-Sitzung erhalten.

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

## Konten für eigene Laptops und Parallelklassen

- **Klasse 3b:** Jedes Kind verwendet weiterhin sein eigenes Tierkonto und
  bleibt auf seinem persönlichen Laptop auch nach Schliessen des Browsers
  angemeldet. Das Frontend speichert dazu das **individuelle** Cloudflare-
  Sitzungstoken im lokalen Browser-Speicher. Abmelden, vom Worker abgewiesene
  Sitzungen und ein Bereinigen der Browserdaten beenden diese Anmeldung.
- **Parallelklassen 3a, 3c und 3d:** Je ein gemeinsam verwendeter
  Klassen-Benutzername (ohne einzelne Kinderkonten). Die Login-Rolle
  `class` oder `child` wird im neuen Frontend akzeptiert. **Kennwörter
  nur im Worker/D1 hinterlegen, nie in GitHub oder der Webseite.**
- **Gleichzeitige Geräte:** Jeder Login muss auf Worker-Seite ein **eigenes
  Sitzungstoken** bekommen. Beim Anmelden von Gerät B darf der Worker das
  gültige Token von Gerät A **nicht** invalidieren. Beim Abmelden von Gerät A
  ausschliesslich dessen Token widerrufen. Alle Konten müssen weiterhin
  Passwortprüfung und Ablaufzeit besitzen.
- **Geteilte Daten:** Ein Klassenkonto hat einen gemeinsamen Kontostand und
  dadurch möglicherweise gemeinsame Punkte/Erfolge. Diese Daten dürfen nicht
  als individuelle Lernfortschritte einzelner Kinder interpretiert werden.
  Ein Klassenzugang sollte nicht ohne bewusste Freigabe persönliche
  Schülerpost, persönliche Aufträge oder andere Tierkonten lesen können.
- **Admin:** Die Lehrperson verwendet weiterhin `Flamingo` als
  Benutzernamen und den **bereits bestehenden** Cloudflare-Admincode.
  Das Admin-Token wird weiterhin nur für den Browser-Tab gespeichert.

### Abnahmetest für parallele Anmeldung (unbedingt auf dem echten Worker)

1. Auf Gerät A als `3a` anmelden und eine erlaubte Lernaufgabe öffnen.
2. Parallel Gerät B als `3a` anmelden und eine **andere** Aufgabe öffnen.
3. Auf beiden Geräten Seite aktualisieren, ohne erneut das Passwort einzugeben.
4. Auf Gerät A abmelden; Gerät B muss weiterhin eingeloggt und arbeitsfähig
   bleiben. Gerät A darf ab sofort keine geschützten Daten lesen.
5. Test mit den Konten `3c` und `3d` wiederholen.
6. Lernspiele und gemeinsame Fortschritte dürfen sich nicht gegenseitig
   ausloggen oder Sitzungen überschreiben. Bei persönlichen Fortschritten
   müssen getrennte Tierkonten aus Klasse 3b isoliert bleiben.

**Status:** Persistente Browser-Anmeldung ist umgesetzt und per automatischem
Frontendtest geprüft. Mehrere unabhängige Tabs/Browsersitzungen sind
frontendseitig möglich. Ob der **bestehende Worker** gleichzeitig mehrere
gültige Tokens je Klassenkonto ausgibt und akzeptiert, kann ohne seinen Code
und echte Testkonten **noch nicht bestätigt werden**.

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
