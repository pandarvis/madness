import { spawn } from 'node:child_process'
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
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
  const manifest = await optional(join(root, 'package.json')); if (!manifest) return null
  let scripts: unknown; try { scripts = (JSON.parse(manifest) as { scripts?: unknown }).scripts } catch { return null }
  if (!scripts || typeof scripts !== 'object' || !('test' in scripts) || /no test specified/.test(String((scripts as Record<string, unknown>).test))) return null
  return new Promise(resolve => {
    const child = spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'npm test'], { cwd: root, env: process.env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let output = ''; const collect = (chunk: Buffer): void => { output = (output + chunk.toString()).slice(-20000) }
    child.stdout.on('data', collect); child.stderr.on('data', collect)
    const kill = (): void => { if (child.pid) spawn('taskkill', ['/T', '/F', '/PID', String(child.pid)], { windowsHide: true, stdio: 'ignore' }) }
    const timer = setTimeout(kill, timeoutMs); signal.addEventListener('abort', kill, { once: true }); if (signal.aborted) kill()
    child.once('error', () => { clearTimeout(timer); resolve({ ok: false, output }) })
    child.once('close', code => { clearTimeout(timer); signal.removeEventListener('abort', kill); resolve({ ok: code === 0, output }) })
  })
}

export class AutopilotStore {
  private path: string
  constructor(path: string) { this.path = path }
  async read(): Promise<AutopilotRun[]> { try { const value: unknown = JSON.parse(await readFile(this.path, 'utf8')); return Array.isArray(value) ? value as AutopilotRun[] : [] } catch { return [] } }
  async write(runs: AutopilotRun[]): Promise<void> { await mkdir(dirname(this.path), { recursive: true }); const temporary = this.path + '.tmp'; await writeFile(temporary, JSON.stringify(runs)); await rename(temporary, this.path) }
}
