import {mkdir,open,rename,unlink,lstat} from 'node:fs/promises'
import {join,dirname,resolve} from 'node:path'
import {randomUUID} from 'node:crypto'
import {TextDecoder} from 'node:util'
import {contextId} from '../../contracts/bmad-context.ts'
import {isMetricsArchive,MAX_METRICS_BYTES} from '../../contracts/us-metrics.ts'
import type {MetricsArchive} from '../../contracts/us-metrics.ts'
import {dialogueFailure} from '../../contracts/dialogue.ts'
/** Registry and observations share one CAS body. No conversation text or Snapshot mutation. */
export class UsMetricsStore{
 private queue:Promise<unknown>=Promise.resolve();private previous=new Map<string,string|null>();private root:string
 constructor(root:string){this.root=root}
 private async chain(path:string):Promise<void>{for(let p=resolve(path);;p=dirname(p)){try{const s=await lstat(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||!s.isFile()&&!s.isDirectory())throw Error('UNSAFE_STORAGE')}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}if(dirname(p)===p)break}}
 private async bytes(path:string):Promise<string|null>{try{await this.chain(path);const h=await open(path,'r');try{const before=await h.stat();if(!before.isFile()||before.nlink!==1||before.size>MAX_METRICS_BYTES)throw Error();const bytes=await h.readFile(),after=await h.stat();await this.chain(path);const named=await lstat(path);if(bytes.length>MAX_METRICS_BYTES||before.ino!==after.ino||before.ino!==named.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs)throw Error();return new TextDecoder('utf-8',{fatal:true}).decode(bytes)}finally{await h.close()}}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw dialogueFailure('STORAGE_READ_FAILED')}}
 private decode(raw:string,id:string):MetricsArchive{try{const v:unknown=JSON.parse(raw);if(isMetricsArchive(v)&&v.projectId===id)return v}catch{}throw dialogueFailure('STORAGE_READ_FAILED')}
 async read(id:string):Promise<MetricsArchive|null>{if(!contextId(id))throw dialogueFailure('INVALID_COMMAND');await this.queue;const raw=await this.bytes(join(this.root,id+'.json')),body=raw===null?null:this.decode(raw,id);this.previous.set(id,raw);return body}
 write(body:MetricsArchive):Promise<void>{
  const candidate=structuredClone(body)
  const result=this.queue.then(async()=>{
   if(!isMetricsArchive(candidate))throw dialogueFailure('STORAGE_WRITE_FAILED')
   await this.chain(this.root);await mkdir(this.root,{recursive:true});await this.chain(this.root)
   const path=join(this.root,candidate.projectId+'.json'),lockPath=path+'.lock'
   // The exclusive writer lease closes the check-to-rename race between stores.
   // A stale or foreign lease is preserved as a conflict, never removed by a reader.
   const lock=await open(lockPath,'wx',0o600).catch(error=>{if((error as NodeJS.ErrnoException).code==='EEXIST')throw dialogueFailure('OUTPUT_CONFLICT');throw error})
   const lockIdentity=await lock.stat()
   try{
    const previous=await this.bytes(path)
    if(previous!==null)this.decode(previous,candidate.projectId)
    if(this.previous.has(candidate.projectId)?this.previous.get(candidate.projectId)!==previous:previous!==null)throw dialogueFailure('OUTPUT_CONFLICT')
    const raw=JSON.stringify(candidate)+'\n'
    if(Buffer.byteLength(raw)>MAX_METRICS_BYTES)throw dialogueFailure('OUTPUT_REFUSED')
    const temporary=path+'.'+randomUUID()+'.tmp'
    try{
     const h=await open(temporary,'wx',0o600)
     try{await h.writeFile(raw,'utf8');await h.sync()}finally{await h.close()}
     await this.chain(path)
     if(await this.bytes(path)!==previous)throw dialogueFailure('OUTPUT_CONFLICT')
     await rename(temporary,path);this.previous.set(candidate.projectId,raw)
    }finally{await unlink(temporary).catch(()=>{})}
   }finally{
    await lock.close()
    const named=await lstat(lockPath).catch(()=>null)
    if(named?.isFile()&&!named.isSymbolicLink()&&named.nlink===1&&named.ino===lockIdentity.ino)await unlink(lockPath)
   }
  })
  this.queue=result.catch(()=>{});return result
 }
}
