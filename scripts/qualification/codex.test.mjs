import test from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Rpc, probe, childEnvironment, cleanWorkspace, stop, createWorkspace } from './codex.mjs';

// Ces fixtures sont synthétiques : elles ne prouvent aucun accès Codex réel.
function fixture(overrides = {}) {
  const child = Object.assign(new EventEmitter(), { stdin: new PassThrough(), stdout: new PassThrough() });
  const sent = [];
  const emit = (message) => child.stdout.write(JSON.stringify(message) + '\n');
  let buffer = '';
  child.stdin.on('data', (chunk) => {
    buffer += chunk;
    while (buffer.includes('\n')) {
      const end = buffer.indexOf('\n');
      const request = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1);
      sent.push(request);
      if (!Object.hasOwn(request, 'id') || !request.method) continue;
      if (overrides[request.method]) { overrides[request.method](request, emit); continue; }
      const results = {
        initialize: { codexHome: 'unused', platformFamily: 'windows', platformOs: 'windows', userAgent: 'fixture' },
        'account/read': { account: { type: 'chatgpt', email: 'secret@example.test', planType: 'pro' }, requiresOpenaiAuth: true },
        'model/list': { data: [{ id: 'fixture-model', model: 'fixture-model', isDefault: true, hidden: false }], nextCursor: null },
        'thread/start': { thread: { id: 'thread-fixture' }, model: 'fixture-model', modelProvider: 'openai', approvalPolicy: 'never', sandbox: { type: 'readOnly' } },
      };
      if (request.method === 'turn/start') {
        // Les notifications peuvent précéder l'accusé de turn/start.
        emit({ method: 'item/completed', params: { threadId: 'thread-fixture', turnId: 'turn-fixture', completedAtMs: 1, item: { id: 'item-fixture', type: 'agentMessage', text: 'MADNESS_CODEX_OK', phase: 'final_answer' } } });
        emit({ method: 'turn/completed', params: { threadId: 'thread-fixture', turn: { id: 'turn-fixture', status: 'completed', items: [], error: null } } });
        emit({ id: request.id, result: { turn: { id: 'turn-fixture', status: 'inProgress', items: [], error: null } } });
      } else emit({ id: request.id, result: results[request.method] ?? {} });
    }
  });
  return { child, sent, emit, rpc: new Rpc(child, 50) };
}

test('JSONL reconstitue UTF-8 fragmenté et corrèle les réponses hors ordre', async () => {
  const child = Object.assign(new EventEmitter(), { stdin: new PassThrough(), stdout: new PassThrough() });
  const rpc = new Rpc(child, 100);
  const first = rpc.call('first', {}), second = rpc.call('second', {});
  const bytes = Buffer.from('{"id":2,"result":"é"}\n{"id":1,"result":"un"}\n');
  const split = bytes.indexOf(Buffer.from('é')) + 1;
  child.stdout.write(bytes.subarray(0, split)); child.stdout.write(bytes.subarray(split));
  assert.equal(await first, 'un'); assert.equal(await second, 'é');
});

test('ChatGPT vérifié permet une réponse et une fin corrélées sans conserver identité ou texte', async () => {
  const f = fixture(); const result = await probe(f.rpc, '/empty', () => {}, { turnMs: 100 });
  assert.equal(result.completed, true); assert.equal(result.responseMatched, true);
  assert.equal(result.authMode, 'chatgpt');
  assert.equal(JSON.stringify(result).includes('secret@example.test'), false);
  assert.equal(JSON.stringify(result).includes('MADNESS_CODEX_OK'), false);
  assert.deepEqual(f.sent.find((r) => r.method === 'initialize').params.clientInfo, { name: 'madness', title: 'Madness', version: 'qualification-1' });
  const thread = f.sent.find((r) => r.method === 'thread/start');
  assert.equal(thread.params.sandbox, 'read-only'); assert.equal(thread.params.ephemeral, true);
});

test('conserve réponse et fin groupées dans un seul chunk après l’accusé du tour', async () => {
  const f = fixture({ 'turn/start': (r, emit) => {
    emit({ id: r.id, result: { turn: { id: 'batched-turn' } } });
    setImmediate(() => f.child.stdout.write([
      { method: 'item/completed', params: { threadId: 'thread-fixture', turnId: 'batched-turn', completedAtMs: 1, item: { type: 'agentMessage', text: 'MADNESS_CODEX_OK' } } },
      { method: 'turn/completed', params: { threadId: 'thread-fixture', turn: { id: 'batched-turn', status: 'completed', items: [], error: null } } },
    ].map((message) => JSON.stringify(message)).join('\n') + '\n'));
  } });
  const result = await probe(f.rpc, '/empty', () => {}, { turnMs: 100 });
  assert.equal(result.completed, true); assert.equal(result.responseMatched, true);
});

for (const type of ['apiKey', 'amazonBedrock', 'unknown']) {
  test(`refuse ${type} avant catalogue et inférence`, async () => {
    const f = fixture({ 'account/read': (r, emit) => emit({ id: r.id, result: { account: { type, email: 'secret' }, requiresOpenaiAuth: true } }) });
    await assert.rejects(probe(f.rpc, '/empty', () => {}), { code: 'auth_not_chatgpt' });
    assert.equal(f.sent.some((r) => ['model/list', 'thread/start', 'turn/start'].includes(r.method)), false);
  });
}

test('profil vide attend la connexion corrélée puis relit le compte', async () => {
  let reads = 0, loginShown = false;
  const f = fixture({
    'account/read': (r, emit) => emit({ id: r.id, result: { account: ++reads === 1 ? null : { type: 'chatgpt', email: null, planType: 'pro' }, requiresOpenaiAuth: true } }),
    'account/login/start': (r, emit) => {
      emit({ id: r.id, result: { type: 'chatgpt', loginId: 'login-fixture', authUrl: 'https://auth.openai.com/authorize?state=SECRET' } });
      emit({ method: 'account/login/completed', params: { loginId: 'other-login', success: false } });
      emit({ method: 'account/login/completed', params: { loginId: 'login-fixture', success: true, error: null } });
    },
  });
  const result = await probe(f.rpc, '/empty', (url) => { loginShown = url.includes('state=SECRET'); }, { loginMs: 100, turnMs: 100 });
  assert.equal(reads, 2); assert.equal(loginShown, true); assert.equal(result.completed, true);
  assert.equal(JSON.stringify(result).includes('SECRET'), false);
});

test('échec de connexion ne lance aucun tour et ne révèle pas l’erreur native', async () => {
  const f = fixture({
    'account/read': (r, emit) => emit({ id: r.id, result: { account: null, requiresOpenaiAuth: true } }),
    'account/login/start': (r, emit) => {
      emit({ id: r.id, result: { type: 'chatgpt', loginId: 'login', authUrl: 'https://auth.openai.com/' } });
      emit({ method: 'account/login/completed', params: { loginId: 'login', success: false, error: 'SECRET' } });
    },
  });
  await assert.rejects(probe(f.rpc, '/empty', () => {}), { code: 'login_failed', message: 'login_failed' });
  assert.equal(f.sent.some((r) => r.method === 'turn/start'), false);
});

test('une fin d’un autre tour ou un accusé seul ne constitue pas la preuve', async () => {
  const f = fixture({ 'turn/start': (r, emit) => {
    emit({ id: r.id, result: { turn: { id: 'wanted' } } });
    emit({ method: 'turn/completed', params: { threadId: 'other', turn: { id: 'wanted', status: 'completed' } } });
    emit({ method: 'turn/completed', params: { threadId: 'thread-fixture', turn: { id: 'other', status: 'completed' } } });
  } });
  await assert.rejects(probe(f.rpc, '/empty', () => {}, { turnMs: 15 }), { code: 'timeout' });
  assert.equal(f.sent.filter((r) => r.method === 'turn/start').length, 1);
});

test('le délai global inclut l’attente de l’accusé du tour', async () => {
  const f = fixture({ 'turn/start': (r, emit) => setTimeout(() => {
    emit({ method: 'item/completed', params: { threadId: 'thread-fixture', turnId: 'slow', completedAtMs: 1, item: { type: 'agentMessage', text: 'MADNESS_CODEX_OK' } } });
    emit({ method: 'turn/completed', params: { threadId: 'thread-fixture', turn: { id: 'slow', status: 'completed', items: [], error: null } } });
    emit({ id: r.id, result: { turn: { id: 'slow' } } });
  }, 20) });
  await assert.rejects(probe(f.rpc, '/empty', () => {}, { turnMs: 5 }), { code: 'timeout' });
});

for (const status of ['failed', 'interrupted', 'completed']) {
  test(`refuse ${status} sans réponse finale corrélée`, async () => {
    const f = fixture({ 'turn/start': (r, emit) => {
      emit({ id: r.id, result: { turn: { id: 'turn-fixture' } } });
      emit({ method: 'turn/completed', params: { threadId: 'thread-fixture', turn: { id: 'turn-fixture', status, items: [], error: null } } });
    } });
    await assert.rejects(probe(f.rpc, '/empty', () => {}), { code: status === 'completed' ? 'response_missing' : 'turn_unsuccessful' });
  });
}

test('erreur JSON-RPC expurgée et coupure n’entraînent aucun réessai', async () => {
  const f = fixture({ 'model/list': (r, emit) => emit({ id: r.id, error: { code: -1, message: 'Bearer SECRET', data: { email: 'private' } } }) });
  await assert.rejects(probe(f.rpc, '/empty', () => {}), { code: 'rpc_error', message: 'rpc_error' });
  const g = fixture({ 'account/read': () => {} });
  const pending = probe(g.rpc, '/empty', () => {}); queueMicrotask(() => g.child.emit('close', 1));
  await assert.rejects(pending, { code: 'process_closed' });
});

test('demande serveur imprévue refusée avant inférence', async () => {
  const f = fixture({ 'model/list': (_r, emit) => emit({ id: 'server-id', method: 'item/commandExecution/requestApproval', params: { command: 'SECRET' } }) });
  await assert.rejects(probe(f.rpc, '/empty', () => {}), { code: 'unexpected_request' });
  assert.equal(f.sent.find((r) => r.id === 'server-id').error.code, -32601);
  assert.equal(f.sent.some((r) => r.method === 'turn/start'), false);
});

test('activité outil inattendue arrête le témoin', async () => {
  const f = fixture({ 'turn/start': (r, emit) => {
    emit({ id: r.id, result: { turn: { id: 'turn-fixture' } } });
    emit({ method: 'item/started', params: { threadId: 'thread-fixture', turnId: 'turn-fixture', item: { type: 'commandExecution', command: 'SECRET' } } });
  } });
  await assert.rejects(probe(f.rpc, '/empty', () => {}), { code: 'unexpected_effect' });
});

test('JSON invalide et ligne excessive échouent avec un code fixe', async () => {
  for (const value of ['secret-not-json\n', 'x'.repeat(1_048_577)]) {
    const f = fixture({ 'initialize': () => {} }); const result = f.rpc.call('initialize', {});
    f.child.stdout.write(value);
    await assert.rejects(result, { code: 'protocol_error', message: 'protocol_error' });
  }
});

test('environnement enfant isole identité/configuration et garde réseau sans imprimer ses valeurs', () => {
  const source = { PATH: 'path', USERPROFILE: 'user', HTTPS_PROXY: 'http://u:SECRET@proxy', SSL_CERT_FILE: 'cert', OPENAI_API_KEY: 'SECRET', CODEX_ACCESS_TOKEN: 'SECRET', CODEX_HOME: 'original', NODE_OPTIONS: '--require SECRET' };
  const env = childEnvironment(source, '/temporary');
  assert.equal(env.CODEX_HOME, '/temporary'); assert.equal(env.HTTPS_PROXY, source.HTTPS_PROXY); assert.equal(env.SSL_CERT_FILE, 'cert');
  assert.equal(env.OPENAI_API_KEY, undefined); assert.equal(env.CODEX_ACCESS_TOKEN, undefined); assert.equal(env.NODE_OPTIONS, undefined);
  assert.equal(source.CODEX_HOME, 'original');
  assert.throws(() => childEnvironment({ NODE_TLS_REJECT_UNAUTHORIZED: '0' }, '/temp'), { code: 'tls_disabled' });
});

test('nettoyage refuse une racine arbitraire et ne supprime que son espace temporaire', async () => {
  const base = await realpath(tmpdir()); const root = await mkdtemp(join(base, 'madness-codex-'));
  const other = await mkdtemp(join(base, 'not-madness-'));
  try {
    await mkdir(join(root, 'home')); await cleanWorkspace(root, base);
    await assert.rejects(realpath(root), { code: 'ENOENT' });
    await assert.rejects(cleanWorkspace(other, base), { code: 'unsafe_cleanup' });
    assert.equal(await realpath(other), other);
    await assert.rejects(cleanWorkspace(base, base), { code: 'unsafe_cleanup' });
  } finally { await rm(other, { recursive: true, force: true }); await rm(root, { recursive: true, force: true }); }
});

test('l’arrêt ferme stdin et confirme la fermeture d’un enfant coopératif sans taskkill', async () => {
  const child = spawn(process.execPath, ['-e', 'process.stdin.resume(); process.stdin.on("end", () => process.exit(0));'], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  try { assert.equal(await stop(child), true); assert.equal(child.exitCode, 0); }
  finally { if (child.exitCode === null) child.kill(); }
});

test('l’arrêt ne confond pas wrapper déjà sorti et fermeture des pipes', async () => {
  const child = Object.assign(new EventEmitter(), { exitCode: 0, signalCode: null, stdin: new PassThrough(), stdout: new PassThrough(), stderr: new PassThrough() });
  let closed = false; child.once('close', () => { closed = true; });
  const timer = setTimeout(() => child.emit('close', 0), 10);
  try { assert.equal(await stop(child), true); assert.equal(closed, true); }
  finally { clearTimeout(timer); }
});

test('l’arrêt reconnaît un enfant déjà fermé avec stderr ignoré', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const child = spawn(process.execPath, ['-e', 'process.stdout.write("version-fixture");'], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  child.stdout.resume(); await new Promise((r) => child.once('close', r));
  let result;
  const stopping = stop(child).then((value) => { result = value; });
  await new Promise(setImmediate);
  const immediate = result;
  t.mock.timers.tick(10_000); await new Promise(setImmediate); t.mock.timers.tick(10_000); await stopping;
  assert.equal(immediate, true);
});

test('TEMP sous le dépôt est refusé avant toute création de profil', async () => {
  const base = await realpath(tmpdir()), root = await mkdtemp(join(base, 'madness-codex-'));
  const repo = join(root, 'repo'), inside = join(repo, 'tmp');
  await mkdir(inside, { recursive: true });
  try {
    await assert.rejects(createWorkspace(inside, repo), { code: 'temporary_root_in_repository' });
    assert.deepEqual(await readdir(inside), []);
    await assert.rejects(createWorkspace(repo, repo), { code: 'temporary_root_in_repository' });
  } finally { await cleanWorkspace(root, base); }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  test(`${signal} pendant la préparation interdit le lancement du fournisseur`, async () => {
    const base = await realpath(tmpdir()), root = await mkdtemp(join(base, 'madness-codex-'));
    const script = join(root, 'repo/scripts/qualification/codex.mjs'), npm = join(root, 'appdata/npm/node_modules/@openai/codex/bin');
    const ready = join(root, 'ready'), release = join(root, 'release'), provider = join(root, 'provider-started'), temporary = join(root, 'temporary');
    await mkdir(join(root, 'repo/scripts/qualification'), { recursive: true }); await mkdir(npm, { recursive: true }); await mkdir(temporary);
    await writeFile(script, await readFile(new URL('./codex.mjs', import.meta.url)));
    await writeFile(join(npm, 'codex.js'), `const fs=require('node:fs'); if(process.argv.includes('--version')){ fs.writeFileSync(${JSON.stringify(ready)},'ready'); const timer=setInterval(()=>{ if(fs.existsSync(${JSON.stringify(release)})){clearInterval(timer);console.log('codex-cli 0.0.0-fixture');}},5); }else{ fs.writeFileSync(${JSON.stringify(provider)},'started'); }`);
    const source = `import {existsSync,writeFileSync} from 'node:fs'; process.argv=['node',${JSON.stringify(script)},'--live']; const timer=setInterval(()=>{if(existsSync(${JSON.stringify(ready)})){clearInterval(timer);process.emit(${JSON.stringify(signal)});writeFileSync(${JSON.stringify(release)},'go');}},5); await import(${JSON.stringify(pathToFileURL(script).href)});clearInterval(timer);`;
    const child = spawn(process.execPath, ['--input-type=module', '-e', source], { windowsHide: true, env: { ...process.env, APPDATA: join(root, 'appdata'), TEMP: temporary, TMP: temporary }, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.resume(); child.stderr.resume();
    const timer = setTimeout(() => child.kill(), 5000);
    try {
      await new Promise((r) => child.once('close', r));
      assert.equal(child.exitCode, 1);
      await assert.rejects(readFile(provider), { code: 'ENOENT' });
      const report = JSON.parse(await readFile(join(root, 'repo/_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-codex/profile.json'), 'utf8'));
      assert.equal(report.failureCode, 'cancelled'); assert.equal(report.outcome, 'unknown'); assert.equal(report.cleanup, true);
    } finally { clearTimeout(timer); if (child.exitCode === null) child.kill(); await cleanWorkspace(root, base); }
  });
}

test('un arrêt non confirmé libère les handles du parent sans annoncer arrêt ni nettoyage', async () => {
  const source = `
    import {EventEmitter} from 'node:events'; import {PassThrough} from 'node:stream'; import {mock} from 'node:test';
    import {stop} from ${JSON.stringify(new URL('./codex.mjs', import.meta.url).href)};
    const handle=setInterval(()=>{},1000);
    const child=Object.assign(new EventEmitter(),{exitCode:0,signalCode:null,stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough(),unref:()=>handle.unref()});
    mock.timers.enable({apis:['setTimeout']}); const evidence={}; const stopping=stop(child,evidence);
    mock.timers.tick(10000); await new Promise(setImmediate); mock.timers.tick(10000);
    const stopped=await stopping; mock.timers.reset();
    console.log(JSON.stringify({stopped,stdinDestroyed:child.stdin.destroyed,stdoutDestroyed:child.stdout.destroyed,stderrDestroyed:child.stderr.destroyed,outcome:stopped?'success':'unknown',cleanup:false}));
    process.exitCode=1;
  `;
  const child = spawn(process.execPath, ['--input-type=module', '-e', source], { windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
  let output = '', timedOut = false; child.stdout.on('data', (data) => { output += data; });
  const timer = setTimeout(() => { timedOut = true; child.kill(); }, 2000);
  try {
    await new Promise((r) => child.once('close', r));
    assert.equal(timedOut, false); assert.equal(child.exitCode, 1);
    assert.deepEqual(JSON.parse(output), { stopped: false, stdinDestroyed: true, stdoutDestroyed: true, stderrDestroyed: true, outcome: 'unknown', cleanup: false });
  } finally { clearTimeout(timer); if (child.exitCode === null) child.kill(); }
});
