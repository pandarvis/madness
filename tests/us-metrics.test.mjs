import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
const metrics=await import('../src/core/us-metrics.ts').catch(()=>null)
const persistence=await import('../src/adapters/persistence/us-metrics-store.ts').catch(()=>null)
const contracts=await import('../src/contracts/us-metrics.ts').catch(()=>null)
const context={projectId:'p',initiativeId:'alpha',conversationId:'c',providerId:'codex',connectionId:'account'}
const receipt=(phase,at,overrides={})=>({schemaVersion:1,payloadDigest:'a'.repeat(64),runId:'run',sessionId:'session',threadId:'thread',nativeTurnId:'native',domain:'clock',phase,at,outcome:phase==='ack'?null:'completed',...overrides})
const turn=(id,receipts,story=null)=>({id,context,requestId:'request-1',localTurnId:id,story,receipts})
test('T4/T7 known duration is ACK to terminal, including a real zero and failed result',()=>{
 assert.ok(metrics,'metrics product module exists')
 for(const [start,end,outcome,want] of [[1000,601000,'completed',600000],[7,7,'failed',0],[1000,601000,'interrupted',600000]]){
  const result=metrics.summarizeTurns([turn('local',[receipt('ack',start),receipt('terminal',end,{outcome})])])
  assert.equal(result.knownMs,want);assert.equal(result.known,1);assert.equal(result.unknown,0)
 }
})
test('T5/T6 invalid, missing and conflicting intervals never pick the first receipt',()=>{
 assert.ok(metrics)
 for(const receipts of [[receipt('ack',5)],[receipt('terminal',6)],[receipt('ack',7),receipt('terminal',6)],[receipt('ack',5),receipt('terminal',6,{domain:'other'})],[receipt('ack',5),receipt('terminal',6),receipt('terminal',7)]])assert.equal(metrics.summarizeTurns([turn('x',receipts)]).knownMs,null)
 const a=turn('a',[receipt('ack',1000),receipt('terminal',601000)]),b=turn('b',a.receipts)
 assert.equal(metrics.summarizeTurns([a,b]).knownMs,600000)
 assert.deepEqual(metrics.summarizeTurns([a,b]),metrics.summarizeTurns([b,a]))
})
test('T6/T7 contradictory attribution is unassigned and parallel totals keep coverage',()=>{
 assert.ok(metrics)
 const a=turn('a',[receipt('ack',1000),receipt('terminal',601000)],{id:'US1'}),b=turn('b',[receipt('ack',1000),receipt('terminal',601000)],{id:'US2'})
 const normalized=metrics.normalizeTurns([a,b]);assert.equal(normalized.length,1);assert.equal(normalized[0].story,null);assert.ok(normalized[0].conflicts.includes('attribution'))
 const parallel=turn('c',[receipt('ack',1000,{nativeTurnId:'other'}),receipt('terminal',601000,{nativeTurnId:'other'})])
 assert.equal(metrics.summarizeTurns([a,parallel]).knownMs,1200000);assert.equal(metrics.summarizeTurns([a,parallel]).overlap,'known')
 const partial=metrics.summarizeTurns([a,turn('unknown',[]),turn('unknown2',[])])
 assert.deepEqual([partial.knownMs,partial.known,partial.unknown,partial.coverage],[600000,1,2,'partial'])
 assert.equal(metrics.summarizeTurns([]).knownMs,null)
})
test('T8/T9 true metrics file round trip, independent writer CAS and future data preserved',async()=>{
 assert.ok(persistence)
 const root=await mkdtemp(join(tmpdir(),'madness-metrics-'))
 try{
  const store=new persistence.UsMetricsStore(root),other=new persistence.UsMetricsStore(root)
  assert.equal(await store.read('p'),null);await other.read('p')
  const archive={schemaVersion:1,projectId:'p',revision:1,occurrences:[],turns:[turn('local',[])]}
  await store.write(archive);assert.deepEqual(await new persistence.UsMetricsStore(root).read('p'),archive)
  await assert.rejects(other.write({...archive,revision:2}),{code:'OUTPUT_CONFLICT'})
  const path=join(root,'p.json');await writeFile(path,'{"schemaVersion":99}')
  await assert.rejects(store.write({...archive,revision:3}));assert.equal(await readFile(path,'utf8'),'{"schemaVersion":99}')
 }finally{await rm(root,{recursive:true,force:true})}
})
test('T10 strict commands reject paths, clocks and types as renderer authority',()=>{
 assert.ok(contracts)
 const cmd={contractVersion:1,correlationId:'request-1',type:'read',projectId:'p'}
 assert.equal(contracts.isUsMetricsCommand(cmd),true)
 for(const patch of [{path:'C:/fake'},{type:'receipt',at:0},{storyType:'story'},{contractVersion:2}])assert.equal(contracts.isUsMetricsCommand({...cmd,...patch}),false)
})
import {runHelpSourcesCase} from './helpers/help-native.mjs'
test('T1 private source proof preserves public v1 and includes entry and leaf type physical identity',async()=>{
 const result=await runHelpSourcesCase(String.raw`import json,sys
from pathlib import Path
import worker,capture,progress
root=capture.long_path(sys.argv[1]);project=root/'project';skills=project/'.agents/skills';(skills/'bmod-test').mkdir(parents=True);(project/'_bmad').mkdir()
(skills/'bmod-test/bmod.toml').write_text('[bmod]\ncode="test"\nversion="6.13.0-next"\n',encoding='utf-8')
(project/'_bmad/config.toml').write_text('[core]\nactive_initiative="alpha"\n',encoding='utf-8')
initiative=project/'_bmad-output/alpha';tickets=initiative/'tickets';tickets.mkdir(parents=True)
(initiative/'alpha.md').write_text('# alpha\n',encoding='utf-8')
(tickets/'tickets.toml').write_text('[[entry]]\nid=1\ntype="story"\ntitle="No leaf"\n[[entry]]\nid=2\ntype="spike"\n',encoding='utf-8')
(tickets/'story.md').write_text('---\ntype: story\nid: 3\n---\n',encoding='utf-8')
folder=root/'snapshot';folder.mkdir();req={'project':str(project),'roots':[str(skills)],'folder':str(folder)};context=worker.context_observation(req);req.update(initiativeId='alpha',rootIdentity=context['rootIdentity'],contextRevision=context['revision']);value=progress.collect(req,context)
assert '_storyEvidence' in value,'private story proof missing'
e=value.pop('_storyEvidence');assert e['schemaVersion']==1 and e['revision']==value['revision']
rows=e['rows'];assert any(r['ticketId']=='1' and r['type']=='story' and r['typeLine']==3 and r['identity'] for r in rows)
assert any(r['ticketId']=='2' and r['type']=='spike' for r in rows)
assert any(r['ticketId']=='3' and r['kind']=='leaf' and r['typeLine']==2 for r in rows)
assert all(d['field']!='type' for d in value['declarations'])
print(json.dumps({'count':4,'native':False,'proofRows':len(rows)}))`)
 assert.equal(result.value.count,4)
})

function storyFixture({revision='a',title='Story',identity='physical-entry',coverage='complete',rows=true,type='story'}={}){
 const snapshot={schemaVersion:1,projectId:'p',rootPath:'C:/project',rootIdentity:'physical-root',initiativeId:'alpha',initiativePath:'C:/project/_bmad-output/alpha',contextRevision:'c'.repeat(64),revision:revision.repeat(64),coverage,sources:rows?[{id:'source-entry',path:'C:/project/_bmad-output/alpha/tickets/tickets.toml',sha256:'d'.repeat(64),bytes:42,kind:'entry'}]:[],declarations:rows?[{sourceId:'source-entry',container:'.',ticketId:'1',title,field:'existence',value:'entry',line:1}]:[],excerpts:[],problems:[]}
 const authority={evidence:{schemaVersion:1,revision:snapshot.revision,rows:rows?[{sourceId:'source-entry',container:'.',ticketId:'1',kind:'entry',type,line:1,typeLine:3,identity}]:[]},verify:async()=>{}}
 return {snapshot,authority}
}
async function coordinatorTest(run){const root=await mkdtemp(join(tmpdir(),'madness-metrics-core-'));try{const coordinator=new metrics.UsMetricsCoordinator({store:new persistence.UsMetricsStore(root)});await run(coordinator,root);await coordinator.shutdown()}finally{await rm(root,{recursive:true,force:true})}}
test('T1/T2 no-leaf story continuity, absent return, partial coverage and duplicate refusal',async()=>{
 await coordinatorTest(async c=>{
  let f=storyFixture();await c.accept(f.snapshot,undefined);assert.equal(c.read().projects[0].archive.occurrences.length,0)
  await c.accept(f.snapshot,f.authority);let original=c.read().projects[0].archive.occurrences[0];assert.ok(original)
  f=storyFixture({revision:'b',title:'Renamed'});await c.accept(f.snapshot,f.authority);assert.equal(c.read().projects[0].archive.occurrences.at(-1).id,original.id)
  f=storyFixture({rows:false,coverage:'partial'});await c.accept(f.snapshot,f.authority);assert.equal(c.read().projects[0].archive.occurrences[0].active,true)
  f=storyFixture({rows:false});await c.accept(f.snapshot,f.authority);assert.equal(c.read().projects[0].archive.occurrences[0].active,false)
  f=storyFixture();await c.accept(f.snapshot,f.authority);assert.notEqual(c.read().projects[0].archive.occurrences.at(-1).id,original.id)
  f.authority.evidence.rows.push({...f.authority.evidence.rows[0]});await c.accept(f.snapshot,f.authority);assert.equal(c.read().projects[0].archive.occurrences.filter(o=>o.active).length,0)
 })
})
test('T3 explicit choice consumed once, correlated to exact text, no next-turn inheritance, passive restore',async()=>{
 await coordinatorTest(async(c,root)=>{
  const f=storyFixture();await c.accept(f.snapshot,f.authority);const story=c.read().projects[0].archive.occurrences[0]
  const chosen=await c.execute({contractVersion:1,correlationId:'choose-01',type:'choose',projectId:'p',conversationId:'c',requestId:'request-1',storyRef:story.id,text:'Exact',operation:{type:'send'}})
  const instrument=await c.capture(context,'request-1','local-1','Exact',chosen.choiceRef)
  instrument.receive(receipt('ack',1000));instrument.receive(receipt('terminal',601000))
  await assert.rejects(c.capture(context,'request-1','local-2','Exact',chosen.choiceRef),{code:'CONTEXT_MISMATCH'})
  await c.capture(context,'request-2','local-3','Other');await c.settled()
  const turns=c.read().projects[0].archive.turns;assert.equal(turns[0].story.id,story.id);assert.equal(turns[1].story,null)
  const reopened=new metrics.UsMetricsCoordinator({store:new persistence.UsMetricsStore(root)});await reopened.execute({contractVersion:1,correlationId:'reopen-01',type:'read',projectId:'p'});assert.deepEqual(reopened.read().projects[0].archive,c.read().projects[0].archive);await reopened.shutdown()
 })
})
test('T6 same occurrence remains attributed across a title/proof revision change',()=>{
 const f=storyFixture(),story={id:'us-same',title:'Original',proofRevision:'a'.repeat(64)},a=turn('a',[receipt('ack',1),receipt('terminal',10)],story),b=turn('b',a.receipts,{...story,title:'Renamed',proofRevision:'b'.repeat(64)})
 const result=metrics.normalizeTurns([a,b]);assert.equal(result[0].story.id,'us-same');assert.equal(result[0].conflicts.includes('attribution'),false)
})
test('T8 legacy dialogue remains admissible with an unreadable metrics annex and preserves it',async()=>{
 const root=await mkdtemp(join(tmpdir(),'madness-metrics-unreadable-'));try{await writeFile(join(root,'p.json'),'{"schemaVersion":99}')
 const c=new metrics.UsMetricsCoordinator({store:new persistence.UsMetricsStore(root)}),instrument=await c.capture(context,'request-1','local-1','Legacy')
 instrument.receive(receipt('ack',1));instrument.receive(receipt('terminal',10));await c.settled();assert.equal(c.read().projects[0].storage,'unreadable');assert.equal(await readFile(join(root,'p.json'),'utf8'),'{"schemaVersion":99}');await c.shutdown()
 }finally{await rm(root,{recursive:true,force:true})}
})
import {Application} from '../src/core/application.ts'
import {DialogueCoordinator} from '../src/core/dialogue.ts'
import {emptySnapshot} from '../src/contracts/index.ts'
test('T3/T4/T8/T9 product dialogue writes independent durable receipts, reopens passively and legacy stays unassigned',async()=>{
 const root=await mkdtemp(join(tmpdir(),'madness-metrics-product-'));try{
 let snapshot=emptySnapshot(),counter=0,native=0
 const app=new Application({store:{read:async()=>snapshot,write:async v=>{snapshot=structuredClone(v)}},newId:()=> 'id-'+ ++counter,now:()=>new Date().toISOString(),chooseDirectory:async()=>({rootPath:'C:/project',name:'Project'})})
 await app.execute({contractVersion:1,correlationId:'choose-directory',type:'choose-directory'})
 const c=new metrics.UsMetricsCoordinator({store:new persistence.UsMetricsStore(root)})
 const dialogue=new DialogueCoordinator({application:app,metrics:c,qualify:async()=>({rootPath:'C:/project',skillPath:'Mary',fingerprint:'a'.repeat(64)}),open:async()=>({context:{connectionId:'account',initiativeId:'alpha'},turn:async(_text,accepted,_observe,_question,_approval,instrumentation)=>{native++;await instrumentation?.assertFresh();instrumentation?.receive(receipt('ack',1000,{nativeTurnId:'native-'+native}));await accepted();instrumentation?.receive(receipt('terminal',601000,{nativeTurnId:'native-'+native}));return 'Response'},stop:async()=>'stopped'})})
 await dialogue.execute({contractVersion:1,correlationId:'launch-01',type:'launch',projectId:'id-1'});await dialogue.settled();assert.equal(dialogue.read().status,'ready')
 await dialogue.shutdown();const read=new persistence.UsMetricsStore(root),archive=await read.read('id-1');assert.equal(archive.turns.length,1);assert.equal(archive.turns[0].story,null);assert.equal(metrics.summarizeTurns(archive.turns).knownMs,600000);assert.equal(native,1)
 }finally{await rm(root,{recursive:true,force:true})}
})
test('T8 a failed metrics write keeps RAM, retry only saves and old writes cannot promote new bounds',async()=>{
 let stored=null,fail=true,release,started;const held=new Promise(r=>release=r),writing=new Promise(r=>started=r)
 const store={read:async()=>null,write:async value=>{started();await held;if(fail)throw Error('disk');stored=structuredClone(value)}}
 const c=new metrics.UsMetricsCoordinator({store}),instrument=await c.capture(context,'request-1','local-1','text');await writing
 instrument.receive(receipt('ack',1000));instrument.receive(receipt('terminal',601000));assert.equal(c.read().projects[0].durableRevision,0)
 release();await c.settled();assert.equal(c.read().projects[0].storage,'failed');assert.equal(metrics.summarizeTurns(c.read().projects[0].archive.turns).knownMs,600000);assert.equal(stored,null)
 fail=false;await c.execute({contractVersion:1,correlationId:'retry-01',type:'retry-save',projectId:'p'});assert.equal(c.read().projects[0].storage,'stored');assert.equal(metrics.summarizeTurns(stored.turns).knownMs,600000);await c.shutdown()
})
test('T3 a choice for one launch operation cannot authorize a different native invocation',async()=>{
 await coordinatorTest(async c=>{const f=storyFixture();await c.accept(f.snapshot,f.authority);const story=c.read().projects[0].archive.occurrences[0]
 const chosen=await c.execute({contractVersion:1,correlationId:'choose-01',type:'choose',projectId:'p',conversationId:null,requestId:'request-1',storyRef:story.id,text:null,operation:{type:'launch-help'}})
 assert.ok(chosen.choiceRef)
 await assert.rejects(c.capture(context,'request-1','local-1',null,chosen.choiceRef,{type:'launch-forge'}),{code:'CONTEXT_MISMATCH'})
 })
})
test('T3 removing a choice invalidates the old pending reference for the same exact request',async()=>{
 await coordinatorTest(async c=>{const f=storyFixture();await c.accept(f.snapshot,f.authority);const story=c.read().projects[0].archive.occurrences[0],choice={contractVersion:1,correlationId:'choose-01',type:'choose',projectId:'p',conversationId:'c',requestId:'request-1',storyRef:story.id,text:'Exact',operation:{type:'send'}}
 const old=await c.execute(choice);await c.execute({...choice,storyRef:null})
 await assert.rejects(c.capture(context,'request-1','local-1','Exact',old.choiceRef),{code:'CONTEXT_MISMATCH'})
 })
})
test('T7/T8 consumer projection exposes reasons, coverage and saved bounds separately',async()=>{
 await coordinatorTest(async c=>{const instrument=await c.capture(context,'request-1','local-1','Exact');instrument.receive(receipt('ack',1000));instrument.receive(receipt('terminal',601000));await c.settled()
 const p=c.read().projects[0];assert.equal(p.summary.knownMs,600000);assert.equal(p.observations[0].durationMs,600000);assert.equal(p.observations[0].durable,true);assert.equal(p.observations[0].reason,'known')
 })
})
test('T1/T2/T3/T7/T9 two projects, two initiatives and conversations retain separate sourced totals after reopen',async()=>{
 await coordinatorTest(async(c,root)=>{
  const expected=[]
  for(const [projectId,initiativeId,conversationId,ms] of [['p','alpha','c1',600000],['p','beta','c2',1200000],['q','alpha','c3',300000]]){
   const f=storyFixture();f.snapshot.projectId=projectId;f.snapshot.rootPath='C:/'+projectId;f.snapshot.rootIdentity='root-'+projectId;f.snapshot.initiativeId=initiativeId;f.snapshot.initiativePath='C:/'+projectId+'/'+initiativeId;f.snapshot.sources[0].path=f.snapshot.initiativePath+'/tickets/tickets.toml'
   await c.accept(f.snapshot,f.authority);const story=c.read().projects.find(p=>p.projectId===projectId).archive.occurrences.find(o=>o.initiativeId===initiativeId),ctx={...context,projectId,initiativeId,conversationId}
   const choice=await c.execute({contractVersion:1,correlationId:'choose-01',type:'choose',projectId,conversationId,requestId:'request-1',storyRef:story.id,text:'Exact',operation:{type:'send'}})
   const instrument=await c.capture(ctx,'request-1','local-1','Exact',choice.choiceRef);instrument.receive(receipt('ack',1000));instrument.receive(receipt('terminal',1000+ms));expected.push({projectId,storyId:story.id,ms})
  }
  await c.settled();for(const e of expected){const archive=await new persistence.UsMetricsStore(root).read(e.projectId);assert.equal(metrics.summarizeTurns(archive.turns,e.storyId).knownMs,e.ms)}
  assert.equal(c.read().projects.find(p=>p.projectId==='p').summary.knownMs,1800000)
 })
})
test('T7 domains and missing clocks report unknown overlap without erasing known individual durations',()=>{
 const a=turn('a',[receipt('ack',1000),receipt('terminal',601000)]),b=turn('b',[receipt('ack',1000,{domain:'other',nativeTurnId:'two'}),receipt('terminal',601000,{domain:'other',nativeTurnId:'two'})])
 const result=metrics.summarizeTurns([a,b]);assert.equal(result.knownMs,1200000);assert.equal(result.overlap,'unknown')
 for(const at of [NaN,Infinity,-1])assert.equal(metrics.summarizeTurns([turn('x',[receipt('ack',at),receipt('terminal',601000)])]).knownMs,null)
})
test('T8 metrics storage refuses hardlinked annexes without changing either name',async()=>{
 const {link}=await import('node:fs/promises'),root=await mkdtemp(join(tmpdir(),'madness-metrics-links-'));try{
 const outside=join(root,'sentinel');await writeFile(outside,'FOREIGN EXACT');await link(outside,join(root,'p.json'));await assert.rejects(new persistence.UsMetricsStore(root).read('p'),{code:'STORAGE_READ_FAILED'});assert.equal(await readFile(outside,'utf8'),'FOREIGN EXACT')
 }finally{await rm(root,{recursive:true,force:true})}
})
import {BmadProgressCoordinator} from '../src/core/bmad-progress.ts'
test('T1/T3 a slow metrics admission cannot republish invalidated progress as current',async()=>{
 const f=storyFixture(),date='2026-11-05T10:00:00.000Z';f.snapshot.observedAt=date;f.snapshot.sources[0].relativePath='tickets/tickets.toml';f.snapshot.sources[0].modifiedAt=date
 const observation={schemaVersion:1,projectId:'p',rootPath:f.snapshot.rootPath,rootIdentity:f.snapshot.rootIdentity,revision:f.snapshot.contextRevision,observedAt:date,status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:[{id:'alpha',name:'alpha',path:f.snapshot.initiativePath,source:f.snapshot.initiativePath+'/alpha.md',revision:'c'.repeat(64)}],sources:[],problems:[]}
 let current={projectId:'p',selection:{schemaVersion:1,projectId:'p',rootPath:f.snapshot.rootPath,rootIdentity:f.snapshot.rootIdentity,revision:1,initiativeId:'alpha'},observation},reads=0,release,entered,invalidated=false
 const held=new Promise(r=>release=r),waiting=new Promise(r=>entered=r),wrong=[]
 const c=new BmadProgressCoordinator({application:{dialogueProject:async()=>({id:'p',rootPath:f.snapshot.rootPath})},contexts:{read:()=>({projects:[current]})},collect:async()=>({...f.snapshot,revision:(++reads===1?'a':'b').repeat(64)}),metrics:{accept:async()=>{entered();await held}}})
 c.subscribe(s=>{const p=s.projects[0];if(invalidated&&p.status==='ready'&&p.freshness==='current'&&p.snapshot?.revision==='a'.repeat(64))wrong.push(p)})
 const work=c.execute({contractVersion:1,correlationId:'collect-01',type:'collect',projectId:'p'});await waiting;invalidated=true;current={...current,selection:{...current.selection,revision:2}};c.invalidate('p');release();await work;assert.equal(wrong.length,0);await c.shutdown()
})
import {DialogueRpc,startDialogueProtocol} from '../src/adapters/codex/dialogue.ts'
import {EventEmitter} from 'node:events'
import {PassThrough} from 'node:stream'
test('T3/T4/T6/T8/T9 local JSONL double goes through Application, explicit choice, atomic save and passive reopen',async()=>{
 const root=await mkdtemp(join(tmpdir(),'madness-metrics-rpc-product-'));try{
  let snapshot=emptySnapshot(),counter=0,turns=0,at=0,buffer='';const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough()
  const emit=v=>child.stdout.write(JSON.stringify(v)+'\n'),complete=()=>{at=601000;emit({method:'item/completed',params:{threadId:'thread',turnId:'native-'+turns,item:{id:'answer-'+turns,type:'agentMessage',text:'Local response'}}});const end={method:'turn/completed',params:{threadId:'thread',turn:{id:'native-'+turns,status:'completed'}}};emit(end);at=999999;emit(end)}
  child.stdin.on('data',b=>{buffer+=b;while(buffer.includes('\n')){const end=buffer.indexOf('\n'),m=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);const reply=result=>emit({id:m.id,result})
   if(m.method==='initialize')reply({});if(m.method==='model/list')reply({data:[{model:'test-model',isDefault:true,hidden:false}]});if(m.method==='thread/start')reply({thread:{id:'thread'},modelProvider:'openai_chatgpt_plan',model:'test-model',sandbox:{type:'readOnly'},approvalPolicy:'never'})
   if(m.method==='turn/start'){turns++;at=1000;reply({turn:{id:'native-'+turns,status:'inProgress'}});if(turns===1)for(const [id,kind] of [[100,'agent'],[101,'config']])emit({id,method:'item/tool/call',params:{threadId:'thread',turnId:'native-1',callId:'call-'+id,tool:'bmad_resolve',arguments:{kind}}});else complete()}
   if(m.id===101&&m.result)complete()
  }})
  const app=new Application({store:{read:async()=>snapshot,write:async s=>{snapshot=structuredClone(s)}},newId:()=> 'id-'+ ++counter,now:()=>new Date().toISOString(),chooseDirectory:async()=>({rootPath:'C:/project',name:'Project'})});await app.execute({contractVersion:1,correlationId:'choose-directory',type:'choose-directory'})
  const c=new metrics.UsMetricsCoordinator({store:new persistence.UsMetricsStore(root)}),rpc=new DialogueRpc(child,new AbortController().signal,1000,{clock:()=>at,domain:'clock',runId:'run',sessionId:'session'})
  const protocol=await startDialogueProtocol(rpc,{cwd:'C:/isolated',profile:{rootPath:'C:/project',skillPath:'Mary'},signal:new AbortController().signal,activity:()=>{},resolve:async kind=>JSON.stringify(kind==='agent'?{agent:{name:'Mary'}}:{}),read:async()=>''},1000)
  const d=new DialogueCoordinator({application:app,metrics:c,qualify:async()=>({rootPath:'C:/project',skillPath:'Mary',fingerprint:'a'.repeat(64)}),open:async()=>({context:{connectionId:'account',initiativeId:'alpha'},...protocol,stop:async()=>{rpc.dispose();return 'stopped'}})})
  await d.execute({contractVersion:1,correlationId:'launch-01',type:'launch',projectId:'id-1'});await d.settled();assert.equal(d.read().status,'ready')
  const f=storyFixture();f.snapshot.projectId='id-1';await c.accept(f.snapshot,f.authority);const story=c.read().projects[0].archive.occurrences[0],conversationId=d.read().context.conversationId
  const chosen=await c.execute({contractVersion:1,correlationId:'choose-01',type:'choose',projectId:'id-1',conversationId,requestId:'send-001',storyRef:story.id,text:'Exact',operation:{type:'send'}})
  await d.execute({contractVersion:1,correlationId:'send-001',type:'send',projectId:'id-1',conversationId,text:'Exact',metricsChoice:chosen.choiceRef});await d.settled();assert.equal(d.read().status,'ready');await d.shutdown()
  const archive=await new persistence.UsMetricsStore(root).read('id-1');assert.equal(archive.turns.length,2);assert.equal(metrics.summarizeTurns(archive.turns,story.id).knownMs,600000);assert.equal(metrics.summarizeTurns(archive.turns).knownMs,1200000);assert.equal(turns,2);assert.equal(archive.turns[0].story,null);assert.equal(archive.turns[1].context.conversationId,conversationId)
 }finally{await rm(root,{recursive:true,force:true})}
})
test('T2 physical replacement, move and replaced root create separate occurrences',async()=>{
 await coordinatorTest(async c=>{let f=storyFixture();await c.accept(f.snapshot,f.authority);let previous=c.read().projects[0].archive.occurrences.at(-1).id
 f=storyFixture({identity:'replacement'});await c.accept(f.snapshot,f.authority);let next=c.read().projects[0].archive.occurrences.at(-1).id;assert.notEqual(next,previous);previous=next
 f.snapshot.sources[0].path='C:/project/_bmad-output/alpha/moved/tickets.toml';await c.accept(f.snapshot,f.authority);next=c.read().projects[0].archive.occurrences.at(-1).id;assert.notEqual(next,previous);previous=next
 f.snapshot.rootIdentity='replaced-root';await c.accept(f.snapshot,f.authority);assert.notEqual(c.read().projects[0].archive.occurrences.at(-1).id,previous)
 })
})
test('T8 independent concurrent stores cannot both win the same prior-byte CAS',async()=>{
 const root=await mkdtemp(join(tmpdir(),'madness-metrics-concurrent-'));try{for(let attempt=0;attempt<8;attempt++){
  const id='p'+attempt,a=new persistence.UsMetricsStore(root),b=new persistence.UsMetricsStore(root);await Promise.all([a.read(id),b.read(id)])
  const body={schemaVersion:1,projectId:id,revision:1,occurrences:[],turns:[]};const results=await Promise.allSettled([a.write(body),b.write({...body,revision:2})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1)
 }}finally{await rm(root,{recursive:true,force:true})}
})
test('T8 a pre-existing foreign writer lease is preserved and no body is replaced',async()=>{
 const root=await mkdtemp(join(tmpdir(),'madness-metrics-stale-'));try{
  const store=new persistence.UsMetricsStore(root);await store.read('p');await writeFile(join(root,'p.json.lock'),'FOREIGN LEASE EXACT')
  await assert.rejects(store.write({schemaVersion:1,projectId:'p',revision:1,occurrences:[],turns:[]}),{code:'OUTPUT_CONFLICT'});assert.equal(await readFile(join(root,'p.json.lock'),'utf8'),'FOREIGN LEASE EXACT');await assert.rejects(readFile(join(root,'p.json')),{code:'ENOENT'})
 }finally{await rm(root,{recursive:true,force:true})}
})
test('T4/T5 terminal functional outcome stays completed after a later confirmed process close',async()=>{
 await coordinatorTest(async c=>{const instrument=await c.capture(context,'request-1','local-1','Exact');instrument.receive(receipt('ack',1000));instrument.receive(receipt('terminal',601000));instrument.receive(receipt('close',701000,{outcome:'interrupted'}))
 const observation=c.read().projects[0].observations[0];assert.deepEqual(observation.outcomes,['completed']);assert.equal(observation.durationMs,600000)
 })
})
