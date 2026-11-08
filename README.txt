LERN­SAFARI – ANMELDUNG UND LERNSPIELE
===================================

Diese Website enthält alle bisherigen Musik- und Mathe-Spiele, 26 Tagesaufgaben-Serien
(6 geplant inklusive letztem Freitag + 20 Reserve-Serien), die Lernportale, den
Adventskalender und die neue Anmeldung mit 17 Tierprofilen.

GITHUB: Nur die Dateien und Ordner dieses ZIP ins Hauptverzeichnis von Lernspiele2 laden.
Die Bilder liegen in assets/, die Spiele in spiele/.
Die ZIP enthält bewusst KEINE Kinder-Passwörter und KEINE private Datenbankdatei.

CLOUDFLARE WEB ANALYTICS:
Der bereitgestellte Cloudflare-Token ist im Script assets/analytics-config.js hinterlegt.
Die Messung wird auf Startseite, Lernportale-Seite und allen 12 Spielseiten geladen.
Aufrufe und geschätzte unterschiedliche Besucher sind nach Veröffentlichung im Cloudflare
Web Analytics Dashboard sichtbar. Nicht identisch mit der Anzahl physischer Geräte.

LOGIN & LERNFORTSCHRITT:
Das Login-Fenster öffnet über das unterstrichene «Hier» im Begrüssungsbalken.
Nach Anmeldung wird der Tiername mit passendem Bild angezeigt. Highscores der Spiele
mit drei Herzen und die abgeschlossenen Tagesaufgaben werden über einen separaten
Cloudflare Worker mit D1-Datenbank gespeichert. Ohne Worker-URL ist eine Anmeldung
nicht möglich; die Website und alle Aufgaben können trotzdem als Gast genutzt werden.

SO AKTIVIERST DU DIE LOGINS:
1. Separaten Download Cloudflare_Lernsafari_Backend/worker.js + wrangler.toml
   sowie Lernsafari_D1_PRIVAT_SETUP.sql öffnen.
2. Der privaten Anleitung Cloudflare_Login_Einrichtung_PRIVAT.txt folgen.
3. Worker-URL in assets/login-config.js eintragen und diese auf GitHub hochladen.

ADMIN:
Flamingo anklicken + Code 3434 (Versteck-Funktion, kein Sicherheitsschutz).
Für die serverseitige Klassenübersicht zusätzlich als «Flamingo» anmelden.
Für Tagesaufgaben sind pro Kind richtige/falsche Antworten und Zeitpunkte sichtbar;
bei bisherigen Spielen werden Highscores angezeigt, nicht alle Fehlversuche.
Die To-Do-Liste bleibt lokal in diesem Browser. Cloudflare Web Analytics ist separat
im Cloudflare-Dashboard einsehbar. Admin-Passwort vor Live-Einsatz unbedingt stärken.

DATENSCHUTZ:
Das PDF mit Tier-Logins nicht öffentlich hochladen. Vor Einsatz bei Minderjährigen
Schule / Datenschutzstelle konsultieren. Lernprotokolle sind vertraulich.

SAFARI-FARBCODES:
Pink #E76084, tiefes Pink #9C3557, Grün #2E6447, Grasgrün #67966A,
Beige #FAF1D9, Sandgelb #F3C86C, Braun #5C4430, Creme #FFFDF8, Text #26382C.
