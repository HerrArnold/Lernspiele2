# LernSafari 3.4 – Fokus-Sperren (Entwicklungsentwurf)

**Stand:** Die bestehende Cloudflare-Fokussteuerung ist als erster Schritt mit der neuen Camp-/Karten-/Lern-Lagunen-Oberfläche verbunden. Noch **kein** vollständiger Unterrichtsmodus. Keine Veränderung an der veröffentlichten 3.2 oder am GitHub-`main`.

## Jetzt im Entwicklungsbranch implementiert
- Bei eingeloggtem Tierkonto `/learning-plan` im bestehenden Cloudflare Worker abrufen.
- Wenn mindestens eine alte Fokusregel und mindestens ein noch offener Pflichtauftrag existieren, werden nicht zugewiesene Bereiche und Spiele in der neuen Oberfläche ausgegraut/blockiert.
- Camp, Karte, persönliches Logbuch, Post, Kompass/Agenda und Hilfe bleiben erreichbar. Zugewiesene Spiele sowie Tagesaufgaben können geöffnet werden.
- Klicks auf Karte und Lern-Lagune sowie interne direkte Weiterleitungen zu Lernspielen werden abgefangen.
- Nach Erledigung **aller** aktuellen Pflichtaufträge wird die pädagogische Navigation wieder freier; beim Zuweisen neuer Pflichtaufträge wird erneut gesperrt (solange eine Fokusregel aktiv ist).
- Auch die alte Spiel-iframe-Sperre wurde so angepasst, dass sie nach Abschluss aktueller Pflichtaufträge nicht widersprüchlich weiter sperrt.
- Daten werden bei Sichtbarwerden des Tabs, nach Anmeldung, im Logbuch und regelmässig neu geladen.

## Wichtige, noch offene Punkte – kein Go-live-Versprechen
1. **Lehrer-Schalter «Ankunftszeit / Fachunterricht / Freie Safari» fehlt.** Die bisherige Worker-API kennt nur eine Liste zeitgesteuerter Fokus-Blocks, keinen robusten Modus mit Fach, Gültigkeitsdauer und aktuellem Arbeitsauftrag-Satz. Ohne Worker-Erweiterung können wir die genaue Unterrichtslogik nicht zuverlässig implementieren.
2. **Nachgewiesenes Können fehlt:** Ein Häkchen in `assignment-done` bedeutet derzeit Selbstbestätigung, nicht automatisch fachliche Überprüfung. `/game-attempt` und `/game-score` bleiben getrennt. Die Freigabe nach nachgewiesener Beherrschung braucht serverseitig gespeicherte Auftragskriterien und Lehrerfreigabe als Ersatz.
3. **Ankunftsaufträge pro Arbeitsphase** müssen klar zuordenbar sein. Wiedereinsetzen der Sperre bei neuem Auftrag ist als Navigationsregel vorbereitet, aber neue Phasen, Tages- und Fachwechsel fehlen.
4. **Gäste und Direktlinks:** Die öffentliche Website bleibt technisch ohne Zugangskontrolle; die Sperre ist eine pädagogische Navigationseinschränkung. Direkte HTML-URLs und Gastzugang müssen für den kontrollierten Unterricht gesondert behandelt werden. Keine echte Sicherheit ohne serverseitige Kontrolle oder private Inhalte.
5. **Postfach:** Die neue Camp-Oberfläche zeigt noch Demo-Post. Echtes Lehrer-zu-Kind-Postfach ist noch separat zu implementieren.
6. **UI-Tests** mit zwei Test-Tierkonten, abweichenden Aufgaben und Lehrperson auf Cloudflare-Preview fehlen. Die bestandenen Tests sind Syntax/Struktur/Policy-Tests, keine realen Login- oder Browsertests.

## Freigabestrategie
1. Vorhandene Worker-Implementierung sichern und API-/Datenbankschema prüfen.
2. Modus-Endpunkte mit serverseitiger Rollenprüfung entwickeln: `free`, `arrival`, `subject` (Fach) und optional `closed`; automatisches zeitliches Auslaufen. Ein neuer Modus erfordert neue aktive Pflichtaufträge, unabhängig von Aufträgen anderer Unterrichtsphasen.
3. Gültige `assignment_id`-Liste für aktuellen Modus und individuellen Benutzer aus dem Server liefern; `completed`, `verified`, `teacher_approved` nicht verwechseln.
4. Aktuellen Frontend-Gate auf diese neue API migrieren; Lehrer-Oberfläche mit klaren Modus-Schaltern.
5. Echtes Postfach und Testergebnisse integrieren, die bestehenden 29 Spiele unverändert lassen.
6. Auf Preview mit Testkonten: Ankunft → Mathe → Pause → neues Fach → frei → nächsten Tag mit neuen Mathe-Aufträgen und Re-Lock testen. Erst nach erfolgreichem Test in die normale Testseite übernehmen.

**Grafikvertrag:** Variante A (Illustrationen ohne hineingemalte Buttons, echte HTML-Knöpfe exakt an sichtbarer Stelle) bleibt verbindlicher Folgeauftrag, siehe `LERNSAFARI-GESTALTUNG-BACKLOG.md` im parallel entwickelten 3.3-Branch. Der grafische Relaunch wurde in diesem ersten Fokus-Commit nicht durchgeführt.


## Fortschritt: erneute Sperre und vorbereitete Modusregeln

**Jetzt im Branch implementiert und automatisch getestet:**
- Bereits geöffnete, später gesperrte Lernspiele werden bei der Aktualisierung des Fokusplans aus dem aktiven iframe entfernt; die Kinder bekommen eine Erklärung und einen Logbuch-Link. Eine neue Ziel-Sperre kann Kinder auf das Camp zurückführen.
- Karten-, Fach- und Spielübersichten markieren gesperrte Links neu; Fokus-Hinweis wird nach Freigabe zurückgesetzt.
- `unterrichtsmodus.js` kann zusätzlich ein **zukünftiges, serverseitig autoritatives** `classroomMode`-Objekt interpretieren. Der bisherige Cloudflare Worker sendet diese Daten noch nicht, deshalb bleibt beim echten Betrieb vorerst die ältere Fokusregel aktiv.

### Erforderlicher API-Vertrag für den Cloudflare Worker (noch nicht implementiert)

Beispiel einer Antwort auf das existierende authentifizierte `GET /learning-plan`:
```json
{
  "assignments": [
    {"id": 108, "target": "game:einmaleins-dreier", "kind": "pflicht"},
    {"id": 109, "target": "number:word", "kind": "pflicht"}
  ],
  "done": [109],
  "verified": [109],
  "classroomMode": {
    "kind": "subject",
    "subject": "Mathe",
    "required_assignment_ids": [108],
    "require_verified": true,
    "expires_at": "2026-11-11T09:45:00Z"
  }
}
```

`kind`: `arrival` / `subject` / `free` / `closed`. `required_assignment_ids` enthält **nur die in diesem Modus aktuell verpflichtenden** Aufgaben des individuellen Tierkontos. `done` = Kind hat «fertig» bestätigt; `verified` = durch nachvollziehbares, gespeichertes Kriterium oder Lehrperson freigegeben. Beide Zustände sind getrennt. Eine neue Pflichtaufgabe, die noch nicht in `verified` ist, sperrt erneut, selbst wenn frühere Aufträge bestätigt waren. Der Modus wird vom Worker autorisiert; die Kinder können ihn nicht selbst verändern.

Wichtig: Das JSON ist **ein Datenmodell und Testvertrag**, nicht die Behauptung, dass der produktive Worker schon solche Antworten sendet. Vor Aktivierung muss die Lehrersteuerung mit serverseitig geprüftem Modus-Wechsel, Klassensitzung und Ablaufzeit ergänzt werden. `expires_at` muss pro Unterrichtsphase durch die Lehrperson oder eine gültige Zeitplanung gesetzt werden.

**Noch kein echter Unterrichtsmodus veröffentlicht; kein echter Postversand; kein Mastery-Backend.**

## Direkte Spieladressen – Erweiterung

**Bereits im Entwicklungsbranch umgesetzt (Browserprüfung):**
- Das von den bestehenden Spielen gemeinsam genutzte Skript `original/assets/new-safari-bridge.js` startet bei **jedem direkten Spielaufruf** `original/assets/game-zugang.js` – auch ohne Einbettung in die LernSafari.
- Bis der Zugriffsstatus geladen ist, erscheint ein Hinweis. Eine positive Freigabe blendet ihn aus, eine Sperre lässt das Spiel unbedienbar. Alle 29 bestehenden Spiel-HTML-Dateien werden in GitHub Actions auf die Einbindung der Brücke überprüft.
- Angemeldete Tierkonten: zuerst zukünftigen `GET /classroom-access?game=<id>` befragen; solange der Endpunkt noch nicht existiert, auf den bestehenden authentifizierten `GET /learning-plan` zurückfallen. Das Spiel wird über `game:<dateiname-ohne-html>` zugeordnet. Dieser Fallback kann nur bestehende Fokusregeln und die vorbereiteten zukünftigen Modusdaten auswerten.
- Gäste: **nur ein ausdrücklich erteiltes `allowed:true` vom noch zu implementierenden öffentlichen Prüf-Endpunkt** erlaubt die Nutzung. Bei 404/Netzfehler bleiben Gästespiele im neuen Entwicklungsbranch gesperrt, damit kein ungeregelter Zugriff als «freigegeben» interpretiert wird. Der aktuelle produktive 3.2-Gastzugang bleibt unverändert.
- Während eines geöffneten Spiels wird die Prüfung bei Fensterfokus/Rückkehr und regelmässig wiederholt; eine neue Sperre blendet den Inhalt aus.
- Automatische Tests prüfen freie Gäste, gesperrte Gäste, unbekannten Status, erlaubtes/gesperrtes Kind, alten Fokusmodus und verifizierten Auftrag.

**Wesentliche Grenze:** Das ist eine **Browser-/Navigationssperre**, kein echter Dateizugriffsschutz. Öffentliche HTML-/JS-Ressourcen werden vom Browser weiterhin geladen und sind technisch umgehbar. Um auch HTTP-Anfragen nach einer Spieladresse zuverlässig abzulehnen, müssten Spielressourcen hinter einer Cloudflare-Pages-Function oder einem Worker mit serverseitiger Autorisierung liegen (einschliesslich aller für das Spiel nötigen Ressourcen). Diese Architektur braucht einen getrennten Test und Freigabe; sie ist noch nicht umgesetzt.

**Nächste Worker-Arbeit:** `GET /classroom-access?game=<id>` so implementieren, dass Gäste datensparsam nur `{allowed:true|false}` erhalten, eingeloggte Kinder ebenso mit persönlicher Auftragsprüfung; keine persönlichen Daten über öffentliche Antworten offenlegen. Endpunkt gegen direkt aufgerufene URL, fehlenden/ungültigen Token, Moduswechsel, Fachpflicht, Ablaufdatum, Gastzugang testen. Die browserseitige Sperre ist derzeit im Entwurfs-PR #4, nicht veröffentlicht.

## Lehrpersonenbedienung – vorbereitet, nicht freigeschaltet

`unterrichtsmodus-admin.js` ist in die Cloudflare-Adminoberfläche eingebunden. Die Auswahl enthält «Ankunftszeit», «Fachunterricht» mit Schulfach, «Freie LernSafari» und «Geschlossen» sowie eine Ablaufzeit. Die Auswahl prüft die **aktuell laufenden Pflichtaufträge** aus der vorhandenen Cloudflare-Auftragsliste: Ankunft = `daily:` / `number:` / `page:aufgaben`; Fach = `game:`-Aufträge aus dem zentralen Spielekatalog. Nicht aktivierte oder bereits abgelaufene Aufträge zählen nicht. Ein Fachmodus ohne passende Pflichtaufträge kann nicht aktiviert werden.

**Sicherheitsgrenze:** Die Bedienung macht zuerst `GET /admin-classroom-mode` mit dem bestehenden gesicherten `X-Safari-Admin`-Token. Solange die Antwort **nicht** `{available:true,classroomMode:{...}}` enthält, werden die Bedienelemente **nicht eingeblendet**. Es wird kein Modus lokal vorgetäuscht. Erst danach kann `POST /admin-classroom-mode` dieselbe autorisierte Sitzung benutzen.

Der Worker muss für `POST /admin-classroom-mode` die fachlichen und sicherheitsrelevanten Bedingungen **nochmals serverseitig** prüfen (Client-Daten nicht vertrauen): Adminrolle, erlaubtes Fach, Zukunftsdatum/Ablaufgrenze, zugewiesene/aktive Pflichtaufträge und ggf. differenzierte Aufträge pro Kind. Die gespeicherte Fachmodus-Phase muss für alle Kinder gelten, aber die geltenden `required_assignment_ids` müssen **pro Kind** anhand der Zuweisung aufgelöst werden. Eine Klassenaufgabe `audience:'all'` zählt nur für die berechtigten Klassenkonten. Der Worker liefert Kindern über `GET /learning-plan` eine passende `classroomMode`-Beschreibung und zwei getrennte Listen `done` und `verified`. Die Lehrperson benötigt ausserdem eine eigene Möglichkeit, eine eingereichte Aufgabe nachvollziehbar freizugeben; bis dahin bleibt `require_verified:true` vorsichtig und darf nicht durch Kinder-Häkchen ersetzt werden.

`GET /classroom-access?game=id` muss öffentlich ausschliesslich `{allowed:boolean}` liefern, ohne Schülerdaten, und die aktiven Regeln mit oder ohne authentifizierten Bearer-Token anwenden. Gastzugang: in Unterrichtsmodi deny; bei `free` allow für ausdrücklich gastfreigegebene Spiele. Direkte Datei-HTTP-Autorisierung bleibt eine separate Architekturfrage.

Die Browseroberfläche und ihr HTML/CSS sind im Branch vorbereitet und die pure Payload-/Zuordnungslogik wird von GitHub Actions geprüft. **Kein Worker-Code geändert oder deployed; keine aktive Unterrichtssteuerung per Lehrpersonenknopf.**

## Worker-Erweiterung jetzt im Entwicklungsbranch vorbereitet (10.11.2026)

Die unabhängigen, auf GitHub automatisch getesteten Module `cloudflare-worker/classroom-service.mjs`, `cloudflare-worker/classroom-d1-store.mjs`, `cloudflare-worker/classroom-migration.sql` und `cloudflare-worker/INTEGRATION.md` wurden erstellt.

Der Service übernimmt die serverseitige Prüfung für den **Lehrpersonenmodus**, die **direkte Spieladresse**, die **rollenbasierte Freigabe einzelner Kinderaufträge** und die sichere Speicherung der Modusdaten. Bestätigungen werden mit der Lehrperson und dem Zeitpunkt protokolliert. Er akzeptiert keine vom Kind selbst behauptete Lehrerberechtigung. Für eine Lehrpersonenfreigabe muss das Tierkonto existieren und der Auftrag für dieses Konto gültig sein.

**Wichtige Kompatibilitätsregel:** Solange die Lehrperson keinen neuen Unterrichtsmodus aktiviert hat, wird in `/learning-plan` das bestehende Fokusdatenmodell **nicht** durch ein künstliches `classroomMode: free` ersetzt. Der neue öffentliche Prüf-Endpunkt verweigert in diesem unkonfigurierten Übergang den Gastzugang, um die alten Sperren nicht zu umgehen.

Es fehlt weiterhin die tatsächliche Einbindung der Module in den **bestehenden** Worker, denn dessen Quellcode steht in den verbundenen GitHub-Repositories nicht zur Verfügung. Für einen sicheren produktiven Rollout braucht es einen Cloudflare-Worker-Export oder den Repo-Zugriff, einen D1-Datenbank-Backup/Preview, die Integration der vorhandenen Authentisierung und Auftragsabfragen sowie echte E2E-Tests. **Kein Deployment und keine Änderungen an Version 3.2.**
