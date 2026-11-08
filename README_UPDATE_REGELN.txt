LERNSAFARI – VERBINDLICHE UPDATE-REGELN

1. Vorhandene Lernergebnisse, Highscores, Konten und Admin-Notizen niemals löschen oder zurücksetzen, ausser dies wird ausdrücklich angeordnet.
2. Bestehende eindeutige Spielkennungen für immer beibehalten, auch bei Umbenennung oder Archivierung.
3. Neue Lernspiele erhalten neue eindeutige Kennungen und die Protokollierung der Lösungsversuche.
4. Datenbank nur additiv migrieren. Keine Tabellen löschen und keine vorhandenen Werte überschreiben.
5. Vor grösseren Änderungen die D1-Datenbank sichern und die neue Webseite auf Lernspiele2 prüfen.

ERFASSUNG: Ab dieser Version werden richtige und falsche Antworten der 12 Spiele im neuen Endpunkt /game-attempt gespeichert, sofern das Kinderkonto angemeldet ist. Bei gezeichneten Noten wird die Selbstbeurteilung gespeichert. Die Fehler vergangener Versionen koennen nicht nachtraeglich ermittelt werden.

AUSROLLEN: PRIVATES SQL ZUERST in D1 einmalig ausfuehren, danach privaten Worker mit Wrangler deployen, dann das oeffentliche Webseiten-Paket auf Lernspiele2 testen, erst danach Hauptseite aktualisieren.
