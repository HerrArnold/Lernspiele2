'use strict';
(()=>{
const $=id=>document.getElementById(id);
const days=window.LEARNSAFARI_DAYS;
const classes=['Allgemein','Deutsch','Englisch','Mathe','Musik','NMG'];
const paths={
 Musik:[
  ['Solmisationsleiter','solmisationsleiter.html','preview-solmisationsleiter.webp','Silben ordnen und Farben finden'],
  ['Solmisationsspiel','solmisationsspiel.html','preview-solmi.webp','Do liegt auf C'],
  ['Solmisationsspiel schwer','solmisationsspiel-profi.html','preview-solmi-profi.webp','Do liegt auf verschiedenen Tönen'],
  ['Rhythmus-Trio','rhythmus-trio.html','preview-rhythm-trio.webp','Drei passende Karten finden'],
  ['Notenname · Notenbild · Rhythmussprache','rhythmus-trio-profi.html','preview-rhythm-profi.webp','Rhythmen schreiben und zeichnen'],
  ['Teste dein Wissen','teste-dein-wissen-musik.html',null,'24 Punkte · 12 Aufgaben']],
 Mathe:[
  ['Finde die Zahl','finde-die-zahl.html','preview-finde-die-zahl.webp','Zahlen im Tausenderbuch suchen'],
  ['Stellentafel','stellentafel.html','preview-stellentafel.webp','Hunderter, Zehner und Einer'],
  ['Hunderter, Zehner und Einer zerlegen','hunderter-zehner-einer-zerlegen.html','preview-hunderter-zehner-einer-zerlegen.webp','Zahlen zerlegen'],
  ['Wie viele Hundertertafeln, Zehnerstangen und Einerwürfel?','wie-viele-brauchst-du.html','preview-wie-viele-brauchst-du.webp','Mit Stellenwertmaterial arbeiten'],
  ['Welche Zahl ist das?','welche-zahl-ist-das.html','preview-welche-zahl-ist-das.webp','Stellenwertmaterial erkennen'],
  ['Teste dein Wissen','teste-dein-wissen.html',null,'Lernkontrolle · 15 Aufgaben']]
};
// Spiele werden künftig durch Verschieben von paths ins Archiv übernommen.
// Archivierte Einträge: {subject,title,file,preview,description,archivedAt:'2026-11-07T12:00:00'}.
const archivedGames=[];
const siteState={route:'aufgaben',previewIndex:null,dayIndex:null,sessions:new Map(),renderedDate:null};
const htmlEscape=v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function norm(v){return String(v??'').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-CH')}
function daySwiss(now=new Date()){
 const ps=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const f=k=>ps.find(p=>p.type===k).value;
 let iso=`${f('year')}-${f('month')}-${f('day')}`;
 // Der Wechsel um 23:59 ist bewusst eine Minute VOR Mitternacht.
 if(Number(f('hour'))===23&&Number(f('minute'))>=59){const d=new Date(`${iso}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+1);iso=d.toISOString().slice(0,10)}
 return iso;
}
function dayIndex(iso){const base=Date.parse('2026-11-07T12:00:00Z');const target=Date.parse(`${iso}T12:00:00Z`);const delta=Math.round((target-base)/86400000);return ((delta%7)+7)%7}
function prettyDate(iso){return new Intl.DateTimeFormat('de-CH',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Zurich'}).format(new Date(`${iso}T12:00:00Z`))}
function viewShow(route){siteState.route=route;['aufgaben','aktuelle','archiv'].forEach(id=>{$('view-'+id).hidden=id!==route});document.querySelectorAll('[data-route]').forEach(a=>{const yes=a.dataset.route===route;a.classList.toggle('active',yes);if(a.tagName==='A'){if(yes)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}});window.scrollTo(0,0)}
function route(){const value=decodeURIComponent(location.hash.slice(1));let routeName='aufgaben',section=null;if(value.startsWith('aktuelle')){routeName='aktuelle';section=value.split('--')[1]}else if(value==='archiv')routeName='archiv';viewShow(routeName);if(section){requestAnimationFrame(()=>document.getElementById('fach-'+section)?.scrollIntoView({behavior:'smooth',block:'start'}))}}
function cardGame(game){const [title,file,preview,desc]=game;return `<a class="game-link ${preview?'':'game-check'}" href="spiele/${encodeURIComponent(file)}">${preview?`<img class="game-preview" src="assets/${preview}" alt="Spielvorschau ${htmlEscape(title)}" loading="lazy">`:`<span class="exam-icon" aria-hidden="true">${/musik/i.test(file)?'♫':'✓'}</span>`}<span class="game-name">${htmlEscape(title)}</span><span class="game-desc">${htmlEscape(desc||'')}</span></a>`}
function emptySubject(){return `<div class="subject-empty"><img src="assets/warzenschwein-schlafend.png" alt="Schlafendes Warzenschwein" loading="lazy"><span>Hier gibt es momentan keine Spiele</span></div>`}
function renderSubjects(){const current=$('subject-list'),archive=$('archive-list');current.innerHTML=classes.map(s=>`<section class="subject-block subject-${s.toLowerCase()}" id="fach-${s.toLowerCase()}"><h3>${s}</h3><div class="game-grid">${paths[s]?.length?paths[s].map(cardGame).join(''):emptySubject()}</div></section>`).join('');archive.innerHTML=classes.map(s=>{const items=archivedGames.filter(a=>a.subject===s).sort((a,b)=>String(b.archivedAt).localeCompare(String(a.archivedAt)));return `<section class="subject-block subject-${s.toLowerCase()}"><h3>${s}</h3><div class="game-grid">${items.length?items.map(x=>cardGame([x.title,x.file,x.preview,x.description])).join(''):'<div class="archive-empty">Noch keine archivierten Spiele.</div>'}</div></section>`}).join('')}
function newSession(dayIdx){const d=days[dayIdx];return d.exercises.map(ex=>{
 if(ex.type==='paint')return {type:ex.type,colors:Array(ex.art.join('').length).fill(null),active:ex.palette[0].value,success:false};
 if(ex.type==='sudoku')return {type:ex.type,cells:ex.givens.join('').split('').map(ch=>ch==='0'?'':ch),success:false};
 if(ex.type==='order')return {type:ex.type,permutation:shuffle(ex.items.map((_,i)=>i)),selected:[],success:false};
 if(ex.type==='choices')return {type:ex.type,answers:Array(ex.questions.length).fill(''),success:false};
 if(ex.type==='match')return {type:ex.type,options:shuffle(ex.pairs.map(p=>p[1])),answers:Array(ex.pairs.length).fill(''),success:false};
 if(ex.type==='categorize')return {type:ex.type,answers:Array(ex.items.length).fill(''),success:false};
 if(ex.type==='fill')return {type:ex.type,answers:Array(ex.fields.length).fill(''),success:false};
 return {success:false};
 })}
function session(dayIdx){if(!siteState.sessions.has(dayIdx))siteState.sessions.set(dayIdx,newSession(dayIdx));return siteState.sessions.get(dayIdx)}
function exerciseMarkup(ex,s,idx){
 switch(ex.type){
 case 'paint':return `<div class="paint-legend">${ex.palette.map(c=>`<button type="button" class="paint-swatch ${s.active===c.value?'selected':''}" data-swatch="${c.value}" aria-pressed="${s.active===c.value}" title="${c.name}"><span style="background:${c.color}"></span>${c.value} · ${c.name}</button>`).join('')}</div><div class="paint-grid" style="--columns:${ex.art[0].length}">${ex.art.join('').split('').map((v,i)=>{const number=ex.mapping[v];const expressions=ex.expressions[number];const label=expressions[(i*3+Math.floor(i/ex.art[0].length))%expressions.length];const selected=ex.palette.find(c=>c.value===s.colors[i]);return `<button type="button" class="paint-cell ${s.colors[i]!==null?'painted':''}" data-pcell="${i}" style="${selected?`--paint:${selected.color}`:''}" aria-label="Feld ${i+1}: ${htmlEscape(label)}">${htmlEscape(label)}</button>`}).join('')}</div><p class="task-tip">Wähle eine Farbe und tippe auf die Rechnungsfelder.</p>`;
 case 'sudoku':return `<div class="sudoku-grid" role="group" aria-label="Sudoku mit vier mal vier Feldern">${ex.givens.join('').split('').map((n,i)=>n!=='0'?`<div class="sudoku-given" aria-label="Vorgegebene Zahl ${n}">${n}</div>`:`<select aria-label="Sudoku Zeile ${Math.floor(i/4)+1}, Spalte ${i%4+1}" data-sudoku="${i}"><option value="">?</option>${[1,2,3,4].map(x=>`<option value="${x}" ${s.cells[i]===String(x)?'selected':''}>${x}</option>`).join('')}</select>`).join('')}</div>`;
 case 'choices':return `${ex.passage?`<div class="reading-box">${htmlEscape(ex.passage)}</div>`:''}<div class="question-list">${ex.questions.map((q,i)=>`<div class="question-row"><span class="question-label">${i+1}. ${htmlEscape(q[0])}</span><div class="choice-options">${q[1].map((a,k)=>`<button type="button" data-choice="${i}" data-answer="${k}" aria-pressed="${s.answers[i]===String(k)}" class="choice-button ${s.answers[i]===String(k)?'picked':''}">${htmlEscape(a)}</button>`).join('')}</div></div>`).join('')}</div>`;
 case 'order':return `<div class="order-bank">${s.permutation.filter(i=>!s.selected.includes(i)).map(i=>`<button type="button" class="word-tile" data-pick="${i}">${htmlEscape(ex.items[i])}</button>`).join('')}</div><div class="order-line"><span class="order-title">Deine Reihenfolge:</span>${s.selected.length?s.selected.map((i,k)=>`<button class="order-picked" type="button" data-unpick="${i}"><b>${k+1}.</b> ${htmlEscape(ex.items[i])} <span aria-hidden="true">×</span></button>`).join(''):'<span class="order-placeholder">Klicke oben auf das erste Feld …</span>'}</div>`;
 case 'match':return `<div class="match-list">${ex.pairs.map(([a],i)=>`<label class="match-row"><span>${htmlEscape(a)}</span><select data-match="${i}" aria-label="Passend zu ${htmlEscape(a)}"><option value="">Bitte wählen</option>${s.options.map(v=>`<option value="${htmlEscape(v)}" ${s.answers[i]===v?'selected':''}>${htmlEscape(v)}</option>`).join('')}</select></label>`).join('')}</div>`;
 case 'categorize':return `<div class="category-grid">${ex.items.map(([word],i)=>`<label class="category-row"><strong>${htmlEscape(word)}</strong><select data-category="${i}" aria-label="Wortart oder Kategorie von ${htmlEscape(word)}"><option value="">Wählen</option>${ex.categories.map(cat=>`<option value="${htmlEscape(cat)}" ${s.answers[i]===cat?'selected':''}>${htmlEscape(cat)}</option>`).join('')}</select></label>`).join('')}</div>`;
 case 'fill':return `<div class="fill-list">${ex.fields.map(([question],i)=>`<label class="fill-row"><span>${htmlEscape(question)}</span><input type="text" autocomplete="off" spellcheck="false" data-fill="${i}" aria-label="Ergänze zu ${htmlEscape(question)}" value="${htmlEscape(s.answers[i])}" placeholder="Deine Antwort"></label>`).join('')}</div>`;
 }
 return '';
}
function renderTask(dayIdx,i){const ex=days[dayIdx].exercises[i],s=session(dayIdx)[i],mount=$(`task-${i}`);mount.innerHTML=exerciseMarkup(ex,s,i);mount.classList.toggle('task-done',s.success);$(`status-${i}`).textContent=s.success?'✓ Geschafft!':'';$(`status-${i}`).className='task-status '+(s.success?'success':'');}
function renderToday(force=false){let iso=daySwiss();let newIdx=dayIndex(iso);if(siteState.previewIndex!==null)newIdx=siteState.previewIndex;
 if(!force&&siteState.dayIndex===newIdx&&siteState.renderedDate===iso)return;
 siteState.dayIndex=newIdx;siteState.renderedDate=iso;
 const d=days[newIdx],isPreview=siteState.previewIndex!==null;
 $('today-label').textContent=isPreview?`Wochenvorschau · ${prettyDate(d.date)}`:prettyDate(iso);
 $('today-theme').textContent=d.theme;
 $('today-intro').textContent=d.intro;
 $('day-pill').textContent=`Tag ${newIdx+1} / 7 · ${d.tag}`;
 $('preview-notice').hidden=!isPreview;
 $('daily-tasks').innerHTML=d.exercises.map((ex,i)=>`<section class="daily-task" id="exercise-${i}"><div class="task-head"><span class="task-count">Aufgabe ${i+1}</span><h3>${htmlEscape(ex.title)}</h3><div class="task-status" id="status-${i}" aria-live="polite"></div></div><p class="task-description">${htmlEscape(ex.desc)}</p><div class="task-body" id="task-${i}"></div><div class="task-actions"><button type="button" class="check-button" data-check="${i}">Überprüfen</button><button type="button" class="clear-button" data-reset="${i}">Neu versuchen</button><span class="check-feedback" id="feedback-${i}" aria-live="polite"></span></div></section>`).join('');
 d.exercises.forEach((_,i)=>renderTask(newIdx,i));updateProgress();
}
function updateProgress(){const arr=session(siteState.dayIndex);const n=arr.filter(x=>x.success).length;$('daily-progress').textContent=`${n} von 4 Aufgaben geschafft`;$('daily-progress-bar').style.width=`${n*25}%`}
function reRender(i){renderTask(siteState.dayIndex,i);updateProgress();}
function handleTasks(e){const button=e.target.closest('button');if(!button)return;
 const card=button.closest('.daily-task');if(!card)return;
 const i=Number(card.id.replace('exercise-',''));if(!Number.isInteger(i))return;
 const ex=days[siteState.dayIndex].exercises[i],s=session(siteState.dayIndex)[i];
 if(button.hasAttribute('data-check')){checkTask(ex,s,i);return}
 if(button.hasAttribute('data-reset')){session(siteState.dayIndex)[i]=newSession(siteState.dayIndex)[i];renderTask(siteState.dayIndex,i);$(`feedback-${i}`).textContent='';updateProgress();return}
 if(button.hasAttribute('data-swatch')){s.success=false;s.active=Number(button.dataset.swatch);reRender(i);return}
 if(button.hasAttribute('data-pcell')){s.success=false;s.colors[Number(button.dataset.pcell)]=s.active;reRender(i);return}
 if(button.hasAttribute('data-choice')){s.success=false;s.answers[Number(button.dataset.choice)]=button.dataset.answer;reRender(i);return}
 if(button.hasAttribute('data-pick')){s.success=false;s.selected.push(Number(button.dataset.pick));reRender(i);return}
 if(button.hasAttribute('data-unpick')){s.success=false;s.selected=s.selected.filter(x=>x!==Number(button.dataset.unpick));reRender(i);return}
}
function handleChanges(e){const inp=e.target;const card=inp.closest('.daily-task');if(!card)return;const i=Number(card.id.replace('exercise-',''));const s=session(siteState.dayIndex)[i];s.success=false;updateProgress();
 for(const [name,key] of [['data-sudoku','cells'],['data-match','answers'],['data-category','answers'],['data-fill','answers']]){if(inp.hasAttribute(name)){s[key][Number(inp.getAttribute(name))]=inp.value;return}}
}
function checkTask(ex,s,i){let missing=false,wrong=0,total=0;
 if(ex.type==='paint'){total=s.colors.length;wrong=s.colors.filter((v,j)=>v!==ex.mapping[ex.art.join('')[j]]).length;missing=s.colors.some(x=>x===null)}
 else if(ex.type==='sudoku'){total=16;const answer=ex.solution.join('');wrong=s.cells.filter((v,j)=>v!==answer[j]).length;missing=s.cells.some(v=>!v)}
 else if(ex.type==='choices'){total=ex.questions.length;wrong=s.answers.filter((v,j)=>v!==String(ex.questions[j][2])).length;missing=s.answers.some(v=>v==='')}
 else if(ex.type==='match'){total=ex.pairs.length;wrong=s.answers.filter((v,j)=>v!==ex.pairs[j][1]).length;missing=s.answers.some(v=>!v)}
 else if(ex.type==='categorize'){total=ex.items.length;wrong=s.answers.filter((v,j)=>v!==ex.items[j][1]).length;missing=s.answers.some(v=>!v)}
 else if(ex.type==='fill'){total=ex.fields.length;wrong=s.answers.filter((v,j)=>norm(v)!==norm(ex.fields[j][1])).length;missing=s.answers.some(v=>!norm(v))}
 else if(ex.type==='order'){total=ex.items.length;missing=s.selected.length!==total;wrong=s.selected.filter((v,j)=>v!==j).length+Math.max(0,total-s.selected.length)}
 s.success=!missing&&wrong===0;
 const feedback=$(`feedback-${i}`);feedback.classList.toggle('is-good',s.success);feedback.textContent=s.success?'Richtig! Super gemacht! ✓':missing?'Noch nicht vollständig. Schau alle Felder an.':`Fast geschafft! Prüfe nochmals ${wrong} von ${total} Antworten.`;
 renderTask(siteState.dayIndex,i);updateProgress();
}
function initNavigation(){window.addEventListener('hashchange',route);document.addEventListener('scroll',()=>{$('main-header').classList.toggle('compact',window.scrollY>65)},{passive:true});$('nav-current').addEventListener('click',()=>{$('dropdown').classList.toggle('open')});document.addEventListener('click',e=>{if(!e.target.closest('.nav-dropdown'))$('dropdown').classList.remove('open')});document.querySelectorAll('[data-subject]').forEach(a=>a.addEventListener('click',()=>{$('dropdown').classList.remove('open');if(location.hash==='#aktuelle--'+a.dataset.subject){route()}}));route()}
function initSecret(){const meerkat=$('meerkat-secret'),popup=$('secret-box'),pass=$('secret-input'),panel=$('week-panel');meerkat.addEventListener('click',()=>{popup.hidden=!popup.hidden;if(!popup.hidden){pass.value='';pass.focus()}});pass.addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();if(pass.value.trim()==='6208'){popup.hidden=true;pass.value='';panel.hidden=false;renderWeekPanel()}else{pass.value='';pass.classList.add('invalid');setTimeout(()=>pass.classList.remove('invalid'),550)}});document.addEventListener('click',e=>{if(!e.target.closest('.secret-wrap'))popup.hidden=true});$('close-week').addEventListener('click',()=>panel.hidden=true);$('return-today').addEventListener('click',()=>{siteState.previewIndex=null;renderToday(true)});}
function renderWeekPanel(){$('week-list').innerHTML=days.map((d,i)=>`<button type="button" class="week-choice" data-week="${i}"><span>${htmlEscape(prettyDate(d.date).replace(/ 2026$/,''))}</span><b>${htmlEscape(d.theme)}</b></button>`).join('')}
function initWeek(){ $('week-list').addEventListener('click',e=>{const b=e.target.closest('[data-week]');if(!b)return;siteState.previewIndex=Number(b.dataset.week);$('week-panel').hidden=true;location.hash='#aufgaben';renderToday(true);route()});}
function init(){renderSubjects();initNavigation();initSecret();initWeek();renderToday(true);$('daily-tasks').addEventListener('click',handleTasks);$('daily-tasks').addEventListener('change',handleChanges);$('daily-tasks').addEventListener('input',handleChanges);
 setInterval(()=>{const iso=daySwiss();if(iso!==siteState.renderedDate)renderToday(true)},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderToday()});}
window.addEventListener('DOMContentLoaded',init);
})();
