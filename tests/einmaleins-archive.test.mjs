import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const game=read('original/assets/einmaleins.js'),nav=read('topic-navigation.js');
function launch(mode){
 const map=new Map(),listeners={};
 const get=id=>{
   if(!map.has(id)){
     const classes=new Set();
     map.set(id,{id,classList:{
       add(v){classes.add(v)},remove(v){classes.delete(v)},
       contains(v){return classes.has(v)},toggle(v,val){if(val===undefined? !classes.has(v):val)classes.add(v);else classes.delete(v)}
     },innerHTML:'',textContent:'',value:'',disabled:false,readOnly:false,style:{},attrs:{},
       setAttribute(k,v){this.attrs[k]=v},addEventListener(type,fn){this['on_'+type]=fn},focus(){}});
   }
   return map.get(id);
 };
 const context={document:{body:{dataset:{mode}},getElementById:get,addEventListener(type,fn){listeners[type]=fn}},
 console:{warn(){}},window:{SafariTelemetry:{record(){}}},Math};
 vm.runInNewContext(game,context,{timeout:1000});
 return {get,listeners};
}
test('all four new game pages are wired to the same engine',()=>{
 for(const [name,mode] of [['siebener','seven'],['achter','eight'],['mix-sieben-acht','mix78'],['test-alle','testall']]){
   const html=read('original/spiele/einmaleins-'+name+'.html');
   assert.match(html,new RegExp('data-mode="'+mode+'"'));
   assert.match(html,/einmaleins\.js\?v=3/);
   assert.match(nav,new RegExp('einmaleins-'+name+'.html'));
 }
});
test('archived solmisation and rhythm remains accessible and all catalogue items retained',()=>{
 assert.match(nav,/name:'Solmisation und Rhythmus',icon:'🎼',archived:true/);
 assert.match(nav,/Themen-Archiv/);
 assert.match(nav,/archive\.map\(topicCard\)/);
 assert.match(nav,/data-archive-toggle/);
 assert.match(nav,/window\.LernSafariTopicCatalog/);
 assert.match(nav,/entry\[1\]\.startsWith\('einmaleins-'\)/);
});
test('7er and 8er show accurate alternative 5er/10er strategies',()=>{
 for(const [mode,five,ten] of [['seven',2,-3],['eight',3,-2]]){
   const {get,listeners}=launch(mode);
   assert.match(get('intro').innerHTML,/Von der 5er-Reihe/);
   assert.match(get('intro').innerHTML,/Von der 10er-Reihe/);
   assert.match(get('intro').innerHTML,new RegExp('5 × [0-9]+'));
   assert.match(get('intro').innerHTML,new RegExp(Math.abs(five)+' × [0-9]+'));
   listeners.click({target:{closest(){return {dataset:{bridge:'1'}}}}});
   assert.match(get('intro').innerHTML,/10 ×/);
   assert.match(get('intro').innerHTML,new RegExp(Math.abs(ten)+' × [0-9]+'));
   get('start').on_click();
   assert.match(get('question').innerHTML,/<input id="answer"/);
   assert.match(get('question-count').textContent,/von 12/);
   get('tip-toggle').onclick();
   assert.match(get('tip-content').innerHTML,/10 ×/);
 }
});
test('27-question overall test contains exactly 3 questions from every 2–10 row and never stops after mistakes',()=>{
 const {get}=launch('testall');get('start').on_click();
 const rows={};let count=0;
 for(let i=0;i<27;i++){
   assert.match(get('question-count').textContent,new RegExp('Aufgabe '+(i+1)+' von 27'));
   const m=get('question').innerHTML.match(/<span>(\d+)<\/span><span>×<\/span><span>(\d+)<\/span>/);
   assert.ok(m);const row=Number(m[1]);rows[row]=(rows[row]||0)+1;
   get('answer').value='999';get('check').onclick();count++;
   if(i<26){get('next').onclick();assert.equal(get('finish').classList.contains('hidden'),true);}
 }
 get('next').onclick();assert.equal(get('finish').classList.contains('hidden'),false);
 assert.equal(count,27);
 assert.deepEqual(Object.keys(rows).map(Number).sort((a,b)=>a-b),[2,3,4,5,6,7,8,9,10]);
 assert.ok(Object.values(rows).every(x=>x===3));
 assert.match(get('finish').innerHTML,/0 von 27/);
 assert.match(get('finish').innerHTML,/0 % richtig/);
});
