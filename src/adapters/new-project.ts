import { spawn } from 'node:child_process'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/** A folder name from what the user typed: readable, safe on Windows, never empty. */
export function projectFolderName(name: string): string {
  const cleaned = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ').trim().replace(/\s+/g, '-').replace(/\.+$/, '').slice(0, 60)
  return /^(con|prn|aux|nul|com\d|lpt\d)$/i.test(cleaned) || !cleaned ? 'projet' : cleaned
}

/** Where new projects go: remembered once chosen, else Documents/Madness. */
export class NewProjectPlace {
  private readonly file: string
  private readonly fallback: string
  constructor(file: string, fallback: string) { this.file = file; this.fallback = fallback }
  async read(): Promise<string> { try { const value = JSON.parse(await readFile(this.file, 'utf8')) as { parent?: unknown }; return typeof value.parent === 'string' ? value.parent : this.fallback } catch { return this.fallback } }
  async write(parent: string): Promise<void> { await mkdir(dirname(this.file), { recursive: true }); await writeFile(this.file, JSON.stringify({ parent })) }
}

/** Creates the folder (refusing one that already holds files) and a git repository: Madness commits each step there. */
export async function createProjectFolder(parent: string, name: string): Promise<string> {
  const root = join(parent, projectFolderName(name))
  await mkdir(root, { recursive: true })
  if ((await readdir(root)).length) throw Error('PROJECT_EXISTS')
  await new Promise<void>((resolve, reject) => {
    const child = spawn('git', ['init', '-q'], { cwd: root, windowsHide: true, stdio: 'ignore' })
    child.once('error', () => resolve()); child.once('close', code => code === 0 ? resolve() : reject(Error('GIT_INIT_FAILED')))
  })
  return root
}
