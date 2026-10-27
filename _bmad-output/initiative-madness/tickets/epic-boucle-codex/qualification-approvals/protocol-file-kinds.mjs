// Vrai runner, modèle entièrement simulé ; effets limités à des fixtures possédées.
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ownFile = fileURLToPath(import.meta.url), base = dirname(ownFile)
const exe = 'C:/Users/UP60066553/AppData/Roaming/npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe'
const expectedNativeSha = '4b76ded066d0239115ca97473d010c92072bc5c5550a45dd7cbebe1e9eb956a7'
const sha = value => createHash('sha256').update(value).digest('hex')
const report = { scope: 'Native approval transport, fully simulated loopback model, no account/OAuth/real model', startedAt: new Date().toISOString(), executionBoundary: 'require_escalated', scriptSha256: sha(await readFile(ownFile)), schemas: {}, scenarios: [], cleanup: false }
let root
const env = home => Object.fromEntries(Object.entries({ PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, WINDIR: process.env.WINDIR, TEMP: home, TMP: home, HOME: home, USERPROFILE: home, APPDATA: join(home, 'appdata'), LOCALAPPDATA: join(home, 'localappdata'), CODEX_HOME: join(home, 'codex-home'), NO_PROXY: '127.0.0.1,localhost', HTTP_PROXY: '', HTTPS_PROXY: '', ALL_PROXY: '' }).filter(([, v]) => v !== undefined))
const sleep = ms => new Promise(r => setTimeout(r, ms))
function insideOwned(path, parent) { const a = resolve(path), b = resolve(parent); return a.toLowerCase().startsWith(b.toLowerCase() + '\\') }
async function stop(child) {
  if (!child || child.exitCode !== null) return true
  let closed = false
  const done = new Promise(r => child.once('close', () => { closed = true; r() }))
  child.stdin.end()
  await Promise.race([done, sleep(1200)])
  if (!closed) child.kill('SIGTERM')
  await Promise.race([done, sleep(3000)])
  return closed
}
async function command(args, home) {
  const child = spawn(exe, args, { cwd: home, env: env(home), shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
  let out = '', err = '', timer
  child.stdout.on('data', b => { out += b }); child.stderr.on('data', b => { err += b })
  try {
    const code = await Promise.race([new Promise((r, j) => { child.once('error', j); child.once('close', r) }), new Promise((_, j) => { timer = setTimeout(() => j(Error('command-timeout')), 15000) })])
    if (code !== 0) throw Error('native-command-failed: ' + err.slice(-1000))
    return out
  } finally { clearTimeout(timer); if (!await stop(child)) throw Error('stop-unconfirmed') }
}
function sse(response, item) {
  response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' })
  const emit = v => response.write('data: ' + JSON.stringify(v) + '\n\n'), id = 'resp_' + randomUUID()
  emit({ type: 'response.created', response: { id, status: 'in_progress', output: [] } })
  emit({ type: 'response.output_item.added', output_index: 0, item })
  emit({ type: 'response.output_item.done', output_index: 0, item })
  emit({ type: 'response.completed', response: { id, status: 'completed', output: [item], usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 } } })
  response.end()
}
const finalItem = name => ({ type: 'message', id: 'final_' + name, role: 'assistant', phase: 'final_answer', content: [{ type: 'output_text', text: 'Fin synthétique, aucune preuve humaine implicite.' }] })
async function scenario(name, mode, approvalPolicy) {
  const home = join(root, name), work = join(home, 'work'), effects = join(home, 'effect')
  if (!insideOwned(home, root) || !insideOwned(effects, home)) throw Error('unsafe-fixture-path')
  await mkdir(work, { recursive: true }); await mkdir(effects); await mkdir(join(home, 'codex-home'))
  const nonce = randomUUID(), path = file => join(effects, file), portable = file => path(file).replaceAll('\\', '/')
  const add = (file, content) => '*** Add File: ' + portable(file) + '\n' + content.trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n'
  const del = file => '*** Delete File: ' + portable(file) + '\n'
  const update = (file, before, after) => '*** Update File: ' + portable(file) + '\n@@\n-' + before + '\n+' + after + '\n'
  const wrap = hunks => '*** Begin Patch\n' + hunks + '*** End Patch'
  let initial, operations, expectedAfterAccept
  if (name === 'add') {
    initial = { 'livrable-a.md': null, 'livrable-b.md': null }
    const created = 'livrable accepte ' + nonce + '\n', rejected = 'livrable refuse ' + nonce + '\n'
    operations = [ { patch: wrap(add('livrable-a.md', created)), changes: [{ path: path('livrable-a.md'), kind: 'add' }] }, { patch: wrap(add('livrable-b.md', rejected)), changes: [{ path: path('livrable-b.md'), kind: 'add' }] } ]
    expectedAfterAccept = { 'livrable-a.md': created, 'livrable-b.md': null }
  } else if (name === 'delete') {
    initial = { 'obsolete-a.md': 'ancien a ' + nonce + '\n', 'obsolete-b.md': 'ancien b ' + nonce + '\n' }
    operations = [ { patch: wrap(del('obsolete-a.md')), changes: [{ path: path('obsolete-a.md'), kind: 'delete' }] }, { patch: wrap(del('obsolete-b.md')), changes: [{ path: path('obsolete-b.md'), kind: 'delete' }] } ]
    expectedAfterAccept = { 'obsolete-a.md': null, 'obsolete-b.md': initial['obsolete-b.md'] }
  } else if (name === 'multi') {
    initial = { 'livrable.md': null, 'contexte.md': 'avant ' + nonce + '\n', 'obsolete.md': 'obsolete ' + nonce + '\n', 'refuse.md': null }
    const created = 'livrable multi ' + nonce + '\n', changed = 'apres multi ' + nonce
    operations = [
      { patch: wrap(add('livrable.md', created) + update('contexte.md', initial['contexte.md'].trimEnd(), changed) + del('obsolete.md')), changes: [{ path: path('livrable.md'), kind: 'add' }, { path: path('contexte.md'), kind: 'update' }, { path: path('obsolete.md'), kind: 'delete' }] },
      { patch: wrap(add('refuse.md', 'refuse ' + nonce + '\n') + update('livrable.md', created.trimEnd(), 'modification refusee ' + nonce) + del('contexte.md')), changes: [{ path: path('refuse.md'), kind: 'add' }, { path: path('livrable.md'), kind: 'update' }, { path: path('contexte.md'), kind: 'delete' }] }
    ]
    expectedAfterAccept = { 'livrable.md': created, 'contexte.md': changed + '\n', 'obsolete.md': null, 'refuse.md': null }
  } else throw Error('unknown-scenario')
  for (const [file, content] of Object.entries(initial)) { if (!insideOwned(path(file), effects)) throw Error('unsafe-target'); if (content !== null) await writeFile(path(file), content) }
  const result = { name, mode, approvalPolicy, shellEnabled: false, sandbox: 'read-only', fixturesRoot: effects, initial, expectedAfterAccept, requests: [], events: [], sends: [], approvals: [], effects: [], stderr: [], failure: null }
  const t0 = performance.now(), ms = () => Math.round(performance.now() - t0)
  let child, nextId = 0, buffer = '', activeTurn = 1, requestInTurn = 0, nativeThread, fatal
  const pending = new Map(), waiters = []
  const recorded = message => {
    const copy = structuredClone(message)
    if (copy.method === 'rawResponseItem/completed' && copy.params?.item?.type === 'message' && ['developer', 'user'].includes(copy.params.item.role)) copy.params.item = { type: 'message', role: copy.params.item.role, contentSha256: sha(JSON.stringify(copy.params.item.content)) }
    result.events.push({ ms: ms(), ...copy })
    if (message.id !== undefined && !message.method && pending.has(message.id)) { const p = pending.get(message.id); pending.delete(message.id); message.error ? p.reject(Error(JSON.stringify(message.error))) : p.resolve(message.result) }
    for (const w of [...waiters]) if (w.test(message)) { waiters.splice(waiters.indexOf(w), 1); w.resolve(message) }
  }
  const send = value => { result.sends.push({ ms: ms(), ...value }); return new Promise((r, j) => child.stdin.write(JSON.stringify(value) + '\n', error => error ? j(error) : r())) }
  const rpc = (method, params) => new Promise((resolve, reject) => { const id = ++nextId, timer = setTimeout(() => { pending.delete(id); reject(Error('rpc-timeout: ' + method)) }, 10000); pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value) }, reject: error => { clearTimeout(timer); reject(error) } }); send({ id, method, params }).catch(reject) })
  const waitFor = (test, timeout = 10000) => {
    const old = result.events.find(test); if (old) return Promise.resolve(old)
    return new Promise((resolve, reject) => { const w = { test, resolve: value => { clearTimeout(timer); resolve(value) } }, timer = setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) waiters.splice(i, 1); reject(Error('event-timeout')) }, timeout); waiters.push(w) })
  }
  const snapshot = async label => {
    const files = {}
    for (const file of Object.keys(initial)) { let content; try { content = await readFile(path(file), 'utf8') } catch (error) { if (error.code !== 'ENOENT') throw error; content = null } files[file] = { content, sha256: content === null ? null : sha(content) } }
    const value = { label, ms: ms(), files }; result.effects.push(value); return value
  }
  const patch = stage => operations[stage - 1].patch
  let approvals = 0
  const handleRequest = async message => {
    if (message.method !== 'item/fileChange/requestApproval') { await send({ id: message.id, error: { code: -32601, message: 'unsupported by bounded spike' } }); throw Error('unexpected-native-request: ' + message.method) }
    approvals++
    result.approvals.push({ ms: ms(), ...structuredClone(message) })
    const p = message.params
    const allowedCalls = ['call_' + name + '_1_1', 'call_' + name + '_1_2', 'call_' + name + '_2_1']
    if (p.threadId !== nativeThread || !allowedCalls.includes(p.itemId) || p.grantRoot != null) throw Error('approval-scope-mismatch')
    const updates = result.events.filter(e => ['item/started', 'item/fileChange/patchUpdated'].includes(e.method) && e.params?.threadId === p.threadId && e.params?.turnId === p.turnId && (e.params?.item?.id === p.itemId || e.params?.itemId === p.itemId))
    const changes = updates.flatMap(e => e.params?.item?.changes ?? e.params?.changes ?? [])
    result.approvals.at(-1).announcedChanges = changes
    const expected = operations[approvals - 1]?.changes
    const key = change => resolve(change.path).toLowerCase() + '|' + (typeof change.kind === 'string' ? change.kind : change.kind.type)
    if (!expected || changes.length !== expected.length || JSON.stringify(changes.map(key).sort()) !== JSON.stringify(expected.map(key).sort()) || changes.some(c => c.kind.move_path != null)) throw Error('unexpected-file-or-kind-in-operation')
    result.approvals.at(-1).exactAnnouncedScopeBeforeDecision = true
    await snapshot('before-decision-' + approvals)
    const decision = approvals === 1 ? 'accept' : 'decline'
    result.approvals.at(-1).decision = decision
    await send({ id: message.id, result: { decision } })
  }
  const server = createServer(async (request, response) => {
    try {
      if (request.url === '/health') { response.writeHead(200); response.end('loopback-only'); return }
      if (request.url !== '/v1/responses' || request.method !== 'POST') { response.writeHead(404); response.end(); return }
      let body = ''; for await (const chunk of request) { body += chunk; if (body.length > 4000000) throw Error('request-too-large') }
      const json = JSON.parse(body); requestInTurn++
      const tools = json.tools ?? []
      result.requests.push({ ms: ms(), turn: activeTurn, requestInTurn, authorizationPresent: Object.hasOwn(request.headers, 'authorization'), tools: tools.map(t => ({ type: t.type, name: t.name })), applyPatchSpec: tools.find(t => t.name === 'apply_patch') ?? null, input: json.input?.filter(i => ['function_call', 'function_call_output', 'custom_tool_call', 'custom_tool_call_output'].includes(i.type)) })
      const mustPatch = requestInTurn === 1 || mode === 'accept-repeat-decline' && requestInTurn === 2
      if (!mustPatch) { sse(response, finalItem(name + '_' + activeTurn)); return }
      const text = patch(requestInTurn), call = 'call_' + name + '_' + activeTurn + '_' + requestInTurn
      const tool = tools.find(t => t.name === 'apply_patch')
      result.requests.at(-1).scriptedOperation = { callId: call, changes: operations[requestInTurn - 1].changes, patch: text, offered: !!tool }
      // Si absent, une tentative synthétique constate seulement le refus du runner, sans effet implicite.
      const item = tool?.type === 'function' ? { type: 'function_call', id: 'fc_' + call, call_id: call, name: 'apply_patch', arguments: JSON.stringify({ input: text }) } : { type: 'custom_tool_call', id: 'fc_' + call, call_id: call, name: 'apply_patch', input: text }
      sse(response, item)
    } catch (error) { fatal = error; response.writeHead(500); response.end('simulation-failed') }
  })
  await new Promise(r => server.listen(0, '127.0.0.1', r))
  const port = server.address().port
  const settings = ['model="gpt-5.4"', 'model_provider="approval_spike"', 'model_providers.approval_spike.name="Approval spike loopback simulation"', `model_providers.approval_spike.base_url="http://127.0.0.1:${port}/v1"`, 'model_providers.approval_spike.wire_api="responses"', 'model_providers.approval_spike.requires_openai_auth=false', 'model_providers.approval_spike.supports_websockets=false', 'model_providers.approval_spike.request_max_retries=0', 'model_providers.approval_spike.stream_max_retries=0', 'features.shell_tool=false', 'features.apps=false', 'features.plugins=false', 'features.multi_agent=false', 'features.respect_system_proxy=false', 'features.enable_request_compression=false', 'web_search="disabled"', 'mcp_servers={}', 'shell_environment_policy.inherit="none"', 'cli_auth_credentials_store="file"', 'project_doc_max_bytes=0']
  try {
    result.loopbackSelfCheck = await (await fetch(`http://127.0.0.1:${port}/health`)).text()
    child = spawn(exe, ['app-server', '--listen', 'stdio://', ...settings.flatMap(v => ['-c', v])], { cwd: work, env: env(home), shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    child.stdout.setEncoding('utf8')
    child.stdout.on('data', data => { buffer += data; while (buffer.includes('\n')) { const end = buffer.indexOf('\n'), line = buffer.slice(0, end); buffer = buffer.slice(end + 1); if (!line.trim()) continue; try { const message = JSON.parse(line); recorded(message); if (message.method && Object.hasOwn(message, 'id')) handleRequest(message).catch(error => { fatal = error }) } catch (error) { fatal = error } } })
    child.stderr.on('data', b => { if (result.stderr.join('').length < 15000) result.stderr.push(b.toString()) })
    child.on('error', error => { fatal = error })
    await rpc('initialize', { clientInfo: { name: 'madness-approval-spike', version: '1.6.0' }, capabilities: { experimentalApi: true } })
    await send({ method: 'initialized', params: {} })
    const thread = await rpc('thread/start', { cwd: work, model: 'gpt-5.4', modelProvider: 'approval_spike', sandbox: 'read-only', approvalPolicy, approvalsReviewer: 'user', ephemeral: true, experimentalRawEvents: true, developerInstructions: 'Banc synthétique : aucune commande shell ; seuls les patches proposés par le fournisseur loopback sur son fichier témoin sont examinés.' })
    nativeThread = thread.thread.id
    result.threadSettings = { sandbox: thread.sandbox, approvalPolicy: thread.approvalPolicy, approvalsReviewer: thread.approvalsReviewer }
    const started = await rpc('turn/start', { threadId: nativeThread, cwd: work, input: [{ type: 'text', text: 'Proposer la modification synthétique bornée.' }] })
    await waitFor(e => e.method === 'turn/completed' && e.params?.turn?.id === started.turn.id, 12000)
    await sleep(250)
    await snapshot('after-turn-1')
    if (fatal) throw fatal
  } catch (error) { result.failure = String(error?.stack ?? error) }
  finally {
    result.nativeStopped = await stop(child)
    for (const p of pending.values()) p.reject(Error('spike-ended'))
    server.closeAllConnections(); await new Promise(r => server.close(r))
    await snapshot('after-native-stop')
    result.checks = { approvalCount: result.approvals.length, authorizationPresent: result.requests.some(x => x.authorizationPresent), rawOutputs: result.events.filter(e => e.method === 'rawResponseItem/completed' && ['function_call_output', 'custom_tool_call_output'].includes(e.params?.item?.type)), fileItems: result.events.filter(e => ['item/started', 'item/completed', 'item/fileChange/patchUpdated'].includes(e.method) && (e.params?.item?.type === 'fileChange' || e.method === 'item/fileChange/patchUpdated')), resolved: result.events.filter(e => e.method === 'serverRequest/resolved'), turns: result.events.filter(e => e.method === 'turn/completed').map(e => e.params.turn) }
    report.scenarios.push(result)
    console.log(JSON.stringify({ scenario: name, failure: result.failure, approvals: result.approvals.map(a => ({ id: a.id, params: a.params, decision: a.decision, announcedChanges: a.announcedChanges })), effect: result.effects.at(-1), checks: result.checks, nativeStopped: result.nativeStopped }))
  }
}
try {
  await mkdir(base, { recursive: true }); root = await mkdtemp(join(base, 'protocol-file-kinds-temp-')); await mkdir(join(root, 'codex-home'))
  report.nativeSha256 = sha(await readFile(exe)); if (report.nativeSha256 !== expectedNativeSha) throw Error('unexpected-native-binary')
  report.nativeVersion = (await command(['--version'], root)).trim()
  const exported = join(root, 'schema'); await command(['app-server', 'generate-json-schema', '--experimental', '--out', exported], root)
  for (const file of ['CommandExecutionRequestApprovalParams.json', 'CommandExecutionRequestApprovalResponse.json', 'FileChangeRequestApprovalParams.json', 'FileChangeRequestApprovalResponse.json', 'PermissionsRequestApprovalParams.json', 'PermissionsRequestApprovalResponse.json', 'v2/ServerRequestResolvedNotification.json', 'v2/FileChangePatchUpdatedNotification.json']) {
    const bytes = await readFile(join(exported, file)), schema = JSON.parse(bytes)
    report.schemas[file] = { sha256: sha(bytes), required: schema.required, properties: schema.properties, decisions: schema.definitions?.FileChangeApprovalDecision ?? schema.definitions?.CommandExecutionApprovalDecision ?? null }
  }
  await scenario('add', 'accept-repeat-decline', 'on-request')
  await scenario('delete', 'accept-repeat-decline', 'on-request')
  await scenario('multi', 'accept-repeat-decline', 'on-request')
} catch (error) { report.failure = String(error?.stack ?? error) }
finally {
  if (root) {
    if (dirname(resolve(root)) !== resolve(base) || !root.split(/[\\/]/).at(-1).startsWith('protocol-file-kinds-temp-')) throw Error('unsafe-cleanup-target')
    if (report.scenarios.some(s => !s.nativeStopped)) throw Error('native-stop-unconfirmed-preserve-profile')
    await rm(root, { recursive: true, force: true }); report.cleanup = true
  }
  report.endedAt = new Date().toISOString()
  await writeFile(join(base, 'protocol-file-kinds.json'), JSON.stringify(report, null, 2) + '\n')
  console.log(JSON.stringify({ report: join(base, 'protocol-file-kinds.json'), failure: report.failure, cleanup: report.cleanup, scriptSha256: report.scriptSha256, scenarios: report.scenarios.map(s => ({ name: s.name, failure: s.failure, approvals: s.approvals.length, effect: s.effects.at(-1)?.files, nativeStopped: s.nativeStopped })) }, null, 2))
}
