/* LernSafari 3.3: read-only teacher dashboards. Called only after server-authorised /admin-report. */
'use strict';
(function(root){
 const asArray=x=>Array.isArray(x)?x:[];
 const txt=x=>String(x??'');
 const dateOf=row=>{
  for(const raw of [row?.created_at,row?.answered_at,row?.occurred_at,row?.timestamp,row?.at]){
   if(raw===undefined||raw===null||raw==='')continue;
   const numeric=typeof raw==='string'&&/^\d{10,13}$/.test(raw)?Number(raw):raw;
   const date=new Date(typeof numeric==='number'&&numeric<1e11?numeric*1000:numeric);
   if(Number.isFinite(date.getTime()))return date;
  }
  return null;
 };
 const correctness=row=>row?.is_correct===true||row?.is_correct===1||row?.is_correct==='1'?true:row?.is_correct===false||row?.is_correct===0||row?.is_correct==='0'?false:null;
 const gameKey=row=>txt(row?.game??row?.game_id).trim();
 const displayDate=d=>new Intl.DateTimeFormat('de-CH',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
 const percent=(ok,total)=>total?Math.round(ok/total*100)+' %':'–';
 const localMonday=d=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const get=t=>parts.find(p=>p.type===t)?.value;const day=new Date(Date.UTC(Number(get('year')),Number(get('month'))-1,Number(get('day'))));day.setUTCDate(day.getUTCDate()-(day.getUTCDay()+6)%7);return day.toISOString().slice(0,10);};
 function catalogFrom(original){
  const entries=[];
  for(const [subject,games] of Object.entries(original||{}))for(const game of asArray(games)){
   if(!game?.file)continue;
   entries.push({key:game.file.replace(/\.html$/i,''),subject,title:txt(game.title||game.file)});
  }
  return entries;
 }
 function enrich(data,catalog){
  const dict=new Map(catalog.map(g=>[g.key,g]));
  const meta=key=>dict.get(key)||{key,subject:'Weitere',title:key||'Unbekanntes Spiel'};
  const attempts=asArray(data?.attempts).map(a=>({...a,_game:gameKey(a),_meta:meta(gameKey(a)),_date:dateOf(a),_correct:correctness(a)}));
  const scores=asArray(data?.highscores).filter(h=>gameKey(h)&&Number.isFinite(Number(h.score))&&Number(h.score)>=0).map(h=>({...h,_game:gameKey(h),_meta:meta(gameKey(h)),_value:Number(h.score)}));
  return {students:asArray(data?.students),attempts,scores,catalog};
 }
 function aggregate(attempts,scores,username,subject,game,days,now){
  const matches=(row)=>txt(row.username)===username&&(subject==='all'||row._meta.subject===subject)&&(game==='all'||row._game===game);
  const end=now||new Date();
  const filtered=attempts.filter(row=>matches(row)&&(days==='all'||(row._date&&row._date<=end&&row._date>=new Date(end.getTime()-Number(days)*86400000))));
  const eligibleScores=scores.filter(row=>matches(row));
  const byGame=new Map();
  for(const score of eligibleScores){const item=byGame.get(score._game)||{key:score._game,meta:score._meta,best:null,attempts:0,correct:0,evaluated:0,dated:[]};item.best=Math.max(item.best??0,score._value);byGame.set(score._game,item);}
  for(const row of filtered){if(!row._game)continue;const item=byGame.get(row._game)||{key:row._game,meta:row._meta,best:null,attempts:0,correct:0,evaluated:0,dated:[]};item.attempts++;if(row._correct!==null)item.evaluated++;if(row._correct===true)item.correct++;if(row._date)item.dated.push(row);byGame.set(row._game,item);}
  const games=[...byGame.values()].sort((a,b)=>a.meta.title.localeCompare(b.meta.title,'de-CH'));
  const right=filtered.filter(x=>x._correct===true).length;
  const evaluated=filtered.filter(x=>x._correct!==null).length;
  const weeks=new Map();
  for(const row of filtered){if(!row._date)continue;const wk=localMonday(row._date);const item=weeks.get(wk)||{week:wk,count:0,right:0,evaluated:0};item.count++;if(row._correct!==null)item.evaluated++;if(row._correct===true)item.right++;weeks.set(wk,item);}
  const trend=[...weeks.values()].sort((a,b)=>a.week.localeCompare(b.week));
  return {attempts:filtered.length,right,evaluated,unrated:filtered.length-evaluated,rate:percent(right,evaluated),games,highscoreGames:games.filter(g=>g.best!==null).length,trend,missingDates:filtered.some(x=>!x._date),undated:attempts.filter(x=>matches(x)&&!x._date).length};
 }

 // Assignment checkmarks are independent of scores and answer correctness.
 // Missing ownership information is NOT counted as a completed child assignment.
 function assignmentSummary(learning,username){
  const assignments=asArray(learning?.assignments).filter(a=>
   a?.audience==='all'||(a?.audience==='child'&&txt(a?.username)===username));
  const completedIds=new Set(asArray(learning?.done)
   .filter(row=>txt(row?.username)===username||txt(row?.student_username)===username)
   .map(row=>Number(row?.assignment_id)).filter(Number.isFinite));
  const total=assignments.length;
  const completed=assignments.filter(a=>completedIds.has(Number(a.id))).length;
  return {completed,total};
 }
 function dataCaution(evaluated,attempts){
  if(!attempts)return 'Noch keine Übungsversuche in dieser Auswahl.';
  if(!evaluated)return 'Noch keine bewerteten Antworten – eine Erfolgsquote ist nicht möglich.';
  if(evaluated<5)return 'Weniger als fünf bewertete Antworten: Die Quote ist noch wenig aussagekräftig.';
  return '';
 }

 // Weekly progress for ONE game; each column is based only on scored answers.
 // An increase can be described only with 5+ marked answers in EACH comparison week.
 function gameEvolution(game){
  const weeks=new Map();
  for(const row of asArray(game?.dated)){
   if(!row?._date)continue;
   const week=localMonday(row._date);
   const w=weeks.get(week)||{week,attempts:0,evaluated:0,right:0};
   w.attempts++;
   if(row._correct!==null)w.evaluated++;
   if(row._correct===true)w.right++;
   weeks.set(week,w);
  }
  const history=[...weeks.values()].sort((a,b)=>a.week.localeCompare(b.week));
  const marked=history.filter(w=>w.evaluated>=5);
  let change=null;
  if(marked.length>=2){
   const first=marked[0],last=marked[marked.length-1];
   change=Math.round(100*last.right/last.evaluated)-Math.round(100*first.right/first.evaluated);
  }
  return {history,change,comparable:marked.length>=2};
 }
 function render({panel,data,learningData,originalGames,escapeHTML}){
  if(!panel||!panel.isConnected)return;
  const html=v=>escapeHTML(txt(v));
  const model=enrich(data,catalogFrom(originalGames));
  const children=model.students.map(x=>txt(x.username)).filter(Boolean).sort((a,b)=>a.localeCompare(b,'de-CH'));
  const subjects=[...new Set([...model.catalog.map(x=>x.subject),...model.attempts.map(x=>x._meta.subject),...model.scores.map(x=>x._meta.subject)])].sort((a,b)=>a.localeCompare(b,'de-CH'));
  const gameOptions=[...new Map([...model.catalog,...model.attempts.map(a=>a._meta),...model.scores.map(s=>s._meta)].map(x=>[x.key,x])).values()].sort((a,b)=>a.title.localeCompare(b.title,'de-CH'));
  let state={subject:'all',game:'all',days:'all',sort:'name',person:'',gameDetail:''};
  const select=(id,label,items,value)=>`<label>${label}<select id="${id}">${items.map(([v,t])=>`<option value="${html(v)}" ${value===v?'selected':''}>${html(t)}</option>`).join('')}</select></label>`;
  const nameButton=name=>`<button type="button" class="cloud-v33-person" data-person="${html(name)}">${html(name)}</button>`;
  const chosenGames=()=>gameOptions.filter(g=>state.subject==='all'||g.subject===state.subject);
  function paint(){
   if(!panel.isConnected)return;
   if(state.game!=='all'&&!chosenGames().some(g=>g.key===state.game))state.game='all';
   const summaries=children.map(name=>({name,...aggregate(model.attempts,model.scores,name,state.subject,state.game,state.days),assignments:assignmentSummary(learningData,name)}));
   if(state.sort==='attempts')summaries.sort((a,b)=>b.attempts-a.attempts||a.name.localeCompare(b.name,'de-CH'));
   else if(state.sort==='rate')summaries.sort((a,b)=>(b.attempts?b.right/b.attempts:-1)-(a.attempts?a.right/a.attempts:-1)||a.name.localeCompare(b.name,'de-CH'));
   const detailed=state.person?summaries.find(row=>row.name===state.person):null;
   const chosenDetailGame=detailed?.games.find(g=>g.key===state.gameDetail);
   const gameHistory=chosenDetailGame?gameEvolution(chosenDetailGame):null;
   const allAttempts=summaries.reduce((sum,r)=>sum+r.attempts,0);
   const allRight=summaries.reduce((sum,r)=>sum+r.right,0);
   const allEvaluated=summaries.reduce((sum,r)=>sum+r.evaluated,0);
   const allUnrated=summaries.reduce((sum,r)=>sum+r.unrated,0);
   panel.innerHTML=`<div class="cloud-panel-head"><h4>🎯 Lernberichte · Klasse 3b</h4><button type="button" class="pd-secondary" id="cloudV33Reload">Aus Cloudflare aktualisieren</button></div>
    <p class="cloud-progress-intro">Lernversuche zeigen Übungsaktivität, die Erfolgsquote den Anteil richtiger Antworten. Die Erfolgsquote berücksichtigt nur eindeutig als richtig oder falsch bewertete Antworten. Highscores und erledigte Lernaufträge werden separat betrachtet.</p>
    <div class="cloud-v33-filters">${select('cloudV33Subject','Schulfach',[['all','Alle Fächer'],...subjects.map(x=>[x,x])],state.subject)}${select('cloudV33Game','Lernspiel',[['all','Alle Spiele'],...chosenGames().map(g=>[g.key,g.title])],state.game)}${select('cloudV33Days','Zeitraum',[['all','Alle verfügbaren Daten'],['7','Letzte 7 Tage'],['30','Letzte 30 Tage'],['90','Letzte 90 Tage']],state.days)}${select('cloudV33Sort','Reihenfolge',[['name','Tierkonto (A–Z)'],['attempts','Meiste Lernversuche'],['rate','Höchste Erfolgsquote']],state.sort)}</div>
    <div class="cloud-v33-stats"><span><strong>${children.length}</strong> Tierkonten</span><span><strong>${allAttempts}</strong> Lernversuche</span><span><strong>${percent(allRight,allEvaluated)}</strong> richtig (bewertet)</span>${allUnrated?`<span><strong>${allUnrated}</strong> nicht bewertet</span>`:''}</div>
    <div class="cloud-v33-table-wrap" tabindex="0" aria-label="Klassenübersicht: bei Bedarf horizontal scrollen"><table class="cloud-v33-table"><thead><tr><th>Tierkonto</th><th>Spiele mit Highscore*</th><th>Lernversuche</th><th>Richtig</th><th>Erfolgsquote</th><th>Aufträge erledigt**</th></tr></thead><tbody>${summaries.map(r=>`<tr><td>${nameButton(r.name)}</td><td>${r.highscoreGames}</td><td>${r.attempts}</td><td>${r.right}</td><td>${r.rate}</td><td>${r.assignments.completed} / ${r.assignments.total}</td></tr>`).join('')}</tbody></table></div>
    <p class="cloud-v33-note">* Highscores sind Gesamtbestwerte aus allen verfügbaren Spielrunden. Der Zeitraumfilter gilt ausschliesslich für datierte Lernversuche und die Erfolgsquote. ${state.days!=='all'?'Lernversuche ohne auswertbares Datum können nicht zum gewählten Zeitraum gezählt werden.':''} ** Die Erledigt-Häkchen zeigen alle zugewiesenen Lernaufträge, unabhängig von Fach-, Spiel- und Zeitraumfilter.</p>
    ${detailed?`<section class="cloud-v33-detail" aria-label="Persönlicher Lernbericht"><div class="cloud-panel-head"><h4>📖 Lernbericht: ${html(detailed.name)}</h4><div class="cloud-v33-detail-actions"><button type="button" class="pd-secondary" id="cloudV33Print">🖨️ Bericht drucken</button><button type="button" class="pd-secondary" id="cloudV33Close">Schliessen</button></div></div><p>${detailed.attempts} Lernversuche · ${detailed.rate} richtig · ${detailed.highscoreGames} Spiele mit Highscore · ${detailed.assignments.completed} / ${detailed.assignments.total} Lernaufträge erledigt${detailed.unrated?` · ${detailed.unrated} Versuche nicht bewertet`:''}</p>${dataCaution(detailed.evaluated,detailed.attempts)?`<p class="cloud-v33-note" role="note">${html(dataCaution(detailed.evaluated,detailed.attempts))}</p>`:''}<div class="cloud-v33-table-wrap"><table class="cloud-v33-table"><thead><tr><th>Fach / Spiel</th><th>Versuche</th><th>Richtig</th><th>Erfolgsquote</th><th>Bestwert*</th><th>Lernentwicklung</th></tr></thead><tbody>${detailed.games.map(g=>`<tr><td><strong>${html(g.meta.title)}</strong><small>${html(g.meta.subject)}</small></td><td>${g.attempts}</td><td>${g.correct}</td><td>${percent(g.correct,g.evaluated)}</td><td>${g.best===null?'–':html(g.best)}</td><td><button type="button" class="cloud-v33-person" data-game-trend="${html(g.key)}" aria-pressed="${state.gameDetail===g.key}">Wochen ansehen</button></td></tr>`).join('')||'<tr><td colspan="6">Für diese Auswahl liegen keine Spieldaten vor.</td></tr>'}</tbody></table></div>
    ${chosenDetailGame?`<section class="cloud-v33-game-evolution" aria-label="Verlauf eines Lernspiels"><div class="cloud-panel-head"><h5>🎯 Entwicklung: ${html(chosenDetailGame.meta.title)}</h5><button type="button" class="pd-secondary" id="cloudV33HideGame">Schliessen</button></div>${gameHistory.history.length?`<div class="cloud-v33-trend">${gameHistory.history.map(w=>`<div class="cloud-v33-week"><span>ab ${html(displayDate(new Date(w.week+'T12:00:00Z')))}</span><div class="cloud-v33-bar"><span style="width:${w.evaluated?100*w.right/w.evaluated:0}%"></span></div><strong>${percent(w.right,w.evaluated)}</strong><small>${w.attempts} Versuche · ${w.evaluated} bewertet</small></div>`).join('')}</div>`: '<p class="cloud-v33-note">Für dieses Spiel gibt es keine datierten Übungsversuche im ausgewählten Zeitraum.</p>'}<p class="cloud-v33-note">${gameHistory.comparable?`Vergleich der ersten und letzten Woche mit jeweils mindestens fünf bewerteten Antworten: ${gameHistory.change>0?'+':''}${gameHistory.change} Prozentpunkte. Das ist eine Beobachtung, keine Note oder gesicherte Leistungsentwicklung.`:'Für einen aussagekräftigeren Wochenvergleich braucht es mindestens zwei Übungswochen mit je fünf bewerteten Antworten.'}</p></section>`:''}
    <h5>Entwicklung nach Übungswochen</h5>${detailed.trend.length?`<div class="cloud-v33-trend">${detailed.trend.map(w=>`<div class="cloud-v33-week"><span>ab ${html(displayDate(new Date(w.week+'T12:00:00Z')))}</span><div class="cloud-v33-bar"><span style="width:${w.evaluated?w.right/w.evaluated*100:0}%"></span></div><strong>${percent(w.right,w.evaluated)}</strong><small>${w.count} Versuche${w.count!==w.evaluated?' · '+(w.count-w.evaluated)+' ohne Bewertung':''}</small></div>`).join('')}</div>${detailed.trend.length<2?'<p class="cloud-v33-note">Für einen Vergleich werden mindestens zwei Wochen mit datierten Versuchen benötigt.</p>':''}`:'<p class="cloud-v33-note">Die verfügbaren Versuche enthalten für diese Auswahl kein auswertbares Datum. Ein zeitlicher Verlauf kann deshalb nicht angezeigt werden.</p>'}${detailed.undated?`<p class="cloud-v33-note">${detailed.undated} Versuche ohne auswertbares Datum sind in der zeitlichen Darstellung nicht enthalten.</p>`:''}<p class="cloud-v33-note">Die Wochenwerte sind Anteile richtiger bewerteter Einzelantworten, keine benoteten Lernkontrollen. Unterschiedliche Aufgaben können unterschiedlich schwierig sein. «Erledigt» wird hier bewusst nicht aus Highscores abgeleitet.</p></section>`:'<p class="cloud-v33-note">Klicke auf ein Tierkonto, um einzelne Spiele und den zeitlichen Verlauf zu sehen.</p>'}
    <p class="cloud-v33-note">Die Werte werden nur im angemeldeten Lehrpersonenbereich aus dem vorhandenen Cloudflare-Klassenbericht gelesen. Diese Ansicht verändert keine Lernstände.</p>`;
   panel.querySelector('#cloudV33Subject').onchange=e=>{state.subject=e.target.value;state.game='all';paint()};
   panel.querySelector('#cloudV33Game').onchange=e=>{state.game=e.target.value;paint()};
   panel.querySelector('#cloudV33Days').onchange=e=>{state.days=e.target.value;paint()};
   panel.querySelector('#cloudV33Sort').onchange=e=>{state.sort=e.target.value;paint()};
   panel.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{state.person=b.dataset.person;state.gameDetail='';paint();panel.querySelector('.cloud-v33-detail')?.scrollIntoView({block:'nearest'})});
   panel.querySelector('#cloudV33Close')?.addEventListener('click',()=>{state.person='';state.gameDetail='';paint()});
   panel.querySelectorAll('[data-game-trend]').forEach(b=>b.addEventListener('click',()=>{state.gameDetail=b.dataset.gameTrend;paint();panel.querySelector('.cloud-v33-game-evolution')?.scrollIntoView({block:'nearest'});}));
   panel.querySelector('#cloudV33HideGame')?.addEventListener('click',()=>{state.gameDetail='';paint()});
   panel.querySelector('#cloudV33Print')?.addEventListener('click',()=>{
    if(!state.person||!panel.isConnected)return;
    document.body.classList.add('cloud-v33-print-active');
    const cleanup=()=>document.body.classList.remove('cloud-v33-print-active');
    window.addEventListener('afterprint',cleanup,{once:true});
    try{window.print();}catch(_){cleanup();}
   });
   panel.querySelector('#cloudV33Reload').onclick=()=>panel.dispatchEvent(new CustomEvent('lernsafari:reload-progress',{bubbles:false}));
  }
  paint();
 }
 root.LernSafariProgressV33={catalogFrom,enrich,aggregate,assignmentSummary,dataCaution,gameEvolution,render,dateOf};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.LernSafariProgressV33;
})(typeof window==='undefined'?globalThis:window);