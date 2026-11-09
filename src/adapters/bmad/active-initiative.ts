import { lstat, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { dialogueFailure } from '../../contracts/dialogue.ts'

const within = (root: string, path: string): boolean => { const distance = relative(root, path); return !!distance && !isAbsolute(distance) && distance !== '..' && !distance.startsWith('..' + sep) }
const missing = (error: unknown): boolean => (error as NodeJS.ErrnoException).code === 'ENOENT'
async function readOptional(path: string): Promise<string | null> { try { return await readFile(path, 'utf8') } catch (error) { if (missing(error)) return null; throw error } }
async function assertRegularOrAbsent(path: string): Promise<void> { try { if (!(await lstat(path)).isFile()) throw dialogueFailure('PROFILE_CHANGED') } catch (error) { if (!missing(error)) throw error } }

/** Sets `active_initiative` under `[core]`, keeping every other line of the file. */
export function withActiveInitiative(source: string, name: string): string {
  const newline = source.includes('\r\n') ? '\r\n' : '\n', setting = 'active_initiative = "' + name + '"'
  const lines = source.length ? source.split(/\r?\n/) : []
  const header = lines.findIndex(line => /^\s*\[core\]\s*(#.*)?$/.test(line))
  if (header < 0) return (source.length ? source.replace(/(\r?\n)*$/, '') + newline + newline : '') + '[core]' + newline + setting + newline
  let end = lines.findIndex((line, index) => index > header && /^\s*\[[A-Za-z_]/.test(line))
  if (end < 0) end = lines.length
  const existing = lines.findIndex((line, index) => index > header && index < end && /^\s*active_initiative\s*=/.test(line))
  if (existing >= 0) lines[existing] = setting; else lines.splice(header + 1, 0, setting)
  return lines.join(newline)
}

export function initiativeFolderName(title: string): string {
  const slug = title.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '')
  if (!slug) throw dialogueFailure('PROFILE_CHANGED')
  return 'initiative-' + slug
}

/** BMad's own contract (references/initiative.md): the active initiative lives in the user's config layer. */
export async function writeActiveInitiative(rootPath: string, name: string): Promise<void> {
  const root = await realpath(rootPath), folder = join(root, '_bmad/custom'), path = join(folder, 'config.user.toml')
  await mkdir(folder, { recursive: true })
  if (!within(root, await realpath(folder))) throw dialogueFailure('PROFILE_CHANGED')
  await assertRegularOrAbsent(path)
  const temporary = path + '.' + randomUUID() + '.tmp'
  try { await writeFile(temporary, withActiveInitiative(await readOptional(path) ?? '', name), { flag: 'wx' }); await rename(temporary, path) }
  finally { await rm(temporary, { force: true }) }
}

async function outputFolder(root: string): Promise<string> {
  let value = '{project-root}/_bmad-output'
  for (const layer of ['_bmad/config.toml', '_bmad/custom/config.toml', '_bmad/custom/config.user.toml']) {
    const match = /^\s*output_folder\s*=\s*"([^"]+)"/m.exec(await readOptional(join(root, layer)) ?? '')
    if (match) value = match[1]
  }
  const path = resolve(root, value.replace('{project-root}', root))
  if (!within(root, path)) throw dialogueFailure('PROFILE_CHANGED')
  return path
}

/** Creates the folder and its frontmatter-only document; an existing initiative of that name is reused. */
export async function createInitiative(rootPath: string, title: string): Promise<string> {
  const root = await realpath(rootPath), name = initiativeFolderName(title), output = await outputFolder(root), folder = join(output, name)
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, name + '.md'), '---\ntype: initiative\ntitle: ' + JSON.stringify(title.trim()) + '\nparent: none\n---\n', { flag: 'wx' }).catch(error => { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error })
  return name
}
