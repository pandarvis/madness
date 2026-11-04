import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,readFile,writeFile,mkdir,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
test('help commands accept business ids only and refuse arbitrary paths and modes',async()=>{
 const c=await import('../src/contracts/bmad-help.ts').catch(()=>null)
 assert.ok(c,'Dedicated versioned help contract is required')
 assert.equal(c.isHelpCommand({contractVersion:1,correlationId:'help-test-1',type:'prepare',projectId:'project-1'}),true)
 assert.equal(c.isHelpCommand({contractVersion:1,correlationId:'help-test-1',type:'prepare',projectId:'project-1',path:'C:/secret'}),false)
 assert.equal(c.isHelpCommand({contractVersion:1,correlationId:'help-test-1',type:'launch',projectId:'project-1',mode:'file-approval'}),false)
})
test('helper root disappearance never proves group stop; durable terminal is generation bound',async()=>{
 const m=await import('../src/adapters/bmad/help-owned-run.ts').catch(()=>null)
 assert.ok(m,'Independent helper ownership is required')
 const folder=await mkdtemp(join(tmpdir(),'madness-help-owner-'))
 try{
  const owner=new m.HelpOwnedRun(join(folder,'owner.json'))
  assert.equal(await owner.status(),'stopped')
  const one=await owner.begin(join(folder,'run-one'))
  assert.equal(await owner.status(),'unknown')
  assert.equal(await owner.observeStop(),'unknown')
  await assert.rejects(owner.begin(join(folder,'run-two')))
  await writeFile(join(folder,'run-one','terminal.json'),JSON.stringify({schemaVersion:1,generation:'different',purpose:'bmad-readonly',jobAssigned:true,jobActive:0,terminal:true}))
  assert.equal(await owner.observeStop(),'unknown')
  await writeFile(join(folder,'run-one','terminal.json'),JSON.stringify({schemaVersion:1,generation:one,purpose:'bmad-readonly',jobAssigned:true,jobActive:0,terminal:true}))
  assert.equal(await owner.observeStop(),'stopped')
  const two=await owner.begin(join(folder,'run-two'))
  assert.notEqual(one,two)
  assert.equal(await owner.confirm(one),'unknown')
  assert.equal(await owner.status(),'unknown')
 }finally{await rm(folder,{recursive:true,force:true})}
})
test('future help annex is preserved and cannot be overwritten',async()=>{
 const m=await import('../src/adapters/persistence/bmad-help-store.ts').catch(()=>null)
 assert.ok(m,'Dedicated help annex is required')
 const folder=await mkdtemp(join(tmpdir(),'madness-help-store-'))
 try{
  await writeFile(join(folder,'conversation-1.json'),'{"schemaVersion":99}\n')
  const store=new m.BmadHelpStore(folder)
  await assert.rejects(store.read())
  assert.equal(await readFile(join(folder,'conversation-1.json'),'utf8'),'{"schemaVersion":99}\n')
 }finally{await rm(folder,{recursive:true,force:true})}
})
test('product resources include exact native sources and preparation uses no project executable',async()=>{
 const adapter=await import('../src/adapters/bmad/help.ts').catch(()=>null)
 assert.ok(adapter,'Product help adapter is required')
 const crypto=await import('node:crypto')
 for(const [resource,original] of [['knowledge.py','.agents/skills/bmad/scripts/knowledge.py'],['resolve_config.py','_bmad/scripts/resolve_config.py'],['config_utils.py','_bmad/scripts/config_utils.py']]){
  assert.deepEqual(await readFile(join('resources/bmad-help',resource)),await readFile(original))
 }
})
test('real Windows helper loads native help over snapshots and rejects changed configuration',async()=>{
 const {BmadHelpAdapter}=await import('../src/adapters/bmad/help.ts')
 const {HelpOwnedRun}=await import('../src/adapters/bmad/help-owned-run.ts')
 const {resolve}=await import('node:path')
 const folder=await mkdtemp(join(tmpdir(),'madness-help-local-'))
 const project=join(folder,'project'),skills=join(project,'.agents/skills')
 try{
  await mkdir(join(skills,'bmod-test/help'),{recursive:true})
  await mkdir(join(skills,'bmad/references'),{recursive:true})
  await mkdir(join(project,'_bmad'),{recursive:true})
  await writeFile(join(project,'_bmad/config.toml'),'[core]\noutput_folder = "{project-root}/_bmad-output"\n')
  await writeFile(join(skills,'bmod-test/bmod.toml'),'[bmod]\ncode="test"\nversion="6.13.0-next"\nskills=["bmad"]\n')
  await writeFile(join(skills,'bmod-test/help/help.md'),'Native help: use $bmad.\n')
  await writeFile(join(skills,'bmad/bmod.toml'),'[skill]\nbmod="bmod-test"\n')
  await writeFile(join(skills,'bmad/SKILL.md'),await readFile('resources/bmad-help/bmad-SKILL.md'))
  await writeFile(join(skills,'bmad/references/help.md'),await readFile('resources/bmad-help/bmad-help.md'))
  await writeFile(join(project,'_bmad/config_utils.py'),'raise RuntimeError("PROJECT CODE MUST NEVER RUN")')
  const owner=new HelpOwnedRun(join(folder,'owner.json'))
  const adapter=new BmadHelpAdapter({root:join(folder,'operations'),resources:resolve('resources/bmad-help'),owner,roots:()=>[skills]})
  let bundle;try{bundle=await adapter.prepare('project-1',project,new AbortController().signal)}catch(e){const {readdir}=await import('node:fs/promises');for(const operation of await readdir(join(folder,'operations'))){for(const name of ['launcher-error.txt','stderr.log','stdout.json','execution.json']){console.error(name,await readFile(join(folder,'operations',operation,name),'utf8').catch(()=>''))}}throw e}
  assert.equal(bundle.documents.length,1)
  assert.equal(bundle.documents[0].text,'Native help: use $bmad.\n')
  assert.equal(bundle.nativeReady,true)
  assert.equal(await owner.status(),'stopped')
  assert.ok(bundle.knowledgeRaw.includes('skills-0'))
  try{await adapter.assertFresh(bundle.id,new AbortController().signal)}catch(e){const {readdir}=await import('node:fs/promises');for(const operation of await readdir(join(folder,'operations'))){if(!operation.startsWith('operation-'))continue;for(const name of ['launcher-error.txt','stderr.log','stdout.json','execution.json']){console.error(name,await readFile(join(folder,'operations',operation,name),'utf8').catch(()=>''))}}throw e}
  await writeFile(join(project,'_bmad/config.toml'),'[core]\noutput_folder = "{project-root}/changed"\n')
  await assert.rejects(adapter.assertFresh(bundle.id,new AbortController().signal),e=>e.code==='PROFILE_CHANGED')
  assert.equal(await owner.status(),'stopped')
 }finally{await rm(folder,{recursive:true,force:true})}
})
test('private admissions serialize local preparation and provider, nested helper requires explicit owner scope',async()=>{
 const {ActivityAdmission}=await import('../src/core/lifecycle.ts')
 const a=new ActivityAdmission(),releaseHelper=a.enter('helper')
 assert.throws(()=>a.enter('provider'))
 releaseHelper()
 const releaseProvider=a.enter('provider')
 assert.throws(()=>a.enter('helper'))
 const nested=a.enter('helper',true)
 assert.throws(()=>a.enter('helper',true))
 nested();const second=a.enter('helper',true);nested()
 assert.throws(()=>a.enter('provider'))
 second();releaseProvider();a.enter('provider')()
})
test('connection reacquires aggregate proof at effect and a Codex callback cannot clear helper unknown',async()=>{
 const {CodexConnection}=await import('../src/adapters/codex/connection.ts')
 let helper='stopped',refresh=0
 const credentials={version:1,clientId:'synthetic',subject:'synthetic',accessToken:'synthetic',refreshToken:'synthetic',idToken:'synthetic',expiresAt:Date.now()+600000,scopes:[],planAcknowledged:true}
 const connection=new CodexConnection({recovery:{status:async()=>helper,observeStop:async()=>helper},vault:{read:async()=>credentials},refresh:async c=>{refresh++;return c},now:()=>new Date(),oauth:async()=>{throw Error()},probe:async()=>{throw Error()},openUsage:async()=>{},openPublicKeys:async()=>{},copyPublicKeys:async()=>{}})
 await connection.read();helper='unknown'
 await assert.rejects(connection.acquireDialogue(new AbortController().signal),{code:'STOP_UNCONFIRMED'})
 await connection.confirmDialogueStop();await connection.confirmRecoveryStop()
 assert.equal((await connection.read()).status,'unknown')
 assert.equal(refresh,0)
})
test('a successful session.stop cannot bypass the independent helper recovery proof',async()=>{
 const {Application}=await import('../src/core/application.ts')
 const {DialogueCoordinator}=await import('../src/core/dialogue.ts')
 const {emptySnapshot}=await import('../src/contracts/index.ts')
 let snapshot=emptySnapshot(),count=0,helper='stopped'
 const app=new Application({store:{read:async()=>snapshot,write:async v=>snapshot=structuredClone(v)},newId:()=> 'context-'+ ++count,now:()=>new Date().toISOString(),chooseDirectory:async()=>({rootPath:'C:/synthetic',name:'Synthetic'})})
 await app.execute({contractVersion:1,correlationId:'open-synthetic',type:'choose-directory'})
 const dialogue=new DialogueCoordinator({application:app,recovery:{status:async()=>helper,observeStop:async()=>helper},qualify:async()=>({rootPath:'C:/synthetic',skillPath:'Mary',fingerprint:'a'.repeat(64)}),open:async()=>({context:{connectionId:'synthetic',initiativeId:null},turn:async(_,ack)=>{await ack();return 'Synthetic'},stop:async()=>'stopped'})})
 await dialogue.execute({contractVersion:1,correlationId:'launch-synthetic',type:'launch',projectId:'context-1'});await dialogue.settled()
 helper='unknown'
 await dialogue.execute({contractVersion:1,correlationId:'stop-synthetic',type:'stop'});await dialogue.settled()
 assert.equal(dialogue.read().status,'unknown')
 assert.equal(dialogue.read().recovery.stop,'unconfirmed')
 assert.equal((await dialogue.execute({contractVersion:1,correlationId:'relaunch-synthetic',type:'launch',projectId:'context-1'})).errorCode,'STOP_UNCONFIRMED')
})

function syntheticBundle(){return {schemaVersion:1,id:'bundle-synthetic',projectId:'project-1',rootPath:'C:/synthetic',observedAt:'2026-11-02T00:00:00.000Z',revision:'a'.repeat(64),diagnostic:'partial',nativeReady:true,problems:[],documents:[],references:[],sources:[],activeInitiative:null,selectedInitiative:null,outputPath:'C:/synthetic/_bmad-output',inventories:[],knowledgeRaw:'{}\n',configRaw:'{}\n',skillPath:'C:/owned/bmad/SKILL.md'}}
test('native receipts survive disk failure in session and retry-save never resends; restore stays passive',async()=>{
 const {BmadHelpCoordinator}=await import('../src/core/bmad-help.ts')
 const {isHelpRecord}=await import('../src/contracts/bmad-help.ts')
 let stored=[],fail=false,prepareCalls=0,profileCalls=0
 const store={read:async()=>structuredClone(stored),write:async record=>{if(fail)throw Error('disk');stored=[structuredClone(record)]}}
 const deps={application:{dialogueProject:async()=>({id:'project-1',rootPath:'C:/synthetic'})},store,prepare:async()=>{prepareCalls++;return syntheticBundle()},profile:async()=>{profileCalls++;throw Error('No provider')},copy:async()=>{}}
 const core=new BmadHelpCoordinator(deps)
 const context={projectId:'project-1',initiativeId:null,conversationId:'conversation-1',providerId:'codex',connectionId:'connection-1'}
 await core.begin(syntheticBundle(),context)
 for(const [operation,reference] of [['knowledge',null],['config',null],['read','inventories']])await core.tool('conversation-1',{threadId:'native-thread',turnId:'native-turn',callId:'tool-'+operation,operation,reference,sha256:'b'.repeat(64),raw:'raw-'+operation})
 assert.equal(core.read().records[0].transmission,'transmitted')
 fail=true
 await assert.rejects(core.response('conversation-1','local-turn','Native reasons and alternatives.'))
 assert.equal(core.read().records[0].response,'Native reasons and alternatives.')
 assert.equal(core.read().records[0].storage,'failed')
 fail=false
 await core.execute({contractVersion:1,correlationId:'retry-save-only',type:'retry-save',conversationId:'conversation-1'})
 assert.equal(stored[0].response,'Native reasons and alternatives.')
 assert.equal(isHelpRecord(stored[0]),true)
 await core.response('conversation-1','local-turn-2','Follow-up exact.',{threadId:'native-thread',turnId:'native-turn-2'})
 assert.equal(stored[0].turns.length,2);assert.equal(stored[0].turns[1].nativeId,'native-turn-2')
 const reopened=new BmadHelpCoordinator(deps)
 const restored=await reopened.execute({contractVersion:1,correlationId:'read-passive',type:'read'})
 assert.equal(restored.records[0].response,'Follow-up exact.');assert.equal(restored.records[0].turns[0].response,'Native reasons and alternatives.')
 assert.equal(prepareCalls,0);assert.equal(profileCalls,0)
})
test('help appendix validates exact schemas and rejects corrupt/future content on write',async()=>{
 const {BmadHelpStore}=await import('../src/adapters/persistence/bmad-help-store.ts')
 const {isHelpBundle}=await import('../src/contracts/bmad-help.ts')
 assert.equal(isHelpBundle(syntheticBundle()),true)
 assert.equal(isHelpBundle({...syntheticBundle(),secret:'forbidden'}),false)
 const folder=await mkdtemp(join(tmpdir(),'madness-help-future-'))
 try{
  const path=join(folder,'conversation-1.json')
  await writeFile(path,'{"schemaVersion":99}\n')
  const store=new BmadHelpStore(folder)
  const record={schemaVersion:1,conversationId:'conversation-1',context:{projectId:'project-1',initiativeId:null,conversationId:'conversation-1',providerId:'codex',connectionId:'connection-1'},invocation:'$bmad',bundle:syntheticBundle(),turns:[],localTurnId:null,nativeThreadId:null,nativeTurnId:null,transmission:'none',tools:[],response:null,outcome:'pending',storage:'stored'}
  await assert.rejects(store.write(record))
  assert.equal(await readFile(path,'utf8'),'{"schemaVersion":99}\n')
 }finally{await rm(folder,{recursive:true,force:true})}
})


test('changed owned native resource is refused before any UV and reservation closes without borrowing Codex proof',async()=>{
 const {BmadHelpAdapter}=await import('../src/adapters/bmad/help.ts')
 const {HelpOwnedRun}=await import('../src/adapters/bmad/help-owned-run.ts')
 const {cp,readdir,access}=await import('node:fs/promises')
 const {resolve}=await import('node:path')
 const folder=await mkdtemp(join(tmpdir(),'madness-help-pins-'))
 try{
  const project=join(folder,'project'),resources=join(folder,'resources'),operations=join(folder,'operations')
  await mkdir(project);await cp(resolve('resources/bmad-help'),resources,{recursive:true})
  await writeFile(join(resources,'knowledge.py'),'raise RuntimeError("tampered source")')
  const owner=new HelpOwnedRun(join(folder,'owner.json')),adapter=new BmadHelpAdapter({root:operations,resources,owner,roots:()=>[]})
  await assert.rejects(adapter.prepare('project-1',project,new AbortController().signal),{code:'PROFILE_CHANGED'})
  assert.equal(await owner.status(),'stopped')
  const names=(await readdir(operations)).filter(n=>n.startsWith('operation-'))
  assert.equal(names.length,1)
  await assert.rejects(access(join(operations,names[0],'execution.json')))
  const terminal=JSON.parse(await readFile(join(operations,names[0],'terminal.json'),'utf8'))
  assert.equal(terminal.neverStarted,true)
  assert.equal(terminal.jobAssigned,false)
  assert.equal(terminal.purpose,'bmad-readonly')
  await adapter.shutdown()
 }finally{await rm(folder,{recursive:true,force:true})}
})

test('corrupt helper owner cannot redirect recovery to an external proof folder',async()=>{
 const {HelpOwnedRun}=await import('../src/adapters/bmad/help-owned-run.ts')
 const folder=await mkdtemp(join(tmpdir(),'madness-help-owner-scope-'))
 try{
  await writeFile(join(folder,'owner.json'),JSON.stringify({schemaVersion:1,generation:'help-11111111-1111-4111-8111-111111111111',purpose:'bmad-readonly',status:'unknown',folder:'C:/outside/foreign-proof'}))
  const owner=new HelpOwnedRun(join(folder,'owner.json'))
  await assert.rejects(owner.status(),{code:'STORAGE_READ_FAILED'})
  await assert.rejects(owner.observeStop(),{code:'STORAGE_READ_FAILED'})
  assert.equal(JSON.parse(await readFile(join(folder,'owner.json'),'utf8')).folder,'C:/outside/foreign-proof')
 }finally{await rm(folder,{recursive:true,force:true})}
})
test('closed context batch has one raw receipt, exact mapping and encoded-size fallback',async()=>{
 const {helpContextText,validHelpContextText}=await import('../src/contracts/bmad-help.ts')
 const {HelpHost}=await import('../src/adapters/bmad/help.ts')
 const bundle=syntheticBundle();bundle.sources=[{id:'source-1',source:'C:/project/a.md',snapshot:'C:/owned/data/project/a.md',sha256:'c'.repeat(64),bytes:4,text:'Exact raw context',module:null,skills:[]}]
 const raw=helpContextText(bundle)
 assert.equal(validHelpContextText(raw,bundle),true)
 assert.equal(validHelpContextText(raw.replace('Exact raw context','invented'),bundle),false)
 assert.equal(validHelpContextText(JSON.stringify({sources:[],inventories:[]}),bundle),false)
 const host=new HelpHost({},bundle,new AbortController().signal)
 assert.deepEqual(host.preferredReferences(),['required-context'])
 const oversized=structuredClone(bundle);oversized.sources[0].text='"'.repeat(600000)
 const largeHost=new HelpHost({},oversized,new AbortController().signal)
 assert.deepEqual(largeHost.preferredReferences(),['source-1','inventories'])
})


test('future owner bytes appearing after a known stop cannot be cleared by observation',async()=>{
 const {HelpOwnedRun}=await import('../src/adapters/bmad/help-owned-run.ts')
 const folder=await mkdtemp(join(tmpdir(),'madness-help-owner-future-'))
 try{
  const path=join(folder,'owner.json'),owner=new HelpOwnedRun(path),run=join(folder,'run-one'),generation=await owner.begin(run)
  await writeFile(join(run,'terminal.json'),JSON.stringify({schemaVersion:1,generation,purpose:'bmad-readonly',terminal:true,jobAssigned:true,jobActive:0}))
  assert.equal(await owner.confirm(generation),'stopped')
  await writeFile(path,'{"schemaVersion":99}\n')
  await assert.rejects(owner.status(),{code:'STORAGE_READ_FAILED'})
  await assert.rejects(owner.observeStop(),{code:'STORAGE_READ_FAILED'})
  await assert.rejects(owner.confirm(generation),{code:'STORAGE_READ_FAILED'})
  assert.equal(await readFile(path,'utf8'),'{"schemaVersion":99}\n')
 }finally{await rm(folder,{recursive:true,force:true})}
})


test('confirm rejection after begin releases helper admission and shutdown without claiming a stop',async()=>{
 const {BmadHelpAdapter}=await import('../src/adapters/bmad/help.ts')
 const {HelpOwnedRun}=await import('../src/adapters/bmad/help-owned-run.ts')
 const {ActivityAdmission}=await import('../src/core/lifecycle.ts')
 const {cp,readdir,access}=await import('node:fs/promises'),{resolve}=await import('node:path')
 const folder=await mkdtemp(join(tmpdir(),'madness-help-confirm-reject-')),ownerPath=join(folder,'owner.json')
 const {mock}=await import('node:test'),{createRequire,syncBuiltinESMExports}=await import('node:module')
 let interception,spawned=0,notifications=0,releases=0
 const gate=new ActivityAdmission()
 try{
  const project=join(folder,'project'),resources=join(folder,'resources'),operations=join(folder,'operations')
  await mkdir(project);await cp(resolve('resources/bmad-help'),resources,{recursive:true})
  await writeFile(join(resources,'knowledge.py'),'tampered source refused before UV')
  const owner=new HelpOwnedRun(ownerPath),begin=owner.begin.bind(owner),future='{"schemaVersion":99}'
  owner.begin=async path=>{const generation=await begin(path);await writeFile(ownerPath,future);return generation}
  const childProcess=createRequire(import.meta.url)('node:child_process');interception=mock.method(childProcess,'spawn',()=>{spawned++;throw Error('UNEXPECTED_HELPER_START')});syncBuiltinESMExports()
  const adapter=new BmadHelpAdapter({root:operations,resources,owner,roots:()=>[],onUnknown:()=>{notifications++},admission:{enter:(...args)=>{const release=gate.enter(...args);return()=>{releases++;release()}}}})
  const first=await adapter.prepare('project-1',project,new AbortController().signal).catch(e=>e)
  const second=await adapter.prepare('project-1',project,new AbortController().signal).catch(e=>e)
  let timer;const closed=await Promise.race([adapter.shutdown().then(outcome=>({outcome})).catch(e=>({error:e.code})),new Promise(resolve=>{timer=setTimeout(()=>resolve({blocked:true}),1000)})]).finally(()=>clearTimeout(timer))
  assert.notEqual(closed.blocked,true,'shutdown must settle after confirm rejects')
  assert.equal(first.code,'STOP_UNCONFIRMED');assert.equal(second.code,'STOP_UNCONFIRMED')
  assert.equal(spawned,0);assert.equal(closed.outcome,'unknown');assert.ok(notifications>=1);assert.equal(releases,2)
  gate.enter('provider')()
  assert.equal(await readFile(ownerPath,'utf8'),future,'unknown future owner stays intact')
  const runs=(await readdir(operations)).filter(n=>n.startsWith('operation-'));assert.equal(runs.length,1)
  await assert.rejects(access(join(operations,runs[0],'execution.json')),{code:'ENOENT'})
 }finally{interception?.mock.restore();syncBuiltinESMExports();await rm(folder,{recursive:true,force:true})}
})

test('catalogue consultation requests normal helper admission and cannot nest into provider ownership',async()=>{const {BmadHelpAdapter}=await import('../src/adapters/bmad/help.ts');const folder=await mkdtemp(join(tmpdir(),'madness-catalog-admission-'));try{const calls=[],helper=new BmadHelpAdapter({root:folder,resources:folder,owner:{},roots:()=>[]});helper.run=async(request,signal,internal)=>{calls.push({request,internal});throw Object.assign(Error('BUSY'),{code:'BUSY'})};await assert.rejects(helper.observeCatalog('project-a',folder,new AbortController().signal),{code:'BUSY'});assert.equal(calls.length,1);assert.equal(calls[0].request.op,'catalog');assert.equal(calls[0].internal,false)}finally{await rm(folder,{recursive:true,force:true})}})
