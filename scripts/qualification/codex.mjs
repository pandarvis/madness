import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, realpath, lstat, rm, writeFile, access } from 'node:fs/promises';
import { tmpdir, release } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const fail = (code) => Object.assign(new Error(code), { code });
const marker = 'MADNESS_CODEX_OK';
const networkKeys = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY', 'SSL_CERT_FILE', 'SSL_CERT_DIR', 'NODE_EXTRA_CA_CERTS', 'NODE_USE_SYSTEM_CA'];
const allowedKeys = ['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH', 'APPDATA', 'LOCALAPPDATA', ...networkKeys];
export async function createWorkspace(base, repository) {
  const actual = await realpath(base), project = await realpath(repository), distance = relative(project, actual);
  if (!distance || (!isAbsolute(distance) && distance !== '..' && !distance.startsWith(`..${sep}`))) throw fail('temporary_root_in_repository');
  return mkdtemp(join(actual, 'madness-codex-'));
}
export function childEnvironment(source, home) {
  if (source.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw fail('tls_disabled');
  const env = Object.fromEntries(Object.entries(source).filter(([key]) => allowedKeys.includes(key.toUpperCase())));
  return { ...env, CODEX_HOME: home };
}

// Aucun flux natif n'est écrit dans les preuves ; les erreurs ne portent qu'un code fixe.
export class Rpc {
  constructor(child, timeoutMs = 30_000) {
    this.child = child; this.timeoutMs = timeoutMs; this.nextId = 0; this.pending = new Map(); this.queue = []; this.buffer = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      if (this.error) return;
      this.buffer += chunk;
      if (this.buffer.length > 1_048_576) return this.abort('protocol_error');
      while (this.buffer.includes('\n') && !this.error) {
        const end = this.buffer.indexOf('\n'), line = this.buffer.slice(0, end); this.buffer = this.buffer.slice(end + 1);
        if (!line.trim()) continue;
        try { this.receive(JSON.parse(line)); } catch { this.abort('protocol_error'); }
      }
    });
    child.on('error', () => this.abort('process_error'));
    child.on('close', () => this.abort('process_closed'));
    child.stdin.on('error', () => this.abort('process_closed'));
  }
  abort(code) {
    this.error ??= fail(code);
    for (const pending of this.pending.values()) pending.reject(this.error);
    this.pending.clear(); this.waiter?.reject(this.error);
  }
  receive(message) {
    if (!message || typeof message !== 'object') throw fail('protocol_error');
    if (message.method && Object.hasOwn(message, 'id')) {
      this.child.stdin.write(JSON.stringify({ id: message.id, error: { code: -32601, message: 'Qualification : demande refusée' } }) + '\n');
      return this.abort('unexpected_request');
    }
    if (Object.hasOwn(message, 'id')) {
      const pending = this.pending.get(message.id); if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(fail('rpc_error'));
      else if (Object.hasOwn(message, 'result')) pending.resolve(message.result);
      else pending.reject(fail('protocol_error'));
      return;
    }
    if (message.method === 'account/updated' && this.authVerified && message.params?.authMode !== 'chatgpt') return this.abort('auth_not_chatgpt');
    if (message.method === 'error') return this.abort('server_error');
    if (message.method === 'item/started' && !['userMessage', 'agentMessage', 'reasoning'].includes(message.params?.item?.type)) return this.abort('unexpected_effect');
    if (!['account/login/completed', 'item/completed', 'turn/completed'].includes(message.method)) return;
    if (this.waiter?.matches(message)) { const waiter = this.waiter; this.waiter = null; waiter.resolve(message); }
    else { this.queue.push(message); if (this.queue.length > 512) this.abort('protocol_error'); }
  }
  async call(method, params, timeoutMs = this.timeoutMs) {
    if (this.error) throw this.error;
    const id = ++this.nextId;
    return this.timed((resolveCall, reject) => {
      this.pending.set(id, { resolve: resolveCall, reject });
      this.child.stdin.write(JSON.stringify({ id, method, params }) + '\n');
    }, timeoutMs, () => this.pending.delete(id));
  }
  notify(method) { this.child.stdin.write(JSON.stringify({ method, params: {} }) + '\n'); }
  async wait(matches, timeoutMs) {
    if (this.error) throw this.error;
    if (timeoutMs <= 0) throw fail('timeout');
    const index = this.queue.findIndex(matches); if (index >= 0) return this.queue.splice(index, 1)[0];
    return this.timed((resolveWait, reject) => { this.waiter = { matches, resolve: resolveWait, reject }; }, timeoutMs, () => { this.waiter = null; });
  }
  async timed(register, timeoutMs, cleanup) {
    let timer;
    try { return await new Promise((resolveTimed, reject) => { timer = setTimeout(() => reject(fail('timeout')), Math.max(1, timeoutMs)); register(resolveTimed, reject); }); }
    finally { clearTimeout(timer); cleanup(); }
  }
}

export async function probe(rpc, cwd, onLogin, { loginMs = 600_000, turnMs = 60_000, evidence = {} } = {}) {
  evidence.stage = 'initialize';
  await rpc.call('initialize', { clientInfo: { name: 'madness', title: 'Madness', version: 'qualification-1' } });
  rpc.notify('initialized'); evidence.initialized = true; evidence.stage = 'account';
  let account = await rpc.call('account/read', { refreshToken: false });
  evidence.profileInitiallyEmpty = account.account === null;
  if (account.account === null) {
    evidence.stage = 'login';
    const login = await rpc.call('account/login/start', { type: 'chatgpt' });
    if (login.type !== 'chatgpt' || typeof login.loginId !== 'string') throw fail('protocol_error');
    const url = new URL(login.authUrl);
    if (url.protocol !== 'https:' || !['auth.openai.com', 'chatgpt.com'].includes(url.hostname) || url.username || url.password) throw fail('login_url_invalid');
    onLogin(url.href);
    const done = await rpc.wait((m) => m.method === 'account/login/completed' && m.params?.loginId === login.loginId, loginMs);
    if (done.params.success !== true) throw fail('login_failed');
    account = await rpc.call('account/read', { refreshToken: false });
  }
  if (account.account?.type !== 'chatgpt' || account.requiresOpenaiAuth !== true) throw fail('auth_not_chatgpt');
  rpc.authVerified = true; evidence.authMode = 'chatgpt'; evidence.stage = 'catalog';
  const catalog = await rpc.call('model/list', {});
  const visible = catalog.data?.filter((m) => !m.hidden && typeof m.model === 'string');
  const model = visible?.find((m) => m.isDefault) ?? visible?.[0];
  if (!model || !/^[a-zA-Z0-9._:/-]{1,100}$/.test(model.model)) throw fail('model_missing');
  evidence.model = model.model; evidence.catalogObserved = true; evidence.stage = 'thread';
  const thread = await rpc.call('thread/start', { cwd, model: model.model, modelProvider: 'openai', sandbox: 'read-only', approvalPolicy: 'never', ephemeral: true, developerInstructions: 'Qualification technique. Réponds uniquement au message. Aucun outil, commande, fichier, navigation ou sous-agent.' });
  if (thread.modelProvider !== 'openai' || thread.model !== model.model || thread.sandbox?.type !== 'readOnly' || thread.approvalPolicy !== 'never' || !thread.thread?.id) throw fail('thread_policy_mismatch');
  evidence.readOnlyObserved = true; evidence.stage = 'turn';
  const deadline = Date.now() + turnMs;
  const started = await rpc.call('turn/start', { threadId: thread.thread.id, cwd, input: [{ type: 'text', text: `Réponds uniquement ${marker}, sans outil ni autre action.` }] }, turnMs);
  const turnId = started.turn?.id; if (!turnId) throw fail('protocol_error');
  evidence.turnAcknowledged = true; let responseMatched = false;
  for (;;) {
    const event = await rpc.wait((m) => m.params?.threadId === thread.thread.id && (m.method === 'turn/completed' ? m.params.turn?.id === turnId : m.method === 'item/completed' && m.params.turnId === turnId), deadline - Date.now());
    if (event.method === 'item/completed') {
      const item = event.params.item;
      if (item?.type === 'agentMessage' && item.text?.trim() === marker) responseMatched = true;
    } else {
      if (event.params.turn.status !== 'completed' || event.params.turn.error) throw fail('turn_unsuccessful');
      if (!responseMatched) throw fail('response_missing');
      return Object.assign(evidence, { stage: 'finished', responseMatched: true, completed: true });
    }
  }
}

export async function cleanWorkspace(root, base) {
  const actual = await realpath(root), parent = await realpath(base);
  if (actual !== resolve(root) || dirname(actual) !== parent || !/^madness-codex-[a-zA-Z0-9]+$/.test(basename(actual)) || (await lstat(root)).isSymbolicLink()) throw fail('unsafe_cleanup');
  await rm(actual, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
}

export async function stop(child, evidence = {}) {
  if (!child) return true;
  const exited = () => child.exitCode !== null || child.signalCode !== null;
  if (exited() && (!child.stdout || child.stdout.destroyed) && (!child.stderr || child.stderr.destroyed)) return true;
  const closed = new Promise((resolveClosed) => child.once('close', () => resolveClosed(true)));
  const waitClosed = async (milliseconds) => {
    let timer; try { return await Promise.race([closed, new Promise((r) => { timer = setTimeout(() => r(false), milliseconds); })]); } finally { clearTimeout(timer); }
  };
  evidence.method = 'stdin-eof';
  child.stdin?.end();
  let confirmed = await waitClosed(10_000);
  if (!confirmed && !exited() && process.platform === 'win32') {
    // Le lanceur Node possède un enfant natif : arrêter l'arbre, jamais un nom de processus.
    const killer = spawn(join(process.env.SYSTEMROOT ?? 'C:/Windows', 'System32/taskkill.exe'), ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore', shell: false });
    evidence.method = 'targeted-tree-stop';
    evidence.taskkillExitCode = await new Promise((resolveKill) => { killer.once('close', resolveKill); killer.once('error', () => resolveKill(null)); });
  } else if (!confirmed && !exited()) child.kill('SIGTERM');
  if (!confirmed) confirmed = await waitClosed(10_000);
  evidence.wrapperExited = exited(); evidence.pipesClosed = confirmed;
  if (!confirmed) { child.stdin?.destroy(); child.stdout?.destroy(); child.stderr?.destroy(); child.unref(); evidence.parentHandlesReleased = true; }
  return confirmed;
}

async function version(cli, env, cwd) {
  const child = spawn(process.execPath, [cli, '--version'], { env, cwd, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'ignore'] });
  let output = ''; child.stdout.on('data', (data) => { if (output.length < 4096) output += data; });
  let timer; try {
    const code = await Promise.race([new Promise((r, reject) => { child.once('close', r); child.once('error', () => reject(fail('cli_missing'))); }), new Promise((_, reject) => { timer = setTimeout(() => reject(fail('timeout')), 10_000); })]);
    const match = /^codex-cli (\d+\.\d+\.\d+(?:[-.a-zA-Z0-9]+)?)\s*$/.exec(output.trim());
    if (code !== 0 || !match) throw fail('version_unknown'); return match[1];
  } finally { clearTimeout(timer); await stop(child); }
}

async function main() {
  if (process.argv.length !== 3 || process.argv[2] !== '--live') { console.log('Usage : node scripts/qualification/codex.mjs --live (connexion navigateur humaine ; quota ChatGPT)'); process.exitCode = 2; return; }
  const report = { schemaVersion: 1, observedAt: new Date().toISOString(), evidenceKind: 'live', platform: { os: process.platform, architecture: process.arch, release: release(), node: process.versions.node }, cliVersion: null, protocol: 'app-server JSONL/stdio', authMode: 'unknown', stage: 'setup', completed: false, responseMatched: false, outcome: 'unknown', cleanup: false,
    network: { inheritedVariableNames: Object.keys(process.env).filter((k) => networkKeys.includes(k.toUpperCase())).map((k) => k.toUpperCase()).sort(), tlsVerificationDisabled: false, endpointReachability: 'unknown', certificateTrust: 'unknown' },
    eligibility: { localPersonalUse: 'documented-with-limits', freeDistribution: 'unresolved', hostedOrCommercial: 'excluded', licenseDecision: 'none' },
    capabilities: { proven: [], declared: ['JSONL', 'managed-chatgpt-login', 'model/list'], unknown: ['distribution-eligibility', 'BMad-workflow', 'approvals', 'interruption', 'resume', 'packaged-Windows'] } };
  let root, child, rpc, base, cancelled = false;
  const onSignal = () => { cancelled = true; rpc?.abort('cancelled'); };
  process.once('SIGINT', onSignal); process.once('SIGTERM', onSignal);
  try {
    base = await realpath(tmpdir());
    root = await createWorkspace(base, fileURLToPath(new URL('../../', import.meta.url)));
    const home = join(root, 'home'), cwd = join(root, 'empty'); await mkdir(home); await mkdir(cwd);
    const env = childEnvironment(process.env, home);
    const cli = join(process.env.APPDATA ?? '', 'npm/node_modules/@openai/codex/bin/codex.js'); await access(cli);
    if (cancelled) throw fail('cancelled');
    report.cliVersion = await version(cli, env, cwd);
    if (cancelled) throw fail('cancelled');
    child = spawn(process.execPath, [cli, 'app-server', '--listen', 'stdio://', '-c', 'cli_auth_credentials_store="file"', '-c', 'model_provider="openai"', '-c', 'web_search="disabled"', '-c', 'features.shell_tool=false'], { cwd, env, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    child.stderr.on('data', () => { report.nativeStderrObserved = true; });
    rpc = new Rpc(child);
    await probe(rpc, cwd, (url) => { console.error('Connexion native à effectuer dans votre navigateur (URL exclue du profil de preuve) :'); console.error(url); }, { evidence: report });
    report.outcome = 'success'; report.network.endpointReachability = 'inference-completed'; report.network.certificateTrust = 'accepted-by-child-for-this-request';
    report.capabilities.proven = ['isolated-profile', 'managed-chatgpt-login', 'model-catalog', 'correlated-response-and-completed-turn'];
  } catch (error) {
    const codes = ['temporary_root_in_repository', 'tls_disabled', 'process_error', 'process_closed', 'protocol_error', 'unexpected_request', 'unexpected_effect', 'server_error', 'rpc_error', 'timeout', 'auth_not_chatgpt', 'login_url_invalid', 'login_failed', 'model_missing', 'thread_policy_mismatch', 'turn_unsuccessful', 'response_missing', 'cli_missing', 'version_unknown', 'cancelled'];
    report.failureCode = codes.includes(error.code) ? error.code : 'local_setup_failed';
    report.outcome = ['timeout', 'process_closed', 'process_error', 'cancelled'].includes(report.failureCode) ? 'unknown' : 'failure';
  } finally {
    report.shutdown = {}; const stopped = await stop(child, report.shutdown);
    if (!root) report.cleanup = true;
    if (root && stopped) { try { await cleanWorkspace(root, base); report.cleanup = true; } catch { report.failureCode = 'cleanup_failed'; } }
    if (!stopped) report.failureCode = 'process_stop_unconfirmed';
    if (!report.cleanup) report.outcome = 'unknown';
    process.removeListener('SIGINT', onSignal); process.removeListener('SIGTERM', onSignal);
    const output = fileURLToPath(new URL('../../_bmad-output/initiative-madness/tickets/epic-boucle-codex/qualification-codex/', import.meta.url));
    await mkdir(output, { recursive: true }); await writeFile(join(output, 'profile.json'), JSON.stringify(report, null, 2) + '\n');
  }
  console.log(`Qualification : ${report.outcome} ; étape : ${report.stage} ; nettoyage : ${report.cleanup}. Voir qualification-codex/profile.json.`);
  process.exitCode = report.outcome === 'success' && report.eligibility.freeDistribution === 'eligible' ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
