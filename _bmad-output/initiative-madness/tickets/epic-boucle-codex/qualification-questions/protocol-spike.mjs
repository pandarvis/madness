// Investigation isolée : vrai app-server, modèle SIMULÉ sur loopback, aucun compte.
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = dirname(fileURLToPath(import.meta.url))
const executable = 'C:/Users/UP60066553/AppData/Roaming/npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe'
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const report = { kind: 'investigation-native-model-simulation', startedAt: new Date().toISOString(), noRealModel: true, noOAuth: true, noBillableAccount: true, nativeVersion: null, nativeSha256: null, schema: {}, scenarios: [], limits: [] }
let root
const delay = ms => new Promise(r => setTimeout(r, ms))
const text = async (file, value) => writeFile(join(base, file), value, 'utf8')
const envFor = home => Object.fromEntries(Object.entries({ PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, WINDIR: process.env.WINDIR, TEMP: home, TMP: home, HOME: home, USERPROFILE: home, APPDATA: join(home, 'appdata'), LOCALAPPDATA: join(home, 'localappdata'), CODEX_HOME: join(home, 'codex-home'), NO_PROXY: '127.0.0.1,localhost', HTTP_PROXY: '', HTTPS_PROXY: '', ALL_PROXY: '' }).filter(([, v]) => v !== undefined))
async function stop(child) {
  if (!child || child.exitCode !== null) return
  const closed = new Promise(r => child.once('close', r))
  child.stdin.end()
  await Promise.race([closed, delay(1500)])
  if (child.exitCode === null) child.kill('SIGTERM')
  await Promise.race([closed, delay(3000)])
  if (child.exitCode === null) throw Error('native-stop-unconfirmed')
}
async function command(args, home) {
  const child = spawn(executable, args, { cwd: home, env: envFor(home), windowsHide: true, shell: false, stdio: ['pipe', 'pipe', 'pipe'] })
  let out = '', err = ''
  child.stdout.on('data', b => { out += b })
  child.stderr.on('data', b => { err += b })
  const completed = new Promise((r, j) => { child.once('error', j); child.once('close', code => r(code)) })
  try { const code = await Promise.race([completed, delay(20000).then(() => { throw Error('command-timeout') })]); if (code !== 0) throw Error(err.slice(-3000)); return out }
  finally { await stop(child) }
}
function sse(response, items) {
  response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' })
  const emit = data => response.write('data: ' + JSON.stringify(data) + '\n\n')
  const id = 'resp_' + randomUUID()
  emit({ type: 'response.created', response: { id, status: 'in_progress', output: [] } })
  for (const [output_index, item] of items.entries()) {
    emit({ type: 'response.output_item.added', output_index, item })
    emit({ type: 'response.output_item.done', output_index, item })
  }
  emit({ type: 'response.completed', response: { id, status: 'completed', output: items, usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 } } })
  response.end()
}
async function scenario(name, mode = 'answer', autoResolutionMs) {
  const home = join(root, name), result = { name, mode, autoResolutionMs: autoResolutionMs ?? null, requests: [], events: [], sends: [], checks: {}, stderr: [], failure: null }
  await mkdir(home)
  await mkdir(join(home, 'codex-home'))
  const t0 = performance.now(), elapsed = () => Math.round(performance.now() - t0)
  const syntheticAnswer = 'Alpha-' + randomUUID()
  let providerCalls = 0, child, buf = '', fatal, threadId, turnId
  const waits = [], pending = new Map()
  const see = message => {
    const recorded = structuredClone(message)
    if (recorded.method === 'rawResponseItem/completed' && recorded.params?.item?.type === 'message' && ['developer', 'user'].includes(recorded.params.item.role)) recorded.params.item = { type: 'message', role: recorded.params.item.role, contentSha256: digest(JSON.stringify(recorded.params.item.content)) }
    result.events.push({ ms: elapsed(), ...recorded })
    if (message.id !== undefined && !message.method && pending.has(message.id)) { const p = pending.get(message.id); pending.delete(message.id); message.error ? p.reject(Error(JSON.stringify(message.error))) : p.resolve(message.result) }
    for (const wait of [...waits]) if (wait.test(message)) { waits.splice(waits.indexOf(wait), 1); wait.resolve(message) }
  }
  let nextId = 0
  const write = value => { result.sends.push({ ms: elapsed(), ...value }); return new Promise((r, j) => child.stdin.write(JSON.stringify(value) + '\n', e => e ? j(e) : r())) }
  const rpc = (method, params) => new Promise((resolve, reject) => { const id = ++nextId; const timer = setTimeout(() => { pending.delete(id); reject(Error('rpc-timeout: ' + method)) }, 15000); pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value) }, reject: error => { clearTimeout(timer); reject(error) } }); write({ id, method, params }).catch(reject) })
  const waitFor = (test, timeout = 12000, history = true) => {
    const old = history && result.events.find(test)
    if (old) return Promise.resolve(old)
    return new Promise((resolve, reject) => { const wait = { test, resolve: value => { clearTimeout(timer); resolve(value) } }; const timer = setTimeout(() => { const i = waits.indexOf(wait); if (i >= 0) waits.splice(i, 1); reject(Error('event-timeout')) }, timeout); waits.push(wait) })
  }
  const server = createServer(async (request, response) => {
    try {
      result.checks.inboundHttp ??= []
      result.checks.inboundHttp.push({ method: request.method, url: request.url, contentEncoding: request.headers['content-encoding'] ?? null })
      if (request.url === '/health') { response.writeHead(200); response.end('loopback-only'); return }
      if (request.method !== 'POST' || request.url !== '/v1/responses') { response.writeHead(404); response.end(); return }
      let body = ''
      for await (const chunk of request) { body += chunk; if (body.length > 4000000) throw Error('body-too-large') }
      const value = JSON.parse(body)
      providerCalls++
      result.requests.push({ ms: elapsed(), number: providerCalls, method: request.method, url: request.url, authorizationPresent: Object.hasOwn(request.headers, 'authorization'), body: { model: value.model, tool_choice: value.tool_choice, tools: value.tools?.filter(t => t.name === 'request_user_input'), input: value.input?.filter(i => ['function_call', 'function_call_output'].includes(i.type)), otherInputSha256: digest(JSON.stringify(value.input?.filter(i => !['function_call', 'function_call_output'].includes(i.type)))) } })
      if (providerCalls === 1) {
        const args = { questions: [{ id: 'route', header: 'Direction', question: 'Quelle direction synthétique choisir ?', options: [{ label: syntheticAnswer, description: 'Direction de test Alpha avec nonce synthétique.' }, { label: 'Beta', description: 'Direction de test Beta.' }] }], ...(autoResolutionMs !== undefined ? { autoResolutionMs } : {}) }
        sse(response, [{ type: 'function_call', id: 'fc_' + name, call_id: 'call_' + name, name: 'request_user_input', arguments: JSON.stringify(args) }])
      } else {
        // Le texte ne vaut aucune preuve d'acquittement : seul le corps entrant fera foi.
        sse(response, [{ type: 'message', id: 'msg_' + name, role: 'assistant', phase: 'final_answer', content: [{ type: 'output_text', text: 'Fin synthétique de la qualification de transport.' }] }])
      }
    } catch (error) { fatal = error; result.checks.providerFailure = String(error); response.writeHead(500); response.end('simulation-failed') }
  })
  await new Promise(r => server.listen(0, '127.0.0.1', r))
  const port = server.address().port
  result.checks.loopbackSelfCheck = await (await fetch(`http://127.0.0.1:${port}/health`)).text()
  const settings = [
    'model="gpt-5.4"', 'model_provider="protocol_spike"', 'model_providers.protocol_spike.name="Protocol spike loopback simulation"', `model_providers.protocol_spike.base_url="http://127.0.0.1:${port}/v1"`, 'model_providers.protocol_spike.wire_api="responses"', 'model_providers.protocol_spike.requires_openai_auth=false', 'model_providers.protocol_spike.supports_websockets=false', 'model_providers.protocol_spike.request_max_retries=0', 'model_providers.protocol_spike.stream_max_retries=0', 'features.default_mode_request_user_input=true', 'features.respect_system_proxy=false', 'features.enable_request_compression=false', 'features.shell_tool=false', 'features.apps=false', 'features.plugins=false', 'features.multi_agent=false', 'web_search="disabled"', 'mcp_servers={}', 'shell_environment_policy.inherit="none"', 'cli_auth_credentials_store="file"', 'project_doc_max_bytes=0'
  ]
  try {
    result.checks.feature = (await command([...settings.flatMap(v => ['-c', v]), 'features', 'list'], home)).split(/\r?\n/).find(v => v.startsWith('default_mode_request_user_input'))
    child = spawn(executable, ['app-server', '--listen', 'stdio://', ...settings.flatMap(v => ['-c', v])], { cwd: home, env: envFor(home), windowsHide: true, shell: false, stdio: ['pipe', 'pipe', 'pipe'] })
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', data => { buf += data; while (buf.includes('\n')) { const end = buf.indexOf('\n'), line = buf.slice(0, end); buf = buf.slice(end + 1); if (line.trim()) { try { see(JSON.parse(line)) } catch (e) { fatal = e } } } })
    child.stderr.on('data', b => { if (result.stderr.join('').length < 20000) result.stderr.push(b.toString()) })
    child.on('error', e => { fatal = e })
    await rpc('initialize', { clientInfo: { name: 'madness-protocol-spike', version: '1.5.0' }, capabilities: { experimentalApi: true } })
    await write({ method: 'initialized', params: {} })
    const thread = await rpc('thread/start', { cwd: home, model: 'gpt-5.4', modelProvider: 'protocol_spike', sandbox: 'read-only', approvalPolicy: 'never', ephemeral: true, experimentalRawEvents: true, developerInstructions: 'Qualification de transport locale uniquement. Aucun fichier, shell, réseau externe ou compte.' })
    threadId = thread.thread.id
    const started = await rpc('turn/start', { threadId, input: [{ type: 'text', text: 'Question synthétique de qualification.' }] })
    turnId = started.turn.id
    const question = await waitFor(e => e.method === 'item/tool/requestUserInput')
    result.checks.question = { id: question.id, itemId: question.params.itemId, threadId: question.params.threadId, turnId: question.params.turnId, autoResolutionMs: question.params.autoResolutionMs ?? null }
    result.checks.nativeQuestionObserved = true
    if (mode === 'answer') {
      result.checks.syntheticAnswer = syntheticAnswer
      await write({ id: question.id, result: { answers: { route: { answers: [syntheticAnswer] } } } })
      result.checks.stdinResponseWritten = true
    } else if (mode === 'interrupt') {
      await rpc('turn/interrupt', { threadId, turnId })
    } else if (mode === 'stop') {
      await stop(child)
    }
    if (mode !== 'stop') await waitFor(e => e.method === 'turn/completed', question.params.autoResolutionMs ? Math.max(12000, Math.min(65000, question.params.autoResolutionMs + 5000)) : 12000)
    await delay(100)
    result.checks.resolved = result.events.filter(e => e.method === 'serverRequest/resolved')
    result.checks.rawFunctionOutputs = result.events.filter(e => e.method === 'rawResponseItem/completed' && e.params?.item?.type === 'function_call_output')
    result.checks.legacyRawOutputs = result.events.filter(e => e.method?.includes('raw_response_item'))
    result.checks.functionOutputsSentToSimulatedModel = result.requests.flatMap(r => r.body.input ?? []).filter(i => i.type === 'function_call_output')
    result.checks.itemTypes = [...new Set(result.events.filter(e => ['item/started', 'item/completed'].includes(e.method)).map(e => e.params?.item?.type))]
    result.checks.completed = result.events.filter(e => e.method === 'turn/completed').map(e => e.params.turn.status)
    if (fatal) throw fatal
  } catch (error) { result.failure = String(error?.stack ?? error) }
  finally {
    try { await stop(child); result.checks.nativeStopped = true } catch (error) { result.checks.stopFailure = String(error); report.limits.push('Arrêt natif non confirmé : ' + name) }
    for (const p of pending.values()) p.reject(Error('spike-ended'))
    server.closeAllConnections()
    await new Promise(r => server.close(r))
    // Les seules données capturées viennent du fournisseur synthétique, sans en-tête secret.
    report.scenarios.push(result)
    console.log(JSON.stringify({ scenario: name, failure: result.failure, providerCalls, checks: result.checks }))
  }
}
try {
  await mkdir(base, { recursive: true })
  root = await mkdtemp(join(base, 'protocol-spike-temp-'))
  await mkdir(join(root, 'codex-home'))
  report.nativeVersion = (await command(['--version'], root)).trim()
  report.nativeSha256 = digest(await readFile(executable))
  const schemaDir = join(root, 'schema')
  await command(['app-server', 'generate-json-schema', '--experimental', '--out', schemaDir], root)
  for (const name of ['v2/ThreadStartParams.json', 'v2/TurnStartParams.json', 'v2/ServerRequestResolvedNotification.json']) {
    const bytes = await readFile(join(schemaDir, name)), value = JSON.parse(bytes)
    report.schema[name] = { sha256: digest(bytes), properties: Object.fromEntries(Object.entries(value.properties).filter(([key]) => ['experimentalRawEvents', 'collaborationMode', 'requestId', 'threadId'].includes(key))), ...(name.includes('TurnStart') ? { collaborationMode: value.definitions?.CollaborationMode, settings: value.definitions?.Settings } : {}) }
  }
  await scenario('answer-no-expiry', 'answer')
  if (report.scenarios.at(-1).checks.nativeQuestionObserved) {
    await scenario('interrupt-no-answer', 'interrupt')
    await scenario('auto-expiry-no-answer', 'expiry', 1000)
    await scenario('stop-no-answer', 'stop')
  }
} catch (error) { report.failure = String(error?.stack ?? error) }
finally {
  if (root) {
    const target = resolve(root), expected = resolve(base)
    if (dirname(target) !== expected || !target.split(/[\\/]/).at(-1).startsWith('protocol-spike-temp-')) throw Error('unsafe-cleanup-target')
    await rm(target, { recursive: true, force: true })
    report.temporaryProfileCleaned = true
  }
  report.endedAt = new Date().toISOString()
  report.scriptSha256 = digest(await readFile(fileURLToPath(import.meta.url)))
  await text('protocol-spike.json', JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ report: join(base, 'protocol-spike.json'), nativeVersion: report.nativeVersion, failure: report.failure, scenarios: report.scenarios.map(s => ({ name: s.name, failure: s.failure, checks: s.checks })), temporaryProfileCleaned: report.temporaryProfileCleaned }, null, 2))
}
