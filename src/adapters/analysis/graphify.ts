import {spawn} from 'node:child_process'
import {realpathSync} from 'node:fs'
import {readFile,writeFile,mkdir,lstat,open} from 'node:fs/promises'
import {join,resolve,dirname} from 'node:path'
import {createHash,randomUUID} from 'node:crypto'
import type {FileAuthority} from '../../core/project-files.ts'
import type {GraphAnalysisRequest,GraphAnalysisEvent,GraphStopRequest,GraphSource} from '../../contracts/bmad-graph.ts'
import {validateGraphAnalysisRequest} from '../../contracts/bmad-graph.ts'
import type {GraphAnalysisPort} from '../../core/bmad-graph-port.ts'
import type {OriginalGraphCapture} from './graph-corpus.ts'
import {GraphOwnedRun} from './graph-owned-run.ts'
import {graphResourcePins} from './graphify-manifest.ts'
import {normalizeGraphify} from './graphify-normalize.ts'
const sha=(b:Buffer|string):string=>createHash('sha256').update(b).digest('hex')
const pwshPin='9660387054b1387f5ab7e907a61560674c762559f91279a50484240bb3659d53'
async function safe(path:string,limit=32*1024*1024):Promise<Buffer>{for(let p=resolve(path);;p=dirname(p)){const s=await lstat(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw Error('PHYSICAL_PATH_REFUSED');if(dirname(p)===p)break}const h=await open(path,'r');try{const a=await h.stat();if(!a.isFile()||a.size>limit)throw Error('OUTPUT_LIMIT');const b=await h.readFile(),z=await h.stat(),n=await lstat(path);if(a.ino!==z.ino||a.ino!==n.ino||a.mtimeMs!==z.mtimeMs||a.size!==z.size||b.length>limit)throw Error('SOURCE_CHANGED');return b}finally{await h.close()}}
type Facts={sourceState:'unchanged'|'changed'|'unknown';observedAt:string|null}
type Options={root:string;resources:string;owner:GraphOwnedRun;admission:{enter(kind:'helper'):()=>void};admit?():Promise<void>;onUnknown?():void}
export class GraphifyAdapter implements GraphAnalysisPort{
 readonly coverage={included:['captured-code','code-dependencies'],excluded:['configuration','instructions','hooks','links','metadata','generated-output','semantic-enrichment']}
 readonly scopeRevision=sha(graphResourcePins['graph_capture.py']+'|graph-code-only-v1:.py,.ts,.tsx,.js,.jsx,.mjs,.cjs,.cs,.java,.c,.h,.cpp,.hpp,.rs,.go,.rb,.php,.swift,.kt,.scala,.vue,.svelte;1024files;1MiBfile;16MiBtotal;24depth;10000entries;no-config')
 private options:Options;private closing=false;private pending:Promise<unknown>|null=null;private captured=new WeakMap<object,{folder:string;receiptSha:string;facts:Facts}>();private originals=new Map<string,OriginalGraphCapture>();private authorities=new WeakMap<object,FileAuthority>();private lastRun=''
 constructor(options:Options){this.options=options}
 filesAuthority(v:object):FileAuthority|undefined{return this.authorities.get(v)}
 facts(v:OriginalGraphCapture):Facts{return this.captured.get(v)?.facts??{sourceState:'unknown',observedAt:null}}
 private async run(request:Record<string,unknown>,signal:AbortSignal,attempt:GraphStopRequest|null=null):Promise<{result:any;folder:string}>{
  if(this.closing)throw Error('APP_CLOSING');signal.throwIfAborted();const release=this.options.admission.enter('helper');let folder='',generation='',spawned=false,confirmed=false
  let finish!:()=>void;const pending=new Promise<void>(r=>finish=r);this.pending=pending
  try{
   await this.options.admit?.();if(await this.options.owner.status()!=='stopped')throw Error('STOP_UNCONFIRMED')
   const pwsh=join(process.env.USERPROFILE??'','.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe');if(process.platform!=='win32'||sha(await safe(pwsh))!==pwshPin)throw Error('RUNTIME_UNAVAILABLE')
   for(const [name,pin] of Object.entries(graphResourcePins))if(sha(await safe(join(this.options.resources,name)))!==pin)throw Error('GRAPH_RESOURCE_CHANGED:'+name)
   await mkdir(this.options.root,{recursive:true});folder=join(realpathSync.native(this.options.root),'graph-'+randomUUID());generation=await this.options.owner.begin(folder,attempt);this.lastRun=folder
   const resources=realpathSync.native(this.options.resources)
   await writeFile(join(folder,'request.json'),JSON.stringify({...request,...(request.op==='capture'?{folder:join(folder,'data')}:{})}),{flag:'wx'});if(request.op==='capture')await mkdir(join(folder,'data'))
   const quote=(v:string):string=>"'"+v.replaceAll("'","''")+"'"
   const script='$TaskFolder='+quote(folder)+'\n$Generation='+quote(generation)+'\n$Resources='+quote(resources)+'\n$Pins='+"(ConvertFrom-Json -AsHashtable "+quote(JSON.stringify(graphResourcePins))+')\n'+(await safe(join(resources,'launcher.ps1'))).toString('utf8')
   const child=spawn(pwsh,['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,shell:false,stdio:['ignore','ignore','pipe']});spawned=child.pid!==undefined
   let errorBytes=0;child.stderr.on('data',b=>{errorBytes+=b.length})
   const cancel=():void=>{void this.options.owner.cancel().catch(()=>{})};signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)cancel()
   let timer:ReturnType<typeof setTimeout>|undefined
   try{await Promise.race([new Promise<void>((done,fail)=>{child.once('close',()=>done());child.once('error',fail)}),new Promise<never>((_,fail)=>{timer=setTimeout(()=>{cancel();fail(Error('STOP_UNCONFIRMED'))},270000)})])}finally{clearTimeout(timer);signal.removeEventListener('abort',cancel)}
   confirmed=await this.options.owner.confirm(generation)==='stopped';if(!confirmed)throw Error('STOP_UNCONFIRMED');signal.throwIfAborted()
   const problem=await safe(join(folder,'launcher-error.txt'),65536).catch(e=>{if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e});if(problem)throw Error(problem.toString('utf8'));if(errorBytes>65536)throw Error('LAUNCHER_OUTPUT_LIMIT')
   const result=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await safe(join(folder,'result.json'),4*1024*1024)));if(result.error)throw Error(result.error);return {result,folder}
  }finally{
   try{if(generation&&!spawned)await writeFile(join(folder,'terminal.json'),JSON.stringify({schemaVersion:1,generation,purpose:'graph-code-only',terminal:true,jobAssigned:false,jobActive:0,neverStarted:true}),{flag:'wx'}).catch(()=>{});if(generation&&!confirmed)confirmed=await this.options.owner.confirm(generation).catch(()=>'unknown' as const)==='stopped'}finally{release();if(this.pending===pending)this.pending=null;finish()}
   if(generation&&!confirmed){this.options.onUnknown?.();throw Error('STOP_UNCONFIRMED')}
  }
 }
 async capture(projectId:string,rootPath:string,signal:AbortSignal):Promise<OriginalGraphCapture>{
  // Preserve lexical ancestor checks before expanding a Windows 8.3 spelling.
  for(let p=resolve(rootPath);;p=dirname(p)){const s=await lstat(p);if(s.isSymbolicLink()||!s.isDirectory())throw Error('ROOT_REFUSED');if(dirname(p)===p)break}
  const {result,folder}=await this.run({op:'capture',project:realpathSync.native(rootPath)},signal),data=join(folder,'data')
  const original:OriginalGraphCapture={projectId,rootPath:result.rootPath,rootIdentity:result.rootIdentity,revision:result.revision,observedAt:result.observedAt,sources:result.sources,corpus:result.corpus as GraphSource[],excluded:result.excluded}
  const receiptSha=sha(await safe(join(data,'files.json'),4*1024*1024));if(receiptSha!==result.receiptSha)throw Error('GRANT_CHANGED')
  this.captured.set(original,{folder:data,receiptSha,facts:{sourceState:'unchanged',observedAt:original.observedAt}});this.originals.set(projectId,original)
  const operate=async(id:string,signal:AbortSignal,read:boolean):Promise<any>=>{if(!original.sources.some(s=>s.id===id))throw Error('SOURCE_NOT_GRANTED');if(sha(await safe(join(data,'files.json'),4*1024*1024))!==receiptSha)throw Error('GRANT_CHANGED');const {result}=await this.run({op:read?'files-read':'files-verify',prepared:data,receiptSha,producer:'corpus',revision:original.revision,sourceId:id},signal);return result}
  this.authorities.set(original,{producer:'corpus',projectId,rootPath:original.rootPath,rootIdentity:original.rootIdentity,revision:original.revision,observedAt:original.observedAt,sources:structuredClone(original.sources),read:(id,s)=>operate(id,s,true),verify:(id,s)=>operate(id,s,false)})
  return original
 }
 async analyze(request:GraphAnalysisRequest,observe:(e:GraphAnalysisEvent)=>void,signal:AbortSignal):Promise<void>{
  const original=this.originals.get(request.identity.projectId),capture=original&&this.captured.get(original);let order=0;const base={contractVersion:1 as const,identity:request.identity,generation:request.generation,correlationId:request.correlationId};const emit=(e:Record<string,unknown>):void=>observe({...base,order:++order,...e} as GraphAnalysisEvent)
  if(!validateGraphAnalysisRequest(request).ok||!original||!capture||request.identity.sourceRevision!==original.revision||request.identity.rootIdentity!==original.rootIdentity||request.identity.rootPath!==original.rootPath||request.identity.scopeRevision!==this.scopeRevision||JSON.stringify(request.corpus)!==JSON.stringify(original.corpus))throw Error('CAPTURE_MISMATCH')
  emit({type:'started'})
  try{
   const {result,folder}=await this.run({op:'analyze',prepared:capture.folder},signal,{contractVersion:1,identity:request.identity,generation:request.generation,correlationId:request.correlationId})
   capture.facts={sourceState:['unchanged','changed'].includes(result.sourceState)?result.sourceState:'unknown',observedAt:typeof result.observedAt==='string'?result.observedAt:null}
   const bytes=await safe(join(folder,'native-graph.json'),16*1024*1024),logs=await safe(join(folder,'analysis-stderr.log'),4*1024*1024)
   const limitations=logs.toString('utf8').split(/\r?\n/).filter(v=>/warning|not available|not installed|missing optional/i.test(v)).map(v=>v.trim()).filter((v,i,a)=>a.indexOf(v)===i)
   const snapshot=normalizeGraphify(bytes,{identity:request.identity,corpus:original.corpus,coverage:request.coverage,observedAt:original.observedAt,assemblyRevision:graphResourcePins['assembly.json'],limitations})
   emit({type:'result',snapshot});emit({type:'stopped',reason:snapshot.coverage.status,stop:'confirmed'})
  }catch(e){
   capture.facts={sourceState:'unknown',observedAt:null};const stopped=await this.options.owner.status().catch(()=>'unknown' as const)==='stopped'
   if(signal.aborted){emit({type:'stopped',reason:'interrupted',stop:stopped?'confirmed':'unknown'});return}
   if(e instanceof Error&&e.message==='GRAPH_CHILD_timeout')emit({type:'stopped',reason:'timeout',stop:stopped?'confirmed':'unknown'})
   else{
   emit({type:'failed',error:{code:stopped?'ANALYSIS_FAILED':'STOP_UNCONFIRMED',messageKey:stopped?'graph.error.analysis_failed':'graph.error.stop_unconfirmed',outcome:stopped?'failed':'unknown',recovery:stopped?'retry-after-check':'check-stop'}})
   if(stopped)emit({type:'stopped',reason:'failed',stop:'confirmed'})
   }
   // Keep an owned diagnosis without exposing native payloads to the bridge.
   if(this.lastRun)await writeFile(join(this.lastRun,'adapter-error.txt'),String(e)).catch(()=>{})
  }
 }
 async stop(request:GraphStopRequest):Promise<Extract<GraphAnalysisEvent,{type:'stopped'}>>{await this.options.owner.cancel();await this.pending;const stop=await this.options.owner.observeStop().catch(()=>'unknown' as const);return {...request,type:'stopped',order:Number.MAX_SAFE_INTEGER,reason:'interrupted',stop:stop==='stopped'?'confirmed':'unknown'}}
 async shutdown():Promise<'stopped'|'unknown'>{this.closing=true;await this.options.owner.cancel().catch(()=>{});await this.pending;return this.options.owner.observeStop().catch(()=>'unknown' as const)}
}
