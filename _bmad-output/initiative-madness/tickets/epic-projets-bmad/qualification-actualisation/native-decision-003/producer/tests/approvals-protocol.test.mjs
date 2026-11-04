import assert from 'node:assert/strict'
import {test} from 'node:test'
import {EventEmitter} from 'node:events'
import {PassThrough} from 'node:stream'
import {syncBuiltinESMExports} from 'node:module'
import {mkdtemp,realpath,writeFile,readFile,rm,rename,symlink,unlink} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {DialogueRpc,startDialogueProtocol} from '../src/adapters/codex/dialogue.ts'
function server(root,options={}){
 const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();let buffer='',thread,turnCount=0;const messages=[]
 const emit=value=>child.stdout.write(JSON.stringify(value)+'\n'),changes=[{path:join(root,'a.md'),kind:{type:'update',move_path:null},diff:'@@ -1 +1 @@\n-old\n+new\n'}]
 const item=(status='inProgress',change=changes)=>emit({method:'item/'+(status==='inProgress'?'started':'completed'),params:{threadId:'native-thread',turnId:'native-turn',item:{id:'native-file',type:'fileChange',changes:change,status}}})
 const request=()=>emit({id:options.stringId?'0':0,method:'item/fileChange/requestApproval',params:{threadId:'native-thread',turnId:'native-turn',itemId:'native-file',startedAtMs:Date.now(),reason:null,grantRoot:options.grant??null}})
 const complete=()=>{emit({method:'item/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{type:'agentMessage',id:'native-message',text:'Tour terminé'}}});emit({method:'turn/completed',params:{threadId:'native-thread',turn:{id:'native-turn',status:'completed'}}})}
 child.stdin.on('data',chunk=>{buffer+=chunk;while(buffer.includes('\n')){const end=buffer.indexOf('\n'),m=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);messages.push(m);const reply=result=>emit({id:m.id,result})
 if(m.method==='initialize')reply({});if(m.method==='model/list')reply({data:[{isDefault:true,hidden:false,model:'model'}]})
 if(m.method==='thread/start'){thread=m.params;reply({thread:{id:'native-thread'},modelProvider:'openai_chatgpt_plan',model:'model',sandbox:{type:'readOnly'},approvalPolicy:m.params.approvalPolicy})}
 if(m.method==='turn/start'){turnCount++;reply({turn:{id:turnCount===1?'native-turn':'native-turn-2'}});if(turnCount===1||!options.secondTurnSilent)for(const [id,kind] of [[100,'agent'],[101,'config']])emit({id,method:'item/tool/call',params:{threadId:'native-thread',turnId:'native-turn',callId:'resolve-'+id,tool:'bmad_resolve',arguments:{kind}}})}
 if(m.id===101&&m.result&&!options.noAutoApproval){if(options.requestFirst){request();setImmediate(()=>item())}else{item();request()}}
 }});return {child,messages,emit,item,request,complete,thread:()=>thread,changes}
}
async function setup(t,options={}){
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-approval-protocol-')));await writeFile(join(root,'a.md'),'old\n');t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}));const controller=new AbortController(),native=server(root,options),rpc=new DialogueRpc(native.child,controller.signal,1000)
 const session=await startDialogueProtocol(rpc,{cwd:root,profile:{rootPath:root,skillPath:'Mary',mode:options.mode??'file-approval'},signal:controller.signal,assertContext:options.assertContext,activity:()=>{},resolve:options.resolve??(async()=>'{}'),read:async()=>''},options.timeout??3000)
 t.after(()=>{controller.abort();rpc.dispose()});let offered,following;const offers=[],ready=new Promise(r=>offered=r),turn=session.turn(null,async()=>{},()=>{},undefined,async(a,h)=>{offers.push({a,h});offered({a,h});following?.({a,h})});void turn.catch(()=>{})
 return {root,controller,native,rpc,session,turn,ready,offers,nextOffer:()=>new Promise(r=>following=r)}
}
async function operationResult(handle){let timer;try{return await Promise.race([handle.result,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('fileChange-receipt-unavailable-without-raw')),1000))])}finally{clearTimeout(timer)}}

test('accept relit le contexte après la préparation de proposition ; decline reste disponible',{timeout:10000},async t=>{
 for(const decision of ['accept','decline']){
  let contextPath,enabled=false
  const f=await setup(t,{assertContext:async()=>{if(enabled&&contextPath&&await readFile(contextPath,'utf8')!=='captured')throw Object.assign(Error(),{code:'PROFILE_CHANGED'})}})
  contextPath=join(f.root,'context.toml');await writeFile(contextPath,'captured');enabled=true
  const {h}=await f.ready,io=(await import('node:module')).createRequire(import.meta.url)('node:fs/promises'),read=io.readFile
  let changed=false
  io.readFile=async function(path,...args){const bytes=await Reflect.apply(read,this,[path,...args]);if(String(path)===join(f.root,'a.md')&&!changed){changed=true;await writeFile(contextPath,'changed during proposal preparation')}return bytes};syncBuiltinESMExports()
  try{
   if(decision==='accept'){const rejected=assert.rejects(h.result),failed=assert.rejects(f.turn);await assert.rejects(h.decide('accept'),{code:'PROFILE_CHANGED'});await rejected;await failed;assert.equal(f.native.messages.some(m=>m.id===0&&m.result?.decision==='accept'),false)}
   else{await h.decide('decline');assert.equal(f.native.messages.some(m=>m.id===0&&m.result?.decision==='decline'),true);f.native.item('declined');await operationResult(h);f.native.complete();await f.turn}
  }finally{io.readFile=read;syncBuiltinESMExports()}
  assert.equal(changed,true);assert.equal(await readFile(join(f.root,'a.md'),'utf8'),'old\n')
 }
})


test('accept revalide les fichiers et la possession après la garde de contexte',{timeout:10000},async t=>{
 for(const mode of ['file','path','stop']){
  let armed=false,guarded=false,f
  const external=await mkdtemp(join(tmpdir(),'madness-approval-external-'));t.after(()=>rm(external,{recursive:true,force:true}))
  const witness=join(external,'witness.md');await writeFile(witness,'EXTERNAL EXACT')
  f=await setup(t,{assertContext:async()=>{if(!armed)return;armed=false;if(mode==='file')await writeFile(join(f.root,'a.md'),'changed during context guard\n');if(mode==='path'){await rename(join(f.root,'a.md'),join(f.root,'a-original.md'));await symlink(external,join(f.root,'a.md'),'junction')}guarded=true}})
  const {h}=await f.ready,io=(await import('node:module')).createRequire(import.meta.url)('node:fs/promises'),read=io.readFile
  if(mode==='stop'){io.readFile=async function(path,...args){const bytes=await Reflect.apply(read,this,[path,...args]);if(guarded&&String(path)===join(f.root,'a.md'))f.controller.abort();return bytes};syncBuiltinESMExports()}
  const rejected=assert.rejects(h.result),failed=assert.rejects(f.turn);armed=true
  try{await assert.rejects(h.decide('accept'),e=>e.code===(mode==='file'?'OUTPUT_CONFLICT':mode==='path'?'OUTPUT_REFUSED':'CANCELLED'));await rejected;await failed;assert.equal(guarded,true);assert.equal(f.native.messages.some(m=>m.id===0&&m.result?.decision==='accept'),false);assert.equal(await readFile(witness,'utf8'),'EXTERNAL EXACT')}
  finally{io.readFile=read;syncBuiltinESMExports();f.controller.abort();if(mode==='path'){await unlink(join(f.root,'a.md'));await rename(join(f.root,'a-original.md'),join(f.root,'a.md'))}}
 }
})

test('approbation RPC zéro et proposition décalée : seul résultat natif et octets prouvent l’effet',async t=>{
 const f=await setup(t,{requestFirst:true});assert.equal(f.native.thread().approvalPolicy,'on-request');const {a,h}=await f.ready
 assert.equal(f.native.thread().approvalPolicy,'on-request');assert.equal(f.native.thread().sandbox,'read-only');assert.equal(JSON.stringify(a).includes('native-file'),false)
 await h.decide('accept');assert.deepEqual(f.native.messages.find(m=>m.id===0&&m.result),{id:0,result:{decision:'accept'}})
 let resolved=false;void h.result.then(()=>resolved=true,()=>{});f.native.emit({method:'serverRequest/resolved',params:{threadId:'native-thread',requestId:0}});await new Promise(r=>setImmediate(r));assert.equal(resolved,false)
 await writeFile(join(f.root,'a.md'),'new\n');f.native.item('completed')
 const result=await operationResult(h);assert.equal(result.nativeStatus,'completed');assert.equal(result.files[0].matches,true);assert.equal(result.raw,'');f.native.complete();assert.equal(await f.turn,'Tour terminé')
})
for(const decision of ['accept','decline'])for(const raw of ['absent','exec-array','correlated'])test('reçu fileChange et octets sans dépendre du raw : '+decision+' / '+raw,async t=>{
 const f=await setup(t),{h}=await f.ready;await h.decide(decision)
 const diagnostic='Diagnostic réellement reçu, sans preuve d’effet autonome.'
 if(raw!=='absent')f.native.emit({method:'rawResponseItem/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{type:'custom_tool_call_output',call_id:raw==='correlated'?'native-file':'exec-parent',output:raw==='correlated'?diagnostic:[{type:'input_text',text:decision==='accept'?'Script completed':'Script failed: patch rejected by user'}]}}})
 if(decision==='accept')await writeFile(join(f.root,'a.md'),'new\n')
 f.native.item(decision==='accept'?'completed':'declined');const result=await operationResult(h);assert.equal(result.nativeStatus,decision==='accept'?'completed':'declined');assert.equal(result.files[0].matches,true);assert.equal(result.raw,raw==='correlated'?diagnostic:'');f.native.complete();await f.turn
})
for(const mode of ['raw-only','wrong-item','wrong-thread','wrong-turn','status-mismatch','decline-completed','effects-mismatch'])test('aucun reçu depuis raw seul ou résultat non corrélé/cohérent : '+mode,async t=>{
 const f=await setup(t),{h}=await f.ready;await h.decide(mode==='decline-completed'?'decline':'accept');const refused=assert.rejects(h.result),failed=assert.rejects(f.turn)
 if(!['effects-mismatch','decline-completed'].includes(mode))await writeFile(join(f.root,'a.md'),'new\n')
 f.native.emit({method:'rawResponseItem/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{type:'custom_tool_call_output',call_id:'native-file',output:'Exit code: 0\nSuccess. Updated the following files:\nM '+join(f.root,'a.md').replaceAll('\\','/')+'\n'}}})
 if(mode!=='raw-only')f.native.emit({method:'item/completed',params:{threadId:mode==='wrong-thread'?'foreign-thread':'native-thread',turnId:mode==='wrong-turn'?'foreign-turn':'native-turn',item:{type:'fileChange',id:mode==='wrong-item'?'foreign-file':'native-file',changes:f.native.changes,status:mode==='status-mismatch'?'declined':'completed'}}})
 f.native.complete();await refused;await failed
})
test('fileChange et octets ne règlent pas l’opération avant confirmation de transmission de la décision',async t=>{
 const f=await setup(t),{h}=await f.ready,original=f.rpc.responseWritten.bind(f.rpc);let release
 const held=new Promise(r=>release=r);f.rpc.responseWritten=id=>Promise.all([original(id),held]).then(()=>{})
 const sending=h.decide('accept');while(!f.native.messages.some(m=>m.id===0&&m.result))await new Promise(r=>setImmediate(r))
 let received=false;void h.result.then(()=>received=true,()=>{});await writeFile(join(f.root,'a.md'),'new\n');f.native.item('completed');await new Promise(r=>setImmediate(r));assert.equal(received,false)
 release();await sending;assert.equal((await operationResult(h)).files[0].matches,true);f.native.complete();await f.turn
})
test('le terminal sans confirmation de transmission garde le résultat inconnu même avec fileChange',async t=>{
 const f=await setup(t),{h}=await f.ready,original=f.rpc.responseWritten.bind(f.rpc);let release
 const held=new Promise(r=>release=r);f.rpc.responseWritten=id=>Promise.all([original(id),held]).then(()=>{})
 const sending=h.decide('accept');void sending.catch(()=>{})
 try{
  while(!f.native.messages.some(m=>m.id===0&&m.result))await new Promise(r=>setImmediate(r))
  const refused=assert.rejects(h.result,{code:'EFFECT_UNKNOWN'}),failed=assert.rejects(f.turn,{code:'EFFECT_UNKNOWN'})
  await writeFile(join(f.root,'a.md'),'new\n');f.native.item('completed');f.native.complete();await Promise.all([refused,failed])
 }finally{release();await Promise.allSettled([sending,h.result,f.turn])}
})
for(const cancel of [false,true])test(cancel?'l’arrêt annule l’attente du reçu déjà natif pendant sa relecture':'le terminal joint le reçu natif déjà transmis pendant sa relecture',async t=>{
 const f=await setup(t),{h}=await f.ready,originalWritten=f.rpc.responseWritten.bind(f.rpc),io=process.getBuiltinModule('fs/promises'),originalRead=io.readFile;let releaseWritten,releaseRead,enteredRead
 const writtenHeld=new Promise(r=>releaseWritten=r),readHeld=new Promise(r=>releaseRead=r),readEntered=new Promise(r=>enteredRead=r)
 f.rpc.responseWritten=id=>Promise.all([originalWritten(id),writtenHeld]).then(()=>{})
 const sending=h.decide('accept');void sending.catch(()=>{});void h.result.catch(()=>{})
 try{
  while(!f.native.messages.some(m=>m.id===0&&m.result))await new Promise(r=>setImmediate(r))
  await writeFile(join(f.root,'a.md'),'new\n');f.native.item('completed');await new Promise(r=>setImmediate(r))
  // Le vrai readFile lit les octets, puis sa résolution est retenue : reproduit
  // la relecture lancée par decide pendant que la boucle peut lire le terminal.
  io.readFile=async function(path,...args){const bytes=await Reflect.apply(originalRead,this,[path,...args]);if(String(path)===join(f.root,'a.md')){enteredRead();await readHeld}return bytes};syncBuiltinESMExports()
  releaseWritten();let timer;try{await Promise.race([readEntered,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('READ_INTERCEPTION_NOT_REACHED')),1000))])}finally{clearTimeout(timer)}
  f.native.complete();await new Promise(r=>setImmediate(r))
  if(cancel){
   f.controller.abort();let timer;try{await Promise.race([Promise.all([assert.rejects(f.turn,{code:'CANCELLED'}),assert.rejects(h.result,{code:'CANCELLED'}),h.invalidated]),new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('TERMINAL_RECEIPT_WAIT_NOT_CANCELLED')),1000))])}finally{clearTimeout(timer)}
   releaseRead();await assert.rejects(sending,{code:'CANCELLED'})
  }else{
   releaseRead();const [,result,text]=await Promise.all([sending,h.result,f.turn]);assert.equal(result.nativeStatus,'completed');assert.equal(result.files[0].matches,true);assert.equal(text,'Tour terminé')
  }
 }finally{io.readFile=originalRead;syncBuiltinESMExports();releaseWritten();releaseRead();await Promise.allSettled([sending,h.result,f.turn])}
})
for(const mode of ['read-only','grant','changed','terminal','string-id'])test('bornes natives et aucune autorisation tardive : '+mode,async t=>{
 const f=await setup(t,{mode:mode==='read-only'?'read-only':undefined,grant:mode==='grant'?'C:/':undefined,stringId:mode==='string-id'})
 if(mode==='read-only'||mode==='grant'){await assert.rejects(f.turn);assert.equal(f.native.messages.some(m=>(m.id===0||m.id==='0')&&m.result),false);return}
 const {h}=await f.ready
 if(mode==='changed'){await writeFile(join(f.root,'a.md'),'external\n');await assert.rejects(h.decide('accept'));await assert.rejects(f.turn)}
 if(mode==='terminal'){f.native.complete();await h.invalidated;await assert.rejects(h.decide('accept'));await assert.rejects(f.turn)}
 if(mode==='string-id'){await h.decide('decline');assert.deepEqual(f.native.messages.find(m=>m.id==='0'&&m.result),{id:'0',result:{decision:'decline'}});f.native.item('declined');f.native.emit({method:'rawResponseItem/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{type:'custom_tool_call_output',call_id:'native-file',output:'patch rejected by user'}}});assert.equal((await h.result).files[0].matches,true);f.native.complete();await f.turn}
 assert.equal(await readFile(join(f.root,'a.md'),'utf8'),mode==='changed'?'external\n':'old\n')
})
test('une proposition native changée après affichage retire le consentement sans effet',async t=>{
 const f=await setup(t),{h}=await f.ready;f.native.item('inProgress',[{...f.native.changes[0],diff:'@@ -1 +1 @@\n-old\n+other\n'}]);await h.invalidated;await assert.rejects(h.decide('accept'));await assert.rejects(f.turn);assert.equal(f.native.messages.some(m=>m.id===0&&m.result),false)
})
test('le délai local dix minutes retire une commande sans choix implicite (horloge contrôlée)',async t=>{
 t.mock.timers.enable({apis:['Date','setTimeout'],now:Date.now()})
 const f=await setup(t),{h}=await f.ready;t.mock.timers.tick(600001)
 await h.invalidated;await assert.rejects(h.decide('accept'));await assert.rejects(f.turn);assert.equal(f.native.messages.some(m=>m.id===0&&m.result),false)
 t.mock.timers.reset()
})
test('deux patches rapprochés du même fichier demandent deux choix sans étendre le premier accord',async t=>{
 const f=await setup(t),first=await f.ready;await first.h.decide('accept');await writeFile(join(f.root,'a.md'),'new\n')
 const next=f.nextOffer(),changes=[{path:join(f.root,'a.md'),kind:{type:'update',move_path:null},diff:'@@ -1 +1 @@\n-new\n+forbidden\n'}]
 f.native.child.stdout.write([
  {method:'item/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{id:'native-file',type:'fileChange',changes:f.native.changes,status:'completed'}}},
  {method:'rawResponseItem/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{type:'custom_tool_call_output',call_id:'native-file',output:'Exit code: 0\nSuccess. Updated the following files:\nM '+join(f.root,'a.md').replaceAll('\\','/')+'\n'}}},
  {method:'item/started',params:{threadId:'native-thread',turnId:'native-turn',item:{id:'native-file-2',type:'fileChange',changes,status:'inProgress'}}},
  {id:1,method:'item/fileChange/requestApproval',params:{threadId:'native-thread',turnId:'native-turn',itemId:'native-file-2',startedAtMs:Date.now(),reason:null,grantRoot:null}}
 ].map(v=>JSON.stringify(v)+'\n').join(''))
 const second=await Promise.race([next,f.turn.then(()=>null,()=>null)]);assert.ok(second,'Une nouvelle demande propre au deuxième patch est attendue')
 assert.equal(f.offers.length,2);await second.h.decide('decline')
 f.native.emit({method:'item/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{id:'native-file-2',type:'fileChange',changes,status:'declined'}}})
 f.native.emit({method:'rawResponseItem/completed',params:{threadId:'native-thread',turnId:'native-turn',item:{type:'custom_tool_call_output',call_id:'native-file-2',output:'patch rejected by user'}}})
 assert.equal((await second.h.result).files[0].matches,true);assert.equal(await readFile(join(f.root,'a.md'),'utf8'),'new\n');assert.deepEqual(f.native.messages.filter(m=>m.result?.decision).map(m=>[m.id,m.result.decision]),[[0,'accept'],[1,'decline']]);f.native.complete();await f.turn
})
test('le terminal retire l’approbation encore en file derrière un outil avant le drain',async t=>{
 let entered,release,retired;const configEntered=new Promise(r=>entered=r),held=new Promise(r=>release=r),terminalRead=new Promise(r=>retired=r)
 const f=await setup(t,{noAutoApproval:true,secondTurnSilent:true,timeout:80,resolve:async kind=>{if(kind==='config'){entered();await held}return '{}'}})
 const original=f.rpc.retireQuestions.bind(f.rpc);f.rpc.retireQuestions=(...args)=>{original(...args);retired()}
 try{await configEntered;f.native.item();f.native.request();f.native.complete();await terminalRead;release();assert.equal(await f.turn,'Tour terminé');assert.equal(f.offers.length,0);assert.equal(f.native.messages.some(m=>m.id===0&&(m.result||m.error)),false);assert.equal(await readFile(join(f.root,'a.md'),'utf8'),'old\n')
  let timeout;const following=f.session.turn('Tour suivant sans notification',async()=>{});await assert.rejects(Promise.race([following,new Promise((_,reject)=>timeout=setTimeout(()=>reject(Error('machine-timeout-not-armed')),300))]),{code:'PROVIDER_FAILED'});clearTimeout(timeout)
 }finally{release()}
})

test('F6 real Windows BMad mutation at approval decision is refused by the pinned native freshness guard',async t=>{
 const {BmadHelpAdapter}=await import('../src/adapters/bmad/help.ts'),{HelpOwnedRun}=await import('../src/adapters/bmad/help-owned-run.ts'),{mkdir}=await import('node:fs/promises'),{resolve}=await import('node:path');let adapter,bundle,armed=false
 const proof=process.env.MADNESS_REFRESH_DECISION_PROOF
 if(proof){await mkdir(join(proof,'producer'),{recursive:true});for(const file of ['tests/approvals-protocol.test.mjs','src/adapters/bmad/help.ts','src/adapters/bmad/help-manifest.ts','src/adapters/bmad/change-observer.ts','resources/bmad-help/capture.py','resources/bmad-help/worker.py']){const target=join(proof,'producer',file);await mkdir((await import('node:path')).dirname(target),{recursive:true});await writeFile(target,await readFile(file),{flag:'wx'})}await writeFile(join(proof,'started.json'),JSON.stringify({startedAt:new Date().toISOString(),node:process.versions,source:'producer',provider:'synthetic RPC; actual pinned local helper'}))}
 const cleanups=[];const f=await setup({after:fn=>cleanups.push(fn)},{timeout:120000,assertContext:async()=>{if(armed)await adapter.assertFresh(bundle.id,f.controller.signal,true)}})
 t.after(async()=>{const stopped=adapter?await adapter.shutdown():'stopped';if(proof){const fs=await import('node:fs/promises');await writeFile(join(proof,'stop.json'),JSON.stringify({stopped,completedAt:new Date().toISOString()}));for(const name of await fs.readdir(join(f.root,'helper-operations')).catch(()=>[])){if(!name.startsWith('operation-'))continue;const destination=join(proof,name);await mkdir(destination,{recursive:true});for(const file of ['execution.json','terminal.json','stdout.json','request.json','pins.json','native-timings.json']){const bytes=await readFile(join(f.root,'helper-operations',name,file)).catch(()=>null);if(bytes)await writeFile(join(destination,file),bytes)}}}if(stopped!=='stopped'){console.error(JSON.stringify({retainedF6Fixture:f.root,reason:'native helper stop unknown'}));f.controller.abort();f.rpc.dispose();throw Error('native helper stop unknown; fixture retained')}for(const cleanup of cleanups.reverse())await cleanup()})
 const project=f.root,skills=join(project,'.agents/skills');await mkdir(join(project,'_bmad'),{recursive:true});await mkdir(join(skills,'bmod-test/help'),{recursive:true});await mkdir(join(skills,'bmad/references'),{recursive:true})
 await writeFile(join(project,'_bmad/config.toml'),'[core]\n');await writeFile(join(skills,'bmod-test/bmod.toml'),'[bmod]\ncode="test"\nversion="6.13.0-next"\nskills=["bmad"]\n');await writeFile(join(skills,'bmod-test/help/help.md'),'Native decision guard help.\n');await writeFile(join(skills,'bmad/bmod.toml'),'[skill]\nbmod="bmod-test"\n');for(const [name,target]of[['bmad-SKILL.md','bmad/SKILL.md'],['bmad-help.md','bmad/references/help.md']])await writeFile(join(skills,target),await readFile(join('resources/bmad-help',name)))
 const owner=new HelpOwnedRun(join(project,'helper-owner.json'));adapter=new BmadHelpAdapter({root:join(project,'helper-operations'),resources:resolve('resources/bmad-help'),owner,roots:()=>[skills]})
 bundle=await adapter.prepare('project-f6',project,f.controller.signal);assert.equal(bundle.nativeReady,true);const {h}=await f.ready;armed=true;await writeFile(join(project,'_bmad/config.toml'),'[core]\noutput_folder="{project-root}/external-change"\n')
 await assert.rejects(h.decide('accept'),e=>e.code==='PROFILE_CHANGED');await assert.rejects(f.turn);assert.equal(f.native.messages.some(message=>message.id===0&&message.result?.decision==='accept'),false);assert.equal(await readFile(join(project,'a.md'),'utf8'),'old\n');assert.equal(await owner.status(),'stopped')
})
