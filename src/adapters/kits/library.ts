import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { parseKitManifest } from '../../core/kits/manifest.ts'
import type { Kit } from '../../core/kits/manifest.ts'

export type FoundKit = { folder: string; ok: true; kit: Kit; notices: string[] } | { folder: string; ok: false; errors: string[] }

/** Kits in a source: a manifest at its root, or one per folder under kits/. */
export async function scanSource(source: string): Promise<FoundKit[]> {
  const nested = (await readdir(join(source, 'kits'), { withFileTypes: true }).catch(() => [])).filter(entry => entry.isDirectory()).map(entry => join(source, 'kits', entry.name))
  const found: FoundKit[] = []
  for (const folder of [source, ...nested.sort()]) {
    const text = await readFile(join(folder, 'madness-kit.toml'), 'utf8').catch(() => null); if (text === null) continue
    const result = parseKitManifest(text)
    found.push(result.ok ? { folder, ok: true, kit: result.kit, notices: result.notices } : { folder, ok: false, errors: result.errors })
  }
  return found
}

/** The kit sources declared in Madness's settings (local folders in this step). */
export class KitSources {
  private readonly file: string
  constructor(file: string) { this.file = file }
  async list(): Promise<string[]> { try { const value = JSON.parse(await readFile(this.file, 'utf8')) as unknown; return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [] } catch { return [] } }
  async add(source: string): Promise<void> { const all = await this.list(); if (!all.includes(source)) await this.save([...all, source]) }
  async remove(source: string): Promise<void> { await this.save((await this.list()).filter(item => item !== source)) }
  private async save(all: string[]): Promise<void> { await mkdir(dirname(this.file), { recursive: true }); await writeFile(this.file, JSON.stringify(all)) }
}
