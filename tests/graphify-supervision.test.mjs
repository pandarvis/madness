import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join,resolve} from 'node:path'
import {realpathSync} from 'node:fs'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
const exec=promisify(execFile),quote=s=>"'"+s.replaceAll("'","''")+"'"
const pwsh=join(process.env.USERPROFILE,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
for(const [mode,expected] of [['missing-zero',null],['no-observation',null],['positive-active',null],['known-zero-after-throw',0],['normal',0]])test('HIGH-2 actual PowerShell launcher aggregates second child '+mode,async()=>{const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-graph-aggregate-')));try{const resources=join(root,'resources'),task=join(root,'task');await mkdir(resources);await mkdir(task);await writeFile(join(resources,'preflight.ps1'),'function Assert-BmadChain($Path){}\nfunction Assert-GraphClosedRuntime($Root,$Files){}\nAdd-Type -TypeDefinition \'public static class GraphClosedRuntime { public static void CopyArtifact(string source, string target) { System.IO.File.Copy(source, target); } }\'\n');await writeFile(join(resources,'assembly.json'),'{}');await writeFile(join(task,'request.json'),JSON.stringify({op:'analyze',prepared:join(root,'prepared')}));const supervisor=String.raw`$script:childNumber=0
function Invoke-BmadSupervised($Start,$TimeoutMs,$StatePath,$OwnedPaths,$Owner,$OutLog,$ErrLog,$Marker,[ref]$StateObservation,$CancelPath){
 $script:childNumber++
 $value=@{started=$true;job_assigned_before_resume=$true;outcome='completed';exit=0;job_active_after_stop=0}
 if($script:childNumber -eq 1){$StateObservation.Value=$value;[void][IO.Directory]::CreateDirectory((Join-Path $Owner 'analysis/out/graphify-out'));[IO.File]::WriteAllText((Join-Path $Owner 'analysis/worker.json'),'{'+'"outcome":"completed"'+'}');[IO.File]::WriteAllText((Join-Path $Owner 'analysis/out/graphify-out/graph.json'),'{}');[IO.File]::WriteAllText($OutLog,'{}');return $value}
 switch($Mode){
 'missing-zero'{$value.Remove('job_active_after_stop');$StateObservation.Value=$value;throw 'injected-final-persistence-failure'}
 'no-observation'{$StateObservation.Value=$null;throw 'injected-before-observation'}
 'positive-active'{$value.job_active_after_stop=1;$StateObservation.Value=$value;throw 'injected-unconfirmed-stop'}
 'known-zero-after-throw'{$StateObservation.Value=$value;throw 'injected-after-proven-stop'}
 default{$StateObservation.Value=$value;[IO.File]::WriteAllText($OutLog,'{}');return $value}
 }
}
`;await writeFile(join(resources,'supervision.ps1'),supervisor);const source=await readFile('resources/graphify/launcher.ps1','utf8'),script='$TaskFolder='+quote(task)+'\n$Resources='+quote(resources)+'\n$Generation='+quote('graph-11111111-1111-1111-1111-111111111111')+'\n$Pins=@{}\n$Mode='+quote(mode)+'\n'+source;await exec(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:20000,maxBuffer:1024*1024});const terminal=JSON.parse(await readFile(join(task,'terminal.json'),'utf8'));assert.equal(terminal.jobActive,expected);assert.equal(terminal.neverStarted,false);assert.equal(terminal.jobAssigned,true);if(mode==='normal'){assert.deepEqual(JSON.parse(await readFile(join(task,'result.json'),'utf8')),{});await assert.rejects(readFile(join(task,'launcher-error.txt')),{code:'ENOENT'})}else{const error=await readFile(join(task,'launcher-error.txt'),'utf8');assert.match(error,/^injected-/)}}finally{await rm(root,{recursive:true,force:true})}})
