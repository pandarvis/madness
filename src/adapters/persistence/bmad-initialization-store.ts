import {randomUUID} from 'node:crypto'
import {lstat, mkdir, open, opendir, rename, unlink} from 'node:fs/promises'
import {dirname, join, resolve} from 'node:path'
import {TextDecoder} from 'node:util'
import {INITIALIZATION_ATTEMPT_LIMIT, sameInitializationData, validateInitializationOperation} from '../../contracts/bmad-initialization.ts'
import type {InitializationOperation, InitializationStorePort} from '../../contracts/bmad-initialization.ts'

const LIMIT = 2*1024*1024
const attemptId = /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/
const missing = (error:unknown):boolean => (error as NodeJS.ErrnoException).code==='ENOENT'
function decode(value:unknown,id:string):InitializationOperation {
 const result = validateInitializationOperation(value)
 if (!result.ok || result.value.attemptId!==id ||
     result.value.preservation.status!=='stored' || result.value.preservation.durableRevision!==result.value.revision) {
  throw Error('INITIALIZATION_STORE_UNREADABLE')
 }
 return result.value
}

/** Detached v1 attempt records. A consumed decision is durable before any target operation. */
export class BmadInitializationStore implements InitializationStorePort {
 #queue:Promise<unknown> = Promise.resolve()
 #root:string
 constructor(root:string) { this.#root = resolve(root) }
 async #chain():Promise<void> {
  for (let name=this.#root;;name=dirname(name)) {
   try { if (!(await lstat(name)).isDirectory()) throw Error('INITIALIZATION_STORAGE_PATH') }
   catch (error) { if (!missing(error)) throw error }
   if (name===dirname(name)) break
  }
 }
 async #read(id:string):Promise<{raw:string;record:InitializationOperation}|null> {
  if (!attemptId.test(id)) throw Error('INITIALIZATION_ATTEMPT_ID')
  const path = join(this.#root,id+'.json')
  await this.#chain()
  let before
  try { before = await lstat(path,{bigint:true}) }
  catch (error) { if (missing(error)) return null; throw error }
  if (!before.isFile() || before.nlink!==1n || before.size>BigInt(LIMIT)) throw Error('INITIALIZATION_STORE_UNREADABLE')
  const file = await open(path,'r')
  try {
   const same = (s:typeof before):boolean => s.isFile() && s.nlink===1n &&
    s.dev===before.dev && s.ino===before.ino && s.size===before.size && s.mtimeNs===before.mtimeNs && s.ctimeNs===before.ctimeNs
   if (!same(await file.stat({bigint:true}))) throw Error('INITIALIZATION_STORE_CHANGED')
   const bytes = Buffer.alloc(Number(before.size)+1)
   let position = 0
   while (position<bytes.length) {
    const {bytesRead} = await file.read(bytes,position,bytes.length-position,position)
    if (!bytesRead) break
    position += bytesRead
   }
   await this.#chain()
   if (BigInt(position)!==before.size || !same(await file.stat({bigint:true})) ||
       !same(await lstat(path,{bigint:true}))) throw Error('INITIALIZATION_STORE_CHANGED')
   const raw = new TextDecoder('utf-8',{fatal:true}).decode(bytes.subarray(0,position))
   return {raw,record:decode(JSON.parse(raw),id)}
  } finally { await file.close() }
 }
 async #names():Promise<string[]> {
  await this.#chain()
  const names:string[] = [], folded = new Set<string>()
  let dir
  try { dir = await opendir(this.#root) }
  catch (error) { if (missing(error)) return names; throw error }
  let examined=0
  for await (const file of dir) {
   if (++examined>2*INITIALIZATION_ATTEMPT_LIMIT) throw Error('INITIALIZATION_STORE_UNREADABLE')
   if (file.isFile() && /^[A-Za-z0-9][A-Za-z0-9_-]{0,79}\.json\.[0-9a-f-]{36}\.tmp$/.test(file.name)) continue
   const id = file.name.slice(0,-5)
   if (!file.isFile() || !file.name.endsWith('.json') || !attemptId.test(id) ||
       folded.has(id.toLowerCase()) || names.length>=INITIALIZATION_ATTEMPT_LIMIT) throw Error('INITIALIZATION_STORE_UNREADABLE')
   names.push(id)
   folded.add(id.toLowerCase())
  }
  return names
 }
 async list():Promise<InitializationOperation[]> {
  await this.#queue
  const result:InitializationOperation[] = []
  for (const id of await this.#names()) {
   const item = await this.#read(id)
   if (!item) throw Error('INITIALIZATION_STORE_CHANGED')
   result.push(item.record)
  }
  return result
 }
 write(record:InitializationOperation,expectedDurableRevision:number|null):Promise<void> {
  const candidate = decode(record,record.attemptId)
  const work = this.#queue.then(async()=>{
   const id = candidate.attemptId, path = join(this.#root,id+'.json')
   const previous = await this.#read(id)
   if (previous?.record.revision===candidate.revision && sameInitializationData(previous.record,candidate)) return
   if ((previous?.record.revision??null)!==expectedDurableRevision ||
       previous && candidate.revision<=previous.record.revision) throw Error('INITIALIZATION_STORE_CONFLICT')
   if (!previous && (await this.#names()).length>=INITIALIZATION_ATTEMPT_LIMIT) throw Error('INITIALIZATION_STORE_LIMIT')
   const raw = JSON.stringify(candidate)+'\n'
   if (Buffer.byteLength(raw)>LIMIT) throw Error('INITIALIZATION_STORE_LIMIT')
   await mkdir(this.#root,{recursive:true})
   await this.#chain()
   const temporary = path+'.'+randomUUID()+'.tmp'
   const file = await open(temporary,'wx',0o600)
   try {
    try { await file.writeFile(raw,'utf8'); await file.sync() }
    finally { await file.close() }
    if ((await this.#read(id))?.raw!==previous?.raw) throw Error('INITIALIZATION_STORE_CONFLICT')
    await rename(temporary,path)
   } finally { await unlink(temporary).catch(()=>{}) }
  })
  this.#queue = work.catch(()=>{})
  return work
 }
 async drain():Promise<void> { await this.#queue }
}
