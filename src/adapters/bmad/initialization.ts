import {createHash} from 'node:crypto'
import type {BigIntStats} from 'node:fs'
import {lstat, mkdir, open, opendir, realpath} from 'node:fs/promises'
import {basename, dirname, join, resolve, win32} from 'node:path'
import {gunzipSync} from 'node:zlib'
import {sameInitializationData, validateInitializationPlan} from '../../contracts/bmad-initialization.ts'
import type {
 InitializationApplicationFact, InitializationAttempt, InitializationEntry, InitializationFact,
 InitializationHostPort, InitializationInspectionFact, InitializationOperation, InitializationPlan, InitializationPlanAuthority, InitializationPreservedEntry
} from '../../contracts/bmad-initialization.ts'
import type {BmadConfigurationObservation,CapturedBmadContext} from '../../contracts/bmad-context.ts'
import {qualifyBmadProfile} from './profile.ts'

const MiB = 1024 * 1024
const PROFILE = 'local-6.13.0-next'
const SOURCE = '2050318463c85f81e8676a097be75994b2ce8e24c90add33595c985c0064e782'
const SEAL = 'd8561f40217bdd43991af4015560141071623af827e6cfc9bd32288467b7d042'
const MAX_ENTRIES = 2048, MAX_DEPTH = 20, MAX_PATH = 1024, MAX_TREE_BYTES = 16*MiB
const RESERVED = new Set(['.agents','_bmad','_bmad-output','skills-lock.json'])
const sha = (value:Buffer|string):string => createHash('sha256').update(value).digest('hex')
const stamp = (value:unknown):string => sha(JSON.stringify(value))
const equal = sameInitializationData
const physicalIdentity = (chain:Physical[]):string => stamp(chain.map(part=>[part.path.toLowerCase(),part.identity]))
const absenceRevision = (rootIdentity:string):string => stamp(['initialization-absence-v1',rootIdentity])
const sorted = <T extends {path:string}>(rows:T[]):T[] => rows.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0)
const segment = (name:string):boolean =>
 !!name && name.length<=255 && !/[\\/:<>"|?*\x00-\x1f\x7f~]/.test(name) &&
 !/[. ]$/.test(name) && !/^(con|prn|aux|nul|conin\$|conout\$|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(name)

type Physical = {path:string;identity:string}
type Tree = {entries:InitializationPreservedEntry[];directories:Map<string,Physical>;revision:string}
type Payload = {entries:InitializationEntry[];bytes:Map<string,Buffer>;revision:string;resourceRevision:string}
type Effect = {requested:boolean;complete:boolean;closed:boolean}

async function directory(path:string,signal:AbortSignal):Promise<Physical> {
 signal.throwIfAborted()
 const s = await lstat(path,{bigint:true})
 signal.throwIfAborted()
 if (!s.isDirectory() || s.ino===0n) throw Error('UNSAFE_DIRECTORY')
 return {path,identity:`${s.dev}:${s.ino}`}
}
async function chain(path:string,signal:AbortSignal):Promise<Physical[]> {
 const parts:Physical[] = []
 for (let current=path;;current=dirname(current)) {
  parts.push(await directory(current,signal))
  if (dirname(current)===current) break
  if (!segment(basename(current))) throw Error('UNSAFE_PATH')
 }
 const actual = await realpath(path)
 signal.throwIfAborted()
 if (actual.toLowerCase()!==path.toLowerCase()) throw Error('NON_CANONICAL_PATH')
 return parts
}
const safeFile = (stat:BigIntStats):boolean => stat.isFile() && stat.nlink===1n && stat.ino!==0n
const sameMetadata = (before:BigIntStats,after:BigIntStats):boolean =>
 after.dev===before.dev && after.ino===before.ino && after.size===before.size &&
 after.mtimeNs===before.mtimeNs && after.ctimeNs===before.ctimeNs
const unchangedFile = (before:BigIntStats,after:BigIntStats):boolean => safeFile(after) && sameMetadata(before,after)

async function readBounded(path:string,limit:number,signal:AbortSignal):Promise<{bytes:Buffer;identity:string;stat:BigIntStats}> {
 signal.throwIfAborted()
 const before = await lstat(path,{bigint:true})
 if (!safeFile(before) || before.size>BigInt(limit)) throw Error('UNSAFE_FILE')
 signal.throwIfAborted()
 const file = await open(path,'r')
 try {
  const opened = await file.stat({bigint:true})
  if (!unchangedFile(before,opened)) throw Error('SOURCE_CHANGED')
  const bytes = Buffer.alloc(Number(before.size)+1)
  let position = 0
  while (position<bytes.length) {
   signal.throwIfAborted()
   const {bytesRead} = await file.read(bytes,position,bytes.length-position,position)
   if (!bytesRead) break
   position += bytesRead
  }
  signal.throwIfAborted()
  if (BigInt(position)!==before.size || !unchangedFile(before,await file.stat({bigint:true})) ||
      !unchangedFile(before,await lstat(path,{bigint:true}))) throw Error('SOURCE_CHANGED')
  signal.throwIfAborted()
  return {bytes:bytes.subarray(0,position),identity:`${opened.dev}:${opened.ino}`,stat:opened}
 } finally { await file.close() }
}
async function inventory(root:string,signal:AbortSignal,snapshots?:Map<string,BigIntStats>):Promise<Tree> {
 const entries:InitializationPreservedEntry[] = [], identities:[string,string][] = []
 const directories = new Map<string,Physical>()
 let total = 0
 async function walk(path:string,relative:string,depth:number):Promise<void> {
  if (path.length>MAX_PATH || depth>MAX_DEPTH) throw Error('TREE_LIMIT')
  const before = await directory(path,signal)
  const metadata = await lstat(path,{bigint:true})
  if (`${metadata.dev}:${metadata.ino}`!==before.identity) throw Error('DIRECTORY_CHANGED')
  directories.set(relative,before)
  snapshots?.set(path,metadata)
  const names = new Set<string>()
  signal.throwIfAborted()
  const handle = await opendir(path)
  for await (const child of handle) {
   signal.throwIfAborted()
   if (entries.length>=MAX_ENTRIES || !segment(child.name) || names.has(child.name.toLowerCase())) throw Error('TREE_LIMIT_OR_COLLISION')
   names.add(child.name.toLowerCase())
   const full = join(path,child.name), next = relative?relative+'/'+child.name:child.name
   if (full.length>MAX_PATH) throw Error('TREE_LIMIT')
   if (child.isDirectory()) {
    entries.push({path:next,kind:'directory'})
    await walk(full,next,depth+1)
   } else {
    if (!child.isFile()) throw Error('UNSAFE_ENTRY')
    const {bytes:data,identity,stat} = await readBounded(full,Math.min(MiB,MAX_TREE_BYTES-total),signal)
    snapshots?.set(full,stat)
    identities.push([next,identity])
    total += data.length
    entries.push({path:next,kind:'file',sha256:sha(data),bytes:data.length})
   }
  }
  const after = await lstat(path,{bigint:true})
  signal.throwIfAborted()
  if (!after.isDirectory() || before.identity!==`${after.dev}:${after.ino}` ||
      metadata.mtimeNs!==after.mtimeNs || metadata.ctimeNs!==after.ctimeNs) throw Error('DIRECTORY_CHANGED')
  identities.push([relative,before.identity])
 }
 await walk(root,'',0)
 sorted(entries)
 identities.sort(([a],[b])=>a<b?-1:a>b?1:0)
 return {entries,directories,revision:stamp({entries,identities})}
}
async function parentRevision(parent:Physical,signal:AbortSignal):Promise<string> {
 signal.throwIfAborted()
 const s = await lstat(parent.path,{bigint:true})
 signal.throwIfAborted()
 if (!s.isDirectory() || `${s.dev}:${s.ino}`!==parent.identity) throw Error('PARENT_CHANGED')
 return stamp([parent.identity,String(s.mtimeNs),String(s.ctimeNs)])
}
export async function assertInitializationOutsideStorage(projectRoot:string,storageRoot:string):Promise<void> {
 const [project,storage]=await Promise.all([realpath(projectRoot),realpath(storageRoot)])
 const contains=(root:string,path:string):boolean=>{
  const relative=win32.relative(root,path)
  return !win32.isAbsolute(relative)&&relative!=='..'&&!relative.startsWith('..\\')
 }
 if(contains(project,storage)||contains(storage,project))throw Error('INITIALIZATION_STORAGE_OVERLAP')
}
function evidence(entry:InitializationEntry):InitializationPreservedEntry {
 if (entry.kind==='directory') return entry
 const {path,kind,sha256,bytes} = entry
 return {path,kind,sha256,bytes}
}
async function loadPayload(archive:string,projectName:string,signal:AbortSignal):Promise<Payload> {
 let raw:Buffer, resourceRevision:string
 try {
  const resourceChain = await chain(dirname(archive),signal)
  const {bytes:compressed,identity} = await readBounded(archive,2*MiB,signal)
  raw = gunzipSync(compressed,{maxOutputLength:5*MiB})
  if (sha(raw)!==SEAL || !equal(resourceChain,await chain(dirname(archive),signal))) throw Error('RESOURCE_SEAL')
  resourceRevision = stamp([resourceChain,identity,sha(compressed)])
 } catch(error) {
  signal.throwIfAborted()
  throw Error((error as NodeJS.ErrnoException).code==='ENOENT'?'RESOURCE_MISSING':'RESOURCE_SEAL')
 }
 // The exact pinned UTF-8 JSON is checked before parsing. Verify the inventory and
 // decoded byte lengths/hashes too, including the original qualified config.
 const {schemaVersion,profileId,sourceRevision,entries} = JSON.parse(raw.toString('utf8')) as {
  schemaVersion:number;profileId:string;sourceRevision:string
  entries:({path:string;type:'directory'}|{path:string;type:'file';bytes:number;sha256:string;data:string})[]
 }
 if (schemaVersion!==1 || profileId!==PROFILE || sourceRevision!==SOURCE || entries.length!==588) throw Error('RESOURCE_SEAL')
 const files = new Map<string,Buffer>(), additions:InitializationEntry[] = [], manifest:unknown[] = []
 for (const row of entries) {
  signal.throwIfAborted()
  if (!row.path.split('/').every(segment) || !/^((\.agents)|_bmad|_bmad-output)(\/|$)/.test(row.path)) throw Error('RESOURCE_SEAL')
  if (row.type==='directory') {
   manifest.push(row)
   additions.push({path:row.path,kind:'directory'})
   continue
  }
  const {data,...expected} = row
  manifest.push(expected)
  let bytes = Buffer.from(data,'base64')
  if (bytes.length!==row.bytes || sha(bytes)!==row.sha256 || bytes.toString('base64')!==data) throw Error('RESOURCE_SEAL')
  if (row.path==='_bmad/config.toml') {
   const positive = bytes.toString('utf8')
   if (!positive.includes('project_name = "positive"\r\n')) throw Error('RESOURCE_SEAL')
   bytes = Buffer.from(positive.replace('project_name = "positive"\r\n',`project_name = "${projectName}"\r\n`))
  }
  const sha256 = sha(bytes), contentId = stamp([row.path,sha256])
  files.set(contentId,bytes)
  additions.push({path:row.path,kind:'file',contentId,bytes:bytes.length,sha256})
 }
 if (stamp(manifest)!==SOURCE || files.size!==462) throw Error('RESOURCE_SEAL')
 return {entries:additions,bytes:files,revision:stamp(additions.map(evidence)),resourceRevision}
}

/** File I/O is owned here. Only the core can admit a plan and consume its grant. */
export class BmadInitializationHost implements InitializationHostPort {
 #plans = new WeakMap<object,InitializationPlanAuthority>()
 #inspectionFacts = new WeakMap<object,InitializationInspectionFact>()
 #active = new Set<Promise<unknown>>()
 #closing = false
 constructor(privateResource:string) { this.archive = resolve(privateResource) }
 private archive:string
 authority(original:object):InitializationPlanAuthority|undefined { return this.#plans.get(original) }
 #own<T>(operation:()=>Promise<T>):Promise<T> {
  if (this.#closing) return Promise.reject(Error('CLOSING'))
  const task = operation()
  this.#active.add(task)
  void task.then(()=>this.#active.delete(task),()=>this.#active.delete(task))
  return task
 }
 async shutdown():Promise<void> {
  this.#closing = true
  await Promise.allSettled(this.#active)
 }
 observeAbsence(projectId:string,rootPath:string,signal:AbortSignal):Promise<BmadConfigurationObservation> {
  return this.#own(async()=>{
   if (process.platform!=='win32'||! /^[A-Za-z]:[\\/]/.test(rootPath)) throw Error('TARGET_UNAVAILABLE')
   const root=resolve(rootPath), before=await chain(root,signal)
   if(before.length<2)throw Error('TARGET_UNAVAILABLE')
   const rootIdentity=physicalIdentity(before), names=new Set<string>()
   let collision=false
   const entries=await opendir(root)
   for await(const child of entries){
    signal.throwIfAborted()
    const name=child.name.toLowerCase()
    if(names.has(name)||names.size>=MAX_ENTRIES)throw Error('TREE_LIMIT_OR_COLLISION')
    names.add(name)
    if(RESERVED.has(name))collision=true
   }
   for(const name of RESERVED){
    signal.throwIfAborted()
    try{await lstat(join(root,name));collision=true}
    catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error}
   }
   if(!equal(before,await chain(root,signal)))throw Error('TARGET_CHANGED')
   return {schemaVersion:1,projectId,rootPath,rootIdentity,observedAt:new Date().toISOString(),
    revision:collision?stamp(['initialization-collision-v1',rootIdentity]):absenceRevision(rootIdentity),
    status:collision?'unknown':'absent',activeInitiative:null,activeStatus:'absent',sources:[],
    problems:collision?['RESERVED_COLLISION']:[]}
  })
 }
 inspectionFact(original:object):InitializationInspectionFact|undefined { return this.#inspectionFacts.get(original) }
 inspect(operation:InitializationOperation,signal:AbortSignal):Promise<object> {
  if(!operation.plan)return Promise.reject(Error('INSPECTION_UNAVAILABLE'))
  return this.#own(()=>this.#inspect(operation.plan!,operation,operation.lastFactOrder+1,signal))
 }
 async #inspect(plan:InitializationPlan,operation:InitializationOperation,order:number,signal:AbortSignal):Promise<object> {
  const {identity,preconditions}=plan
  if(process.platform!=='win32'||operation.stop==='not-observed')throw Error('INSPECTION_UNAVAILABLE')
  const root=resolve(identity.rootPath), before=await chain(root,signal), parent=before[1]
  if(!parent||physicalIdentity(before)!==identity.rootIdentity||parent.path!==resolve(identity.parentPath)||
     parent.identity!==identity.parentIdentity)throw Error('PHYSICAL_TARGET_CHANGED')
  const parentTreeRevision=await parentRevision(parent,signal)
  const snapshots=new Map<string,BigIntStats>()
  const current=await inventory(root,signal,snapshots)
  const assertTarget=async():Promise<void>=>{
   if(!equal(before,await chain(root,signal))||parentTreeRevision!==await parentRevision(parent,signal)||
      !equal(before[0],current.directories.get('')))throw Error('PHYSICAL_TARGET_CHANGED')
  }
  await assertTarget()
  const entries=new Map(current.entries.map(entry=>[entry.path,entry]))
  const observedAdditions=plan.additions.filter(entry=>equal(entries.get(entry.path),evidence(entry)))
  const observedPaths=new Set(observedAdditions.map(entry=>entry.path))
  const unverifiedPaths=plan.additions.filter(entry=>!observedPaths.has(entry.path)).map(entry=>entry.path)
  const targetIntact=operation.stop==='confirmed'&&operation.result.receipt?.stop==='confirmed'&&
   observedAdditions.length===0&&current.revision===preconditions.targetTreeRevision&&
   parentTreeRevision===preconditions.parentTreeRevision&&
   !current.entries.some(entry=>RESERVED.has(entry.path.split('/')[0].toLowerCase()))
  if(targetIntact){
   // Recheck named metadata after all reads. External changes can still race the individual stats.
   for(const [path,stat] of snapshots){
    signal.throwIfAborted()
    const current=await lstat(path,{bigint:true})
    if(stat.isDirectory()){
     if(!current.isDirectory()||!sameMetadata(stat,current))throw Error('DIRECTORY_CHANGED')
    }else if(!unchangedFile(stat,current))throw Error('SOURCE_CHANGED')
   }
   await assertTarget()
  }
  const fact:InitializationInspectionFact={
   schemaVersion:1,kind:'inspection',identity,planId:plan.id,planRevision:plan.revision,order,
   coverage:targetIntact||!unverifiedPaths.length?'complete':'partial',observedAdditions,unverifiedPaths,
   stop:operation.stop,reason:targetIntact||!unverifiedPaths.length?null:'inspection-entries-unconfirmed',
   ...(targetIntact?{targetIntact:true}:{})
  }
  const token=structuredClone(fact)
  this.#inspectionFacts.set(token,fact)
  return token
 }
 prepare(request:InitializationAttempt&{context:CapturedBmadContext},signal:AbortSignal):Promise<object> {
  return this.#own(()=>this.#prepare(request,signal))
 }
 async #prepare({projectId,attemptId,generation,context}:InitializationAttempt&{context:CapturedBmadContext},signal:AbortSignal):Promise<object> {
  const observation = context.observation, rootPath = observation.rootPath
  if (process.platform!=='win32' || context.scope!=='configuration' || observation.status!=='absent' ||
      observation.projectId!==projectId || !/^[A-Za-z]:[\\/]/.test(rootPath)) throw Error('TARGET_UNAVAILABLE')
  const root = resolve(rootPath), parentPath = dirname(root), projectName = basename(root)
  if (!/^[\p{L}\p{N}][\p{L}\p{N} _.-]{0,79}$/u.test(projectName) || !segment(projectName)) throw Error('PROJECT_NAME_REFUSED')
  const rootChain = await chain(root,signal)
  if (rootChain.length<2 || physicalIdentity(rootChain)!==observation.rootIdentity ||
      absenceRevision(observation.rootIdentity)!==observation.revision) throw Error('TARGET_CHANGED')
  const parent = rootChain[1], parentTreeRevision = await parentRevision(parent,signal)
  const before = await inventory(root,signal)
  if (before.entries.some(e=>RESERVED.has(e.path.split('/')[0].toLowerCase()))) throw Error('RESERVED_COLLISION')
  const payload = await loadPayload(this.archive,projectName,signal)
  const union = sorted([...before.entries,...payload.entries.map(evidence)])
  const unionBytes = union.reduce((total,entry)=>total+(entry.kind==='file'?entry.bytes:0),0)
  if (union.length>MAX_ENTRIES || unionBytes>MAX_TREE_BYTES || payload.entries.some(e=>join(root,e.path).length>MAX_PATH)) throw Error('TREE_LIMIT')
  if (!equal(rootChain,await chain(root,signal)) || parentTreeRevision!==await parentRevision(parent,signal)) throw Error('TARGET_CHANGED')
  const identity = {
   projectId,attemptId,generation,rootPath,rootIdentity:observation.rootIdentity,
   parentPath:rootPath.includes('/')?parentPath.replaceAll('\\','/'):parentPath,parentIdentity:parent.identity,
   contextRevision:observation.revision,profileId:PROFILE,sourceRevision:SOURCE,payloadRevision:payload.revision
  }
  const preconditions = {configurationRevision:observation.revision,targetTreeRevision:before.revision,
   parentTreeRevision,sourceRevision:SOURCE,payloadRevision:payload.revision}
  const captured = {
   schemaVersion:1 as const,id:'plan-'+attemptId,identity,observedAt:new Date().toISOString(),preconditions,
   parameters:[{name:'project_name',value:projectName},{name:'output_folder',value:'{project-root}/_bmad-output'}],
   additions:payload.entries,preserved:before.entries,excluded:[{path:'skills-lock.json',reason:'private-source-reference'}],
   limitations:['windows-local-profile','bounded-inventory','exclusive-additions','external-races','no-automatic-recovery']
  }
  const original:InitializationPlan = {...captured,revision:stamp(captured)}
  if (!validateInitializationPlan(original).ok) throw Error('PLAN_INVALID')
  const facts = new WeakMap<object,InitializationFact>(), effects = new WeakMap<object,Effect>()
  let order = 0, checked = false, applied = false
  const fact = (value:Omit<InitializationApplicationFact,'schemaVersion'|'identity'|'planId'|'planRevision'|'order'>|
      {kind:'preconditions';preconditions:typeof preconditions;complete:true}):object => {
   const issued:InitializationFact = {...value,schemaVersion:1,identity,planId:original.id,planRevision:original.revision,order:++order}
   const token = structuredClone(issued)
   facts.set(token,issued)
   return token
  }
  const guard = async (s:AbortSignal):Promise<void> => {
   if (!equal(rootChain,await chain(root,s)) || parentTreeRevision!==await parentRevision(parent,s)) throw Error('PHYSICAL_TARGET_CHANGED')
  }
  const authority:InitializationPlanAuthority = {
   plan:structuredClone(original),
   fact: token=>facts.get(token)??this.#inspectionFacts.get(token),
   recheck:s=>this.#own(async()=>{
    checked = false
    if (applied) throw Error('STALE')
    const current = await loadPayload(this.archive,projectName,s)
    if (current.revision!==payload.revision || current.resourceRevision!==payload.resourceRevision) throw Error('RESOURCE_CHANGED')
    const target = await inventory(root,s)
    await guard(s)
    if (target.entries.some(e=>RESERVED.has(e.path.split('/')[0].toLowerCase()))) throw Error('RESERVED_COLLISION')
    if (target.revision!==before.revision) throw Error('TARGET_TREE_CHANGED')
    checked = true
    return fact({kind:'preconditions',preconditions,complete:true})
   }),
   apply:s=>this.#own(async()=>{
    if (!checked || applied) throw Error('STALE')
    applied = true
    const token = {}, effect:Effect = {requested:false,complete:false,closed:true}
    effects.set(token,effect)
    const directories = new Map(before.directories)
    try {
     for (const entry of payload.entries) {
      const path = join(root,entry.path)
      const relativeParent = entry.path.includes('/')?entry.path.slice(0,entry.path.lastIndexOf('/')):''
      const actualChain = await chain(dirname(path),s)
      const rootIndex = relativeParent?relativeParent.split('/').length:0
      if (!equal(actualChain.slice(rootIndex),rootChain) || parentTreeRevision!==await parentRevision(parent,s)) throw Error('PHYSICAL_TARGET_CHANGED')
      let key = relativeParent
      for (const current of actualChain) {
       if (!equal(directories.get(key),current)) throw Error('PARENT_CHANGED')
       if (!key) break
       key = key.includes('/')?key.slice(0,key.lastIndexOf('/')):''
      }
      s.throwIfAborted()
      effect.requested = true
      if (entry.kind==='directory') {
       await mkdir(path)
       directories.set(entry.path,await directory(path,s))
      } else {
       const file = await open(path,'wx',0o600)
       try {
        s.throwIfAborted()
        await file.writeFile(payload.bytes.get(entry.contentId)!)
        s.throwIfAborted()
        await file.sync()
       } finally {
        try { await file.close() }
        catch(error) { effect.closed=false; throw error }
       }
      }
     }
     effect.complete = true
    } catch { /* Confirm observable effects using a separate bounded read. */ }
    return token
   }),
   verify:(token,s)=>this.#own(async()=>{
    const effect = effects.get(token)
    if (!effect) throw Error('FOREIGN_EFFECT')
    effects.delete(token)
    let observedAdditions:InitializationEntry[] = [], preservedVerified = false
    let outcome:InitializationApplicationFact['outcome'] = 'unknown'
    try {
     await guard(s)
     const current = await inventory(root,s)
     const entries = new Map(current.entries.map(entry=>[entry.path,entry]))
     preservedVerified = before.entries.every(entry=>equal(entries.get(entry.path),entry))
     observedAdditions = payload.entries.filter(entry=>equal(entries.get(entry.path),evidence(entry)))
     if (effect.closed && effect.complete && equal(current.entries,union)) {
      s.throwIfAborted()
      await qualifyBmadProfile(root)
      s.throwIfAborted()
      await guard(s)
      if ((await inventory(root,s)).revision!==current.revision) throw Error('RESULT_CHANGED')
      outcome = 'verified'
     } else if (effect.closed && !effect.requested && equal(current.entries,before.entries)) outcome = 'failed-no-effect'
     else if (observedAdditions.length) outcome = 'partial'
    } catch { /* Missing evidence does not turn the result into success. */ }
    return fact({kind:'application',outcome,observedAdditions,preservedVerified,
     unionVerified:outcome==='verified',stop:effect.closed?'confirmed':'unknown',
     unverifiedPaths:outcome==='failed-no-effect'?[]:payload.entries.filter(e=>!observedAdditions.includes(e)).map(e=>e.path),
     reason:outcome==='verified'?null:'application-not-verified'})
   }),
   inspect:(s,operation)=>this.#own(()=>{
    order=Math.max(order,operation.lastFactOrder)+1
    return this.#inspect(original,operation,order,s)
   }),
   content:(contentId,s)=>this.#own(async()=>{
    s.throwIfAborted()
    const entry = payload.entries.find(e=>e.kind==='file'&&e.contentId===contentId), data = payload.bytes.get(contentId)
    if (entry?.kind!=='file' || !data) throw Error('CONTENT_UNAVAILABLE')
    const utf8 = data.toString('utf8'), text = !utf8.includes('\0') && Buffer.from(utf8).equals(data)
    return {contentId,path:entry.path,bytes:entry.bytes,sha256:entry.sha256,
     encoding:text?'utf8':'base64',data:text?utf8:data.toString('base64')}
   })
  }
  this.#plans.set(original,authority)
  return original
 }
}
