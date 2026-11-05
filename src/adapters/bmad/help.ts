import type {StoryAuthority,StoryEvidence} from '../../core/us-metrics.ts'
import type {FileAuthority} from '../../core/project-files.ts'
import {realpath as nativeRealpath} from 'node:fs'
import {promisify} from 'node:util'
import {spawn} from 'node:child_process'
import {createHash,randomUUID} from 'node:crypto'
import {mkdir,readFile,writeFile,open,lstat,realpath,rm} from 'node:fs/promises'
import {dirname,join,resolve,isAbsolute,relative,sep} from 'node:path'
import {TextDecoder} from 'node:util'
import {dialogueFailure} from '../../contracts/dialogue.ts'
import {isHelpBundle,requiredHelpSources,helpContextText} from '../../contracts/bmad-help.ts'
import type {HelpBundle,HelpToolReceipt} from '../../contracts/bmad-help.ts'
import type {BmadProfile} from '../../core/ports.ts'
import {helpResourcePins} from './help-manifest.ts'
import {HelpOwnedRun} from './help-owned-run.ts'
import type {ObservationHints} from './change-observer.ts'
const canonical=promisify(nativeRealpath.native)
async function directory(path:string):Promise<string>{for(let p=resolve(lexicalPath(path));;p=dirname(p)){const s=await lstat(p);if(!s.isDirectory()||s.isSymbolicLink())throw dialogueFailure('PROFILE_UNRECOGNIZED');if(dirname(p)===p)break}return canonical(path)}
const lexicalPath=(path:string):string=>path.startsWith('\\\\?\\UNC\\')?'\\\\'+path.slice(8):path.startsWith('\\\\?\\')?path.slice(4):path
const sha=(v:Buffer|string):string=>createHash('sha256').update(v).digest('hex')
const pwshPin='9660387054b1387f5ab7e907a61560674c762559f91279a50484240bb3659d53'
async function safe(path:string,limit=32*1024*1024):Promise<Buffer>{
 for(let p=resolve(lexicalPath(path));;p=dirname(p)){const s=await lstat(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw dialogueFailure('PROFILE_UNRECOGNIZED');if(dirname(p)===p)break}
 const f=await open(path,'r');try{const before=await f.stat();if(!before.isFile()||before.size>limit)throw dialogueFailure('OUTPUT_REFUSED');const bytes=await f.readFile();const after=await f.stat();if(before.ino!==after.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs||bytes.length>limit)throw dialogueFailure('PROFILE_CHANGED');return bytes}finally{await f.close()}
}
export type HelpAdapterOptions={root:string;resources:string;owner:HelpOwnedRun;onUnknown?():void;admission?:{enter(kind:'provider'|'helper',nested?:boolean):()=>void};admit?(internal:boolean):Promise<void>;roots?(project:string):string[]}
export class BmadHelpAdapter{
 private storyCaptures=new WeakMap<object,StoryAuthority>();
 storyAuthority(value:object):StoryAuthority|undefined{return this.storyCaptures.get(value)}
 private fileCaptures=new WeakMap<object,FileAuthority>();
 filesAuthority(value:object):FileAuthority|undefined{return this.fileCaptures.get(value)}
 private async captureFiles<T extends {projectId:string;rootPath:string;rootIdentity:string;revision:string;observedAt:string;sources:{id:string;path:string;sha256:string;bytes:number}[]}>(value:T,folder:string,grant:any):Promise<T>{
  if(!grant||grant.rootIdentity!==value.rootIdentity||grant.revision!==value.revision||!['progress','catalog'].includes(grant.producer)||!Array.isArray(grant.sources)||grant.sources.length>2048)throw dialogueFailure('PROFILE_CHANGED')
  const sources=grant.sources.map((s:any)=>{const source=value.sources.find(v=>v.id===s.id);if(!source||source.path!==s.path||source.sha256!==s.sha256||source.bytes!==s.bytes)throw dialogueFailure('PROFILE_CHANGED');return Object.freeze({id:s.id,path:s.path,sha256:s.sha256,bytes:s.bytes})})
  const receiptSha=grant.refusal?null:sha(await safe(join(folder,'files.json'),4*1024*1024)),producer=grant.producer,revision=value.revision
  const operate=async(sourceId:string,signal:AbortSignal,read:boolean):Promise<any>=>{
   if(!sources.some((s:any)=>s.id===sourceId))throw dialogueFailure('PROFILE_CHANGED')
   if(sha(await safe(join(folder,'files.json'),4*1024*1024))!==receiptSha)throw dialogueFailure('PROFILE_CHANGED')
   try{const {result}=await this.run({op:read?'files-read':'files-verify',prepared:folder,receiptSha,producer,revision,sourceId},signal,false);return result}catch(e){const detail=String((e as {detail?:string}).detail??'');const code=/^(PREVIEW_TYPE|PREVIEW_UTF8|PREVIEW_BINARY|FILE_LIMIT)(:|$)/.exec(detail)?.[1];if(code)throw Object.assign(new Error(code),{code});throw e}
  }
  this.fileCaptures.set(value,Object.freeze({...(typeof grant.refusal==='string'?{refusal:grant.refusal}:{}),producer,projectId:value.projectId,rootPath:value.rootPath,rootIdentity:value.rootIdentity,initiativeId:grant.initiativeId??null,revision,observedAt:value.observedAt,sources,read:(id:string,signal:AbortSignal)=>operate(id,signal,true),verify:(id:string,signal:AbortSignal)=>operate(id,signal,false)}))
  return value
 }
 private captures=new WeakMap<object,ObservationHints>();
 dependencies(value:object):ObservationHints|undefined{return this.captures.get(value)}
 private captured<T extends object>(value:T,hints:ObservationHints|undefined):T{if(hints)this.captures.set(value,hints);return value}
 private contextWaiters=0;private operation:unknown=null
 private closing=false;private pending:Promise<void>|null=null;private runtimeId='runtime-'+randomUUID();private options:HelpAdapterOptions;private busy=false;private preparations=new Map<string,{bundle:HelpBundle;folder:string;captureSha:string}>()
 constructor(options:HelpAdapterOptions){this.options=options}
 private async run(request:Record<string,unknown>,signal:AbortSignal,internal=false):Promise<any>{
  if(this.closing)throw dialogueFailure('APP_CLOSING')
  // Consultation and captured guards share this one owner. Waiting never borrows a stop proof.
  if(this.busy&&internal&&(request.op==='context'||request.op==='context-config'||this.operation==='context'||this.operation==='context-config')){
   if(this.contextWaiters>=64)throw dialogueFailure('BUSY')
   this.contextWaiters++
   try{while(this.busy){await this.pending;signal.throwIfAborted();if(this.closing)throw dialogueFailure('APP_CLOSING')}}finally{this.contextWaiters--}
  }
  if(this.busy)throw dialogueFailure('BUSY');const release=this.options.admission?.enter('helper',internal);let finish!:()=>void;this.pending=new Promise(r=>finish=r);this.busy=true;this.operation=request.op
  let folder='',generation='',closed=false,spawned=false
  try{
   signal.throwIfAborted();await this.options.admit?.(internal)
   let ownerStatus:'stopped'|'unknown';try{ownerStatus=await this.options.owner.status()}catch{this.options.onUnknown?.();throw dialogueFailure('STOP_UNCONFIRMED')}if(ownerStatus!=='stopped'){this.options.onUnknown?.();throw dialogueFailure('STOP_UNCONFIRMED')}
   const user=process.env.USERPROFILE;if(process.platform!=='win32'||!user)throw dialogueFailure('RESOLVER_FAILED')
   const pwsh=join(user,'.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
   if(sha(await safe(pwsh))!==pwshPin)throw dialogueFailure('RESOLVER_FAILED')
   await mkdir(this.options.root,{recursive:true});await realpath(this.options.root)
   folder=join(await directory(this.options.root),'operation-'+randomUUID());generation=await this.options.owner.begin(folder)
   await mkdir(join(folder,'resources'))
   for(const [name,pin] of Object.entries(helpResourcePins)){const bytes=await safe(join(this.options.resources,name));if(sha(bytes)!==pin)throw dialogueFailure('PROFILE_CHANGED');await writeFile(join(folder,'resources',name),bytes,{flag:'wx'})}
   const data=join(folder,'data');await mkdir(data)
   await writeFile(join(folder,'request.json'),JSON.stringify({...request,folder:data}),{flag:'wx'})
   await writeFile(join(folder,'pins.json'),JSON.stringify(helpResourcePins),{flag:'wx'})
   const runtimeFolder=join(await directory(this.options.root),this.runtimeId)
   const script="$RuntimeFolder='"+runtimeFolder.replaceAll("'","''")+"'\n$TaskFolder='"+folder.replaceAll("'","''")+"'\n$Generation='"+generation+"'\n"+new TextDecoder('utf-8',{fatal:true}).decode(await safe(join(folder,'resources/launcher.ps1')))
   const child=spawn(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,shell:false,stdio:['ignore','ignore','pipe']})
   spawned=child.pid!==undefined
   let errors=0;child.stderr.on('data',b=>{errors+=b.length})
   // Cancellation signals the live owner; killing PowerShell would lose the Job proof.
   const cancel=():void=>{void this.options.owner.cancel().catch(()=>{})};signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)cancel()
   let timer:ReturnType<typeof setTimeout>|undefined
   try{await Promise.race([new Promise<void>((done,fail)=>{child.once('close',()=>done());child.once('error',fail)}),new Promise<never>((_,fail)=>{timer=setTimeout(()=>{cancel();fail(dialogueFailure('STOP_UNCONFIRMED'))},240000)})])}finally{clearTimeout(timer);signal.removeEventListener('abort',cancel)}
   closed=await this.options.owner.confirm(generation)==='stopped'
   if(!closed)throw dialogueFailure('STOP_UNCONFIRMED')
   signal.throwIfAborted()
   let execution:any;try{execution=JSON.parse((await safe(join(folder,'execution.json'),65536)).toString('utf8'))}catch{throw dialogueFailure('RESOLVER_FAILED')}
   const raw=new TextDecoder('utf-8',{fatal:true}).decode(await safe(join(folder,'stdout.json'),4*1024*1024))
   const result=JSON.parse(raw)
   const hints=result._observationHints as ObservationHints|undefined;delete result._observationHints
   const fileGrant=result._fileGrant;delete result._fileGrant
   const storyEvidence=result._storyEvidence;delete result._storyEvidence
   if(result._timings){await writeFile(join(folder,'native-timings.json'),JSON.stringify(result._timings));delete result._timings}
   if(execution.outcome!=='completed'||execution.exit!==0||errors>65536||result.error)throw Object.assign(dialogueFailure('RESOLVER_FAILED'),{detail:result.error})
   return {result,folder:data,raw,hints,fileGrant,storyEvidence}
  }finally{
   try{
    if(generation&&!spawned){await writeFile(join(folder,'terminal.json'),JSON.stringify({schemaVersion:1,generation,purpose:'bmad-readonly',terminal:true,jobAssigned:false,jobActive:0,neverStarted:true}),{flag:'wx'}).catch(()=>{})}
    if(generation&&!closed)closed=await this.options.owner.confirm(generation).catch(()=>'unknown' as const)==='stopped'
    if(closed&&folder){for(const name of ['cache','resources'])await rm(join(folder,name),{recursive:true,force:true}).catch(()=>{})}
   }finally{
    this.busy=false;this.operation=null;try{release?.()}finally{this.pending=null;finish()}
   }
   if(generation&&!closed){this.options.onUnknown?.();throw dialogueFailure('STOP_UNCONFIRMED')}
  }
 }
 async shutdown():Promise<'stopped'|'unknown'>{this.closing=true;await this.options.owner.cancel().catch(()=>{});await this.pending;const outcome=await this.options.owner.observeStop().catch(()=>{this.options.onUnknown?.();return 'unknown' as const});if(outcome!=='stopped')return 'unknown';const parent=await directory(this.options.root).catch(()=>null);if(parent){const target=join(parent,this.runtimeId);if(dirname(target)!==parent)throw dialogueFailure('STOP_UNCONFIRMED');const actual=await directory(target).catch(e=>{if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e});if(actual&&dirname(actual).toLowerCase()!==parent.toLowerCase())throw dialogueFailure('STOP_UNCONFIRMED');if(actual)await rm(actual,{recursive:true,force:true})}return 'stopped'}
 async observeContext(projectId:string,rootPath:string,signal:AbortSignal,internal=true):Promise<import('../../contracts/bmad-context.ts').BmadContextObservation>{
  const root=await directory(rootPath),roots=this.options.roots?.(root)??[join(root,'.agents/skills'),join(process.env.USERPROFILE??'','.codex/skills')]
  for(let i=0;i<roots.length;i++){if(!isAbsolute(roots[i]))throw dialogueFailure('PROFILE_UNRECOGNIZED');try{roots[i]=await directory(roots[i])}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}}
  const {result,hints}=await this.run({op:'context',project:root,roots},signal,internal)
  return this.captured({schemaVersion:1,projectId,rootPath:root,observedAt:new Date().toISOString(),...result},hints)
 }
 async observeConfiguration(projectId:string,rootPath:string,signal:AbortSignal):Promise<import('../../contracts/bmad-context.ts').BmadConfigurationObservation>{
  const root=await directory(rootPath),roots=this.options.roots?.(root)??[join(root,'.agents/skills'),join(process.env.USERPROFILE??'','.codex/skills')]
  for(let i=0;i<roots.length;i++){if(!isAbsolute(roots[i]))throw dialogueFailure('PROFILE_UNRECOGNIZED');try{roots[i]=await directory(roots[i])}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}}
  const {result,hints}=await this.run({op:'context-config',project:root,roots},signal,true)
  return this.captured({schemaVersion:1,projectId,rootPath:root,observedAt:new Date().toISOString(),...result},hints)
 }
 async observeCatalog(projectId:string,rootPath:string,signal:AbortSignal):Promise<import('../../contracts/bmad-catalog.ts').BmadCatalogSnapshot>{
  const root=await directory(rootPath),roots=this.options.roots?.(root)??[join(root,'.agents/skills'),join(process.env.USERPROFILE??'','.codex/skills')]
  for(let i=0;i<roots.length;i++){if(!isAbsolute(roots[i]))throw dialogueFailure('PROFILE_UNRECOGNIZED');try{roots[i]=await directory(roots[i])}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}}
  const {result,hints,folder,fileGrant}=await this.run({op:'catalog',project:root,roots},signal,false)
  return this.captureFiles(this.captured({schemaVersion:1,projectId,rootPath:root,observedAt:new Date().toISOString(),...result},hints),folder,fileGrant)
 }
 async observeProgress(projectId:string,rootPath:string,selection:import('../../contracts/bmad-context.ts').BmadSelection,observation:import('../../contracts/bmad-context.ts').BmadContextObservation,signal:AbortSignal):Promise<import('../../contracts/bmad-progress.ts').BmadProgressSnapshot>{
  const root=await directory(rootPath),roots=this.options.roots?.(root)??[join(root,'.agents/skills'),join(process.env.USERPROFILE??'','.codex/skills')]
  for(let i=0;i<roots.length;i++){if(!isAbsolute(roots[i]))throw dialogueFailure('PROFILE_UNRECOGNIZED');try{roots[i]=await directory(roots[i])}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}}
  // This is a local consultation, never a provider-nested admission.
  const {result,hints,folder,fileGrant,storyEvidence}=await this.run({op:'progress',project:root,roots,initiativeId:selection.initiativeId,rootIdentity:selection.rootIdentity,contextRevision:observation.revision},signal)
  const value=await this.captureFiles(this.captured({schemaVersion:1,projectId,rootPath:root,observedAt:new Date().toISOString(),...result},hints),folder,fileGrant)
  if(storyEvidence!==undefined&&!fileGrant.refusal){
   const e=storyEvidence as StoryEvidence
   if(e.schemaVersion!==1||e.revision!==value.revision||!Array.isArray(e.rows)||e.rows.length>4096||!e.rows.every(r=>r&&typeof r.sourceId==='string'&&typeof r.container==='string'&&(r.ticketId===null||typeof r.ticketId==='string')&&['entry','leaf'].includes(r.kind)&&(r.type===null||typeof r.type==='string')&&Number.isSafeInteger(r.line)&&r.line>0&&(r.typeLine===null||Number.isSafeInteger(r.typeLine)&&r.typeLine>0)&&typeof r.identity==='string'&&r.identity.length>0&&r.identity.length<=1000&&value.sources.some((s:any)=>s.id===r.sourceId)))throw dialogueFailure('PROFILE_CHANGED')
   const receiptSha=sha(await safe(join(folder,'files.json'),4*1024*1024))
   this.storyCaptures.set(value,{evidence:structuredClone(e),verify:async(sourceId,signal)=>{
    if(!e.rows.some(r=>r.sourceId===sourceId)||sha(await safe(join(folder,'files.json'),4*1024*1024))!==receiptSha)throw dialogueFailure('PROFILE_CHANGED')
    // A new leaf can introduce a duplicate while the chosen source stays identical.
    // Re-read the bounded scope and its inventories, not only that source file.
    try{const fresh=await this.run({op:'progress',project:root,roots,initiativeId:selection.initiativeId,rootIdentity:selection.rootIdentity,contextRevision:observation.revision},signal,true);if(fresh.result.revision!==value.revision)throw dialogueFailure('PROFILE_CHANGED')}
    catch(error){if(['STOP_UNCONFIRMED','BUSY','APP_CLOSING','CANCELLED'].includes(String((error as {code?:string}).code)))throw error;throw dialogueFailure('PROFILE_CHANGED')}
   }})
  }
  return value
 }
 async prepare(projectId:string,rootPath:string,signal:AbortSignal):Promise<HelpBundle>{
  const root=await directory(rootPath),roots=this.options.roots?.(root)??[join(root,'.agents/skills'),join(process.env.USERPROFILE??'','.codex/skills')]
  for(let i=0;i<roots.length;i++){if(!isAbsolute(roots[i]))throw dialogueFailure('PROFILE_UNRECOGNIZED');try{roots[i]=await directory(roots[i])}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}}
  const {result,folder,hints}=await this.run({op:'prepare',project:root,roots},signal)
  const bundle:HelpBundle={schemaVersion:1,id:'bundle-'+randomUUID(),projectId,rootPath:root,observedAt:new Date().toISOString(),...result}
  if(!isHelpBundle(bundle))throw dialogueFailure('PROFILE_UNRECOGNIZED')
  this.preparations.set(bundle.id,{bundle:structuredClone(bundle),folder,captureSha:sha(await safe(join(folder,'capture.json'),4*1024*1024))})
  return this.captured(bundle,hints)
 }
 private prepared(id:string):{bundle:HelpBundle;folder:string;captureSha:string}{const p=this.preparations.get(id);if(!p)throw dialogueFailure('PROFILE_CHANGED');return p}
 async assertFresh(id:string,signal:AbortSignal,internal=false):Promise<void>{
  const p=this.prepared(id)
  if(sha(await safe(join(p.folder,'capture.json'),4*1024*1024))!==p.captureSha)throw dialogueFailure('PROFILE_CHANGED')
  try{await this.run({op:'fresh',prepared:p.folder},signal,internal)}catch(e){if((e as {code?:string}).code==='STOP_UNCONFIRMED')throw e;throw dialogueFailure('PROFILE_CHANGED')}
  const skill=p.bundle.sources.find(s=>s.snapshot===p.bundle.skillPath);if(!skill||sha(await safe(skill.snapshot,1048576))!==skill.sha256)throw dialogueFailure('PROFILE_CHANGED')
 }
 async profile(id:string,signal:AbortSignal):Promise<BmadProfile>{
  const p=this.prepared(id);if(!p.bundle.nativeReady)throw dialogueFailure('PROFILE_UNRECOGNIZED')
  return {rootPath:p.bundle.rootPath,skillPath:p.bundle.skillPath,fingerprint:p.bundle.revision,kind:'help',help:{bundleId:id,initiativeId:p.bundle.activeInitiative}}
 }
 async read(id:string,reference:string,signal:AbortSignal):Promise<string>{const p=this.prepared(id);if(reference!=='inventories'&&reference!=='required-context'&&!p.bundle.sources.some(s=>s.id===reference))throw dialogueFailure('UNSUPPORTED_INTERACTION');if(sha(await safe(join(p.folder,'capture.json'),4*1024*1024))!==p.captureSha)throw dialogueFailure('PROFILE_CHANGED');const {result}=await this.run({op:'read',prepared:p.folder,reference},signal,true);if(typeof result.raw!=='string')throw dialogueFailure('RESOLVER_FAILED');return result.raw}
 host(id:string,signal:AbortSignal):HelpHost{return new HelpHost(this,this.prepared(id).bundle,signal)}
 async native(id:string,kind:'knowledge'|'config',signal:AbortSignal):Promise<string>{const p=this.prepared(id);if(sha(await safe(join(p.folder,'capture.json'),4*1024*1024))!==p.captureSha)throw dialogueFailure('PROFILE_CHANGED');const {result}=await this.run({op:'native',prepared:p.folder,kind},signal,true);if(typeof result.raw!=='string')throw dialogueFailure('RESOLVER_FAILED');return result.raw}
}
export class HelpHost{
 private turnIdentity:{threadId:string;turnId:string}|null=null;readonly bundle:HelpBundle;private adapter:BmadHelpAdapter;private signal:AbortSignal
 private observer:((r:HelpToolReceipt)=>Promise<void>)|null=null
 constructor(adapter:BmadHelpAdapter,bundle:HelpBundle,signal:AbortSignal){this.adapter=adapter;this.bundle=structuredClone(bundle);this.signal=signal}
 started(threadId:string,turnId:string):void{this.turnIdentity={threadId,turnId}}
 nativeTurn():{threadId:string;turnId:string}|null{return this.turnIdentity?{...this.turnIdentity}:null}
 bind(observer:(r:HelpToolReceipt)=>Promise<void>):void{this.observer=observer}
 assertFresh():Promise<void>{return this.adapter.assertFresh(this.bundle.id,this.signal,true)}
 async resolve(kind:'knowledge'|'config'):Promise<string>{return this.adapter.native(this.bundle.id,kind,this.signal)}
 async read(reference:string):Promise<string>{return this.adapter.read(this.bundle.id,reference,this.signal)}
 async transmitted(receipt:HelpToolReceipt):Promise<void>{if(!this.observer)throw dialogueFailure('STORAGE_WRITE_FAILED');await this.observer(receipt)}
 preferredReferences():string[]{return Buffer.byteLength(JSON.stringify({id:'x'.repeat(200),result:{success:true,contentItems:[{type:'inputText',text:helpContextText(this.bundle)}]}}))<1048576?['required-context']:[...this.requiredReferences(),'inventories']}
 requiredReferences():string[]{return requiredHelpSources(this.bundle).map(s=>s.id)}
}
