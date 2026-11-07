
'use strict';
const SCALE=[
  {id:'do-low',syllable:'Do',color:'rot',hex:'#d92f3d',step:0},
  {id:'re',syllable:'Re',color:'orange',hex:'#ef972f',step:1},
  {id:'mi',syllable:'Mi',color:'gelb',hex:'#ead73d',step:2},
  {id:'fa',syllable:'Fa',color:'hellgrün',hex:'#92c94b',step:3},
  {id:'so',syllable:'So',color:'dunkelgrün',hex:'#2a8f47',step:4},
  {id:'la',syllable:'La',color:'blau',hex:'#2d7ad3',step:5},
  {id:'ti',syllable:'Ti',color:'violett',hex:'#8751bd',step:6},
  {id:'do-high',syllable:'Do',color:'rot',hex:'#d92f3d',step:7}
];
const COLORS=[
  {key:'rot',label:'Rot',hex:'#d92f3d'},
  {key:'orange',label:'Orange',hex:'#ef972f'},
  {key:'gelb',label:'Gelb',hex:'#ead73d'},
  {key:'hellgrün',label:'Hellgrün',hex:'#92c94b'},
  {key:'dunkelgrün',label:'Dunkelgrün',hex:'#2a8f47'},
  {key:'blau',label:'Blau',hex:'#2d7ad3'},
  {key:'violett',label:'Violett',hex:'#8751bd'}
];
const YPOS=[90,84,78,72,66,60,54,48];
const stemsUpStepLimit=4;
const state={part:1,part1:{pool:[],answer:[]},part2:{pool:[],answer:[],colors:Array(8).fill(null)},part3:{order:[],colors:Array(8).fill(null),syllables:Array(8).fill('')}};
function $(id){return document.getElementById(id)}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function normalize(t){return (t||'').trim().toLowerCase();}
function noteSvg(note,{colored=true,small=false}={}){
  const y=YPOS[note.step]; const fill=colored?note.hex:'#1f2620'; const stroke='#1a2318';
  const stemUp=note.step<=stemsUpStepLimit; const headCx=78, headCy=y, rx=13, ry=9;
  let ledger='';
  if(note.step===0) ledger=`<line x1="52" y1="${y}" x2="104" y2="${y}" class="ledger"/>`;
  const stemX=stemUp?headCx+10:headCx-10; const stemY1=stemUp?headCy-2:headCy+2; const stemY2=stemUp?22:102;
  return `<svg class="note-staff ${small?'small':''}" viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <line x1="16" y1="30" x2="146" y2="30" class="staff-line"/><line x1="16" y1="42" x2="146" y2="42" class="staff-line"/><line x1="16" y1="54" x2="146" y2="54" class="staff-line"/><line x1="16" y1="66" x2="146" y2="66" class="staff-line"/><line x1="16" y1="78" x2="146" y2="78" class="staff-line"/>
    ${ledger}
    <ellipse cx="${headCx}" cy="${headCy}" rx="${rx}" ry="${ry}" transform="rotate(-23 ${headCx} ${headCy})" fill="${fill}" class="note-head"/>
    <line x1="${stemX}" y1="${stemY1}" x2="${stemX}" y2="${stemY2}" class="note-stem" stroke="${fill}"/>
  </svg>`;
}
function makeTile(note,{colored=true,showSyllable=true,disabled=false,onClick=null}={}){
  const btn=document.createElement('button'); btn.type='button'; btn.className='tile'; if(disabled) btn.disabled=true;
  btn.innerHTML=`<div class="note-wrap">${noteSvg(note,{colored})}</div>${showSyllable?`<div class="tile-label">${note.syllable}</div>`:''}`;
  if(onClick) btn.addEventListener('click',onClick);
  return btn;
}
function renderPreview(){const host=$('previewGrid'); host.replaceChildren(); SCALE.forEach(n=>host.append(makeTile(n,{colored:true,showSyllable:true,disabled:true})));}
function updatePill(){ $('partPill').textContent = state.part<=3 ? `Teil ${state.part} von 3` : 'Fertig'; }
function setFeedback(part,msg,type=''){const box=$('feedback'+part); box.textContent=msg; box.className='feedback'+(type?(' '+type):'');}
function clearFeedbacks(){[1,2,3].forEach(n=>setFeedback(n,''));}

function initPart1(){state.part=1;updatePill();state.part1.pool=shuffle(SCALE.map(n=>n.id));state.part1.answer=[];renderPart1();showOnly('part1');setFeedback(1,'');}
function renderPart1(){const poolHost=$('part1Source');const ansHost=$('part1Answer'); poolHost.replaceChildren(); ansHost.replaceChildren();
  state.part1.pool.forEach(id=>{const note=SCALE.find(n=>n.id===id);const used=state.part1.answer.includes(id);poolHost.append(makeTile(note,{colored:true,showSyllable:true,disabled:used,onClick:()=>{if(!used && state.part1.answer.length<8){state.part1.answer.push(id);renderPart1();}}}));});
  for(let i=0;i<8;i++){const slot=document.createElement('div'); slot.className='answer-slot'+(state.part1.answer[i]?' filled':''); slot.innerHTML=`<div class="slot-number">${i+1}</div>`; if(state.part1.answer[i]){ const note=SCALE.find(n=>n.id===state.part1.answer[i]); const wrap=document.createElement('div'); wrap.className='answer-tile'; wrap.innerHTML=`<div class="note-wrap">${noteSvg(note,{colored:true})}</div><div class="tile-label">${note.syllable}</div>`; slot.append(wrap);} ansHost.append(slot);} }
function checkPart1(){ if(state.part1.answer.length<8){setFeedback(1,'Ordne zuerst alle acht Felder ein.','bad');return;} const ok=SCALE.every((n,i)=>state.part1.answer[i]===n.id); if(ok){setFeedback(1,'Richtig! Weiter geht es mit Teil 2.','good'); setTimeout(()=>initPart2(),900);} else {setFeedback(1,'Noch nicht ganz. Ordne vom tiefen Do bis zum hohen Do.','bad');} }

function initPart2(){state.part=2;updatePill();state.part2.pool=shuffle(SCALE.map(n=>n.id));state.part2.answer=[];state.part2.colors=Array(8).fill(null);renderPart2();showOnly('part2');setFeedback(2,'');}
function makePalette(selected,onSelect){const wrap=document.createElement('div'); wrap.className='palette twoRows'; COLORS.forEach(c=>{const b=document.createElement('button'); b.type='button'; b.className='color-btn'+(selected===c.key?' selected':'')+(c.key==='weiß'?' white':''); b.style.setProperty('--color',c.hex); b.setAttribute('aria-label',c.label); b.title=c.label; b.addEventListener('click',onSelect.bind(null,c.key)); wrap.append(b);}); return wrap;}
function renderPart2(){const poolHost=$('part2Source');const ansHost=$('part2Answer'); poolHost.replaceChildren(); ansHost.replaceChildren();
  state.part2.pool.forEach(id=>{const note=SCALE.find(n=>n.id===id); const used=state.part2.answer.includes(id); poolHost.append(makeTile(note,{colored:false,showSyllable:true,disabled:used,onClick:()=>{if(!used && state.part2.answer.length<8){state.part2.answer.push(id);renderPart2();}}}));});
  for(let i=0;i<8;i++){const slot=document.createElement('div'); slot.className='answer-slot'+(state.part2.answer[i]?' filled':''); slot.innerHTML=`<div class="slot-number">${i+1}</div>`; if(state.part2.answer[i]){ const note=SCALE.find(n=>n.id===state.part2.answer[i]); const wrap=document.createElement('div'); wrap.className='answer-tile'; wrap.innerHTML=`<div class="note-wrap">${noteSvg(note,{colored:false})}</div><div class="tile-label">${note.syllable}</div>`; slot.append(wrap); slot.append(makePalette(state.part2.colors[i],(key)=>{state.part2.colors[i]=key;renderPart2();})); }
  ansHost.append(slot);} }
function checkPart2(){ if(state.part2.answer.length<8){setFeedback(2,'Ordne zuerst alle acht Felder ein.','bad');return;} if(state.part2.colors.some((v,i)=>state.part2.answer[i] && !v)){setFeedback(2,'Wähle zu jedem Feld eine Farbe aus.','bad');return;} const orderOk=SCALE.every((n,i)=>state.part2.answer[i]===n.id); const colorsOk=SCALE.every((n,i)=>state.part2.colors[i]===n.color); if(orderOk && colorsOk){setFeedback(2,'Super! Jetzt kommt Teil 3.','good'); setTimeout(()=>initPart3(),900);} else if(!orderOk && !colorsOk){setFeedback(2,'Reihenfolge und Farben stimmen noch nicht ganz.','bad');} else if(!orderOk){setFeedback(2,'Die Reihenfolge stimmt noch nicht ganz.','bad');} else {setFeedback(2,'Prüfe die Farben noch einmal.','bad');} }

function initPart3(){state.part=3;updatePill();state.part3.order=shuffle(SCALE.map(n=>n.id));state.part3.colors=Array(8).fill(null);state.part3.syllables=Array(8).fill('');renderPart3();showOnly('part3');setFeedback(3,'');}
function renderPart3(){const host=$('part3Grid'); host.replaceChildren(); state.part3.order.forEach((id,idx)=>{const note=SCALE.find(n=>n.id===id); const card=document.createElement('div'); card.className='identify-card'; card.innerHTML=`<div class="note-wrap">${noteSvg(note,{colored:false,small:true})}</div>`; const input=document.createElement('input'); input.type='text'; input.placeholder='Silbe'; input.value=state.part3.syllables[idx]; input.maxLength=5; input.autocomplete='off'; input.spellcheck=false; input.setAttribute('aria-label',`Silbe zu Note ${idx+1}`); input.addEventListener('input',e=>{state.part3.syllables[idx]=e.target.value;}); card.append(input); card.append(makePalette(state.part3.colors[idx],(key)=>{state.part3.colors[idx]=key;renderPart3();})); host.append(card); }); }
function checkPart3(){ if(state.part3.colors.some(v=>!v) || state.part3.syllables.some(v=>!normalize(v))){setFeedback(3,'Fülle alle Silben aus und wähle überall eine Farbe.','bad'); return;} const allOk=state.part3.order.every((id,idx)=>{const note=SCALE.find(n=>n.id===id); return state.part3.colors[idx]===note.color && normalize(state.part3.syllables[idx])===normalize(note.syllable);}); if(allOk){completeGame();} else {setFeedback(3,'Noch nicht alles richtig. Prüfe Farben und Silben noch einmal.','bad');} }
function completeGame(){state.part=4;updatePill(); showOnly('complete'); const host=$('summary'); host.replaceChildren(); SCALE.forEach(n=>{const c=document.createElement('div'); c.className='mini-card'; c.innerHTML=`${noteSvg(n,{colored:true,small:true})}<div class="mini-name">${n.syllable}</div><div class="mini-color">${n.color}</div>`; host.append(c);});}
function showOnly(id){['part1','part2','part3','complete'].forEach(x=>$(x).classList.toggle('hidden',x!==id)); window.scrollTo({top:0,behavior:'smooth'});}
function restartAll(){clearFeedbacks();initPart1();}
$('undo1').addEventListener('click',()=>{state.part1.answer.pop();renderPart1();setFeedback(1,'');});
$('shuffle1').addEventListener('click',()=>{state.part1.pool=shuffle(SCALE.map(n=>n.id));state.part1.answer=[];renderPart1();setFeedback(1,'');});
$('check1').addEventListener('click',checkPart1);
$('undo2').addEventListener('click',()=>{const pos=state.part2.answer.length-1; if(pos>=0){state.part2.answer.pop();state.part2.colors[pos]=null;renderPart2();setFeedback(2,'');}});
$('shuffle2').addEventListener('click',()=>{state.part2.pool=shuffle(SCALE.map(n=>n.id));state.part2.answer=[];state.part2.colors=Array(8).fill(null);renderPart2();setFeedback(2,'');});
$('check2').addEventListener('click',checkPart2);
$('shuffle3').addEventListener('click',()=>{state.part3.order=shuffle(SCALE.map(n=>n.id));state.part3.colors=Array(8).fill(null);state.part3.syllables=Array(8).fill('');renderPart3();setFeedback(3,'');});
$('check3').addEventListener('click',checkPart3);
$('restartAll').addEventListener('click',restartAll);
renderPreview();initPart1();
