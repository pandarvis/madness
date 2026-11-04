import { open, rename, mkdir, unlink } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { TextDecoder } from 'node:util'
import { emptySnapshot, isRecord, isSnapshot } from '../../contracts/index.ts'
import type { Snapshot } from '../../contracts/index.ts'
import type { PersistencePort } from '../../core/ports.ts'
const MAX_BYTES = 16 * 1024 * 1024
export class StoreError extends Error {
  readonly code: string
  constructor(code: string) { super(code); this.code = code }
}
export class JsonStore implements PersistencePort {
  private path: string
  private queue: Promise<unknown> = Promise.resolve()
  private lastBytes: string | null | undefined
  constructor(path: string) { this.path = path }
  private async bytes(): Promise<string | null> {
    try {
      const handle = await open(this.path, 'r')
      try {
        if ((await handle.stat()).size > MAX_BYTES) throw new StoreError('STORAGE_CORRUPT')
        const bytes = await handle.readFile()
        try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes) }
        catch { throw new StoreError('STORAGE_CORRUPT') }
      } finally { await handle.close() }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw error
    }
  }
  private decode(bytes: string | null): Snapshot {
    if (bytes === null) return emptySnapshot()
    let parsed: unknown
    try { parsed = JSON.parse(bytes) } catch { throw new StoreError('STORAGE_CORRUPT') }
    if (isRecord(parsed) && typeof parsed.schemaVersion === 'number' && parsed.schemaVersion !== 1) throw new StoreError('STORAGE_VERSION_UNSUPPORTED')
    if (!isSnapshot(parsed)) throw new StoreError('STORAGE_CORRUPT')
    return parsed
  }
  async read(): Promise<Snapshot> {
    await this.queue
    const bytes = await this.bytes()
    const snapshot = this.decode(bytes)
    this.lastBytes = bytes
    return snapshot
  }
  write(snapshot: Snapshot): Promise<void> {
    const candidate = structuredClone(snapshot)
    const result = this.queue.then(async () => {
      if (!isSnapshot(candidate)) throw new StoreError('STORAGE_CORRUPT')
      const current = await this.bytes()
      this.decode(current) // Ne jamais remplacer un fichier inconnu ou endommagé.
      if (this.lastBytes !== undefined && current !== this.lastBytes) throw new StoreError('STORAGE_CONFLICT')
      const bytes = JSON.stringify(candidate, null, 2) + '\n'
      if (Buffer.byteLength(bytes) > MAX_BYTES) throw new StoreError('STORAGE_WRITE_FAILED')
      await mkdir(dirname(this.path), { recursive: true })
      const temporary = this.path + '.' + randomUUID() + '.tmp'
      try {
        const handle = await open(temporary, 'wx', 0o600)
        try { await handle.writeFile(bytes, 'utf8'); await handle.sync() } finally { await handle.close() }
        await rename(temporary, this.path)
        this.lastBytes = bytes
      } finally { await unlink(temporary).catch(() => undefined) }
    })
    this.queue = result.catch(() => undefined)
    return result
  }
}
