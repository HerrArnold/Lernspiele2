#!/usr/bin/env node
/* Integration gate for NEW LernSafari games. Existing games are a frozen baseline.
   Does not need credentials; live test with two authenticated test accounts is still required. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalogJs=fs.readFileSync(path.join(root,'integration.js'),'utf8');
const catalogMatch=catalogJs.match(/const ORIGINAL_GAMES = (\{[^\n]+\});/);
if(!catalogMatch)throw Error('Der Spielekatalog ORIGINAL_GAMES konnte nicht gelesen werden.');
const catalog=JSON.parse(catalogMatch[1]);
const previous=new Set(JSON.parse(fs.readFileSync(path.join(root,'tests/lernbericht-baseline.json'),'utf8')).existingGames);
const catalogItems=Object.entries(catalog).flatMap(([subject,entries])=>entries.map(item=>({...item,subject})));
const seen=new Set(), errors=[];
const gameNames=fs.readdirSync(path.join(root,'original/spiele')).filter(x=>x.endsWith('.html'));
const gameSet=new Set(gameNames);
for(const item of catalogItems){
 const name=item.file;
 if(typeof name!=='string'||!name.endsWith('.html')||name.includes('/')||name.includes('\\')){errors.push('Ungültiger Dateiname im Spielekatalog: '+name);continue;}
 if(seen.has(name))errors.push('Spiel mehrfach registriert: '+name);
 seen.add(name);
 if(!gameSet.has(name))errors.push('Registriertes Spiel fehlt: '+name);
 if(previous.has(name))continue; // Established games are NOT retroactively reclassified here.
 const html=fs.readFileSync(path.join(root,'original/spiele',name),'utf8');
 const notAssessed=/<!--\s*LERNSAFARI:\s*NON_ASSESSED\s*-->/i.test(html);
 if(notAssessed){
   // Explicit documented exemption for non-exercise resources. No outcome report is promised.
   if(/SafariTelemetry\s*\?\.\s*record\s*\(|SafariTelemetry\.record\s*\(/.test(html))
      errors.push(name+': Nicht-bewertetes Spiel nutzt trotzdem SafariTelemetry.');
   continue;
 }
 if(!/assets\/game-telemetry\.js/.test(html))
   errors.push(name+': Skript game-telemetry.js fehlt – keine Lernversuche im Lernbericht.');
 if(!/assets\/highscore\.js/.test(html))
   errors.push(name+': Skript highscore.js fehlt – kein Highscore im Lernbericht.');
 if(!/SafariTelemetry\s*(?:\?\.)?\.\s*record\s*\(/.test(html))
   errors.push(name+': Kein SafariTelemetry.record(...) bei einer bewerteten Antwort gefunden.');
}
for(const name of gameNames)if(!seen.has(name))errors.push('Spiel-Datei nicht im LernSafari-Spielekatalog: '+name);
const report=fs.readFileSync(path.join(root,'lernbericht-v33.js'),'utf8');
if(!report.includes('catalogFrom(originalGames)')&&!report.includes('catalogFrom(original)'))
 errors.push('Der Lernbericht liest den zentralen Spielekatalog nicht mehr.');
if(!report.includes('data?.attempts')||!report.includes('data?.highscores'))
 errors.push('Der Lernbericht verarbeitet Lernversuche/Highscores nicht mehr.');
console.log('Bestehende Spiele:',previous.size,'· Im aktuellen Katalog:',catalogItems.length,'· Neue Spiele:',catalogItems.filter(g=>!previous.has(g.file)).length);
if(errors.length){console.error(errors.map(x=>'FEHLER: '+x).join('\n'));process.exit(1);}
console.log('PASS: Jedes neue Lernspiel erfüllt den Lernbericht-Vertrag oder ist ausdrücklich als nicht bewertet gekennzeichnet.');
