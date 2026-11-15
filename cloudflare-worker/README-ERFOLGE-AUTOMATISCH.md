# LernSafari: automatische Erfolgsbriefe

## FLEISSIG

Zwischen 08:00 und 11:40 Uhr (Europe/Zurich), Montag bis Freitag, erhält das erste angemeldete Kinderkonto, das bei **Zahl des Tages → Zahlwort** ein nichtleeres Wort eingibt und auf **Prüfen** klickt, einen privaten Erfolgsbrief. Eine korrekte Antwort ist nicht erforderlich.

**Flamingo und Löwe sind ausgeschlossen**, unabhängig von Gross-/Kleinschreibung (auch „Loewe“). Das gilt für den Administrator und das Testkonto. Der erste echte Schüler, nicht das Testkonto, kann gewinnen.

Titel: **FLEISSIG**

> Der frühe Vogel fängt den Wurm. Du hast heute als erstes Kind damit begonnen, die Aufgaben zur Zahl des Tages zu lösen.

## FEHLERFREI

Ein voller, mit einem Abschlussereignis dokumentierter Lern-Lagunen-Aufgabensatz muss **beim ersten Versuch vollständig richtig** gelöst sein. Die Cloudflare-Datenbank kontrolliert die bisherigen einzelnen Prüfungen des jeweiligen Spiels. Nachträgliche Korrekturen, Neu-Starts und wiederholte Abschlussmeldungen dürfen den Erfolg nicht mehr auslösen.

Titel: **FEHLERFREI**

> Du hast die Aufgabe [Spielname] beim ersten Versuch ohne Fehler gelöst!

Jeder Schüler kann diesen Erfolg pro geeignetem Spiel **höchstens einmal** erhalten. Ein Fehler bei einem früheren Versuch schliesst die spätere Vergabe für das gleiche Spiel aus. Nur **vollständige Sets mit dokumentierten Einzelaufgaben und Abschluss** sind dafür geeignet; reine Highscores oder endlose Spiele ohne solchen Abschluss gelten nicht als Nachweis.

## Technische Hinweise

Die Aktionen werden vom bestehenden authentifizierten `POST /game-attempt` ausgelöst. Kein Browser-Timer und keine geplante Cloudflare-Cron-Aufgabe erforderlich. Die Vergabe und Briefzustellung erfolgen serverseitig in D1. Zwei automatisch erstellte Tabellen sichern die Einmaligkeit. Die vorhandenen Polaroid-, Mail- und Unterrichtsmodus-Routen bleiben erhalten.

**Wichtig:** GitHub speichert die technische Beschreibung; der aktualisierte vollständige Cloudflare Worker wird separat als ZIP geliefert. Erst nach **Cloudflare Deploy** werden die Erfolge live. Für vorhandene Lernspiele, die noch keine auswertbare Abschlussmeldung liefern, ist später eine geeignete Abschlussmeldung nötig.
