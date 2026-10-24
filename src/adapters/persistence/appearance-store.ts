import { mkdir, open, rename, unlink } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { TextDecoder } from 'node:util'
import { isRecord } from '../../contracts/index.ts'
import { isTheme } from '../../contracts/appearance.ts'
import type { AppearanceState, Theme } from '../../contracts/appearance.ts'

export class AppearanceStore {
  private readonly path: string
  private queue: Promise<unknown> = Promise.resolve()
  constructor(path: string) { this.path = path }
  private async readTheme(): Promise<Theme | null> {
    try {
      const handle = await open(this.path, 'r')
      try {
        if ((await handle.stat()).size > 1024) throw new Error('INVALID_APPEARANCE')
        const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await handle.readFile()))
        if (!isRecord(value) || Object.keys(value).length !== 2 || value.schemaVersion !== 1 || !isTheme(value.theme)) throw new Error('INVALID_APPEARANCE')
        return value.theme
      } finally { await handle.close() }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
  }
  async restore(): Promise<AppearanceState> {
    await this.queue
    try { return { theme: await this.readTheme() ?? 'dark', warning: null } }
    catch { return { theme: 'dark', warning: 'read-failed' } }
  }
  save(theme: Theme): Promise<AppearanceState> {
    if (!isTheme(theme)) return Promise.reject(new Error('INVALID_THEME'))
    const result = this.queue.then(async (): Promise<AppearanceState> => {
      const temporary = this.path + '.' + randomUUID() + '.tmp'
      try {
        await this.readTheme() // Un fichier invalide ou futur ne doit jamais être remplacé.
        await mkdir(dirname(this.path), { recursive: true })
        const handle = await open(temporary, 'wx', 0o600)
        try { await handle.writeFile(JSON.stringify({ schemaVersion: 1, theme }) + '\n', 'utf8'); await handle.sync() }
        finally { await handle.close() }
        await rename(temporary, this.path)
        return { theme, warning: null }
      } catch { return { theme, warning: 'save-failed' } }
      finally { await unlink(temporary).catch(() => undefined) }
    })
    this.queue = result.catch(() => undefined)
    return result
  }
}
