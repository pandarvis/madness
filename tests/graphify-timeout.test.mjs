import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {realpathSync} from 'node:fs'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createHash} from 'node:crypto'
import {GraphifyAdapter} from '../src/adapters/analysis/graphify.ts'
import {GraphOwnedRun} from '../src/adapters/analysis/graph-owned-run.ts'
import {validateGraphAnalysisEvent} from '../src/contracts/bmad-graph.ts'
import {createGraphState,beginGraphAttempt,publishGraphEvent} from '../src/core/bmad-graph.ts'
const exec=promisify(execFile),quote=s=>"'"+s.replaceAll("'","''")+"'",hash='a'.repeat(64)
const pwsh=join(process.env.USERPROFILE,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
for(const zero of [true,false])test('adapter converts actual launcher GRAPH_CHILD_timeout with '+(zero?'proven zero':'unknown stop')+' without claiming analysis failure',async()=>{const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-timeout-')));try{const resources=join(root,'resources'),task=join(root,'task'),prepared=join(root,'capture'),data=join(prepared,'data'),project=join(root,'project');await mkdir(resources);await mkdir(data,{recursive:true});await mkdir(project);const receipt=Buffer.from('{}');await writeFile(join(data,'files.json'),receipt);await writeFile(join(resources,'preflight.ps1'),'function Assert-BmadChain($Path){}\nfunction Assert-GraphClosedRuntime($Root,$Files){}\n');await writeFile(join(resources,'assembly.json'),'{}');await writeFile(join(resources,'supervision.ps1'),`function Invoke-BmadSupervised($Start,$TimeoutMs,$StatePath,$OwnedPaths,$Owner,$OutLog,$ErrLog,$Marker,[ref]$StateObservation,$CancelPath){$value=@{started=$true;job_assigned_before_resume=$true;outcome='timeout';exit=$null;job_active_after_stop=${zero?'0':'$null'}};$StateObservation.Value=$value;return $value}`);const owner=new GraphOwnedRun(join(root,'owner.json')),adapter=new GraphifyAdapter({root:join(root,'runs'),resources:resolve('resources/graphify'),owner,admission:{enter:()=>()=>{}}}),corpus=[{relativePath:'a.ts',sha256:hash,lineCount:1,kind:'file'}];let analysisCalls=0,diagnostic='';
// Stub only the process boundary. Actual launcher generates the diagnostic and terminal;
// actual owner consumes that receipt, and the actual adapter catch converts it. No OS Job is claimed here.
adapter.run=async(request,signal,attempt)=>{if(request.op==='capture')return {folder:prepared,result:{rootPath:project,rootIdentity:'root',revision:hash,observedAt:'2026-11-04T12:00:00.000Z',sources:[],corpus,excluded:[],receiptSha:createHash('sha256').update(receipt).digest('hex')}};analysisCalls++;const generation=await owner.begin(task,attempt);await writeFile(join(task,'request.json'),JSON.stringify({op:'analyze',prepared:data}));const source=await readFile('resources/graphify/launcher.ps1','utf8'),script='$TaskFolder='+quote(task)+'\n$Resources='+quote(resources)+'\n$Generation='+quote(generation)+'\n$Pins=@{}\n'+source;await exec(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:20000,maxBuffer:1024*1024});diagnostic=await readFile(join(task,'launcher-error.txt'),'utf8');await owner.confirm(generation);throw Error(diagnostic)};
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
   const script = '$TaskFolder='+quote(task)+'\n$Resources='+quote(resources)+'\n$FixtureOutput='+quote(output)+'\n$FixtureHardLink=$'+(name==='linked'?'true':'false')+'\n$Generation="graph-artifact"\n$Pins=@{}\n'+source
   await exec(pwsh, ['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')], {windowsHide:true,timeout:10000})
   if (name === 'qualified') {
    assert.equal(await readFile(join(task, 'native-graph.json'), 'utf8'), '{"fixture":true}')
   } else {
    const diagnostic = await readFile(join(task, 'launcher-error.txt'), 'utf8')
    assert.match(diagnostic, name==='linked' ? /RUNTIME_HARDLINK/ : /^GRAPH_OUTPUT_MISSING$/)
    await assert.rejects(readFile(join(task, 'native-graph.json')), {code:'ENOENT'})
   }
  }
 } finally { await rm(root,{recursive:true,force:true}) }
})
