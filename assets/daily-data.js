/* Sieben abwechslungsreiche Ankunftsserien für 7.–13. November 2026.
   Pro Tag vier einzeln überprüfbare Aufgaben. 2026-11-14 wiederholt den Zyklus, bis neue Inhalte ergänzt werden. */
window.LEARNSAFARI_DAYS = [
 {
  date:'2026-11-07',theme:'Zahlensafari',tag:'Mathe',intro:'Heute entdeckst du Zahlen, Muster und eine kleine Safari-Geschichte.',
  exercises:[
   {type:'paint',title:'Malen nach Rechnungen',desc:'Rechne aus. Wähle oben die passende Farbe und male damit jedes Feld aus. Was entsteht?', art:['444444','433334','432234','431134','433334','444444'],palette:[{value:4,color:'#B87943',name:'Braun'},{value:6,color:'#E76084',name:'Pink'},{value:8,color:'#F3C86C',name:'Gelb'},{value:10,color:'#67966A',name:'Grün'}], mapping:{'1':4,'2':6,'3':8,'4':10}, expressions:{4:['2 + 2','8 − 4','2 × 2','7 − 3'],6:['3 + 3','2 × 3','9 − 3','10 − 4'],8:['4 + 4','2 × 4','12 − 4','11 − 3'],10:['5 + 5','2 × 5','14 − 4','7 + 3']}},
   {type:'sudoku',title:'Safari-Sudoku',desc:'Fülle die leeren Felder mit 1, 2, 3 oder 4. Jede Zahl darf in einer Zeile, Spalte und jedem 2×2-Quadrat nur einmal vorkommen.', solution:['1234','3412','2143','4321'],givens:['1004','0410','2003','0301']},
   {type:'choices',title:'Rechne mit den Tieren',desc:'Löse die Rechengeschichten.',questions:[
    ['Auf dem Ast sitzen 7 Vögel. 5 landen dazu. Wie viele sind es?', ['10','12','13'],1],
    ['Eine Giraffe frisst 3 Portionen mit je 4 Blättern. Wie viele Blätter?', ['7','12','14'],1],
    ['18 Zebras ziehen weiter. 6 bleiben zurück. Wie viele ziehen weiter?', ['11','12','13'],1],
    ['Vier Erdmännchen sammeln je 5 Steinchen. Wie viele Steinchen?', ['15','20','25'],1],
    ['Ein Löwe schläft 9 Stunden und dann noch 3. Wie viele insgesamt?', ['11','12','13'],1],
    ['24 Nüsse werden gerecht auf 4 Tiere verteilt. Wie viele erhält jedes?', ['5','6','8'],1]
   ]},
   {type:'match',title:'Zahl und Zerlegung',desc:'Ordne jede Zahl der passenden Hunderter-Zehner-Einer-Zerlegung zu.',pairs:[['235','2 H · 3 Z · 5 E'],['407','4 H · 0 Z · 7 E'],['680','6 H · 8 Z · 0 E'],['153','1 H · 5 Z · 3 E'],['920','9 H · 2 Z · 0 E'],['318','3 H · 1 Z · 8 E']]}
  ]
 },
 {
  date:'2026-11-08',theme:'Lesedetektive',tag:'Deutsch',intro:'Lies genau, entdecke versteckte Hinweise und spiele mit Wörtern.',
  exercises:[
   {type:'choices',title:'Eine Nachricht im Sand',desc:'Lies die Geschichte und beantworte die Fragen.',passage:'Am Morgen findet Nala neben dem Wasserloch eine Spur aus kleinen Steinen. Die Spur führt zu einem Akazienbaum. Dort sitzt ein Webervogel und singt. Unter dem Baum liegt eine blaue Feder. Nala nimmt die Feder nicht mit, weil sie dem Vogel gehören könnte. Später zeigt sie ihrem Freund das besondere Fundstück.',questions:[
    ['Wann entdeckt Nala die Steine?', ['Am Abend','Am Morgen','In der Nacht'],1],
    ['Wohin führt die Spur?', ['Zur Höhle','Zum Akazienbaum','Zum Fluss'],1],
    ['Welches Tier sitzt dort?', ['Ein Webervogel','Ein Elefant','Ein Zebra'],0],
    ['Welche Farbe hat die Feder?', ['Rot','Grün','Blau'],2],
    ['Warum lässt Nala die Feder liegen?', ['Sie ist zu gross','Sie könnte dem Vogel gehören','Sie ist nass'],1],
    ['Wem zeigt Nala später den Fund?', ['Ihrem Freund','Dem Lehrer','Ihrer Schwester'],0]
   ]},
   {type:'categorize',title:'Nomen, Verb oder Adjektiv?',desc:'Wähle zu jedem Wort die passende Wortart.',categories:['Nomen','Verb','Adjektiv'],items:[['Baum','Nomen'],['springen','Verb'],['schnell','Adjektiv'],['Wasser','Nomen'],['rufen','Verb'],['laut','Adjektiv'],['Feder','Nomen'],['lesen','Verb'],['fröhlich','Adjektiv'],['Spur','Nomen']]},
   {type:'order',title:'Eine Geschichte ordnen',desc:'Setze die Sätze in die richtige Reihenfolge. Klicke sie nacheinander an.',items:['Zuerst packt Mia ihren Rucksack.','Dann geht sie mit ihrer Klasse zum Bahnhof.','Der Zug bringt die Kinder nach Sempach.','In der Vogelwarte beobachten sie viele Vögel.','Am Mittag essen sie ihren Znüni.','Zum Schluss fahren alle zurück zur Schule.']},
   {type:'match',title:'Wörter mit ähnlicher Bedeutung',desc:'Finde zu jedem Wort ein passendes anderes Wort.',pairs:[['fröhlich','glücklich'],['rasch','schnell'],['winzig','sehr klein'],['beginnen','anfangen'],['still','leise'],['mutig','tapfer']]}
  ]
 },
 {
  date:'2026-11-09',theme:'Rhythmusreise',tag:'Musik',intro:'Heute klatschst, liest und ordnest du Rhythmen und Solmisationssilben.',
  exercises:[
   {type:'match',title:'Rhythmussprache finden',desc:'Verbinde jeden Notennamen mit der passenden Rhythmussprache.',pairs:[['Ganze Note','Ta-a-a-a'],['Punktierte halbe Note','Ta-a-a'],['Halbe Note','Ta-a'],['Viertelnote','Ta'],['Viertelpause','Sa'],['Zwei Achtelnoten','Ta-te']]},
   {type:'choices',title:'Wie viele Schläge?',desc:'Wir zählen Viertelschläge im 4/4-Takt. Achte auf Noten und Pausen.',questions:[
    ['Eine ganze Note dauert …', ['2 Schläge','4 Schläge','1 Schlag'],1],
    ['Eine halbe Note dauert …', ['1 Schlag','2 Schläge','3 Schläge'],1],
    ['Eine punktierte halbe Note dauert …', ['2 Schläge','3 Schläge','4 Schläge'],1],
    ['Eine Viertelnote dauert …', ['1 Schlag','2 Schläge','4 Schläge'],0],
    ['Zwei Achtelnoten zusammen dauern …', ['1 Schlag','2 Schläge','3 Schläge'],0],
    ['Eine Viertelpause dauert …', ['1 Schlag','0 Schläge','2 Schläge'],0],
    ['Eine halbe Note und zwei Viertelnoten zusammen dauern …', ['3 Schläge','4 Schläge','5 Schläge'],1]
   ]},
   {type:'order',title:'Die Solmisationsleiter',desc:'Ordne die Silben von unten nach oben. Das hohe Do steht am Schluss.',items:['Do (tief)','Re','Mi','Fa','So','La','Ti','Do (hoch)']},
   {type:'fill',title:'Ergänze die Rhythmus-Silben',desc:'Schreibe die passende Rhythmussprache. Vergiss die Bindestriche nicht.',fields:[['Ganze Note','Ta-a-a-a'],['Halbe Note','Ta-a'],['Viertelnote','Ta'],['Zwei Achtelnoten','Ta-te'],['Viertelpause','Sa'],['Punktierte halbe Note','Ta-a-a']]}
  ]
 },
 {
  date:'2026-11-10',theme:'Logik-Labor',tag:'Knobeln',intro:'Hier brauchst du Köpfchen: Zahlen, Hinweise und Muster.',
  exercises:[
   {type:'sudoku',title:'Knobel-Sudoku',desc:'Fülle die leeren Felder mit 1 bis 4. Keine Zahl darf doppelt in Zeile, Spalte oder 2×2-Quadrat stehen.',solution:['2341','4123','1432','3214'],givens:['2001','0103','1002','0204']},
   {type:'match',title:'Wer hat welches Haustier?',desc:'Löse das Logical. Mila hat die Katze. Noah hat weder die Katze noch den Fisch. Leni hat nicht den Hund. Jedes Kind hat genau ein anderes Tier.',pairs:[['Mila','Katze'],['Noah','Hund'],['Leni','Fisch']]},
   {type:'choices',title:'Zahlenmuster entdecken',desc:'Welche Zahl kommt als Nächstes?',questions:[
    ['5, 10, 15, 20, …',['22','25','30'],1],
    ['3, 6, 9, 12, …',['15','16','18'],0],
    ['40, 35, 30, 25, …',['15','20','22'],1],
    ['2, 4, 8, 16, …',['20','24','32'],2],
    ['100, 90, 80, 70, …',['60','65','50'],0],
    ['1, 3, 5, 7, …',['8','9','11'],1],
    ['7, 14, 21, 28, …',['32','35','42'],1]
   ]},
   {type:'categorize',title:'Gerade oder ungerade?',desc:'Ordne die Zahlen richtig zu.',categories:['gerade','ungerade'],items:[['12','gerade'],['17','ungerade'],['28','gerade'],['35','ungerade'],['44','gerade'],['51','ungerade'],['60','gerade'],['73','ungerade'],['86','gerade'],['99','ungerade']]}
  ]
 },
 {
  date:'2026-11-11',theme:'Vogelforscher',tag:'NMG',intro:'Entdecke die Welt der Rabenvögel und löse kleine Forscheraufträge.',
  exercises:[
   {type:'choices',title:'Die kluge Rabenkrähe',desc:'Lies den Sachtext sorgfältig.',passage:'Die Rabenkrähe hat schwarze Federn und einen kräftigen Schnabel. Sie ist ein Allesfresser. Sie frisst zum Beispiel Insekten, Samen und Früchte. Manchmal knackt sie harte Nahrung mit ihrem Schnabel. Rabenkrähen können sich an neue Situationen anpassen. Sie bauen Nester meist hoch oben in Bäumen.',questions:[
    ['Welche Farbe haben die Federn einer Rabenkrähe?', ['Braun','Schwarz','Weiss'],1],
    ['Was bedeutet Allesfresser?', ['Sie frisst unterschiedliche Nahrung','Sie frisst nur Samen','Sie frisst nur Fleisch'],0],
    ['Wozu nutzt die Krähe ihren Schnabel?', ['Zum Knacken von Nahrung','Zum Fliegen','Zum Hören'],0],
    ['Wo baut sie meist ihr Nest?', ['Unter Wasser','Auf dem Boden','Hoch in Bäumen'],2],
    ['Welche Nahrung nennt der Text?', ['Insekten','Schokolade','Pommes'],0],
    ['Welche Eigenschaft nennt der Text?', ['Anpassungsfähigkeit','Sie kann zaubern','Sie schläft den ganzen Tag'],0]
   ]},
   {type:'categorize',title:'Vogel oder kein Vogel?',desc:'Ordne jedes Lebewesen richtig zu.',categories:['Vogel','kein Vogel'],items:[['Krähe','Vogel'],['Spatz','Vogel'],['Fledermaus','kein Vogel'],['Adler','Vogel'],['Schmetterling','kein Vogel'],['Taube','Vogel'],['Pinguin','Vogel'],['Biene','kein Vogel'],['Frosch','kein Vogel'],['Rabe','Vogel']]},
   {type:'match',title:'Körperteile eines Vogels',desc:'Ordne jedem Körperteil seine Aufgabe zu.',pairs:[['Schnabel','Nahrung aufnehmen'],['Flügel','Fliegen unterstützen'],['Steuerfedern','Beim Lenken helfen'],['Beine','Stehen und Laufen'],['Augen','Sehen'],['Federn','Wärme speichern']]},
   {type:'order',title:'Vom Ei zum Jungvogel',desc:'Bringe diese Schritte in die passende Reihenfolge.',items:['Ein Vogel baut ein Nest.','Der Vogel legt Eier ins Nest.','Die Eier werden bebrütet.','Ein Jungvogel schlüpft.','Die Eltern füttern den Jungvogel.','Der Jungvogel verlässt später das Nest.']}
  ]
 },
 {
  date:'2026-11-12',theme:'Wörterwerkstatt',tag:'Deutsch',intro:'Entdecke Wörter, Mehrzahlen und lustige Sätze.',
  exercises:[
   {type:'categorize',title:'Die drei Wortarten',desc:'Wähle Nomen, Verb oder Adjektiv.',categories:['Nomen','Verb','Adjektiv'],items:[['Hund','Nomen'],['malen','Verb'],['freundlich','Adjektiv'],['rennen','Verb'],['Buch','Nomen'],['weich','Adjektiv'],['Schule','Nomen'],['lachen','Verb'],['leise','Adjektiv'],['Wolke','Nomen'],['springen','Verb'],['hell','Adjektiv']]},
   {type:'fill',title:'Einzahl und Mehrzahl',desc:'Schreibe die passende Mehrzahl mit dem Begleiter die.',fields:[['der Baum','die Bäume'],['das Haus','die Häuser'],['die Maus','die Mäuse'],['das Buch','die Bücher'],['der Vogel','die Vögel'],['der Stuhl','die Stühle']]},
   {type:'order',title:'Der richtige Satz',desc:'Setze die Satzteile zu einer Geschichte zusammen.',items:['Am frühen Morgen','geht die Klasse','durch den Wald.','Die Kinder','entdecken dort','eine Rabenkrähe.']},
   {type:'choices',title:'Wörter genau ansehen',desc:'Wähle die richtige Antwort.',questions:[
    ['Welches Wort ist ein Nomen?', ['spielen','Ball','fröhlich'],1],
    ['Welches Wort ist ein Verb?', ['laufen','Wiese','langsam'],0],
    ['Welches Wort ist ein Adjektiv?', ['Haus','singen','bunt'],2],
    ['Welche Mehrzahl stimmt?', ['die Tischen','die Tische','die Tisch'],1],
    ['Welches Wort schreibt man gross?', ['springen','glücklich','Blume'],2],
    ['Was ist die Steigerung von schnell?', ['schneller','schnellste als','schnellere als'],0]
   ]}
  ]
 },
 {
  date:'2026-11-13',theme:'Rätsel-Mix',tag:'Allgemein',intro:'Zum Schluss wartet eine bunte Mischung aus Mathe und Knobeleien.',
  exercises:[
   {type:'paint',title:'Das geheime Farbenmuster',desc:'Rechne aus und male alle Felder mit den passenden Farben.',art:['444444','433334','432234','431134','433334','444444'],palette:[{value:4,color:'#67966A',name:'Grün'},{value:6,color:'#E76084',name:'Pink'},{value:8,color:'#F3C86C',name:'Gelb'},{value:10,color:'#B87943',name:'Braun'}],mapping:{'1':4,'2':6,'3':8,'4':10},expressions:{4:['2 + 2','8 − 4','2 × 2'],6:['3 + 3','12 − 6','2 × 3'],8:['4 + 4','2 × 4','12 − 4'],10:['5 + 5','2 × 5','14 − 4']}},
   {type:'sudoku',title:'Vier-Zahlen-Sudoku',desc:'Finde die fehlenden Zahlen von 1 bis 4. Jede Zeile, Spalte und jedes 2×2-Feld enthält alle Zahlen genau einmal.',solution:['4312','1243','3421','2134'],givens:['4002','0203','3001','0104']},
   {type:'match',title:'Geheimschrift der Zahlen',desc:'Finde zu jeder Rechnung die passende Zahl.',pairs:[['6 × 4','24'],['7 + 8','15'],['36 − 8','28'],['3 × 9','27'],['5 × 6','30'],['48 − 12','36']]},
   {type:'choices',title:'Das grosse Knobelfinale',desc:'Denke nach und wähle eine Antwort.',questions:[
    ['Eine Uhr zeigt 8 Uhr. Wie spät ist es drei Stunden später?', ['10 Uhr','11 Uhr','12 Uhr'],1],
    ['Ein Quadrat hat … Ecken.', ['3','4','5'],1],
    ['Was ist die Hälfte von 42?', ['20','21','22'],1],
    ['Welche Zahl liegt zwischen 599 und 601?', ['598','600','602'],1],
    ['Vier Kinder erhalten je 3 Äpfel. Wie viele Äpfel sind es?', ['7','12','16'],1],
    ['Welches Wort passt nicht zu den anderen?', ['Apfel','Birne','Tisch'],2]
   ]}
  ]
 }
];
