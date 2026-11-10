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
