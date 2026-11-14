# LernSafari – Architektur für kompetenzorientierte Lerneinheiten

**Status: Konzept, noch nicht implementiert.** Stand: 10.11.2026. Grundlage: vom Nutzer bereitgestelltes dreiseitiges PH-Luzern-Prozessmodell nach Wilhelm, Luthiger & Wespi (2014): Konfrontations-, Erarbeitungs-, Übungs-/Vertiefungs-, Transfer-/Syntheseaufgaben sowie formative und summative Beurteilungsaufgaben. Die Bezeichnungen bleiben verbindlich.

## Grundentscheidung

Die übergeordnete Einheit ist **Lerneinheit → Lernziele → Lernschritte/Inhalte → Ereignisse und Rückmeldungen**. Spiele sind mögliche Lernschritte, nicht die oberste Ebene. Mehrere Lerneinheiten können auf dasselbe Spiel verweisen. Die LernSafari ergänzt den Unterricht und beansprucht nicht, alles Lernen digital zu messen.

Die bestehenden Bereiche **Camp, Briefkasten, Kompass, Baobab-Baum, Lern-Lagune** bleiben unverändert. Das persönliche **Logbuch** und der **Lehrpersonen-Lernbericht** zeigen denselben fachlichen Lernpfad aus unterschiedlicher Sicht. Die Lern-Lagune enthält die interaktiven Übungen, der Baobab-Baum kann Wissens-/Input-Inhalte aufnehmen.

## Lernschritttypen / Logbuch / Lernbericht

| Typ | Kinder-Logbuch | Lehrpersonen-Lernbericht | Bewertung |
|---|---|---|---|
| Ka Konfrontation, Vorwissen | Meine Idee, vor/nach der Einheit wieder ansehen | Teilnahme, individuelle Vorstellungen/Beispiele, qualitative Analyse | **keine Punkte für «richtiges» Vorwissen** |
| Input (Text, Bild, Ton, Video; Inhaltsform, keine separate Ka/Ea/Üa/Ta-Kategorie) | Zugewiesen, geöffnet, selbst bestätigt; Input erneut öffnen | Zugewiesen, geöffnet, bestätigt; keine Behauptung «verstanden» | Keine Erfolgsquote allein durch Öffnen/Abspielen |
| Ea Erarbeitungsaufgabe | Eigene Beobachtungen, Entdeckungen, Erläuterungen, Feedback | Bearbeitung, Zwischenergebnisse, ggf. Kriterien/Rückmeldung | Formativ; offen oder geschlossen |
| Üa Übungs-/Vertiefungsaufgabe | Wiederholungen, Lernhilfe, direkte Rückmeldung, Fortschritt | Bew. / unbew. Antworten, Übungsaktivität, wiederholte Anwendungen, je Lernziel | Nur echte bewertete Versuche für Quote |
| Ta Transfer-/Syntheseaufgabe | Eigenes Produkt, Begründung, Selbstreflexion | Eingereicht, Kriterien, begründete Rückmeldung, Lernprozess | Offene Aufgaben nicht automatisch durch Punkte ersetzen |
| FBa formative Beurteilungsaufgabe («Teste dein Wissen» usw.) | Lernzielbezogene Rückmeldung: Das gelingt / Das übe ich noch; gezielte Weiterarbeit | Lernzielprofil, offene Fehlkonzepte, nächste passende Übung | Keine automatische summative Note oder Prüfungsaussage |
| SBa summative Beurteilungsaufgabe | Nur mit klar freigegebenem Rückmeldemodus | Offizielles Rubric/Beurteilungsraster, Lehrperson entscheidet | Separat; nie aus Spiel-Highscores ableiten |

## Drei strikt getrennte Dimensionen

1. **Zugang/Nutzung:** nicht zugewiesen, zugewiesen, geöffnet, selbst als bearbeitet bestätigt. Medienfortschritt (Audio/Video Ende) nur als technisches Ereignis, keine Verständnisaussage.
2. **Bearbeitung/Leistung:** Antworten, bewertet/unbewertet, Rückmeldungen, Produkte, offene Kriterien; präzise Datenlage.
3. **Auftragsstatus:** fälliger Auftrag, als erledigt markiert, bei Bedarf von Lehrperson gesichtet/freigegeben. Niemals allein aus Highscore oder «geöffnet» setzen.

Zu optionalen Reflexionsfragen: «Das habe ich verstanden», «Das möchte ich noch üben», «Das hat mich überrascht» – Selbstauskunft, nicht als objektive Leistung markieren. Die Lehrperson kann Unterrichtsbeobachtungen ergänzen; Offline-Arbeit muss manuell dokumentierbar sein.

## Vorgeschlagenes Datenmodell (Entwurf, keine Datenbankänderung vor Freigabe)

- `units`: id, title, subject, description, schedule, status
- `learning_objectives`: id, unit_id, text, competence_reference, assessment_criteria, optional assessment weight
- `learning_steps`: id, unit_id, type (Ka/Ea/Üa/Ta/FBa/SBa/input), title, media_type, config, order, required/optional, release
- `step_objectives`: many-to-many learning_step ↔ objective, optional evidence strength
- `assignments`: target step, group/child, due date, differentiation level, status
- `learning_events`: minimal actor id, step id, event type, time, result status, attempt id; avoid collecting private prose unless pedagogically needed
- `assessment_evidence`: objective id, step id, attempt id, evaluation type (auto, self, teacher), rubric level, timestamp
- `feedback`: teacher and automated feedback separately marked
- `learning_artifacts`: references to child-created products; retention/permissions necessary

Do not infer comprehension from page views. Keep timestamps as learning metadata only, with minimal storage/retention. Students see only own learning record; teachers see authorised class; guests have no persistent personal records.

## UX

**Logbuch:** Current units → per unit a meaningful progress trail and goals. Each step has one of: Noch nicht begonnen / Geöffnet / Bearbeitet / Überprüft / Rückmeldung verfügbar. A separate, friendly «Das übe ich als Nächstes» link to aligned Üa. No red/green grades for Ka or Input. Accessible on laptop/mobile.

**Teacher report:** unit selector → learning objectives → matrix of children and evidence type/status. Click a child for chronological learning journey: Ka preconceptions → opened/confirmed inputs → Ea/Üa → Ta → FBa. Clearly disclose lack of evidence; filter by type and objective, show both quantity and quality. Never collapse distinct task types into a single percentage.

## Beispiel-Einheit: Rabenvögel

- Ziele (vorerst Beispiele, müssen vom Lehrer verbindlich formuliert werden): Arten erkennen und unterscheiden; Nahrung und Schnabel; Lebensraum und Gefährdung; Federtypen und deren Funktion.
- Ka: «Welche Rabenvögel kennst du in unserer Umgebung? Was glaubst du: Was fressen sie?» Erste Ideen speichern, später wieder aufrufen.
- Input: Bild-/Ton-/Textkarten zu Rabenkrähe, Elster, Dohle usw.; getrennte Angaben «geöffnet» und «bearbeitet bestätigt».
- Ea: Vögel anhand charakteristischer Merkmale vergleichen; eigene Forscherfrage «Wie kann eine Rabenkrähe mit ihrem Schnabel unterschiedliche Nahrung aufnehmen?» dokumentieren.
- Üa: Artenbilder zuordnen, Lebensraum verbessern, Nahrung/Federfunktionen üben, mit erklärendem Feedback.
- Ta: Für einen Schulhof eine begründete Vogel-freundliche Gestaltung vorschlagen; offen und rubrikgestützt.
- FBa: «Teste dein Wissen»: Antworten pro Ziel darstellen; gezieltes Üben statt pauschales «bereit/nicht bereit».
- SBa: Lernkontrolle separat durch Lehrperson konzipiert/beurteilt, keine automatische Übernahme von Übungsnoten.

## Entwicklungs- und Freigabeplan

1. Lernziele, Kompetenzen und Unterrichtsplanung vom Lehrer aufnehmen; Mapping `unit → objective → step → evidence` abstimmen.
2. Frontend-Design für Lerneinheiten und Kinder-Logbuch als Mockup mit Beispieldaten entwickeln; bestehende funktionierende Version weiterlaufen lassen.
3. Cloudflare-Datenmodell und Worker-Zugriffsrechte (Schüler-/Lehrperson) separat planen; Migration und Rückwärtskompatibilität testen.
4. Erst Basisereignisse (Input zugewiesen/geöffnet/bestätigt; Übung bew./unbew.) implementieren, ohne gespeicherte Daten zu verlieren.
5. Dann formative Lernzielberichte, offene Lehrer-Rückmeldungen und optionale Offline-Evidenz ergänzen.
6. Echte Tests mit Tier-Testkonto/Lehrperson auf Cloudflare-Preview; Datenschutz, UI und Messgenauigkeit prüfen; erst dann veröffentlichen.

**Verbindlich für künftige Spiele:** Neben `LERNSAFARI-NEUE-SPIELE-LERNBERICHT-PFLICHT.md` muss jeder neue Inhalt einen Typ, eine Lerneinheit und die betreffenden Lernziele erhalten. Reine Inputs werden als Nutzung erfasst, Übungs-/Testaufgaben über korrekte Evidenz; offene Ergebnisse benötigen passende Rückmeldung statt erfundene Quoten.


## Verbindliches Grundprinzip: Digital dokumentiert, analog und digital gelernt

**Leitentscheid des Lehrers:** Eine Lerneinheit enthält bewusst digitale und analoge Aktivitäten – Arbeitsblätter, Experimente, Naturbeobachtungen, Partner-/Gruppenaufträge, Materialarbeiten und Produkte. Das ganze Lernen kann im persönlichen Logbuch und im Lehrpersonen-Lernbericht dokumentiert werden, **ohne dass jede Aufgabe am Bildschirm bearbeitet werden muss**. Der Speicherort des Lernnachweises ist unabhängig vom Bearbeitungsmedium.

Jeder `learning_step` erhält zusätzliche Felder:
- `modality`: `digital` / `paper` / `experiment` / `observation` / `material` / `conversation` / `mixed`
- `evidence_method`: `automatic_answer` / `pupil_confirmation` / `photo_upload` / `file_upload` / `teacher_observation` / `teacher_review` / `none` (ggf. kombiniert)
- `submission_required`, `group_mode`, `assessment_mode`, `objectives`, `material_links`, `safety_notes`

### Standardablauf für analoge Aufgaben

1. **Vorbereiten:** Lehrperson erstellt mit ChatGPT die Aufgabe inkl. Lernziel, Materialliste, Zeit, Anleitung, Differenzierung, Druckvorlage, Erwartungshorizont, Lösung oder Kriterienraster und der Art des Lernnachweises.
2. **Zuweisen:** Aufgabe erscheint im persönlichen Logbuch unter der Lerneinheit mit Symbol «Papier», «Experiment» usw.; Arbeitsblatt herunterladen oder Material im Klassenzimmer nehmen.
3. **Analog durchführen:** Eigenständig/zu zweit/in der Gruppe schreiben, forschen, bauen, messen, beobachten, diskutieren. Auch Arbeiten ohne hochladbares Produkt sind gültige Lernschritte.
4. **Dokumentieren:** Kinder fotografieren das Blatt/Produkt oder laden PDF/Bild hoch, tippen eine kurze Reflexion ein oder die Lehrperson vermerkt eine Beobachtung. Bei Gruppenaufgaben nur geeignete Gruppenabgabe mit nachvollziehbarer Zuordnung.
5. **Prüfen:** Eindeutige, strukturierte Antworten können nach zuverlässiger Erfassung und bei Bedarf manueller Bestätigung regelbasiert geprüft werden; Handschrift, Skizzen, offene Begründungen und Experimentergebnisse benötigen einen Prüf-/Freigabeschritt der Lehrperson. Eine optionale KI-Rückmeldung ist ein **Vorschlag**, keine automatische offizielle Beurteilung.
6. **Rückmelden:** Logbuch zeigt «Abgabe erhalten», «Überprüfung läuft», «Rückmeldung vorhanden», «Überarbeitung erwünscht» oder «von Lehrperson geprüft». Lernbericht zeigt die Evidenz je Lernziel, niemals automatisches «verstanden» wegen eines Uploads.

### Richtigkeit und Beurteilung

- **Geschlossene Antworten:** z. B. ankreuzen, Zahlen, eindeutige Zuordnungen → nach sicherer Digitalisierung automatisch prüfbar. Unsichere Texterkennung oder unleserliche Scans als «manuell prüfen» markieren, nicht als falsch.
- **Halboffene Antworten:** z. B. kurzer Satz → Vorschläge oder Teilkriterien, mit Lehrpersonenprüfung.
- **Offene Lösungen/Transfer:** z. B. Experimentauswertung, begründete Massnahmen → kriterienorientierte Rückmeldung, keine erfundene Prozentquote.
- **Experimente:** Durchführung, Beobachtung, Messdaten, Erklärung und Reflexion getrennt dokumentieren. Eine unerwartete Messung ist nicht automatisch eine falsche Leistung. Sicherheitsregeln stehen auf Arbeitsblatt und im Logbuch.
- **Formative Beurteilung:** Lernhinweise und nächste Schritte aus Abgabe + Feedback ableiten. **Summative Beurteilungen** bleiben davon getrennt und unter Kontrolle der Lehrperson.
- **Ohne digitale Abgabe:** Lehrperson kann «durchgeführt», Beobachtungsnotiz oder Kriterienstand eintragen. Ein fehlender Upload bedeutet nicht automatisch «nicht gelernt».

### Uploads: technische und datenschutzbezogene Anforderungen

- Cloudflare Worker prüft **serverseitig** Anmeldung, Eigentümerschaft, Lehrpersonenrolle und Klassenbezug; keine fremden Arbeiten abrufbar. Gäste laden nichts Personenbezogenes hoch.
- Geeigneter Speicher für Dateien (z. B. privater Objektspeicher) getrennt von strukturierten Daten; Upload-Grössen/Typen begrenzen, Dateiinhalte kontrollieren, sichere zufällige Objektschlüssel; keine öffentlich erratbaren Links.
- Erforderliche Metadaten nur: Konto, Lerneinheit, Aufgabe, Upload-Zeit, Status, ggf. Gruppenbezug; keine unnötigen Gesichter oder persönlichen Daten im Bild. Datenschutz/Einwilligung, Aufbewahrungs- und Löschkonzept mit schulischen Vorgaben abstimmen, bevor echte Kinderarbeiten hochgeladen werden.
- Bei automatischer Analyse Handschrift/OCR nie stillschweigend als verlässlich behandeln; Unsicherheit und erkannte Antwort für Kind/Lehrperson sichtbar machen. Vor Verwendung externer KI-Dienste schulische Datenschutzfreigabe klären. Keine automatische Benotung durch KI.
- Bild- und Dokument-Uploads auch auf Laptop und Handy gut bedienbar gestalten, Eingabealternativen und barrierearme Möglichkeit für Kinder ohne eigenes Gerät bereitstellen.
- Abgaben versionieren: Original, Überarbeitung, Rückmeldung, Freigabe. Keine Löschung/Überschreibung ohne Nachvollziehbarkeit.
- **Noch kein implementiertes Feature:** Erst Datenmodell, Berechtigungen, UI und Testablauf im Entwicklungsbranch planen und auf Preview mit fiktiven Konten erproben. Version 3.2 und laufende 3.3-Lernberichte unverändert lassen.

### Beispiel: Rabenvögel – analog-digitaler Lernpfad

| Inhalt | Medium | Dokumentation | Prüfung |
|---|---|---|---|
| Ka «Was glaubst du über Rabenvögel?» | Gespräch / Papier | Erste Vorstellung fotografieren oder in Logbuch eintippen | Nicht nach richtig/falsch beurteilen |
| Input zu Schnabel und Nahrung | Buch, Bilder, Audio | Bearbeitung durch Kind bestätigen | Verständnis erst in anschliessender Aufgabe |
| Forscherauftrag Schnabelformen | Experiment mit verschiedenen Werkzeugen | Beobachtungsbogen als Foto/PDF; eigene Erklärung | Durchführung & Begründung mit Kriterien überprüfen |
| Rabenvogelarten üben | Digitales Zuordnungsspiel | Automatische Lernversuche | Geschlossene Antworten direkt prüfen |
| Lebensraum gestalten | Gruppe, Papier/Modell | Foto/Skizze/Lehrerbeobachtung | Transfer und Begründung anhand Raster |
| «Teste dein Wissen» | Laptop oder analoges Blatt | Digitale Antworten oder hochgeladenes Blatt | Formative, lernzielbezogene Rückmeldung |

### Priorisierter Entwicklungsplan

1. In Lerneinheiten Lernschritte mit Medium, Nachweisart und Lernzielbezug erfassen.
2. Zuerst **analog erledigt + Lehrerbestätigung** ohne Upload ermöglichen, damit Papier- und Experimentaufträge sofort einen Platz im Logbuch haben.
3. Anschliessend Datei-/Foto-Einreichung mit Rollenrechten, privater Speicherung und nachvollziehbaren Rückmeldungen aufbauen.
4. Zuletzt automatische Prüfroutinen für **geeignete** Aufgabenformate und eine kontrollierte Vorprüfung offener Aufgaben ergänzen.
5. Jede Stufe mit Testkonten und ohne echte Schülerdokumente prüfen, bevor sie veröffentlicht wird.


## Umsetzungsetappen und Altersangemessenheit – Präzisierung vom 10.11.2026

### Bestehende Spiele und laufende Unterrichtsplanung
- **Keine rückwirkende Umstellung** der bereits aufgeschalteten Spiele auf Lerneinheiten und Lernziele. Die aktuellen und anstehenden Unterrichtseinheiten sind bereits geplant; die Inhalte der LernSafari dienen derzeit als **ergänzende Übungen zum Präsenzunterricht**.
- Die bisherige Auswertung nach Spielen, Versuchen, richtigen Antworten, Highscores und zeitlicher Entwicklung bleibt sinnvoll und wird als eigenständiger Funktionsbereich weitergeführt.
- Das hier entworfene umfassende Lerneinheiten-Konzept ist **ausschliesslich für später gemeinsam entworfene Einheiten** vorgesehen. Auch dort bleiben analoge und digitale Angebote kombinierbar.
- Neue Spiele, die vor Einführung vollständiger Lerneinheiten entstehen, müssen weiterhin die bestehende Lernbericht-Anbindung erhalten; sie müssen dafür vorläufig **keine künstlich erfundenen Lernziel-Zuordnungen** bekommen.

### Auswertung von Antworten von Kindern im Alter von 8–9 Jahren
- **Fachwissen und Ausdrucksform trennen**: In NMG/Mathe/Musik fachliche Kernaussage prüfen, nicht automatisch Rechtschreibung, Satzvollständigkeit oder Handschrift. In sprachbezogenen Deutschaufgaben darf Form ein ausdrücklich ausgewiesenes Beurteilungskriterium sein.
- Antworten dürfen je nach Aufgabe als Stichwörter, kurze Sätze, Auswahl, Zuordnung, Zeichnung, Foto eines Blatts, Lehrpersonenbeobachtung oder später optional Audio eingereicht werden.
- Tippfähigkeiten oder Schönschreiben dürfen kein verstecktes Hindernis für das Nachweisen von Sachwissen werden.
- **Drei Prüfausgänge:** fachlich richtig / fachlich noch nicht richtig / **manuelle Überprüfung nötig**. Unklare, schwer lesbare oder nicht sicher interpretierbare Antworten sind nicht falsch zu werten.
- Bei automatischer Prüfung nicht nur exakte Textübereinstimmung verwenden; fachlich akzeptable Varianten und häufige altersbedingte Schreibweisen müssen berücksichtigt werden, soweit zuverlässig möglich.
- Nicht jeden offenen Inhalt mit KI oder OCR «automatisch korrigieren». Erkannten Text für Lehrperson sichtbar machen; unsichere Lesungen durch Rückfrage oder manuelle Kontrolle abklären. Keine automatische Notenbildung aus diesen Vorschlägen.
- **Für jeden Auftrag ein explizites Bewertungsprofil**: fachliche Kriterien; sprachliche Kriterien (nur wenn Lernziel); zulässige Antwortformen; automatischer vs. manueller Prüfschritt; erwartete Variationen.
- Rückmeldungen wertschätzend und konkret formulieren: z. B. «Du hast richtig erkannt, dass Daunenfedern wärmen.» statt unzutreffender Kritik wegen unvollständiger Satzstruktur.

### Umsetzung
Bei Erstellung einer zukünftigen Lerneinheit zuerst prüfen, welche Arbeit auf Papier oder mit Material sinnvoller ist. Uploads und automatische Erkennung erst nach Rollen-, Datenschutz-, Zuverlässigkeits- und Lehrpersonenprüfungen freigeben. Die laufende Version 3.3 wird durch diese Konzeptpräzisierung **nicht** zu einer vollständigen Lernzielplattform umgebaut.
