import {watch} from 'node:fs'
import type {FSWatcher} from 'node:fs'
import {lstat,open,readdir} from 'node:fs/promises'
import {basename,dirname,isAbsolute,resolve,relative,sep} from 'node:path'
import {createHash} from 'node:crypto'
import type {ObservationPort,ObservationLease,MonitoringHealth} from '../../core/bmad-observation.ts'
export type ObservationHint={path:string;kind:'file'|'directory'|'presence'|'missing';identity:[string,string]|null;sha256:string|null;names:string[]|null;directoriesOnly:boolean}
export type ObservationHints={version:1;entries:ObservationHint[];limited?:string[]}
const key=(p:string)=>resolve(p).toLowerCase()
/** Bounded, non-recursive watches accelerate invalidation. They never authorize an effect. */
export class BmadChangeObserver implements ObservationPort{
 private leases=new Set<ObservationLease>();private closing=false
 private hints:(value:object)=>ObservationHints|undefined;private watchDirectory:typeof watch
 constructor(hints:(value:object)=>ObservationHints|undefined,watchDirectory:typeof watch=watch){this.hints=hints;this.watchDirectory=watchDirectory}
 async attach(value:object,changed:(health:MonitoringHealth)=>void):Promise<ObservationLease>{
  const receipt=this.hints(value),watchers:FSWatcher[]=[];let closed=false,health:MonitoringHealth='watching',epoch=0
  const invalidate=(next:MonitoringHealth):void=>{if(closed||this.closing)return;epoch++;if(next==='unavailable')health=next;changed(health)}
  const close=():void=>{if(closed)return;closed=true;for(const w of watchers)w.close();this.leases.delete(lease)}
  const entries=new Map<string,ObservationHint>()
  const valid=receipt?.version===1&&Array.isArray(receipt.entries)&&receipt.entries.length<=16384&&receipt.entries.every(e=>e&&isAbsolute(e.path)&&!e.path.includes('\0')&&['file','directory','presence','missing'].includes(e.kind)&&(e.identity===null||e.identity.length===2&&e.identity.every(n=>/^\d+$/.test(n)))&&(e.sha256===null||/^[a-f0-9]{64}$/.test(e.sha256))&&(e.names===null||e.names.length<=4096&&e.names.every(n=>typeof n==='string'&&!n.includes('\0')))&&typeof e.directoriesOnly==='boolean')
  if(valid)for(const e of receipt!.entries){const previous=entries.get(key(e.path));if(previous&&(previous.identity?.join(':')!==e.identity?.join(':')||previous.sha256&&e.sha256&&previous.sha256!==e.sha256))health='unavailable';entries.set(key(e.path),{...previous,...e,sha256:e.sha256??previous?.sha256??null,names:e.names??previous?.names??null,directoriesOnly:e.names?e.directoriesOnly:previous?.directoriesOnly??false})}
  else health='unavailable'
  if(receipt?.limited?.length)health='unavailable'
  const safe=async(path:string):Promise<void>=>{for(let p=resolve(path);;p=dirname(p)){const s=await lstat(p,{bigint:true});if(s.isSymbolicLink()||!s.isDirectory()&&!s.isFile()||s.isFile()&&s.nlink!==1n)throw Error('OBSERVATION_BOUNDARY');if(dirname(p)===p)break}}
  const verify=async():Promise<boolean>=>{
   const start=epoch;let bytes=0
   try{for(const e of entries.values()){
    if(closed||this.closing)return false
    if(e.kind==='missing'){let absent=false;try{await lstat(e.path)}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;absent=true}if(!absent)return false;let ancestor=dirname(e.path);for(;;){try{await safe(ancestor);break}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;const parent=dirname(ancestor);if(parent===ancestor)throw error;ancestor=parent}}continue}
    await safe(e.path);const s=await lstat(e.path,{bigint:true});if(!e.identity||s.dev.toString()!==e.identity[0]||s.ino.toString()!==e.identity[1]||e.kind==='directory'&&!s.isDirectory())return false
    if(e.sha256){if(!s.isFile()||s.size>1048576n||bytes+Number(s.size)>32*1024*1024)return false;bytes+=Number(s.size);const f=await open(e.path,'r');try{const before=await f.stat({bigint:true});if(before.ino!==s.ino||before.dev!==s.dev)return false;const raw=await f.readFile(),after=await f.stat({bigint:true});if(raw.length>1048576||before.size!==after.size||before.mtimeNs!==after.mtimeNs||before.ctimeNs!==after.ctimeNs||createHash('sha256').update(raw).digest('hex')!==e.sha256)return false;await safe(e.path);const final=await lstat(e.path,{bigint:true});if(final.ino!==s.ino||final.dev!==s.dev)return false}finally{await f.close()}}
    if(e.names){const list=await readdir(e.path,{withFileTypes:true});const names=e.directoriesOnly?list.filter(v=>v.isDirectory()).map(v=>v.name+'/'):list.map(v=>v.name);if(JSON.stringify(names.sort())!==JSON.stringify([...e.names].sort()))return false}
   }return start===epoch&&!closed&&!this.closing&&health==='watching'}catch{return false}
  }
  const lease:ObservationLease={get health(){return health},close,reconcile:async()=>{const fresh=await verify();if(!fresh)invalidate('unavailable');return fresh}}
  this.leases.add(lease)
  if(this.closing){close();return lease}
  if(health==='watching')try{
   const directories=new Map<string,{path:string;names:Set<string>;all:boolean}>()
   const add=(path:string,name:string|null):void=>{const k=key(path),d=directories.get(k)??{path,names:new Set<string>(),all:false};if(name===null)d.all=true;else d.names.add(name.toLowerCase());directories.set(k,d)}
   for(const e of entries.values()){
    if(e.kind==='directory'&&e.names)add(e.path,null)
    // Every qualified ancestor has an identity; watch its parent for replacement.
    if(dirname(e.path)!==e.path){let parent=dirname(e.path);for(;;){try{await safe(parent);add(parent,relative(parent,e.path).split(sep)[0]);break}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;const above=dirname(parent);if(above===parent)throw error;parent=above}}}
   }
   // 128 handles bound both kernel use and shutdown work. Excess is honest degradation.
   if(directories.size>128)throw Error('OBSERVATION_WATCH_LIMIT')
   for(const d of directories.values()){
    if(closed||this.closing)break
    try{await safe(d.path)}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')continue;throw error}
    const watcher=this.watchDirectory(d.path,{recursive:false,persistent:false},(_event,name)=>{if(name===null){invalidate('unavailable');return}if(d.all||d.names.has(String(name).toLowerCase()))invalidate('watching')});watcher.on('error',()=>invalidate('unavailable'));watchers.push(watcher)
   }
   if(!await verify())invalidate('unavailable')
  }catch{health='unavailable';invalidate('unavailable')}
  if(closed||this.closing)close()
  return lease
 }
 shutdown():void{this.closing=true;for(const lease of [...this.leases])lease.close()}
}
