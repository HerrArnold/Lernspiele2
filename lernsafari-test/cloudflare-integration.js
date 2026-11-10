/* LernSafari v3.0 – Use the existing Cloudflare Worker, keeping the original API and game logic.
   Real access is ALWAYS authorized by Cloudflare, never by a frontend role flag. */
'use strict';
(()=>{
 const API=()=>String(window.LERNSAFARI_BACKEND_URL||'').replace(/\/+$/,'');
 const CHILD_KEY='lernsafari-token-v1';
 const ADMIN_KEY='lernsafari-admin-token-v2';
 const esc=v=>escapeHtml(String(v??''));
 const html=(v)=>esc(v);
 let childToken='', adminToken='', person=null, plan=null, adminData=null, pending=false;
 const safeGame=(name)=>Object.entries(ORIGINAL_GAMES).flatMap(([subject,items])=>items.map(g=>({...g,subject}))).find(g=>g.file.replace(/\.html$/,'')===name);
 const dateFormat=s=>{const d=new Date(s);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('de-CH',{timeZone:'Europe/Zurich',day:'numeric',month:'short',year:'numeric'}).format(d):''};
 const localDateTime=d=>{const p=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(d);return p.replace(' ','T')};
 const errorText=e=>e instanceof Error?e.message:'Verbindung fehlgeschlagen';
 const notify=(msg)=>{toast(msg);const status=document.querySelector('#cloudStatus');if(status)status.textContent=msg};
 const loggedChild=()=>state.role==='cloudflare-child'&&!!childToken;
 const loggedTeacher=()=>state.role==='cloudflare-admin'&&!!adminToken;

 async function call(path,{method='GET',body,admin=false,token}={}){
  if(!API()||!/^https:\/\//.test(API()))throw Error('Cloudflare-Adresse fehlt oder ist nicht HTTPS.');
  const headers={'Accept':'application/json'};
  if(body!==undefined)headers['Content-Type']='application/json';
  const t=token!==undefined?token:(admin?adminToken:childToken);
  if(t){if(admin)headers['X-Safari-Admin']=t;else headers.Authorization='Bearer '+t;}
  let res;
  try{res=await fetch(API()+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});}catch(_){throw Error('Cloudflare nicht erreichbar. Prüfe Internet und die erlaubte GitHub-Domain (CORS).')}
  let data;try{data=await res.json()}catch(_){throw Error('Der Server hat keine gültige Antwort gesendet.')}
  if(!res.ok)throw Error(String(data.error||`Serverfehler (${res.status})`).slice(0,240));
  return data;
 }
 async function childLogin(username,password){
  if(pending)return;pending=true;
  try{
   if(!username.trim()||!password)throw Error('Bitte Benutzername und Passwort eingeben.');
   notify('Anmeldung wird geprüft …');
   const response=await call('/login',{method:'POST',body:{username:username.trim(),password}});
   if(typeof response.token!=='string'||!response.token)throw Error('Cloudflare hat kein gültiges Sitzungstoken geliefert.');
   // Check role server-side before granting a personal area.
   const identity=await call('/me',{token:response.token});
   if(identity.role!=='child')throw Error('Dieses Konto ist kein Kinderkonto. Verwende den Lehrpersonenzugang.');
   childToken=response.token;person=identity;
   try{localStorage.setItem(CHILD_KEY,childToken)}catch(_){/* transient session only */}
   document.querySelector('#password').value='';
   enter('cloudflare-child',String(identity.username||response.username||username));
  }catch(e){notify('Anmeldung fehlgeschlagen: '+errorText(e));}
  finally{pending=false}
 }
 async function adminLogin(code){
  if(pending)return;pending=true;
  try{
   if(!code)throw Error('Bitte den bestehenden Cloudflare-Admincode eingeben.');
   notify('Adminzugang wird von Cloudflare geprüft …');
   const result=await call('/admin-unlock',{method:'POST',body:{password:code}});
   if(!result?.token)throw Error('Cloudflare hat keinen Adminzugang erteilt.');
   await call('/admin-session',{admin:true,token:result.token});
   adminToken=result.token;try{sessionStorage.setItem(ADMIN_KEY,adminToken)}catch(_){/* just this tab */}
   document.querySelector('#teacherDialog').hidden=true;
   enter('cloudflare-admin','Lehrperson');
   setTimeout(()=>{if(loggedTeacher()&&state.screen==='camp')showModal('admin')},760);
  }catch(e){const el=document.querySelector('#teacherError');if(el)el.textContent=errorText(e);notify('Admin-Anmeldung fehlgeschlagen.');}
  finally{pending=false}
 }
 async function signOut(){
  if(childToken){try{await call('/logout',{method:'POST',body:{}})}catch(_){/* invalidate locally anyway */}}
  childToken='';person=null;adminToken='';plan=null;adminData=null;
  try{localStorage.removeItem(CHILD_KEY);sessionStorage.removeItem(ADMIN_KEY)}catch(_){}
 }
 async function restore(){
  try{childToken=localStorage.getItem(CHILD_KEY)||'';adminToken=sessionStorage.getItem(ADMIN_KEY)||''}catch(_){childToken='';adminToken=''}
  if(adminToken){
   try{await call('/admin-session',{admin:true});enter('cloudflare-admin','Lehrperson');return}
   catch(_){adminToken='';try{sessionStorage.removeItem(ADMIN_KEY)}catch(_){}}
  }
  if(childToken){
   try{const identity=await call('/me');if(identity.role!=='child')throw Error('Unzulässige Rolle');person=identity;enter('cloudflare-child',String(identity.username||'Tierkonto'));return}
   catch(_){childToken='';try{localStorage.removeItem(CHILD_KEY)}catch(_){}}
  }
 }
 const originalRender=renderModal;
 renderModal=function(){
   if(state.modal==='logbook'&&loggedChild()){renderChildLogbook();return;}
   if(state.modal==='admin'&&loggedTeacher()){renderCloudAdmin();return;}
   if(state.modal==='agenda'&&(loggedChild()||loggedTeacher())){renderCloudAgenda();return;}
   originalRender();
 };

 const STEP_LABELS={word:'Zahl als Wort',parity:'Gerade oder ungerade?',place:'Stellentafel mit Punkten',decomp:'Zerlegung',art:'Hunderter, Zehner und Einer',line:'Zahlenstrahl'};
 function targetName(target){
  if(target.startsWith('game:'))return safeGame(target.slice(5))?.title||target.slice(5).replace(/-/g,' ');
  if(target.startsWith('daily:'))return `Tagesaufgabe ${Number(target.slice(6))+1}`;
  if(target.startsWith('number:'))return `Zahl des Tages · ${STEP_LABELS[target.slice(7)]||target.slice(7)}`;
  if(target==='page:tiere')return 'Tierwelt';if(target==='page:advent')return 'Adventskalender';
  if(target==='page:aufgaben')return 'Aufgaben des Tages';
  if(target==='page:agenda')return 'Agenda';if(target==='page:lernportale')return 'Lernportale';
  return target;
 }
 function openTarget(target){
  closeModal(true);
  if(target.startsWith('game:')){
   const game=safeGame(target.slice(5));if(!game){notify('Dieses Lernspiel ist im neuen Katalog noch nicht vorhanden.');return;}
   if(game.subject==='Allgemein'){travelTo('oasis');originalFrame('original/spiele/'+encodeURIComponent(game.file),game.title,{areaId:'oasis',contextLabel:'Freie Angebote'});return;}
   travelTo('lagoon');safariSubject=game.subject;safariGame=game;safariGameOrigin=game.subject;renderLagoon();return;
  }
  if(target.startsWith('daily:')||target.startsWith('number:')||target==='page:aufgaben'){
   travelTo('valley');const frame=document.querySelector('#originalGameFrame');
   if(frame&&(target.startsWith('daily:')||target.startsWith('number:')))frame.addEventListener('load',()=>{
    try{const id=target.startsWith('daily:')?'#exercise-'+Number(target.slice(6)):`[data-step="${CSS.escape(target.slice(7))}"]`;
     frame.contentDocument.querySelector(id)?.scrollIntoView({block:'center'});}catch(_){}
   },{once:true});return;
  }
  if(target==='page:tiere'){travelTo('baobab');originalFrame('original/index.html#tiere','Unsere Klassentiere',{areaId:'baobab',contextLabel:'Tierwelt'});return}
  if(target==='page:advent'){travelTo('baobab');originalFrame('original/index.html#advent','Adventskalender',{areaId:'baobab'});return}
  if(target==='page:agenda'){showModal('agenda');return}
  notify('Für diesen Auftrag bitte die entsprechende Seite über die Karte öffnen.');
 }
 async function renderChildLogbook(){
  const host=DOM.modalBody;
  host.innerHTML='<div class="pd-shell"><div class="pd-panel"><h3>📖 Mein Logbuch</h3><p>Deine Aufträge werden sicher von Cloudflare geladen …</p></div></div>';
  try{
   const [p,highscores]=await Promise.all([call('/learning-plan'),call('/highscores').catch(()=>({highscores:[]}))]);
   if(!loggedChild()||state.modal!=='logbook')return;
   plan=p;
   const assignments=Array.isArray(p.assignments)?p.assignments:[];
   const done=new Set(Array.isArray(p.done)?p.done.map(Number):[]);
   const finished=assignments.filter(a=>done.has(Number(a.id))).length;
   const scores=Array.isArray(highscores.highscores)?highscores.highscores:[];
   host.innerHTML=`<div class="pd-shell cloud-shell"><div class="pd-banner"><div><span class="pd-eyebrow">🔐 Geschütztes Tierkonto</span><h3>Mein Logbuch 📖</h3><p>Willkommen, ${html(state.username)}! Das sind deine Aufträge aus Cloudflare.</p></div><div class="pd-total"><strong>${finished} / ${assignments.length}</strong><span>erledigt</span></div></div><div class="pd-progress"><span style="width:${assignments.length?finished/assignments.length*100:0}%"></span></div>${p.blocks?.length?`<div class="pd-warning">🧭 Fokus-Modus: ${p.blocks.map(html).join(', ')}</div>`:''}<div class="pd-items">${assignments.length?assignments.map(a=>`<article class="pd-task ${done.has(Number(a.id))?'is-done':''}"><div class="pd-task-head"><span>📌</span><div><strong>${html(a.title)}</strong><small>${a.kind==='zusatz'?'Zusatzaufgabe':'Pflichtaufgabe'} · ${html(targetName(String(a.target||'')))}${a.end_at?' · bis '+html(dateFormat(a.end_at)):''}</small></div><span class="pd-task-status">${done.has(Number(a.id))?'✓ Erledigt':'Offen'}</span></div><div class="pd-task-actions"><button class="pd-action" data-cloud-open="${html(a.id)}">Aufgabe öffnen</button><label class="pd-inline-check"><input type="checkbox" data-cloud-done="${html(a.id)}" ${done.has(Number(a.id))?'checked':''}> Erledigt</label></div></article>`).join(''):'<div class="pd-panel">Für dich sind momentan keine Aufgaben freigeschaltet.</div>'}</div><div class="pd-panel"><h4>⭐ Meine Spiel-Erfolge</h4><p>${scores.length} Spiele mit gespeichertem Highscore. Einzelne Aufgaben können auch über die bisherigen Spielauswertungen erfasst werden.</p><div class="pd-score-list">${scores.slice(0,12).map(x=>`<span>${html(safeGame(String(x.game))?.title||x.game)}: <strong>${html(x.score)}</strong></span>`).join('')}</div></div><p class="pd-warning">Deine Aufträge und Häkchen werden über Cloudflare gespeichert. Das Ankreuzen bedeutet «Ich bin fertig» – nicht automatisch «Alles richtig».</p></div>`;
   host.querySelectorAll('[data-cloud-open]').forEach(b=>b.onclick=()=>{const a=assignments.find(x=>Number(x.id)===Number(b.dataset.cloudOpen));if(a)openTarget(String(a.target||''))});
   host.querySelectorAll('[data-cloud-done]').forEach(b=>b.onchange=async()=>{const id=Number(b.dataset.cloudDone),checked=b.checked;b.disabled=true;try{await call('/assignment-done',{method:'POST',body:{id,completed:checked}});if(state.modal==='logbook')renderChildLogbook();}catch(e){b.checked=!checked;b.disabled=false;notify(errorText(e))}});
  }catch(e){if(state.modal==='logbook')host.innerHTML=`<div class="pd-panel"><h3>Logbuch konnte nicht geladen werden</h3><p>${html(errorText(e))}</p><button type="button" class="pd-action" id="retryCloudLogbook">Nochmals versuchen</button></div>`;document.querySelector('#retryCloudLogbook')?.addEventListener('click',renderChildLogbook)}
 }
 const BASIC_TARGETS=[...Array.from({length:4},(_,i)=>({v:'daily:'+i,label:`Heute · Tagesaufgabe ${i+1}`})),...Object.entries(STEP_LABELS).map(([id,label])=>({v:'number:'+id,label:'Zahl des Tages · '+label})),{v:'page:tiere',label:'Tierwelt'},{v:'page:aufgaben',label:'Aufgaben des Tages'},{v:'page:agenda',label:'Agenda'},{v:'page:advent',label:'Adventskalender'}];
 function targets(){return [...BASIC_TARGETS,...Object.entries(ORIGINAL_GAMES).flatMap(([subject,items])=>items.map(g=>({v:'game:'+g.file.replace(/\.html$/,''),label:subject+' · '+g.title})))].sort((a,b)=>a.label.localeCompare(b.label,'de-CH'))}
 function selectOptions(items,field='v',label='label'){return items.map(i=>`<option value="${html(i[field])}">${html(i[label])}</option>`).join('')}
 async function renderCloudAdmin(){
  if(!loggedTeacher())return;
  const host=DOM.modalBody;
  host.innerHTML='<div class="pd-panel"><h3>🛠️ Cloudflare-Verwaltung</h3><p>Verwaltungsdaten werden geladen …</p></div>';
  try{
   const report=await call('/admin-learning',{admin:true});if(!loggedTeacher()||state.modal!=='admin')return;
   adminData=report;
   const kids=Array.isArray(report.students)?report.students:[];
   const jobs=Array.isArray(report.assignments)?report.assignments:[];
   const pres=Array.isArray(report.presence)?report.presence:[];
   const done=Array.isArray(report.done)?report.done:[];
   const now=new Date(),later=new Date(now.getTime()+7*86400000);
   host.innerHTML=`<div class="pd-shell cloud-shell"><div class="pd-banner"><div><span class="pd-eyebrow">🔐 Cloudflare · Lehrperson</span><h3>Verwaltung 🛠️</h3><p>Die Aufträge werden in deiner bestehenden Cloudflare-Verwaltung gespeichert.</p></div><div class="pd-total"><strong>${kids.length}</strong><span>Tierkonten</span></div></div><section class="pd-panel"><h4>Neuen Lernauftrag zuweisen</h4><form id="cloudAssignmentForm" class="pd-form"><label>Aufgabe oder Lernspiel<select name="target" required>${selectOptions(targets())}</select></label><label>Titel<input name="title" maxlength="110" placeholder="z. B. Die 6er-Reihe üben" required></label><div class="cloud-form-grid"><label>Art<select name="kind"><option value="pflicht">Pflichtaufgabe</option><option value="zusatz">Zusatzaufgabe</option></select></label><label>Für wen?<select name="audience"><option value="all">Ganze Klasse</option><option value="child">Ein Kind</option></select></label></div><label id="cloudChildWrap" hidden>Tierkonto<select name="username">${selectOptions(kids,'username','username')}</select></label><div class="cloud-form-grid"><label>Beginn<input type="datetime-local" name="start" value="${html(localDateTime(now))}" required></label><label>Ende<input type="datetime-local" name="end" value="${html(localDateTime(later))}" required></label></div><button type="submit" class="pd-action">Auftrag in Cloudflare speichern</button><p role="status" id="cloudAdminMessage"></p></form></section><section class="pd-panel"><div class="cloud-panel-head"><h4>Geplante Aufträge (${jobs.length})</h4><button class="pd-secondary" id="cloudRefreshAdmin">Aktualisieren</button></div><div class="pd-items">${jobs.length?jobs.map(a=>{const c=done.filter(d=>Number(d.assignment_id)===Number(a.id)).length;return `<article class="pd-task"><div class="pd-task-head"><span>📌</span><div><strong>${html(a.title)}</strong><small>${html(targetName(String(a.target||'')))} · ${a.audience==='all'?'Ganze Klasse':html(a.username)}</small><small>${html(dateFormat(a.start_at))} – ${html(dateFormat(a.end_at))} · ${c} Erledigt-Häkchen</small></div></div><div class="pd-task-actions"><button class="pd-secondary" data-cloud-edit="${html(a.id)}">Bearbeiten</button><button class="pd-secondary" data-cloud-remove="${html(a.id)}">Löschen</button></div></article>`}).join(''):'Noch keine Aufträge geplant.'}</div></section><section class="pd-panel"><h4>Aktivität</h4><p>${pres.length} aktive Konten gemäss Cloudflare. Hier werden bewusst keine umfangreichen individuellen Daten veröffentlicht.</p><button type="button" class="pd-secondary" id="cloudOpenLegacy">Erweiterte Cloudflare-Verwaltung öffnen</button><p class="pd-warning">Die ausführliche bisherige Verwaltung enthält Lernsteuerung, Fokus-Modus, Agenda, Klassenbericht und weitere Funktionen. Sie wird unverändert weiterverwendet.</p></section></div>`;
   const form=host.querySelector('#cloudAssignmentForm');form.elements.audience.onchange=()=>{host.querySelector('#cloudChildWrap').hidden=form.elements.audience.value!=='child'};
   form.onsubmit=async e=>{e.preventDefault();const start=new Date(form.elements.start.value),end=new Date(form.elements.end.value);const msg=host.querySelector('#cloudAdminMessage');if(!(end>start)){msg.textContent='Ende muss nach dem Beginn liegen.';return}const payload={id:form.dataset.id?Number(form.dataset.id):undefined,audience:form.elements.audience.value,username:form.elements.audience.value==='child'?form.elements.username.value:'',start_at:start.toISOString(),end_at:end.toISOString(),target:form.elements.target.value,title:form.elements.title.value.trim(),kind:form.elements.kind.value};const submit=form.querySelector('[type=submit]');submit.disabled=true;try{await call('/admin-assignments',{admin:true,method:'POST',body:payload});await renderCloudAdmin();notify('Auftrag in Cloudflare gespeichert.')}catch(err){msg.textContent=errorText(err);submit.disabled=false}};
   host.querySelectorAll('[data-cloud-edit]').forEach(b=>b.onclick=()=>{const a=jobs.find(x=>Number(x.id)===Number(b.dataset.cloudEdit));if(!a)return;form.dataset.id=String(a.id);for(const key of ['target','title','kind','audience','username'])if(form.elements[key])form.elements[key].value=a[key]||'';form.elements.start.value=localDateTime(new Date(a.start_at));form.elements.end.value=localDateTime(new Date(a.end_at));form.elements.audience.onchange();form.querySelector('[type=submit]').textContent='Änderung in Cloudflare speichern';form.scrollIntoView({block:'start',behavior:'smooth'})});
   host.querySelectorAll('[data-cloud-remove]').forEach(b=>b.onclick=async()=>{if(!confirm('Diesen Auftrag wirklich aus Cloudflare löschen?'))return;try{await call('/admin-assignments',{admin:true,method:'DELETE',body:{id:Number(b.dataset.cloudRemove)}});await renderCloudAdmin()}catch(e){notify(errorText(e))}});
   host.querySelector('#cloudRefreshAdmin').onclick=renderCloudAdmin;
   host.querySelector('#cloudOpenLegacy').onclick=()=>{host.innerHTML='<div class="cloud-legacy-header"><button type="button" id="cloudBackAdmin" class="pd-secondary">← Zur Aufgabenverwaltung</button><p>Bestehende Cloudflare-Verwaltung (aus der bisherigen LernSafari)</p></div><iframe class="cloud-admin-frame" title="Bisherige Cloudflare-Verwaltung" src="original/index.html#admin"></iframe>';host.querySelector('#cloudBackAdmin').onclick=renderCloudAdmin};
  }catch(e){host.innerHTML=`<div class="pd-panel"><h3>Verwaltung nicht erreichbar</h3><p>${html(errorText(e))}</p><button class="pd-action" id="retryCloudAdmin">Erneut versuchen</button></div>`;host.querySelector('#retryCloudAdmin').onclick=renderCloudAdmin;}
 }
 function mondayOfZurich(){const day=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Zurich',weekday:'short'}).format(new Date());const idx={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[day]||0;const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const utc=new Date(today+'T12:00:00Z');utc.setUTCDate(utc.getUTCDate()-((idx+6)%7));return utc.toISOString().slice(0,10)}
 async function renderCloudAgenda(){
  const host=DOM.modalBody;
  const week=mondayOfZurich();
  host.innerHTML='<div class="pd-panel">🧭 Wochenagenda wird von Cloudflare geladen …</div>';
  try{
   const result=await call((loggedTeacher()?'/admin-agenda':'/agenda')+'?week='+week,{admin:loggedTeacher()});if(state.modal!=='agenda')return;
   const events=Array.isArray(result.events)?result.events:[];
   const days=Array.from({length:7},(_,i)=>{const d=new Date(week+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);return d.toISOString().slice(0,10)});
   const names=['Mo','Di','Mi','Do','Fr','Sa','So'];
   host.innerHTML=`<div class="pd-shell"><div class="pd-banner"><div><span class="pd-eyebrow">🧭 Cloudflare-Agenda</span><h3>Diese Woche</h3><p>Hausaufgaben, Lernkontrollen und Termine aus deiner bisherigen LernSafari.</p></div></div><div class="cloud-week">${days.map((date,i)=>`<article class="cloud-day"><h4>${names[i]} · ${html(dateFormat(date))}</h4>${events.filter(e=>e.day_date===date).map(e=>`<div class="cloud-event"><strong>${html(e.type==='lk'?'Lernkontrolle':e.type==='ha'?'Hausaufgabe':e.type==='free'?'Schulfrei':'Termin')}</strong><p>${html(e.text||'')}</p></div>`).join('')||'<p>Keine Einträge</p>'}</article>`).join('')}</div>${loggedTeacher()?'<p class="pd-warning">Termine bearbeiten: in der erweiterten Verwaltung unter «Agenda».</p>':''}</div>`;
  }catch(e){host.innerHTML=`<div class="pd-panel"><h3>Agenda nicht erreichbar</h3><p>${html(errorText(e))}</p></div>`}
 }

 // Existing app.js login placeholder handles submit in bubble phase; intercept for authenticated login.
 document.querySelector('#loginForm').addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();childLogin(document.querySelector('#username').value,document.querySelector('#password').value)},{capture:true});
 document.querySelector('#logoutBtn').addEventListener('click',e=>{if(!loggedChild()&&!loggedTeacher())return;e.preventDefault();e.stopImmediatePropagation();signOut().finally(()=>exit())},{capture:true});
 document.querySelector('#cloudTeacher').addEventListener('click',()=>{document.querySelector('#teacherDialog').hidden=false;document.querySelector('#teacherCode').focus()});
 const dialog=document.createElement('div');dialog.id='teacherDialog';dialog.className='cloud-dialog';dialog.hidden=true;
 dialog.innerHTML='<div class="cloud-dialog-card" role="dialog" aria-modal="true" aria-labelledby="teacherTitle"><button type="button" id="teacherClose" class="cloud-dialog-close" aria-label="Schliessen">×</button><span class="pd-eyebrow">Cloudflare · Lehrperson</span><h2 id="teacherTitle">🔐 Sicher anmelden</h2><p>Gib den bisherigen Cloudflare-Admincode ein. Der Code wird nur an deinen Cloudflare Worker übermittelt.</p><form id="teacherForm"><label for="teacherCode">Admincode</label><input id="teacherCode" type="password" autocomplete="current-password" required><button type="submit" class="pd-action">Mit Cloudflare prüfen</button><p id="teacherError" role="status"></p></form><p class="pd-warning">Kein Demo-Zugang: Cloudflare prüft und erteilt die Berechtigung.</p></div>';
 document.body.append(dialog);
 document.querySelector('#teacherClose').onclick=()=>{dialog.hidden=true;document.querySelector('#teacherCode').value=''};
 dialog.onclick=e=>{if(e.target===dialog)dialog.hidden=true};
 document.querySelector('#teacherForm').onsubmit=e=>{e.preventDefault();const c=document.querySelector('#teacherCode');adminLogin(c.value).finally(()=>c.value='')};
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)dialog.hidden=true});
 restore();
 window.LernSafariCloud={getIdentity:()=>person?.username||null,hasChild:loggedChild,hasAdmin:loggedTeacher,refreshLogbook:renderChildLogbook};
})();