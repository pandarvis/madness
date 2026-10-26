import { spawn } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { mkdir, mkdtemp, realpath, rm } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { isRecord, MAX_DRAFT_LENGTH } from '../../contracts/index.ts'
import { dialogueError, dialogueFailure, MAX_TURN_MESSAGES } from '../../contracts/dialogue.ts'
import type { DialogueErrorCode, MessageIdentity } from '../../contracts/dialogue.ts'
import type { BmadProfile, DialogueMessageUpdate, DialogueSession } from '../../core/ports.ts'
import type { CodexConnection } from './connection.ts'
import { findNativeExecutable, probeEnvironment, stopNative } from './probe.ts'
import { assertBmadProfile, readBmadFile, resolveBmad } from '../bmad/profile.ts'
import { ForgeHost, qualifyForge } from '../bmad/forge.ts'
import type { ForgeOperation } from '../bmad/forge.ts'
type Message = { id?: string | number; method?: string; params?: any; result?: any; error?: unknown }
/** RPC de dialogue séparé du témoin : valide et refuse les demandes natives avant projection. */
export class DialogueRpc {
  private child: ChildProcessWithoutNullStreams
  private signal: AbortSignal
  private timeout: number
  private nextId = 0
  private pending = new Map<number, { resolve(value: any): void; reject(error: unknown): void }>()
  private queue: Message[] = []
  private waiter: { resolve(value: Message): void; reject(error: unknown): void } | null = null
  private buffer = ''
  private bytes = 0
  private error: Error | null = null
  private handler: ((value: Message) => Promise<unknown>) | null = null
  private requests: Promise<void> = Promise.resolve()
  private requestIds = new Set<string>()
  constructor(child: ChildProcessWithoutNullStreams, signal: AbortSignal, timeout = 15000) {
    this.child = child; this.signal = signal; this.timeout = timeout
    child.stdout.setEncoding('utf8'); child.stdout.on('data', this.data); child.stderr.on('data', this.stderr)
    child.on('close', this.closed); child.on('error', this.closed); child.stdin.on('error', this.closed)
    signal.addEventListener('abort', this.aborted, { once: true }); if (signal.aborted) this.aborted()
  }
  private closed = (): void => this.fail('PROVIDER_FAILED')
  private aborted = (): void => this.fail('CANCELLED')
  private stderr = (chunk: Buffer): void => { this.bytes += chunk.length; if (this.bytes > 8388608) this.fail('PROVIDER_FAILED') }
  private data = (chunk: string): void => {
    if (this.error) return
    this.bytes += Buffer.byteLength(chunk); this.buffer += chunk
    if (this.bytes > 8388608 || this.buffer.length > 1048576) return this.fail('PROVIDER_FAILED')
    while (this.buffer.includes('\n') && !this.error) {
      const end = this.buffer.indexOf('\n'), line = this.buffer.slice(0, end); this.buffer = this.buffer.slice(end + 1)
      if (!line.trim()) continue
      try { const value: unknown = JSON.parse(line); if (!isRecord(value)) throw Error(); this.receive(value) } catch { this.fail('PROVIDER_FAILED') }
    }
  }
  private receive(value: Message): void {
    if (value.method && Object.hasOwn(value, 'id')) {
      if(!(typeof value.id==='string'&&value.id.length>0&&value.id.length<=200||typeof value.id==='number'&&Number.isSafeInteger(value.id)))return this.fail('PROVIDER_FAILED')
      const key=typeof value.id+':'+String(value.id)
      if(this.requestIds.has(key))return this.fail('CONTEXT_MISMATCH')
      this.requestIds.add(key)
      this.requests = this.requests.then(async () => {
        try { if (this.error) throw this.error; if (!this.handler) throw dialogueFailure('UNSUPPORTED_INTERACTION'); const result = await this.handler(value); this.write({ id: value.id, result }) }
        catch (error) { const code = dialogueError(error, 'UNSUPPORTED_INTERACTION'); this.write({ id: value.id, error: { code: -32601, message: code } }); this.fail(code) }
        finally{this.requestIds.delete(key)}
      })
      return
    }
    if (Object.hasOwn(value, 'id')) { if(typeof value.id!=='number'||!Number.isSafeInteger(value.id))return this.fail('PROVIDER_FAILED'); const pending = this.pending.get(value.id); if (!pending) return; this.pending.delete(value.id); if (value.error || !Object.hasOwn(value, 'result')) pending.reject(dialogueFailure('PROVIDER_FAILED')); else pending.resolve(value.result); return }
    if (!value.method) return this.fail('PROVIDER_FAILED')
    if (value.method === 'error') return this.fail('PROVIDER_FAILED')
    if (!['item/started', 'item/completed', 'item/agentMessage/delta', 'turn/completed'].includes(value.method)) return
    if (this.waiter) { const waiter = this.waiter; this.waiter = null; waiter.resolve(value) } else {
      const last=this.queue.at(-1),p=value.params,q=last?.params
      // Compacter seulement les deltas adjacents du même item : ordre et répétitions sont conservés.
      if(value.method==='item/agentMessage/delta'&&last?.method===value.method&&p?.threadId===q?.threadId&&p?.turnId===q?.turnId&&p?.itemId===q?.itemId&&typeof p?.delta==='string'&&typeof q?.delta==='string'&&q.delta.length+p.delta.length<=MAX_DRAFT_LENGTH){
        q.delta+=p.delta
      }else this.queue.push(value)
      if (this.queue.length > 512) this.fail('PROVIDER_FAILED')
    }
  }
  private write(value: unknown): void { if (!this.child.stdin.destroyed) this.child.stdin.write(JSON.stringify(value) + '\n') }
  private fail(code: DialogueErrorCode): void { this.error ??= dialogueFailure(code); for (const pending of this.pending.values()) pending.reject(this.error); this.pending.clear(); this.waiter?.reject(this.error) }
  onRequest(handler: (value: Message) => Promise<unknown>): void { this.handler = handler }
  async call(method: string, params: unknown): Promise<any> {
    if (this.error) throw this.error
    const id = ++this.nextId; let timer: ReturnType<typeof setTimeout> | undefined
    try { return await new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); timer = setTimeout(() => { this.fail('PROVIDER_FAILED'); reject(this.error) }, this.timeout); this.write({ id, method, params }) }) }
    finally { clearTimeout(timer); this.pending.delete(id) }
  }
  notify(method: string): void { if (this.error) throw this.error; this.write({ method, params: {} }) }
  async next(timeout: number): Promise<Message> {
    // Les notifications déjà admises gardent leur texte ; drainRequests refuse ensuite un terminal en échec.
    const queued = this.queue.shift(); if (queued) return queued
    if (this.error) throw this.error
    if (timeout <= 0) throw dialogueFailure('PROVIDER_FAILED')
    let timer: ReturnType<typeof setTimeout> | undefined
    try { return await new Promise<Message>((resolve, reject) => { this.waiter = { resolve, reject }; timer = setTimeout(() => { this.fail('PROVIDER_FAILED'); reject(this.error) }, timeout) }) }
    finally { clearTimeout(timer); this.waiter = null }
  }
  async drainRequests(): Promise<void> { await this.requests; if (this.error) throw this.error }
  dispose(): void { this.signal.removeEventListener('abort', this.aborted); this.fail('CANCELLED'); this.child.stdout.off('data', this.data); this.child.stderr.off('data', this.stderr); this.child.off('close', this.closed); this.child.off('error', this.closed); this.child.stdin.off('error', this.closed) }
}
const dynamicTools = [
  { type: 'function', name: 'bmad_resolve', description: 'Exécuter réellement la commande uv run BMad de résolution. kind agent = resolve_customization.py --key agent ; kind config = resolve_config.py --key core.output_folder --key core.active_initiative. Aucun autre programme.', inputSchema: { type: 'object', properties: { kind: { type: 'string', enum: ['agent', 'config'] } }, required: ['kind'], additionalProperties: false } },
  { type: 'function', name: 'bmad_read_file', description: 'Lire un fichier du profil BMad qualifié : SKILL.md, customize.toml, bmod.toml, resolvers et configuration. Aucun fichier arbitraire, secret, workflow documentaire ou écriture.', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false } },
  { type: 'function', name: 'bmad_unsupported', description: 'Signaler puis arrêter le tour si la demande nécessite un workflow documentaire, une écriture, une approbation, une question structurée ou une autre capacité absente du pilote.', inputSchema: { type: 'object', properties: {}, additionalProperties: false } }
]
const forgeTools = [
  {type:'function',name:'bmad_forge_resolve',description:'Exécuter les vrais scripts natifs : workflow=customization --key workflow ; config=configuration centrale ; personas=resolve_personas, y compris roster et sous-processus isolés.',inputSchema:{type:'object',properties:{kind:{type:'string',enum:['workflow','config','personas']}},required:['kind'],additionalProperties:false}},
  {type:'function',name:'bmad_forge_init',description:'Créer une nouvelle session forge-{slug}, avec le vrai memlog.py init. Seulement quand idée/objectif connus. Jamais de reprise.',inputSchema:{type:'object',properties:{slug:{type:'string'},idea:{type:'string'},goal:{type:'string'}},required:['slug','idea','goal'],additionalProperties:false}},
  {type:'function',name:'bmad_forge_append',description:'Vrai memlog.py append dans la seule session capturée.',inputSchema:{type:'object',properties:{type:{type:'string',enum:['decision','assumption','crack','kill','direction','lock','note']},text:{type:'string'}},required:['type','text'],additionalProperties:false}},
  {type:'function',name:'bmad_forge_write',description:'Écrire intégralement une seule fois forge-report.html (HTML autonome, CSS et SVG inline) ou idea (Markdown natif forge-{slug}.md). Chemins imposés, octets relus, aucun aperçu exécuté.',inputSchema:{type:'object',properties:{name:{type:'string',enum:['forge-report.html','idea']},text:{type:'string'}},required:['name','text'],additionalProperties:false}},
  {type:'function',name:'bmad_forge_finish',description:'Après sorties complètes et observées, vrai memlog.py set status=complete. HTML toujours obligatoire, Markdown aussi pour HARDENED. Ne signifie aucune acceptation humaine.',inputSchema:{type:'object',properties:{outcome:{type:'string',enum:['HARDENED','KILLED','CLARIFIED']}},required:['outcome'],additionalProperties:false}},
  dynamicTools[1],{...dynamicTools[2],description:'Arrêter explicitement une interaction indisponible : approbation native, question structurée, sous-agent, autre skill, reprise ou commande/écriture hors session.'}
]
type ProtocolOptions = { cwd: string; profile: Pick<BmadProfile, 'rootPath' | 'skillPath'>; forge?: ForgeHost; signal: AbortSignal; activity(text: string): void; resolve(kind: 'agent' | 'config'): Promise<string>; read(path: string): Promise<string> }
export async function startDialogueProtocol(rpc: DialogueRpc, options: ProtocolOptions, timeout = 180000): Promise<Pick<DialogueSession, 'turn'>> {
  await rpc.call('initialize', { clientInfo: { name: 'madness', title: 'Madness', version: '0.1.0' }, capabilities: { experimentalApi: true } }); rpc.notify('initialized')
  const catalog = await rpc.call('model/list', {})
  const model = catalog.data?.find((value: any) => value.isDefault === true && value.hidden === false && typeof value.model === 'string')
  if (!model || !/^[a-zA-Z0-9._:/-]{1,100}$/.test(model.model)) throw dialogueFailure('PROVIDER_FAILED')
  const instructions = `Pilote personnel Madness. Le projet BMad capturé est ${options.profile.rootPath}. Le processus travaille dans un répertoire isolé ; {project-root} désigne toujours le projet capturé et {skill-root} le dossier de ${options.profile.skillPath}. Exécute l'agent installé fourni par l'entrée native skill, sans l'imiter. Pour ses commandes uv run utilise réellement bmad_resolve(kind=agent) puis bmad_resolve(kind=config), dans l'ordre du SKILL.md. Pour les lectures utilise bmad_read_file. Aucun shell, réseau d'outil, écriture, sous-agent, installation ou autre compétence n'est disponible. Ne remplace jamais un resolver par une réponse inventée. Le pilote autorise l'accueil/menu natif puis la discussion libre uniquement, en français. Une demande de workflow documentaire, approbation, effets, question structurée ou autre outil doit appeler bmad_unsupported ; ne prétends jamais l'avoir réalisée. Les propositions et le menu ne valent aucune approbation. Termine chaque tour par son résultat et la prochaine action attendue, sans déclarer le workflow clos.`
  const forgeInstructions=`Madness intègre le skill natif $bmad-forge-idea pour une NOUVELLE idée seulement. {project-root}=${options.profile.rootPath}, {skill-root}=${dirname(options.profile.skillPath)}. Le processus Codex reste read-only dans un dossier isolé. Respecte intégralement le SKILL.md injecté ; ne l'imite pas, ne résume pas ses sorties obligatoires. Pour les commandes natives uv run utilise bmad_forge_resolve : workflow puis config à l'activation, personas dès que le but est connu. Les commandes sont réellement exécutées, y compris roster/personas dans des subprocess isolés. bmad_read_file lit uniquement le profil qualifié. Ne prétends jamais avoir exécuté un script sans résultat de l'outil. Reprise/hooks/autres skills/sous-agents et interactions structurées sont indisponibles : appelle bmad_unsupported, ne simule rien. Pose tes questions dans le dialogue libre. Aucun brouillon n'est envoyé par le lancement. Après but connu, bmad_forge_init crée la SEULE sortie autorisée sous ${options.forge?.profile.forge?.outputBase}; aucun chemin arbitraire. Utilise bmad_forge_append pour les décisions et faits. À la sortie, produis le HTML INTÉGRAL et autonome avec CSS et sceau SVG inline via bmad_forge_write(name=forge-report.html). Si HARDENED, écris aussi le Markdown extrêmement court via name=idea. Puis appelle bmad_forge_finish et cite les chemins réellement observés. Jamais de faux journal/livrable, shell, outil générique, installation, réseau d'outil ou exécution HTML. Termine chaque tour en indiquant sa fin et la prochaine action attendue ; distingue fin de tour, clôture du workflow et acceptation humaine inconnue. Le forfait ChatGPT propre à Madness est utilisé.`
  const thread = await rpc.call('thread/start', { cwd: options.cwd, model: model.model, modelProvider: 'openai_chatgpt_plan', sandbox: 'read-only', approvalPolicy: 'never', ephemeral: true, dynamicTools:options.forge?forgeTools:dynamicTools, developerInstructions: options.forge?forgeInstructions:instructions, multiAgentMode: 'explicitRequestOnly' })
  if (thread.modelProvider !== 'openai_chatgpt_plan' || thread.model !== model.model || thread.sandbox?.type !== 'readOnly' || thread.approvalPolicy !== 'never' || typeof thread.thread?.id !== 'string') throw dialogueFailure('PROVIDER_FAILED')
  const threadId = thread.thread.id
  let turnId: string | null = null, gate: Promise<void> = Promise.resolve(), first = true, busy = false
  const resolved = new Set<string>(), calls = new Set<string>()
  let identity:MessageIdentity={kind:'unknown'}
  rpc.onRequest(async request => {
    await gate
    const p = request.params
    if (request.method !== 'item/tool/call') throw dialogueFailure('UNSUPPORTED_INTERACTION')
    if (!p || p.threadId !== threadId || p.turnId !== turnId || typeof p.callId !== 'string' || !p.callId.length || p.callId.length>200 || calls.has(p.callId)) throw dialogueFailure('CONTEXT_MISMATCH')
    calls.add(p.callId)
    if (calls.size > (options.forge?300:80)) throw dialogueFailure('UNSUPPORTED_INTERACTION')
    const args = p.arguments
    if (!isRecord(args)) throw dialogueFailure('UNSUPPORTED_INTERACTION')
    let output: string
    if(options.forge && typeof p.tool==='string' && p.tool.startsWith('bmad_forge_')){
      const exact=(keys:string[]):boolean=>Object.keys(args).length===keys.length&&keys.every(k=>Object.hasOwn(args,k))
      let operation:ForgeOperation
      if(p.tool==='bmad_forge_resolve'&&exact(['kind'])&&['workflow','config','personas'].includes(String(args.kind))){if(args.kind!=='workflow'&&!resolved.has('workflow')||args.kind==='personas'&&!resolved.has('config'))throw dialogueFailure('UNSUPPORTED_INTERACTION');operation={kind:args.kind as 'workflow'|'config'|'personas'}}
      else if(p.tool==='bmad_forge_init'&&exact(['slug','idea','goal'])&&[args.slug,args.idea,args.goal].every(v=>typeof v==='string')&&resolved.has('config'))operation={kind:'init',slug:args.slug as string,idea:args.idea as string,goal:args.goal as string}
      else if(p.tool==='bmad_forge_append'&&exact(['type','text'])&&typeof args.type==='string'&&typeof args.text==='string')operation={kind:'append',type:args.type,text:args.text}
      else if(p.tool==='bmad_forge_write'&&exact(['name','text'])&&['forge-report.html','idea'].includes(String(args.name))&&typeof args.text==='string')operation={kind:'write',name:args.name as 'forge-report.html'|'idea',text:args.text}
      else if(p.tool==='bmad_forge_finish'&&exact(['outcome'])&&['HARDENED','KILLED','CLARIFIED'].includes(String(args.outcome))&&resolved.has('personas'))operation={kind:'finish',outcome:args.outcome as 'HARDENED'|'KILLED'|'CLARIFIED'}
      else throw dialogueFailure('UNSUPPORTED_INTERACTION')
      options.activity('Forge natif · '+operation.kind)
      output=await options.forge.execute(operation,p.callId,turnId!);if(['workflow','config','personas'].includes(operation.kind))resolved.add(operation.kind)
    }else if (!options.forge && p.tool === 'bmad_resolve' && Object.keys(args).length === 1 && ['agent', 'config'].includes(String(args.kind))) {
      const kind = args.kind as 'agent' | 'config'
      if (kind === 'config' && !resolved.has('agent')) throw dialogueFailure('UNSUPPORTED_INTERACTION')
      options.activity(kind === 'agent' ? 'uv run · resolve_customization.py --key agent' : 'uv run · resolve_config.py --key core.output_folder --key core.active_initiative')
      output = await options.resolve(kind); resolved.add(kind)
      if(kind==='agent'){
        try{const value:unknown=JSON.parse(output);if(isRecord(value)&&isRecord(value.agent)&&value.agent.name==='Mary')identity={kind:'attested',name:'Mary',source:'bmad_resolve(agent)'}}catch{/* Une prose ou un JSON absent n’atteste aucune identité. */}
      }
    } else if (p.tool === 'bmad_read_file' && Object.keys(args).length === 1 && typeof args.path === 'string' && args.path.length <= 32767) { options.activity('Lecture d’un fichier du profil BMad qualifié'); output = await options.read(args.path) }
    else throw dialogueFailure('UNSUPPORTED_INTERACTION')
    options.signal.throwIfAborted()
    return { success: true, contentItems: [{ type: 'inputText', text: output }] }
  })
  return { turn: async (text, accepted, observe) => {
    if (busy) throw dialogueFailure('BUSY'); busy = true
    // Le chargement observé d’un rôle n’atteste pas une réponse future après une sortie de rôle.
    identity={kind:'unknown'}
    let release!: () => void; gate = new Promise(resolve => { release = resolve })
    try {
      options.signal.throwIfAborted()
      const name=options.forge?'bmad-forge-idea':'bmad-agent-analyst'
      const input = first ? [{ type: 'skill', name, path: options.profile.skillPath }, { type: 'text', text: '$'+name }] : [{ type: 'text', text }]
      const started = await rpc.call('turn/start', { threadId, cwd: options.cwd, input })
      if (typeof started.turn?.id !== 'string') throw dialogueFailure('PROVIDER_FAILED')
      turnId = started.turn.id; await accepted(); release()
      const deadline = Date.now() + timeout, messages = new Map<string,DialogueMessageUpdate>()
      const itemMessage=(nativeId:unknown):DialogueMessageUpdate=>{
        if(typeof nativeId!=='string'||!nativeId.length||nativeId.length>200)throw dialogueFailure('PROVIDER_FAILED')
        let message=messages.get(nativeId)
        if(!message){if(messages.size>=MAX_TURN_MESSAGES)throw dialogueFailure('PROVIDER_FAILED');message={id:'message-'+(messages.size+1),order:messages.size+1,text:'',completed:false,identity:structuredClone(identity)};messages.set(nativeId,message)}
        return message
      }
      const project=(message:DialogueMessageUpdate):void=>{if([...messages.values()].reduce((n,m)=>n+m.text.length,0)>MAX_DRAFT_LENGTH)throw dialogueFailure('PROVIDER_FAILED');observe?.(structuredClone(message))}
      for (;;) {
        const event = await rpc.next(deadline - Date.now()), p = event.params
        if (p?.threadId !== threadId) continue
        if (event.method === 'turn/completed') {
          if (p.turn?.id !== turnId) continue
          await rpc.drainRequests()
          if (p.turn.status !== 'completed' || p.turn.error || !messages.size || [...messages.values()].some(m=>!m.completed) || first && (!resolved.has(options.forge?'workflow':'agent') || !resolved.has('config'))) throw dialogueFailure('PROVIDER_FAILED')
          const text=[...messages.values()].map(m=>m.text).join('\n\n');if(!text.trim()||text.length>MAX_DRAFT_LENGTH)throw dialogueFailure('PROVIDER_FAILED')
          first = false; turnId = null; return text
        }
        if (p?.turnId !== turnId) continue
        if(event.method==='item/agentMessage/delta'){
          if(typeof p.delta!=='string')throw dialogueFailure('PROVIDER_FAILED')
          const message=itemMessage(p.itemId);if(message.completed)throw dialogueFailure('PROVIDER_FAILED')
          message.text+=p.delta;project(message);continue
        }
        const item = p.item
        if (!item || !['userMessage', 'agentMessage', 'reasoning', 'dynamicToolCall'].includes(item.type)) throw dialogueFailure('UNSUPPORTED_INTERACTION')
        if(item.type==='agentMessage'){
          const message=itemMessage(item.id)
          if(event.method==='item/completed'){
            if(typeof item.text!=='string'||!item.text.startsWith(message.text)||message.completed&&item.text!==message.text)throw dialogueFailure('PROVIDER_FAILED')
            if(message.completed)continue
            message.text=item.text;message.completed=true;project(message)
          }else if(typeof item.text==='string'){if(message.text&&!item.text.startsWith(message.text))throw dialogueFailure('PROVIDER_FAILED');message.text=item.text;project(message)}
        }
      }
    } finally { release(); busy = false }
  } }
}
export async function openCodexDialogue(profile: BmadProfile, signal: AbortSignal, activity: (text: string) => void, connection: CodexConnection, options: { root: string; appData: string; repository: string; environment: NodeJS.ProcessEnv; runner?:string }): Promise<DialogueSession> {
  // Les resolvers doivent fonctionner avant de demander le moindre appel au forfait.
  let forge:ForgeHost|undefined,initiative:string|null
  if(profile.kind==='forge'){
    const current=await qualifyForge(profile.rootPath,signal,options.runner)
    if(current.fingerprint!==profile.fingerprint||current.forge?.contextDigest!==profile.forge?.contextDigest)throw dialogueFailure('PROFILE_CHANGED')
    forge=new ForgeHost(profile,signal,options.runner);initiative=profile.forge!.initiativeId
  }else{
    await assertBmadProfile(profile);await resolveBmad(profile,'agent',signal)
    const configuration=JSON.parse(await resolveBmad(profile,'config',signal));initiative=configuration['core.active_initiative']??null
  }
  if (initiative !== null && (typeof initiative !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(initiative))) throw dialogueFailure('PROFILE_UNRECOGNIZED')
  const lease = await connection.acquireDialogue(signal)
  let root: string | undefined, child: ChildProcessWithoutNullStreams | undefined, rpc: DialogueRpc | undefined, stopped = false
  const outsideRepository = (value: string): boolean => { const distance = relative(resolve(options.repository), value); return !!distance && (isAbsolute(distance) || distance === '..' || distance.startsWith('..' + sep)) }
  const cleanup = async (): Promise<'stopped' | 'unknown'> => {
    if (stopped) return 'stopped'
    const confirmed = child ? await stopNative(child) : true
    rpc?.dispose(); lease.release(confirmed); stopped = confirmed
    if (root && confirmed) { const actual = await realpath(root), parent = await realpath(options.root); if (dirname(actual) === parent) await rm(root, { recursive: true, force: true }).catch(() => {}) }
    return confirmed ? 'stopped' : 'unknown'
  }
  try {
    if (!outsideRepository(resolve(options.root))) throw dialogueFailure('PROVIDER_FAILED')
    await mkdir(options.root, { recursive: true }); if (!outsideRepository(await realpath(options.root))) throw dialogueFailure('PROVIDER_FAILED')
    root = await mkdtemp(join(options.root, 'dialogue-'))
    const work = join(root, 'work'), isolated = join(root, 'profile'); await mkdir(work); await mkdir(join(isolated, 'codex-home'), { recursive: true })
    const executable = await findNativeExecutable(options.appData)
    const settings = ['cli_auth_credentials_store="file"', 'model_provider="openai_chatgpt_plan"', 'model_providers.openai_chatgpt_plan.name="ChatGPT plan"', 'model_providers.openai_chatgpt_plan.base_url="https://api.openai.com/v1"', 'model_providers.openai_chatgpt_plan.env_key="ACCESS_TOKEN"', 'model_providers.openai_chatgpt_plan.wire_api="responses"', 'model_providers.openai_chatgpt_plan.requires_openai_auth=false', 'model_providers.openai_chatgpt_plan.supports_websockets=false', 'model_providers.openai_chatgpt_plan.request_max_retries=0', 'model_providers.openai_chatgpt_plan.stream_max_retries=0', 'web_search="disabled"', 'features.shell_tool=false', 'features.multi_agent=false', 'features.apps=false', 'features.plugins=false', 'mcp_servers={}', 'shell_environment_policy.inherit="none"']
    signal.throwIfAborted(); activity('Codex app-server · forfait ChatGPT · profil isolé · lecture seule')
    child = spawn(executable, ['app-server', '--listen', 'stdio://', ...settings.flatMap(setting => ['-c', setting])], { cwd: work, env: probeEnvironment(options.environment, isolated, lease.credentials.accessToken), shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    rpc = new DialogueRpc(child, signal)
    const protocol = await startDialogueProtocol(rpc, { cwd: work, profile, forge, signal, activity, resolve: kind => resolveBmad(profile, kind, signal), read: path => forge?forge.read(path):readBmadFile(profile, path) })
    return { context: { connectionId: lease.connectionId, initiativeId: initiative }, ...(forge?{workflow:{outputBase:profile.forge!.outputBase,contextDigest:profile.forge!.contextDigest,bind:forge.bind.bind(forge)}}:{}), turn: async (text, accepted, observe) => { if(forge)await forge.assertForTurn();else await assertBmadProfile(profile); if (lease.credentials.expiresAt <= Date.now() + 30000) throw dialogueFailure('NO_ACCOUNT'); return protocol.turn(text, accepted, observe) }, stop: cleanup }
  } catch (error) { const outcome = await cleanup(); if (outcome === 'unknown') throw dialogueFailure('STOP_UNCONFIRMED'); throw error }
}
