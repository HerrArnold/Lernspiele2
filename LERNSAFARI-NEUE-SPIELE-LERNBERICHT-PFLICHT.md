# Verbindlicher Entwicklungsstandard: Lernbericht für jedes neue LernSafari-Spiel

**Beschlossen am 10. November 2026. Gilt ab sofort für alle künftig von ChatGPT hinzugefügten oder überarbeiteten Lernspiele.**

## Was schon automatisch funktioniert

Die Lehrpersonen-Auswertung in Version 3.3 liest den zentralen Spielekatalog `ORIGINAL_GAMES` aus `integration.js`. Neue korrekt registrierte Spiele erscheinen im Fach- und Spielefilter **automatisch**, sofern der Spielekatalog aktualisiert wird. Die Ergebnisse werden **nicht** bloss durch das Hinzufügen eines HTML-Spiels erfasst: Sie müssen serverseitig in Cloudflare gespeichert werden.

## Pflicht bei jedem neuen bewertbaren Lernspiel (keine Ausnahme ohne ausdrückliche Abstimmung)

1. Spiel in `lernsafari-test/original/spiele/<spiel-id>.html` erstellen; Dateiname ohne Sonderpfade und stabiler Spielschlüssel.
2. Spiel in `ORIGINAL_GAMES` mit richtigem Schulfach, Titel und Vorschau erfassen. Der Eintrag muss in der Lern-Lagune sichtbar sein.
3. `../assets/login-config.js`, `../assets/game-telemetry.js` und `../assets/highscore.js` einbinden.
4. **Bei jeder bewerteten Antwort** `window.SafariTelemetry?.record({task,correct,answer,expected})` aufrufen. `correct` ist ein echtes Boolean; pro bewerteter Antwort genau ein Ereignis. Keine Namen/Passwörter in die Telemetriedaten.
5. Die Highscore-Erfassung muss zur Spiellogik passen (z. B. korrekter sichtbarer Punktestand). Ist die generische Erkennung für das Spiel ungeeignet, den Highscore-Adapter **vor Freigabe** ergänzen und testen. Ein eingebundenes Skript allein beweist noch nicht, dass tatsächlich Ergebnisse gespeichert werden.
6. In der Lehrpersonenansicht prüfen: Schulfach, Spielname, Antworten, Highscore, Zeitraumfilter und Einzelspiel-Wochenverlauf; im Kinder-Logbuch den persönlichen Bestwert prüfen.
7. Daten ausschliesslich für das angemeldete Tierkonto erfassen; Admin-Auswertungen ausschliesslich über den serverseitig autorisierten Bericht. Bei neuen Bewertungsmodellen (Teilpunkte, Zeichnungen, Zeitmessung) die Aussagekraft und Datenschutzfolgen explizit prüfen.
8. Automatische Tests und einen realen Browsertest mit Test-Tierkonto und Test-Lehrperson durchführen. Vor Abschluss der Tests **nicht veröffentlichen**.

## Spiele ohne auswertbare Übungsantworten

Manche Angebote (z. B. ein Lexikon, ein Video, frei erkundbare Inhalte) enthalten keine bewerteten Lernantworten. Ein echter Lernbericht mit Erfolgsquote lässt sich dann nicht automatisch erstellen.

Diese müssen als bewusste Ausnahme dokumentiert werden: `<!-- LERNSAFARI: NON_ASSESSED -->` in der HTML-Datei. Statt erfundener Leistungswerte zeigt das Lernbericht-System nur tatsächlich verfügbare Daten. Sobald eine solche Seite zu einem Lernspiel mit richtigen/falschen Antworten ausgebaut wird, **muss** die vollständige Telemetrie nachgerüstet und die Ausnahme entfernt werden.

## Automatische Kontrolle

`node lernsafari-test/tests/neue-spiele-lernbericht.test.mjs` prüft alle **neuen** Spiele gegenüber dem eingefrorenen Bestand von 29 Spielen in `tests/lernbericht-baseline.json`:

- Im zentralen Spielekatalog registriert und HTML-Datei vorhanden
- Lernversuche- und Highscore-Skripte eingebunden
- Aufruf `SafariTelemetry.record(...)` für bewertete Antworten vorhanden
- Oder bewusst als `NON_ASSESSED` klassifiziert

Dies ist eine **statische Mindestprüfung**. Ob eine neue Aufgabe die richtigen Daten im richtigen Moment speichert und ob der Cloudflare Worker sie annimmt, muss zusätzlich mit Testkonten im Browser geprüft werden. Bestehende 29 Spiele werden durch diese neue Kontrollregel nicht stillschweigend umklassifiziert.

## Zuständigkeit

Wenn ChatGPT im Projekt LernSafari ein neues Spiel erstellt oder ein bestehendes wesentlich verändert, gehört die Einbindung und Prüfung des Lernberichts **zum selben Entwicklungsauftrag** – nicht zu einem optionalen Nachtrag. Jede Erweiterung soll mit diesem Standard abgeglichen werden.
