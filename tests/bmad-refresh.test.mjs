import test from 'node:test'
import assert from 'node:assert/strict'
import {BmadProgressCoordinator} from '../src/core/bmad-progress.ts'
const h=c=>c.repeat(64)
const command={contractVersion:1,correlationId:'refresh-test',type:'collect',projectId:'project-a'}
const tick=()=>new Promise(r=>setImmediate(r))
function fixture(extra={}) {
 let changed=()=>{},closed=0,release,reads=0,live=0,max=0,version=0
 const context={projectId:'project-a',status:'ready',storage:'stored',error:null,selection:{schemaVersion:1,projectId:'project-a',rootPath:'C:/project-a',rootIdentity:'root-a',revision:1,initiativeId:'alpha'},observation:{schemaVersion:1,projectId:'project-a',rootPath:'C:/project-a',rootIdentity:'root-a',revision:h('a'),observedAt:'2026-11-04T10:00:00Z',status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:[{id:'alpha',name:'alpha',path:'C:/project-a/output/alpha',source:'C:/project-a/output/alpha/alpha.md',revision:h('b')}],sources:[],problems:[]}}
 const snapshot=()=>({schemaVersion:1,projectId:'project-a',rootPath:'C:/project-a',rootIdentity:'root-a',initiativeId:'alpha',initiativePath:'C:/project-a/output/alpha',contextRevision:h('a'),revision:h(version?'d':'c'),observedAt:'2026-11-04T10:01:00Z',coverage:'complete',sources:[],declarations:[],excerpts:[],problems:[]})
 let hold=false
 const c=new BmadProgressCoordinator({application:{dialogueProject:async id=>({id,rootPath:'C:/project-a'})},contexts:{read:()=>({projects:[context]})},observation:{attach:async(_value,fn)=>{changed=fn;return {health:'watching',close:()=>closed++,reconcile:async()=>true}}},collect:async()=>{reads++;live++;max=Math.max(max,live);if(hold)await new Promise(r=>release=r);live--;return snapshot()},...extra})
 return {c,context,counts:()=>({reads,live,max,closed}),change:(health='watching')=>changed(health),hold:()=>hold=true,finish:()=>{hold=false;version++;release?.()},tick}
}
test('F1/F4 invalidation stays stale while reading and bursts have one trailing read',async()=>{
 const f=fixture();await f.c.execute(command);const original=f.c.read().projects[0].snapshot
 f.hold();f.change();assert.equal(f.c.read().projects[0].freshness,'stale');await tick();await tick()
 for(let i=0;i<100;i++)f.change()
 assert.equal(f.counts().live,1);assert.equal(f.c.read().projects[0].freshness,'stale');assert.equal(f.c.read().projects[0].queued,true)
 f.finish();await f.c.settled();assert.equal(f.counts().max,1);assert.equal(f.counts().reads,3);assert.notEqual(f.c.read().projects[0].snapshot.revision,original.revision);await f.c.shutdown()
})
test('F5/F8 degraded monitoring is uncertain, closing synchronously detaches, reopen is passive',async()=>{
 const f=fixture();await f.c.execute(command);f.change('unavailable');assert.equal(f.c.read().projects[0].freshness,'uncertain');assert.equal(f.c.read().projects[0].monitoring,'unavailable');const stop=f.c.shutdown();assert.ok(f.counts().closed>0);await stop;const reads=f.counts().reads;await f.c.execute(command);assert.equal(f.counts().reads,reads)
 const fresh=fixture();await fresh.c.execute({...command,type:'read'});assert.equal(fresh.counts().reads,0);await fresh.c.shutdown()
})
test('F3 root/selection changed after await cannot publish current',async()=>{
 const f=fixture();await f.c.execute(command);f.hold();const reading=f.c.execute(command);await tick();await tick();f.context.selection={...f.context.selection,revision:2,initiativeId:'beta'};f.finish();await reading;assert.equal(f.c.read().projects[0].freshness,'stale');assert.equal(f.c.read().projects[0].snapshot.initiativeId,'alpha');await f.c.shutdown()
})


test('F4 two projects serialize the complete local pipeline and release subscribers detach',async()=>{
 const {ActivityAdmission}=await import('../src/core/lifecycle.ts');const admission=new ActivityAdmission();let subscribers=0,active=0,max=0;const a=fixture(),b=fixture(),original=b.context;b.context.projectId='project-b';b.context.selection={...b.context.selection,projectId:'project-b',rootPath:'C:/project-b'};b.context.observation={...b.context.observation,projectId:'project-b',rootPath:'C:/project-b',initiatives:[{...b.context.observation.initiatives[0],path:'C:/project-b/output/alpha',source:'C:/project-b/output/alpha/alpha.md'}]}
 const contexts=[a.context,b.context],c=new BmadProgressCoordinator({available:fn=>{subscribers++;const off=admission.subscribeAvailable(fn);return()=>{subscribers--;off()}},application:{dialogueProject:async id=>({id,rootPath:'C:/'+id})},contexts:{read:()=>({projects:contexts}),consultSelection:async id=>{const release=admission.enter('helper');active++;max=Math.max(active,max);await tick();active--;release();return contexts.find(c=>c.projectId===id)}},collect:async(id,root,selection,observation)=>{const release=admission.enter('helper');active++;max=Math.max(active,max);await tick();active--;release();return {schemaVersion:1,projectId:id,rootPath:root,rootIdentity:'root-a',initiativeId:'alpha',initiativePath:root+'/output/alpha',contextRevision:h('a'),revision:h('b'),observedAt:'2026-11-04T10:00:00Z',coverage:'complete',sources:[],declarations:[],excerpts:[],problems:[]}}})
 await Promise.all(['project-a','project-b'].map(projectId=>c.execute({...command,projectId})));assert.equal(max,1);assert.ok(c.read().projects.every(p=>p.status==='ready'));await c.shutdown();assert.equal(subscribers,0)
})
test('F4 BUSY defers until availability without spinning; unknown stop is preserved',async()=>{
 const {ActivityAdmission}=await import('../src/core/lifecycle.ts');const admission=new ActivityAdmission(),release=admission.enter('provider');let attempts=0
 const f=fixture({available:fn=>admission.subscribeAvailable(fn),collect:async()=>{attempts++;const leave=admission.enter('helper');leave();throw Object.assign(Error(),{code:'STOP_UNCONFIRMED'})}})
 await f.c.execute(command);assert.equal(attempts,1);assert.equal(f.c.read().projects[0].errorCode,'BUSY');await tick();assert.equal(attempts,1);release();await tick();await f.c.settled();assert.equal(attempts,2);assert.equal(f.c.read().projects[0].errorCode,'STOP_UNCONFIRMED');await tick();assert.equal(attempts,2);await f.c.shutdown()
})
test('F6 help invalidation preserves bundle/history and refuses late preparation/profile',async()=>{
 const {BmadHelpCoordinator}=await import('../src/core/bmad-help.ts');let changed=()=>{},root='C:/synthetic',finish,delayed=false,profiles=0
 const bundle={schemaVersion:1,id:'bundle-synthetic',projectId:'project-1',rootPath:root,observedAt:'2026-11-02T00:00:00Z',revision:h('a'),diagnostic:'partial',nativeReady:true,problems:[],documents:[],references:[],sources:[],activeInitiative:null,selectedInitiative:null,outputPath:root+'/_bmad-output',inventories:[],knowledgeRaw:'{}',configRaw:'{}',skillPath:'C:/owned/bmad/SKILL.md'}
 const c=new BmadHelpCoordinator({application:{dialogueProject:async()=>({id:'project-1',rootPath:root})},observation:{attach:async(_,fn)=>{changed=fn;return {health:'watching',close(){},reconcile:async()=>true}}},store:{read:async()=>[],write:async()=>{}},prepare:async()=>{if(delayed)await new Promise(r=>finish=r);return bundle},profile:async()=>{profiles++;await tick();changed('watching');return {}},copy:async()=>{}})
 const prepare={contractVersion:1,correlationId:'refresh-help',type:'prepare',projectId:'project-1'};await c.execute(prepare);await c.settled();assert.equal(c.read().freshness,'current');await assert.rejects(c.profile('project-1',new AbortController().signal),{code:'PROFILE_CHANGED'});assert.equal(profiles,1);assert.deepEqual(c.read().bundle,bundle);await assert.rejects(c.profile('project-1',new AbortController().signal),{code:'PROFILE_CHANGED'});assert.equal(profiles,1)
 delayed=true;await c.execute(prepare);await tick();root='C:/replacement';finish();await c.settled();assert.equal(c.read().status,'error');assert.deepEqual(c.read().bundle,bundle);await c.shutdown()
})

test('F5 focus reconciliation is passive when unchanged and refreshes only a changed armed lease',async()=>{
 let fresh=true,callback;const f=fixture({observation:{attach:async(_value,fn)=>{callback=fn;return {health:'watching',close(){},reconcile:async()=>{if(!fresh)callback('unavailable');return fresh}}}}})
 f.c.reconcile();await tick();assert.equal(f.counts().reads,0);await f.c.execute(command);f.c.reconcile();await tick();await f.c.settled();assert.equal(f.counts().reads,1);fresh=false;f.c.reconcile();await tick();await f.c.settled();assert.equal(f.counts().reads,2);assert.equal(f.c.read().projects[0].freshness,'uncertain');await f.c.shutdown()
})

test('F3/F5 context capture invalidated at attachment cannot leave a completed read stuck reading',async()=>{
 const {BmadContextCoordinator}=await import('../src/core/bmad-context.ts');const f=fixture();const c=new BmadContextCoordinator({application:{dialogueProject:async()=>({id:'project-a',rootPath:'C:/project-a'})},store:{read:async()=>null,write:async()=>{}},observe:async()=>f.context.observation,observeConfiguration:async()=>{throw Error('not used')},observation:{attach:async(_value,fn)=>{fn('unavailable');return {health:'unavailable',close(){},reconcile:async()=>false}}}})
 await c.execute({...command,type:'observe'});assert.equal(c.read().projects[0].status,'error');assert.equal(c.read().projects[0].freshness,'uncertain');assert.equal(c.read().projects[0].observation,null);await c.shutdown()
})

test('F3 configuration guard rereads application destination after the native await',async()=>{
 const {BmadContextCoordinator}=await import('../src/core/bmad-context.ts');let root='C:/project-a';const f=fixture(),observation={...f.context.observation};delete observation.initiatives;const c=new BmadContextCoordinator({application:{dialogueProject:async()=>({id:'project-a',rootPath:root})},store:{read:async()=>null,write:async()=>{}},observe:async()=>f.context.observation,observeConfiguration:async()=>{root='C:/replacement';return observation}});await assert.rejects(c.capture('project-a',false,new AbortController().signal),{code:'PROFILE_CHANGED'});await c.shutdown()
})

test('F3 context invalidation during consultation queues one qualified trailing capture after its refusal',async()=>{const original=fixture();let notify,consultations=0;const f=fixture({contexts:{read:()=>({projects:[original.context]}),subscribeInvalidation:fn=>{notify=fn;return()=>notify=null},consultSelection:async()=>{consultations++;if(consultations===1){notify('project-a','watching');throw Object.assign(Error(),{code:'PROFILE_CHANGED'})}return original.context}}});await f.c.execute(command);assert.equal(consultations,2);assert.equal(f.c.read().projects[0].freshness,'current');assert.equal(f.counts().reads,1);await f.c.shutdown();assert.equal(notify,null)})


test('F8 a real selection change immediately closes only its old scope before the new capture succeeds',async()=>{
 let emit,finish,hold=false,closed=0,events=[],context=fixture().context;context.observation.initiatives.push({...context.observation.initiatives[0],id:'beta',name:'beta',path:'C:/project-a/output/beta',source:'C:/project-a/output/beta/beta.md'})
 const f=fixture({contexts:{read:()=>({projects:[context]}),subscribe:fn=>{emit=fn;return()=>emit=null}},observation:{attach:async(_value,fn)=>{let live=true;events.push(()=>{if(live)fn('watching')});return {health:'watching',close(){if(live){live=false;closed++}},reconcile:async()=>true}}},collect:async(id,root,selection,observation)=>{if(hold)await new Promise(r=>finish=r);return {schemaVersion:1,projectId:id,rootPath:root,rootIdentity:selection.rootIdentity,initiativeId:selection.initiativeId,initiativePath:root+'/output/'+selection.initiativeId,contextRevision:observation.revision,revision:h(selection.initiativeId==='alpha'?'a':'b'),observedAt:'2026-11-04T10:00:00Z',coverage:'complete',sources:[],declarations:[],excerpts:[],problems:[]}}})
 await f.c.execute(command);hold=true;context={...context,selection:{...context.selection,initiativeId:'beta',revision:2}};emit({contractVersion:1,sequence:1,projects:[context]});assert.equal(closed,1);assert.equal(f.c.read().projects[0].monitoring,'unarmed');await tick();await tick();const generation=f.c.read().projects[0].generation;events[0]();assert.equal(f.c.read().projects[0].generation,generation);assert.equal(closed,1);hold=false;finish();await f.c.settled();assert.equal(f.c.read().projects[0].snapshot.initiativeId,'beta');assert.equal(f.c.read().projects[0].freshness,'current');await f.c.shutdown();assert.equal(closed,2);assert.equal(emit,null)
})

test('F5 focus requalifies inherited monitoring uncertainty even when its own lease finds unchanged bytes',async()=>{const original=fixture();let notify;const f=fixture({contexts:{read:()=>({projects:[original.context]}),subscribeInvalidation:fn=>{notify=fn;return()=>{}}}});await f.c.execute(command);notify('project-a','unavailable');assert.equal(f.c.read().projects[0].freshness,'uncertain');assert.equal(f.counts().reads,1);f.hold();f.c.reconcile();await tick();await tick();f.c.reconcile();f.c.reconcile();await tick();f.finish();await f.c.settled();assert.equal(f.counts().reads,2);assert.equal(f.c.read().projects[0].freshness,'current');await tick();assert.equal(f.counts().reads,2);await f.c.shutdown()})

test('review: focus recovers an armed uncertain first capture whose attach failed without retaining a lease',async()=>{
 let attaches=0,closed=0;const f=fixture({observation:{attach:async()=>{const failed=++attaches===1;return {health:failed?'unavailable':'watching',close(){closed++},reconcile:async()=>!failed}}}})
 f.c.reconcile();await tick();assert.equal(f.counts().reads,0)
 await f.c.execute(command);assert.equal(f.c.read().projects[0].freshness,'uncertain');assert.equal(closed,1);assert.equal(f.counts().reads,1)
 f.hold();f.c.reconcile();f.c.reconcile();await tick();await tick();f.c.reconcile();f.finish();await f.c.settled();assert.equal(f.counts().reads,2);assert.equal(f.c.read().projects[0].freshness,'current');await f.c.shutdown();assert.equal(closed,2)
})

test('review: focus retries a pending replacement scope after the previous lease closed and BUSY deferred it',async()=>{
 let emit,busy=false,reads=0,closed=0,current=fixture().context
 current.observation.initiatives.push({...current.observation.initiatives[0],id:'beta',name:'beta',path:'C:/project-a/output/beta',source:'C:/project-a/output/beta/beta.md'})
 const f=fixture({contexts:{read:()=>({projects:[current]}),subscribe:fn=>{emit=fn;return()=>{}}},observation:{attach:async()=>({health:'watching',close(){closed++},reconcile:async()=>true})},collect:async(id,root,selection,observation)=>{reads++;if(busy)throw Object.assign(Error('BUSY'),{code:'BUSY'});return {schemaVersion:1,projectId:id,rootPath:root,rootIdentity:selection.rootIdentity,initiativeId:selection.initiativeId,initiativePath:root+'/output/'+selection.initiativeId,contextRevision:observation.revision,revision:h(selection.initiativeId==='alpha'?'c':'d'),observedAt:'2026-11-04T10:00:00Z',coverage:'complete',sources:[],declarations:[],excerpts:[],problems:[]}}})
 await f.c.execute(command);const original=f.c.read().projects[0].snapshot;busy=true;current={...current,selection:{...current.selection,revision:2,initiativeId:'beta'}};emit({contractVersion:1,sequence:1,projects:[current]});assert.equal(closed,1);await tick();await f.c.settled();assert.equal(reads,2);assert.equal(f.c.read().projects[0].errorCode,'BUSY');assert.deepEqual(f.c.read().projects[0].snapshot,original)
 busy=false;f.c.reconcile();f.c.reconcile();await tick();await f.c.settled();assert.equal(reads,3);assert.equal(f.c.read().projects[0].snapshot.initiativeId,'beta');assert.equal(f.c.read().projects[0].freshness,'current');await f.c.shutdown();assert.equal(closed,2)
})

test('review: Context and Progress replace a changed config lease once and unchanged settled focus does not collect again',async t=>{
 const {BmadContextCoordinator}=await import('../src/core/bmad-context.ts'),fs=await import('node:fs/promises'),{realpathSync}=await import('node:fs'),{tmpdir}=await import('node:os'),{join,dirname,basename}=await import('node:path'),{createHash}=await import('node:crypto')
 const root=realpathSync.native(await fs.mkdtemp(join(tmpdir(),'madness-refresh-context-'))),file=join(root,'config.toml'),digest=bytes=>createHash('sha256').update(bytes).digest('hex'),checks=new Set(),leases=[];let collections=0
 await fs.writeFile(file,'[core]\nactive_initiative="alpha"\n')
 const observation=async id=>({schemaVersion:1,projectId:id,rootPath:root,rootIdentity:'root-a',revision:digest(await fs.readFile(file)),observedAt:'2026-11-04T10:00:00Z',status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:[{id:'alpha',name:'alpha',path:join(root,'output/alpha'),source:join(root,'output/alpha/alpha.md'),revision:h('a')}],sources:[],problems:[]})
 const port={attach:async(value,changed)=>{const receipt={revision:value.contextRevision??value.revision,closed:false,context:!!value.initiatives};leases.push(receipt);return {health:'watching',close(){receipt.closed=true},reconcile(){const check=(async()=>{const fresh=!receipt.closed&&digest(await fs.readFile(file))===receipt.revision;if(!fresh&&!receipt.closed)changed('unavailable');return fresh})();checks.add(check);void check.finally(()=>checks.delete(check));return check}}}}
 const selection={schemaVersion:1,projectId:'project-a',rootPath:root,rootIdentity:'root-a',revision:1,initiativeId:'alpha'},application={dialogueProject:async id=>({id,rootPath:root})},contexts=new BmadContextCoordinator({application,store:{read:async()=>selection,write:async()=>{}},observe:observation,observeConsultation:observation,observeConfiguration:async()=>{throw Error('not used')},observation:port}),progress=new BmadProgressCoordinator({application,contexts,observation:port,collect:async(id,path,selected,context)=>{collections++;return {schemaVersion:1,projectId:id,rootPath:path,rootIdentity:selected.rootIdentity,initiativeId:selected.initiativeId,initiativePath:join(root,'output/alpha'),contextRevision:context.revision,revision:digest('progress:'+context.revision),observedAt:'2026-11-04T10:00:00Z',coverage:'complete',sources:[],declarations:[],excerpts:[],problems:[]}}})
 t.after(async()=>{await progress.shutdown();await contexts.shutdown();assert.equal(dirname(root),realpathSync.native(tmpdir()));assert.ok(basename(root).startsWith('madness-refresh-context-'));await fs.rm(root,{recursive:true,force:true})})
 const settleChecks=async()=>{while(checks.size)await Promise.all([...checks])},settle=async()=>{await settleChecks();await tick();await progress.settled();await settleChecks();await tick();await progress.settled()}
 await contexts.execute({...command,type:'observe'});await progress.execute(command);assert.equal(collections,1)
 await fs.writeFile(file,'[core]\nactive_initiative="alpha"\nexternal_change=true\n');contexts.reconcile();await settleChecks();progress.reconcile();await settle();assert.equal(collections,2);assert.equal(progress.read().projects[0].snapshot.contextRevision,digest(await fs.readFile(file)))
 contexts.reconcile();progress.reconcile();await settle();assert.equal(collections,2,'unchanged focus must not re-read the old context fingerprint');contexts.reconcile();progress.reconcile();await settle();assert.equal(collections,2);assert.equal(contexts.read().projects[0].freshness,'current');assert.equal(leases.filter(l=>l.context&&!l.closed).length,1)
})

for(const phase of ['attach-root','reconcile-generation','reconcile-selection'])test('review: unpublished consultation lease closes after '+phase+' changes its captured preconditions',async()=>{
 const {BmadContextCoordinator}=await import('../src/core/bmad-context.ts');let root='C:/project-a',revision=h('a'),release,entered;const gate=new Promise(r=>release=r),waiting=new Promise(r=>entered=r),leases=[]
 const selection={schemaVersion:1,projectId:'project-a',rootPath:root,rootIdentity:'root-a',revision:1,initiativeId:'alpha'},observation=async id=>({schemaVersion:1,projectId:id,rootPath:root,rootIdentity:'root-a',revision,observedAt:'2026-11-04T10:00:00Z',status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:['alpha','beta'].map(id=>({id,name:id,path:'C:/project-a/output/'+id,source:'C:/project-a/output/'+id+'/'+id+'.md',revision:h('a')})),sources:[],problems:[]}),port={attach:async()=>{const receipt={closed:false};leases.push(receipt);const index=leases.length;if(index===2&&phase==='attach-root'){entered();await gate}return {health:'watching',close(){receipt.closed=true},reconcile:async()=>{if(index===2&&phase!=='attach-root'){entered();await gate}return true}}}},contexts=new BmadContextCoordinator({application:{dialogueProject:async id=>({id,rootPath:root})},store:{read:async()=>selection,write:async()=>{}},observe:observation,observeConsultation:observation,observeConfiguration:async()=>{throw Error('not used')},observation:port})
 try{
  await contexts.execute({...command,type:'observe'});const original=contexts.read().projects[0].observation;revision=h('b');const work=contexts.consultSelection('project-a',new AbortController().signal),refused=assert.rejects(work,{code:'PROFILE_CHANGED'});await waiting
  if(phase==='attach-root')root='C:/replacement';else if(phase==='reconcile-generation')contexts.invalidate('project-a');else await contexts.execute({...command,type:'choose',initiativeId:'beta',revision})
  release();await refused;assert.equal(leases[1].closed,true);if(phase==='reconcile-selection'){assert.equal(contexts.read().projects[0].selection.initiativeId,'beta');assert.equal(leases[0].closed,true);assert.equal(leases[2].closed,false)}else{assert.deepEqual(contexts.read().projects[0].observation,original);assert.equal(leases[0].closed,false)}
 }finally{release();await contexts.shutdown();assert.ok(leases.every(l=>l.closed))}
})
