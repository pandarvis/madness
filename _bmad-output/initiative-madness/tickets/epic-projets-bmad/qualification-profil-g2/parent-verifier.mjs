import {readFile,readdir,lstat} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {join,resolve,relative,isAbsolute} from 'node:path'
const root='_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-profil-g2'
const ok=(v,m)=>{if(!v)throw new Error(m)}
const hash=b=>createHash('sha256').update(b).digest('hex')
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b)
const chain=async path=>{let current=resolve(path);for(;;){const st=await lstat(current);ok(!st.isSymbolicLink(),'Linked ancestor '+current);const parent=resolve(current,'..');if(parent===current)break;current=parent}}
const bytes=async (path,limit=64*1024*1024)=>{await chain(path);const st=await lstat(path);ok(st.isFile()&&st.nlink===1&&st.size<=limit,'Nonregular/oversize '+path);const raw=await readFile(path);ok(raw.length<=limit,'Changed size '+path);return raw}
const read=async p=>JSON.parse((await bytes(p,8*1024*1024)).toString('utf8').replace(/^\uFEFF/,''))
const optional=async p=>{try{return await read(p)}catch(e){if(e.code==='ENOENT')return null;throw e}}
const code2=['prototype.py','fixtures.py','scenarios.py','runtime_guard.py','evidence.py','verify.py','run.ps1','runtime-preflight.ps1','preflight-probe.ps1','sources-lock.json']
const code1=code2.filter(n=>!['runtime-preflight.ps1','preflight-probe.ps1'].includes(n))
const bench3=['prototype.py','fixtures.py','scenarios.py','runtime_guard.py','evidence.py','verify.py','source_bootstrap.py','run.ps1','runtime-preflight.ps1','preflight-probe.ps1','supervision.ps1','supervision-probe.ps1']
const code3=[...bench3,'sources-lock.json']
const dataBase=['results.json','inventory-local.json','context-local.json','tickets-local.json','tickets-conflict.json','scenarios.log','calls.log']
const data3=[...dataBase,'execution.json','launcher.stdout.log','launcher.stderr.log','supervision-probe.stdout.log','supervision-probe.stderr.log']
const recordHash=async (path,limit=64*1024*1024)=>hash(await bytes(path,limit))
const lock=await read(join(root,'sources-lock.json'))
ok(lock.schema===5&&lock.bench_policy==='captured-source-only-v5'&&lock.runtime.policy==='closed-copy-v2','Current schema5 runtime policy')
ok(same(Object.keys(lock.bench).sort(),bench3.slice().sort()),'Current exact admitted bench set')
for(const name of bench3)ok(await recordHash(join(root,name))===lock.bench[name],'Current bench pin '+name)
const selected=await read(join(root,'selected-run.json'))
const parentEntryExpected=!!await optional(join(root,'parent-final-actions.json'))
const runSummary=[]
let selectedResults=null
for(const item of await readdir(join(root,'runs'),{withFileTypes:true})){
 ok(item.isDirectory()&&/^run-[a-f0-9]{32}$/.test(item.name),'Unexpected run folder '+item.name)
 const dir=join(root,'runs',item.name),info=await lstat(dir)
 ok(!info.isSymbolicLink(),'Reparse run '+item.name)
 const hashes={}
 let totalBytes=0;const entries=await readdir(dir);ok(entries.length<=64,'Artifact count '+item.name)
 for(const name of entries){
  ok([...code3,...data3,'evidence-manifest.json'].includes(name),'Unexpected artifact name '+name)
  const path=join(dir,name),size=(await lstat(path)).size;totalBytes+=size;ok(totalBytes<=16777216,'Receipt cumulative size '+item.name)
  hashes[name]=await recordHash(path,name.endsWith('.log')?4194304:1048576)
 }
 const runLock=await optional(join(dir,'sources-lock.json'))
 const result=await optional(join(dir,'results.json'))
 const execution=await optional(join(dir,'execution.json'))
 const schema=runLock?.schema??execution?.schema??1
 const manifest=await optional(join(dir,'evidence-manifest.json'))
 const full=result?.tests?.run===15&&result.tests.passed===15&&result.tests.errors===0&&result.tests.failures===0&&result.tests.skipped===0
 let classification=execution&&execution.outcome!=='completed'?'incomplete':result?'unsealed-tested':'incomplete'
 if(runLock?.bench){
  ok([3,4,5].includes(schema)&&same(Object.keys(runLock.bench).sort(),bench3.slice().sort()),'Recorded bench set '+item.name)
  for(const [name,expected] of Object.entries(runLock.bench))if(name in hashes)ok(hashes[name]===expected,'Changed recorded bench '+item.name+'/'+name)
 }
 if(result){
  const before=result.preservation.before,after=result.preservation.after
  ok(Object.keys(before).length===558&&Object.keys(after).length===558&&Object.keys(runLock.preservation_before).length===558,'Input closure '+item.name)
  ok(Object.entries(before).every(([p,h])=>h===after[p]&&h===runLock.preservation_before[p]),'Source conservation '+item.name)
  ok(result.cleanup.length===result.tests.run&&result.cleanup.every(c=>c.removed),'Case cleanup '+item.name)
 }
 if(manifest){
  const code=schema===1?code1:schema===2?code2:[3,4,5].includes(schema)?code3:null
  ok(code,'Unsupported sealed schema '+schema)
  const names=[...code,...(schema>=3?data3:dataBase)].sort()
  ok(same(Object.keys(manifest.sha256).sort(),names),'Closed evidence set '+item.name)
  ok(Object.entries(manifest.sha256).every(([n,h])=>hashes[n]===h),'Manifest hashes '+item.name)
  ok(full&&result.matrix.length===15&&result.matrix.every((m,i)=>m.id==='M'+(i+1)&&m.passed&&m.assertions>0),'Full passed matrix '+item.name)
  const log=await readFile(join(dir,'scenarios.log'),'utf8')
  for(let i=1;i<=15;i++)ok(log.split(/\r?\n/).some(line=>line.startsWith('test_M'+i+'_')&&line.endsWith(' ... ok')),'Executed M'+i+' '+item.name)
  classification='historical-sealed'
 }
 if(item.name===selected.run){
  ok(schema===5&&manifest&&full,'Selected current full sealed run')
  ok(selected.manifest_sha256===hashes['evidence-manifest.json'],'Selected manifest reference')
  for(const name of code3)ok(await recordHash(join(root,name))===hashes[name],'Selected code is current '+name)
  ok(execution?.schema===5&&execution.outcome==='completed'&&execution.exit===0&&execution.results_present,'Selected terminal launcher')
  ok(execution.cleanup.length>0&&execution.cleanup.every(c=>c.removed),'Selected launcher cleanup')
  ok(manifest.schema===5&&execution.job_assigned_before_resume&&execution.job_active_after_stop===0&&execution.drain_ms<4000,'Selected owned job and bounded drain')
  const closure=Object.fromEntries(Object.entries(runLock.bench).filter(([n])=>n.endsWith('.py')).map(([n,h])=>[n.slice(0,-3),h]))
  const closureMatches=value=>value&&Object.keys(value).length===Object.keys(closure).length&&Object.entries(closure).every(([n,h])=>value[n]===h)
  ok(result.bench_execution?.policy==='captured-source-only-v5'&&closureMatches(result.bench_execution.sha256)&&result.bench_execution.bootstrap_sha256===runLock.bench['source_bootstrap.py'],'Entry actual source closure')
  const calls=(await readFile(join(dir,'calls.log'),'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse)
  ok(calls.length>0&&calls.every(c=>c.duration_ms<c.supervision.timeout_ms+10000&&c.stdout_bytes<=4194304&&c.stderr_bytes<=4194304),'Bounded actual calls')
  for(const c of calls.filter(c=>!['runtime-inspection-probe','bench-source-probe','inner-boundary-probe'].includes(c.op)))ok(closureMatches(c.bench_execution?.sha256)&&c.bench_execution.bootstrap_sha256===runLock.bench['source_bootstrap.py'],'Worker source closure '+c.op)
  for(const c of calls){
   const s=c.supervision
   ok(s?.policy==='job-before-resume-v5'&&s.stdin_mode==='owned-file'&&s.duration_ms===c.duration_ms&&s.stdout_bytes===c.stdout_bytes&&s.stderr_bytes===c.stderr_bytes,'Per-call exact native receipt '+c.op)
   ok(s.drain_ms<4000&&(!s.started||s.job_assigned_before_resume&&s.job_active_after_stop===0),'Per-call before-resume ownership and finite drain '+c.op)
  }
  const inner=result.observations.find(o=>o.data.inner_processes)?.data.inner_processes
  ok(inner?.length===6&&same(inner.map(c=>c.mode).sort(),['next','orphan','overflow','start-failed','timeout','unread-stdin']),'Six real bounded_process cases')
  const modes=Object.fromEntries(inner.map(c=>[c.mode,c]))
  for(const name of ['orphan','timeout']){
   const c=modes[name],s=c.receipt
   ok(c.child_stopped&&s.live_before_stop.length>0&&s.job_active_after_stop===0&&s.duration_ms<s.timeout_ms+10000,'Real inner child stopped and return finite '+name)
   for(const stream of ['stdout','stderr'])ok(hash(Buffer.from(c[stream+'_sample'],'utf8'))===s[stream+'_sha256'],'Exact captured inner '+name+'/'+stream)
  }
  ok(modes.orphan.refusal==='DESCENDANTS_STOPPED'&&modes.orphan.receipt.exit===0&&modes.orphan.receipt.root_exit_ms<modes.orphan.receipt.timeout_ms,'Dead root does not release inner live child')
  ok(modes.timeout.refusal==='TIME_LIMIT'&&modes['unread-stdin'].refusal==='TIME_LIMIT'&&modes['unread-stdin'].receipt.stdin_bytes===1048576,'Native timeout and unread owned stdin')
  ok(modes.overflow.refusal==='OUTPUT_LIMIT'&&modes.overflow.receipt.stdout_bytes===4194304&&modes.overflow.receipt.stdout_sha256===hash(Buffer.alloc(4194304,88)),'Actual bounded inner overflow')
  ok(modes['start-failed'].refusal==='START_FAILED'&&!modes['start-failed'].receipt.started&&modes.next.receipt.outcome==='completed'&&modes.next.receipt.exit===0&&modes.next.result.next==='INNER_NEXT_OK','Start failure and next real inner call')
  const selectedProof=result.observations.find(o=>o.data.selected_manifest)?.data.selected_manifest
  ok(selectedProof?.refusal==='SELECTION_MANIFEST_CHANGED'&&selectedProof.inner_hashes_unchanged&&selectedProof.actual_default_main,'Actual default verifier rejects formatting-only manifest mutation')
  const conflict=await read(join(dir,'tickets-conflict.json'))
  ok(conflict.sources.leaves[0].fields.status==='done'&&conflict.sources.plans[1].fields.status==='in-progress'&&conflict.encoding_variants.length===3,'Windows independent ticket fields')
  for(const v of conflict.encoding_variants){
   ok(v.proof.sources.leaves[0].fields.status==='done'&&v.proof.sources.plans[1].fields.status==='in-progress','Windows variant fields')
   for(const s of v.proof.sources.files)ok(hash(Buffer.from(s.content,'utf8'))===s.sha256,'Windows raw bytes')
  }
  const imports=result.observations.find(o=>o.case==='M15'&&o.data.source_only)?.data
  ok(imports?.ignored_variants.length===8&&imports.changed_source_refused&&closureMatches(imports.sha256),'Adversarial source-only harness')
  const stop=result.observations.find(o=>o.case==='M15'&&o.data.forced)?.data
  ok(stop?.forced.outcome==='timeout'&&stop.forced.marker_observed&&!stop.forced.results_present,'Real forced stop after marker')
  ok(stop.failed_start.outcome==='start-failed'&&stop.next.outcome==='completed'&&stop.next.exit===0,'Start failure and next run')
  for(const name of ['forced','next','failed_start'])ok(stop[name].cleanup.every(c=>c.removed),'Owned probe cleanup '+name)
  ok(stop.overflow.outcome==='output-limit'&&stop.scope_refused,'Native output and ownership refusal')
  if(parentEntryExpected){for(const [name,started] of [['entry_state_refusal',false],['started_state_refusal',true]]){const e=stop[name];ok(e?.passed&&e.started===started&&e.caller_started===started&&e.caller_cleanup_removed&&e.cleanup.every(c=>c.removed)&&(!started||e.job_active_after_stop===0),'Entry state write failure cleaned with observed lifecycle '+name)}}
  ok(stop.host_version==='7.5.4'&&stop.host_sha256==='9660387054b1387f5ab7e907a61560674c762559f91279a50484240bb3659d53'&&await recordHash(stop.host)===stop.host_sha256,'Actual direct PowerShell host observed and unchanged')
  ok(stop.orphan.outcome==='descendants-stopped'&&stop.orphan.exit===0&&stop.orphan.job_assigned_before_resume&&stop.orphan.active_before_stop>0&&stop.orphan.job_active_after_stop===0&&stop.child_stopped,'Root exit and inherited pipes stop actual child')
  ok(stop.orphan.elapsed_ms<25000&&stop.orphan.drain_ms<4000&&stop.orphan.cleanup.every(c=>c.removed),'Root exit returns and cleans within finite budget')
  const central=result.observations.find(o=>o.data.central_encodings)?.data.central_encodings
  ok(same(central?.map(c=>[c.encoding,c.native_accepted,c.profile_accepted]),[['lf',true,true],['crlf',true,true],['bom',false,false],['bare-cr',false,false]]),'Binary central configuration matches native')
  const readers=result.observations.find(o=>o.data.invalid_records)?.data
  ok(readers?.invalid_records.length===32&&readers.invalid_records.every(c=>c.refusal==='EVIDENCE_NAME')&&readers.size_and_ntfs_refused&&readers.external_unchanged&&readers.historical_runs.length>=18,'Historical capture refuses exterior names and NTFS/size violations')
  const pointer=result.observations.find(o=>o.data.selection_pointer)?.data.selection_pointer
  ok(pointer?.hardlink_refused&&pointer.external_unchanged&&pointer.promotion_record_absent,'Selection pointer refuses hardlink before promotion writes')
  const destinations=result.observations.find(o=>o.data.destinations)?.data.destinations
  ok(same(destinations?.map(c=>c.folder).sort(),['logs','runs'])&&destinations.every(c=>c.refused_before_uv&&c.outside_unchanged),'Pre-existing destination junctions refused before first UV')
  ok((await readFile(join(dir,'launcher.stdout.log'),'utf8')).includes('NEW_RUN: '+item.name),'Native stdout actually captured')
  selectedResults={run:item.name,tests:result.tests,assertions:result.matrix.reduce((n,m)=>n+m.assertions,0),observations:result.observations.length,calls:calls.length,duration_ms:result.duration_ms,manifest_sha256:hashes['evidence-manifest.json']}
  classification='current-selected'
 }
 runSummary.push({run:item.name,schema,classification,sealed:!!manifest,tests:result?.tests??null,files:Object.keys(hashes).length,execution_outcome:execution?.outcome??null})
}
ok(selectedResults,'Selected run exists')
const historic=await read(join(root,'reproduction-v3-before.json'))
for(const [name,expected] of Object.entries(historic)){
 ok(/^runs[/\\]run-[a-f0-9]{32}[/\\][a-zA-Z0-9_.-]+$/.test(name),'Historical path')
 ok(await recordHash(join(root,...name.split(/[/\\]/)))===expected,'Historical receipt changed '+name)
}
ok(Object.keys(historic).length===164,'Historical164 closure')
const historic4=await read(join(root,'reproduction-v4-before.json'))
ok(historic4.files===304&&historic4.runs===18&&Object.keys(historic4.sha256).length===304,'Historical304 closure')
for(const [name,expected] of Object.entries(historic4.sha256)){
 ok(/^run-[a-f0-9]{32}[/\\][a-zA-Z0-9_.-]+$/.test(name),'Historical4 path')
 ok(await recordHash(join(root,'runs',...name.split(/[/\\]/)))===expected,'Historical4 receipt changed '+name)
}
ok(await recordHash(join(root,'iteration-3.zip'))==='0739604902b822923ba195ec69cc85c5d07075a95a81f1e5b1e978d37b3341ce','Archive3 changed')
const historic5=await read(join(root,'reproduction-v5-before.json'))
ok(historic5.files===456&&historic5.runs===25&&Object.keys(historic5.sha256).length===456,'Historical456 closure')
for(const [name,expected] of Object.entries(historic5.sha256)){
 ok(/^run-[a-f0-9]{32}[/\\][a-zA-Z0-9_.-]+$/.test(name),'Historical5 path')
 ok(await recordHash(join(root,'runs',...name.split(/[/\\]/)))===expected,'Historical5 receipt changed '+name)
}
ok(await recordHash(join(root,'iteration-4.zip'))==='c49353444f09360fedb92801c8a8e4464da8bd43bf90fe0374624eef844146d9','Archive4 changed')
for(const [name,expected] of [['iteration-0.zip','109c937e26b8dd2e3b3dfedf0b0abdae814be089ac36a486f8553cda53b223be'],['iteration-1.zip','dd86933f293a98587dc6585d11b46c76029eb283a40727bdc8a94a5779bb31a2'],['iteration-2.zip','af21c3af09a5dc5a3ebb49842a4a4ed7096eb1fb179446ca2ed5e8f3df01997e']])ok(await recordHash(join(root,name))===expected,'Archive changed '+name)
const inputs=await read(join(root,'parent-inputs.json'))
ok(inputs.baseline==='ebe2bb3c5279fcb95bd48e0a0da917bce04dddfb'&&inputs.inputs.length===129,'Independent input closure')
for(const item of inputs.inputs){
 const delta=relative(process.cwd(),resolve(item.path))
 ok(delta&&!delta.startsWith('..')&&!isAbsolute(delta),'Independent input outside repository')
 let value=null
 try{value=await recordHash(item.path)}catch(e){if(e.code!=='ENOENT')throw e}
 ok(value===item.sha256,'Source changed '+item.path)
}
const plan=await readFile(join(root,'../tickets/spike-qualifier-le-profil-bmad-existant-et-les-contrats-de-guidage-plan.md'),'utf8')
const frozenSha256=hash(plan.match(/<frozen-after-approval[\s\S]*?<\/frozen-after-approval>/)[0])
ok(frozenSha256==='04d5977b155af629da97dddb2fdfd6fcd85688948de133cc701c6d389037db18','Approved intent changed')
ok(!(await readdir(root)).some(n=>n.startsWith('fixtures-')),'Owned transient remains')
const parentFinal=await optional(join(root,'parent-final-actions.json'))
const worker=parentFinal??await read(join(root,'worker-verification-v5.json'))
const readonly=await read(join(root,parentFinal?'parent-final-readonly.json':'worker-readonly-v5.json'))
const expectedReadonly=parentFinal?583:557
ok(readonly.files===expectedReadonly&&readonly.identical&&Object.keys(readonly.sha256_before).length===expectedReadonly&&same(Object.keys(readonly.sha256_before).sort(),Object.keys(readonly.sha256_after).sort()),'Current before/after evidence closure')
for(const [name,expected] of Object.entries(readonly.sha256_before)){
 const normalized=name.replaceAll('\\','/');ok(code3.includes(normalized)||/^iteration-[0-4]\.zip$/.test(normalized)||/^runs\/run-[a-f0-9]{32}\/[a-zA-Z0-9_.-]+$/.test(normalized),'Before/after closed proof path')
 ok(readonly.sha256_after[name]===expected&&await recordHash(join(root,...name.split(/[/\\]/)))===expected,'Actual before/after proof '+name)
}
for(const [name,count,selectedFlag] of [['seal',107,false],['explicit_verify',106,false],['promote',107,false],['default_verify',106,true]]){
 const a=worker.actions[name];ok(/^(seal|verify|promote)-[a-f0-9]{32}$/.test(a.folder),'Native log folder')
 const file=join(root,'logs',a.folder,'launcher.stdout.log'),value=await read(file)
 ok(await recordHash(file)===a.stdout_sha256&&value.checks===count&&value.passed===count&&value.selected===selectedFlag&&value.run===selected.run&&value.manifest_sha256===selected.manifest_sha256&&value.current_qualification,'Actual native action '+name)
}
console.log(JSON.stringify({status:'passed',baseline:inputs.baseline,frozenSha256,inputCount:129,historicalFilesUnchanged:456,archivesUnchanged:5,readonlyFilesUnchanged:expectedReadonly,nativeDefaultSelected:true,selected:selectedResults,runCount:runSummary.length,runs:runSummary}))
