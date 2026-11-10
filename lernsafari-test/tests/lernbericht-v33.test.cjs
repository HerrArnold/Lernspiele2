const assert = require('node:assert/strict');
const progress=require('../lernbericht-v33.js');
const catalog=progress.catalogFrom({Mathematik:[{file:'reihe.html',title:'Reihe'}],Musik:[{file:'rhythmus.html',title:'Rhythmus'}]});
assert.equal(catalog.length,2);
const data=progress.enrich({students:[{username:'Eidechse'}],attempts:[
 {username:'Eidechse',game:'reihe',is_correct:1,created_at:'2026-11-02T10:00:00Z'},
 {username:'Eidechse',game:'reihe',is_correct:0,created_at:'2026-11-10T10:00:00Z'},
 {username:'Eidechse',game:'rhythmus',is_correct:true,created_at:'2026-11-10T10:00:00Z'},
 {username:'Eidechse',game:'rhythmus',is_correct:'1',created_at:'2026-11-10T10:01:00Z'},
 {username:'Andere',game:'reihe',is_correct:1,created_at:'2026-11-10T10:00:00Z'}
],highscores:[{username:'Eidechse',game:'reihe',score:4},{username:'Eidechse',game:'reihe',score:11},{username:'Eidechse',game:'rhythmus',score:0}]},catalog);
const all=progress.aggregate(data.attempts,data.scores,'Eidechse','all','all','all',new Date('2026-11-10T18:00:00Z'));
assert.equal(all.attempts,4);assert.equal(all.right,3);assert.equal(all.rate,'75 %');assert.equal(all.highscoreGames,2);assert.equal(all.trend.length,2);assert.equal(all.games.find(g=>g.key==='reihe').best,11);
const filtered=progress.aggregate(data.attempts,data.scores,'Eidechse','Mathematik','reihe','7',new Date('2026-11-10T18:00:00Z'));
assert.equal(filtered.attempts,1);assert.equal(filtered.right,0);assert.equal(filtered.games[0].best,11);
const stranger=progress.aggregate(data.attempts,data.scores,'Andere','all','all','all',new Date('2026-11-10T18:00:00Z'));
assert.equal(stranger.attempts,1);assert.equal(stranger.highscoreGames,0);
const empty=progress.aggregate([],[],'Eidechse','all','all','all');assert.equal(empty.rate,'–');
assert.equal(progress.dateOf({created_at:'invalid'}),null);

// Alternate timestamps and Swiss-local calendar weeks.
assert.equal(progress.dateOf({created_at:'invalid',answered_at:'2026-11-10T10:00:00Z'}).toISOString(),'2026-11-10T10:00:00.000Z');
assert.equal(progress.dateOf({timestamp:'1794304800'}).toISOString(),'2026-11-10T10:00:00.000Z');
const midnight=progress.enrich({students:[],attempts:[{username:'Eidechse',game:'reihe',is_correct:1,created_at:'2026-11-08T23:30:00Z'},{username:'Eidechse',game:'reihe',is_correct:0,created_at:'2026-11-09T10:00:00Z'}],highscores:[]},catalog);
assert.equal(progress.aggregate(midnight.attempts,midnight.scores,'Eidechse','all','all','all').trend.length,1,'Swiss Monday should group late Sunday UTC with local Monday');
assert.equal(progress.aggregate(midnight.attempts,midnight.scores,'Eidechse','all','all','7',new Date('2026-11-10T18:00:00Z')).attempts,2);


const assignments={assignments:[
 {id:1,audience:'all',target:'game:reihe'},
 {id:2,audience:'child',username:'Eidechse',target:'game:rhythmus'},
 {id:3,audience:'child',username:'Giraffe',target:'game:reihe'}
],done:[
 {assignment_id:1,username:'Eidechse'},
 {assignment_id:2,username:'Eidechse'},
 {assignment_id:3,username:'Giraffe'},
 {assignment_id:1,username:'Giraffe'},
 {assignment_id:2} // unknown ownership must not count
]};
assert.deepEqual(progress.assignmentSummary(assignments,'Eidechse'),{completed:2,total:2});
assert.deepEqual(progress.assignmentSummary(assignments,'Giraffe'),{completed:2,total:2});
assert.deepEqual(progress.assignmentSummary(assignments,'Elefant'),{completed:0,total:1});
assert.deepEqual(progress.assignmentSummary(null,'Elefant'),{completed:0,total:0});


const mixed=progress.enrich({attempts:[
 {username:'Eidechse',game:'reihe',is_correct:true,created_at:'2026-11-09T10:00:00Z'},
 {username:'Eidechse',game:'reihe',is_correct:false,created_at:'2026-11-09T11:00:00Z'},
 {username:'Eidechse',game:'reihe',created_at:'2026-11-09T12:00:00Z'},
 {username:'Eidechse',game:'reihe',is_correct:null,created_at:'2026-11-09T13:00:00Z'}
]},catalog);
const mixedSummary=progress.aggregate(mixed.attempts,mixed.scores,'Eidechse','all','all','all');
assert.equal(mixedSummary.attempts,4);
assert.equal(mixedSummary.evaluated,2);
assert.equal(mixedSummary.unrated,2);
assert.equal(mixedSummary.right,1);
assert.equal(mixedSummary.rate,'50 %','Unrated attempts must not lower success rate');
assert.equal(mixedSummary.games[0].evaluated,2);
assert.equal(mixedSummary.trend[0].evaluated,2);
const onlyUnrated=progress.enrich({attempts:[{username:'Eidechse',game:'reihe',created_at:'2026-11-09T10:00:00Z'}]},catalog);
assert.equal(progress.aggregate(onlyUnrated.attempts,[],'Eidechse','all','all','all').rate,'–');

// A low sample size is a warning, never a grading decision.
assert.match(progress.dataCaution(0,0),/keine Übungsversuche/);
assert.match(progress.dataCaution(0,4),/keine bewerteten/);
assert.match(progress.dataCaution(4,12),/wenig aussagekräftig/);
assert.equal(progress.dataCaution(5,5),'');
const fs=require('node:fs');
const reportJs=fs.readFileSync(require('node:path').join(__dirname,'..','lernbericht-v33.js'),'utf8');
const reportCss=fs.readFileSync(require('node:path').join(__dirname,'..','lernbericht-v33.css'),'utf8');
assert.match(reportJs,/id="cloudV33Print"/);
assert.match(reportJs,/state\.person\|\|!panel\.isConnected/);
assert.match(reportCss,/body\.cloud-v33-print-active \.cloud-v33-detail/);
assert.match(reportCss,/body\.cloud-v33-print-active \*/);
console.log('PASS: LernSafari 3.3 report checks, including Swiss week boundaries');