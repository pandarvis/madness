import { spawn } from 'node:child_process'
import { copyFile, mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { dirname, join, resolve, sep } from 'node:path'
import type { AutopilotRun } from '../../contracts/autopilot.ts'
import type { PlannedStory, ProjectPlan, TestResult } from '../../core/autopilot.ts'
import { createInitiative, writeActiveInitiative } from '../bmad/active-initiative.ts'

const optional = async (path: string): Promise<string | null> => { try { return await readFile(path, 'utf8') } catch { return null } }
const folders = async (path: string): Promise<string[]> => { try { return (await readdir(path, { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name).sort() } catch { return [] } }
const files = async (path: string): Promise<string[]> => { try { return (await readdir(path, { withFileTypes: true })).filter(entry => entry.isFile()).map(entry => entry.name) } catch { return [] } }

/** The subset of TOML that BMad writes for tickets: `[[table]]` blocks of scalar and inline-array values. */
export function parseTomlTables(source: string, table: string): Record<string, string>[] {
  const result: Record<string, string>[] = []; let current: Record<string, string> | null = null
  for (const line of source.split(/\r?\n/)) {
    const header = /^\s*\[\[([a-z_]+)\]\]\s*$/.exec(line)
    if (header) { current = header[1] === table ? {} : null; if (current) result.push(current); continue }
    const pair = /^\s*([A-Za-z_]+)\s*=\s*(.+?)\s*$/.exec(line)
    if (pair && current) current[pair[1]] = pair[2]
  }
  return result
}
const unquote = (value: string | undefined): string => { if (!value) return ''; try { return JSON.parse(value) } catch { return value.replace(/^['"]|['"]$/g, '') } }
const numbers = (value: string | undefined): number[] => (value?.match(/\d+/g) ?? []).map(Number)
export function orderStories(entries: { id: number; after: number[] }[]): number[] {
  const remaining = new Map(entries.map(entry => [entry.id, entry.after])), done = new Set<number>(), order: number[] = []
  while (remaining.size) {
    const ready = [...remaining.entries()].filter(([, after]) => after.every(id => done.has(id) || !remaining.has(id))).map(([id]) => id).sort((a, b) => a - b)
    if (!ready.length) { order.push(...[...remaining.keys()].sort((a, b) => a - b)); break }
    for (const id of ready) { done.add(id); remaining.delete(id); order.push(id) }
  }
  return order
}

async function outputRoot(root: string): Promise<string> {
  let value = '{project-root}/_bmad-output'
  for (const layer of ['_bmad/config.toml', '_bmad/custom/config.toml', '_bmad/custom/config.user.toml']) { const match = /^\s*output_folder\s*=\s*"([^"]+)"/m.exec(await optional(join(root, layer)) ?? ''); if (match) value = match[1] }
  return resolve(root, value.replace('{project-root}', root))
}
async function activeInitiative(root: string): Promise<string | null> {
  return /^\s*active_initiative\s*=\s*"([^"]+)"/m.exec(await optional(join(root, '_bmad/custom/config.user.toml')) ?? '')?.[1] ?? null
}
export async function readProjectPlan(root: string): Promise<ProjectPlan> {
  const output = await outputRoot(root), all = await folders(output), initiative = await activeInitiative(root) ?? all.find(name => name.startsWith('initiative-')) ?? null
  const document = initiative ? await optional(join(output, initiative, initiative + '.md')) ?? '' : ''
  const body = document.replace(/^---[\s\S]*?---/, '').trim()
  // Inside the active initiative when there is one: a folder from another initiative says nothing about this one.
  const scope = initiative ? join(output, initiative) : output
  let architecture = false
  for (const base of [scope, output]) for (const name of (await folders(base)).filter(item => item.startsWith('architecture-'))) if ((await files(join(base, name))).some(file => file.endsWith('.md'))) architecture = true
  const stories: PlannedStory[] = []
  let epics = false
  if (initiative) {
    const tickets = join(output, initiative, 'tickets')
    const declared = parseTomlTables(await optional(join(tickets, 'tickets.toml')) ?? '', 'epic')
    epics = declared.length > 0
    for (const epic of declared) {
      const slug = unquote(epic.slug), folder = join(tickets, slug, 'tickets')
      const entries = parseTomlTables(await optional(join(folder, 'tickets.toml')) ?? '', 'entry').map(entry => ({ id: Number(entry.id), title: unquote(entry.title), after: numbers(entry.after) }))
      const built = new Set<number>()
      for (const name of (await files(folder)).filter(file => file.endsWith('-plan.md'))) {
        const head = await optional(join(folder, name)) ?? ''
        const ticket = /^ticket:\s*['"]?(\d+)/m.exec(head)?.[1]
        if (ticket && /^status:\s*['"]?(built|done)/m.test(head)) built.add(Number(ticket))
      }
      for (const id of orderStories(entries)) { const entry = entries.find(item => item.id === id)!; stories.push({ epic: slug, epicTitle: unquote(epic.title), storyId: id, title: entry.title, built: built.has(id) }) }
    }
  }
  return { requirements: body.length > 0, architecture, epics, stories, initiative }
}
export async function ensureActiveInitiative(root: string, projectName: string): Promise<void> {
  if (await activeInitiative(root)) return
  const output = await outputRoot(root), existing = (await folders(output)).filter(name => name.startsWith('initiative-'))
  await writeActiveInitiative(root, existing.length === 1 ? existing[0] : await createInitiative(root, projectName))
}

/** Runs the project's own `npm test` when it has one; a project without tests is not blocked. */
export async function runProjectTests(root: string, signal: AbortSignal, timeoutMs = 300000): Promise<TestResult | null> {
  const command = await testCommand(root); if (!command) return null
  return new Promise(resolve => {
    const child = spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', command], { cwd: root, env: process.env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let output = ''; const collect = (chunk: Buffer): void => { output = (output + chunk.toString()).slice(-20000) }
    child.stdout.on('data', collect); child.stderr.on('data', collect)
    const kill = (): void => { if (child.pid) spawn('taskkill', ['/T', '/F', '/PID', String(child.pid)], { windowsHide: true, stdio: 'ignore' }) }
    const timer = setTimeout(kill, timeoutMs); signal.addEventListener('abort', kill, { once: true }); if (signal.aborted) kill()
    child.once('error', () => { clearTimeout(timer); resolve({ ok: false, output }) })
    child.once('close', code => { clearTimeout(timer); signal.removeEventListener('abort', kill); resolve({ ok: code === 0, output }) })
  })
}

/** The project's own npm test; without one, Node's built-in runner when the project has test files. */
export async function testCommand(root: string): Promise<string | null> {
  const manifest = await optional(join(root, 'package.json'))
  if (manifest) {
    let scripts: unknown; try { scripts = (JSON.parse(manifest) as { scripts?: unknown }).scripts } catch { scripts = null }
    if (scripts && typeof scripts === 'object' && 'test' in scripts && !/no test specified/.test(String((scripts as Record<string, unknown>).test))) return 'npm test'
  }
  const pattern = /\.test\.(c|m)?js$/
  const found = (await files(root)).some(file => pattern.test(file)) || (await files(join(root, 'test'))).some(file => pattern.test(file)) || (await files(join(root, 'tests'))).some(file => pattern.test(file))
  return found ? 'node --test' : null
}

export class AutopilotStore {
  private path: string
  constructor(path: string) { this.path = path }
  async read(): Promise<AutopilotRun[]> { try { const value: unknown = JSON.parse(await readFile(this.path, 'utf8')); return Array.isArray(value) ? value as AutopilotRun[] : [] } catch { return [] } }
  async write(runs: AutopilotRun[]): Promise<void> { await mkdir(dirname(this.path), { recursive: true }); const temporary = this.path + '.tmp'; await writeFile(temporary, JSON.stringify(runs)); await rename(temporary, this.path) }
}

const git = (root: string, args: string[]): Promise<{ code: number | null; out: string }> => new Promise(resolve => {
  const child = spawn('git', args, { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let out = ''; child.stdout.on('data', chunk => { out += chunk }); child.stderr.resume()
  child.once('error', () => resolve({ code: 1, out: '' })); child.once('close', code => resolve({ code, out }))
})
/** Commits whatever the step left uncommitted; nothing happens outside a git repository or on a clean tree. */
export async function commitStep(root: string, message: string): Promise<void> {
  const status = await git(root, ['status', '--porcelain'])
  if (status.code !== 0 || !status.out.trim()) return
  await git(root, ['add', '-A'])
  await git(root, ['commit', '-q', '-m', message])
}

export type JourneyStep = { id: 'brief' | 'requirements' | 'ux' | 'architecture' | 'epics' | 'stories'; done: boolean; document: string | null; detail: string | null }
/** The BMad steps a project has gone through, with the document each one produced (paths relative to the project). */
export async function readJourney(root: string): Promise<JourneyStep[]> {
  const output = await outputRoot(root), plan = await readProjectPlan(root), all = await folders(output)
  const scope = plan.initiative ? join(output, plan.initiative) : output, scoped = plan.initiative ? await folders(scope) : []
  const relative = (path: string | null): string | null => path ? path.slice(root.length + 1).split(sep).join('/') : null
  const firstDocument = async (base: string, prefix: string, prefer: string[] = []): Promise<string | null> => {
    for (const [folder, names] of [[scope, scoped], [output, all]] as const) for (const name of names.filter(item => item.startsWith(prefix))) {
      const documents = (await files(join(folder, name))).filter(file => file.endsWith('.md')); if (!documents.length) continue
      return join(folder, name, prefer.find(file => documents.includes(file)) ?? documents.find(file => file.startsWith(name)) ?? documents[0])
    }
    return null
  }
  // A spec the user brought stands in for the brief: the project starts from it.
  const brief = await firstDocument(output, 'brief-') ?? await specDocument(root, scope), ux = await firstDocument(scope, 'ux-', ['DESIGN.md', 'EXPERIENCE.md']), architecture = await firstDocument(scope, 'architecture-')
  const built = plan.stories.filter(story => story.built).length
  return [
    { id: 'brief', done: !!brief, document: relative(brief), detail: null },
    { id: 'requirements', done: plan.requirements, document: plan.initiative && plan.requirements ? relative(join(output, plan.initiative, plan.initiative + '.md')) : null, detail: null },
    { id: 'ux', done: !!ux, document: relative(ux), detail: null },
    { id: 'architecture', done: plan.architecture, document: relative(architecture), detail: null },
    { id: 'epics', done: plan.epics, document: plan.epics && plan.initiative ? relative(join(output, plan.initiative, 'tickets', 'tickets.toml')) : null, detail: null },
    { id: 'stories', done: plan.stories.length > 0 && built === plan.stories.length, document: null, detail: plan.stories.length ? built + ' / ' + plan.stories.length : null },
  ]
}

/** The BMad skills installed in the project, for the conductor's choices. */
export async function installedSkills(root: string): Promise<string[]> {
  try { return (await readdir(join(root, '.agents', 'skills'), { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name).sort() } catch { return [] }
}

/** A spec the user already has becomes the project's source: kept in the active initiative, where the agents look. */
export async function importSpec(root: string, projectName: string, spec: { name: string; text?: string; source?: string }): Promise<string> {
  await ensureActiveInitiative(root, projectName)
  const initiative = await activeInitiative(root), folder = join(await outputRoot(root), ...(initiative ? [initiative] : []), 'sources')
  await mkdir(folder, { recursive: true })
  // HTML specs are common (single-page specs generated as a SPA): agents read them as they are.
  const extension = /\.(md|markdown|txt|html|htm|pdf|docx)$/i.exec(spec.name)?.[1]?.toLowerCase() ?? 'md'
  const slug = spec.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'spec'
  const target = join(folder, 'spec-' + slug + '.' + (extension === 'markdown' ? 'md' : extension === 'htm' ? 'html' : extension))
  if (spec.source) await copyFile(spec.source, target)
  else await writeFile(target, spec.text ?? '', 'utf8')
  return target.slice(root.length + 1).split(sep).join('/')
}
async function specDocument(root: string, scope: string): Promise<string | null> {
  const found = (await files(join(scope, 'sources'))).find(file => file.startsWith('spec-'))
  return found ? join(scope, 'sources', found) : null
}
