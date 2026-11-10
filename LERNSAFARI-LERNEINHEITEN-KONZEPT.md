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
