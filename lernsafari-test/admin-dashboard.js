/* LernSafari teacher cockpit: group existing authenticated Cloudflare controls.
   No fabricated persistence or permission checks; all writes call the existing Worker. */
'use strict';
(function(root){
 const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const areas=[
  {id:'assignments',icon:'📌',name:'Lernaufträge',desc:'Tagesaufgaben, Fächer, Themen und Spiele zuweisen'},
  {id:'mode',icon:'🧭',name:'Unterrichtsmodus',desc:'Ankunftszeit, Fachunterricht und Entdeckungszeit'},
  {id:'progress',icon:'📈',name:'Lernfortschritte',desc:'Punkte und Lernversuche nach Kind und Thema'},
  {id:'activity',icon:'👀',name:'Aktivität',desc:'Anwesenheit und zuletzt gemeldete Tätigkeiten'},
  {id:'messages',icon:'✉️',name:'Nachrichten',desc:'Mitteilungen für Kinder vorbereiten'}
 ];
 const SUBJECTS=['Mathe','Deutsch','NMG','Musik','Englisch'];
 const TARGET_AREAS=[
  ['lagoon','🌊 Lern-Lagune','Fach → Thema → Spiel'],
  ['valley','🌞 Tages-Tal','Zahl des Tages und Tagesaufgaben'],
  ['baobab','🌳 Baobab-Baum','Wissensangebote und Advent'],
  ['agenda','🧭 Kompass','Agenda und Termine'],
  ['help','🦩 Lernhilfen','Unterstützung und Lernportale']
 ];
 function catalog(allowed){
  const permitted=new Set(allowed.map(x=>x.v));
  const bySubject={};
  for(const subject of SUBJECTS){
   bySubject[subject]=(root.LernSafariTopicCatalog?.[subject]||[]).map(topic=>({
     name:topic.name,icon:topic.icon,
     games:topic.games.map(([title,file])=>({title,file,target:file?'game:'+file.replace(/\.html$/,''):null,available:!!file&&permitted.has('game:'+file.replace(/\.html$/,''))}))
   }));
  }
  return bySubject;
 }
 function safeTargetOptions(targets,ids){
  return ids.map(id=>targets.find(t=>t.v===id)).filter(Boolean);
 }
 function createSelect(label,id,choices){return '<label>'+label+'<select id="'+id+'">'+choices.map(x=>'<option value="'+html(x[0])+'">'+html(x[1])+'</option>').join('')+'</select></label>'}
 function mount(opts){
  const {host,kids=[],jobs=[],pres=[],done=[],targets=[],call,renderAdminProgress}=opts;
  if(!host?.isConnected||!host.querySelector('#cloudAssignmentForm'))return;
  const shell=host.querySelector('.cloud-shell');
  const banner=shell?.querySelector('.pd-banner');
  if(!shell||!banner)return;
  const oldParts=[...shell.children].filter(el=>el!==banner);
  const assignForm=shell.querySelector('#cloudAssignmentForm'),assignmentPanel=assignForm.closest('section');
  const modeNode=shell.querySelector('#cloudClassroomModeContainer');
  const jobPanel=shell.querySelector('#cloudRefreshAdmin')?.closest('section');
  const progressPanel=shell.querySelector('#cloudProgressPanel');
  const activityPanel=shell.querySelector('#cloudOpenLegacy')?.closest('section');
  const verifyPanel=shell.querySelector('#cloudTeacherVerification');
  const lockPanel=shell.querySelector('#cloudLoginLocks');
  const deck=document.createElement('div');deck.className='admin-deck';
  deck.innerHTML='<div class="admin-deck-intro"><h4>Was möchtest du verwalten?</h4><p>Wähle einen Bereich. Du kannst jederzeit zurück zur Übersicht.</p></div>'+
    '<div class="admin-deck-grid">'+areas.map(a=>'<button type="button" class="admin-deck-card" data-admin-section="'+a.id+'"><span class="admin-deck-icon">'+a.icon+'</span><strong>'+a.name+'</strong><small>'+a.desc+'</small><span aria-hidden="true" class="admin-deck-arrow">→</span></button>').join('')+'</div>';
  shell.append(deck);
  const sections={};
  for(const item of areas){
   const sec=document.createElement('section');sec.className='admin-workspace';sec.dataset.adminWorkspace=item.id;
   sec.hidden=true;
   sec.innerHTML='<div class="admin-workspace-head"><button type="button" class="pd-secondary admin-home">← Zur Verwaltungsübersicht</button><div><h3>'+item.icon+' '+item.name+'</h3><p>'+item.desc+'</p></div></div>';
   shell.append(sec);sections[item.id]=sec;
   sec.querySelector('.admin-home').addEventListener('click',()=>open('home'));
  }
  if(assignmentPanel)sections.assignments.append(assignmentPanel);
  if(jobPanel)sections.assignments.append(jobPanel);
  if(verifyPanel)sections.assignments.append(verifyPanel);
  if(modeNode)sections.mode.append(modeNode);
  if(progressPanel)sections.progress.append(progressPanel);
  if(activityPanel)sections.activity.append(activityPanel);
  if(lockPanel)sections.activity.append(lockPanel);
  // Any unidentified old panel remains accessible in assignments; no controls are lost.
  for(const el of oldParts)if(el.parentElement===shell)sections.assignments.append(el);
  function open(name){
   deck.hidden=name!=='home';
   Object.entries(sections).forEach(([key,el])=>el.hidden=name!==key);
   banner.classList.toggle('admin-banner-compact',name!=='home');
   shell.scrollIntoView({block:'start',behavior:'smooth'});
   if(name==='progress')renderProgress();
  }
  deck.querySelectorAll('[data-admin-section]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.adminSection)));

  // Assignment hierarchy: map place -> subject -> topic -> game.
  const topics=catalog(targets);
  const originalLabel=assignForm.elements.target.closest('label');
  originalLabel.classList.add('admin-hidden-original-target');
  const picker=document.createElement('div');picker.className='admin-assignment-picker';
  picker.innerHTML='<h5>1. Wo befindet sich der Lernauftrag?</h5><div class="admin-area-pills" id="adminAreaPills">'+TARGET_AREAS.map(a=>'<button type="button" data-area="'+a[0]+'" aria-pressed="'+(a[0]==='lagoon')+'"><strong>'+a[1]+'</strong><small>'+a[2]+'</small></button>').join('')+'</div>'+
    '<div class="admin-picker-controls" id="adminPickerControls"></div>'+
    '<div class="admin-choice-caption" id="adminChosenCount" role="status"></div>';
  assignForm.prepend(picker);
  let area='lagoon',scope='game',selectedSubject='Mathe',selectedTopic='',selectedTarget='';
  const optsFor=()=>targets.filter(t=>t.v.startsWith('game:'));
  const getSubjectTopics=()=>topics[selectedSubject]||[];
  function redraw(){
   picker.querySelectorAll('[data-area]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.area===area)));
   const controls=picker.querySelector('#adminPickerControls');
   if(area==='lagoon'){
    const ts=getSubjectTopics();
    if(!ts.some(x=>x.name===selectedTopic))selectedTopic=ts[0]?.name||'';
    const chosen=ts.find(t=>t.name===selectedTopic);
    const options=chosen?.games||[];
    if(!options.some(x=>x.target===selectedTarget&&x.available))selectedTarget=options.find(x=>x.available)?.target||'';
    controls.innerHTML=createSelect('2. Fach','adminPickSubject',SUBJECTS.map(x=>[x,x]))+
      createSelect('3. Thema','adminPickTopic',ts.map(x=>[x.name,x.name]))+
      createSelect('4. Was zuweisen?','adminPickScope',[['game','Einzelnes Lernspiel'],['topic','Alle verfügbaren Spiele dieses Themas'],['subject','Ganzes Fach (alle verfügbaren Spiele)']])+
      (scope==='game'?createSelect('5. Spiel','adminPickGame',options.filter(x=>x.available).map(x=>[x.target,x.title])):'')+
      '<p class="admin-small-note">Ein ganzes Fach oder Thema wird in einzelne Aufträge für die enthaltenen Spiele aufgeteilt. Inhalte ohne Cloudflare-Auftragskennung sind noch nicht zuweisbar.</p>';
    controls.querySelector('#adminPickSubject').value=selectedSubject;
    controls.querySelector('#adminPickTopic').value=selectedTopic;
    controls.querySelector('#adminPickScope').value=scope;
    if(controls.querySelector('#adminPickGame'))controls.querySelector('#adminPickGame').value=selectedTarget;
    controls.querySelector('#adminPickSubject').onchange=e=>{selectedSubject=e.target.value;selectedTopic='';selectedTarget='';redraw()};
    controls.querySelector('#adminPickTopic').onchange=e=>{selectedTopic=e.target.value;selectedTarget='';redraw()};
    controls.querySelector('#adminPickScope').onchange=e=>{scope=e.target.value;redraw()};
    controls.querySelector('#adminPickGame')?.addEventListener('change',e=>{selectedTarget=e.target.value;sync()});
   }else{
    const ids=area==='valley'?targets.filter(x=>x.v.startsWith('daily:')||x.v.startsWith('number:')||x.v==='page:aufgaben'):
      area==='baobab'?safeTargetOptions(targets,['page:tiere','page:advent']):
      area==='help'?safeTargetOptions(targets,['page:lernportale']):
      safeTargetOptions(targets,['page:agenda']);
    if(!ids.some(x=>x.v===selectedTarget))selectedTarget=ids[0]?.v||'';
    controls.innerHTML=createSelect('2. Lerninhalt','adminPickAreaTarget',ids.map(x=>[x.v,x.label]));
    controls.querySelector('#adminPickAreaTarget').value=selectedTarget;
    controls.querySelector('#adminPickAreaTarget').onchange=e=>{selectedTarget=e.target.value;sync()};
   }
   sync();
  }
  function selection(){
   if(area!=='lagoon')return selectedTarget?[selectedTarget]:[];
   if(scope==='subject')return getSubjectTopics().flatMap(t=>t.games).filter(g=>g.available).map(g=>g.target);
   if(scope==='topic')return (getSubjectTopics().find(t=>t.name===selectedTopic)?.games||[]).filter(g=>g.available).map(g=>g.target);
   return selectedTarget?[selectedTarget]:[];
  }
  function sync(){
   const ids=[...new Set(selection())];
   const found=ids.filter(v=>targets.some(t=>t.v===v));
   if(found.length)assignForm.elements.target.value=found[0];
   picker.querySelector('#adminChosenCount').textContent=found.length
     ?found.length===1?'1 Lernauftrag ausgewählt: '+(targets.find(t=>t.v===found[0])?.label||found[0]):found.length+' Spiele als einzelne Lernaufträge ausgewählt'
     :'Keine aktuell zuweisbaren Aufgaben in dieser Auswahl.';
   assignForm.querySelector('[type="submit"]').disabled=found.length===0;
   if(!assignForm.elements.title.value.trim()&&found.length){
    assignForm.elements.title.value=scope==='subject'?selectedSubject+' üben':scope==='topic'?selectedTopic+' üben':targets.find(t=>t.v===found[0])?.label.split(' · ').at(-1)||'Lernauftrag';
   }
  }
  picker.querySelectorAll('[data-area]').forEach(b=>b.addEventListener('click',()=>{
    area=b.dataset.area;selectedTarget='';scope='game';redraw();
  }));
  redraw();
  // Editing an existing job should always return to a single target.
  assignForm.addEventListener('click',()=>{},false);
  host.querySelectorAll('[data-cloud-edit]').forEach(b=>b.addEventListener('click',()=>{
    const job=jobs.find(x=>String(x.id)===b.dataset.cloudEdit);if(!job)return;
    selectedTarget=String(job.target||'');
    if(selectedTarget.startsWith('game:')){
      area='lagoon';scope='game';
      for(const subject of SUBJECTS)for(const topic of topics[subject])if(topic.games.some(g=>g.target===selectedTarget)){
        selectedSubject=subject;selectedTopic=topic.name;
      }
    }else{area=selectedTarget.startsWith('daily:')||selectedTarget.startsWith('number:')||selectedTarget==='page:aufgaben'?'valley':
      ['page:tiere','page:advent'].includes(selectedTarget)?'baobab':selectedTarget==='page:lernportale'?'help':'agenda';scope='game'}
    redraw();
  }));
  assignForm.addEventListener('submit',async e=>{
    const ids=[...new Set(selection())].filter(v=>targets.some(t=>t.v===v));
    if(assignForm.dataset.id||ids.length<=1)return;
    e.preventDefault();e.stopImmediatePropagation();
    const status=host.querySelector('#cloudAdminMessage'),btn=assignForm.querySelector('[type="submit"]');
    const starts=new Date(assignForm.elements.start.value),ends=new Date(assignForm.elements.end.value);
    if(!ids.length||!(ends>starts)){status.textContent='Bitte gültige Aufträge und einen gültigen Zeitraum wählen.';return}
    if(!confirm('Wirklich '+ids.length+' einzelne Lernaufträge in Cloudflare für '+(assignForm.elements.audience.value==='all'?'die ganze Klasse':assignForm.elements.username.value)+' erstellen?'))return;
    btn.disabled=true;let saved=0;let error=null;
    for(const target of ids){
      const label=targets.find(x=>x.v===target)?.label||target;
      const payload={audience:assignForm.elements.audience.value,username:assignForm.elements.audience.value==='child'?assignForm.elements.username.value:'',
        start_at:starts.toISOString(),end_at:ends.toISOString(),target,kind:assignForm.elements.kind.value,
        title:(scope==='subject'?selectedSubject:scope==='topic'?selectedTopic:assignForm.elements.title.value.trim())+' · '+label.split(' · ').at(-1)};
      try{await call('/admin-assignments',{admin:true,method:'POST',body:payload});saved++}
      catch(err){error=err;break}
      status.textContent=saved+' von '+ids.length+' Aufträgen in Cloudflare gespeichert …';
    }
    if(error){status.textContent=saved+' Aufträge gespeichert; danach Fehler: '+String(error.message||error);btn.disabled=false;}
    else{status.textContent=saved+' Lernaufträge gespeichert.';await opts.renderCloudAdmin();}
  },true);
  // Always keep the legacy editor and its own authentication working.
  // New activity / messages panels are intentionally explicit about missing APIs.
  const livePanel=document.createElement('div');livePanel.className='pd-panel';
  const meaningful=pres.filter(p=>p&&typeof p==='object');
  livePanel.innerHTML='<h4>👀 Aktuelle Meldungen aus Cloudflare</h4><p class="admin-small-note">Diese Liste zeigt die vom Server gelieferten Anwesenheitsmeldungen. Eine genaue Live-Spielaktivität ist nur sichtbar, wenn der Worker sie mit Zeitstempel meldet.</p>'+
    (meaningful.length?'<div class="admin-presence-grid">'+meaningful.map(p=>{
      const user=p.username||p.name||'Tierkonto';
      const activity=p.game||p.activity||p.target||p.page||'Keine Tätigkeit übermittelt';
      const at=p.last_seen||p.lastSeen||p.updated_at||p.timestamp||null;
      return '<article><strong>'+html(user)+'</strong><span>'+html(activity)+'</span><small>'+html(at?String(at):'Keine Uhrzeit übermittelt')+'</small></article>';
    }).join('')+'</div>':'<p>Cloudflare meldet momentan keine Anwesenheitsdaten.</p>');
  sections.activity.prepend(livePanel);
  const messagePanel=document.createElement('div');messagePanel.className='pd-panel';
  messagePanel.innerHTML='<h4>✉️ Mitteilung vorbereiten</h4><p>Du kannst hier eine Nachricht formulieren. Das Senden an Kinderkonten benötigt eine bestätigte Cloudflare-Nachrichtenfunktion; es wird nichts unbemerkt verschickt.</p><label>Betreff<input id="adminMessageSubject" maxlength="100" placeholder="z. B. Morgen mitbringen"></label><label>Nachricht<textarea id="adminMessageText" rows="5" maxlength="1500" placeholder="Deine Nachricht an die Kinder …"></textarea></label><div class="admin-message-actions"><button type="button" class="pd-action" id="adminMessageCopy">Text kopieren</button><button type="button" class="pd-secondary" id="adminMessageLegacy">Bestehende Verwaltung öffnen</button></div><p id="adminMessageStatus" role="status"></p>';
  sections.messages.append(messagePanel);
  messagePanel.querySelector('#adminMessageCopy').onclick=async()=>{
    const subject=messagePanel.querySelector('#adminMessageSubject').value.trim(),body=messagePanel.querySelector('#adminMessageText').value.trim();
    if(!body){messagePanel.querySelector('#adminMessageStatus').textContent='Bitte zuerst einen Nachrichtentext eingeben.';return}
    try{await navigator.clipboard.writeText((subject?subject+'\n\n':'')+body);messagePanel.querySelector('#adminMessageStatus').textContent='Text kopiert – noch nicht versendet.'}
    catch(_){messagePanel.querySelector('#adminMessageStatus').textContent='Kopieren im Browser nicht erlaubt. Du kannst den Text markieren und kopieren.'}
  };
  messagePanel.querySelector('#adminMessageLegacy').onclick=()=>host.querySelector('#cloudOpenLegacy')?.click();
  async function renderProgress(){
    const mountPoint=sections.progress;
    let wrapper=mountPoint.querySelector('#adminDrilldown');
    if(!wrapper){wrapper=document.createElement('section');wrapper.className='pd-panel';wrapper.id='adminDrilldown';mountPoint.prepend(wrapper);}
    wrapper.innerHTML='<h4>📊 Detaillierte Lernfortschritte</h4><p role="status">Daten werden sicher aus Cloudflare geladen …</p>';
    try{
      const report=await call('/admin-report',{admin:true});
      if(!wrapper.isConnected)return;
      const attempts=Array.isArray(report.attempts)?report.attempts:[];
      const highs=Array.isArray(report.highscores)?report.highscores:[];
      wrapper.innerHTML='<h4>📊 Detaillierte Lernfortschritte</h4><div class="admin-progress-filters">'+
        createSelect('Kind','adminProgressKid',[['','Alle Kinder'],...kids.map(k=>[k.username,k.username])])+
        createSelect('Fach','adminProgressSubject',[['','Alle Fächer'],...SUBJECTS.map(s=>[s,s])])+
        createSelect('Thema','adminProgressTopic',[['','Alle Themen']])+
        '</div><div id="adminProgressDetails"></div><p class="admin-small-note">Die Zahlen beruhen ausschliesslich auf vorhandenen Cloudflare-Spielversuchen. Nicht übermittelte Ergebnisse werden nicht geschätzt.</p>';
      const filters={kid:wrapper.querySelector('#adminProgressKid'),subject:wrapper.querySelector('#adminProgressSubject'),topic:wrapper.querySelector('#adminProgressTopic')},output=wrapper.querySelector('#adminProgressDetails');
      const topicGames=()=> (topics[filters.subject.value]||[]);
      function updateTopics(){
        const old=filters.topic.value;
        filters.topic.innerHTML='<option value="">Alle Themen</option>'+topicGames().map(t=>'<option value="'+html(t.name)+'">'+html(t.name)+'</option>').join('');
        filters.topic.value=topicGames().some(t=>t.name===old)?old:'';
      }
      const selectedGames=()=>{
        if(!filters.subject.value)return null;
        const candidates=topicGames().filter(t=>!filters.topic.value||t.name===filters.topic.value);
        return new Set(candidates.flatMap(t=>t.games.map(g=>g.file?.replace(/\.html$/,'')).filter(Boolean)));
      };
      const numeric=x=>{const n=Number(x);return Number.isFinite(n)?n:null};
      function draw(){
        const games=selectedGames(),kid=filters.kid.value;
        const rec=attempts.filter(a=>(!kid||a.username===kid)&&(!games||games.has(String(a.game||a.game_id||''))));
        const scores=highs.filter(a=>(!kid||a.username===kid)&&(!games||games.has(String(a.game||a.game_id||''))));
        const completedGames=new Set(rec.map(x=>x.game||x.game_id).filter(Boolean));
        const points=rec.map(a=>numeric(a.score??a.points??a.correct_count??a.correctCount)).filter(x=>x!==null);
        const best=scores.map(a=>numeric(a.score??a.highscore??a.best_score)).filter(x=>x!==null);
        output.innerHTML='<div class="admin-metrics"><article><strong>'+rec.length+'</strong><span>gespeicherte Versuche</span></article><article><strong>'+completedGames.size+'</strong><span>verschiedene Spiele</span></article><article><strong>'+(points.length?Math.max(...points):'—')+'</strong><span>höchste Versuchspunkte*</span></article><article><strong>'+(best.length?Math.max(...best):'—')+'</strong><span>bester Highscore*</span></article></div>'+
          '<p class="admin-small-note">* Punkte nur, sofern die Cloudflare-Daten diesen Wert enthalten; verschiedene Spiele haben unterschiedliche Maximalpunktzahlen.</p>'+
          (rec.length?'<div class="admin-result-rows">'+rec.slice(0,75).map(a=>{
            const rawDate=a.created_at||a.at||a.timestamp||'';
            const rawPoints=numeric(a.score??a.points??a.correct_count??a.correctCount);
            return '<article><strong>'+html(a.username||'')+'</strong><span>'+html(a.game||a.game_id||'Lernspiel')+'</span><span>'+(rawPoints===null?'Punkte nicht übermittelt':rawPoints+' Punkte')+'</span><small>'+html(rawDate)+'</small></article>';
          }).join('')+'</div>':'<p>Für diese Auswahl liegen keine gespeicherten Versuche vor.</p>');
      }
      filters.subject.onchange=()=>{updateTopics();draw()};
      filters.kid.onchange=draw;filters.topic.onchange=draw;draw();
    }catch(err){wrapper.innerHTML='<h4>📊 Detaillierte Lernfortschritte</h4><p>Cloudflare-Bericht nicht verfügbar: '+html(err.message||err)+'</p>'}
  }
  // initial route always home, never expose a child report on the public guest view.
  open('home');
  return {open};
 }
 root.LernSafariAdminDashboard={mount,catalog};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.LernSafariAdminDashboard;
})(typeof window==='undefined'?globalThis:window);
