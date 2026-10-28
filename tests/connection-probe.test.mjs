import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EventEmitter, once } from 'node:events'
import { PassThrough } from 'node:stream'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, writeFile, rm, realpath, access, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createRequire, syncBuiltinESMExports } from 'node:module'
import { mock } from 'node:test'
const probe = await import('../src/adapters/codex/probe.ts').catch(() => null)
const {releaseVersion}=await import('../src/adapters/release-version.ts')
function child() { const p = new EventEmitter(); p.stdin = new PassThrough(); p.stdout = new PassThrough(); p.stderr = new PassThrough(); return p }
function rpcServer(handler) {
  assert.ok(probe, 'Le témoin natif doit exister')
  const process = child(); let input = ''
  process.stdin.on('data', (chunk) => { input += chunk; while (input.includes('\n')) { const end = input.indexOf('\n'), line = input.slice(0, end); input = input.slice(end + 1); const message = JSON.parse(line); handler(message, (value) => process.stdout.write(JSON.stringify(value) + '\n')) } })
  return new probe.ProbeRpc(process, new AbortController().signal, 100)
}
test('environnement témoin supprime les credentials et profils hérités', () => {
  assert.ok(probe)
  const env = probe.probeEnvironment({ PATH: 'tools', OPENAI_API_KEY: 'foreign', ACCESS_TOKEN: 'foreign', CODEX_HOME: 'foreign', NODE_OPTIONS: '--evil', HTTP_PROXY: 'proxy', SYSTEMROOT: 'C:/Windows', USERPROFILE: 'foreign' }, 'isolated', 'private-access')
  assert.equal(env.ACCESS_TOKEN, 'private-access'); assert.equal(env.OPENAI_API_KEY, undefined); assert.equal(env.NODE_OPTIONS, undefined)
  assert.equal(env.CODEX_HOME.includes('isolated'), true); assert.equal(env.USERPROFILE.includes('isolated'), true); assert.equal(env.HTTP_PROXY, 'proxy')
  assert.throws(() => probe.probeEnvironment({ NODE_TLS_REJECT_UNAUTHORIZED: '0' }, 'isolated', 'secret'), { code: 'NETWORK_UNAVAILABLE' })
})
function sequence({ marker = true, completed = true, tool = false } = {}) {
  return (message, emit) => {
    const reply = (result) => emit({ id: message.id, result })
    if (message.method === 'initialize') { assert.equal(message.params.clientInfo.version,releaseVersion); reply({}) }
    if (message.method === 'model/list') reply({ data: [{ model: 'test-model', isDefault: true, hidden: false }] })
    if (message.method === 'thread/start') reply({ thread: { id: 'thread-1' }, modelProvider: 'openai_chatgpt_plan', model: 'test-model', sandbox: { type: 'readOnly' }, approvalPolicy: 'never' })
    if (message.method === 'turn/start') {
      reply({ turn: { id: 'turn-1' } })
      if (tool) emit({ id: 999, method: 'item/commandExecution/requestApproval', params: {} })
      emit({ method: 'item/completed', params: { threadId: 'thread-1', turnId: marker ? 'turn-1' : 'foreign-turn', item: { type: 'agentMessage', text: 'MADNESS_CODEX_OK' } } })
      emit({ method: 'turn/completed', params: { threadId: 'thread-1', turn: { id: 'turn-1', status: completed ? 'completed' : 'failed' } } })
    }
  }
}
test('seuls item assistant et tour completed corrélés prouvent le témoin', async () => {
  assert.ok(probe)
  assert.equal(await probe.runProbeProtocol(rpcServer(sequence()), 'empty-work', 300), true)
  for (const options of [{ marker: false }, { completed: false }, { tool: true }]) await assert.rejects(probe.runProbeProtocol(rpcServer(sequence(options)), 'empty-work', 300), { code: 'PROBE_FAILED' })
})
test('catalogue seul et modèle défaut invisible ne suffisent pas', async () => {
  const rpc = rpcServer((message, emit) => { if (message.id) emit({ id: message.id, result: message.method === 'model/list' ? { data: [{ model: 'hidden', isDefault: true, hidden: true }] } : {} }) })
  await assert.rejects(probe.runProbeProtocol(rpc, 'empty-work', 300), { code: 'PROBE_FAILED' })
})
test('arrêt natif attend la fermeture observable du processus possédé', async (t) => {
  assert.ok(probe)
  const native = spawn(process.execPath, ['-e', 'process.stdin.resume(); process.stdin.on("end",()=>process.exit(0))'], { windowsHide: true, shell: false, stdio: ['pipe', 'pipe', 'pipe'] })
  let closeObserved = false
  native.once('close', () => { closeObserved = true })
  const closed = once(native, 'close')
  t.after(async () => { if (native.exitCode === null && native.signalCode === null) native.kill('SIGKILL'); await closed })
  assert.equal(await probe.stopNative(native), true)
  assert.equal(closeObserved, true)
  assert.ok(native.exitCode !== null || native.signalCode !== null)
})

test('arrêt natif confirme close et les flux après terminaison par signal', { timeout: 15000 }, async (t) => {
  assert.ok(probe)
  const native = spawn(process.execPath, ['-e', 'process.stdin.resume(); process.stdin.on("end",()=>{}); setInterval(()=>{},1000); process.stdout.write("READY\\n")'], { windowsHide: true, shell: false, stdio: ['pipe', 'pipe', 'pipe'] })
  let closeObserved = false
  native.once('close', () => { closeObserved = true })
  const closed = once(native, 'close')
  t.after(async () => { if (native.exitCode === null && native.signalCode === null) native.kill('SIGKILL'); await closed })
  const [ready] = await once(native.stdout, 'data', { signal: AbortSignal.timeout(5000) })
  assert.match(ready.toString(), /READY/)
  assert.equal(await probe.stopNative(native), true)
  assert.equal(closeObserved, true)
  assert.equal(native.exitCode, null)
  assert.equal(native.signalCode, 'SIGTERM')
  assert.equal(native.stdout.destroyed, true)
  assert.equal(native.stderr.destroyed, true)
})
test('annulation interrompt les appels RPC en attente sans rejouer', async () => {
  assert.ok(probe)
  const controller = new AbortController(), p = child(), rpc = new probe.ProbeRpc(p, controller.signal, 300)
  const called = rpc.call('initialize', {}); controller.abort()
  await assert.rejects(called, { code: 'CANCELLED' })
  rpc.dispose()
})
test('découverte native exige le chemin standard, le manifeste et un fichier PE', async () => {
  assert.ok(probe)
  const root = await realpath(await mkdtemp(join(tmpdir(), 'madness-native-')))
  try {
    await assert.rejects(probe.findNativeExecutable(root), { code: 'CODEX_MISSING' })
    const native = join(root, 'npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64')
    await mkdir(join(native, 'vendor/x86_64-pc-windows-msvc/bin'), { recursive: true })
    await writeFile(join(native, 'package.json'), JSON.stringify({ name: '@openai/codex', os: ['win32'], cpu: ['x64'] }))
    const binary = join(native, 'vendor/x86_64-pc-windows-msvc/bin/codex.exe'), bytes = Buffer.alloc(65536); bytes.write('MZ'); await writeFile(binary, bytes)
    assert.equal(await probe.findNativeExecutable(root), binary)
    await writeFile(binary, Buffer.alloc(65536))
    await assert.rejects(probe.findNativeExecutable(root), { code: 'CODEX_INVALID' })
  } finally { await rm(root, { recursive: true, force: true }) }
})
test('un profil témoin sous le dépôt est refusé avant toute création ou détection', async () => {
  assert.ok(probe)
  const repository = fileURLToPath(new URL('../', import.meta.url)), root = join(repository, '.probe-fixture-' + randomUUID())
  await assert.rejects(probe.probeCodex({}, new AbortController().signal, { root, repository, appData: 'C:/missing-native-fixture', environment: {} }), { code: 'CODEX_INVALID' })
  await assert.rejects(access(root), { code: 'ENOENT' })
})
test('un arrêt inconnu pendant --version prime sur annuler et conserve le profil', async () => {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'madness-version-stop-')))
  const controller = new AbortController(), process = child()
  process.exitCode = 0; process.signalCode = null; process.kill = () => false; process.unref = () => {}
  const childProcess = createRequire(import.meta.url)('node:child_process')
  const spawnMock = mock.method(childProcess, 'spawn', () => {
    queueMicrotask(() => { process.stdout.write('codex-cli 0.1.0\n'); process.emit('close', 0); controller.abort() })
    return process
  })
  syncBuiltinESMExports()
  try {
    const native = join(root, 'npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64')
    await mkdir(join(native, 'vendor/x86_64-pc-windows-msvc/bin'), { recursive: true })
    await writeFile(join(native, 'package.json'), JSON.stringify({ name: '@openai/codex', os: ['win32'], cpu: ['x64'] }))
    const bytes = Buffer.alloc(65536); bytes.write('MZ'); await writeFile(join(native, 'vendor/x86_64-pc-windows-msvc/bin/codex.exe'), bytes)
    const attempts = join(root, 'probes'), repository = fileURLToPath(new URL('../', import.meta.url))
    const result = await probe.probeCodex({}, controller.signal, { root: attempts, appData: root, repository, environment: {} }).catch((error) => error)
    assert.deepEqual({ code: result.code, profiles: (await readdir(attempts)).length }, { code: 'STOP_UNCONFIRMED', profiles: 1 })
  } finally { spawnMock.mock.restore(); syncBuiltinESMExports(); await rm(root, { recursive: true, force: true }) }
})
