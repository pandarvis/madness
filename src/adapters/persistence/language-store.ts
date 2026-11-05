import { mkdir, open, rename, unlink } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { TextDecoder } from 'node:util'
import { isRecord } from '../../contracts/index.ts'
import { isLanguage } from '../../contracts/language.ts'
import type { LanguageState, Language } from '../../contracts/language.ts'

export class LanguageStore {
  private readonly path: string
  private queue: Promise<unknown> = Promise.resolve()
  constructor(path: string) { this.path = path }
  private async readLanguage(): Promise<Language | null> {
    try {
      const handle = await open(this.path, 'r')
      try {
        if ((await handle.stat()).size > 1024) throw new Error('INVALID_LANGUAGE')
        const bytes=Buffer.alloc(1025),result=await handle.read(bytes,0,bytes.length,0)
        if(result.bytesRead>1024)throw new Error('INVALID_LANGUAGE')
        const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0,result.bytesRead)))
        if (!isRecord(value) || Object.keys(value).length !== 2 || value.schemaVersion !== 1 || !isLanguage(value.language)) throw new Error('INVALID_LANGUAGE')
        return value.language
      } finally { await handle.close() }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
  }
  async restore(): Promise<LanguageState> {
    await this.queue
    try { return { language: await this.readLanguage() ?? 'fr', warning: null } }
    catch { return { language: 'fr', warning: 'read-failed' } }
  }
  save(language: Language): Promise<LanguageState> {
    if (!isLanguage(language)) return Promise.reject(new Error('INVALID_LANGUAGE'))
    const result = this.queue.then(async (): Promise<LanguageState> => {
      const temporary = this.path + '.' + randomUUID() + '.tmp'
      try {
        await this.readLanguage() // Un fichier invalide ou futur ne doit jamais être remplacé.
        await mkdir(dirname(this.path), { recursive: true })
        const handle = await open(temporary, 'wx', 0o600)
        try { await handle.writeFile(JSON.stringify({ schemaVersion: 1, language }) + '\n', 'utf8'); await handle.sync() }
        finally { await handle.close() }
        await rename(temporary, this.path)
        return { language, warning: null }
      } catch { return { language, warning: 'save-failed' } }
      finally { await unlink(temporary).catch(() => undefined) }
    })
    this.queue = result.catch(() => undefined)
    return result
  }
}
