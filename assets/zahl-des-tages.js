/* LernSafari – Zahl des Tages. Same number for all pupils on a given date. */
'use strict';
(()=>{
const $=id=>document.getElementById(id), MAX=1000;
let activeDate='',number=0,state=null,dragGroup=null,dragMode=true;
const digits=(n)=>[Math.floor(n/1000),Math.floor(n%1000/100),Math.floor(n%100/10),n%10];
const digitsWord=['null','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun'];
const teens=['zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn'];
const tens=['','','zwanzig','dreissig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig'];
function smallWord(n){if(n<10)return digitsWord[n];if(n<20)return teens[n-10];const t=Math.floor(n/10),u=n%10;return u?(u===1?'ein':digitsWord[u])+'und'+tens[t]:tens[t]}
function word(n){if(n===1000)return 'tausend';const h=Math.floor(n/100),r=n%100;return (h?(h===1?'ein':digitsWord[h])+'hundert':'')+(r?smallWord(r):'')}
function norm(s){return String(s||'').toLowerCase().replace(/ß/g,'ss').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/[\s\-.,!]/g,'')}
// Samstag und Sonntag verwenden immer die Zahl des letzten Freitags.
// Die Zahl wird anhand des Datums berechnet und bleibt damit bei allen Kindern gleich.
function learningDate(iso){
 const d=new Date(iso+'T12:00:00Z');
 if(!Number.isFinite(d.getTime()))return iso;
 const weekday=d.getUTCDay();
 if(weekday===6)d.setUTCDate(d.getUTCDate()-1);
 else if(weekday===0)d.setUTCDate(d.getUTCDate()-2);
 return d.toISOString().slice(0,10);
}
function hashDate(iso){let hash=2166136261;for(const char of 'LernSafari-Klasse3b-'+iso){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return (hash>>>0)%MAX+1}
function newState(){return {word:'',parity:'',place:[0,0,0,0],decomp:['','','',''],art:{h:Array(10).fill(false),t:Array(10).fill(false),e:Array(10).fill(false)},line:500,checked:{}}}
function key(){let who='anonym';try{who=window.SafariLogin?.auth()?.username||'anonym'}catch(_){}return 'lernsafari-numberday-v1:'+activeDate+':'+who}
function save(){try{localStorage.setItem(key(),JSON.stringify(state))}catch(_){}}
function invalidate(id){delete state.checked[id];markFeedback(id,false,'');updateProgress();save()}
function restore(){let raw;try{raw=JSON.parse(localStorage.getItem(key()))}catch(_){};if(!raw||!Array.isArray(raw.place)||!raw.art)return newState();const s=newState();if(typeof raw.word==='string')s.word=raw.word.slice(0,100);if(typeof raw.parity==='string')s.parity=raw.parity;if(raw.place.length===4)s.place=raw.place.map(x=>Math.max(0,Math.min(9,Number(x)||0)));if(Array.isArray(raw.decomp)&&raw.decomp.length===4)s.decomp=raw.decomp.map(x=>String(x??''));for(const k of ['h','t','e'])if(Array.isArray(raw.art[k])&&raw.art[k].length===10)s.art[k]=raw.art[k].map(Boolean);s.line=Number(raw.line)||500;s.checked=raw.checked||{};return s}
function paintItem(k,i,force){const val=force===undefined?!state.art[k][i]:force;if(state.art[k][i]===val)return;state.art[k][i]=val;delete state.checked.art;const el=document.querySelector(`[data-art="${k}"][data-i="${i}"]`);if(el){el.classList.toggle('chosen',val);el.setAttribute('aria-pressed',String(val))}updateArtCount();invalidate('art')}
function renderDots(){document.querySelectorAll('[data-place]').forEach(el=>{const i=Number(el.dataset.place),n=state.place[i];el.querySelector('.zdt-dots').innerHTML=Array.from({length:n},()=>'<span class="zdt-dot"></span>').join('');el.querySelector('output').textContent=String(n)})}
function updateArtCount(){for(const k of ['h','t','e']){const output=document.querySelector(`[data-artcount="${k}"]`);if(output)output.textContent=state.art[k].filter(Boolean).length}}
function artRow(k,heading,cls){return `<div class="zdt-artrow"><strong>${heading}</strong><div><div class="zdt-artitems" role="group" aria-label="${heading}">${Array.from({length:10},(_,i)=>`<button class="zdt-artitem ${cls} ${state.art[k][i]?'chosen':''}" type="button" data-art="${k}" data-i="${i}" aria-label="${heading} ${i+1}" aria-pressed="${state.art[k][i]}"></button>`).join('')}</div><div class="zdt-artcount">Ausgemalt: <output data-artcount="${k}">0</output> von 10</div></div></div>`}
function solvedExample(){
 const dots=n=>Array.from({length:n},()=>'<span class="zdt-example-dot"></span>').join('');
 const art=(cls,n)=>`<span class="zdt-example-tiles">${Array.from({length:n},()=>`<span class="zdt-artitem ${cls} chosen"></span>`).join('')}</span>`;
 return `<aside class="zdt-example" aria-label="Gelöstes Beispiel für die Zahl des Tages">
 <div class="zdt-example-head"><div><h3>So geht’s: Ein gelöstes Beispiel</h3><p>Schau zuerst an, wie du die Aufgaben lösen kannst. Danach probierst du es selbst.</p></div><strong class="zdt-example-big">231</strong></div>
 <div class="zdt-example-grid">
 <div class="zdt-example-card"><h4>1. Zahl als Wort</h4><p class="zdt-example-answer">zweihunderteinunddreissig</p></div>
 <div class="zdt-example-card"><h4>2. Gerade oder ungerade?</h4><p><b class="zdt-example-answer">Ungerade</b> – die Zahl endet auf 1.</p></div>
 <div class="zdt-example-card zdt-example-wide"><h4>3. Stellentafel mit Punkten</h4>
 <div class="zdt-example-place">${[['T',0],['H',2],['Z',3],['E',1]].map(([k,n])=>`<div><b>${k}</b><div class="zdt-example-dots">${dots(n)}</div><small>${n}</small></div>`).join('')}</div>
 </div>
 <div class="zdt-example-card"><h4>4. Zerlegung</h4><p class="zdt-example-equation">0 + 200 + 30 + 1 = 231</p></div>
 <div class="zdt-example-card zdt-example-wide"><h4>5. Hunderter, Zehner und Einer</h4>
 <div class="zdt-example-material"><span><b>2 Hundertertafeln</b>${art('h',2)}</span><span><b>3 Zehnerstreifen</b>${art('t',3)}</span><span><b>1 Einerwürfel</b>${art('e',1)}</span></div>
 </div>
 <div class="zdt-example-card zdt-example-wide"><h4>6. Zahlenstrahl</h4>
 <div class="zdt-example-line-wrap"><div class="zdt-example-line"><span class="zdt-example-line-pin" style="left:23.1%"><b>231</b></span>${Array.from({length:11},(_,i)=>`<span class="zdt-example-tick" style="left:${i*10}%">${i*100}</span>`).join('')}</div></div>
 <p class="zdt-example-caption">231 liegt zwischen 200 und 300, etwas näher bei 200.</p></div>
 </div></aside>`;
}
function section(id,title,description,content){return `<section class="zdt-task" data-step="${id}"><h3>${title}</h3><p>${description}</p>${content}<button type="button" class="zdt-check" data-check-step="${id}">Prüfen</button><span class="zdt-feedback" data-feedback="${id}" aria-live="polite"></span></section>`}
function render(date){const host=$('zahl-des-tages');if(!host)return;const nextDate=/^20\d{2}-\d{2}-\d{2}$/.test(date)?date:new Date().toISOString().slice(0,10);const dateForNumber=learningDate(nextDate);if(activeDate===dateForNumber&&host.hasChildNodes())return;activeDate=dateForNumber;number=hashDate(activeDate);state=restore();
 const thousandNumber=digits(number);const ds=['T','H','Z','E'];
 host.innerHTML=`${solvedExample()}<div class="zdt-header"><div><h2>🔢 Zahl des Tages</h2><p>Entdecke die Zahl! Prüfe jede Aufgabe einzeln.</p></div><span class="zdt-progress" id="zdt-progress">0 von 6 Aufgaben</span></div><div class="zdt-number" aria-label="Zahl des Tages: ${number}">${number}</div><div class="zdt-tasks">
 ${section('word','1. Schreibe die Zahl als Wort','Schreibe die Zahl mit Buchstaben.','<input class="zdt-input" id="zdt-word" type="text" spellcheck="false" autocomplete="off" placeholder="Zahl als Wort schreiben">')}
 ${section('parity','2. Gerade oder ungerade?','Wähle die richtige Antwort.','<div class="zdt-choices"><label><input type="radio" name="zdt-parity" value="gerade"> Gerade</label><label><input type="radio" name="zdt-parity" value="ungerade"> Ungerade</label></div>')}
 ${section('place','3. Stellentafel mit Punkten','Klicke auf + oder −. Mit «Leeren» entfernst du alle Punkte.','<div class="zdt-place-grid">'+ds.map((name,i)=>`<div class="zdt-place" data-place="${i}"><div class="zdt-place-name">${name}</div><div class="zdt-dots"></div><div class="zdt-counters"><button type="button" data-pchange="${i}" data-step="-1" aria-label="${name} ein Punkt weniger">−</button><output>0</output><button type="button" data-pchange="${i}" data-step="1" aria-label="${name} ein Punkt mehr">+</button></div><button class="zdt-reset" type="button" data-clear="${i}">Leeren</button></div>`).join('')+'</div>')}
 ${section('decomp','4. Zerlege die Zahl','Trage die Zahlen in die Plusrechnung ein. Schreibe 0, wenn eine Stelle leer bleibt.','<div class="zdt-decomp">'+ds.map((name,i)=>`${i?'<span class="zdt-plus">+</span>':''}<label>${name}<input class="zdt-input" data-decomp="${i}" type="number" min="0" max="1000" placeholder="0" inputmode="numeric"></label>`).join('')+'</div>')}
 ${section('art','5. Hunderter, Zehner und Einer','Klicke oder ziehe über die Tafeln, Streifen und Würfel. Eine ganze Tafel zählt 100, ein Streifen 10 und ein Würfel 1.',artRow('h','Hundertertafeln','h')+artRow('t','Zehnerstreifen','t')+artRow('e','Einerwürfel','e'))}
 ${section('line','6. Zahl auf dem Zahlenstrahl','Ziehe den rosa Zeiger ungefähr an die richtige Stelle. Eine Abweichung von 50 ist erlaubt.','<div class="zdt-line-wrap"><div class="zdt-line" id="zdt-line" role="slider" tabindex="0" aria-label="Zahl auf dem Zahlenstrahl" aria-valuemin="0" aria-valuemax="1000">'+Array.from({length:11},(_,i)=>`<span class="zdt-tick" style="left:${i*10}%">${i*100}</span>`).join('')+'<span class="zdt-marker" id="zdt-marker"></span></div><div class="zdt-approx">Deine Schätzung: <output id="zdt-estimate">500</output></div></div>')}
 </div>`;
 $('zdt-word').value=state.word;for(const r of document.querySelectorAll('[name=zdt-parity]'))r.checked=r.value===state.parity;document.querySelectorAll('[data-decomp]').forEach(el=>el.value=state.decomp[Number(el.dataset.decomp)]);renderDots();updateArtCount();updateLine();updateProgress();for(const step of Object.keys(state.checked))if(state.checked[step]?.ok)markFeedback(step,true,'✓ Richtig!');wire();}
function markFeedback(id,ok,msg){const el=document.querySelector(`[data-feedback="${id}"]`);if(!el)return;el.className='zdt-feedback'+(ok?' good':'');el.textContent=msg}
function updateProgress(){let n=Object.values(state.checked).filter(x=>x&&x.ok).length;$('zdt-progress').textContent=`${n} von 6 Aufgaben richtig`}
function updateLine(){const line=$('zdt-line');$('zdt-marker').style.left=(Math.max(0,Math.min(1000,state.line))/10)+'%';$('zdt-estimate').textContent=state.line;line.setAttribute('aria-valuenow',String(state.line))}
function setLine(event){const rect=$('zdt-line').getBoundingClientRect();const x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));state.line=Math.round(x*100);updateLine();invalidate('line')}
function checkStep(id){const [t,h,z,e]=digits(number);let ok=false;let actual='',correct='';switch(id){case 'word': actual=state.word;correct=word(number);ok=norm(actual)===norm(correct)||(number>=100&&number<200&&norm(actual)===norm(correct.replace(/^ein/,'')))||(number===1000&&norm(actual)==='eintausend');break;
 case 'parity':actual=state.parity;correct=number%2===0?'gerade':'ungerade';ok=actual===correct;break;
 case 'place':actual=state.place.join('/');correct=[t,h,z,e].join('/');ok=actual===correct;break;
 case 'decomp':actual=state.decomp.join(' + ');const expected=[t*1000,h*100,z*10,e];correct=expected.join(' + ');ok=expected.every((v,i)=>state.decomp[i].trim()!==''&&Number(state.decomp[i])===v);break;
 case 'art':actual=['h','t','e'].map(k=>state.art[k].filter(Boolean).length).join('/');correct=[Math.floor(number/100),z,e].join('/');ok=actual===correct;break;
 case 'line':actual=String(state.line);correct=String(number);ok=Math.abs(state.line-number)<=50;break;}
 state.checked[id]={ok};save();updateProgress();markFeedback(id,ok,ok?'✓ Richtig!':(id==='line'?'Noch nicht ganz. Versuche es näher an der Zahl.':'Noch nicht ganz. Versuche es nochmals.'));
 const api=window.SafariLogin;if(api?.auth()?.role==='child'){api.request('/game-attempt','POST',{game:'zahl-des-tages',task:`${activeDate} – ${id}`,correct:ok,correctCount:ok?1:0,total:1,answer:String(actual).slice(0,300),expected:String(correct).slice(0,300),details:`Zahl ${number}; Schritt ${id}`}).catch(err=>console.warn('Zahl des Tages nicht gespeichert:',err.message))}
}
function wire(){const host=$('zahl-des-tages');host.querySelectorAll('[data-check-step]').forEach(b=>b.onclick=()=>checkStep(b.dataset.checkStep));$('zdt-word').addEventListener('input',e=>{state.word=e.target.value;invalidate('word')});host.querySelectorAll('[name=zdt-parity]').forEach(r=>r.onchange=()=>{state.parity=r.value;invalidate('parity')});host.querySelectorAll('[data-pchange]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.pchange),n=Number(b.dataset.step);state.place[i]=Math.max(0,Math.min(i===0?1:9,state.place[i]+n));renderDots();invalidate('place')});host.querySelectorAll('[data-clear]').forEach(b=>b.onclick=()=>{state.place[Number(b.dataset.clear)]=0;renderDots();invalidate('place')});host.querySelectorAll('[data-decomp]').forEach(el=>el.oninput=()=>{state.decomp[Number(el.dataset.decomp)]=el.value;invalidate('decomp')});
 host.querySelectorAll('[data-art]').forEach(btn=>{btn.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;e.preventDefault();dragGroup=btn.dataset.art;dragMode=!state.art[dragGroup][Number(btn.dataset.i)];paintItem(dragGroup,Number(btn.dataset.i),dragMode);try{btn.setPointerCapture(e.pointerId)}catch(_){}});btn.addEventListener('pointerenter',e=>{if(dragGroup===btn.dataset.art)paintItem(dragGroup,Number(btn.dataset.i),dragMode)});btn.addEventListener('click',e=>{if(e.detail===0)paintItem(btn.dataset.art,Number(btn.dataset.i))})});
 host.addEventListener('pointermove',e=>{if(!dragGroup||!e.buttons)return;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-art]');if(target?.dataset.art===dragGroup)paintItem(dragGroup,Number(target.dataset.i),dragMode)});window.addEventListener('pointerup',()=>dragGroup=null);const line=$('zdt-line');line.addEventListener('pointerdown',e=>{line.setPointerCapture(e.pointerId);setLine(e)});line.addEventListener('pointermove',e=>{if(e.buttons)setLine(e)});line.addEventListener('keydown',e=>{if(['ArrowRight','ArrowUp','ArrowLeft','ArrowDown'].includes(e.key)){e.preventDefault();state.line=Math.max(0,Math.min(1000,state.line+(e.key==='ArrowRight'||e.key==='ArrowUp'?10:-10)));updateLine();invalidate('line')}})}
window.SafariNumberDay={render};
window.addEventListener('safari-auth-change',()=>{if(activeDate){state=restore();const d=activeDate;activeDate='';render(d)}});
})();
