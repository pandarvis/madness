import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export type ModelChoice = { claude: string; codex: string | null }
export type ModelOption = { id: string; label: string }
/** Claude Code accepts these ids for an agent run; the first one is the default. */
export const CLAUDE_MODELS: readonly ModelOption[] = [
  { id: 'claude-opus-5-5', label: 'Opus 5.5' }, { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5' },
  { id: 'claude-fable-5-1', label: 'Fable 5.1' }, { id: 'claude-haiku-5-5', label: 'Haiku 5.5' },
]
const valid = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9._:/-]{1,100}$/.test(value)

/** The models chosen for BMad agents, kept in Madness's own data. A null Codex choice follows Codex's recommendation. */
export class ModelStore {
  private path: string
  private value: ModelChoice = { claude: CLAUDE_MODELS[0].id, codex: null }
  private loaded: Promise<void>
  constructor(path: string) { this.path = path; this.loaded = this.load() }
  private async load(): Promise<void> {
    try {
      const stored = JSON.parse(await readFile(this.path, 'utf8')) as Partial<ModelChoice>
      if (valid(stored.claude) && CLAUDE_MODELS.some(model => model.id === stored.claude)) this.value.claude = stored.claude
      if (stored.codex === null || valid(stored.codex)) this.value.codex = stored.codex ?? null
    } catch { /* first launch: defaults */ }
  }
  async read(): Promise<ModelChoice> { await this.loaded; return { ...this.value } }
  async set(provider: 'claude-code' | 'codex', model: string | null): Promise<ModelChoice> {
    await this.loaded
    if (provider === 'claude-code') { if (!valid(model) || !CLAUDE_MODELS.some(option => option.id === model)) throw Error('MODEL_REFUSED'); this.value.claude = model }
    else { if (model !== null && !valid(model)) throw Error('MODEL_REFUSED'); this.value.codex = model }
    await mkdir(dirname(this.path), { recursive: true })
    await writeFile(this.path + '.tmp', JSON.stringify(this.value)); await rename(this.path + '.tmp', this.path)
    return { ...this.value }
  }
}
