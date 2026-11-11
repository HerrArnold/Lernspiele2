# LernSafari – Verwaltung auf Lernspiele2

Stand: 11. November 2026

## Umgesetzt im Branch `lernsafari-camp-direkt`

- Neue Verwaltung mit fünf Einstiegsfeldern: Lernaufträge, Unterrichtsmodus, Lernfortschritte, Aktivität und Nachrichten
- Lernaufträge nach LernSafari-Bereich auswählen; in der Lern-Lagune Fach → Thema → Lernspiel
- Ganzes Fach oder ganzes Thema: pro verfügbarem, bereits serverseitig unterstütztem Spiel einen einzelnen Lernauftrag anlegen
- Zuordnung an ganze Klasse oder einzelnes Tierkonto, Zeitfenster, Pflicht- oder Zusatzauftrag
- Bestehende Cloudflare-Aufträge bearbeiten und löschen
- Unterrichtsmodus als drei übersichtliche Auswahlkarten: Ankunftszeit, Fachunterricht, Entdeckungszeit
- Lehrperson kann auswählen, welche aktiven Pflichtaufträge für einen Modus gelten
- Lernfortschritte: Kind / Fach / Thema filtern und vorhandene Cloudflare-Versuche und Spiele-Höchstwerte auswerten
- Aktivität: vorhandene Cloudflare-Anwesenheitsmeldungen ohne erfundene Live-Aktivität
- Nachrichtenbereich: Text vorbereiten und kopieren; keine vorgetäuschte Sendefunktion
- Bestehende sicherheitsrelevante Cloudflare-Admin-API bleibt Voraussetzung für echte Schreibvorgänge
- Hauptseite `HerrArnold/lernspiele` bleibt unverändert

## Noch NICHT vollständig umgesetzt

1. Automatisch alle Bereiche freigeben, **nachdem jedes Kind die Aufgaben des Tages tatsächlich richtig gelöst hat**. Das bestehende Cloudflare-Modul benötigt für Pflichtaufträge weiterhin bestätigte Erledigung durch die Lehrperson. Kinder-Häkchen dürfen nicht als geprüfte Lösung missverstanden werden. Für automatische Freigabe braucht der Worker verifizierbare Ergebnisdaten und eine geprüfte serverseitige Freigabeentscheidung.
2. Genaue Live-Aktivität »Kind X arbeitet gerade an Spiel Y« verlangt eine authentifizierte serverseitige Aktivitätsmeldung/Heartbeat mit Zeitstempel.
3. Nachrichten direkt an ausgewählte Kinder senden verlangt einen authentifizierten Postfach-Endpunkt, Speicherung und Berechtigungsprüfung im Worker. Der aktuelle Entwurf bietet Vorbereitung/Kopieren statt vorgetäuschter Auslieferung.
4. Für neue Spiele ohne Worker-Auftragskennung (z.B. neue Hörverständnisse) muss der vertrauenswürdige Serverkatalog erweitert werden, bevor die Lehrperson diese als Pflichtaufträge zuweisen kann.
5. Browserprüfung mit Lehrperson- und Test-Kinderkonto sowie eine echte Cloudflare-Veröffentlichungsprüfung stehen aus.

## Wichtige Grenzen

- Die öffentliche Webseite und JavaScript-CSS sind **keine Zugriffssicherheitsgrenze**. Unterrichtsfreigaben brauchen Serverprüfung an den geschützten APIs, nicht bloss deaktivierte Schaltflächen.
- Spielversuche aus `/admin-report` werden nur angezeigt, soweit Cloudflare diese Angaben liefert. Fehlende Punkte oder Live-Daten werden nicht geschätzt.
- Für die Schul-Laptops sind 1366×768 als wichtige Testauflösung vorgesehen.
