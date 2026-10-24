import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { mkdir, mkdtemp, readFile, realpath, lstat, open, rm } from 'node:fs/promises'
import { join, relative, isAbsolute, sep, dirname, basename, resolve } from 'node:path'
import { isRecord } from '../../contracts/index.ts'
import { connectionError, connectionFailure } from '../../contracts/connection.ts'
import type { Credentials } from './vault.ts'
const marker = 'MADNESS_CODEX_OK'
const provider = 'openai_chatgpt_plan'
export function probeEnvironment(source: NodeJS.ProcessEnv, isolated: string, token?: string): NodeJS.ProcessEnv {
  if (source.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw connectionFailure('NETWORK_UNAVAILABLE')
  const allow = ['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY', 'SSL_CERT_FILE', 'SSL_CERT_DIR']
  const env = Object.fromEntries(Object.entries(source).filter(([key]) => allow.includes(key.toUpperCase())))
  return { ...env, HOME: isolated, USERPROFILE: isolated, APPDATA: join(isolated, 'appdata'), LOCALAPPDATA: join(isolated, 'localappdata'), CODEX_HOME: join(isolated, 'codex-home'), ...(token ? { ACCESS_TOKEN: token } : {}) }
}
/** Aucun PATH arbitraire ni wrapper : seulement les deux implantations npm standard Windows. */
export async function findNativeExecutable(appData: string): Promise<string> {
  if (process.platform !== 'win32' || process.arch !== 'x64' || !isAbsolute(appData)) throw connectionFailure('CODEX_MISSING')
  let canonicalAppData: string
  try { canonicalAppData = await realpath(appData) } catch { throw connectionFailure('CODEX_MISSING') }
  const npm = join(canonicalAppData, 'npm/node_modules/@openai')
  for (const root of [join(npm, 'codex/node_modules/@openai/codex-win32-x64'), join(npm, 'codex-win32-x64')]) {
    try {
      const canonical = await realpath(root)
      if (canonical.toLowerCase() !== resolve(root).toLowerCase() || (await lstat(root)).isSymbolicLink()) throw connectionFailure('CODEX_INVALID')
      const manifestPath = join(root, 'package.json')
      if ((await lstat(manifestPath)).size > 32768) throw connectionFailure('CODEX_INVALID')
      const manifest: unknown = JSON.parse(await readFile(manifestPath, 'utf8'))
      if (!isRecord(manifest) || manifest.name !== '@openai/codex' || !Array.isArray(manifest.os) || !manifest.os.includes('win32') || !Array.isArray(manifest.cpu) || !manifest.cpu.includes('x64')) throw connectionFailure('CODEX_INVALID')
      const path = join(root, 'vendor/x86_64-pc-windows-msvc/bin/codex.exe')
      const info = await lstat(path)
      if (!info.isFile() || info.isSymbolicLink() || info.size < 65536 || (await realpath(path)).toLowerCase() !== resolve(path).toLowerCase()) throw connectionFailure('CODEX_INVALID')
      const file = await open(path, 'r')
      try { const bytes = Buffer.alloc(2); await file.read(bytes, 0, 2, 0); if (bytes.toString('ascii') !== 'MZ') throw connectionFailure('CODEX_INVALID') } finally { await file.close() }
      return path
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw connectionFailure('CODEX_INVALID') }
  }
  throw connectionFailure('CODEX_MISSING')
}
// Le format natif est décodé et borné ici ; aucun payload natif ne sort de l’adaptateur.
type NativeMessage = { id?: number | string; method?: string; params?: any; result?: any; error?: unknown }
export class ProbeRpc {
  private child: ChildProcessWithoutNullStreams
  private signal: AbortSignal
  private timeout: number
  private nextId = 0
  private pending = new Map<number, { resolve(value: any): void; reject(error: unknown): void }>()
  private queue: NativeMessage[] = []
  private waiter: { matches(value: NativeMessage): boolean; resolve(value: NativeMessage): void; reject(error: unknown): void } | null = null
  private buffer = ''
  private size = 0
  private error: Error | null = null
  constructor(child: ChildProcessWithoutNullStreams, signal: AbortSignal, timeout = 15000) {
    this.child = child; this.signal = signal; this.timeout = timeout
    child.stdout.setEncoding('utf8'); child.stdout.on('data', this.data)
    child.stderr.on('data', this.stderr)
    child.on('error', this.closed); child.on('close', this.closed); child.stdin.on('error', this.closed)
    signal.addEventListener('abort', this.aborted, { once: true })
    if (signal.aborted) this.aborted()
  }
  private stderr = (chunk: Buffer): void => { this.size += chunk.length; if (this.size > 4194304) this.abort() }
  private data = (chunk: string): void => {
    if (this.error) return
    this.size += Buffer.byteLength(chunk); this.buffer += chunk
    if (this.buffer.length > 1048576 || this.size > 4194304) return this.abort()
    while (this.buffer.includes('\n') && !this.error) {
      const end = this.buffer.indexOf('\n'), line = this.buffer.slice(0, end); this.buffer = this.buffer.slice(end + 1)
      if (!line.trim()) continue
      try { const value: unknown = JSON.parse(line); if (!isRecord(value)) throw Error(); this.receive(value) } catch { this.abort() }
    }
  }
  private closed = (): void => this.abort()
  private aborted = (): void => this.abort('CANCELLED')
  private abort(code: 'CANCELLED' | 'PROBE_FAILED' = 'PROBE_FAILED'): void {
    this.error ??= connectionFailure(code)
    for (const pending of this.pending.values()) pending.reject(this.error)
    this.pending.clear(); this.waiter?.reject(this.error)
  }
  private receive(value: NativeMessage): void {
    if (value.method && Object.hasOwn(value, 'id')) { this.child.stdin.write(JSON.stringify({ id: value.id, error: { code: -32601, message: 'Demande refusée' } }) + '\n'); this.abort(); return }
    if (Object.hasOwn(value, 'id')) {
      const pending = this.pending.get(Number(value.id)); if (!pending) return
      this.pending.delete(Number(value.id))
      if (value.error || !Object.hasOwn(value, 'result')) pending.reject(connectionFailure('PROBE_FAILED')); else pending.resolve(value.result)
      return
    }
    if (value.method === 'error' || value.method === 'item/started' && !['userMessage', 'agentMessage', 'reasoning'].includes(value.params?.item?.type) || value.method === 'item/completed' && !['userMessage', 'agentMessage', 'reasoning'].includes(value.params?.item?.type)) return this.abort()
    if (!['item/completed', 'turn/completed'].includes(value.method ?? '')) return
    if (this.waiter?.matches(value)) { const waiter = this.waiter; this.waiter = null; waiter.resolve(value) }
    else { this.queue.push(value); if (this.queue.length > 256) this.abort() }
  }
  private async timed<T>(register: (resolve: (value: T) => void, reject: (error: unknown) => void) => void, timeout: number, cleanup: () => void): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    try { return await new Promise<T>((resolve, reject) => { timer = setTimeout(() => reject(connectionFailure('PROBE_FAILED')), Math.max(1, timeout)); register(resolve, reject) }) }
    finally { clearTimeout(timer); cleanup() }
  }
  async call(method: string, params: unknown, timeout = this.timeout): Promise<any> {
    if (this.error) throw this.error
    const id = ++this.nextId
    return this.timed((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.child.stdin.write(JSON.stringify({ id, method, params }) + '\n') }, timeout, () => this.pending.delete(id))
  }
  notify(method: string): void { if (this.error) throw this.error; this.child.stdin.write(JSON.stringify({ method, params: {} }) + '\n') }
  async wait(matches: (value: NativeMessage) => boolean, timeout: number): Promise<NativeMessage> {
    if (this.error) throw this.error
    if (timeout <= 0) throw connectionFailure('PROBE_FAILED')
    const index = this.queue.findIndex(matches); if (index >= 0) return this.queue.splice(index, 1)[0]
    return this.timed((resolve, reject) => { this.waiter = { matches, resolve, reject } }, timeout, () => { this.waiter = null })
  }
  dispose(): void { this.signal.removeEventListener('abort', this.aborted); this.abort(); this.child.stdout.off('data', this.data); this.child.stderr.off('data', this.stderr); this.child.off('error', this.closed); this.child.off('close', this.closed); this.child.stdin.off('error', this.closed) }
}
export async function runProbeProtocol(rpc: ProbeRpc, cwd: string, timeout = 45000): Promise<true> {
  await rpc.call('initialize', { clientInfo: { name: 'madness', title: 'Madness', version: '0.1.0' } }); rpc.notify('initialized')
  const catalog = await rpc.call('model/list', {})
  const model = catalog.data?.find((value: any) => value.isDefault === true && value.hidden === false && typeof value.model === 'string')
  if (!model || !/^[a-zA-Z0-9._:/-]{1,100}$/.test(model.model)) throw connectionFailure('PROBE_FAILED')
  const thread = await rpc.call('thread/start', { cwd, model: model.model, modelProvider: provider, sandbox: 'read-only', approvalPolicy: 'never', ephemeral: true, persistExtendedHistory: false, developerInstructions: 'Vérification technique. Aucun outil, fichier, commande, navigation, MCP ou sous-agent. Réponds uniquement au message.' })
  if (thread.modelProvider !== provider || thread.model !== model.model || thread.sandbox?.type !== 'readOnly' || thread.approvalPolicy !== 'never' || typeof thread.thread?.id !== 'string') throw connectionFailure('PROBE_FAILED')
  const deadline = Date.now() + timeout
  const started = await rpc.call('turn/start', { threadId: thread.thread.id, cwd, input: [{ type: 'text', text: 'Réponds uniquement ' + marker + ', sans outil ni autre action.' }] }, timeout)
  const turnId = started.turn?.id
  if (typeof turnId !== 'string') throw connectionFailure('PROBE_FAILED')
  let matched = false
  for (;;) {
    const event = await rpc.wait((value) => value.params?.threadId === thread.thread.id && (value.method === 'turn/completed' ? value.params?.turn?.id === turnId : value.params?.turnId === turnId), deadline - Date.now())
    if (event.method === 'item/completed') { if (event.params?.item?.type === 'agentMessage' && event.params.item.text?.trim() === marker) matched = true }
    else { if (event.params?.turn?.status !== 'completed' || event.params?.turn?.error || !matched) throw connectionFailure('PROBE_FAILED'); return true }
  }
}
export async function stopNative(child: ChildProcessWithoutNullStreams): Promise<boolean> {
  if ((child.exitCode !== null || child.signalCode !== null) && child.stdout.destroyed && child.stderr.destroyed) return true
  let closed = false
  const observe = (): void => { closed = true }
  child.once('close', observe)
  const wait = async (ms: number): Promise<void> => {
    if (closed) return
    let timer: ReturnType<typeof setTimeout> | undefined
    let finish!: () => void
    try { await new Promise<void>((resolve) => { finish = resolve; child.once('close', finish); timer = setTimeout(finish, ms) }) }
    finally { clearTimeout(timer); child.off('close', finish) }
  }
  try {
    child.stdin.end(); await wait(1500)
    if (!closed && child.exitCode === null && child.signalCode === null) child.kill('SIGTERM')
    await wait(4000)
    if (!closed) { child.stdin.destroy(); child.stdout.destroy(); child.stderr.destroy(); child.unref() }
    return closed
  } finally { child.off('close', observe) }
}
async function nativeVersion(path: string, env: NodeJS.ProcessEnv, cwd: string, signal: AbortSignal): Promise<string> {
  signal.throwIfAborted()
  const child = spawn(path, ['--version'], { cwd, env, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
  let output = ''; child.stdout.on('data', (data) => { if (output.length < 4096) output += data }); child.stderr.resume()
  let timer: ReturnType<typeof setTimeout> | undefined
  const abort = (): void => { child.kill('SIGTERM') }; signal.addEventListener('abort', abort, { once: true })
  try {
    const code = await Promise.race([new Promise<number | null>((resolve, reject) => { child.once('close', resolve); child.once('error', () => reject(connectionFailure('CODEX_INVALID'))) }), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(connectionFailure('CODEX_INVALID')), 5000) })])
    const match = /^codex-cli (\d+\.\d+\.\d+(?:[-.a-zA-Z0-9]+)?)\s*$/.exec(output.trim())
    if (code !== 0 || !match || output.length >= 4096) throw connectionFailure('CODEX_INVALID')
    return match[1]
  } finally { clearTimeout(timer); signal.removeEventListener('abort', abort); if (!await stopNative(child)) throw connectionFailure('STOP_UNCONFIRMED') }
}
export async function probeCodex(credentials: Credentials, signal: AbortSignal, options: { root: string; appData: string; repository: string; environment: NodeJS.ProcessEnv }): Promise<{ stopped: boolean; version: string }> {
  const withinRepository = (path: string): boolean => { const distance = relative(resolve(options.repository), path); return !distance || !isAbsolute(distance) && distance !== '..' && !distance.startsWith('..' + sep) }
  if (withinRepository(resolve(options.root))) throw connectionFailure('CODEX_INVALID')
  const executable = await findNativeExecutable(options.appData)
  signal.throwIfAborted()
  await mkdir(options.root, { recursive: true })
  if (withinRepository(await realpath(options.root))) throw connectionFailure('CODEX_INVALID')
  const root = await mkdtemp(join(options.root, 'attempt-'))
  const distance = relative(resolve(options.repository), await realpath(root))
  if (!distance || !isAbsolute(distance) && distance !== '..' && !distance.startsWith('..' + sep)) throw connectionFailure('CODEX_INVALID')
  const work = join(root, 'work'), isolated = join(root, 'profile')
  let child: ChildProcessWithoutNullStreams | undefined, rpc: ProbeRpc | undefined, stopped = true
  try {
    await mkdir(work); await mkdir(join(isolated, 'codex-home'), { recursive: true })
    const version = await nativeVersion(executable, probeEnvironment(options.environment, isolated), work, signal)
    signal.throwIfAborted()
    const settings = ['cli_auth_credentials_store="file"', 'model_provider="openai_chatgpt_plan"', 'model_providers.openai_chatgpt_plan.name="ChatGPT plan"', 'model_providers.openai_chatgpt_plan.base_url="https://api.openai.com/v1"', 'model_providers.openai_chatgpt_plan.env_key="ACCESS_TOKEN"', 'model_providers.openai_chatgpt_plan.wire_api="responses"', 'model_providers.openai_chatgpt_plan.requires_openai_auth=false', 'model_providers.openai_chatgpt_plan.supports_websockets=false', 'model_providers.openai_chatgpt_plan.request_max_retries=0', 'model_providers.openai_chatgpt_plan.stream_max_retries=0', 'web_search="disabled"', 'features.shell_tool=false', 'features.multi_agent=false', 'mcp_servers={}', 'shell_environment_policy.inherit="none"']
    child = spawn(executable, ['app-server', '--listen', 'stdio://', ...settings.flatMap((setting) => ['-c', setting])], { cwd: work, env: probeEnvironment(options.environment, isolated, credentials.accessToken), shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    rpc = new ProbeRpc(child, signal)
    await runProbeProtocol(rpc, work)
    stopped = await stopNative(child)
    if (!stopped) throw connectionFailure('STOP_UNCONFIRMED')
    signal.throwIfAborted()
    return { stopped: true, version }
  } catch (error) {
    const code = connectionError(error, 'PROBE_FAILED')
    if (code === 'STOP_UNCONFIRMED') stopped = false
    throw connectionFailure(code === 'STOP_UNCONFIRMED' ? code : signal.aborted ? 'CANCELLED' : code)
  }
  finally {
    if (child) { stopped = await stopNative(child); rpc?.dispose() }
    if (stopped) {
      const actual = await realpath(root), parent = await realpath(options.root)
      if (dirname(actual) === parent && basename(actual).startsWith('attempt-') && !(await lstat(root)).isSymbolicLink()) await rm(root, { recursive: true, force: true }).catch(() => {})
    } else throw connectionFailure('STOP_UNCONFIRMED')
  }
}
