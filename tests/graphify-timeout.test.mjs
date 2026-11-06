import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,copyFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {dirname,join,resolve} from 'node:path'
import {realpathSync} from 'node:fs'
import {ChildProcess,execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createHash} from 'node:crypto'
import {GraphifyAdapter,assertGraphifyPowerShell} from '../src/adapters/analysis/graphify.ts'
import {graphResourcePins} from '../src/adapters/analysis/graphify-manifest.ts'
import {GraphOwnedRun} from '../src/adapters/analysis/graph-owned-run.ts'
import {validateGraphAnalysisEvent} from '../src/contracts/bmad-graph.ts'
import {createGraphState,beginGraphAttempt,publishGraphEvent} from '../src/core/bmad-graph.ts'
const exec=promisify(execFile),quote=s=>"'"+s.replaceAll("'","''")+"'",hash='a'.repeat(64)
const pwsh=join(process.env.USERPROFILE,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
for(const zero of [true,false])test('adapter converts actual launcher GRAPH_CHILD_timeout with '+(zero?'proven zero':'unknown stop')+' without claiming analysis failure',async()=>{const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-timeout-')));try{const resources=join(root,'resources'),task=join(root,'task'),prepared=join(root,'capture'),data=join(prepared,'data'),project=join(root,'project');await mkdir(resources);await mkdir(data,{recursive:true});await mkdir(project);const receipt=Buffer.from('{}');await writeFile(join(data,'files.json'),receipt);await writeFile(join(resources,'preflight.ps1'),(await readFile('resources/graphify/preflight.ps1','utf8'))+'\nfunction Assert-GraphClosedRuntime($Root,$Files){}');await writeFile(join(resources,'assembly.json'),'{}');await writeFile(join(resources,'supervision.ps1'),`function Invoke-BmadSupervised($Start,$TimeoutMs,$StatePath,$OwnedPaths,$Owner,$OutLog,$ErrLog,$Marker,[ref]$StateObservation,$CancelPath){if($TimeoutMs -ne 360000){throw 'ANALYSIS_BUDGET_MISMATCH'};$value=@{started=$true;job_assigned_before_resume=$true;outcome='timeout';exit=$null;job_active_after_stop=${zero?'0':'$null'}};$StateObservation.Value=$value;return $value}`);const owner=new GraphOwnedRun(join(root,'owner.json')),adapter=new GraphifyAdapter({root:join(root,'runs'),resources:resolve('resources/graphify'),owner,admission:{enter:()=>()=>{}}}),corpus=[{relativePath:'a.ts',sha256:hash,lineCount:1,kind:'file'}];let analysisCalls=0,diagnostic='';
// Stub only the process boundary. Actual launcher generates the diagnostic and terminal;
// actual owner consumes that receipt, and the actual adapter catch converts it. No OS Job is claimed here.
adapter.run=async(request,signal,attempt,reportStop)=>{if(request.op==='capture')return {folder:prepared,result:{rootPath:project,rootIdentity:'root',revision:hash,observedAt:'2026-11-04T12:00:00.000Z',sources:[],corpus,excluded:[],receiptSha:createHash('sha256').update(receipt).digest('hex')}};analysisCalls++;const generation=await owner.begin(task,attempt);await writeFile(join(task,'request.json'),JSON.stringify({op:'analyze',prepared:data}));const source=await readFile('resources/graphify/launcher.ps1','utf8'),script='$TaskFolder='+quote(task)+'\n$Resources='+quote(resources)+'\n$Generation='+quote(generation)+'\n$Pins=@{}\n'+source;await exec(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:20000,maxBuffer:1024*1024});diagnostic=await readFile(join(task,'launcher-error.txt'),'utf8');reportStop(await owner.confirm(generation)==='stopped');throw Error(diagnostic)};
const original=await adapter.capture('p',project,new AbortController().signal),identity={projectId:'p',rootPath:original.rootPath,rootIdentity:original.rootIdentity,scopeId:'code',scopeRevision:adapter.scopeRevision,analysisId:'timeout-attempt',sourceRevision:original.revision},request={contractVersion:1,identity,generation:1,correlationId:'native-timeout',corpus,coverage:adapter.coverage},events=[];await adapter.analyze(request,e=>events.push(e),new AbortController().signal);assert.equal(diagnostic,'GRAPH_CHILD_timeout');assert.equal(analysisCalls,1);assert.ok(events.every(e=>validateGraphAnalysisEvent(e).ok));assert.equal(events.some(e=>e.type==='failed'),false,JSON.stringify(events));assert.deepEqual(events.at(-1),{contractVersion:1,identity,generation:1,correlationId:'native-timeout',order:2,type:'stopped',reason:'timeout',stop:zero?'confirmed':'unknown'});const {analysisId,sourceRevision,...scope}=identity,expected={identity,generation:1,correlationId:request.correlationId,lastEventOrder:0,corpus,coverage:adapter.coverage,sourceState:'unknown',observedAt:null};let state=beginGraphAttempt(createGraphState(scope).value,expected,'clear').value;for(const e of events){const next=publishGraphEvent(state,e,{...expected,lastEventOrder:state.lastEventOrder});assert.equal(next.ok,true,JSON.stringify(next));state=next.value}assert.equal(state.activity.outcome,zero?'timeout':'unknown');assert.equal(state.activity.stop,zero?'confirmed':'unknown')}finally{await rm(root,{recursive:true,force:true})}})

test('launcher only accepts the qualified clustered artifact path', async () => {
 const root = realpathSync.native(await mkdtemp(join(tmpdir(), 'madness-graph-artifact-')))
 try {
  const resources = join(root, 'resources')
  await mkdir(resources)
  await writeFile(join(resources, 'assembly.json'), '{}')
  const preflight = await readFile('resources/graphify/preflight.ps1', 'utf8')
  await writeFile(join(resources, 'preflight.ps1'), preflight+'\nfunction Assert-GraphClosedRuntime($Root,$Files){}')
  await writeFile(join(resources, 'supervision.ps1'), [
   'function Invoke-BmadSupervised($Start,$TimeoutMs,$StatePath,$OwnedPaths,$Owner,$OutLog,$ErrLog,$Marker,[ref]$StateObservation,$CancelPath){',
   ' if ($StatePath.EndsWith("analysis-execution.json")) {',
   `  [IO.File]::WriteAllText((Join-Path $Owner "analysis/worker.json"), '{"outcome":"completed"}')`,
   '  $graph=Join-Path $Owner $FixtureOutput',
   '  [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($graph))',
   `  [IO.File]::WriteAllText($graph, '{"fixture":true}')`,
   '  if ($FixtureHardLink) { [void](New-Item -ItemType HardLink -Path ($graph+"-link") -Target $graph) }',
   ` } else { [IO.File]::WriteAllText($OutLog, '{}') }`,
   ' $value=@{started=$true;job_assigned_before_resume=$true;outcome="completed";exit=0;job_active_after_stop=0}',
   ' $StateObservation.Value=$value;return $value',
   '}'
  ].join('\n'))
  const source = await readFile('resources/graphify/launcher.ps1', 'utf8')
  for (const [name, output] of [['unqualified','analysis/other/graph.json'],['qualified','analysis/out/graphify-out/graph.json'],['linked','analysis/out/graphify-out/graph.json']]) {
   const task = join(root, name)
   await mkdir(task)
   await writeFile(join(task, 'request.json'), JSON.stringify({op: 'analyze', prepared: root}))
   const script = '$TaskFolder='+quote(task)+'\n$Resources='+quote(resources)+'\n$FixtureOutput='+quote(output)+'\n$FixtureHardLink=$'+(name==='linked'?'true':'false')+'\n$Generation="graph-11111111-1111-1111-1111-111111111111"\n$Pins=@{}\n'+source
   const {stdout}=await exec(pwsh, ['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')], {windowsHide:true,timeout:10000,encoding:'buffer'})
   if (name === 'qualified') {
    const bytes=await readFile(join(task,output))
    assert.equal(bytes.toString(),'{"fixture":true}')
    assert.deepEqual(stdout.subarray(86),bytes)
    await assert.rejects(readFile(join(task,'native-graph.json')),{code:'ENOENT'})
   } else {
    assert.equal(stdout.length,0)
    const diagnostic = await readFile(join(task, 'launcher-error.txt'), 'utf8')
    assert.match(diagnostic, name==='linked' ? /RUNTIME_HARDLINK/ : /^GRAPH_OUTPUT_MISSING$/)
    await assert.rejects(readFile(join(task, 'native-graph.json')), {code:'ENOENT'})
   }
  }
 } finally { await rm(root,{recursive:true,force:true}) }
})

test('abort after reserving a generation writes a never-started receipt without a launcher', async () => {
 const root = realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-prelaunch-')))
 try {
  const ownerFile=join(root,'owner.json'),owner=new GraphOwnedRun(ownerFile),controller=new AbortController()
  const begin=owner.begin.bind(owner)
  owner.begin=async (...args)=>{const generation=await begin(...args);controller.abort();return generation}
  const adapter=new GraphifyAdapter({root:join(root,'runs'),resources:resolve('resources/graphify'),owner,admission:{enter:()=>()=>{}}})
  const reported=[]
  await assert.rejects(adapter.run({op:'analyze'},controller.signal,null,confirmed=>reported.push(confirmed)),{name:'AbortError'})
  const {folder,generation}=JSON.parse(await readFile(ownerFile,'utf8'))
  const terminal=JSON.parse(await readFile(join(folder,'terminal.json'),'utf8'))
  assert.deepEqual([terminal.generation,terminal.neverStarted,terminal.jobActive],[generation,true,0])
  await assert.rejects(readFile(join(folder,'request.json')),{code:'ENOENT'})
  assert.deepEqual(reported,[true])
  assert.equal(await adapter.shutdown(),'stopped')
 } finally {await rm(root,{recursive:true,force:true})}
})

test('Graphify detects present, missing and changed local prerequisites before reserving analysis', async () => {
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-prerequisites-')))
 try {
  await assertGraphifyPowerShell(pwsh)
  const controller=new AbortController(),checking=assertGraphifyPowerShell(pwsh,controller.signal)
  controller.abort()
  await assert.rejects(checking,{name:'AbortError'})
  const absent=join(root,'pwsh.exe')
  await assert.rejects(assertGraphifyPowerShell(absent),/GRAPH_POWERSHELL_REQUIRED/)
  await writeFile(absent,'altered host')
  await assert.rejects(assertGraphifyPowerShell(absent),/GRAPH_POWERSHELL_REQUIRED/)
  await copyFile(pwsh,absent)
  await assert.rejects(assertGraphifyPowerShell(absent),/GRAPH_POWERSHELL_REQUIRED/)
  for(const name of ['pwsh.dll','pwsh.deps.json','pwsh.runtimeconfig.json','System.Management.Automation.dll']){
   await copyFile(join(dirname(pwsh),name),join(root,name))
  }
  // The five pinned files are now exact, but ConsoleHost and the rest of the host are absent.
  await assert.rejects(assertGraphifyPowerShell(absent),/GRAPH_POWERSHELL_REQUIRED/)
  const runs=join(root,'runs')
  const adapter=new GraphifyAdapter({root:runs,resources:root,owner:new GraphOwnedRun(join(root,'owner.json')),admission:{enter:()=>()=>{}}})
  await assert.rejects(adapter.run({op:'capture'},new AbortController().signal),/GRAPH_RESOURCE_CHANGED:assembly\.json/)
  await assert.rejects(readFile(join(root,'owner.json')),{code:'ENOENT'})
  for(const name of Object.keys(graphResourcePins))await copyFile(resolve('resources/graphify',name),join(root,name))
  await assert.rejects(adapter.run({op:'capture'},new AbortController().signal),/GRAPH_RESOURCE_CHANGED:.*RUNTIME_READ/)
  assert.equal(await adapter.shutdown(),'stopped')
 } finally {await rm(root,{recursive:true,force:true})}
})

test('adapter admits only a complete frame for the confirmed analysis generation',async()=>{
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-frame-')))
 const launcherPin=graphResourcePins['launcher.ps1']
 const owner=new GraphOwnedRun(join(root,'owner.json'))
 try {
  const resources=join(root,'resources')
  await mkdir(resources)
  for(const name of Object.keys(graphResourcePins))await copyFile(resolve('resources/graphify',name),join(resources,name))
  const launcher=String.raw`
$request=Get-Content -LiteralPath (Join-Path $TaskFolder 'request.json') -Raw | ConvertFrom-Json -AsHashtable
$original=Join-Path $TaskFolder 'analysis/out/graphify-out/graph.json'
[void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($original))
$bytes=[byte[]]@(123,125,13,10)
[IO.File]::WriteAllBytes($original,$bytes)
$magic=if($request.mode -eq 'bad-magic'){'BADGRPH1'}else{'MADGRPH1'}
$id=if($request.mode -eq 'foreign'){'graph-11111111-1111-1111-1111-111111111111'}else{$Generation}
$digest=[Security.Cryptography.SHA256]::HashData($bytes)
if($request.mode -eq 'digest'){$digest[0]=$digest[0] -bxor 1}
$size=switch($request.mode){'size-limit'{16777217};'zero'{0};'size'{5};default{$bytes.Length}}
$out=[Console]::OpenStandardOutput()
$out.Write([Text.Encoding]::ASCII.GetBytes($magic+$id))
$out.Write([BitConverter]::GetBytes([uint32]$size))
$out.Write($digest)
if($request.mode -ne 'truncated'){$out.Write($bytes)}
if($request.mode -eq 'extra'){$out.WriteByte(0)}
if($request.mode -eq 'overrun'){
 $block=[byte[]]::new(1048576)
 for($i=0;$i -lt 17;$i++){$out.Write($block)}
}
$out.Flush()
[IO.File]::WriteAllText((Join-Path $TaskFolder 'result.json'),'{}')
$terminal=@{schemaVersion=1;generation=$Generation;purpose='graph-code-only';terminal=$true;jobAssigned=$true;jobActive=$(if($request.mode -eq 'unknown'){$null}else{0});neverStarted=$false}
[IO.File]::WriteAllText((Join-Path $TaskFolder 'terminal.json'),($terminal|ConvertTo-Json -Compress))
`
  await writeFile(join(resources,'launcher.ps1'),launcher)
  graphResourcePins['launcher.ps1']=createHash('sha256').update(launcher).digest('hex')
  const adapter=new GraphifyAdapter({root:join(root,'runs'),resources,owner,admission:{enter:()=>()=>{}}})
  const signal=new AbortController().signal
  const {folder,artifact}=await adapter.run({op:'analyze',mode:'valid'},signal)
  assert.deepEqual(artifact,await readFile(join(folder,'analysis/out/graphify-out/graph.json')))
  for(const mode of ['bad-magic','foreign','digest','size-limit','zero','size','truncated','extra','overrun']){
   let stopped,ownedFolder
   const failed=await adapter.run({op:'analyze',mode},signal,null,(confirmed,folder)=>{stopped=confirmed;ownedFolder=folder})
   assert.equal(failed.artifact,null,mode)
   assert.equal(stopped,true,mode)
   assert.equal(await readFile(join(ownedFolder,'analysis/out/graphify-out/graph.json'),'utf8'),'{}\r\n',mode)
  }
  const other=await adapter.run({op:'files-read',mode:'bad-magic'},signal)
  assert.deepEqual(other.result,{})
  assert.equal(other.artifact,undefined)
  let stopped
  await assert.rejects(adapter.run({op:'analyze',mode:'unknown'},signal,null,confirmed=>{stopped=confirmed}),/STOP_UNCONFIRMED/)
  assert.equal(stopped,false)
  const record=JSON.parse(await readFile(join(root,'owner.json'),'utf8')),terminalPath=join(record.folder,'terminal.json')
  const terminal=JSON.parse(await readFile(terminalPath,'utf8'))
  assert.equal(terminal.jobActive,null)
  // The only child here is the closed fixture launcher. Supply a synthetic late proof to exercise reconciliation.
  await writeFile(terminalPath,JSON.stringify({...terminal,jobActive:0}))
  assert.equal(await adapter.shutdown(),'stopped')
 }finally{
  graphResourcePins['launcher.ps1']=launcherPin
  if(await owner.status()==='stopped')await rm(root,{recursive:true,force:true})
 }
})

test('launcher deadline closes only the receiver and requires the final proof from the closed launcher',async t=>{
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-launcher-deadline-')))
 const launcherPin=graphResourcePins['launcher.ps1'],schedule=globalThis.setTimeout,kill=ChildProcess.prototype.kill
 let launcherProcess,fixtureFolder,deadline,killCalls=0
 async function releaseFixture(){
  if(!launcherProcess||!fixtureFolder)return
  await writeFile(join(fixtureFolder,'fixture-release'),'release')
  let timer
  try{
   await Promise.race([launcherProcess.closed,new Promise((_,reject)=>{timer=schedule(()=>reject(Error('FIXTURE_CLOSE_TIMEOUT')),10000)})])
  }finally{clearTimeout(timer)}
 }
 try {
  const resources=join(root,'resources')
  await mkdir(resources)
  for(const name of Object.keys(graphResourcePins))await copyFile(resolve('resources/graphify',name),join(resources,name))
  const launcher=String.raw`
$request=Get-Content -LiteralPath (Join-Path $TaskFolder 'request.json') -Raw | ConvertFrom-Json -AsHashtable
$proof=@{schemaVersion=1;generation=$Generation;purpose='graph-code-only';terminal=$true;jobAssigned=$true;jobActive=0;neverStarted=$false}
$early=Join-Path $TaskFolder 'job-terminal.json'
$cancel=Join-Path $TaskFolder 'cancel'
$release=Join-Path $TaskFolder 'fixture-release'
[IO.File]::WriteAllText(($early+'.next'),($proof|ConvertTo-Json -Compress))
[IO.File]::Move(($early+'.next'),$early,$false)
$end=[DateTime]::UtcNow.AddSeconds(30)
while(-not (Test-Path -LiteralPath $cancel) -and -not (Test-Path -LiteralPath $release) -and [DateTime]::UtcNow -lt $end){Start-Sleep -Milliseconds 25}
if($request.mode -ne 'missing-final' -and (Test-Path -LiteralPath $cancel)){
 [IO.File]::Move($early,(Join-Path $TaskFolder 'terminal.json'),$false)
}
if($request.mode -ne 'cancel-final'){
 while(-not (Test-Path -LiteralPath $release) -and [DateTime]::UtcNow -lt $end){Start-Sleep -Milliseconds 25}
}
`
  await writeFile(join(resources,'launcher.ps1'),launcher)
  graphResourcePins['launcher.ps1']=createHash('sha256').update(launcher).digest('hex')
  // Fire the real deadline path after the fixture's staged proof is on disk.
  t.mock.method(globalThis,'setTimeout',(fn,ms,...args)=>{
   if(ms!==600000)return schedule(fn,ms,...args)
   deadline=()=>fn(...args)
   return schedule(fn,20000,...args)
  })
  const spawn=ChildProcess.prototype.spawn
  t.mock.method(ChildProcess.prototype,'spawn',function(options){
   const result=spawn.call(this,options)
   if(options.args.includes('-EncodedCommand')){
    const child=this
    launcherProcess={child,closed:new Promise(done=>child.once('close',done))}
   }
   return result
  })
  t.mock.method(ChildProcess.prototype,'kill',function(...args){
   if(this===launcherProcess?.child){killCalls++;return false}
   return kill.apply(this,args)
  })
  for(const mode of ['cancel-final','late-final','missing-final']){
   const workspace=join(root,mode)
   await mkdir(workspace)
   const owner=new GraphOwnedRun(join(workspace,'owner.json')),begin=owner.begin.bind(owner)
   let observed,release,stopped
   owner.begin=async path=>{const generation=await begin(path);fixtureFolder=path;return generation}
   const adapter=new GraphifyAdapter({root:join(workspace,'runs'),resources,owner,admission:{enter:()=>()=>{release=true}}})
   launcherProcess=fixtureFolder=deadline=undefined
   const pending=adapter.run({op:'analyze',mode},new AbortController().signal,null,confirmed=>{stopped=confirmed})
   const rejected=assert.rejects(pending,mode==='cancel-final'?/GRAPH_CHILD_timeout/:/STOP_UNCONFIRMED/)
   for(let i=0;i<200&&!observed;i++){
    if(fixtureFolder&&deadline)observed=await readFile(join(fixtureFolder,'job-terminal.json')).catch(()=>null)
    if(!observed)await new Promise(r=>schedule(r,50))
   }
   assert.ok(observed,'fixture must stage its receipt before the deadline')
   assert.equal(await owner.observeStop(),'unknown')
   deadline()
   await rejected
   assert.equal(release,true)
   assert.equal(stopped,mode==='cancel-final')
   assert.equal(killCalls,0)
   const final=join(fixtureFolder,'terminal.json')
   if(mode!=='cancel-final'){
    assert.ok(launcherProcess.child.stdout.destroyed)
    assert.ok(launcherProcess.child.stderr.destroyed)
    if(mode==='late-final')assert.deepEqual(await readFile(final),observed)
    assert.equal(await owner.observeStop(),'unknown')
    await releaseFixture()
   }
   if(mode==='missing-final'){
    assert.equal(await owner.observeStop(),'unknown')
    await assert.rejects(readFile(final),{code:'ENOENT'})
    assert.deepEqual(await readFile(join(fixtureFolder,'job-terminal.json')),observed)
   }else{
    assert.equal(await owner.observeStop(),'stopped')
    assert.deepEqual(await readFile(final),observed)
   }
  }
 }finally{
  graphResourcePins['launcher.ps1']=launcherPin
  await releaseFixture()
  await rm(root,{recursive:true,force:true})
 }
})
