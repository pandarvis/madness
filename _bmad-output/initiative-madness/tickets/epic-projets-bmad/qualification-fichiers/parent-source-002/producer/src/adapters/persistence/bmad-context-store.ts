import {mkdir,open,readdir,rename,unlink,lstat} from 'node:fs/promises'
import {join,dirname,resolve} from 'node:path'
import {randomUUID} from 'node:crypto'
import {TextDecoder} from 'node:util'
import {isBmadSelection,contextId} from '../../contracts/bmad-context.ts'
import type {BmadSelection} from '../../contracts/bmad-context.ts'
import {dialogueFailure} from '../../contracts/dialogue.ts'
/** Annexe CAS par projet. Aucun changement au Snapshot v1 ou aux captures historiques. */
export class BmadContextStore{
 private root:string;private queue:Promise<unknown>=Promise.resolve();private previous=new Map<string,string|null>()
 constructor(root:string){this.root=root}
 private async chain(path:string):Promise<void>{for(let p=resolve(path);;p=dirname(p)){try{const s=await lstat(p);if(s.isSymbolicLink()||s.isFile()&&s.nlink!==1||!s.isFile()&&!s.isDirectory())throw Error('UNSAFE_STORAGE')}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e}if(dirname(p)===p)break}}
 private async bytes(path:string):Promise<string|null>{try{await this.chain(path);const h=await open(path,'r');try{const before=await h.stat();if(!before.isFile()||before.nlink!==1||before.size>65536)throw Error();const raw=await h.readFile(),after=await h.stat();await this.chain(path);const named=await lstat(path);if(raw.length>65536||before.ino!==after.ino||before.ino!==named.ino||before.size!==after.size||before.mtimeMs!==after.mtimeMs)throw Error();return new TextDecoder('utf-8',{fatal:true}).decode(raw)}finally{await h.close()}}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw dialogueFailure('STORAGE_READ_FAILED')}}
 private decode(raw:string,id:string):BmadSelection{try{const v:unknown=JSON.parse(raw);if(isBmadSelection(v)&&v.projectId===id)return v}catch{}throw dialogueFailure('STORAGE_READ_FAILED')}
 async read(id:string):Promise<BmadSelection|null>{if(!contextId(id))throw dialogueFailure('INVALID_COMMAND');await this.queue;const path=join(this.root,id+'.json'),raw=await this.bytes(path);const record=raw===null?null:this.decode(raw,id);this.previous.set(id,raw);return record}
 write(record:BmadSelection):Promise<void>{const candidate=structuredClone(record);const result=this.queue.then(async()=>{if(!isBmadSelection(candidate))throw dialogueFailure('STORAGE_WRITE_FAILED');await this.chain(this.root);await mkdir(this.root,{recursive:true});await this.chain(this.root);const id=candidate.projectId,path=join(this.root,id+'.json'),previous=await this.bytes(path);if(previous!==null)this.decode(previous,id);if(this.previous.has(id)?this.previous.get(id)!==previous:previous!==null)throw dialogueFailure('OUTPUT_CONFLICT');if(previous===null&&(await readdir(this.root)).filter(n=>n.endsWith('.json')).length>=1000)throw dialogueFailure('STORAGE_WRITE_FAILED');const raw=JSON.stringify(candidate,null,2)+'\n',temporary=path+'.'+randomUUID()+'.tmp';try{const f=await open(temporary,'wx',0o600);try{await f.writeFile(raw,'utf8');await f.sync()}finally{await f.close()}await this.chain(path);if(await this.bytes(path)!==previous)throw dialogueFailure('OUTPUT_CONFLICT');await rename(temporary,path);this.previous.set(id,raw)}finally{await unlink(temporary).catch(()=>{})}});this.queue=result.catch(()=>{});return result}
}
