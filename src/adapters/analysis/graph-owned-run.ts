import {validateGraphStopRequest} from '../../contracts/bmad-graph.ts'
import type {GraphStopRequest} from '../../contracts/bmad-graph.ts'
export type GraphOwnedStopProof={nativeGeneration:string;attempt:GraphStopRequest}
const issuedStopProofs=new WeakSet<object>()
export function isGraphOwnedStopProof(value:unknown):value is GraphOwnedStopProof{return value!==null&&typeof value==='object'&&issuedStopProofs.has(value)}
import {realpathSync} from 'node:fs'
import {mkdir,readFile,writeFile,lstat,open,rename,unlink} from 'node:fs/promises'
import {join,dirname,resolve,relative,isAbsolute,sep,basename} from 'node:path'
import {randomUUID} from 'node:crypto'
import {TextDecoder} from 'node:util'
import {dialogueFailure} from '../../contracts/dialogue.ts'
type Record={schemaVersion:1;generation:string;purpose:'graph-code-only';status:'unknown'|'stopped';folder:string;attempt?:GraphStopRequest|null}
async function plain(path:string,limit=65536):Promise<string|null>{try{for(let p=resolve(path);;p=dirname(p)){const s=await lstat(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1)throw Error();if(dirname(p)===p)break}const f=await open(path,'r');try{if((await f.stat()).size>limit)throw Error();return new TextDecoder('utf-8',{fatal:true}).decode(await f.readFile())}finally{await f.close()}}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw dialogueFailure('STORAGE_READ_FAILED')}}
/** Absence du superviseur != Job vide. Seule une preuve terminale de la même génération libère. */
export class GraphOwnedRun{
 private path:string;private root:string;private previous:string|null|undefined;private record:Record|null=null;private queue:Promise<unknown>=Promise.resolve();private active:string|null=null
 constructor(path:string){this.path=path;this.root=realpathSync.native(dirname(path))}
 private canonicalFolder(folder:string):string{try{return join(realpathSync.native(dirname(folder)),basename(folder))}catch{return resolve(folder)}}
 private confined(folder:string):boolean{const d=relative(this.root,this.canonicalFolder(folder));return isAbsolute(folder)&&!!d&&!isAbsolute(d)&&d!=='..'&&!d.startsWith('..'+sep)&&!folder.includes('\\0')}
 private async load():Promise<void>{if(this.previous!==undefined)return;const raw=await plain(this.path);if(raw!==null){let r:any;try{r=JSON.parse(raw)}catch{throw dialogueFailure('STORAGE_READ_FAILED')}if(r.schemaVersion!==1||!/^graph-[a-f0-9-]{36}$/.test(r.generation)||r.purpose!=='graph-code-only'||!['unknown','stopped'].includes(r.status)||typeof r.folder!=='string'||!this.confined(r.folder)||Object.keys(r).length!==(Object.hasOwn(r,'attempt')?6:5)||Object.hasOwn(r,'attempt')&&r.attempt!==null&&!validateGraphStopRequest(r.attempt).ok)throw dialogueFailure('STORAGE_READ_FAILED');this.record=r}this.previous=raw}
 private async save(record:Record):Promise<void>{if(await plain(this.path)!==this.previous)throw dialogueFailure('OUTPUT_CONFLICT');await mkdir(dirname(this.path),{recursive:true});const temp=this.path+'.'+randomUUID()+'.tmp',bytes=JSON.stringify(record)+'\n';try{const f=await open(temp,'wx',0o600);try{await f.writeFile(bytes);await f.sync()}finally{await f.close()}for(let attempt=0;;attempt++){try{await rename(temp,this.path);break}catch(e){if(attempt>=3||!['EPERM','EACCES','EBUSY'].includes((e as NodeJS.ErrnoException).code??''))throw e;if(await plain(this.path)!==this.previous)throw dialogueFailure('OUTPUT_CONFLICT');await new Promise(r=>setTimeout(r,25*2**attempt))}}this.previous=bytes;this.record=record}finally{await unlink(temp).catch(()=>{})}}
 private serial<T>(fn:()=>Promise<T>):Promise<T>{const result=this.queue.then(fn);this.queue=result.catch(()=>{});return result}
 async status():Promise<'stopped'|'unknown'>{await this.queue;await this.load();if(await plain(this.path)!==this.previous)throw dialogueFailure('STORAGE_READ_FAILED');return !this.record||this.record.status==='stopped'?'stopped':'unknown'}
 async availableFor(generation:string|null):Promise<boolean>{await this.load();return await this.status()==='stopped'||generation!==null&&this.active===generation&&this.record?.generation===generation}
 begin(folder:string,attempt:GraphStopRequest|null=null):Promise<string>{const captured=attempt===null?null:validateGraphStopRequest(attempt);if(captured!==null&&!captured.ok)return Promise.reject(dialogueFailure('INVALID_COMMAND'));return this.serial(async()=>{await this.load();if(!this.confined(folder))throw dialogueFailure('OUTPUT_REFUSED');if(this.record?.status==='unknown')throw dialogueFailure('STOP_UNCONFIRMED');await mkdir(folder,{recursive:false});const generation='graph-'+randomUUID();await this.save({schemaVersion:1,generation,purpose:'graph-code-only',status:'unknown',folder:this.canonicalFolder(folder),attempt:captured===null?null:captured.value});this.active=generation;return generation})}
 confirm(generation:string):Promise<'stopped'|'unknown'>{return this.serial(()=>this.observe(generation))}
 private async observe(generation:string):Promise<'stopped'|'unknown'>{await this.load();if(await plain(this.path)!==this.previous)throw dialogueFailure('STORAGE_READ_FAILED');const r=this.record;if(!r||r.generation!==generation)return 'unknown';if(r.status==='stopped')return 'stopped';try{const raw=await plain(join(r.folder,'terminal.json'));if(raw===null)return 'unknown';const p=JSON.parse(raw);if(p.schemaVersion!==1||p.generation!==generation||p.purpose!=='graph-code-only'||p.terminal!==true||(p.jobAssigned!==true&&p.neverStarted!==true)||p.jobActive!==0)return 'unknown';await this.save({...r,status:'stopped'});if(this.active===generation)this.active=null;return 'stopped'}catch{return 'unknown'}}
 observeStop():Promise<'stopped'|'unknown'>{return this.serial(async()=>{await this.load();if(await plain(this.path)!==this.previous)throw dialogueFailure('STORAGE_READ_FAILED');if(!this.record||this.record.status==='stopped')return 'stopped';return this.observe(this.record.generation)})}
 /** Issued only after explicit observation of this owner's terminal receipt. No receipt/attempt => no logical authority. */
 stopProof():Promise<GraphOwnedStopProof|null>{return this.serial(async()=>{await this.load();if(await plain(this.path)!==this.previous)throw dialogueFailure('STORAGE_READ_FAILED');const r=this.record;if(!r||r.status!=='stopped'||!r.attempt)return null;try{const raw=await plain(join(r.folder,'terminal.json'));if(raw===null)return null;const p=JSON.parse(raw);if(p.schemaVersion!==1||p.generation!==r.generation||p.purpose!=='graph-code-only'||p.terminal!==true||(p.jobAssigned!==true&&p.neverStarted!==true)||p.jobActive!==0)return null;const attempt=structuredClone(r.attempt);Object.freeze(attempt.identity);Object.freeze(attempt);const proof=Object.freeze({nativeGeneration:r.generation,attempt});issuedStopProofs.add(proof);return proof}catch{return null}})}
 cancel(generation?:string):Promise<void>{return this.serial(async()=>{
  await this.load()
  if(await plain(this.path)!==this.previous)throw dialogueFailure('STORAGE_READ_FAILED')
  if(this.record?.status==='unknown'&&(generation===undefined||this.record.generation===generation)){
   await writeFile(join(this.record.folder,'cancel'),'cancel',{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e})
  }
 })}
}
