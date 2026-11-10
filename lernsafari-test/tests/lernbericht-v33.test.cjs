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
console.log('PASS: 15 LernSafari 3.3 report checks');