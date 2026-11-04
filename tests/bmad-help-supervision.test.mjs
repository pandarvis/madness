import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,rm,readFile,writeFile,mkdir,copyFile} from 'node:fs/promises'
import {realpathSync} from 'node:fs'
import {join,resolve,basename} from 'node:path'
import {tmpdir} from 'node:os'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createHash} from 'node:crypto'
import {ownedTemp,finishFixture} from '../_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-latence-runtime/fixture.mjs'
const execute=promisify(execFile)
const pwsh=join(process.env.USERPROFILE,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
const quote=s=>"'"+s.replaceAll("'","''")+"'"
test('real Windows Job owns descendants before Resume and returns finitely for root0, timeout, overflow and start failure',async()=>{
 const owner=await ownedTemp('madness-help-job-'),root=owner.root
 const artifact=resolve('_bmad-output/initiative-madness/.working/help22-supervision-cases',basename(root))
 const caseCeilingMs=15000,startupCeilingMs=15000
 const programs=[
  ['normal','[Console]::Write("ok")',3000],
  ['orphan','$s=[Diagnostics.ProcessStartInfo]::new('+quote(pwsh)+');$s.UseShellExecute=$false;foreach($a in @("-NoProfile","-NonInteractive","-Command","[Threading.Thread]::Sleep(30000)")){[void]$s.ArgumentList.Add($a)};$p=[Diagnostics.Process]::Start($s);[Console]::Write("child:"+$p.Id);exit 0',4000],
  ['timeout','[Console]::Write("ready");[Threading.Thread]::Sleep(30000)',1500],
  ['overflow','[Console]::Write(("x"*4300000))',4000],
  ['missing','',1000]
 ]
 const controllerTimeoutMs=programs.length*caseCeilingMs+startupCeilingMs
 let controllerFailure=null,controllerComplete=false
 try{
  const resource=resolve('resources/bmad-help')
  const lines=["$ErrorActionPreference='Stop'","$startup=[Diagnostics.Stopwatch]::StartNew()",'. '+quote(join(resource,'preflight.ps1')),'. '+quote(join(resource,'supervision.ps1')),
   "$phase=[ordered]@{startup_ms=$startup.ElapsedMilliseconds;case_ceiling_ms="+caseCeilingMs+";controller_timeout_ms="+controllerTimeoutMs+";cases=@()}",
   '[IO.File]::WriteAllText('+quote(join(root,'phases.json'))+',($phase|ConvertTo-Json -Depth 8))']
  for(const [name,program,timeout] of programs){
   lines.push('$caseClock=[Diagnostics.Stopwatch]::StartNew();$s=[Diagnostics.ProcessStartInfo]::new('+quote(name==='missing'?join(root,'missing.exe'):pwsh)+')')
   if(program)lines.push('foreach($a in @("-NoProfile","-NonInteractive","-EncodedCommand",'+quote(Buffer.from(program,'utf16le').toString('base64'))+')){[void]$s.ArgumentList.Add($a)}')
   lines.push('$s.UseShellExecute=$false;$s.CreateNoWindow=$true;$s.WorkingDirectory='+quote(root))
   lines.push('$state=$null;$r=Invoke-BmadSupervised $s '+timeout+' '+quote(join(root,name+'.json'))+' @() '+quote(root)+' '+quote(join(root,name+'.out'))+' '+quote(join(root,name+'.err'))+" '' ([ref]$state)")
   lines.push('$phase.cases+=@{name='+quote(name)+';duration_ms=$caseClock.ElapsedMilliseconds;outcome=$r.outcome;state_elapsed_ms=$r.elapsed_ms};[IO.File]::WriteAllText('+quote(join(root,'phases.json'))+',($phase|ConvertTo-Json -Depth 8))')
  }
  try{await execute(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(lines.join('\n'),'utf16le').toString('base64')],{windowsHide:true,timeout:controllerTimeoutMs,maxBuffer:65536})}
  catch(e){controllerFailure={code:e.code??null,killed:e.killed??null,signal:e.signal??null};throw Error('SUPERVISION_CONTROLLER_FAILED '+JSON.stringify(controllerFailure)+' evidence='+artifact)}
  controllerComplete=true
  const phase=JSON.parse(await readFile(join(root,'phases.json'),'utf8'))
  assert.equal(phase.cases.length,programs.length)
  assert.ok(phase.startup_ms+phase.cases.reduce((sum,c)=>sum+c.duration_ms,0)<controllerTimeoutMs,'complete return within controller phase budget')
  for(const [name] of programs){
   const state=JSON.parse(await readFile(join(root,name+'.json'),'utf8'))
   const measured=phase.cases.find(c=>c.name===name)
   assert.ok(state.elapsed_ms<caseCeilingMs,name+' finite return')
   assert.ok(Number.isFinite(measured.duration_ms)&&measured.duration_ms>0,name+' complete duration observed')
   if(name==='missing'){assert.equal(state.outcome,'start-failed');assert.equal(state.started,false);continue}
   assert.equal(state.job_assigned_before_resume,true,name)
   assert.equal(state.job_active_after_stop,0,name)
   if(name==='normal')assert.equal(state.outcome,'completed')
   if(name==='orphan'){assert.equal(state.outcome,'descendants-stopped');assert.match(await readFile(join(root,'orphan.out'),'utf8'),/child:\d+/)}
   if(name==='timeout')assert.equal(state.outcome,'timeout')
   if(name==='overflow')assert.equal(state.outcome,'output-limit')
  }
  console.log(JSON.stringify({artifact,phase}))
 }finally{
  await mkdir(artifact,{recursive:true})
  for(const name of ['phases.json',...programs.flatMap(([name])=>[name+'.json',name+'.out',name+'.err'])])await copyFile(join(root,name),join(artifact,name)).catch(e=>{if(e.code!=='ENOENT')throw e})
  await writeFile(join(artifact,'controller.json'),JSON.stringify({controllerTimeoutMs,startupCeilingMs,caseCeilingMs,controllerFailure,supervisionSha256:createHash('sha256').update(await readFile(resolve('resources/bmad-help/supervision.ps1'))).digest('hex')},null,2)+'\n')
  const states=await Promise.all(programs.map(async([name])=>{try{return JSON.parse(await readFile(join(root,name+'.json'),'utf8'))}catch{return null}}))
  const cleanup=await finishFixture(owner,{id:owner.id,root,controllerComplete,states})
  await writeFile(join(artifact,'fixture.json'),JSON.stringify({owner,controllerComplete,states,cleanup},null,2)+'\n')
  if(!cleanup.removed)console.error(JSON.stringify({retainedHelpFixture:root,artifact,cleanup}))
 }
})

test('failure after suspended root creation stays started and cannot become a never-started stop proof',async()=>{
 const {writeFile,access,mkdir}=await import('node:fs/promises')
 const owner=await ownedTemp('madness-help-job-start-'),folder=owner.root
 let controllerComplete=false
 try{
  const original=await readFile(resolve('resources/bmad-help/supervision.ps1'),'utf8')
  const needle='Require(AssignProcessToJobObject(owned.job,owned.process));'
  assert.ok(original.includes(needle))
  const fault=join(folder,'supervision-fault.ps1')
  await writeFile(fault,original.replace(needle,'Require(false);'))
  const marker=join(folder,'must-not-run'),program='[IO.File]::WriteAllText('+quote(marker)+',"BAD")'
  const script=["$ErrorActionPreference='Stop'",'. '+quote(resolve('resources/bmad-help/preflight.ps1')),'. '+quote(fault),'$s=[Diagnostics.ProcessStartInfo]::new('+quote(pwsh)+')','foreach($a in @("-NoProfile","-NonInteractive","-EncodedCommand",'+quote(Buffer.from(program,'utf16le').toString('base64'))+')){[void]$s.ArgumentList.Add($a)}','$s.WorkingDirectory='+quote(folder)+';$s.UseShellExecute=$false;$s.CreateNoWindow=$true','$state=$null;$r=Invoke-BmadSupervised $s 1500 '+quote(join(folder,'state.json'))+' @() '+quote(folder)+' '+quote(join(folder,'stdout'))+' '+quote(join(folder,'stderr'))+" '' ([ref]$state)"].join('\n')
  await execute(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:30000,maxBuffer:65536})
  controllerComplete=true
  const state=JSON.parse(await readFile(join(folder,'state.json'),'utf8'))
  assert.equal(state.started,true)
  assert.equal(state.start_observation,'root-created-before-failure')
  assert.equal(state.job_assigned_before_resume,false)
  assert.equal(state.outcome,'supervision-error')
  assert.equal(state.job_active_after_stop,undefined)
  await assert.rejects(access(marker))
 }finally{
  const artifact=resolve('_bmad-output/initiative-madness/tickets/epic-projets-bmad/qualification-latence-runtime/logs',basename(folder));await mkdir(artifact,{recursive:true})
  for(const name of ['state.json','stdout','stderr'])await copyFile(join(folder,name),join(artifact,name)).catch(e=>{if(e.code!=='ENOENT')throw e})
  let state=null;try{state=JSON.parse(await readFile(join(folder,'state.json'),'utf8'))}catch{}
  const cleanup=await finishFixture(owner,{id:owner.id,root:folder,controllerComplete,states:[state]})
  await writeFile(join(artifact,'fixture.json'),JSON.stringify({owner,controllerComplete,state,cleanup},null,2)+'\n')
  if(!cleanup.removed)console.error(JSON.stringify({retainedHelpFixture:folder,artifact,cleanup}))
 }
})

