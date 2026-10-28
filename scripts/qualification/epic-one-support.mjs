// Primitives du harnais 1.11. Importer ce module ne lance rien et ne lit aucun profil.
import assert from 'node:assert/strict'
import {readFile,writeFile,mkdir,lstat,realpath,readdir,rename,unlink,open} from 'node:fs/promises'
import {resolve,join,dirname,relative,isAbsolute,sep,basename} from 'node:path'
import {createHash,randomUUID} from 'node:crypto'
import {execFile} from 'node:child_process'
import {promisify,isDeepStrictEqual} from 'node:util'
import {JsonStore} from '../../src/adapters/persistence/json-store.ts'
import {releaseVersion} from '../../src/adapters/release-version.ts'
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex')
export const samePath=(a,b)=>resolve(a).toLowerCase()===resolve(b).toLowerCase()
export const delay=ms=>new Promise(r=>setTimeout(r,ms))
class QualificationFailure extends Error { constructor(code){super(code);this.qualificationCode=code} }
export function check(value,code){if(!value)throw new QualificationFailure(code)}
export function inside(root,path){const actual=resolve(path),distance=relative(resolve(root),actual);check(distance&&!isAbsolute(distance)&&distance!=='..'&&!distance.startsWith('..'+sep),'PATH_OUTSIDE_OWNER');return actual}
export async function noLinks(path){
 let current=resolve(path)
 for(;;){const info=await lstat(current);check(!info.isSymbolicLink(),'SYMLINK_REFUSED');const parent=dirname(current);if(parent===current)break;current=parent}
 return resolve(path)
}
export async function claimOutput(path){
 check(isAbsolute(path),'ABSOLUTE_OUTPUT_REQUIRED');await noLinks(dirname(path))
 try{await mkdir(path,{recursive:false,mode:0o700})}catch(error){if(error.code==='EEXIST')throw Error('OUTPUT_ALREADY_EXISTS');throw error}
 return await realpath(path)
}
export async function benchOutput(historical,args=process.argv.slice(2)){
 const options=args.filter(a=>a.startsWith('--output='));check(options.length<=1,'DUPLICATE_OUTPUT')
 return options.length?claimOutput(resolve(options[0].slice(9))):historical
}
export async function verifyArtifact(executable,manifestPath){
 check(isAbsolute(executable)&&/\.exe$/i.test(executable),'ABSOLUTE_EXECUTABLE_REQUIRED');await noLinks(executable);await noLinks(manifestPath)
 const bytes=await readFile(manifestPath),manifest=JSON.parse(bytes),base=dirname(executable)
 check(manifest.version===releaseVersion,'VERSION_MISMATCH');assert.deepEqual(manifest.identity,{name:'madness',appId:'fr.madness.desktop',productName:'Madness',executableName:'Madness'},'IDENTITY_MISMATCH')
 check(/^\d+\.\d+\.\d+$/.test(manifest.versions?.electron??''),'ELECTRON_VERSION_MISSING')
 const entries=[['app.asar','asarSha256'],['bmad-script-runner.py','runnerSha256']],result={executable:await realpath(executable),executableSha256:sha256(await readFile(executable)),manifest:await realpath(manifestPath),manifestSha256:sha256(bytes),version:manifest.version,electron:manifest.versions.electron}
 for(const [name,key]of entries){const path=join(base,'resources',name);await noLinks(path);const actual=sha256(await readFile(path)),expected=manifest.artifacts?.find(a=>a.path==='win-unpacked/resources/'+name)?.sha256;check(/^[a-f0-9]{64}$/.test(expected??'')&&actual===expected,name==='app.asar'?'ASAR_MISMATCH':'RUNNER_MISMATCH');result[key]=actual}
 return result
}
export async function treeDigests(root){
 await noLinks(root);const result=[]
 async function visit(path){const info=await lstat(path);check(!info.isSymbolicLink(),'SYMLINK_REFUSED');if(info.isDirectory()){for(const name of(await readdir(path)).sort())await visit(join(path,name))}else{check(info.isFile(),'REGULAR_FILE_REQUIRED');result.push({path:relative(root,path).replaceAll('\\','/'),sha256:sha256(await readFile(path))})}}
 await visit(root);return result
}
export function readBenchResult(source,receipt,exitCode){
 check(['synthetic','loopback'].includes(source),'BENCH_SOURCE_REFUSED')
 const successful=['passed','checks-passed-live-installed-missing','checks-passed-live-missing','isolated-checks-passed-live-proof-separate','isolated-checks-passed-native-proof-separate'].includes(receipt?.status)
 const status=exitCode===0&&successful&&receipt.cleanup===true&&!receipt.failure&&!receipt.stopUnconfirmed?'passed':'failed'
 return {source,status,exitCode,cleanup:receipt?.cleanup===true,checks:Array.isArray(receipt?.checks)?receipt.checks.length:0,limits:Array.isArray(receipt?.limits)?receipt.limits:typeof receipt?.scope==='string'?[receipt.scope]:[]}
}
export function publicFailure(error){
 const code=['ENOENT','EACCES','EPERM','EBUSY','ENOTDIR'].includes(error?.code)?'FILESYSTEM_BOUNDARY':error?.name==='TimeoutError'?'AUTOMATION_TIMEOUT':error instanceof QualificationFailure&&/^[A-Z][A-Z0-9_]{2,100}$/.test(error.qualificationCode)?error.qualificationCode:'CONTROLLER_FAILED'
 return {code}
}
export function personalEnvironment(env=process.env){
 check(!env.MADNESS_DATA_HOME&&!env.NODE_OPTIONS&&env.NODE_TLS_REJECT_UNAUTHORIZED!=='0'&&!env.ELECTRON_RUN_AS_NODE,'UNSAFE_PERSONAL_ENVIRONMENT')
 const allowed=['PATH','SYSTEMROOT','WINDIR','COMSPEC','PATHEXT','TEMP','TMP','USERPROFILE','HOMEDRIVE','HOMEPATH','APPDATA','LOCALAPPDATA','HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY','SSL_CERT_FILE','SSL_CERT_DIR','NODE_EXTRA_CA_CERTS']
 return Object.fromEntries(Object.entries(env).filter(([key])=>allowed.includes(key.toUpperCase())))
}
export function assertClosed(evidence){check(evidence?.mainGone===true&&evidence.childrenGone===true&&evidence.closeObserved===true,'OWNED_CLOSE_UNCONFIRMED')}
export async function bounded(work,ms,code='OPERATION_TIMEOUT'){
 let timer;try{return await Promise.race([Promise.resolve().then(work),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(code)),ms)})])}finally{clearTimeout(timer)}
}
const execute=promisify(execFile)
export async function windowsInventory(executable){
 check(process.platform==='win32','WINDOWS_REQUIRED');const quoted=resolve(executable).replaceAll("'","''")
 const script="$ErrorActionPreference='Stop'; @(Get-CimInstance Win32_Process | Where-Object {$_.ExecutablePath -ieq '"+quoted+"'} | Select-Object ProcessId,ParentProcessId) | ConvertTo-Json -Compress"
 const {stdout}=await execute('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:15000,maxBuffer:65536})
 const value=stdout.trim()?JSON.parse(stdout):[];return Array.isArray(value)?value:[value]
}
export async function assertNoApplication(executable){check((await windowsInventory(executable)).length===0,'APPLICATION_ALREADY_RUNNING');return true}
export async function profileOwnerInventory(){
 check(process.platform==='win32','WINDOWS_REQUIRED')
 // Lecture seulement, tous chemins/sessions : une copie déplacée/renommée du
 // paquet ou Electron dev ne doit pas être absente du contrôle de fermeture.
 // Aucune ligne de commande ni environnement n'est exporté ou conservé.
 const script=`$ErrorActionPreference='Stop'; $owners=@(); foreach($p in Get-CimInstance Win32_Process){
  $kind=$null
  if($p.Name -ieq 'Madness.exe'){$kind='madness'}
  elseif($p.Name -ieq 'electron.exe'){$kind='electron-uncertain'}
  elseif($p.ExecutablePath){try{$product=[Diagnostics.FileVersionInfo]::GetVersionInfo($p.ExecutablePath).ProductName; if($product -ieq 'Madness'){$kind='madness-renamed'}elseif($product -ieq 'Electron'){$kind='electron-renamed-uncertain'}}catch{}}
  if($kind){$owners+=@{pid=[int]$p.ProcessId;kind=$kind}}
 }; ConvertTo-Json -InputObject @($owners) -Compress`
 const {stdout}=await execute('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,timeout:15000,maxBuffer:65536})
 const values=JSON.parse(stdout);check(Array.isArray(values),'PROFILE_INVENTORY_UNCERTAIN');return values
}
export async function assertProfileClosed({inventory=profileOwnerInventory}={}){
 const owners=await inventory();check(Array.isArray(owners),'PROFILE_INVENTORY_UNCERTAIN');check(owners.length===0,'POSSIBLE_PROFILE_OWNER');return true
}

// Archive privée locale : aucun dossier de coffre/session n'est lu ni copié.
// Le callback est aussi réexécuté immédiatement avant chaque mutation du profil.
export async function archiveWitnessData({profile,witness,projectId,closed,reopened,assertNoApp}){
 check(closed===true&&reopened===true&&typeof assertNoApp==='function','CLOSED_REOPENED_REQUIRED');check(await assertNoApp()===true,'PROFILE_OPEN')
 await noLinks(profile);await noLinks(witness)
 const marker=JSON.parse(await readFile(join(witness,'.epic-one-witness.json'),'utf8'));check(marker.owner==='madness-epic-one'&&typeof marker.id==='string','WITNESS_NOT_OWNED')
 const snapshotPath=join(profile,'madness-state-v1.json');await noLinks(snapshotPath);const store=new JsonStore(snapshotPath),before=await store.read(),beforeBytes=await readFile(snapshotPath)
 const projects=before.projects.filter(p=>p.id===projectId);check(projects.length===1&&samePath(projects[0].rootPath,witness),'WITNESS_PROJECT_MISMATCH')
 const chats=before.conversations.filter(c=>c.context.projectId===projectId),chatIds=new Set(chats.map(c=>c.id)),drafts=before.drafts.filter(d=>d.projectId===projectId),annexes=[],retained=[]
 for(const folder of ['questions-v1','approvals-v1','workflows-v1']){
  const directory=join(profile,folder);try{await noLinks(directory)}catch(e){if(e.code==='ENOENT')continue;throw e}
  for(const name of(await readdir(directory)).sort()){
   check(/^[A-Za-z0-9_-]+\.json$/.test(name),'ANNEX_FILENAME_REFUSED');const path=join(directory,name);await noLinks(path);const bytes=await readFile(path),value=JSON.parse(bytes)
   const entry={folder,name,path,bytes,sha256:sha256(bytes)}
   if(value.context?.projectId===projectId){check(chatIds.has(value.context.conversationId),'ANNEX_CONTEXT_MISMATCH');annexes.push(entry)}else retained.push(entry)
  }
 }
 const parent=join(profile,'test-project-archives');await mkdir(parent,{recursive:true,mode:0o700});await noLinks(parent)
 const archive=join(parent,'epic-one-'+randomUUID());await mkdir(archive,{mode:0o700})
 await writeFile(join(archive,'archived-projects.json'),JSON.stringify({schemaVersion:1,sourceSnapshotSha256:sha256(beforeBytes),sourceRevision:before.revision,activeProjectIdBefore:before.activeProjectId,projects,conversations:chats,drafts,witnessDirectoryPreserved:witness},null,2)+'\n',{flag:'wx',mode:0o600})
 for(const item of annexes){const target=inside(archive,join(archive,item.folder,item.name));await mkdir(dirname(target),{recursive:true,mode:0o700});await writeFile(target,item.bytes,{flag:'wx',mode:0o600});check(sha256(await readFile(target))===item.sha256,'ARCHIVE_COPY_MISMATCH')}
 const after={...before,revision:before.revision+1,projects:before.projects.filter(p=>p.id!==projectId),conversations:before.conversations.filter(c=>c.context.projectId!==projectId),drafts:before.drafts.filter(d=>d.projectId!==projectId)}
 if(after.activeProjectId===projectId)after.activeProjectId=after.projects[0]?.id??null
 const removed=[];let changed=false
 try{
  check(await assertNoApp()===true,'PROFILE_OPEN');check(sha256(await readFile(snapshotPath))===sha256(beforeBytes),'SNAPSHOT_CHANGED')
  await store.write(after);changed=true
  for(const item of annexes){check(await assertNoApp()===true,'PROFILE_OPEN');check(sha256(await readFile(item.path))===item.sha256,'ANNEX_CHANGED');await unlink(item.path);removed.push(item)}
  assert.deepEqual(JSON.parse(await readFile(snapshotPath,'utf8')),after,'ARCHIVE_SNAPSHOT_MISMATCH');for(const item of retained)check(sha256(await readFile(item.path))===item.sha256,'OTHER_ANNEX_CHANGED')
  const result={status:'archived',archivedConversations:chats.length,archivedDrafts:drafts.length,archivedAnnexes:annexes.length,archive,witnessDirectoryPreserved:true}
  await writeFile(join(archive,'cleanup-result.json'),JSON.stringify(result)+'\n',{flag:'wx'});return result
 }catch(error){
  // Ne jamais restaurer sur un profil ouvert ou sur des octets modifiés entretemps.
  if(await assertNoApp()===true){for(const item of removed)await writeFile(item.path,item.bytes,{flag:'wx',mode:0o600});if(changed&&isDeepStrictEqual(JSON.parse(await readFile(snapshotPath,'utf8')),after))await store.write(before)}
  await writeFile(join(archive,'cleanup-failed.json'),JSON.stringify(publicFailure(error))+'\n',{flag:'wx'});throw error
 }
}
