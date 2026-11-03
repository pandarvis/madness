import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,readFile,writeFile,rm,link} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
const observation=(projectId='project-a',revision='a'.repeat(64))=>({schemaVersion:1,projectId,rootPath:'C:/'+projectId,rootIdentity:'root-'+projectId,revision,observedAt:new Date().toISOString(),status:'candidate-observed',activeInitiative:'alpha',activeStatus:'valid',initiatives:['alpha','beta'].map(id=>({id,name:id,path:'C:/'+projectId+'/_bmad-output/'+id,source:'C:/'+projectId+'/_bmad-output/'+id+'/'+id+'.md',revision:'b'.repeat(64)})),sources:[],problems:[]})

test('outil indépendant ne périme pas sa capture quand ses sorties changent',async()=>{
 const {c,observed}=await fixture({observeConfiguration:async id=>{const {initiatives,...value}=observation(id);return value}})
 await c.execute(cmd('observe',{projectId:'project-a'}))
 const captured=await c.capture('project-a',false,new AbortController().signal)
 assert.deepEqual(c.read().projects[0].observation.initiatives.map(i=>i.id),['alpha','beta'])
 observed.set('project-a',observation('project-a','c'.repeat(64)))
 await c.assertFresh(captured,new AbortController().signal)
})
test('root replacement preserves old selection and refuses initiative action until a fresh explicit choice',async()=>{
 const {c,observed}=await fixture()
 await c.execute(cmd('choose',{projectId:'project-a',initiativeId:'alpha',revision:'a'.repeat(64)}))
 observed.set('project-a',{...observation(),rootIdentity:'replacement-root'})
 await c.execute(cmd('observe',{projectId:'project-a'}))
 assert.equal(c.read().projects[0].selection.rootIdentity,'root-project-a')
 await assert.rejects(c.capture('project-a',true,new AbortController().signal),e=>e.code==='CONTEXT_MISMATCH')
 await c.execute(cmd('choose',{projectId:'project-a',initiativeId:'alpha',revision:'a'.repeat(64)}))
 await c.capture('project-a',true,new AbortController().signal)
})
test('invalid active identities never become a represented context or a guessed slug',async()=>{
 const {isBmadContextObservation}=await import('../src/contracts/bmad-context.ts')
 assert.equal(isBmadContextObservation({...observation(),activeInitiative:'non représentable',activeStatus:'invalid',initiatives:[]}),true)
 assert.equal(isBmadContextObservation({...observation(),activeInitiative:'non représentable',activeStatus:'valid'}),false)
 assert.equal(isBmadContextObservation({...observation(),initiatives:[{...observation().initiatives[0],name:'other-name'}]}),false)
 for(const activeStatus of ['absent','unknown','invalid']){
  const {c}=await fixture({observe:async id=>({...observation(id),status:'unknown',activeInitiative:null,activeStatus,initiatives:[]})})
  const capture=await c.capture('project-a',false,new AbortController().signal)
  assert.equal(capture.initiativeId,null)
  await assert.rejects(c.capture('project-a',true,new AbortController().signal),e=>e.code==='CONTEXT_MISMATCH')
  assert.equal(c.read().projects[0].selection,null)
 }
})
test('selection annex rejects a real hardlink without altering its external witness',async()=>{
 const {BmadContextStore}=await import('../src/adapters/persistence/bmad-context-store.ts')
 const folder=await mkdtemp(join(tmpdir(),'madness-context-hardlink-'))
 try{
  const outside=join(folder,'outside.json'),record={schemaVersion:1,projectId:'project-a',rootPath:'C:/project-a',rootIdentity:'root',revision:1,initiativeId:'alpha'},raw=JSON.stringify(record)
  await writeFile(outside,raw);await link(outside,join(folder,'project-a.json'))
  const store=new BmadContextStore(folder)
  await assert.rejects(store.read('project-a'));await assert.rejects(store.write({...record,revision:2,initiativeId:'beta'}))
  assert.equal(await readFile(outside,'utf8'),raw)
 }finally{await rm(folder,{recursive:true,force:true})}
})


test('consultation and captured-context guards serialize their read-only helper work',async()=>{
 const {BmadContextAdapter}=await import('../src/adapters/bmad/context.ts')
 let release,entered,busy=false
 const gate=new Promise(r=>release=r),started=new Promise(r=>entered=r)
 const adapter=new BmadContextAdapter({observeContext:async id=>{if(busy)throw Object.assign(Error(),{code:'BUSY'});busy=true;try{entered();await gate;return observation(id)}finally{busy=false}}})
 const first=adapter.observe('project-a','C:/project-a',new AbortController().signal);await started
 const second=adapter.observe('project-a','C:/project-a',new AbortController().signal).then(value=>({value}),error=>({error}))
 release();await first;const result=await second
 assert.equal(result.error,undefined);assert.equal(result.value.projectId,'project-a')
})


test('an admitted internal helper waits for context consultation and then reacquires ownership checks',async()=>{
 const {BmadHelpAdapter}=await import('../src/adapters/bmad/help.ts')
 let release,entered,admits=0
 const gate=new Promise(r=>release=r),started=new Promise(r=>entered=r)
 const adapter=new BmadHelpAdapter({root:'unused',resources:'unused',owner:{status:async()=>{throw Object.assign(Error(),{code:'CANCELLED'})}},admit:async()=>{admits++;if(admits===1){entered();await gate}}})
 const signal=new AbortController().signal
 const first=adapter.run({op:'context'},signal,true).then(()=>null,e=>e.code)
 await started
 const second=adapter.run({op:'native'},signal,true).then(()=>null,e=>e.code)
 release();assert.equal(await first,'STOP_UNCONFIRMED');assert.equal(await second,'STOP_UNCONFIRMED');assert.equal(admits,2)
})

const cmd=(type,fields={})=>({contractVersion:1,correlationId:'context-test-request',type,...fields})
async function fixture(extra={}){
 const {BmadContextCoordinator}=await import('../src/core/bmad-context.ts'),saved=new Map(),observed=new Map(),writes=[]
 return {saved,observed,writes,c:new BmadContextCoordinator({application:{dialogueProject:async id=>({id,rootPath:'C:/'+id})},store:{read:async id=>saved.get(id)??null,write:async r=>{saved.set(r.projectId,structuredClone(r));writes.push(r)}},observe:async id=>structuredClone(observed.get(id)??observation(id)),observeConfiguration:async id=>{const {initiatives,...value}=await (extra.observe??(async id=>structuredClone(observed.get(id)??observation(id))))(id);return {...value,activeStatus:value.activeInitiative===null?'absent':value.activeStatus}},...extra})}
}
test('commands refuse arbitrary paths and public admission flags',async()=>{
 const {isBmadContextCommand:valid}=await import('../src/contracts/bmad-context.ts')
 assert.equal(valid(cmd('choose',{projectId:'project-a',initiativeId:'alpha',revision:'a'.repeat(64)})),true)
 for(const extra of [{path:'C:/secret'},{internal:true},{requiresInitiative:false},{scope:'configuration'}])assert.equal(valid(cmd('observe',{projectId:'project-a',...extra})),false)
 assert.equal(valid(cmd('choose',{projectId:'project-a',initiativeId:'../alpha',revision:'a'.repeat(64)})),false)
 assert.equal(valid(cmd('context-config',{projectId:'project-a'})),false)
})
test('atomic annex restores two independent choices and preserves future/corrupt bytes',async()=>{
 const {BmadContextStore}=await import('../src/adapters/persistence/bmad-context-store.ts')
 const folder=await mkdtemp(join(tmpdir(),'madness-context-store-'))
 try{
  const store=new BmadContextStore(folder)
  const record=id=>({schemaVersion:1,projectId:id,rootPath:'C:/'+id,rootIdentity:'root-'+id,revision:1,initiativeId:id==='project-a'?'alpha':'beta'})
  for(const id of ['project-a','project-b']){assert.equal(await store.read(id),null);await store.write(record(id))}
  const reopened=new BmadContextStore(folder)
  assert.equal((await reopened.read('project-a')).initiativeId,'alpha')
  assert.equal((await reopened.read('project-b')).initiativeId,'beta')
  for(const raw of ['{"schemaVersion":99}\n','broken']){
   await writeFile(join(folder,'project-a.json'),raw)
   await assert.rejects(reopened.read('project-a'));await assert.rejects(reopened.write(record('project-a')))
   assert.equal(await readFile(join(folder,'project-a.json'),'utf8'),raw)
  }
 }finally{await rm(folder,{recursive:true,force:true})}
})
test('consultation beta never reassigns captured alpha; fresh sources still guard alpha',async()=>{
 const {c,observed}=await fixture()
 await c.execute(cmd('observe',{projectId:'project-a'}));assert.equal(c.read().projects[0].selection,null)
 await c.execute(cmd('choose',{projectId:'project-a',initiativeId:'alpha',revision:'a'.repeat(64)}))
 const captured=await c.capture('project-a',true,new AbortController().signal)
 await c.execute(cmd('choose',{projectId:'project-a',initiativeId:'beta',revision:'a'.repeat(64)}))
 await c.assertFresh(captured,new AbortController().signal)
 await assert.rejects(c.capture('project-a',true,new AbortController().signal),e=>e.code==='CONTEXT_MISMATCH')
 await c.capture('project-a',false,new AbortController().signal)
 await c.execute(cmd('choose',{projectId:'project-b',initiativeId:'beta',revision:'a'.repeat(64)}))
 assert.equal(c.read().projects.find(p=>p.projectId==='project-a').selection.initiativeId,'beta')
 observed.set('project-a',observation('project-a','c'.repeat(64)))
 await assert.rejects(c.assertFresh(captured,new AbortController().signal),e=>e.code==='PROFILE_CHANGED')
})
test('failed preservation retains session choice; save retry performs no observation',async()=>{
 let fail=true,reads=0;const writes=[]
 const {c}=await fixture({observe:async id=>{reads++;return observation(id)},store:{read:async()=>null,write:async r=>{if(fail)throw Error('denied');writes.push(r)}}})
 await c.execute(cmd('choose',{projectId:'project-a',initiativeId:'alpha',revision:'a'.repeat(64)}))
 assert.equal(c.read().projects[0].storage,'failed');assert.equal(c.read().projects[0].selection.initiativeId,'alpha')
 fail=false;const previous=reads
 await c.execute(cmd('retry-save',{projectId:'project-a'}))
 assert.equal(c.read().projects[0].storage,'stored');assert.equal(reads,previous)
})
test('superseded asynchronous choice never overwrites latest choice',async()=>{
 let release,first=true;const gate=new Promise(r=>release=r)
 const {c}=await fixture({observe:async id=>{if(first){first=false;await gate}return observation(id)}})
 const old=c.execute(cmd('choose',{projectId:'project-a',initiativeId:'alpha',revision:'a'.repeat(64)}))
 await new Promise(r=>setImmediate(r))
 await c.execute(cmd('choose',{projectId:'project-a',initiativeId:'beta',revision:'a'.repeat(64)}))
 release();await old;assert.equal(c.read().projects[0].selection.initiativeId,'beta')
})


test('passive read restores only known local choices without observing project data',async()=>{
 const {BmadContextCoordinator}=await import('../src/core/bmad-context.ts')
 const {BmadContextStore}=await import('../src/adapters/persistence/bmad-context-store.ts')
 const folder=await mkdtemp(join(tmpdir(),'madness-context-passive-'))
 try{
  const store=new BmadContextStore(folder),known=['project-a','project-b','project-empty','project-corrupt']
  const selection=(projectId,initiativeId)=>({schemaVersion:1,projectId,rootPath:'C:/'+projectId,rootIdentity:'root-'+projectId,revision:1,initiativeId})
  await store.write(selection('project-a','alpha'));await store.write(selection('project-b','beta'));await store.write(selection('foreign-project','foreign'))
  const corrupt='{"schemaVersion":99}\n';await writeFile(join(folder,'project-corrupt.json'),corrupt)
  let observations=0;const refuse=async()=>{observations++;throw Error('No implicit native observation')}
  const c=new BmadContextCoordinator({application:{dialogueProject:async id=>({id,rootPath:'C:/'+id})},projectIds:async()=>[...known],store,observe:refuse,observeConfiguration:refuse})
  const restored=await c.execute(cmd('read'))
  assert.deepEqual(restored.projects.map(p=>[p.projectId,p.selection?.initiativeId??null,p.status,p.observation,p.storage]),[
   ['project-a','alpha','idle',null,'stored'],['project-b','beta','idle',null,'stored'],['project-empty',null,'idle',null,'unset'],['project-corrupt',null,'idle',null,'unreadable']
  ])
  assert.equal(observations,0);assert.equal(await readFile(join(folder,'project-corrupt.json'),'utf8'),corrupt)
  await store.write(selection('project-new','gamma'));known.push('project-new')
  const changed=await c.execute(cmd('read'))
  assert.equal(changed.projects.find(p=>p.projectId==='project-new').selection.initiativeId,'gamma')
  assert.equal(changed.projects.some(p=>p.projectId==='foreign-project'),false);assert.equal(observations,0)
  await c.shutdown()
 }finally{await rm(folder,{recursive:true,force:true})}
})
