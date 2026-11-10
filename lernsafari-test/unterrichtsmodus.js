/* LernSafari: compatibility gate for existing Cloudflare focus rules.
   This is a classroom navigation restriction, not an access-control boundary.
   Student submissions do NOT imply verified mastery. */
'use strict';
(function(root){
 const arr=x=>Array.isArray(x)?x:[];
 const text=x=>String(x??'');
 const normalizeDone=x=>new Set(arr(x).map(v=>typeof v==='object'?Number(v?.assignment_id??v?.id):Number(v)).filter(Number.isFinite));
 const gameId=x=>text(x?.file).replace(/\.html$/i,'');
 function gameMap(original){
  const map=new Map();
  for(const [subject,games] of Object.entries(original||{}))for(const game of arr(games))if(gameId(game))map.set(gameId(game),{subject,title:game.title});
  return map;
 }
 function makeState(plan,original){
  const blocks=arr(plan?.blocks).filter(x=>typeof x==='string');
  const tasks=arr(plan?.assignments).filter(a=>a&&typeof a.target==='string');
  const done=normalizeDone(plan?.done);
  const pending=tasks.filter(a=>a.kind==='pflicht'&&!done.has(Number(a.id)));
  const focus=blocks.length>0;
  // The legacy Worker has no explicit arrival/subject-mode contract.
  // A restriction can be enforced in the new UI only when focus rules and
  // an outstanding required task both exist.
  const restricted=focus&&pending.length>0;
  const assigned=new Set(tasks.map(a=>a.target));
  const games=gameMap(original);
  const assignedGames=[...assigned].filter(v=>v.startsWith('game:')).map(v=>({...games.get(v.slice(5)),id:v.slice(5)}));
  const hasDaily=[...assigned].some(v=>v.startsWith('daily:')||v.startsWith('number:')||v==='page:aufgaben');
  const subjects=new Set(assignedGames.map(g=>g.subject));
  const allowTarget=(target)=>!restricted||assigned.has(target)||target==='page:aufgaben'&&hasDaily;
  const allowDestination=(area)=>{
   if(!restricted||area==='camp'||area==='map')return true;
   if(area==='valley')return hasDaily;
   if(area==='lagoon')return assignedGames.some(g=>g.subject!=='Allgemein');
   if(area==='oasis')return assignedGames.some(g=>g.subject==='Allgemein');
   if(area==='baobab')return ['page:tiere','page:advent'].some(v=>assigned.has(v));
   return false;
  };
  const subjectCodes={math:'Mathe',german:'Deutsch',nmg:'NMG',music:'Musik',english:'Englisch'};
  const allowSubject=code=>!restricted||subjects.has(subjectCodes[code]||code);
  const allowGame=id=>!restricted||assigned.has('game:'+id);
  return {focus,restricted,blocks,pending,assigned,assignedGames,hasDaily,subjects,allowTarget,allowDestination,allowSubject,allowGame};
 }
 root.LernSafariFocusGate={makeState,gameMap};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.LernSafariFocusGate;
})(typeof window==='undefined'?globalThis:window);
