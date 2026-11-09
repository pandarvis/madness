import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises'
import {realpathSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {resolve,join,dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {helpResourcePins} from '../../src/adapters/bmad/help-manifest.ts'
const execute=promisify(execFile),quote=s=>"'"+s.replaceAll("'","''")+"'"
export async function runHelpSourcesCase(source){
 const temporary=await mkdtemp(join(tmpdir(),'madness-help-boundaries-')),root=realpathSync.native(temporary)
 let cleanupSafe=false
 try{
  const resources=resolve('resources/bmad-help'),runtime=join(root,'python'),snapshot=join(root,'resources')
  await mkdir(join(runtime,'Lib/site-packages'),{recursive:true});await mkdir(snapshot)
  const manifest=JSON.parse(await readFile(join(resources,'runtime.json'),'utf8'))
  const origin=resolve('resources/graphify/assembly/runtime')
  let index=0
  await Promise.all(Array.from({length:16},async()=>{while(index<manifest.files.length){const file=manifest.files[index++],raw=await readFile(join(origin,file.name));if(createHash('sha256').update(raw).digest('hex')!==file.sha256)throw Error('Original runtime mismatch');const target=join(runtime,file.name);await mkdir(dirname(target),{recursive:true});await writeFile(target,raw,{flag:'wx'})}}))
  const modules={}
  for(const [name,pin] of Object.entries(helpResourcePins)){const raw=await readFile(join(resources,name));if(createHash('sha256').update(raw).digest('hex')!==pin)throw Error('Resource pin mismatch');await writeFile(join(snapshot,name),raw);if(name.endsWith('.py')&&name!=='bootstrap.py')modules[name.slice(0,-3)]=pin}
  await writeFile(join(snapshot,'cases.py'),source);modules.cases=createHash('sha256').update(source).digest('hex')
  const pwsh=join(process.env.USERPROFILE,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe'),uv=resolve('resources/runtime-tools/uv.exe')
  const bootstrap=await readFile(join(snapshot,'bootstrap.py'),'utf8')
  const args=['run','--offline','--no-project','--no-config','--no-cache','--python',join(runtime,'python.exe'),'--',join(runtime,'python.exe'),'-I','-S','-B','-c',bootstrap,snapshot,snapshot,JSON.stringify(modules),'cases',root]
  const preflight=["$guards=[Collections.Generic.List[string]]::new()"]
  for(const [name,path] of [['sitecustomize',join(runtime,'Lib/site-packages/sitecustomize.py')],['cache',join(runtime,'Lib/__pycache__/not-admitted.pyc')],['parent-venv',join(root,'pyvenv.cfg')]]){
   preflight.push('[void][IO.Directory]::CreateDirectory('+quote(dirname(path))+');[IO.File]::WriteAllText('+quote(path)+',"NEVER_EXECUTE")')
   preflight.push("$refused=$false;try{Assert-BmadClosedRuntime "+quote(runtime)+" $m.files}catch{$refused=$true};if(-not $refused){throw 'PREFLIGHT_DID_NOT_REFUSE'}")
   preflight.push('[IO.File]::Delete('+quote(path)+');$guards.Add('+quote(name)+')')
   if(name==='cache')preflight.push('[IO.Directory]::Delete('+quote(dirname(path))+',$false)')
  }
  preflight.push('[IO.File]::WriteAllText('+quote(join(root,'preflight.json'))+',($guards.ToArray()|ConvertTo-Json -Compress))')
  const script=["$ErrorActionPreference='Stop'",'. '+quote(join(snapshot,'preflight.ps1')),'. '+quote(join(snapshot,'supervision.ps1')),'$m=Get-Content -LiteralPath '+quote(join(snapshot,'runtime.json'))+' -Raw|ConvertFrom-Json','Assert-BmadClosedRuntime '+quote(runtime)+' $m.files',...preflight,
  '$s=[Diagnostics.ProcessStartInfo]::new('+quote(uv)+')','foreach($a in @('+args.map(quote).join(',')+')){[void]$s.ArgumentList.Add($a)}','$s.WorkingDirectory='+quote(root)+';$s.UseShellExecute=$false;$s.CreateNoWindow=$true',
  '$state=$null;$r=Invoke-BmadSupervised $s 120000 '+quote(join(root,'execution.json'))+' @() '+quote(root)+' '+quote(join(root,'stdout.json'))+' '+quote(join(root,'stderr.log'))+" '' ([ref]$state)"].join('\n')
  await execute(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:180000,maxBuffer:65536})
  const execution=JSON.parse(await readFile(join(root,'execution.json'),'utf8')),stdout=await readFile(join(root,'stdout.json'),'utf8'),stderr=await readFile(join(root,'stderr.log'),'utf8')
  cleanupSafe=execution.outcome!=='running'&&execution.job_active_after_stop===0
  if(execution.outcome!=='completed'||execution.exit!==0)throw Error(JSON.stringify({execution,stdout,stderr}))
  return {value:JSON.parse(stdout),execution,preflight:JSON.parse(await readFile(join(root,'preflight.json'),'utf8'))}
 }finally{if(cleanupSafe)await rm(root,{recursive:true,force:true});else console.error(JSON.stringify({retainedHelpFixture:root,reason:'terminal Job stop proof unavailable; no cleanup attempted'}))}
}
