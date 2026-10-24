import assert from 'node:assert/strict'
import { test } from 'node:test'
import { EventEmitter } from 'node:events'
import { PassThrough } from 'node:stream'
const native = await import('../src/adapters/codex/dialogue.ts').catch(() => null)
function server(options = {}) {
  const child = new EventEmitter(); child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough()
  const requests = []; let data = '', turn = 0
  const emit = value => child.stdout.write(JSON.stringify(value) + '\n')
  child.stdin.on('data', chunk => {
    data += chunk
    while (data.includes('\n')) {
      const end = data.indexOf('\n'), message = JSON.parse(data.slice(0, end)); data = data.slice(end + 1); requests.push(message)
      const reply = result => emit({ id: message.id, result })
      if (message.method === 'initialize') reply({})
      if (message.method === 'model/list') reply({ data: [{ model: 'test-model', isDefault: true, hidden: false }] })
      if (message.method === 'thread/start') reply({ thread: { id: 'thread-1' }, modelProvider: 'openai_chatgpt_plan', model: 'test-model', sandbox: { type: 'readOnly' }, approvalPolicy: 'never' })
      if (message.method === 'turn/start') {
        turn++; reply({ turn: { id: 'turn-' + turn, status: 'inProgress' } })
        if (options.unsupported) emit({ id: 'bad-request', method: 'item/tool/requestUserInput', params: { threadId: 'thread-1', turnId: 'turn-' + turn } })
        else if (turn === 1) for (const [id, kind] of [[100, 'agent'], [101, 'config']]) emit({ id, method: 'item/tool/call', params: { threadId: options.foreign ? 'foreign' : 'thread-1', turnId: 'turn-' + turn, callId: 'call-' + id, tool: 'bmad_resolve', arguments: { kind } } })
        else complete()
      }
      if (message.id === 101 && message.result) complete()
    }
  })
  function complete() { emit({ method: 'item/completed', params: { threadId: 'thread-1', turnId: options.badTurn ? 'foreign' : 'turn-' + turn, item: { type: 'agentMessage', id: 'answer-' + turn, text: turn === 1 ? '📊 Mary\nBP · MR · CB' : 'Voici ma réponse.' } } }); emit({ method: 'turn/completed', params: { threadId: 'thread-1', turn: { id: 'turn-' + turn, status: options.failed ? 'failed' : 'completed' } } }) }
  return { child, requests }
}
test('injection native skill et outils bornés produisent accueil puis réponse sur le même thread', async () => {
  assert.ok(native, 'Le dialogue natif doit exister')
  const s = server(), rpc = new native.DialogueRpc(s.child, new AbortController().signal, 300)
  const resolved = [], activity = []
  const session = await native.startDialogueProtocol(rpc, { cwd: 'C:/isolated', profile: { rootPath: 'C:/project', skillPath: 'C:/project/.agents/skills/bmad-agent-analyst/SKILL.md' }, signal: new AbortController().signal, activity: text => activity.push(text), resolve: async kind => { resolved.push(kind); return '{}' }, read: async () => '' }, 500)
  let accepted = 0
  assert.match(await session.turn(null, async () => { accepted++ }), /Mary/)
  assert.equal(await session.turn('Bonjour', async () => { accepted++ }), 'Voici ma réponse.')
  assert.deepEqual(resolved, ['agent', 'config']); assert.equal(accepted, 2)
  const turns = s.requests.filter(r => r.method === 'turn/start')
  assert.equal(turns[0].params.input[0].type, 'skill'); assert.equal(turns[0].params.input[0].name, 'bmad-agent-analyst')
  assert.deepEqual(turns[1].params.input, [{ type: 'text', text: 'Bonjour' }]); assert.equal(turns[1].params.threadId, turns[0].params.threadId)
  const started = s.requests.find(r => r.method === 'thread/start')
  assert.equal(started.params.sandbox, 'read-only'); assert.equal(started.params.approvalPolicy, 'never'); assert.equal(started.params.dynamicTools.length, 3)
  rpc.dispose()
})
test('demandes structurées, contexte étranger et fin native échouée ne sont jamais un succès', async () => {
  assert.ok(native)
  for (const option of [{ unsupported: true }, { foreign: true }, { failed: true }, { badTurn: true }]) {
    const s = server(option), rpc = new native.DialogueRpc(s.child, new AbortController().signal, 100)
    try {
      const session = await native.startDialogueProtocol(rpc, { cwd: 'C:/isolated', profile: { rootPath: 'C:/project', skillPath: 'Mary' }, signal: new AbortController().signal, activity: () => {}, resolve: async () => '{}', read: async () => '' }, 150)
      await assert.rejects(session.turn(null, async () => {}), error => ['UNSUPPORTED_INTERACTION', 'PROVIDER_FAILED', 'CONTEXT_MISMATCH'].includes(error.code))
    } finally { rpc.dispose() }
  }
})
