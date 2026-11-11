import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative, sep } from 'node:path'
import { parse } from 'smol-toml'
import { parseKitManifest } from '../../core/kits/manifest.ts'
import type { Kit } from '../../core/kits/manifest.ts'
import { translateKits } from '../../core/kits/translate.ts'
import { applyManagedBlock } from './overrides.ts'

export type ActiveKit = { id: string; name: string; version: string; source: string; hash: string }
const lockPath = (root: string): string => join(root, '_bmad', 'kits.lock.toml')
export const kitCopy = (root: string, id: string): string => join(root, '_bmad', 'kits', id)
const COPIED = ['docs', 'glossary', 'rules', 'assets']

async function walk(dir: string): Promise<string[]> {
  const out: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) { if (entry.name !== '.git') out.push(...await walk(path)) } else if (entry.isFile()) out.push(path)
  }
  return out
}
// Minimal glob: `*` inside one path segment, `**` across segments; a folder path takes everything under it.
const matcher = (pattern: string): RegExp => new RegExp('^' + pattern.replace(/\\/g, '/').replace(/\/$/, '').split('/').map(part => part === '**' ? '.*' : part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')).join('/') + '(/.*)?$')

export async function readKit(folder: string): Promise<{ kit: Kit; notices: string[] }> {
  const result = parseKitManifest(await readFile(join(folder, 'madness-kit.toml'), 'utf8'))
  if (!result.ok) throw Error(result.errors.join('\n'))
  return { kit: result.kit, notices: result.notices }
}

export async function activeKits(root: string): Promise<ActiveKit[]> {
  try { const data = parse(await readFile(lockPath(root), 'utf8')) as { kit?: ActiveKit[] }; return Array.isArray(data.kit) ? data.kit.map(k => ({ id: k.id, name: k.name, version: k.version, source: k.source, hash: k.hash })) : [] } catch { return [] }
}
async function writeLock(root: string, kits: readonly ActiveKit[]): Promise<void> {
  if (!kits.length) { await rm(lockPath(root), { force: true }); return }
  const body = kits.map(k => '[[kit]]\nid = ' + JSON.stringify(k.id) + '\nname = ' + JSON.stringify(k.name) + '\nversion = ' + JSON.stringify(k.version) + '\nsource = ' + JSON.stringify(k.source) + '\nhash = ' + JSON.stringify(k.hash) + '\n').join('\n')
  await mkdir(dirname(lockPath(root)), { recursive: true })
  await writeFile(lockPath(root), '# Kits actifs sur ce projet, écrit par Madness.\n\n' + body)
}
async function skillTables(root: string): Promise<Record<string, 'agent' | 'workflow'>> {
  const out: Record<string, 'agent' | 'workflow'> = {}, base = join(root, '.agents', 'skills')
  for (const name of await readdir(base).catch(() => [] as string[])) {
    const table = /^\[(agent|workflow)\]/m.exec(await readFile(join(base, name, 'customize.toml'), 'utf8').catch(() => ''))?.[1]
    if (table === 'agent' || table === 'workflow') out[name] = table
  }
  return out
}
/** Every override as it must be for these kits. Throws on a conflict before anything is written. */
async function plannedOverrides(root: string, kits: readonly Kit[]): Promise<{ file: string; before: string; after: string }[]> {
  const tables = await skillTables(root), wanted = translateKits(kits, tables), custom = join(root, '_bmad', 'custom'), out = []
  for (const skill of Object.keys(tables)) {
    const file = join(custom, skill + '.toml'), before = await readFile(file, 'utf8').catch(() => '')
    let after: string
    try { after = applyManagedBlock(before, wanted[skill] ?? { table: tables[skill]!, persistent_facts: [], principles: [], review_guidance: [] }) }
    catch (error) { throw Error((error instanceof Error ? error.message : String(error)) + ' dans _bmad/custom/' + skill + '.toml : ce réglage écrit à la main doit passer dans un kit ou dans ' + skill + '.user.toml.') }
    if (after !== before) out.push({ file, before, after })
  }
  return out
}
async function writeOverrides(changes: readonly { file: string; after: string }[]): Promise<void> {
  for (const change of changes) {
    if (change.after) { await mkdir(dirname(change.file), { recursive: true }); await writeFile(change.file, change.after) } else await rm(change.file, { force: true })
  }
}
const kitsOf = async (root: string, entries: readonly ActiveKit[]): Promise<Kit[]> => Promise.all(entries.map(async k => (await readKit(kitCopy(root, k.id))).kit))

/** Copies the kit's text pieces into the project, locks its version and rewrites the BMad overrides. All or nothing. */
export async function activateKit(root: string, folder: string): Promise<{ kit: Kit; notices: string[]; skills: string[] }> {
  const { kit, notices } = await readKit(folder)
  const others = (await activeKits(root)).filter(k => k.id !== kit.id)
  const kits = [...await kitsOf(root, others), kit]
  const changes = await plannedOverrides(root, kits)
  const patterns = [...kit.pieces.filter(p => COPIED.includes(p.kind) && p.path).map(p => matcher(p.path!)), /^madness-kit\.toml$/]
  const target = kitCopy(root, kit.id), hash = createHash('sha256')
  await rm(target, { recursive: true, force: true })
  for (const file of (await walk(folder)).sort()) {
    const rel = relative(folder, file).split(sep).join('/')
    if (!patterns.some(p => p.test(rel))) continue
    await mkdir(dirname(join(target, rel)), { recursive: true }); await cp(file, join(target, rel))
    hash.update(rel + '\0'); hash.update(await readFile(file))
  }
  await writeLock(root, [...others, { id: kit.id, name: kit.name, version: kit.version, source: folder, hash: hash.digest('hex') }])
  await writeOverrides(changes)
  const tables = await skillTables(root)
  return { kit, notices, skills: Object.keys(translateKits(kits, tables)).sort() }
}

export async function deactivateKit(root: string, id: string): Promise<void> {
  const remaining = (await activeKits(root)).filter(k => k.id !== id)
  const changes = await plannedOverrides(root, await kitsOf(root, remaining))
  await writeOverrides(changes)
  await writeLock(root, remaining)
  await rm(kitCopy(root, id), { recursive: true, force: true })
  if (!(await readdir(join(root, '_bmad', 'kits')).catch(() => [] as string[])).length) await rm(join(root, '_bmad', 'kits'), { recursive: true, force: true })
}
