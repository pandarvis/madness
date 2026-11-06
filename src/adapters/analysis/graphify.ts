import {execFile,spawn} from 'node:child_process'
import {realpathSync} from 'node:fs'
import {readFile,writeFile,mkdir,lstat,open} from 'node:fs/promises'
import {join,resolve,dirname} from 'node:path'
import {createHash,randomUUID} from 'node:crypto'
import type {FileAuthority} from '../../core/project-files.ts'
import type {GraphAnalysisRequest,GraphAnalysisEvent,GraphStopRequest,GraphSource} from '../../contracts/bmad-graph.ts'
import {sameGraphScope,validateGraphAnalysisRequest} from '../../contracts/bmad-graph.ts'
import type {GraphAnalysisPort} from '../../core/bmad-graph-port.ts'
import type {OriginalGraphCapture} from './graph-corpus.ts'
import {GraphOwnedRun} from './graph-owned-run.ts'
import {graphResourcePins} from './graphify-manifest.ts'
import {IncompatibleGraphifyArtifact,normalizeGraphify} from './graphify-normalize.ts'
const sha=(b:Buffer|string):string=>createHash('sha256').update(b).digest('hex')
// This exact change omits the disk mirror during revalidation. The code inventory
// and its revision are unchanged. An unrecognized capture pin rotates the scope.
const captureScopePin=graphResourcePins['graph_capture.py']==='d3637ac4c4f3e518b91b4d4a198f9a5bfdb2ca5d88bb94cdebb97bd00eaaf10f'
 ?'3c5d601141968aa2c9aef4cdf63aaaa174aa5abda67407371acd7bf40420be2f'
 :graphResourcePins['graph_capture.py']
const powerShellPins={
 'pwsh.exe':'9660387054b1387f5ab7e907a61560674c762559f91279a50484240bb3659d53',
 'pwsh.dll':'e693be60bb4ce1e3ad5e511fa181928975cf151adc4816379bf895fd0dc3fedc',
 'pwsh.deps.json':'44339102d7832034b4071cc033d060d8095ba5aa27a8bebc8625d8d58bd095eb',
 'pwsh.runtimeconfig.json':'385649560b8094e1905c9474a5e094b718f296dc514ffe489427078e79ad3b1d',
 'System.Management.Automation.dll':'c5a48de957c20a4c3627f529bd69b7765c336249ab45e466f4a1c74a71405ee7'
} as const
async function safe(path:string,limit=32*1024*1024):Promise<Buffer>{for(let p=resolve(path);;p=dirname(p)){const s=await lstat(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw Error('PHYSICAL_PATH_REFUSED');if(dirname(p)===p)break}const h=await open(path,'r');try{const a=await h.stat();if(!a.isFile()||a.size>limit)throw Error('OUTPUT_LIMIT');const b=await h.readFile(),z=await h.stat(),n=await lstat(path);if(a.ino!==z.ino||a.ino!==n.ino||a.mtimeMs!==z.mtimeMs||a.size!==z.size||b.length>limit)throw Error('SOURCE_CHANGED');return b}finally{await h.close()}}
export async function assertGraphifyPowerShell(path:string,signal?:AbortSignal):Promise<void>{
 if(process.platform!=='win32')throw Error('GRAPH_POWERSHELL_REQUIRED')
 for(const [name,pin] of Object.entries(powerShellPins)){
  signal?.throwIfAborted()
  const bytes=await safe(name==='pwsh.exe'?path:join(dirname(path),name)).catch(()=>null)
  if(!bytes||sha(bytes)!==pin)throw Error('GRAPH_POWERSHELL_REQUIRED')
 }
 signal?.throwIfAborted()
 try{
  await new Promise<void>((done,fail)=>{
   const command="if ($PSVersionTable.PSVersion.ToString() -cne '7.5.4') { exit 1 }"
   let failure:Error|null=null
   const child=execFile(path,['-NoLogo','-NoProfile','-NonInteractive','-Command',command],{windowsHide:true,timeout:10000,maxBuffer:4096,signal},error=>{failure=error})
   // execFile reports abort before close. Keep admission until this process is closed.
   child.once('close',code=>{
    if(failure||code!==0)fail(failure??Error('GRAPH_POWERSHELL_REQUIRED'))
    else done()
   })
  })
  signal?.throwIfAborted()
 }catch{
  signal?.throwIfAborted()
  throw Error('GRAPH_POWERSHELL_REQUIRED')
 }
}
type Facts={sourceState:'unchanged'|'changed'|'unknown';observedAt:string|null}
type Options={root:string;resources:string;owner:GraphOwnedRun;admission:{enter(kind:'helper'):()=>void};admit?():Promise<void>;onUnknown?():void}
export class GraphifyAdapter implements GraphAnalysisPort{
 readonly coverage={included:['captured-code','code-dependencies'],excluded:['configuration','instructions','hooks','links','metadata','generated-output','semantic-enrichment']}
 readonly scopeRevision=sha(captureScopePin+'|graph-code-only-v1:.py,.ts,.tsx,.js,.jsx,.mjs,.cjs,.cs,.java,.c,.h,.cpp,.hpp,.rs,.go,.rb,.php,.swift,.kt,.scala,.vue,.svelte;1024files;1MiBfile;16MiBtotal;24depth;10000entries;no-config')
 private options:Options;private closing=false;private pending:Promise<unknown>|null=null;private captured=new WeakMap<object,{folder:string;receiptSha:string;facts:Facts}>();private originals=new Map<string,OriginalGraphCapture>();private authorities=new WeakMap<object,FileAuthority>();private activeAttempt:{request:GraphStopRequest;generation:string}|null=null
 constructor(options:Options){this.options=options}
 filesAuthority(v:object):FileAuthority|undefined{return this.authorities.get(v)}
 facts(v:OriginalGraphCapture):Facts{return this.captured.get(v)?.facts??{sourceState:'unknown',observedAt:null}}
 private async run(request:Record<string,unknown>,signal:AbortSignal,attempt:GraphStopRequest|null=null,reportStop?:(confirmed:boolean,ownedFolder:string)=>void):Promise<{result:any;folder:string}>{
  if(this.closing)throw Error('APP_CLOSING');signal.throwIfAborted();const release=this.options.admission.enter('helper');let folder='',generation='',spawned=false,confirmed=false
  let finish!:()=>void;const pending=new Promise<void>(r=>finish=r);this.pending=pending
  try{
   await this.options.admit?.();signal.throwIfAborted();if(this.closing)throw Error('APP_CLOSING')
   if(await this.options.owner.status()!=='stopped')throw Error('STOP_UNCONFIRMED')
   const pwsh=join(process.env.USERPROFILE??'','.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe');await assertGraphifyPowerShell(pwsh,signal)
   for(const [name,pin] of Object.entries(graphResourcePins)){
    const bytes=await safe(join(this.options.resources,name)).catch(()=>null)
    if(!bytes||sha(bytes)!==pin)throw Error('GRAPH_RESOURCE_CHANGED:'+name)
   }
   await mkdir(this.options.root,{recursive:true})
   signal.throwIfAborted();if(this.closing)throw Error('APP_CLOSING')
   folder=join(realpathSync.native(this.options.root),'graph-'+randomUUID());generation=await this.options.owner.begin(folder,attempt)
   if(attempt)this.activeAttempt={request:attempt,generation}
   signal.throwIfAborted();if(this.closing)throw Error('APP_CLOSING')
   const resources=realpathSync.native(this.options.resources)
   const capturesCorpus=request.op==='capture'||request.op==='revalidate'
   const data=join(folder,'data')
   await writeFile(join(folder,'request.json'),JSON.stringify(capturesCorpus?{...request,folder:data}:request),{flag:'wx'})
   if(capturesCorpus)await mkdir(data)
   const quote=(v:string):string=>"'"+v.replaceAll("'","''")+"'"
   const script='$TaskFolder='+quote(folder)+'\n$Generation='+quote(generation)+'\n$Resources='+quote(resources)+'\n$Pins='+"(ConvertFrom-Json -AsHashtable "+quote(JSON.stringify(graphResourcePins))+')\n'+(await safe(join(resources,'launcher.ps1'))).toString('utf8')
   signal.throwIfAborted();if(this.closing)throw Error('APP_CLOSING')
   const child=spawn(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,shell:false,stdio:['ignore','ignore','pipe']});spawned=child.pid!==undefined
   let errorBytes=0;child.stderr.on('data',b=>{errorBytes+=b.length})
   const cancel=():void=>{void this.options.owner.cancel(generation).catch(()=>{})};signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)cancel()
   // The native analysis and its subsequent source comparison have separate budgets.
   const launcherBudgetMs=request.op==='analyze'?600000:270000
   let timer:ReturnType<typeof setTimeout>|undefined
   try{await Promise.race([new Promise<void>((done,fail)=>{child.once('close',()=>done());child.once('error',fail)}),new Promise<never>((_,fail)=>{timer=setTimeout(()=>{cancel();fail(Error('STOP_UNCONFIRMED'))},launcherBudgetMs)})])}finally{clearTimeout(timer);signal.removeEventListener('abort',cancel)}
   confirmed=await this.options.owner.confirm(generation)==='stopped';if(!confirmed)throw Error('STOP_UNCONFIRMED')
   // The finished analysis may already have written a source comparison before cancellation.
   if(request.op!=='analyze')signal.throwIfAborted()
   const problem=await safe(join(folder,'launcher-error.txt'),65536).catch(e=>{if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e});if(problem)throw Error(problem.toString('utf8'));if(errorBytes>65536)throw Error('LAUNCHER_OUTPUT_LIMIT')
   const result=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await safe(join(folder,'result.json'),4*1024*1024)));if(result.error)throw Error(result.error);return {result,folder}
  }finally{
   try{
    if(generation&&!spawned)await writeFile(join(folder,'terminal.json'),JSON.stringify({schemaVersion:1,generation,purpose:'graph-code-only',terminal:true,jobAssigned:false,jobActive:0,neverStarted:true}),{flag:'wx'}).catch(()=>{})
    if(generation&&!confirmed)confirmed=await this.options.owner.confirm(generation).catch(()=>'unknown' as const)==='stopped'
    if(generation&&!confirmed){this.options.onUnknown?.();throw Error('STOP_UNCONFIRMED')}
   }finally{
    if(this.activeAttempt?.generation===generation)this.activeAttempt=null
    reportStop?.(!generation||confirmed,generation?folder:'')
    release();if(this.pending===pending)this.pending=null;finish()
   }
  }
 }
 async capture(projectId:string,rootPath:string,signal:AbortSignal,mode:'analysis'|'revalidation'='analysis'):Promise<OriginalGraphCapture>{
  // Preserve lexical ancestor checks before expanding a Windows 8.3 spelling.
  for(let p=resolve(rootPath);;p=dirname(p)){const s=await lstat(p);if(s.isSymbolicLink()||!s.isDirectory())throw Error('ROOT_REFUSED');if(dirname(p)===p)break}
  const op=mode==='revalidation'?'revalidate':'capture'
  const {result,folder}=await this.run({op,project:realpathSync.native(rootPath)},signal),data=join(folder,'data')
  const original:OriginalGraphCapture={projectId,rootPath:result.rootPath,rootIdentity:result.rootIdentity,revision:result.revision,observedAt:result.observedAt,sources:result.sources,corpus:result.corpus as GraphSource[],excluded:result.excluded}
  const receiptSha=sha(await safe(join(data,'files.json'),4*1024*1024));if(receiptSha!==result.receiptSha)throw Error('GRANT_CHANGED')
  if(op==='capture'){
   this.captured.set(original,{folder:data,receiptSha,facts:{sourceState:'unchanged',observedAt:original.observedAt}})
   this.originals.set(projectId,original)
  }
  const operate=async(id:string,signal:AbortSignal,read:boolean):Promise<any>=>{if(!original.sources.some(s=>s.id===id))throw Error('SOURCE_NOT_GRANTED');if(sha(await safe(join(data,'files.json'),4*1024*1024))!==receiptSha)throw Error('GRANT_CHANGED');const {result}=await this.run({op:read?'files-read':'files-verify',prepared:data,receiptSha,producer:'corpus',revision:original.revision,sourceId:id},signal);return result}
  this.authorities.set(original,{producer:'corpus',projectId,rootPath:original.rootPath,rootIdentity:original.rootIdentity,revision:original.revision,observedAt:original.observedAt,sources:structuredClone(original.sources),read:(id,s)=>operate(id,s,true),verify:(id,s)=>operate(id,s,false)})
  return original
 }
 async analyze(request:GraphAnalysisRequest,observe:(e:GraphAnalysisEvent)=>void,signal:AbortSignal):Promise<void>{
  const original=this.originals.get(request.identity.projectId),capture=original&&this.captured.get(original);let order=0;const base={contractVersion:1 as const,identity:request.identity,generation:request.generation,correlationId:request.correlationId};const emit=(e:Record<string,unknown>):void=>observe({...base,order:++order,...e} as GraphAnalysisEvent)
  if(!validateGraphAnalysisRequest(request).ok)throw Error('INVALID_GRAPH_REQUEST')
  emit({type:'started'})
  let terminalFacts:Facts={sourceState:'unknown',observedAt:null}
  let stopped=true,ownedFolder=''
  try{
   if(!original||!capture||request.identity.sourceRevision!==original.revision||request.identity.rootIdentity!==original.rootIdentity||request.identity.rootPath!==original.rootPath||request.identity.scopeRevision!==this.scopeRevision||JSON.stringify(request.corpus)!==JSON.stringify(original.corpus))throw Error('CAPTURE_MISMATCH')
   const {result,folder}=await this.run({op:'analyze',prepared:capture.folder},signal,{contractVersion:1,identity:request.identity,generation:request.generation,correlationId:request.correlationId},(confirmed,folder)=>{stopped=confirmed;ownedFolder=folder})
   terminalFacts={sourceState:['unchanged','changed'].includes(result.sourceState)?result.sourceState:'unknown',observedAt:typeof result.observedAt==='string'?result.observedAt:null}
   capture.facts=terminalFacts
   signal.throwIfAborted()
   const bytes=await safe(join(folder,'native-graph.json'),16*1024*1024),logs=await safe(join(folder,'analysis-stderr.log'),4*1024*1024)
   const limitations=/warning|not available|not installed|missing optional/i.test(logs.toString('utf8'))
    ? ['Graphify signale une couverture limitée.'] : []
   const snapshot=normalizeGraphify(bytes,{identity:request.identity,corpus:original.corpus,coverage:request.coverage,observedAt:original.observedAt,assemblyRevision:graphResourcePins['assembly.json'],limitations})
   signal.throwIfAborted()
   emit({type:'result',snapshot});emit({type:'stopped',reason:snapshot.coverage.status,stop:'confirmed'})
  }catch(e){
   if(capture)capture.facts=terminalFacts.sourceState==='changed'?terminalFacts:{sourceState:'unknown',observedAt:null}
   if(signal.aborted){emit({type:'stopped',reason:'interrupted',stop:stopped?'confirmed':'unknown'});return}
   if(e instanceof Error&&e.message==='GRAPH_CHILD_timeout')emit({type:'stopped',reason:'timeout',stop:stopped?'confirmed':'unknown'})
   else if(!stopped)emit({type:'failed',error:{code:'STOP_UNCONFIRMED',messageKey:'graph.error.stop_unconfirmed',outcome:'unknown',recovery:'check-stop'}})
   else if(e instanceof IncompatibleGraphifyArtifact){
    emit({type:'failed',error:{code:'INCOMPATIBLE',messageKey:'graph.error.incompatible',outcome:'failed',recovery:'inspect-profile'}})
    emit({type:'stopped',reason:'incompatible',stop:'confirmed'})
   }else{
    emit({type:'failed',error:{code:'ANALYSIS_FAILED',messageKey:'graph.error.analysis_failed',outcome:'failed',recovery:'retry-after-check'}})
    emit({type:'stopped',reason:'failed',stop:'confirmed'})
   }
   // Keep an owned diagnosis without exposing native payloads to the bridge.
   if(ownedFolder)await writeFile(join(ownedFolder,'adapter-error.txt'),String(e)).catch(()=>{})
  }
 }
 async stop(request:GraphStopRequest):Promise<Extract<GraphAnalysisEvent,{type:'stopped'}>>{
  const active=this.activeAttempt,matched=active?.request
  const event={...request,type:'stopped',order:Number.MAX_SAFE_INTEGER,reason:'interrupted'} as const
  if(!matched||!sameGraphScope(matched.identity,request.identity)||matched.identity.analysisId!==request.identity.analysisId||
     matched.identity.sourceRevision!==request.identity.sourceRevision||matched.generation!==request.generation||matched.correlationId!==request.correlationId)return {...event,stop:'unknown'}
  const pending=this.pending
  await this.options.owner.cancel(active.generation)
  await pending
  return {...event,stop:await this.options.owner.confirm(active.generation).catch(()=>'unknown' as const)==='stopped'?'confirmed':'unknown'}
 }
 async shutdown():Promise<'stopped'|'unknown'>{this.closing=true;await this.options.owner.cancel().catch(()=>{});await this.pending;return this.options.owner.observeStop().catch(()=>'unknown' as const)}
}
