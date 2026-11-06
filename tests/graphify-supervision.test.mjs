import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,lstat,writeFile,readFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {realpathSync} from 'node:fs'
import {execFile} from 'node:child_process'
import {createHash} from 'node:crypto'
import {promisify} from 'node:util'
const exec=promisify(execFile),quote=s=>"'"+s.replaceAll("'","''")+"'"
const generation='graph-11111111-1111-1111-1111-111111111111'
const artifact='analysis/out/graphify-out/graph.json'
const mirrorBytes=Buffer.from('export {}\n')
const mirrorFrame='4d41444d5352433101000000040000000a000000612e74736578706f7274207b7d0a'
const requestHash=request=>createHash('sha256').update(request).digest('hex')
async function taskIdentity(task){
 const stat=await lstat(task,{bigint:true})
 return {taskVolume:stat.dev.toString(),taskIndex:stat.ino.toString(),
  taskCreationTicks:(stat.birthtimeNs/100n+116444736000000000n).toString()}
}
const requestFor=async(task,prepared)=>({op:'analyze',prepared,receiptSha:'a'.repeat(64),
 rootIdentity:'fixture-root',revision:'b'.repeat(64),...await taskIdentity(task)})
async function checkMirrorRetention(task,removed){
 const record=JSON.parse(await readFile(join(task,'mirror-retention.json'),'utf8'))
 assert.deepEqual(record,{schemaVersion:1,generation,status:removed?'removed':'retained-unknown',
  removedBytes:removed?mirrorBytes.length:0,removedFiles:removed?1:0})
 if(removed)await assert.rejects(readFile(join(task,'mirror')),{code:'ENOENT'})
 else assert.deepEqual(await readFile(join(task,'mirror','a.ts')),mirrorBytes)
}
function expectedFrame(payload,generationId=generation){
 const size=Buffer.alloc(4)
 size.writeUInt32LE(payload.length)
 return Buffer.concat([Buffer.from('MADGRPH1'+generationId),size,createHash('sha256').update(payload).digest(),payload])
}
const pwsh=join(process.env.USERPROFILE,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
for(const [mode,expected] of [
 ['missing-zero',null],['no-observation',null],['positive-active',null],
 ['known-zero-after-throw',0],['unproved-success',null],['normal',0]
])test('HIGH-2 actual PowerShell launcher aggregates third child '+mode,async()=>{
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-aggregate-')))
 try {
  const resources=join(root,'resources'),task=join(root,'task')
  await mkdir(resources)
  await mkdir(task)
  await writeFile(join(resources,'preflight.ps1'),(await readFile('resources/graphify/preflight.ps1','utf8'))+'\nfunction Assert-GraphClosedRuntime($Root,$Files){}')
  await writeFile(join(resources,'assembly.json'),'{}')
  const requestText=JSON.stringify(await requestFor(task,join(root,'prepared')))
  await writeFile(join(task,'request.json'),requestText)
  const supervisor=String.raw`$script:childNumber=0
function Invoke-BmadSupervised($Start,$TimeoutMs,$StatePath,$OwnedPaths,$Owner,$OutLog,$ErrLog,$Marker,[ref]$StateObservation,$CancelPath,[ref]$BinaryOutput){
 $script:childNumber++
 $value=@{started=$true;job_assigned_before_resume=$true;outcome='completed';exit=0;job_active_after_stop=0}
 $step=[IO.Path]::GetFileName($StatePath)
 if($script:childNumber -eq 1 -and $step -ceq 'mirror-input-execution.json'){
  $StateObservation.Value=$value
  $BinaryOutput.Value=[Convert]::FromHexString('${mirrorFrame}')
  return $value
 }
 if($script:childNumber -eq 2 -and $step -ceq 'analysis-execution.json'){
  $StateObservation.Value=$value
  [void][IO.Directory]::CreateDirectory((Join-Path $Owner 'analysis/out/graphify-out'))
  [IO.File]::WriteAllText((Join-Path $Owner 'analysis/worker.json'),'{"outcome":"completed"}')
  [IO.File]::WriteAllText((Join-Path $Owner 'analysis/out/graphify-out/graph.json'),'{}')
  [IO.File]::WriteAllText($OutLog,'{}')
  return $value
 }
 if($script:childNumber -ne 3 -or $step -cne 'terminal-capture-execution.json'){throw 'FIXTURE_CHILD_ORDER'}
 switch($Mode){
  'missing-zero'{$value.Remove('job_active_after_stop');$StateObservation.Value=$value;throw 'injected-final-persistence-failure'}
  'no-observation'{$StateObservation.Value=$null;throw 'injected-before-observation'}
  'positive-active'{$value.job_active_after_stop=1;$StateObservation.Value=$value;throw 'injected-unconfirmed-stop'}
  'unproved-success'{$value.job_active_after_stop=$null;$StateObservation.Value=$value;[IO.File]::WriteAllText($OutLog,'{}');return $value}
  'known-zero-after-throw'{$StateObservation.Value=$value;throw 'injected-after-proven-stop'}
  default{$StateObservation.Value=$value;[IO.File]::WriteAllText($OutLog,'{}');return $value}
 }
}
`
  await writeFile(join(resources,'supervision.ps1'),supervisor)
  const source=await readFile('resources/graphify/launcher.ps1','utf8')
  const script='$TaskFolder='+quote(task)+'\n$Resources='+quote(resources)+'\n$Generation='+quote(generation)+'\n$AnalysisRequestSha='+quote(requestHash(requestText))+'\n$Pins=@{}\n$Mode='+quote(mode)+'\n'+source
  const {stdout}=await exec(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:20000,maxBuffer:1024*1024,encoding:'buffer'})
  const terminal=JSON.parse(await readFile(join(task,'terminal.json'),'utf8'))
  assert.equal(terminal.jobActive,expected)
  assert.equal(terminal.neverStarted,false)
  assert.equal(terminal.jobAssigned,true)
  const payload=await readFile(join(task,artifact))
  assert.equal(payload.toString(),'{}')
  assert.deepEqual(stdout,mode==='normal'?expectedFrame(payload):Buffer.alloc(0))
  await assert.rejects(readFile(join(task,'native-graph.json')),{code:'ENOENT'})
  await checkMirrorRetention(task,expected===0)
  if(mode==='normal'){
   assert.deepEqual(JSON.parse(await readFile(join(task,'result.json'),'utf8')),{})
   await assert.rejects(readFile(join(task,'launcher-error.txt')),{code:'ENOENT'})
  }else if(mode!=='unproved-success'){
   const error=await readFile(join(task,'launcher-error.txt'),'utf8')
   assert.match(error,/^injected-/)
  }
 }finally{await rm(root,{recursive:true,force:true})}
})

test('all three real Windows children use their own pipes after the launcher makes stdout private',async()=>{
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-pipes-')))
 try {
  const resources=join(root,'resources'),fixture=join(root,'child.py'),python=resolve('resources/graphify/assembly/runtime/python.exe')
  await mkdir(resources)
  await writeFile(join(resources,'assembly.json'),'{}')
  const preflight=await readFile('resources/graphify/preflight.ps1','utf8')
  const writeSignature='public static void WriteArtifact(string generation,byte[] bytes) {'
  const requireReceipt=writeSignature+String.raw`
    if(!File.Exists(Path.Combine(Environment.GetEnvironmentVariable("MADNESS_TEST_GRAPH_TASK"),"job-terminal.json")))
      throw Refuse("fixture saw publication before the terminal receipt");
`
  await writeFile(join(resources,'preflight.ps1'),preflight.replace(writeSignature,requireReceipt)+'\nfunction Assert-GraphClosedRuntime($Root,$Files){}')
  await writeFile(fixture,[
   'import json, os, sys',
   'from pathlib import Path',
   'step, mode, argument = sys.argv[1:]',
   'if step == "mirror-input-execution.json":',
   '    request = json.loads(argument)',
   '    assert request == {"op": "mirror-input", "prepared": str(Path.cwd().parent), "receiptSha": "a" * 64, "rootIdentity": "fixture-root", "revision": "b" * 64}',
   '    os.write(1, bytes.fromhex("'+mirrorFrame+'"))',
   '    os.write(2, b"mirror-err\\x00\\xfc")',
   'elif step == "analysis-execution.json":',
   '    project = Path(json.loads(Path(argument).read_text())["project"])',
   '    assert project == Path.cwd() / "mirror"',
   '    assert (project / "a.ts").read_bytes() == b"export {}\\n"',
   '    path = Path("analysis/out/graphify-out/graph.json")',
   '    path.parent.mkdir(parents=True)',
   '    path.write_bytes(b\'{"name":"\\xc3\\xa9"}\\r\\n\')',
   '    Path("analysis/worker.json").write_bytes(b\'{"outcome":"completed"}\')',
   '    os.write(1, b"worker-out\\x00\\xff")',
   '    os.write(2, b"worker-err\\x00\\xfe")',
   'else:',
   '    path = Path("analysis/out/graphify-out/graph.json")',
   '    denied = {}',
   '    try:',
   '        os.close(os.open(path, os.O_WRONLY))',
   '        denied["write"] = None',
   '    except OSError as error:',
   '        denied["write"] = error.errno',
   '    for source, target in [(path, path.with_suffix(".renamed")), (Path("analysis"), Path("analysis-renamed"))]:',
   '        try:',
   '            source.rename(target)',
   '            target.rename(source)',
   '            denied[source.name] = None',
   '        except OSError as error:',
   '            denied[source.name] = error.winerror',
   '    Path("lock-observation.json").write_text(json.dumps(denied))',
   '    os.write(1, b\'{"sourceState":"unchanged"}\')',
   '    os.write(2, b"compare-err\\x00\\xfd")',
   '    if mode == "fail": sys.exit(7)'
  ].join('\n'))
  const supervision=await readFile('resources/graphify/supervision.ps1','utf8')
  await writeFile(join(resources,'supervision.ps1'),supervision.replace('function Invoke-BmadSupervised(', 'function Invoke-GraphFixtureNative(')+String.raw`
function Invoke-BmadSupervised($Start,$TimeoutMs,$StatePath,$OwnedPaths,$Owner,$OutLog,$ErrLog,$Marker,[ref]$StateObservation,$CancelPath,[ref]$BinaryOutput){
 [FixtureGraphPipe]::RequirePrivate()
 $argument=$Start.ArgumentList[$Start.ArgumentList.Count-1]
 $Start.FileName=$FixturePython
 $Start.ArgumentList.Clear()
 foreach($arg in @('-I','-S','-B','-X','utf8',$Fixture,[IO.Path]::GetFileName($StatePath),$Mode,$argument)){[void]$Start.ArgumentList.Add($arg)}
 $binary=@{}
 if($null -ne $BinaryOutput){$binary.BinaryOutput=$BinaryOutput}
 Invoke-GraphFixtureNative $Start $TimeoutMs $StatePath $OwnedPaths $Owner $OutLog $ErrLog $Marker $StateObservation $CancelPath @binary
}
`)
  const source=await readFile('resources/graphify/launcher.ps1','utf8')
  for(const mode of ['success','fail']){
   const task=join(root,mode)
   await mkdir(task)
   const requestText=JSON.stringify(await requestFor(task,root))
   await writeFile(join(task,'request.json'),requestText)
   const script='$TaskFolder='+quote(task)+'\n$Resources='+quote(resources)+'\n$Generation='+quote(generation)+'\n$AnalysisRequestSha='+quote(requestHash(requestText))+'\n$Pins=@{}\n$Mode='+quote(mode)+'\n$FixturePython='+quote(python)+'\n$Fixture='+quote(fixture)+'\n'+String.raw`
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class FixtureGraphPipe {
  [DllImport("kernel32.dll")] static extern IntPtr GetStdHandle(int n);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool SetHandleInformation(IntPtr h,uint mask,uint flags);
  [DllImport("kernel32.dll",SetLastError=true)] static extern bool GetHandleInformation(IntPtr h,out uint flags);
  public static void ForceInherit() { if(!SetHandleInformation(GetStdHandle(-11),1,1)) throw new Exception("fixture cannot set inheritance"); }
  public static void RequirePrivate() {
    uint flags;
    if(!GetHandleInformation(GetStdHandle(-11),out flags)||(flags&1)!=0) throw new Exception("launcher stdout is inheritable");
  }
}
'@
[FixtureGraphPipe]::ForceInherit()
$env:MADNESS_TEST_GRAPH_TASK=$TaskFolder
`+'\n'+source
   const {stdout,stderr}=await exec(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:30000,encoding:'buffer'})
   const terminal=JSON.parse(await readFile(join(task,'terminal.json'),'utf8'))
   const diagnostic=await readFile(join(task,'launcher-error.txt'),'utf8').catch(e=>e.code==='ENOENT'?null:Promise.reject(e))
   const analysisReceipt=await readFile(join(task,'analysis-execution.json'),'utf8').catch(e=>e.code==='ENOENT'?null:Promise.reject(e))
   assert.equal(terminal.jobAssigned,true,JSON.stringify({diagnostic,analysisReceipt}))
   assert.equal(terminal.jobActive,0)
   assert.equal(stderr.length,0)
   for(const [step,exit] of [['mirror-input',0],['analysis',0],['terminal-capture',mode==='fail'?7:0]]){
    const observation=JSON.parse(await readFile(join(task,step+'-execution.json'),'utf8'))
    assert.deepEqual([observation.outcome,observation.exit,observation.job_assigned_before_resume,observation.job_active_after_stop],['completed',exit,true,0])
   }
   assert.deepEqual(await readFile(join(task,'analysis-stdout.json')),Buffer.from('worker-out\x00\xff','latin1'))
   assert.deepEqual(await readFile(join(task,'analysis-stderr.log')),Buffer.from('worker-err\x00\xfe','latin1'))
   assert.deepEqual(await readFile(join(task,'terminal-capture-stderr.log')),Buffer.from('compare-err\x00\xfd','latin1'))
   assert.deepEqual(await readFile(join(task,'mirror-input-stderr.log')),Buffer.from('mirror-err\x00\xfc','latin1'))
   await assert.rejects(readFile(join(task,'mirror-input-stdout.json')),{code:'ENOENT'})
   await checkMirrorRetention(task,true)
   const native=await readFile(join(task,artifact))
   const locks=JSON.parse(await readFile(join(task,'lock-observation.json'),'utf8'))
   assert.equal(locks.write,13)
   for(const name of ['graph.json','analysis'])assert.ok([5,32].includes(locks[name]),JSON.stringify(locks))
   await writeFile(join(task,artifact),native)
   assert.deepEqual(native,Buffer.from('{"name":"é"}\r\n'))
   assert.deepEqual(stdout,mode==='success'?expectedFrame(native):Buffer.alloc(0))
   assert.equal(diagnostic,mode==='success'?null:'GRAPH_CHILD_completed')
   await assert.rejects(readFile(join(task,'native-graph.json')),{code:'ENOENT'})
  }
 }finally{await rm(root,{recursive:true,force:true})}
})
