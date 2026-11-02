import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink,realpath,copyFile,readdir} from 'node:fs/promises'
import {spawn,spawnSync} from 'node:child_process'
import {once} from 'node:events'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {claimOutput,inside,verifyArtifact,benchOutput,readBenchResult,publicFailure,personalEnvironment,assertClosed,archiveWitnessData,assertProfileClosed} from '../scripts/qualification/epic-one-support.mjs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {PassThrough,Writable} from 'node:stream'
import {EventEmitter} from 'node:events'
import {createContext,runInContext} from 'node:vm'
import {StringDecoder} from 'node:string_decoder'
import {isDeepStrictEqual} from 'node:util'
import {releaseVersion} from '../src/adapters/release-version.ts'
import {defaultManifest} from '../scripts/qualification/epic-one-provenance.mjs'
const hash=b=>createHash('sha256').update(b).digest('hex')
async function fixture(t){const root=await realpath(await mkdtemp(join(tmpdir(),'madness-epic-one-test-')));t.after(()=>rm(root,{recursive:true,force:true}));return root}

test('une sortie neuve refuse la reprise et conserve le reçu de la tentative précédente',async t=>{
 const root=await fixture(t),output=join(root,'run');await claimOutput(output);await writeFile(join(output,'report.json'),'échec conservé')
 await assert.rejects(claimOutput(output),/OUTPUT_ALREADY_EXISTS/);assert.equal(await readFile(join(output,'report.json'),'utf8'),'échec conservé')
})
test('le choix explicite du banc ne peut écraser une sortie existante ; le défaut historique reste inchangé',async t=>{
 const root=await fixture(t);assert.equal(await benchOutput(root,[]),root)
 const output=join(root,'new');assert.equal(await benchOutput(root,['--output='+output]),output)
 await assert.rejects(benchOutput(root,['--output='+output]),/OUTPUT_ALREADY_EXISTS/)
 await assert.rejects(benchOutput(root,['--output=a','--output=b']),/DUPLICATE_OUTPUT/)
})
test('la garde de chemin refuse racine, voisin et traversée',async t=>{
 const root=await fixture(t);assert.equal(inside(root,join(root,'child')),join(root,'child'))
 for(const path of [root,join(root,'..','other'),root+'-neighbor'])assert.throws(()=>inside(root,path),/PATH_OUTSIDE_OWNER/)
})
test('la garde refuse un parent symbolique de sortie',async t=>{
 const root=await fixture(t),target=join(root,'target'),link=join(root,'link');await mkdir(target);await symlink(target,link,'junction')
 await assert.rejects(claimOutput(join(link,'run')),/SYMLINK_REFUSED/)
})
test('un paquet hybride est refusé même si la version et ASAR semblent corrects',async t=>{
 const root=await fixture(t),resources=join(root,'resources');await mkdir(resources)
 const executable=join(root,'Madness.exe');await writeFile(executable,'exe');await writeFile(join(resources,'app.asar'),'asar');await writeFile(join(resources,'bmad-script-runner.py'),'runner')
 const manifest=join(root,'manifest.json'),value={version:releaseVersion,identity:{name:'madness',appId:'fr.madness.desktop',productName:'Madness',executableName:'Madness'},versions:{electron:'45.0.0'},artifacts:[{path:'win-unpacked/resources/app.asar',sha256:hash('asar')},{path:'win-unpacked/resources/bmad-script-runner.py',sha256:hash('runner')}]}
 await writeFile(manifest,JSON.stringify(value));assert.equal((await verifyArtifact(executable,manifest)).asarSha256,hash('asar'))
 for(const version of ['0.1.1','999.0.0',releaseVersion+'-other',undefined]){
  await writeFile(manifest,JSON.stringify({...value,version}));await assert.rejects(verifyArtifact(executable,manifest),/VERSION_MISMATCH/)
 }
 await writeFile(manifest,JSON.stringify({...value,identity:{...value.identity,productName:'Other'}}));await assert.rejects(verifyArtifact(executable,manifest),/IDENTITY_MISMATCH/)
 await writeFile(manifest,JSON.stringify(value));await writeFile(join(resources,'app.asar'),'other');await assert.rejects(verifyArtifact(executable,manifest),/ASAR_MISMATCH/)
 await writeFile(join(resources,'app.asar'),'asar')
 await writeFile(join(resources,'bmad-script-runner.py'),'other');await assert.rejects(verifyArtifact(executable,manifest),/RUNNER_MISMATCH/)
})
test('le manifeste par défaut est le final 1.13 ; le manifeste 1.9 reste historique',async()=>{
 assert.equal(defaultManifest,fileURLToPath(new URL('../_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-forge-session-check/installation-final/release-manifest.json',import.meta.url)))
 const manifest=JSON.parse(await readFile(defaultManifest,'utf8'))
 assert.equal(manifest.version,'0.1.2') // Preuve historique 1.13, distincte du candidat courant.
 assert.equal(manifest.artifacts.find(a=>a.path==='win-unpacked/resources/app.asar').sha256,'9249bdc081c2b3ceeae4465fcc7a3c53af5dca325889cae8fa0b118479f974b4')
 const historical=JSON.parse(await readFile(new URL('../_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-maintenance/release-manifest.json',import.meta.url),'utf8'))
 assert.equal(historical.version,'0.1.1');assert.equal(historical.artifacts.find(a=>a.path==='win-unpacked/resources/app.asar').sha256,'bbac088b9dd9a6c3ad66871dc2db27956378f3a29967df2a734b1e14d007b639')
})
test('le reçu de banc exige source reconnue, code de sortie, nettoyage et succès propres',()=>{
 const receipt={status:'passed',cleanup:true,checks:['a'],runtime:{electron:'45.0.0'},limits:['simulation']}
 assert.equal(readBenchResult('synthetic',receipt,0).status,'passed')
 for(const bad of [{...receipt,cleanup:false},{...receipt,status:'partial'},{...receipt,failure:'erreur'}])assert.equal(readBenchResult('synthetic',bad,0).status,'failed')
 assert.equal(readBenchResult('loopback',receipt,1).status,'failed')
 assert.throws(()=>readBenchResult('personal',receipt,0),/BENCH_SOURCE_REFUSED/)
})
test('les erreurs publiées excluent texte brut, chemin privé, bearer et stderr',()=>{
 const error=Object.assign(new Error('Bearer private-token C:/private/user'),{code:'EACCES',stderr:'secret'})
 assert.deepEqual(publicFailure(error),{code:'FILESYSTEM_BOUNDARY'})
 assert.deepEqual(publicFailure(new Error('Bearer secret')),{code:'CONTROLLER_FAILED'})
 assert.deepEqual(publicFailure(new Error('PRIVATE_UPPERCASE_SECRET')),{code:'CONTROLLER_FAILED'})
})
test('le mode personnel garde AppData et proxy usuels mais refuse déplacement ou affaiblissement TLS',()=>{
 const normal={APPDATA:'C:/normal',LOCALAPPDATA:'C:/local',HTTPS_PROXY:'http://proxy',PATH:'path',ACCESS_TOKEN:'secret',UNRELATED:'private'}
 assert.deepEqual(personalEnvironment(normal),{APPDATA:'C:/normal',LOCALAPPDATA:'C:/local',HTTPS_PROXY:'http://proxy',PATH:'path'})
 for(const extra of [{MADNESS_DATA_HOME:'x'},{NODE_TLS_REJECT_UNAUTHORIZED:'0'},{NODE_OPTIONS:'--tls-cipher-list=ALL'}])assert.throws(()=>personalEnvironment({...normal,...extra}),/UNSAFE_PERSONAL_ENVIRONMENT/)
})
test('un wrapper sorti ne prouve jamais la fermeture du vrai Main ni de son enfant',()=>{
 assert.throws(()=>assertClosed({mainGone:false,childrenGone:true,closeObserved:true}),/OWNED_CLOSE_UNCONFIRMED/)
 assert.throws(()=>assertClosed({mainGone:true,childrenGone:false,closeObserved:true}),/OWNED_CLOSE_UNCONFIRMED/)
 assert.throws(()=>assertClosed({mainGone:true,childrenGone:true,closeObserved:false}),/OWNED_CLOSE_UNCONFIRMED/)
 assert.doesNotThrow(()=>assertClosed({mainGone:true,childrenGone:true,closeObserved:true}))
})
test('les modules permanents sont importables et une action personnelle absente refuse avant accès',async()=>{
 const {runPersonal}=await import('../scripts/qualification/epic-one-personal.mjs')
 await assert.rejects(runPersonal({}),/EXPLICIT_PERSONAL_ACTION_REQUIRED/)
 await assert.rejects(runPersonal({action:'forge-diagnostic',archive:true}),/DIAGNOSTIC_ARCHIVE_REFUSED/)
 const {main}=await import('../scripts/qualification/epic-one.mjs')
 await assert.rejects(main(['--mode=unknown']),/MODE_REFUSED/)
})
test('la vraie CLI personnelle refuse un exécutable absent sans cycle TLA ni accès au profil', {timeout:15000},async t=>{
 const root=await fixture(t),entry=fileURLToPath(new URL('../scripts/qualification/epic-one.mjs',import.meta.url))
 const allowed=['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP'],env=Object.fromEntries(Object.entries(process.env).filter(([key])=>allowed.includes(key.toUpperCase())))
 for(const action of ['preflight','forge-diagnostic']){
 const output=join(root,'cli-run-'+action),result=spawnSync(process.execPath,[entry,'--mode=personal','--action='+action,'--executable='+join(root,'missing-Madness.exe'),'--output='+output],{windowsHide:true,encoding:'utf8',timeout:10000,env:{...env,APPDATA:join(root,'appdata'),LOCALAPPDATA:join(root,'localappdata'),USERPROFILE:root}})
 assert.equal(result.error,undefined);assert.equal(result.status,1)
 assert.doesNotMatch(result.stderr,/unsettled|top-level await/i)
 assert.deepEqual(JSON.parse(result.stdout.trim()),{status:'failed-no-replay',source:'personal-siwc-existing-account',failure:{code:'FILESYSTEM_BOUNDARY'}})
 const report=JSON.parse(await readFile(join(output,'report.json'),'utf8'));assert.deepEqual(report.checks,[]);assert.deepEqual(report.failure,{code:'FILESYSTEM_BOUNDARY'});assert.equal(report.runtime,undefined);assert.equal(report.accountReadable,undefined)
 }
 assert.deepEqual((await readdir(root)).sort(),['cli-run-forge-diagnostic','cli-run-preflight'])
})
async function controlFixture(t,options={}){
 const {installControlTraceRuntime}=await import('../scripts/qualification/epic-one-control-trace.mjs')
 assert.equal(installControlTraceRuntime(null,{manifestPaths:['_bmad/scripts/resolve_config.py','.agents/skills/bmad-forge-idea/SKILL.md'],...options}),true)
 const runtime=globalThis.__epicOneControlTrace,child={stdout:new PassThrough(),stdin:new PassThrough()};runtime.attach(child,1)
 t.after(()=>{runtime.restore();delete globalThis.__epicOneControlTrace;child.stdout.destroy();child.stdin.destroy()})
 return {runtime,child}
}
test('la trace de contrôle expurge prompts, arguments, chemins, identifiants et refus arbitraires',async t=>{
 const {runtime,child}=await controlFixture(t),send=value=>child.stdout.write(JSON.stringify(value)+'\n')
 const params={threadId:'private-thread-BEARER',turnId:'private-turn-PROMPT',tool:'bmad_read_file',arguments:JSON.stringify({path:'C:/PRIVATE/WITNESS/_bmad-output/initiative/forge-*/.memlog.md',token:'Bearer NEVER_EXPORT'})}
 send({id:'private-rpc',method:'item/tool/call',params})
 send({id:2,method:'item/tool/call',params:{...params,tool:'bmad_forge_resolve',arguments:JSON.stringify({kind:'personas',prompt:'NEVER_EXPORT'})}})
 send({id:3,method:'PRIVATE_METHOD_NEVER_EXPORT',params:{...params,tool:'PRIVATE_TOOL_NEVER_EXPORT',arguments:{path:'C:/PRIVATE/config-secret.txt'}}})
 send({id:4,method:'item/tool/call',params:{...params,arguments:{path:'C:/PRIVATE/.agents/skills/bmad-forge-idea/SKILL.md'}}})
 send({id:5,method:'item/tool/call',params:{...params,arguments:{path:'C:/PRIVATE/_bmad/config.toml'}}})
 child.stdin.write(JSON.stringify({id:'private-rpc',error:{code:-32601,message:'UNSUPPORTED_INTERACTION',data:'NEVER_EXPORT'}})+'\n')
 child.stdin.write(JSON.stringify({id:'private-rpc',result:{text:'NEVER_EXPORT'}})+'\n')
 child.stdin.write(JSON.stringify({id:2,error:{code:777,message:'PRIVATE_REFUSAL_NEVER_EXPORT'}})+'\n')
 for(let i=0;i<100;i++)send({method:'item/agentMessage/delta',params:{...params,delta:'NEVER_EXPORT'}})
 for(let i=0;i<100;i++)send({method:'item/reasoning/summaryTextDelta',params:{...params,delta:'NEVER_EXPORT'}})
 const trace=runtime.read(),serialized=JSON.stringify(trace)
 assert.equal(trace.complete,true);assert.equal(trace.events.length,7);assert.equal(trace.suppressedDeltas,200)
 assert.equal(trace.events[0].pathCategory,'resume-glob');assert.equal(trace.events[0].tool,'bmad_read_file');assert.equal(trace.events[0].flags.extraArgumentKeys,true)
 assert.equal(trace.events[1].kind,'personas');assert.equal(trace.events[2].method,'other');assert.equal(trace.events[2].tool,'other')
 assert.equal(trace.events[3].pathCategory,'manifest');assert.equal(trace.events[4].pathCategory,'config')
 assert.deepEqual(trace.events[5],{sequence:6,child:1,direction:'stdin',type:'refusal',rpcRef:trace.events[0].rpcRef,rpcCode:-32601,refusalCode:'UNSUPPORTED_INTERACTION'})
 assert.equal(trace.events[6].rpcCode,'other');assert.equal(trace.events[6].refusalCode,'other')
 assert.doesNotMatch(serialized,/PRIVATE|NEVER_EXPORT|BEARER|PROMPT|private-rpc|forge-\*|\.memlog|C:\//)
})
test('la trace reconnaît la recherche Forge sans argument et expurge les clés imprévues',async t=>{
 const {runtime,child}=await controlFixture(t)
 for(const args of [{},'{}',{private:'NEVER_EXPORT'}])child.stdout.write(JSON.stringify({id:'PRIVATE_RPC',method:'item/tool/call',params:{tool:'bmad_forge_check_sessions',arguments:args}})+'\n')
 const trace=runtime.read();assert.equal(trace.complete,true)
 for(const event of trace.events){assert.equal(event.tool,'bmad_forge_check_sessions');assert.equal(event.flags.argumentsObject,true)}
 assert.deepEqual(trace.events.map(e=>e.flags.extraArgumentKeys),[false,false,true])
 assert.doesNotMatch(JSON.stringify(trace),/NEVER_EXPORT|PRIVATE_RPC/)
})
test('les opérations Forge conservent check-sessions et expurgent les valeurs inconnues',async()=>{
 const {observedForgeOperations}=await import('../scripts/qualification/epic-one-control-trace.mjs')
 assert.deepEqual(observedForgeOperations([{operation:'resolve-workflow'},{operation:'resolve-config'},{operation:'check-sessions'},{operation:'resolve-personas'},{operation:'PRIVATE_OPERATION'},{operation:'write'}]),['resolve-workflow','resolve-config','check-sessions','resolve-personas','other','write'])
})
test('plusieurs centaines de contrôles restent complets sans contenu privé avant le plafond 2048',async t=>{
 const {runtime,child}=await controlFixture(t),received=[];child.stdout.on('data',chunk=>received.push(chunk))
 const line=JSON.stringify({id:'PRIVATE_RPC',method:'item/tool/call',params:{threadId:'PRIVATE_THREAD',turnId:'PRIVATE_TURN',tool:'bmad_forge_check_sessions',arguments:{private:'NEVER_EXPORT',path:'C:/PRIVATE/location'}}})+'\n'
 for(let i=0;i<600;i++)child.stdout.write(line)
 const trace=runtime.read();assert.equal(trace.complete,true);assert.equal(trace.limits.maxEvents,2048);assert.equal(trace.events.length,600);assert.equal(trace.droppedEvents,0)
 assert.equal(trace.limits.maxLineBytes,1048576);assert.equal(trace.limits.maxBytes,8388608)
 assert.doesNotMatch(JSON.stringify(trace),/NEVER_EXPORT|PRIVATE|C:\//);assert.equal(Buffer.concat(received).toString(),line.repeat(600))
})
test('dépasser 2048 contrôles signale l’incomplétude et conserve tout le flux natif',async t=>{
 const {runtime,child}=await controlFixture(t),received=[];child.stdout.on('data',chunk=>received.push(chunk))
 const line=JSON.stringify({id:'PRIVATE_RPC',method:'item/tool/call',params:{tool:'bmad_forge_check_sessions',arguments:{private:'NEVER_EXPORT'}}})+'\n'
 for(let i=0;i<2049;i++)child.stdout.write(line)
 const trace=runtime.read();assert.equal(trace.complete,false);assert.equal(trace.incomplete.eventLimit,true);assert.equal(trace.events.length,2048);assert.equal(trace.droppedEvents,1)
 assert.doesNotMatch(JSON.stringify(trace),/NEVER_EXPORT|PRIVATE_RPC/);assert.equal(Buffer.concat(received).toString(),line.repeat(2049))
})
test('l’observation conserve les octets, le retour de backpressure et le callback stdin',async t=>{
 const {runtime,child}=await controlFixture(t);runtime.restore();let release,callbacks=0,written
 const stdin=new Writable({highWaterMark:1,write(chunk,_encoding,callback){written=Buffer.from(chunk);release=callback}}),stdout=new PassThrough(),originalWrite=stdin.write
 runtime.attach({stdin,stdout},2);t.after(()=>{stdin.destroy();stdout.destroy()})
 const raw=Buffer.from(JSON.stringify({id:7,error:{code:-32601,message:'UNSUPPORTED_INTERACTION'}})+'\n'),received=[];stdout.on('data',chunk=>received.push(chunk))
 const returned=stdin.write(raw,()=>{callbacks++});assert.equal(returned,false);assert.equal(callbacks,0);assert.deepEqual(written,raw)
 const inbound=Buffer.from('{"id":1,"method":"item/tool/call","params":{"tool":"bmad_read_file","arguments":{"path":"été"}}}\n')
 for(const chunk of [inbound.subarray(0,74),inbound.subarray(74,75),inbound.subarray(75)])stdout.write(chunk)
 assert.deepEqual(Buffer.concat(received),inbound)
 release();await new Promise(r=>setImmediate(r));assert.equal(callbacks,1)
 runtime.restore();assert.equal(stdin.write,originalWrite)
 const sentinel=Error('private-original-write-error'),throwing={write(){throw sentinel}},other=new PassThrough();t.after(()=>other.destroy());runtime.attach({stdin:throwing,stdout:other},3)
 assert.throws(()=>throwing.write(raw),error=>error===sentinel)
})
test('un plafond ou une ligne perdue laisse une trace explicitement incomplète sans couper le flux',async t=>{
 const {runtime,child}=await controlFixture(t,{maxEvents:2,maxLineBytes:128,maxBytes:2048}),received=[];child.stdout.on('data',chunk=>received.push(chunk))
 const lines=Array.from({length:3},(_,id)=>JSON.stringify({id,method:'item/tool/call',params:{tool:'bmad_unsupported'}})+'\n')
 for(const line of lines)child.stdout.write(line)
 const oversized=JSON.stringify({method:'other',params:{private:'x'.repeat(256)}})+'\n';child.stdout.write(oversized)
 const trace=runtime.read();assert.equal(trace.complete,false);assert.equal(trace.events.length,2);assert.equal(trace.droppedEvents,1);assert.equal(trace.limits.maxEvents,2);assert.equal(trace.incomplete.lineLimit,true)
 assert.equal(Buffer.concat(received).toString('utf8'),lines.join('')+oversized)
})
test('budget d’octets et ligne partielle interdisent une trace complète sans masquer les octets transmis',async t=>{
 const {runtime,child}=await controlFixture(t,{maxBytes:64,maxLineBytes:512}),raw='x'.repeat(100)
 child.stdout.write('{"method":"error"');child.stdin.write(raw);assert.equal(child.stdin.read().toString(),raw);runtime.restore()
 const trace=runtime.read();assert.equal(trace.complete,false);assert.equal(trace.incomplete.byteLimit,true);assert.equal(trace.incomplete.partialLine,true);assert.deepEqual(trace.events,[])
})
test('le hook sérialisé comme dans Playwright transmet spawn inchangé et persiste uniquement les métadonnées',async t=>{
 const {installPassiveObservation}=await import('../scripts/qualification/epic-one-personal.mjs'),writes=[],calls=[]
 const child=Object.assign(new EventEmitter(),{pid:777,stdout:new PassThrough(),stdin:new PassThrough()});t.after(()=>{child.stdout.destroy();child.stdin.destroy()})
 const original=function(){calls.push({receiver:this,args:[...arguments]});return child},cp={spawn:original},fs={readFileSync:()=>Buffer.from('runner'),writeFileSync:(path,bytes)=>{assert.equal(path,'C:/synthetic/events.json');writes.push(bytes)}}
 const builtins={child_process:cp,module:{syncBuiltinESMExports(){}},fs,crypto:{createHash},util:{isDeepStrictEqual},string_decoder:{StringDecoder}}
 const context=createContext({Buffer,process:{getBuiltinModule:name=>{assert.ok(Object.hasOwn(builtins,name));return builtins[name]}},electron:{session:{defaultSession:{webRequest:{onBeforeRequest(){}}}}}})
 const app={evaluate:async(callback,arg)=>{context.arg=arg;return runInContext('('+callback.toString()+')(electron,arg)',context)}}
 assert.equal(await installPassiveObservation(app,'C:/synthetic/events.json',hash('runner')),true)
 const args=['app-server','--listen','stdio://','-c','model_providers.openai_chatgpt_plan.base_url="https://api.openai.com/v1"','-c','model_providers.openai_chatgpt_plan.wire_api="responses"','-c','model_providers.openai_chatgpt_plan.env_key="ACCESS_TOKEN"'],settings={cwd:'C:/synthetic/dialogue/work',env:{ACCESS_TOKEN:'NEVER_EXPORT'}}
 assert.equal(cp.spawn('C:/synthetic/codex.exe',args,settings),child);assert.equal(calls.length,1);assert.equal(calls[0].receiver,cp);assert.equal(calls[0].args[1],args);assert.equal(calls[0].args[2],settings)
 const message={id:'secret-rpc',method:'item/tool/call',params:{threadId:'secret-thread',turnId:'secret-turn',tool:'bmad_read_file',arguments:JSON.stringify({path:'C:/SECRET/forge-*/.memlog.md',private:'NEVER_EXPORT'})}}
 child.stdout.write(JSON.stringify(message)+'\n');child.stdin.write(JSON.stringify({id:'secret-rpc',error:{code:-32601,message:'UNSUPPORTED_INTERACTION'}})+'\n')
 const beforeDeltas=writes.length
 for(let i=0;i<100;i++)child.stdout.write(JSON.stringify({method:'item/reasoning/summaryTextDelta',params:{threadId:'secret-thread',turnId:'secret-turn',delta:'NEVER_EXPORT'}})+'\n')
 assert.equal(writes.length,beforeDeltas);child.emit('close',0,null)
 const receipt=JSON.parse(writes.at(-1));assert.equal(receipt.children[0].closed,true);assert.equal(receipt.controlTrace.complete,true);assert.equal(receipt.controlTrace.events[0].pathCategory,'resume-glob');assert.equal(receipt.controlTrace.events[1].refusalCode,'UNSUPPORTED_INTERACTION')
 assert.doesNotMatch(writes.join(''),/NEVER_EXPORT|C:\/SECRET|secret-rpc|secret-thread|secret-turn/)
 assert.equal(await app.evaluate(()=>globalThis.__epicOne.restore()),true);assert.equal(cp.spawn,original)
})
test('le contrôle local expiré ne transmet aucune réponse et reste inactif après restauration',async()=>{
 const {qualifyLocalExpiry}=await import('../scripts/qualification/epic-one-edges.mjs')
 const result=await qualifyLocalExpiry()
 assert.equal(result.status,'passed');assert.equal(result.transmitted,0);assert.equal(result.inactiveAfterReopen,true)
})
test('une approbation native corrélée avec effets relus accepte le raw indisponible ; reçu question inchangé',async()=>{
 const {assertApprovalEvidence}=await import('../scripts/qualification/epic-one-personal.mjs')
 const record={transmission:'sent',effect:'succeeded',files:[{path:'C:/witness/a.md',beforeSha256:'b'.repeat(64),afterSha256:'a'.repeat(64)}],result:{nativeStatus:'completed',raw:'',files:[{path:'C:/witness/a.md',sha256:'a'.repeat(64),matches:true}]}},observed={nativeStatus:'completed',rawSha256:null,grantRootAbsent:true}
 assert.equal(assertApprovalEvidence({decision:'accept',record,observed}).raw.status,'unavailable')
 for(const broken of [{...observed,nativeStatus:null},null])assert.throws(()=>assertApprovalEvidence({decision:'accept',record,observed:broken}),/APPROVAL_RESULT_UNPROVEN/)
 for(const broken of [{...record,result:{...record.result,files:[]}},{...record,result:{...record.result,files:[{...record.result.files[0],matches:false}]}},{...record,result:{...record.result,nativeStatus:'failed'}}])assert.throws(()=>assertApprovalEvidence({decision:'accept',record:broken,observed}),/APPROVAL_RESULT_UNPROVEN/)
 const withRaw={...record,result:{...record.result,raw:'résultat natif exact'}}
 assert.equal(assertApprovalEvidence({decision:'accept',record:withRaw,observed:{...observed,rawSha256:hash('résultat natif exact')}}).raw.status,'exact')
 assert.throws(()=>assertApprovalEvidence({decision:'accept',record:withRaw,observed}),/APPROVAL_RAW_MISMATCH/)
})
test('Windows détecte une autre copie Madness avant toute lecture ou mutation du profil', {timeout:20000},async()=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-epic-one-other-copy-')));let child,closed
 try{
  const executable=join(root,'Madness.exe'),profile=join(root,'profile'),witness=join(root,'witness');await copyFile(process.execPath,executable);await mkdir(profile);await mkdir(witness)
  await writeFile(join(profile,'madness-state-v1.json'),'octets intacts, volontairement non JSON')
  child=spawn(executable,['-e','process.stdout.write("ready");setInterval(()=>{},1000)'],{windowsHide:true,stdio:['ignore','pipe','ignore']});closed=once(child,'close')
  await once(child.stdout,'data')
  await assert.rejects(archiveWitnessData({profile,witness,projectId:'own',closed:true,reopened:true,assertNoApp:()=>assertProfileClosed()}),/POSSIBLE_PROFILE_OWNER/)
  assert.equal(await readFile(join(profile,'madness-state-v1.json'),'utf8'),'octets intacts, volontairement non JSON')
 }finally{if(child){child.kill();await closed}await rm(root,{recursive:true,force:true})}
})
test('archivage fermé enlève uniquement les données du témoin ; aucun coffre ni dossier projet copié',async t=>{
 const root=await fixture(t),profile=join(root,'profile'),witness=join(root,'witness');await mkdir(profile);await mkdir(witness)
 await writeFile(join(witness,'.epic-one-witness.json'),JSON.stringify({owner:'madness-epic-one',id:'test-owned'}))
 const timestamp='2026-10-28T09:00:00.000Z',context=(projectId,conversationId)=>({projectId,conversationId,initiativeId:null,providerId:'codex',connectionId:'synthetic-account'})
 const snapshot={schemaVersion:1,revision:4,projects:[{id:'real',name:'Réel synthétique',rootPath:join(root,'real'),openedAt:timestamp},{id:'own',name:'Témoin',rootPath:witness,openedAt:timestamp}],activeProjectId:'real',conversations:[{id:'real-chat',context:context('real','real-chat'),lastKnownActivity:'idle',messages:[]},{id:'own-chat',context:context('own','own-chat'),lastKnownActivity:'idle',messages:[]}],drafts:[{projectId:'real',text:'private',savedAt:timestamp},{projectId:'own',text:'test',savedAt:timestamp}],preferences:{navigationCollapsed:false}}
 await writeFile(join(profile,'madness-state-v1.json'),JSON.stringify(snapshot));await writeFile(join(profile,'credentials.bin'),'NEVER READ OR COPY')
 await mkdir(join(profile,'questions-v1'));await writeFile(join(profile,'questions-v1/own-question.json'),JSON.stringify({id:'own-question',context:{projectId:'own',conversationId:'own-chat'}}))
 await writeFile(join(profile,'questions-v1/real-question.json'),JSON.stringify({id:'real-question',context:{projectId:'real',conversationId:'real-chat'}}))
 await assert.rejects(archiveWitnessData({profile,witness,projectId:'own',closed:false,reopened:true}),/CLOSED_REOPENED_REQUIRED/)
 const beforeOtherCopy=await readFile(join(profile,'madness-state-v1.json'))
 await assert.rejects(archiveWitnessData({profile,witness,projectId:'own',closed:true,reopened:true,assertNoApp:()=>assertProfileClosed({inventory:async()=>[{pid:999,kind:'madness',executable:'C:/other-copy/Madness.exe'}]})}),/POSSIBLE_PROFILE_OWNER/)
 assert.deepEqual(await readFile(join(profile,'madness-state-v1.json')),beforeOtherCopy)
 await assert.rejects(readFile(join(profile,'test-project-archives/archived-projects.json')),/ENOENT/)
 await assert.rejects(assertProfileClosed({inventory:async()=>[{pid:998,kind:'electron-uncertain'}]}),/POSSIBLE_PROFILE_OWNER/)
 assert.equal(await assertProfileClosed({inventory:async()=>[]}),true)
 await writeFile(join(profile,'madness-state-v1.json'),JSON.stringify({...snapshot,schemaVersion:2}))
 await assert.rejects(archiveWitnessData({profile,witness,projectId:'own',closed:true,reopened:true,assertNoApp:async()=>true}),/STORAGE_VERSION_UNSUPPORTED/)
 await writeFile(join(profile,'madness-state-v1.json'),JSON.stringify(snapshot))
 const result=await archiveWitnessData({profile,witness,projectId:'own',closed:true,reopened:true,assertNoApp:async()=>true})
 const after=JSON.parse(await readFile(join(profile,'madness-state-v1.json'),'utf8'))
 assert.deepEqual(after.projects,[snapshot.projects[0]]);assert.deepEqual(after.drafts,[snapshot.drafts[0]]);assert.deepEqual(after.conversations,[snapshot.conversations[0]]);assert.deepEqual(after.preferences,snapshot.preferences)
 assert.equal(await readFile(join(profile,'credentials.bin'),'utf8'),'NEVER READ OR COPY');assert.equal(result.archivedAnnexes,1)
 await assert.rejects(readFile(join(result.archive,'credentials.bin')),/ENOENT/)
})
