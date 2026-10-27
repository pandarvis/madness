import {mkdir,open,lstat,rename,unlink} from 'node:fs/promises'
import {dirname} from 'node:path'
import {randomUUID} from 'node:crypto'
import {TextDecoder} from 'node:util'
import {dialogueFailure} from '../../contracts/dialogue.ts'
import {isOwnedRunRecord} from '../../contracts/recovery.ts'
import type {OwnedRunRecord} from '../../contracts/recovery.ts'
/** Comparaison des octets précédents et remplacement atomique ; version inconnue préservée. */
export class RecoveryStore{
 private path:string
 private previous:string|null|undefined
 private queue:Promise<unknown>=Promise.resolve()
 constructor(path:string){this.path=path}
 private async bytes():Promise<string|null>{try{const info=await lstat(this.path);if(!info.isFile()||info.isSymbolicLink()||info.size>65536)throw Error();const f=await open(this.path,'r');try{return new TextDecoder('utf-8',{fatal:true}).decode(await f.readFile())}finally{await f.close()}}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw dialogueFailure('STORAGE_READ_FAILED')}}
 async read():Promise<OwnedRunRecord|null>{await this.queue;const bytes=await this.bytes();let value:unknown=null;if(bytes!==null){try{value=JSON.parse(bytes)}catch{throw dialogueFailure('STORAGE_READ_FAILED')}if(!isOwnedRunRecord(value))throw dialogueFailure('STORAGE_READ_FAILED')}this.previous=bytes;return value as OwnedRunRecord|null}
 write(value:OwnedRunRecord):Promise<void>{const candidate=structuredClone(value);const result=this.queue.then(async()=>{if(!isOwnedRunRecord(candidate)||this.previous===undefined)throw dialogueFailure('STORAGE_WRITE_FAILED');if(await this.bytes()!==this.previous)throw dialogueFailure('OUTPUT_CONFLICT');await mkdir(dirname(this.path),{recursive:true});if((await lstat(dirname(this.path))).isSymbolicLink())throw dialogueFailure('STORAGE_WRITE_FAILED');const temporary=this.path+'.'+randomUUID()+'.tmp',bytes=JSON.stringify(candidate)+'\n';try{const f=await open(temporary,'wx',0o600);try{await f.writeFile(bytes,'utf8');await f.sync()}finally{await f.close()}await rename(temporary,this.path);this.previous=bytes}finally{await unlink(temporary).catch(()=>{})}});this.queue=result.catch(()=>{});return result}
}
