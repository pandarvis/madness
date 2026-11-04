import {readFile,writeFile,mkdir,cp,rm,readdir,link,symlink,unlink,lstat,rename} from 'node:fs/promises'
import {join,resolve,dirname,basename} from 'node:path'
import {release,version,cpus} from 'node:os'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {helpResourcePins} from '../../../../../src/adapters/bmad/help-manifest.ts'
import {BmadHelpAdapter} from '../../../../../src/adapters/bmad/help.ts'
import {HelpOwnedRun} from '../../../../../src/adapters/bmad/help-owned-run.ts'
import {qualifyHelpLocal,createBmadHelpWitness} from '../../../../../scripts/qualification/bmad-help.mjs'
import {ownedTemp,finishFixture} from './fixture.mjs'
const execute=promisify(execFile),quote=s=>"'"+s.replaceAll("'","''")+"'"
const repository=resolve(dirname(fileURLToPath(import.meta.url)),'../../../../..')
const qualification=dirname(fileURLToPath(import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex')
const pwsh=join(process.env.USERPROFILE,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
const origin=join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/python')
export async function copyRuntime(root,resources=join(repository,'resources/bmad-help')){
 const raw=await readFile(join(resources,'runtime.json')),manifest=JSON.parse(raw)
 if(manifest.files.length!==735)throw Error('RUNTIME_CORPUS_CHANGED')
 await mkdir(join(root,'Lib/site-packages'),{recursive:true})
 let cursor=0
 await Promise.all(Array.from({length:16},async()=>{while(cursor<manifest.files.length){const record=manifest.files[cursor++],bytes=await readFile(join(origin,record.name));if(sha(bytes)!==record.sha256)throw Error('RUNTIME_ORIGIN_CHANGED '+record.name);const path=join(root,record.name);await mkdir(dirname(path),{recursive:true});await writeFile(path,bytes,{flag:'wx'})}}))
 return {manifest,manifestSha256:sha(raw)}
}
export async function probe({script,runtime,manifestPath,cases=[{name:'nominal'}],log}){
 const lines=["$ErrorActionPreference='Stop'","$processClock=[Diagnostics.Stopwatch]::StartNew();$load=[Diagnostics.Stopwatch]::StartNew()",'. '+quote(script),'$loadMs=$load.ElapsedMilliseconds','$original=Get-Content -LiteralPath '+quote(manifestPath)+' -Raw|ConvertFrom-Json','$runtime='+quote(runtime),'$results=@()']
 for(const c of cases){
  const marker=join(dirname(runtime),'uv-'+c.name)
  lines.push('[IO.File]::Delete('+quote(marker)+');$m=$original;$handle=$null;'+(c.before??''),"$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false",'try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('+quote(marker)+',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}', '$results+=@{name='+quote(c.name)+';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath '+quote(marker)+')}',c.after??'',"if($null -ne $handle){$handle.Dispose()}")
 }
 lines.push('@{loadMs=$loadMs;processInnerMs=$processClock.ElapsedMilliseconds;results=$results}|ConvertTo-Json -Depth 8 -Compress')
 const at=performance.now()
 try {const {stdout,stderr}=await execute(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(lines.join('\n'),'utf16le').toString('base64')],{windowsHide:true,timeout:180000,maxBuffer:1024*1024});const value={...JSON.parse(stdout),wallMs:performance.now()-at,scriptSha256:sha(await readFile(script)),cases,stderr};if(log)await writeFile(log,JSON.stringify(value,null,2)+'\n');return value}
 catch(e){if(log)await writeFile(log,JSON.stringify({error:e.message,stdout:e.stdout,stderr:e.stderr,script,cases},null,2)+'\n');throw e}
}
export async function matrix({resources=join(repository,'resources/bmad-help'),label='source'}={}){
 const owner=await ownedTemp('mg-matrix-'),runtime=join(owner.root,'python'),artifact=join(qualification,'logs',label+'-'+basename(owner.root));await mkdir(artifact,{recursive:true})
 let completed=false
 try{
 const {manifest,manifestSha256}=await copyRuntime(runtime,resources),path=join(owner.root,'manifest.json');await writeFile(path,JSON.stringify(manifest))
 const file=manifest.files.find(r=>r.name==='Lib/codex-rejected-cas.pem').name,target=join(runtime,file),q=quote
 const cases=[{name:'nominal'},
 {name:'changed',before:'$saved=[IO.File]::ReadAllBytes('+q(target)+');[IO.File]::AppendAllText('+q(target)+',"CHANGED")',after:'[IO.File]::WriteAllBytes('+q(target)+',$saved)'},
 {name:'missing',before:'$saved=[IO.File]::ReadAllBytes('+q(target)+');[IO.File]::Delete('+q(target)+')',after:'[IO.File]::WriteAllBytes('+q(target)+',$saved)'},
 ...['sitecustomize.py','usercustomize.py'].map(name=>({name:name.split('.')[0],before:'[IO.File]::WriteAllText('+q(join(runtime,'Lib/site-packages',name))+',"NEVER")',after:'[IO.File]::Delete('+q(join(runtime,'Lib/site-packages',name))+')'})),
 {name:'cache',before:'[void][IO.Directory]::CreateDirectory('+q(join(runtime,'Lib/__pycache__'))+')',after:'[IO.Directory]::Delete('+q(join(runtime,'Lib/__pycache__'))+')'},
 {name:'extra-dir',before:'[void][IO.Directory]::CreateDirectory('+q(join(runtime,'unexpected'))+')',after:'[IO.Directory]::Delete('+q(join(runtime,'unexpected'))+')'},
 ...[[runtime,'root-venv'],[owner.root,'parent-venv']].map(([folder,name])=>({name,before:'[IO.File]::WriteAllText('+q(join(folder,'pyvenv.cfg'))+',"NEVER")',after:'[IO.File]::Delete('+q(join(folder,'pyvenv.cfg'))+')'})),
 {name:'invalid-record',before:"$m=@{files=@(@{name='../outside';sha256='"+'0'.repeat(64)+"'})}"},
 {name:'invalid-hash',before:"$m=@{files=@(@{name='python.exe';sha256='bad'})}"},
 {name:'read-fault',before:'$handle=[IO.File]::Open('+q(target)+',[IO.FileMode]::Open,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)',after:'$handle.Dispose();$handle=$null'},
 {name:'nominal-after-corruption'}]
 const baseline=await probe({script:join(qualification,'preflight-baseline.ps1'),runtime,manifestPath:path,cases,log:join(artifact,'baseline.json')})
 const candidate=await probe({script:join(resources,'preflight.ps1'),runtime,manifestPath:path,cases,log:join(artifact,'candidate.json')})
 for(const result of [baseline,candidate])for(const c of result.results){const admit=c.name.startsWith('nominal');if(c.admitted!==admit||c.launchMarker!==admit)throw Error('CORPUS_MISMATCH '+JSON.stringify(c))}
 // Real native hardlink/junction and lexical alias; outside bytes are canaries.
 const outside=join(owner.root,'outside');await mkdir(outside);const canary=join(outside,'canary');const saved=await readFile(target);await writeFile(canary,saved)
 await unlink(target);await link(canary,target)
 const hardlink=[];for(const [name,script] of [['baseline',join(qualification,'preflight-baseline.ps1')],['candidate',join(resources,'preflight.ps1')]])hardlink.push({name,...await probe({script,runtime,manifestPath:path,cases:[{name:'hardlink'}]})})
 await unlink(target);await writeFile(target,saved)
 const alias=join(owner.root,'junction');await symlink(runtime,alias,'junction')
 const junction=[];for(const [name,script] of [['baseline',join(qualification,'preflight-baseline.ps1')],['candidate',join(resources,'preflight.ps1')]])junction.push({name,...await probe({script,runtime:alias,manifestPath:path,cases:[{name:'junction'}]})})
 await unlink(alias)
 for(const result of [...hardlink,...junction])if(result.results.some(c=>c.admitted||c.launchMarker))throw Error('LINK_ADMITTED')
 for(const result of hardlink)if(!result.results[0].error.includes('RUNTIME_HARDLINK'))throw Error('HARDLINK_REASON_MISSING')
 for(const result of junction)if(!result.results[0].error.includes('RUNTIME_REPARSE'))throw Error('JUNCTION_REASON_MISSING')
 let symlinkFile={exercised:false,reason:''};const sym=join(runtime,'native-symlink')
 try{await symlink(canary,sym,'file');const observed=await probe({script:join(resources,'preflight.ps1'),runtime,manifestPath:path,cases:[{name:'native-symlink'}]});symlinkFile={exercised:true,observed};if(observed.results[0].admitted)throw Error('SYMLINK_ADMITTED')}catch(e){if(!['EPERM','EACCES'].includes(e.code))throw e;symlinkFile.reason=e.code}finally{await unlink(sym).catch(e=>{if(e.code!=='ENOENT')throw e})}
 if(sha(await readFile(canary))!==sha(saved))throw Error('CANARY_CHANGED')
 const proof={label,owner,manifestSha256,files:manifest.files.length,baseline,candidate,hardlink,junction,symlinkFile,canaryExact:true,limits:['Data-only UV substitute after the exact guard; no UV invoked by corpus.','No absence of races or universal filesystem safety claimed.']}
 await writeFile(join(artifact,'matrix.json'),JSON.stringify(proof,null,2)+'\n');completed=true
 return proof
 }finally{const cleanup=await finishFixture(owner,completed?{id:owner.id,root:owner.root,controllerComplete:true,states:[{started:false,outcome:'start-failed'}]}:null);await writeFile(join(artifact,'fixture.json'),JSON.stringify({owner,completed,cleanup},null,2)+'\n')}
}


async function traversalBoundFixtures(root){
 const fixtures=[]
 for(const name of ['count-bound','depth-bound']){
  const runtime=join(root,name);await mkdir(join(runtime,'Lib/site-packages'),{recursive:true})
  // Lib/site-packages is an explicitly allowed empty directory; the manifest
  // anchor also declares its Lib ancestor, so enumeration cannot fail EXTRA first.
  const anchor={name:'Lib/anchor',sha256:sha('x')};await writeFile(join(runtime,anchor.name),'x');const records=[anchor]
  let traversedEntries,maxComponents
  if(name==='count-bound'){
   //4096manifest records pass the candidate record bound. Two allowed dirs
   // make4098entries, so the refusal must occur inside traversal after4096.
   for(let i=0;i<4095;i++){const file='f'+String(i).padStart(4,'0');await writeFile(join(runtime,file),'x');records.push({name:file,sha256:sha('x')})}
   traversedEntries=4098;maxComponents=2
  }else{
   // Exactly one component beyond the existing17component traversal limit.
   const file=Array(17).fill('d').join('/')+'/file';await mkdir(dirname(join(runtime,file)),{recursive:true});await writeFile(join(runtime,file),'x');records.push({name:file,sha256:sha('x')});traversedEntries=21;maxComponents=18
  }
  if(records.length>4096)throw Error('BOUND_FIXTURE_INVALID_RECORD_COUNT')
  const manifestPath=join(root,name+'.json'),raw=JSON.stringify({files:records});await writeFile(manifestPath,raw)
  fixtures.push({name,runtime,manifestPath,manifestRecords:records.length,traversedEntries,maxComponents,manifestSha256:sha(raw),allowedScaffold:['Lib','Lib/site-packages'],anchor})
 }
 return fixtures
}
function requireRuntimeBound(observation){
 const result=observation.results[0]
 if(result.admitted||result.launchMarker||!result.error||!/(^|[^A-Z_])RUNTIME_BOUND([^A-Z_]|$)/.test(result.error))throw Error('TRAVERSAL_BOUND_NOT_REACHED '+JSON.stringify(observation))
}
export async function thresholdSupplement(){
 const owner=await ownedTemp('mg-threshold-'),artifact=join(qualification,'logs','threshold-'+basename(owner.root));await mkdir(artifact,{recursive:true});let complete=false
 try{
  const sourceResources=join(repository,'resources/bmad-help'),packageRoot=join(repository,'dist/runtime-guard-reviewed/win-unpacked'),packageResources=join(packageRoot,'resources/bmad-help'),existingName='verification-package-1793764613701.json',existingRaw=await readFile(join(qualification,existingName)),existing=JSON.parse(existingRaw),resources=[]
  for(const [name,pin] of Object.entries(helpResourcePins)){const source=sha(await readFile(join(sourceResources,name))),packaged=sha(await readFile(join(packageResources,name)));if(source!==pin||packaged!==pin)throw Error('THRESHOLD_RESOURCE_CHANGED '+name);resources.push({name,pin,source,packaged})}
  const asarSha256=sha(await readFile(join(packageRoot,'resources/app.asar')));if(asarSha256!==existing.package.asarSha256)throw Error('THRESHOLD_PACKAGE_CHANGED')
  const producer=await readFile(fileURLToPath(import.meta.url));await writeFile(join(artifact,'producer.mjs.txt'),producer)
  const fixtures=await traversalBoundFixtures(owner.root),observations=[]
  for(const fixture of fixtures)for(const [implementation,script] of [['baseline',join(qualification,'preflight-baseline.ps1')],['source-candidate',join(sourceResources,'preflight.ps1')],['package-candidate',join(packageResources,'preflight.ps1')]]){
   const observation={implementation,fixture:fixture.name,...await probe({script,runtime:fixture.runtime,manifestPath:fixture.manifestPath,cases:[{name:fixture.name}],log:join(artifact,fixture.name+'-'+implementation+'.json')})};requireRuntimeBound(observation);observations.push(observation)
  }
  const proof={schemaVersion:1,mode:'focused-traversal-threshold-supplement-no-UV',owner,producerSha256:sha(producer),producerCapsule:'producer.mjs.txt',resources,packageRoot,asarSha256,existingPackageReceipt:{name:existingName,sha256:sha(existingRaw)},fixtures,observations,controllersCompleted:true,probeLimitMs:180000,limits:['Historical count/depth fixtures stopped before the intended threshold and prove no traversal-bound equivalence.','Only corrected count/depth probes executed; no paired measurements, full corpus, worker.main or build.','Data-only fixture manifests do not extend the qualified735file runtime.']}
  await writeFile(join(artifact,'thresholds.json'),JSON.stringify(proof,null,2)+'\n');await writeFile(join(qualification,'verification-threshold-supplement.json'),JSON.stringify({artifact,proof},null,2)+'\n');complete=true;console.log(JSON.stringify({artifact,observations:observations.map(o=>({implementation:o.implementation,fixture:o.fixture,error:o.results[0].error,launchMarker:o.results[0].launchMarker})),asarSha256}))
  return proof
 }finally{const cleanup=await finishFixture(owner,complete?{id:owner.id,root:owner.root,controllerComplete:true,states:[{started:false,outcome:'start-failed'}]}:null);await writeFile(join(artifact,'fixture.json'),JSON.stringify({owner,complete,cleanup},null,2)+'\n')}
}

export async function edgeMatrix({resources=join(repository,'resources/bmad-help'),label='edges'}={}){
 const owner=await ownedTemp('mg-edge-'),artifact=join(qualification,'logs',label+'-'+basename(owner.root));await mkdir(artifact,{recursive:true});let complete=false
 try{
 const runtime=join(owner.root,'python'),{manifest}=await copyRuntime(runtime,resources),manifestPath=join(owner.root,'manifest.json');await writeFile(manifestPath,JSON.stringify(manifest))
 const scripts=[['baseline',join(qualification,'preflight-baseline.ps1')],['candidate',join(resources,'preflight.ps1')]],proof={owner,observations:[]}
 const observe=async(name,path,source=manifestPath)=>{for(const [implementation,script] of scripts)proof.observations.push({implementation,name,...await probe({script,runtime:path,manifestPath:source,cases:[{name}]})})}
 // Rename the owned runtime under a genuinely long lexical path; same735 bytes.
 const longParent=join(owner.root,'a'.repeat(150),'b'.repeat(100));await mkdir(longParent,{recursive:true});const longRuntime=join(longParent,'python');await rename(runtime,longRuntime);await observe('long-nominal',longRuntime);await rename(longRuntime,runtime)
 // Replace an ancestor with a real junction before the call, preserving outside canary.
 const outer=join(owner.root,'outer'),actual=join(owner.root,'actual');await mkdir(outer);await rename(runtime,join(outer,'python'));await rename(outer,actual);await symlink(actual,outer,'junction');await observe('replaced-ancestor',join(outer,'python'));await unlink(outer);await rename(join(actual,'python'),runtime)
 // The lexical junction is checked before a dot-dot alias can normalize it away.
 const alias=join(owner.root,'alias');await symlink(actual,alias,'junction');const lexical=alias+'\\..\\python';const lex=await probe({script:scripts[1][1],runtime:lexical,manifestPath,cases:[{name:'lexical-dotdot'}]});proof.lexical={...lex};await unlink(alias)
 // Traversal bounds: every scaffold directory is allowed by an anchor record.
 const bounds=await traversalBoundFixtures(owner.root)
 for(const bound of bounds){await observe(bound.name,bound.runtime,bound.manifestPath);for(const observation of proof.observations.filter(x=>x.name===bound.name))requireRuntimeBound(observation)}
 // Controlled failure of the native metadata observation. This is a fault-injected
 // copy of constant trusted code, not an actual filesystem fault or production resource.
 const fault=join(owner.root,'identity-fault.ps1'),raw=await readFile(scripts[1][1],'utf8');await writeFile(fault,raw.replace('if(!GetFileInformationByHandle(h,out i)||','if(!GetFileInformationByHandle(h,out i)||true||'))
 proof.identityFault=await probe({script:fault,runtime,manifestPath,cases:[{name:'metadata-fault'}]})
 for(const observation of proof.observations){const admitted=observation.name==='long-nominal';if(observation.results[0].admitted!==admitted||observation.results[0].launchMarker!==admitted)throw Error('EDGE_MISMATCH '+JSON.stringify(observation))}
 if(proof.lexical.results[0].admitted||proof.identityFault.results[0].admitted||proof.identityFault.results[0].launchMarker)throw Error('FAULT_ADMITTED')
 proof.longPathChars=longRuntime.length;proof.finalRuntime=await probe({script:scripts[1][1],runtime,manifestPath,cases:[{name:'restored-nominal'}]});if(!proof.finalRuntime.results[0].admitted)throw Error('RUNTIME_NOT_RESTORED')
 await writeFile(join(artifact,'edges.json'),JSON.stringify(proof,null,2)+'\n');complete=true;return proof
 }finally{const cleanup=await finishFixture(owner,complete?{id:owner.id,root:owner.root,controllerComplete:true,states:[{started:false,outcome:'start-failed'}]}:null);await writeFile(join(artifact,'fixture.json'),JSON.stringify({owner,complete,cleanup},null,2)+'\n')}
}

async function local(resources,label){
 const owner=await ownedTemp('mg-local-'),output=join(owner.root,'local'),artifact=join(qualification,'logs',label+'-'+basename(owner.root));await mkdir(artifact,{recursive:true});let proof=null,states=[]
 try{
  const value=await qualifyHelpLocal({root:output,sourceRoot:repository,resources});proof=value.proof
  const operations=join(output,'operations');for(const dir of await readdir(operations)){if(!dir.startsWith('operation-'))continue;const folder=join(operations,dir);await mkdir(join(artifact,dir));for(const name of ['request.json','execution.json','terminal.json','phases.json','native-timings.json','stdout.json','stderr.log','launcher-error.txt']){try{const raw=await readFile(join(folder,name));await writeFile(join(artifact,dir,name),raw);if(name==='execution.json')states.push(JSON.parse(raw))}catch(e){if(e.code!=='ENOENT')throw e}}}
  if(proof.helperStopped!=='stopped'||states.length===0||states.some(s=>s.outcome!=='completed'||s.exit!==0||s.job_active_after_stop!==0||s.job_assigned_before_resume!==true))throw Error('LOCAL_STOP_OR_OPERATION_NOT_PROVEN');await writeFile(join(artifact,'proof.json'),JSON.stringify(proof,null,2)+'\n');return {proof,artifact,states}
 }catch(e){await writeFile(join(artifact,'error.json'),JSON.stringify({error:e.message,owner,output},null,2)+'\n');throw e}
 finally{const cleanup=await finishFixture(owner,{id:owner.id,root:owner.root,controllerComplete:proof?.helperStopped==='stopped',states});await writeFile(join(artifact,'fixture.json'),JSON.stringify({owner,proof,states,cleanup},null,2)+'\n')}
}

export async function resourceRefusal(resources=join(repository,'resources/bmad-help'),label='resource-refusal'){
 const owner=await ownedTemp('mg-resource-'),artifact=join(qualification,'logs',label+'-'+basename(owner.root));await mkdir(artifact,{recursive:true});let adapter,proof=null,states=[]
 try{
 const clone=join(owner.root,'resources');await cp(resources,clone,{recursive:true});await writeFile(join(clone,'preflight.ps1'),'\n# altered resource\n',{flag:'a'})
 const witness=await createBmadHelpWitness({root:join(owner.root,'project'),sourceRoot:repository}),run=new HelpOwnedRun(join(owner.root,'owner.json'))
 adapter=new BmadHelpAdapter({root:join(owner.root,'operations'),resources:clone,owner:run,roots:p=>[join(p,'.agents/skills')]})
 let failure=null;try{await adapter.prepare('resource-test',witness.root,new AbortController().signal)}catch(e){failure=e.code??e.message}
 const shutdown=await adapter.shutdown();if(failure!=='PROFILE_CHANGED'||shutdown!=='stopped')throw Error('RESOURCE_REFUSAL_MISSING '+failure)
 for(const name of await readdir(join(owner.root,'operations'))){if(!name.startsWith('operation-'))continue;const folder=join(owner.root,'operations',name);const terminal=JSON.parse(await readFile(join(folder,'terminal.json'),'utf8'));let execution=null;try{execution=await readFile(join(folder,'execution.json'),'utf8')}catch(e){if(e.code!=='ENOENT')throw e}
 if(!terminal.neverStarted||terminal.jobActive!==0||execution!==null)throw Error('ALTERED_RESOURCE_LAUNCHED');states.push({started:false,outcome:'start-failed'});await writeFile(join(artifact,name+'.json'),JSON.stringify({terminal,execution},null,2)+'\n')}
 if(states.length!==1)throw Error('RESOURCE_OPERATION_COUNT');proof={failure,shutdown,states,alteredResourceSha256:sha(await readFile(join(clone,'preflight.ps1'))),expected:helpResourcePins['preflight.ps1']};await writeFile(join(artifact,'proof.json'),JSON.stringify(proof,null,2)+'\n');return proof
 }finally{if(adapter)await adapter.shutdown();const cleanup=await finishFixture(owner,{id:owner.id,root:owner.root,controllerComplete:proof?.shutdown==='stopped',states});await writeFile(join(artifact,'fixture.json'),JSON.stringify({owner,proof,cleanup},null,2)+'\n')}
}

async function main(){
 const packageIndex=process.argv.indexOf('--package'),packageRoot=packageIndex<0?null:resolve(process.argv[packageIndex+1]),resources=packageRoot?join(packageRoot,'resources/bmad-help'):join(repository,'resources/bmad-help'),label=packageRoot?'package':'source'
 const resourcesProof=[];for(const [name,pin] of Object.entries(helpResourcePins)){const actual=sha(await readFile(join(resources,name))),source=sha(await readFile(join(repository,'resources/bmad-help',name)));if(actual!==pin||actual!==source)throw Error('RESOURCE_PIN '+name);resourcesProof.push({name,pin,actual,source})}
 const reuseIndex=process.argv.indexOf('--reuse-corpus'),reuse=reuseIndex<0?null:JSON.parse(await readFile(resolve(process.argv[reuseIndex+1]),'utf8'));if(reuse&&(!packageRoot||reuse.packageAsarSha256!==sha(await readFile(join(packageRoot,'resources/app.asar')))||reuse.preflightSha256!==helpResourcePins['preflight.ps1']||reuse.matrix.candidate.scriptSha256!==helpResourcePins['preflight.ps1']))throw Error('REUSE_CORPUS_SOURCE_MISMATCH')
 const sourceInputs=[];for(const name of ['resources/bmad-help/preflight.ps1','resources/bmad-help/runtime.json','resources/bmad-help/runtime_guard.py','src/adapters/bmad/help-manifest.ts','src/adapters/bmad/help.ts','src/adapters/bmad/help-owned-run.ts','scripts/qualification/bmad-help.mjs','tests/bmad-runtime-preflight.test.mjs','tests/bmad-help-supervision.test.mjs','tests/helpers/help-native.mjs','tests/bmad-context-sources.test.mjs','tests/bmad-help-boundaries.test.mjs','tests/bmad-help.test.mjs','package.json','package-lock.json'])sourceInputs.push({name,sha256:sha(await readFile(join(repository,name)))})
 const report={producerSha256:sha(await readFile(fileURLToPath(import.meta.url))),startedAt:new Date().toISOString(),label,packageRoot,resourcesProof,sourceInputs,profile:{platform:process.platform,arch:process.arch,node:process.version,windows:version(),release:release(),cpu:cpus()[0]?.model,cache:'Windows filesystem cache not purged; every admission rehashes all735files'},baseline:{revision:'eaecc68b3a232f46d05c69ba14d9158e49c5efac',sha256:sha(await readFile(join(qualification,'preflight-baseline.ps1')))},reusedCorpus:reuse?{session:reuse.session,reason:reuse.reason,producer:reuse.producer,packageAsarSha256:reuse.packageAsarSha256}:null,matrix:reuse?.matrix??await matrix({resources,label}),edges:reuse?.edges??await edgeMatrix({resources,label}),resourceRefusal:reuse?.resourceRefusal??await resourceRefusal(resources,label)}
 if(packageRoot){const asar=await import('@electron/asar'),path=join(packageRoot,'resources/app.asar'),metadata=JSON.parse(asar.extractFile(path,'package.json').toString('utf8')),main=asar.extractFile(path,join('out','main','index.js'));if(metadata.version!=='0.2.8'||!main.includes(Buffer.from(helpResourcePins['preflight.ps1'])))throw Error('PACKAGE_METADATA_OR_PIN');report.package={version:metadata.version,asarSha256:sha(await readFile(path)),mainSha256:sha(main)}}
 if(!process.argv.includes('--matrix-only')){
  const owner=await ownedTemp('mg-pairs-');let complete=false
  try {const runtime=join(owner.root,'python'),{manifest}=await copyRuntime(runtime,resources),path=join(owner.root,'manifest.json');await writeFile(path,JSON.stringify(manifest));report.paired=[]
   for(const order of [['baseline','candidate'],['candidate','baseline'],['baseline','candidate']])for(const name of order){const observation=await probe({script:name==='baseline'?join(qualification,'preflight-baseline.ps1'):join(resources,'preflight.ps1'),runtime,manifestPath:path,cases:[{name:'nominal-0'},{name:'nominal-1'}]});if(observation.results.some(r=>!r.admitted||!r.launchMarker))throw Error('PAIRED_NOMINAL_FAILED');report.paired.push({order:order.join('-'),name,...observation});console.log(JSON.stringify({phase:'paired',order:order.join('-'),name,loadMs:observation.loadMs,wallMs:observation.wallMs,guards:observation.results.map(r=>r.guardMs)}))}
   complete=true
  }finally{report.pairedCleanup=await finishFixture(owner,complete?{id:owner.id,root:owner.root,controllerComplete:true,states:[{started:false,outcome:'start-failed'}]}:null)}
  report.local=await local(resources,label)
 }
 report.finishedAt=new Date().toISOString();await writeFile(join(qualification,'verification-'+label+'-'+Date.now()+'.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({label,finishedAt:report.finishedAt,local:report.local?.artifact,resources:resourcesProof.length}))
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){if(process.argv.includes('--threshold-supplement'))await thresholdSupplement();else await main()}
