import { appendFile, mkdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { UsageEntry } from '../core/usage.ts'

/** Append-only usage ledger (one JSON line per entry): survives cleared runs and app restarts. */
export class UsageStore {
  private writes: Promise<unknown> = Promise.resolve()
  private readonly path: string
  constructor(path: string) { this.path = path }
  append(entries: readonly UsageEntry[]): Promise<unknown> {
    if (!entries.length) return this.writes
    const lines = entries.map(entry => JSON.stringify(entry) + '\n').join('')
    this.writes = this.writes.then(async () => { await mkdir(dirname(this.path), { recursive: true }); await appendFile(this.path, lines, 'utf8') }).catch(() => undefined)
    return this.writes
  }
  async read(): Promise<UsageEntry[]> {
    await this.writes
    let text = ''
    try { text = await readFile(this.path, 'utf8') } catch { return [] }
    const entries: UsageEntry[] = []
    for (const line of text.split('\n')) { if (!line.trim()) continue; try { entries.push(JSON.parse(line) as UsageEntry) } catch { /* A torn last line is skipped. */ } }
    return entries
  }
}
