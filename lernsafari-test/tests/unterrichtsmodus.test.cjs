const assert=require('node:assert/strict');
const {makeState}=require('../unterrichtsmodus.js');
const catalog={Mathe:[{file:'einmaleins-dreier.html',title:'3er'}],Musik:[{file:'rhythmus-trio.html',title:'Rhythmus'}],Allgemein:[{file:'schach-computer.html',title:'Schach'}]};
const plan={blocks:['andere-spiele','schach','tiere'],assignments:[
{id:1,kind:'pflicht',target:'game:einmaleins-dreier'},
{id:2,kind:'pflicht',target:'number:word'},
{id:3,kind:'zusatz',target:'game:rhythmus-trio'}],done:[]};
const restricted=makeState(plan,catalog);
assert.equal(restricted.restricted,true);
assert.equal(restricted.pending.length,2);
assert.equal(restricted.allowDestination('lagoon'),true);
assert.equal(restricted.allowDestination('valley'),true);
assert.equal(restricted.allowDestination('oasis'),false);
assert.equal(restricted.allowDestination('baobab'),false);
assert.equal(restricted.allowDestination('camp'),true);
assert.equal(restricted.allowSubject('math'),true);
assert.equal(restricted.allowSubject('music'),true,'assigned extra may be visited from to-do');
assert.equal(restricted.allowSubject('nmg'),false);
assert.equal(restricted.allowGame('einmaleins-dreier'),true);
assert.equal(restricted.allowGame('schach-computer'),false);
assert.equal(restricted.allowTarget('number:word'),true);
assert.equal(restricted.allowTarget('number:line'),false);
assert.equal(makeState({...plan,done:[1]},catalog).restricted,true);
assert.equal(makeState({...plan,done:[1,2]},catalog).restricted,false,'old completed tasks remain done');
assert.equal(makeState({...plan,done:[1,2],assignments:[...plan.assignments,{id:4,kind:'pflicht',target:'game:rhythmus-trio'}]},catalog).restricted,true,'new assignment re-locks');
assert.equal(makeState({...plan,blocks:[]},catalog).restricted,false,'no focus mode means no lock');
assert.equal(makeState({blocks:['andere-spiele'],assignments:[],done:[]},catalog).restricted,false,'legacy focus without tasks cannot establish a to-do duty');
console.log('PASS: LernSafari focus compatibility checks');
