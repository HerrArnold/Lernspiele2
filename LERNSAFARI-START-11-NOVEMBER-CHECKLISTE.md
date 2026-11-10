# LernSafari: Go-live-Checkliste für Mittwoch, 11.11.2026

**Status: Bestandsprüfung/Plan, nicht als funktionierend freigegeben.** Aktuelle veröffentlichte Version: 3.2 auf Cloudflare Pages. Version 3.3: Draft PR #3, noch ohne Live-Browsertest. Neue Lerneinheiten/Uploads sind ausdrücklich NICHT Teil dieses Starts.

## Ist-Zustand (quellcodegestützt)
- Cloudflare-Kinderlogin / persönliches Logbuch / Aufgaben und Häkchen / gespeicherte Highscores / Klassenübersicht 3.2 wurden bereits im bisherigen Gespräch mit Testkonten getestet.
- Neue UI: `lernsafari-test/app.js:renderMail` zeigt nur Demo-/Platzhalter-Nachrichten. **Kein echtes Postfach in der neuen Oberfläche.**
- Neue UI: `renderMap`, `renderLagoon`, `renderBaobab` navigieren unabhängig von den Cloudflare-Fokusregeln.
- `cloudflare-integration.js` zeigt `p.blocks` im Kinder-Logbuch, setzt aber daraus **keine konsequente Camp-/Karte-/Lagune-Sperre** um.
- Alte Oberfläche `original/assets/lernsteuerung.js` kennt zeitgesteuerte `/admin-focus-rules` (Schach, Tiere, andere Spiele, Portale, Advent), `/learning-plan`, geplante Aufträge, Link-Sperren und `applyGameGuard`; die eigene Dokumentation bezeichnet die Sperre als **pädagogische Navigationseinschränkung**, nicht als technische Zugangssicherung für öffentliche HTML-Dateien.
- Aufträge werden gegenwärtig per Kinder-Häkchen in `/assignment-done` bestätigt; Ergebnisse aus `/game-attempt` und `/game-score` sind unabhängig. **Fachliches Beherrschen wird nicht zuverlässig geprüft**, keine automatische Entsperrung per Lernzielkriterium.
- Kein sicher verifizierter Cloudflare-Worker-Quellcode im GitHub-Repository. Bei neuen Server-Endpunkten und serverseitiger Rollenlogik zuerst die laufende Worker-Version sichern und getrennt prüfen.

## P0: vor verlässlichem Unterrichtsmodus zwingend
1. **Keine defekte 3.3-Vorschau als Schulversion live schalten.** Stabile 3.2 beibehalten, falls die folgenden Punkte noch nicht getestet wurden.
2. **Berechtigungssystem/UI:** echte Sperrlogik für Login, Camp-Hotspots, Karte, Lern-Lagune, Oase, Baobab, Schach, direkt geöffnete Spiel-Links. Gastzugang während einer Kindersperre entweder begrenzen oder deutlich als nicht kontrollierten Gastmodus behandeln (keine personenbezogenen Daten).
3. **Aktiver Modus** durch Lehrperson: `arrival` / `subject` (+ Fach) / `free` / optional `closed`; beginnt/endet auf Knopfdruck, kann zeitgesteuert beendet werden. Kinderansicht aktualisiert den Modus zeitnah und auch bei Seitenwechsel, Wiederanmeldung und Reload.
4. **Pflichtaufträge pro Modus**: Ankunftszeit `Zahl des Tages` + `Aufgaben des Tages`; Fachstunde nur zugewiesene Pflichtaufträge dieses Fachs. Erlaubte Ziele auch bei Sperre direkt aus To-do-Liste öffnen.
5. **Entsperr-Kriterium pro Auftrag**: `self_done` (Kind meldet fertig), `auto_verified` (geeignete Antworten/Ergebnis), `teacher_approved` (Lehrperson bestätigt), `needs_review`. Es muss ein **fester, transparenter Kriterientyp** gewählt werden, nicht jede Übung per Highscore als sicher beherrscht interpretieren. Bei heute noch fehlender Antwortbewertung: Lehrerfreigabe als sichere Fallback-Regel.
6. **Re-Lock:** Beim neuen Ankunfts-/Fachmodus oder wenn neue zugehörige Pflichtaufträge zugewiesen werden, aus `activeModeRequiredAssignmentIds` neu berechnen, ob das Kind noch offene Pflichten hat. Alte Erledigt-Nachweise bleiben gespeichert; nur neu hinzukommende offene Pflichtaufträge sperren erneut. Kein erneutes Absolvieren erledigter Aufgaben durch Moduswechsel, ausser sie werden bewusst als **neuer Auftrag** angelegt.
7. **Sitzungssicherheit:** Serverprüfungen für persönliche Statusdaten; die UI-Sperre an öffentlich lesbaren Spielen ist pädagogisch, nicht kopier-/URL-sicher. Schulmodus darf nicht allein über lokale Browserflags wirksam sein.
8. **Fokus-Bypass testen:** Gast-Auswahl, direkte URL, Vorwärts-/Zurücknavigation, offene Tabs, Reload, Kind A vs Kind B, Lehreradmin.

## P0: echte Post und bestehende Daten
9. **Postfach** benötigt Admin-Erstellen (alle / einzelne Tierkonten), Kinder-Abruf, gelesen/ungelesen, sichere Serverberechtigung; Nachrichten bis bestätigter Implementierung nicht als «echt» ausgeben. Zuerst vorhandene Worker-Post-Endpunkte verifizieren oder minimale neue Endpunkte nach separatem Backup bauen.
10. **Logbuch/Lernbericht**: aktuelle 3.2-Daten in der neuen Oberfläche wiederfinden; Login, Auftrag zuweisen, Erledigt, Resultate speichern und Klassenreport über realistische Testkonten Ende-zu-Ende prüfen. 3.3 nur nach Preview-Prüfung übernehmen.

## Mindesttests vor Go-live
- Zwei Test-Tierkonten mit verschiedenen Aufträgen; Lehrperson meldet sich an.
- Ankunftsmodus → beide Tagesbereiche Pflicht; Oase/andere Fächer zu → erledigen/freigeben → frei.
- Fachmodus (z. B. Mathe) → Mathe-To-dos offen, andere Fächer gesperrt; Fachwechsel → Re-Lock.
- Neuer Matheauftrag am Folgetag → Mathe wieder gesperrt; alte Erledigt-Häkchen bleiben.
- Unterricht beendet → Freier Modus; spätestens nach festgelegter Zeit zurücksetzen.
- Post an ganze Klasse und einzelnes Kind, Nachrichten korrekt getrennt und Lesestatus.
- Punkte/Versuche, persönliche Erfolge und Klassenbericht bleiben über Geräte hinweg vorhanden.
- Positive/negative Fälle: Gast, direkt geöffneter Spiel-Link, Reload, Browser zurück, langsame/offline Verbindung.
- Test mit Schülernamen vermeiden; ausschliesslich Tier-Testkonten verwenden.

## Realistischer 11.11.-Fallback, solange P0 nicht abgeschlossen
**Orientierungsstart statt behaupteter Voll-Fokus-Betrieb**: Kinder melden sich an, erkunden Camp/Karte/Lern-Lagune, bearbeiten zugewiesene Aufgaben und sehen Highscores. Lehrperson steuert Aufgaben mündlich; keine Zusage, dass fremde Spiele automatisch gesperrt oder nach Leistung freigegeben sind; Postfach als Demo kennzeichnen oder ausblenden. Erst nach Tests produktiven Sperrmodus ankündigen.

## Nicht Teil des morgigen Starts
Neue Lerneinheiten, automatisch bewertete analoge Uploads, KI-Korrektur, umfassende Kompetenzraster, neue Grafikformate/Variante-A-Relaunch, Baobab-Neugestaltung.

## Verbindlicher visueller Folgeauftrag (NICHT VERGESSEN)
Nach den Go-live-Funktionen wird die gesamte Knopf- und Illustrationslogik überarbeitet. **Variante A ist entschieden:** keine fest in die Illustrationen gezeichneten Knöpfe; stattdessen echte HTML-Buttons, die visuell zur Szene gehören und deren sichtbare und klickbare Fläche exakt übereinstimmen. Karte und Lern-Lagune sollen auf Laptop-Bildschirmen ohne vertikales Scrollen vollständig sichtbar sein. Camp/Startseite, Karte, Lern-Lagune und weitere betroffene Ansichten werden vereinheitlicht; Baobab-Baum erhält eine umfassende grafische und inhaltliche Überarbeitung. Siehe `LERNSAFARI-GESTALTUNG-BACKLOG.md`. Diesen Auftrag nicht mit den zukünftigen vollständigen Lerneinheiten verwechseln.
