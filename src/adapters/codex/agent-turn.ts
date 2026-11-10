import { spawn } from 'node:child_process'
import { access, mkdir, readFile, readdir, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import type { AgentTurnInput, AgentTurnResult } from '../../core/autopilot.ts'
import { buildAgenticPrompt } from '../claude/dialogue.ts'
import { bundledRuntimePaths } from '../bmad/runtime.ts'
import { findNativeExecutable, probeEnvironment } from './probe.ts'

type Options = { appData: string; root: string; realHome: string; environment: NodeJS.ProcessEnv; accessToken(signal: AbortSignal): Promise<string>; timeoutMs?: number }

// Codex keeps its own Windows sandbox: the elevated mode, set up once per PC with administrator rights, can run BMad.
function settings(realHome: string, home: string): string[] {
  return ['cli_auth_credentials_store="file"', 'model_provider="openai_chatgpt_plan"', 'model_providers.openai_chatgpt_plan.name="ChatGPT plan"', 'model_providers.openai_chatgpt_plan.base_url="https://api.openai.com/v1"', 'model_providers.openai_chatgpt_plan.env_key="ACCESS_TOKEN"', 'model_providers.openai_chatgpt_plan.wire_api="responses"', 'model_providers.openai_chatgpt_plan.requires_openai_auth=false', 'model_providers.openai_chatgpt_plan.supports_websockets=false',
    'approval_policy="never"', 'sandbox_mode="workspace-write"', 'windows.sandbox="elevated"', 'sandbox_workspace_write.network_access=true', 'sandbox_workspace_write.writable_roots=' + JSON.stringify([home]), 'web_search="disabled"', 'features.apps=false', 'features.plugins=false', 'features.multi_agent=false', 'features.code_mode_host=false', 'features.image_generation=false', 'features.browser_use=false', 'features.browser_use_external=false', 'features.in_app_browser=false', 'features.computer_use=false', 'mcp_servers={}',
    // The isolated home hides the user's git identity; the access token stays out of every tool's environment.
    'shell_environment_policy.inherit="core"', 'shell_environment_policy.set.GIT_CONFIG_GLOBAL=' + JSON.stringify(join(realHome, '.gitconfig'))]
}
function withBundledTools(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const bundled = bundledRuntimePaths(), key = Object.keys(env).find(name => name.toUpperCase() === 'PATH') ?? 'PATH'
  // App Execution Aliases (Microsoft Store pwsh, python…) are reparse points the sandbox user cannot open: Windows PowerShell and the bundled tools are used instead.
  const own = String(env[key] ?? '').split(delimiter).filter(entry => entry && !/[\\/]Microsoft[\\/]WindowsApps[\\/]?$/i.test(entry))
  return { ...env, [key]: [...own, dirname(bundled.uv), bundled.python].join(delimiter) }
}
/** BMad renders each skill into _bmad/render before using it, which the sandbox refuses to write.
 * Madness renders them first, outside the sandbox; the agent's own render then finds them ready and writes nothing. */
export async function prerenderSkills(root: string, signal: AbortSignal): Promise<void> {
  const skills = join(root, '.agents/skills'), script = join(root, '_bmad/scripts/render_skill.py'), bundled = bundledRuntimePaths()
  let names: string[]; try { names = (await readdir(skills, { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name) } catch { return }
  for (const name of names) {
    if (signal.aborted) return
    const manifest = await readFile(join(skills, name, 'SKILL.md'), 'utf8').catch(() => '')
    if (!manifest.includes('render_skill.py')) continue
    await new Promise<void>(resolve => {
      const child = spawn(bundled.uv, ['run', '--python', join(bundled.python, 'python.exe'), script, '--project-root', root, '--skill', join(skills, name)], { cwd: root, env: { ...process.env, UV_CACHE_DIR: join(tmpdir(), 'madness-uv-cache') }, windowsHide: true, stdio: 'ignore' })
      child.once('error', () => resolve()); child.once('close', () => resolve())
    })
  }
  // BMad creates each generation owner-only (mode 0o700): the sandbox user could not read it. Inheriting the
  // project's permissions again gives it read access, and keeps everything the user's to edit or delete.
  await new Promise<void>(resolve => {
    const child = spawn('icacls', [join(root, '_bmad', 'render'), '/reset', '/T', '/C', '/Q'], { windowsHide: true, stdio: 'ignore' })
    child.once('error', () => resolve()); child.once('close', () => resolve())
  })
}
export type CodexEvent = { type?: string; thread_id?: string; item?: { type?: string; text?: string }; usage?: { input_tokens?: number; output_tokens?: number; cached_input_tokens?: number }; error?: { message?: string }; message?: string }
/** `codex exec --json` writes one event per line; the last agent message is the reply. */
export function readCodexEvents(stdout: string): { text: string; threadId: string | null; tokens: number; failure: string | null } {
  let text = '', threadId: string | null = null, tokens = 0, failure: string | null = null
  for (const line of stdout.split('\n')) {
    if (!line.trim().startsWith('{')) continue
    let event: CodexEvent; try { event = JSON.parse(line) as CodexEvent } catch { continue }
    if (event.type === 'thread.started' && event.thread_id) threadId = event.thread_id
    if (event.type === 'item.completed' && event.item?.type === 'agent_message' && event.item.text) text = event.item.text
    if (event.type === 'turn.completed') tokens += Math.max(0, (event.usage?.input_tokens ?? 0) - (event.usage?.cached_input_tokens ?? 0)) + (event.usage?.output_tokens ?? 0)
    if (event.type === 'turn.failed') failure = event.error?.message ?? 'Codex a échoué.'
    if (event.type === 'error') failure = event.message ?? failure
  }
  return { text, threadId, tokens, failure }
}
function uvSettings(folder: string): string[] {
  const python = join(bundledRuntimePaths().python, 'python.exe')
  return ['UV_PYTHON=' + python, 'UV_PYTHON_PREFERENCE=only-system', 'UV_CACHE_DIR=' + join(folder, 'cache'), 'UV_PYTHON_INSTALL_DIR=' + join(folder, 'python'), 'UV_TOOL_DIR=' + join(folder, 'tools')].map(pair => { const [key, ...value] = pair.split('='); return 'shell_environment_policy.set.' + key + '=' + JSON.stringify(value.join('=')) })
}
/** Tools that the user's own Codex setup may enable and that an unattended BMad run must not reach. */
const QUIET = ['web_search="disabled"', 'features.apps=false', 'features.plugins=false', 'features.image_generation=false', 'features.browser_use=false', 'features.browser_use_external=false', 'features.in_app_browser=false', 'features.computer_use=false', 'mcp_servers={}']
/** The user's own Codex sign-in, kept by Codex in ~/.codex: Codex renews it, and its ChatGPT access allows sub-agents. */
export async function hasOwnCodexLogin(realHome: string): Promise<boolean> { return access(join(realHome, '.codex', 'auth.json')).then(() => true, () => false) }
// Kévin's choice (2026-11-10): BMad runs on GPT-6.1 Sol when his Codex offers it, else on Codex's recommended model.
export const PREFERRED_CODEX_MODEL = 'gpt-6.1-sol'
let ownModel: { value: string; until: number } | null = null
/** The model Codex itself recommends for this account: a model pinned in an old config.toml can be refused for ChatGPT accounts. */
async function defaultModel(executable: string, env: NodeJS.ProcessEnv, cwd: string): Promise<string | null> {
  if (ownModel && ownModel.until > Date.now()) return ownModel.value
  const value = await new Promise<string | null>(resolve => {
    const child = spawn(executable, ['app-server', '--listen', 'stdio://'], { cwd, env, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'ignore'] })
    let buffer = '', done = false
    const finish = (model: string | null): void => { if (done) return; done = true; clearTimeout(timer); child.stdin.end(); if (child.pid) spawn('taskkill', ['/T', '/F', '/PID', String(child.pid)], { windowsHide: true, stdio: 'ignore' }); resolve(model) }
    const timer = setTimeout(() => finish(null), 20000)
    child.once('error', () => finish(null)); child.stdin.on('error', () => undefined)
    child.stdout.setEncoding('utf8').on('data', chunk => {
      buffer += chunk
      for (let end = buffer.indexOf('\n'); end >= 0; end = buffer.indexOf('\n')) {
        const line = buffer.slice(0, end); buffer = buffer.slice(end + 1)
        try { const message = JSON.parse(line) as { id?: number; result?: { data?: { model?: unknown; isDefault?: unknown; hidden?: unknown }[] } }; if (message.id === 2) { const listed = message.result?.data ?? [], model = (listed.find(item => item.model === PREFERRED_CODEX_MODEL) ?? listed.find(item => item.isDefault === true && item.hidden === false))?.model; finish(typeof model === 'string' && /^[a-zA-Z0-9._:/-]{1,100}$/.test(model) ? model : null) } } catch { /* not a protocol line */ }
      }
    })
    child.stdin.write(JSON.stringify({ id: 1, method: 'initialize', params: { clientInfo: { name: 'madness', title: 'Madness', version: '1' } } }) + '\n')
    child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n')
    child.stdin.write(JSON.stringify({ id: 2, method: 'model/list', params: {} }) + '\n')
  })
  if (value) ownModel = { value, until: Date.now() + 3600000 }
  return value
}
/** The Codex shipped with the user's Codex app: newest version, current models, and the sandbox its app already set up. */
async function appCodex(localAppData: string): Promise<string | null> {
  const base = join(localAppData, 'OpenAI', 'Codex', 'bin')
  let best: { path: string; time: number } | null = null
  for (const name of await readdir(base).catch(() => [] as string[])) { const path = join(base, name, 'codex.exe'); const info = await stat(path).catch(() => null); if (info?.isFile() && (!best || info.mtimeMs > best.time)) best = { path, time: info.mtimeMs } }
  return best?.path ?? null
}
async function codexOwnLoginTurn(options: Options, input: AgentTurnInput): Promise<AgentTurnResult> {
  const executable = await appCodex(join(options.realHome, 'AppData', 'Local')) ?? await findNativeExecutable(options.appData)
  await prerenderSkills(input.root, input.signal)
  const resume = input.sessionRef !== null
  const environment = Object.fromEntries(Object.entries(options.environment).filter(([key]) => !/^(CODEX_HOME|OPENAI_API_KEY|ACCESS_TOKEN|ELECTRON_|NODE_OPTIONS$)/i.test(key)))
  // Same sandbox as the user's Codex app (its own [windows] setting); only the unattended policy and the quiet tools are forced.
  const model = await defaultModel(executable, environment, input.root)
  const settings = ['approval_policy="never"', 'sandbox_mode="workspace-write"', 'sandbox_workspace_write.network_access=true', ...(model ? ['model=' + JSON.stringify(model)] : []), ...QUIET,
    // The sandbox user cannot read the user's own uv folders (AppData): BMad's scripts use Madness's Python and a cache Madness owns.
    ...uvSettings(join(options.root, 'uv')), 'sandbox_workspace_write.writable_roots=' + JSON.stringify([join(options.root, 'uv')])]
  const args = ['exec', ...(resume ? ['resume'] : []), '--json', '--skip-git-repo-check', ...settings.flatMap(value => ['-c', value]), ...(resume ? [input.sessionRef!] : []), '-']
  return runCodex(executable, args, withBundledTools(environment), resume ? input.text : buildAgenticPrompt(input.skill, input.text, []), options, input)
}
export async function codexAgentTurn(options: Options, input: AgentTurnInput): Promise<AgentTurnResult> {
  if (await hasOwnCodexLogin(options.realHome)) return codexOwnLoginTurn(options, input)
  // One Codex home for every project, so the sandbox is set up once.
  const executable = await findNativeExecutable(options.appData), home = join(options.root, 'shared')
  await mkdir(join(home, 'codex-home'), { recursive: true })
  await prerenderSkills(input.root, input.signal)
  const token = await options.accessToken(input.signal), resume = input.sessionRef !== null
  const args = ['exec', ...(resume ? ['resume'] : []), '--json', '--skip-git-repo-check', ...settings(options.realHome, home).flatMap(value => ['-c', value]), ...(resume ? [input.sessionRef!] : []), '-']
  // The ChatGPT access Madness uses refuses the messages sub-agents send back, and this Codex version offers
  // spawn_agent whatever its feature flags say: the run must keep every review in its own session.
  const noSubAgents = '\n\nMadness constraint: never call spawn_agent or any collaboration tool, and never delegate to sub-agents. When BMad asks for an independent review, do it yourself in this session, then continue.'
  const prompt = (resume ? input.text : buildAgenticPrompt(input.skill, input.text, [])) + noSubAgents
  return runCodex(executable, args, withBundledTools(probeEnvironment(options.environment, home, token)), prompt, options, input)
}
function runCodex(executable: string, args: string[], env: NodeJS.ProcessEnv, prompt: string, options: Options, input: AgentTurnInput): Promise<AgentTurnResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd: input.root, env, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = '', stderr = ''; child.stdout.on('data', chunk => { stdout += chunk }); child.stderr.on('data', chunk => { stderr = (stderr + chunk).slice(-4000) })
    const kill = (): void => { if (child.pid) spawn('taskkill', ['/T', '/F', '/PID', String(child.pid)], { windowsHide: true, stdio: 'ignore' }) }
    const timer = setTimeout(kill, options.timeoutMs ?? 45 * 60 * 1000); input.signal.addEventListener('abort', kill, { once: true }); if (input.signal.aborted) kill()
    child.stdin.on('error', () => undefined)
    child.once('error', reject)
    child.once('close', code => {
      clearTimeout(timer); input.signal.removeEventListener('abort', kill)
      const result = readCodexEvents(stdout)
      if (result.failure) return reject(Error(result.failure))
      if (code !== 0 || !result.text) return reject(Error(stderr.trim().slice(-500) || 'Codex s’est arrêté sans réponse.'))
      resolve({ text: result.text, sessionRef: result.threadId ?? input.sessionRef ?? '', tokens: result.tokens })
    })
    child.stdin.end(prompt)
  })
}
