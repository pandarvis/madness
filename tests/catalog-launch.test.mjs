import test from 'node:test'
import assert from 'node:assert/strict'
import {catalogFixture,catalogSnapshot,cmd} from './helpers/catalog-launch-fixture.mjs'
import {isCatalogLaunchCommand,isCatalogLaunchState,isCatalogLaunchRecord,isCatalogPreparation,catalogUnavailable} from '../src/contracts/bmad-catalog-launch.ts'
import {isDialogueCommand} from '../src/contracts/dialogue.ts'
import {BmadCatalogLaunchStore} from '../src/adapters/persistence/bmad-catalog-launch-store.ts'
import {mkdtemp,rm,writeFile,readFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
test('K2 strict references reject renderer invocation, paths, mode escalation and unrelated commands',()=>{
 const c=cmd('prepare',{projectId:'project-a',itemId:'bmad',revision:'a'.repeat(64),mode:'read-only'})
 assert.ok(isCatalogLaunchCommand(c));for(const extra of [{invocation:'$evil'},{rootPath:'C:/evil'},{inputs:{}},{mode:'all'}])assert.equal(isCatalogLaunchCommand({...c,...extra}),false)
 assert.ok(isDialogueCommand(cmd('launch-catalog',{projectId:'project-a',preparationId:'catalog-1'})))
 assert.equal(isDialogueCommand(cmd('launch-catalog',{projectId:'project-a',preparationId:'catalog-1',invocation:'$evil'})),false)
})
for(const family of ['mary','forge','help'])test('K1 K4 K5 '+family+' uses the single dialogue, never sends draft and correlates ACK (synthetic port)',async()=>{
 const f=await catalogFixture({family});try{
  const p=(await f.prepare()).preparation;assert.ok(p);assert.ok(isCatalogPreparation(p));assert.ok(isCatalogLaunchState(f.launch.read()));assert.equal(f.counts().opens,0);assert.equal(f.counts().turns,0)
  await f.app.execute(cmd('save-draft',{projectId:'id-1',text:'Never send this free draft'}));await f.send()
  assert.equal(f.dialogue.read().status,'ready');assert.equal(f.counts().opens,1);assert.equal(f.counts().turns,1);assert.equal(f.calls.find(c=>c.operation==='turn').input,null)
  const record=f.launch.read().records[0],conversation=f.snapshot().conversations[0];assert.ok(isCatalogLaunchRecord(record));assert.equal(record.context.conversationId,conversation.id);assert.equal(record.requestId,'catalog-launch-test');assert.equal(record.transmission,'sent');assert.equal(record.storage,'stored');assert.equal(record.turnId,f.dialogue.read().turn.id);assert.equal(conversation.messages[0].text,p.firstInput)
  assert.equal(f.snapshot().drafts[0].text,'Never send this free draft');assert.equal(p.snapshot.items[0].launchable,false)
 }finally{await f.shutdown()}
})
test('K2 winners, masked sources, unknown versions and unsupported family remain documentary',async()=>{
 for(const change of [s=>s.diagnostic='unknown',s=>{s.items[0].copyable=false;s.items[0].invocation=null;s.items[0].copyReasons=['masked']},s=>{s.items[0].id=s.items[0].name='bmad-review';s.items[0].invocation='$bmad-review'}]){
  const f=await catalogFixture();try{const s=catalogSnapshot('id-1');change(s);assert.ok(catalogUnavailable(s,s.items[0].id));f.setValue(s);await f.catalog.execute(cmd('collect',{projectId:'id-1'}));await f.prepare();assert.equal(f.launch.read().preparation,null);assert.equal(f.counts().opens,0);assert.equal(f.counts().qualifications,0)}finally{await f.shutdown()}
 }
 const f=await catalogFixture({foreignSource:true});try{await f.prepare();assert.equal(f.launch.read().preparation,null);assert.match(f.launch.read().error,/source gagnante/);assert.equal(f.counts().opens,0)}finally{await f.shutdown()}
})
for(const mutation of ['mutateProfile','mutateContext','mutateSelection','mutateConnection','stale','invalidate'])test('K3 rejects changed '+mutation+' before open',async()=>{
 const f=await catalogFixture();try{const p=(await f.prepare()).preparation;assert.ok(p);f[mutation]();await f.send(p.id);assert.equal(f.counts().opens,0);assert.equal(f.counts().turns,0);assert.equal(f.snapshot().conversations.length,0);assert.ok(f.dialogue.read().errorCode)}finally{await f.shutdown()}
})
test('K3 mutation inside open closes owned session before persistence and turn',async()=>{
 let f;f=await catalogFixture({open:async()=>f.mutateContext()});try{await f.prepare();await f.send();assert.equal(f.counts().opens,1);assert.equal(f.counts().stops,1);assert.equal(f.counts().turns,0);assert.equal(f.snapshot().conversations.length,0)}finally{await f.shutdown()}
})
test('K3 mutation during conversation save preserves capture and refuses first native turn',async()=>{
 let f;f=await catalogFixture({snapshotWrite:async s=>{if(s.conversations.length)f.mutateContext()}});try{await f.prepare();await f.send();assert.equal(f.counts().turns,0);assert.equal(f.snapshot().conversations.length,1);assert.equal(f.snapshot().conversations[0].messages.length,0)}finally{await f.shutdown()}
})
test('K4 unsupported file mode on Forge is refused without open',async()=>{const f=await catalogFixture({family:'forge'});try{await f.prepare('file-approval');assert.equal(f.launch.read().preparation,null);assert.equal(f.counts().opens,0)}finally{await f.shutdown()}})
test('K6 duplicate launch consumes one preparation and retains global unknown stop',async()=>{
 const f=await catalogFixture();try{const p=(await f.prepare()).preparation;const replies=await Promise.all([1,2].map(()=>f.dialogue.execute(cmd('launch-catalog',{projectId:'id-1',preparationId:p.id}))));await f.dialogue.settled();assert.equal(f.counts().opens,1);assert.ok(replies.some(r=>r.errorCode==='BUSY'));await f.dialogue.execute(cmd('stop'));await f.dialogue.settled();await f.send(p.id);assert.equal(f.counts().opens,1)}finally{await f.shutdown()}
 const g=await catalogFixture({unknownStop:true});try{await g.prepare();await g.send();assert.equal(g.dialogue.read().errorCode,'STOP_UNCONFIRMED');assert.equal(g.counts().opens,0)}finally{await g.shutdown()}
})
test('K5 K6 disk refusal before turn cannot send; ACK-save failure preserves known transmission and retry does not replay',async()=>{
 for(const at of ['none','sent']){
  let reject=true;const f=await catalogFixture({recordWrite:async r=>{if(reject&&r.transmission===at)throw Error('DISK_REFUSED')}});try{await f.prepare();await f.send();const r=f.launch.read().records[0];assert.equal(f.counts().turns,at==='sent'?1:0);assert.equal(r.transmission,at==='sent'?'sent':'unknown');if(at==='sent')assert.equal(r.storage,'failed');reject=false;await f.launch.execute(cmd('retry-save',{conversationId:r.conversationId}));assert.equal(f.launch.read().records[0].storage,'stored');assert.equal(f.counts().turns,at==='sent'?1:0)}finally{await f.shutdown()}
 }
})
test('K5 wrong ACK cannot attach to another request or conversation',async()=>{
 const f=await catalogFixture();try{await f.prepare();await f.send();const r=f.launch.read().records[0];await assert.rejects(f.launch.acknowledge(r.conversationId,'unrelated','turn-x'),{code:'CONTEXT_MISMATCH'});assert.equal(f.launch.read().records[0].requestId,'catalog-launch-test')}finally{await f.shutdown()}
})
test('K7 cancellation is passive and does not turn a restored origin into a preparation',async()=>{
 const f=await catalogFixture();try{const p=(await f.prepare()).preparation;await f.launch.execute(cmd('cancel',{preparationId:p.id}));await f.send(p.id);assert.equal(f.counts().opens,0);assert.equal(f.launch.read().preparation,null)}finally{await f.shutdown()}
 const g=await catalogFixture();let record;try{await g.prepare();await g.send();record=g.launch.read().records[0]}finally{await g.shutdown()}
 const h=await catalogFixture({restore:[record]});try{await h.launch.execute(cmd('read'));assert.equal(h.launch.read().preparation,null);assert.equal(h.launch.read().records[0].transmission,'sent');assert.equal(h.counts().qualifications,0);assert.equal(h.counts().opens,0)}finally{await h.shutdown()}
})
test('K7 versioned origin annex is atomic, absent-compatible and preserves corrupt/foreign bytes',async()=>{
 const f=await catalogFixture();let r;try{await f.prepare();await f.send();r=f.launch.read().records[0]}finally{await f.shutdown()}
 const root=await mkdtemp(join(tmpdir(),'mcatalog-origin-'));try{const store=new BmadCatalogLaunchStore(root);assert.deepEqual(await store.read(),[]);await store.write(r);assert.deepEqual(await new BmadCatalogLaunchStore(root).read(),[r]);const path=join(root,r.conversationId+'.json');await writeFile(path,'{"schemaVersion":999}');const before=await readFile(path);await assert.rejects(store.write(r));assert.deepEqual(await readFile(path),before);await assert.rejects(new BmadCatalogLaunchStore(root).read())}finally{await rm(root,{recursive:true,force:true})}
})

test('K6 shared ActivityAdmission refuses graph, collection and connection throughout local qualification awaits',async()=>{
 const {ActivityAdmission}=await import('../src/core/lifecycle.ts'),{withCatalogQualification}=await import('../src/core/bmad-catalog-launch.ts')
 for(const family of ['mary','forge']){
  const admission=new ActivityAdmission();let releaseGuard,releaseNative
  const work=withCatalogQualification(admission,()=>new Promise(r=>releaseGuard=r),()=>new Promise(r=>releaseNative=r))
  for(const kind of ['helper','provider'])assert.throws(()=>admission.enter(kind),{code:kind==='helper'?'BUSY':'CONNECTION_BUSY'})
  releaseGuard();while(!releaseNative)await new Promise(r=>setImmediate(r))
  for(const kind of ['helper','provider'])assert.throws(()=>admission.enter(kind))
  releaseNative(family);assert.equal(await work,family);assert.equal(admission.activity,'clear')
  await assert.rejects(withCatalogQualification(admission,async()=>{throw Error('REFUSED')},async()=>{}));assert.equal(admission.activity,'clear')
 }
})
test('K3 selection mutation while native preparation awaits is refused before publication',async()=>{
 let release;const f=await catalogFixture({qualify:async n=>{if(n===1)await new Promise(r=>release=r)}})
 try{const work=f.prepare();while(!release)await new Promise(r=>setImmediate(r));f.mutateSelection();release();await work;assert.equal(f.launch.read().preparation,null);assert.equal(f.counts().opens,0)}finally{await f.shutdown()}
})

test('K3 source replacement after qualifier refuses publication without any provenance reread',async()=>{
 let f;f=await catalogFixture({qualify:async()=>{f.stale()}});try{await f.prepare();assert.equal(f.launch.read().preparation,null);assert.equal(f.counts().opens,0);assert.equal(f.calls.filter(c=>c.operation==='qualify').length,1)}finally{await f.shutdown()}
})
test('K4 K5 catalogue Mary file mode preserves opt-in; read-only rejects an unexpected approval without weakening origin',async()=>{
 const f=await catalogFixture();try{const p=(await f.prepare('file-approval')).preparation;assert.equal(p.mode,'file-approval');await f.send();assert.equal(f.calls.find(c=>c.operation==='open').profile.mode,'file-approval');assert.equal(f.launch.read().records[0].preparation.mode,'file-approval')}finally{await f.shutdown()}
 const g=await catalogFixture({turn:async({onApproval})=>onApproval({files:[],identity:{kind:'unknown'},expiresAt:Date.now()+10000},{invalidated:new Promise(()=>{}),result:new Promise(()=>{}),decide:async()=>{throw Error('Must not approve')}})});try{await g.prepare();await g.send();assert.equal(g.dialogue.read().errorCode,'UNSUPPORTED_INTERACTION');assert.equal(g.launch.read().records[0].transmission,'sent');assert.equal(g.dialogue.read().approvals.length,0)}finally{await g.shutdown()}
})
test('K5 catalogue question uses the existing exact turn/context and explicit answer owner',async()=>{
 let ready,release;const offered=new Promise(r=>ready=r),answered=new Promise(r=>release=r),answers=[]
 const f=await catalogFixture({turn:async({onQuestion})=>{await onQuestion({id:'synthetic-native-question',fields:[{id:'choice',header:'Direction',prompt:'Quel objectif ?',options:[],allowOther:true}],identity:{kind:'unknown'},expiresAt:null},{invalidated:new Promise(()=>{}),answer:async values=>{answers.push(values);release()}});ready();await answered}})
 try{const p=(await f.prepare()).preparation;await f.dialogue.execute(cmd('launch-catalog',{projectId:p.projectId,preparationId:p.id}));await offered;const q=f.dialogue.read().questions[0],r=f.launch.read().records[0];assert.deepEqual(q.context,r.context);assert.equal(q.requestId,r.requestId);assert.equal(q.turnId,r.turnId);assert.deepEqual(answers,[]);await f.dialogue.execute(cmd('answer-question',{questionId:q.id,values:{choice:'But explicite'}}));await f.dialogue.settled();assert.deepEqual(answers,[{choice:'But explicite'}]);assert.equal(f.dialogue.read().questions[0].status,'sent');assert.equal(f.launch.read().records[0].transmission,'sent')}finally{await f.shutdown()}
})

test('K3 K5 foreign connection receipt cannot persist a conversation under the prepared identity',async()=>{
 const f=await catalogFixture({foreignConnection:true});try{await f.prepare();await f.send();assert.equal(f.dialogue.read().errorCode,'PROFILE_CHANGED');assert.equal(f.counts().opens,1);assert.equal(f.counts().stops,1);assert.equal(f.counts().turns,0);assert.equal(f.snapshot().conversations.length,0)}finally{await f.shutdown()}
})

for(const stopOutcome of ['stopped','unknown'])test('native stop precedes a suspended secondary catalogue write: '+stopOutcome,async()=>{
 let pending=false,release
 const f=await catalogFixture({stopOutcome,beforeAck:async()=>{throw Object.assign(Error('native refusal before ACK'),{code:'PROVIDER_FAILED'})},recordWrite:async r=>{if(r.transmission==='unknown'){pending=true;await new Promise(resolve=>release=resolve)}}})
 try{
  const p=(await f.prepare()).preparation;await f.dialogue.execute(cmd('launch-catalog',{projectId:p.projectId,preparationId:p.id}));while(!pending)await new Promise(r=>setImmediate(r))
  assert.equal(f.counts().stops,1);assert.equal(f.dialogue.read().status,stopOutcome==='unknown'?'unknown':'error');assert.equal(f.dialogue.read().errorCode,stopOutcome==='unknown'?'STOP_UNCONFIRMED':'PROVIDER_FAILED');assert.equal(f.launch.read().records[0].storage,'pending')
  let settled=false;const draining=f.dialogue.settled().then(()=>settled=true);await new Promise(r=>setImmediate(r));assert.equal(settled,false);release();await draining;assert.equal(f.launch.read().records[0].transmission,'unknown');assert.equal(f.launch.read().records[0].storage,'stored');assert.equal(f.counts().stops,1)
 }finally{if(release)release();await f.shutdown()}
})
