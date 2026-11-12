/* LernSafari · fünf kurze Hörverständnisse · 3. Klasse.
   Originalaufgaben und sinngemässe Musterantworten aus den Lehrpersonen-Dateien.
   Automatisch werden nur eindeutige Übereinstimmungen bewertet;
   unklare Freitexte bleiben zur Lehrpersonenkontrolle offen. */
'use strict';
(async function(){
 const id=window.HOER_KURZ, root=document.getElementById('short-hearing-app');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=s=>String(s??'').toLocaleLowerCase('de-CH').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9äöü ]/g,' ').replace(/\s+/g,' ').trim();
 const editDistance=(a,b)=>{const x=Array.from({length:b.length+1},(_,i)=>i);for(let i=0;i<a.length;i++){let prev=x[0];x[0]=i+1;for(let j=0;j<b.length;j++){const old=x[j+1];x[j+1]=Math.min(x[j+1]+1,x[j]+1,prev+(a[i]===b[j]?0:1));prev=old;}}return x[b.length]};
 const fuzzy=(a,b)=>{a=norm(a);b=norm(b);if(!a||!b)return false;if(a===b)return true;const d=editDistance(a,b);return d<=Math.max(1,Math.floor(Math.min(a.length,b.length)*.13))&&Math.min(a.length,b.length)>=4;};
 let data,step=0,finished=false;
 const answers={tf:{},open:{},words:{},order:{}};
 const steps=['Richtig oder falsch?','Fragen beantworten','Wörter erklären','Reihenfolge'];
 const scoreSections=['8 Punkte','5 Punkte','3 Punkte','4 Punkte'];
 const audioStatus={started:false};
 const get=(selector)=>root.querySelector(selector);
 function saveCurrent(){
   if(step===0)root.querySelectorAll('[data-tf]').forEach(x=>{if(x.checked)answers.tf[x.dataset.tf]=x.value==='true'});
   if(step===1)root.querySelectorAll('[data-open]').forEach(x=>answers.open[x.dataset.open]=x.value);
   if(step===2)root.querySelectorAll('[data-word]').forEach(x=>answers.words[x.dataset.word]=x.value);
   if(step===3)root.querySelectorAll('[data-order]').forEach(x=>answers.order[x.dataset.order]=x.value);
 }
 function sentence(s){return '<span>'+esc(s)+'</span>'}
 function content(){
  if(step===0)return '<p class="hv-instruction">Höre die Geschichte genau. Wähle bei jeder Aussage <strong>richtig</strong> oder <strong>falsch</strong>.</p><div class="hv-items">'+data.task1.map((q,i)=>'<fieldset class="hv-item"><legend><b>'+(i+1)+'.</b> '+esc(q.statement)+'</legend><div class="hv-two"><label><input type="radio" data-tf="'+q.id+'" name="tf-'+i+'" value="true" '+(answers.tf[q.id]===true?'checked':'')+'> <span>✓ Richtig</span></label><label><input type="radio" data-tf="'+q.id+'" name="tf-'+i+'" value="false" '+(answers.tf[q.id]===false?'checked':'')+'> <span>✕ Falsch</span></label></div></fieldset>').join('')+'</div>';
  if(step===1)return '<p class="hv-instruction">Antworte möglichst genau. Du darfst auch kurze Sätze schreiben. Rechtschreibfehler zählen bei der inhaltlichen Kontrolle nicht.</p><div class="hv-items">'+data.task2.map((q,i)=>'<label class="hv-item hv-write"><b>'+(i+1)+'. '+esc(q.question)+'</b><textarea data-open="'+q.id+'" rows="2" maxlength="300" placeholder="Deine Antwort …" spellcheck="true">'+esc(answers.open[q.id]||'')+'</textarea></label>').join('')+'</div>';
  if(step===2)return '<p class="hv-instruction">Erkläre jedes Wort in deinen eigenen Worten. Ein Beispiel darf dir dabei helfen.</p><div class="hv-items">'+data.task3.map((q,i)=>'<label class="hv-item hv-write"><b>'+(i+1)+'. Was bedeutet «'+esc(q.term)+'»?</b><textarea data-word="'+q.id+'" rows="2" maxlength="300" placeholder="Das bedeutet …" spellcheck="true">'+esc(answers.words[q.id]||'')+'</textarea></label>').join('')+'</div>';
  return '<p class="hv-instruction">Welche Ereignisse kommen zuerst? Wähle für jeden Satz eine andere Zahl von 1 bis 4.</p><div class="hv-items">'+data.task4.map((q,i)=>'<label class="hv-item hv-order"><span>'+esc(q.text)+'</span><select data-order="'+q.id+'" aria-label="Position für '+esc(q.text)+'"><option value="">Zahl wählen</option>'+[1,2,3,4].map(n=>'<option value="'+n+'" '+(Number(answers.order[q.id])===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label>').join('')+'</div>';
 }
 function render(){
  root.innerHTML='<header class="hv-hero"><div><div class="hv-eyebrow">🎧 Lern-Lagune · Deutsch · Hörverständnis</div><h1>'+esc(data.title)+'</h1><p>Höre die Geschichte und beantworte die Fragen. Die Aufnahme darfst du mehrmals abspielen.</p></div><span class="hv-badge">20 Punkte</span></header>'+ 
   '<div class="hv-player" role="region" aria-label="Hörgeschichte"><div><strong>🔊 Hörgeschichte</strong><small>Du kannst anhalten und zurückspulen.</small></div><audio controls preload="metadata" id="hvAudio" src="'+esc(data.audio)+'"></audio><button type="button" id="hvBackAudio" class="hv-soft">↶ 10 s</button><button type="button" id="hvRestartAudio" class="hv-soft">↻ Anfang</button></div><p id="hvAudioError" class="hv-alert" hidden>Das Audio konnte nicht geladen werden. Bitte melde es deiner Lehrperson.</p>'+ 
   (finished?'': '<div class="hv-progress"><div class="hv-progress-text">Aufgabe '+(step+1)+' von 4 <strong>'+steps[step]+'</strong></div><div class="hv-progressbar"><span style="width:'+((step+1)*25)+'%"></span></div></div><section class="hv-panel"><div class="hv-section-head"><h2>'+steps[step]+'</h2><span>'+scoreSections[step]+'</span></div>'+content()+'</section><div class="hv-actions"><button type="button" id="hvPrevious" class="hv-soft" '+(step===0?'disabled':'')+'>← Zurück</button><button type="button" id="hvNext" class="hv-main">'+(step===3?'Antworten abgeben':'Weiter →')+'</button></div><p class="hv-note">Deine Eingaben bleiben beim Wechsel zwischen den Aufgaben erhalten. Du kannst sie bis zur Abgabe verändern.</p>');
  const audio=get('#hvAudio');audio.addEventListener('error',()=>get('#hvAudioError').hidden=false);
  get('#hvBackAudio').onclick=()=>{audio.currentTime=Math.max(0,audio.currentTime-10)};
  get('#hvRestartAudio').onclick=()=>{audio.currentTime=0;audio.play().catch(()=>{})};
  if(!finished){get('#hvPrevious').onclick=()=>{saveCurrent();step=Math.max(0,step-1);render()};get('#hvNext').onclick=()=>{saveCurrent();if(step<3){step++;render()}else submit()};}
 }
 function semantic(value,q,word=false){
  const a=norm(value);if(!a)return {state:'wrong'};
  const variants=[q.core,q.meaning,...(q.accepted_examples||[])].filter(Boolean);
  // Clear exemplar match, allowing additions such as "Kito ist ...".
  if(variants.some(v=>{const b=norm(v);return a===b||fuzzy(a,b)|| (b.length>5&&a.includes(b)&&a.length<230)})){
   // A contradictory phrase should not be accepted alongside a good exemplar.
   if((q.incorrect_if||[]).some(w=>{const n=norm(w);return n.length>4&&a.includes(n)}))return {state:'review'};
   return {state:'right'};
  }
  // Clearly matching a listed misconception is incorrect.
  if((q.incorrect_if||[]).some(w=>{const n=norm(w);return n&& (a===n||fuzzy(a,n)|| (n.length>5&&a.includes(n)))}))return {state:'wrong'};
  // Meaning may be correct despite different wording, child spelling, or syntax.
  // We intentionally do NOT claim this local heuristic is an AI judge.
  return {state:'review'};
 }
 function assess(){
  const items=[];let correct=0,review=0;
  const tally=(q,part,answer,state)=>{if(state==='right')correct++;if(state==='review')review++;items.push({q,part,answer,state});};
  for(const q of data.task1)tally(q.statement,'Aussagen',answers.tf[q.id],answers.tf[q.id]===q.correct?'right':'wrong');
  for(const q of data.task2)tally(q.question,'Fragen',answers.open[q.id]||'',semantic(answers.open[q.id],q).state);
  for(const q of data.task3)tally('«'+q.term+'»','Wörter',answers.words[q.id]||'',semantic(answers.words[q.id],q,true).state);
  const nums=data.task4.map(q=>Number(answers.order[q.id]));const unique=new Set(nums.filter(n=>n>=1&&n<=4));
  for(const q of data.task4){const n=Number(answers.order[q.id]);tally(q.text,'Reihenfolge',n||'',unique.size===4&&n===q.correct_position?'right':'wrong')}
  return {correct,review,items};
 }
 function submit(){
   const missing=[...data.task1.filter(q=>typeof answers.tf[q.id]!=='boolean'),...data.task2.filter(q=>!String(answers.open[q.id]||'').trim()),...data.task3.filter(q=>!String(answers.words[q.id]||'').trim()),...data.task4.filter(q=>!answers.order[q.id])];
   if(missing.length && !confirm('Du hast noch '+missing.length+' Antwort(en) offen. Trotzdem abgeben?'))return;
   finished=true;const result=assess();render();
   const min=result.correct,max=Math.min(20,min+result.review);
   root.insertAdjacentHTML('beforeend','<section class="hv-result" role="status"><h2>🌟 Gut gemacht!</h2><p>Du hast alle vier Aufgaben bearbeitet.</p><div class="hv-score"><strong>'+min+' / 20</strong><span>Sicher erkannte Punkte</span></div>'+ (result.review?'<p class="hv-review">🔎 '+result.review+' freie Antwort(en) brauchen noch eine Kontrolle durch die Lehrperson. Bis dahin sind <strong>'+min+' bis '+max+' Punkte</strong> möglich.</p>':'<p>Alle Antworten wurden eindeutig zugeordnet.</p>')+'<details><summary>Antworten und Rückmeldung ansehen</summary><div class="hv-feedback">'+result.items.map(x=>'<div class="hv-feedback-item"><span class="hv-result-'+x.state+'">'+({right:'✓',wrong:'✕',review:'?'}[x.state])+'</span><div><strong>'+esc(x.q)+'</strong><small>'+esc(x.part)+' · '+(x.state==='review'?'Lehrperson prüft':x.state==='right'?'Als richtig erkannt':'Nicht richtig erkannt')+'</small></div></div>').join('')+'</div></details><button type="button" class="hv-main" id="hvAgain">Noch einmal üben</button></section>');
   get('#hvAgain').onclick=()=>{if(confirm('Möchtest du einen neuen Versuch starten?')){finished=false;step=0;for(const part of Object.values(answers))for(const key of Object.keys(part))delete part[key];render();}};
   try{const api=window.parent.SafariLogin;if(api?.auth?.()?.role==='child'&&api?.request){api.request('/game-attempt','POST',{game:'hoerverstehen-kurz-'+id,task:data.title,correct:result.correct===20,correctCount:result.correct,total:20,answer:'Automatisch eindeutig',expected:'20',details:'Offene Kontrollen: '+result.review}).catch(()=>{})}}catch(_){}
 }
 try{
   if(!/^(affe|loewe|brille|wettrennen|kuchen)$/.test(id))throw Error('Unbekanntes Hörverständnis');
   const r=await fetch('../hoerverstehen-data/kurz-'+id+'.json',{cache:'no-store'});if(!r.ok)throw Error('Die Aufgaben konnten nicht geladen werden');
   data=await r.json();if(data.task1.length!==8||data.task2.length!==5||data.task3.length!==3||data.task4.length!==4)throw Error('Aufgabenanzahl unvollständig');
   render();
 }catch(e){root.innerHTML='<div class="hv-alert">Dieses Hörverständnis konnte nicht gestartet werden. '+esc(e.message)+'</div>'}
})();