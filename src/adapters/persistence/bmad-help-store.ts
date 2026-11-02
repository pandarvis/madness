import { mkdir, open, readdir, rename, unlink, lstat } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { TextDecoder } from 'node:util'
import { dialogueError, dialogueFailure } from '../../contracts/dialogue.ts'
import {isHelpRecord} from '../../contracts/bmad-help.ts'
import type {HelpRecord} from '../../contracts/bmad-help.ts'

/** Annexe versionnée : Snapshot v1 ne change pas. Un fichier atomique par conversation. */
export class BmadHelpStore {
  private root: string
  private queue: Promise<unknown> = Promise.resolve()
  private previous = new Map<string, string | null>()
  constructor(root: string) { this.root = root }
  private async bytes(path: string): Promise<string | null> {
    try {
      if ((await lstat(path)).isSymbolicLink()) throw Error()
      const handle = await open(path, 'r')
      try { if ((await handle.stat()).size > 8388608) throw Error(); return new TextDecoder('utf-8', { fatal: true }).decode(await handle.readFile()) } finally { await handle.close() }
    } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null; throw dialogueFailure('STORAGE_READ_FAILED') }
  }
  private decode(bytes: string): HelpRecord { try { const v: unknown = JSON.parse(bytes); if (isHelpRecord(v)) return v } catch { /* préserver */ } throw dialogueFailure('STORAGE_READ_FAILED') }
  async read(): Promise<HelpRecord[]> {
    await this.queue
    let names: string[]
    try { if ((await lstat(this.root)).isSymbolicLink()) throw Error(); names = await readdir(this.root) } catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return []; throw dialogueFailure('STORAGE_READ_FAILED') }
    const files = names.filter(n => n.endsWith('.json')).sort()
    if (files.length > 200 || files.some(n => !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}\.json$/.test(n))) throw dialogueFailure('STORAGE_READ_FAILED')
    const records: HelpRecord[] = []
    for (const name of files) { const path = join(this.root,name), bytes = await this.bytes(path); if (bytes === null) throw dialogueFailure('STORAGE_READ_FAILED'); const record = this.decode(bytes); if (name !== record.conversationId + '.json') throw dialogueFailure('STORAGE_READ_FAILED'); this.previous.set(path,bytes); records.push(record) }
    return records
  }
  write(record: HelpRecord): Promise<void> {
    const candidate = structuredClone(record)
    const result = this.queue.then(async () => {
      if (!isHelpRecord(candidate)) throw dialogueFailure('STORAGE_WRITE_FAILED')
      await mkdir(this.root,{recursive:true}); if ((await lstat(this.root)).isSymbolicLink()) throw dialogueFailure('STORAGE_WRITE_FAILED')
      const path = join(this.root,candidate.conversationId+'.json'), previous = await this.bytes(path)
      if (previous !== null) this.decode(previous)
      if (this.previous.has(path) ? this.previous.get(path) !== previous : previous !== null) throw dialogueFailure('OUTPUT_CONFLICT')
      if (previous === null && (await readdir(this.root)).filter(name=>name.endsWith('.json')).length >= 200) throw dialogueFailure('STORAGE_WRITE_FAILED')
      const bytes = JSON.stringify(candidate,null,2)+'\n'; if (Buffer.byteLength(bytes)>8388608) throw dialogueFailure('STORAGE_WRITE_FAILED')
      const temporary=path+'.'+randomUUID()+'.tmp'
      try { const file=await open(temporary,'wx',0o600); try { await file.writeFile(bytes,'utf8'); await file.sync() } finally { await file.close() }; await rename(temporary,path); this.previous.set(path,bytes) }
      catch { throw dialogueFailure('STORAGE_WRITE_FAILED') }
      finally { await unlink(temporary).catch(()=>{}) }
    }).catch(error=>{throw dialogueFailure(dialogueError(error,'STORAGE_WRITE_FAILED'))}); this.queue=result.catch(()=>{}); return result
  }
}
