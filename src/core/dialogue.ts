import { dialogueError, dialogueFailure, initialDialogueState, isDialogueCommand, isMessageIdentity, MAX_WORKFLOWS, MAX_TURN_MESSAGES, MAX_SESSION_MESSAGES, MAX_SESSION_TEXT } from '../contracts/dialogue.ts'
import type { DialogueCommand, DialogueMessage, DialogueState, WorkflowRecord } from '../contracts/dialogue.ts'
import { MAX_DRAFT_LENGTH } from '../contracts/index.ts'
import type { BmadProfile, DialogueMessageUpdate, DialogueSession, WorkflowPort } from './ports.ts'
import type { Application } from './application.ts'
type Dependencies = { application: Application; workflows?: WorkflowPort; copyText?(value: string): Promise<void>; qualify(rootPath: string, signal: AbortSignal): Promise<BmadProfile>; qualifyForge?(rootPath: string, signal: AbortSignal): Promise<BmadProfile>; open(profile: BmadProfile, signal: AbortSignal, activity: (text: string) => void): Promise<DialogueSession> }
/** Une seule session native possédée. Les travaux longs ne monopolisent jamais la queue disque. */
export class DialogueCoordinator {
  private state = initialDialogueState()
  private listeners = new Set<(state: DialogueState) => void>()
  private active: Promise<void> | null = null
  private controller: AbortController | null = null
  private session: DialogueSession | null = null
  private closing = false
  private blocked = false
  private restored = false
  private qualifiedForge: { projectId: string; profile: BmadProfile } | null = null
  private turnSequence = 0
  private deps: Dependencies
  constructor(deps: Dependencies) { this.deps = deps }
  read(): DialogueState { return structuredClone(this.state) }
  subscribe(listener: (state: DialogueState) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  private update(change: Partial<DialogueState>): void { this.state = { ...this.state, ...change, sequence: this.state.sequence + 1 }; for (const listener of this.listeners) { try { listener(this.read()) } catch { /* Observer sans posséder le travail. */ } } }
  private activity = (text: string): void => { this.update({ activities: [...this.state.activities, text.slice(0, 500)].slice(-80) }) }
  async execute(input: unknown): Promise<DialogueState> {
    if (!isDialogueCommand(input)) return { ...this.read(), errorCode: 'INVALID_COMMAND' }
    if (!this.restored) { try { const workflows=await this.deps.workflows?.read()??[];if(workflows.length>MAX_WORKFLOWS)throw dialogueFailure('STORAGE_READ_FAILED');this.update({workflows});this.restored=true } catch { return {...this.read(),errorCode:'STORAGE_READ_FAILED'} } }
    if (input.type === 'read') return this.read()
    if (this.closing) return { ...this.read(), errorCode: 'APP_CLOSING' }
    if(input.type==='copy-workflow'){
      const record=this.state.workflows.find(w=>w.conversationId===input.conversationId),text=input.target==='invocation'?record?.invocation:record?.workspace
      if(!text||!this.deps.copyText)return {...this.read(),errorCode:'INVALID_COMMAND'}
      try{await this.deps.copyText(text);this.update({errorCode:null});this.activity(input.target==='invocation'?'Invocation copiée.':'Chemin copié.');return this.read()}catch{return {...this.read(),errorCode:'OUTPUT_REFUSED'}}
    }
    if (input.type === 'stop') { if (!this.active && !this.session) return this.read(); this.controller?.abort(); this.update({ status: 'stopping' }); if (!this.active) this.schedule(() => this.stop()); return this.read() }
    if (this.blocked) return { ...this.read(), errorCode: 'STOP_UNCONFIRMED' }
    if (this.active) return { ...this.read(), errorCode: 'BUSY' }
    if ((input.type==='send'||input.type==='launch'||input.type==='launch-forge')&&(this.state.messages.length>MAX_SESSION_MESSAGES-MAX_TURN_MESSAGES||this.state.messages.reduce((n,m)=>n+m.text.length,0)>MAX_SESSION_TEXT-MAX_DRAFT_LENGTH))return {...this.read(),errorCode:'OUTPUT_REFUSED'}
    if (input.type === 'send') {
      if (!this.session || input.projectId !== this.state.context.projectId || input.conversationId !== this.state.context.conversationId || this.state.status !== 'ready') return { ...this.read(), errorCode: 'CONTEXT_MISMATCH' }
      this.update({ status: 'running', acknowledged: false, errorCode: null })
      this.schedule(() => this.turn(input))
    } else if ('projectId' in input) {
      if (this.session) return { ...this.read(), errorCode: 'BUSY' }
      if(input.type!=='launch-forge')this.qualifiedForge=null
      this.controller = new AbortController()
      this.update({ status: 'qualifying', context: { ...initialDialogueState().context, projectId: input.projectId }, invocation:input.type.endsWith('forge')?'$bmad-forge-idea':'$bmad-agent-analyst', acknowledged: false, errorCode: null, profile: input.type==='launch-forge'?this.state.profile:null, activities: [], turn:null })
      this.schedule(() => this.launch(input))
    }
    return this.read()
  }
  private schedule(work: () => Promise<void>): void { this.active = Promise.resolve().then(async () => { await work(); if (this.controller?.signal.aborted && this.session) await this.stop() }).catch(async error => {
    const code = dialogueError(error, this.controller?.signal.aborted ? 'CANCELLED' : 'PROVIDER_FAILED')
    let stopped = await this.stopSession()
    if (code === 'STOP_UNCONFIRMED') stopped = 'unknown'
    if (stopped === 'unknown') this.blocked = true
    if(this.state.turn)this.update({turn:{...this.state.turn,phase:stopped==='unknown'?'unknown':'interrupted'}})
    this.update({ status: stopped === 'unknown' ? 'unknown' : code === 'CANCELLED' ? 'stopped' : 'error', errorCode: stopped === 'unknown' ? 'STOP_UNCONFIRMED' : code })
    await this.persistActivity(stopped === 'unknown' ? 'unknown' : 'interrupted').catch(() => this.update({ status: 'unknown', errorCode: 'STORAGE_WRITE_FAILED' }))
  }).finally(() => { this.active = null }) }
  private async launch(input: Extract<DialogueCommand, { projectId: string }> & {type:'qualify'|'launch'|'qualify-forge'|'launch-forge'}): Promise<void> {
    const prepared=this.qualifiedForge
    if(input.type==='launch-forge'){
      if(!prepared||prepared.projectId!==input.projectId)throw dialogueFailure('PROFILE_UNRECOGNIZED')
      if(this.state.workflows.length>=MAX_WORKFLOWS)throw dialogueFailure('OUTPUT_REFUSED')
    }
    const project = await this.deps.application.dialogueProject(input.projectId)
    const qualify=input.type.endsWith('forge')?this.deps.qualifyForge:this.deps.qualify
    if(!qualify)throw dialogueFailure('UNSUPPORTED_INTERACTION')
    const profile = await qualify(project.rootPath, this.controller!.signal)
    this.controller!.signal.throwIfAborted()
    if(input.type==='launch-forge'){
      const previous=prepared!.profile
      if(profile.kind!=='forge'||!profile.forge||profile.rootPath!==previous.rootPath||profile.fingerprint!==previous.fingerprint||profile.skillPath!==previous.skillPath||profile.forge.outputBase!==previous.forge!.outputBase||profile.forge.initiativeId!==previous.forge!.initiativeId||profile.forge.contextDigest!==previous.forge!.contextDigest)throw dialogueFailure('PROFILE_CHANGED')
    }
    if(input.type==='qualify-forge'){
      if(profile.kind!=='forge'||!profile.forge)throw dialogueFailure('PROFILE_UNRECOGNIZED')
      this.qualifiedForge={projectId:input.projectId,profile:structuredClone(profile)}
    }
    this.update({ status: 'qualified', profile: { fingerprint: profile.fingerprint, skillPath: profile.skillPath,...(profile.forge?{outputBase:profile.forge.outputBase}:{}) } })
    this.activity(profile.kind==='forge'?'Profil Forge, roster, hooks, sorties et dépendances vérifiés':'Profil Mary et dépendances vérifiés · lecture seule')
    if (input.type.startsWith('qualify')) return
    this.update({ status: 'starting' })
    this.session = await this.deps.open(profile, this.controller!.signal, this.activity)
    this.controller!.signal.throwIfAborted()
    const conversation = await this.deps.application.dialoguePersist(project.id, null, value => { value.lastKnownActivity = 'running' }, this.session.context,input.correlationId)
    this.update({ context: conversation.context })
    if(this.session.workflow){
      if(!this.deps.workflows)throw dialogueFailure('STORAGE_WRITE_FAILED')
      const record:WorkflowRecord={schemaVersion:1,conversationId:conversation.id,context:conversation.context,invocation:'$bmad-forge-idea',capturedAt:new Date().toISOString(),rootPath:profile.rootPath,outputBase:this.session.workflow.outputBase,contextDigest:this.session.workflow.contextDigest,fingerprint:profile.fingerprint,skillPath:profile.skillPath,workspace:null,outcome:'open',observations:[]}
      await this.deps.workflows.write(record);this.update({workflows:[...this.state.workflows,record]})
      this.session.workflow.bind(async(observation,workspace,outcome)=>{
        const current=this.state.workflows.find(w=>w.conversationId===conversation.id)
        if(!current)throw dialogueFailure('STORAGE_WRITE_FAILED')
        const next={...current,workspace:workspace??current.workspace,outcome:outcome??current.outcome,observations:[...current.observations,observation]}
        await this.deps.workflows!.write(next);this.update({workflows:this.state.workflows.map(w=>w.conversationId===next.conversationId?next:w)})
      })
    }
    await this.turn(null,input.correlationId)
  }
  private async turn(input: Extract<DialogueCommand, { type: 'send' }> | null, launchRequest?:string): Promise<void> {
    const context=structuredClone(this.state.context),{ projectId, conversationId } = context
    if (!projectId || !conversationId || !this.session) throw dialogueFailure('CONTEXT_MISMATCH')
    const requestId=input?.correlationId??launchRequest!,turnId='turn-'+ ++this.turnSequence,updates=new Map<string,DialogueMessage>(),dirty=new Set<string>()
    const sourceIds=new Map<string,string>()
    let timer:ReturnType<typeof setTimeout>|undefined,projectionTimer:ReturnType<typeof setTimeout>|undefined,writing:Promise<void>=Promise.resolve(),storageError:unknown=null,acknowledged=false,closed=false
    this.update({turn:{id:turnId,requestId,context,phase:'awaiting-ack'}})
    const project=():void=>{
      const previous=this.state.messages.filter(m=>m.turnId!==turnId)
      this.state={...this.state,messages:[...previous,...updates.values()].map(m=>structuredClone(m))}
      if(!projectionTimer)projectionTimer=setTimeout(()=>{projectionTimer=undefined;this.update({messages:this.state.messages})},32)
    }
    const flush=async():Promise<void>=>{
      clearTimeout(timer);timer=undefined
      if(storageError)throw storageError
      const batch=[...dirty].map(id=>structuredClone(updates.get(id)!));dirty.clear()
      if(!batch.length){await writing;if(storageError)throw storageError;return}
      const pending=writing.then(async()=>{
        if(storageError)throw storageError
        await this.deps.application.dialogueUpsert(projectId,conversationId,batch.map(m=>({id:m.id,role:'assistant',text:m.text})),requestId)
        for(const saved of batch){const current=updates.get(saved.id)!;if(current.revision===saved.revision)current.storage='stored'}
        project()
      }).catch(error=>{storageError=error;for(const message of updates.values())if(message.storage!=='stored')message.storage='failed';project();this.controller?.abort()})
      writing=pending;await pending;if(storageError)throw storageError
    }
    const observe=(update:DialogueMessageUpdate):void=>{
      if(closed||!acknowledged)throw dialogueFailure('CONTEXT_MISMATCH')
      if(!Number.isSafeInteger(update.order)||update.order<1||update.order>MAX_TURN_MESSAGES||typeof update.id!=='string'||!update.id.length||update.id.length>200||typeof update.text!=='string'||update.text.length>MAX_DRAFT_LENGTH||typeof update.completed!=='boolean'||!isMessageIdentity(update.identity))throw dialogueFailure('PROVIDER_FAILED')
      const id=turnId+'-message-'+update.order,previous=updates.get(id)
      if(previous&&sourceIds.get(id)!==update.id||!previous&&[...sourceIds.values()].includes(update.id))throw dialogueFailure('CONTEXT_MISMATCH')
      sourceIds.set(id,update.id)
      if(previous&&previous.phase==='complete'&&(!update.completed||previous.text!==update.text))throw dialogueFailure('PROVIDER_FAILED')
      if(!previous&&update.order!==updates.size+1)throw dialogueFailure('PROVIDER_FAILED')
      if(previous&&!update.text.startsWith(previous.text))throw dialogueFailure('PROVIDER_FAILED')
      const message:DialogueMessage={id,context,requestId,turnId,order:update.order,revision:(previous?.revision??0)+1,text:update.text,phase:update.completed?'complete':'streaming',storage:storageError?'failed':'pending',identity:previous?.identity??structuredClone(update.identity)}
      updates.set(id,message)
      if([...updates.values()].reduce((n,m)=>n+m.text.length,0)>MAX_DRAFT_LENGTH)throw dialogueFailure('PROVIDER_FAILED')
      dirty.add(id);project()
      if(!timer&&!storageError)timer=setTimeout(()=>{void flush().catch(()=>{})},100)
    }
    try{
      await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.lastKnownActivity = 'running' },undefined,requestId)
      const text = await this.session.turn(input?.text ?? null, async () => {
        if(acknowledged)throw dialogueFailure('CONTEXT_MISMATCH')
        await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.messages.push({ id:turnId+'-request', role: 'user', text: input?.text ?? this.state.invocation }) },undefined,requestId)
        acknowledged=true;this.update({ status:this.controller?.signal.aborted?'stopping':'running', acknowledged: true,turn:{id:turnId,requestId,context,phase:this.controller?.signal.aborted?'interrupted':'streaming'} }); this.activity('Envoi acquitté par Codex · conversation capturée')
      },observe)
      if(!acknowledged||!text.trim())throw dialogueFailure('PROVIDER_FAILED')
      // Compatibilité du port : un adaptateur sans flux peut fournir un unique item final.
      if(!updates.size)observe({id:'final',order:1,text,completed:true,identity:{kind:'unknown'}})
      if([...updates.values()].some(m=>m.phase!=='complete'))throw dialogueFailure('PROVIDER_FAILED')
      if([...updates.values()].map(m=>m.text).join('\n\n')!==text)throw dialogueFailure('PROVIDER_FAILED')
      closed=true;await flush()
      await this.deps.application.dialoguePersist(projectId,conversationId,value=>{value.lastKnownActivity='idle'},undefined,requestId)
      if (this.controller?.signal.aborted) return
      this.update({ status: 'ready', errorCode: null,turn:{id:turnId,requestId,context,phase:'completed'} }); this.activity('Tour terminé · réponse enregistrée · à vous de répondre')
    }catch(error){
      closed=true
      await flush().catch(()=>{})
      for(const message of updates.values())if(message.phase==='streaming')message.phase='interrupted'
      project();this.update({turn:{id:turnId,requestId,context,phase:'interrupted'}})
      throw storageError??error
    }finally{closed=true;clearTimeout(timer);clearTimeout(projectionTimer);await writing}
  }
  private async persistActivity(activity: 'idle' | 'interrupted' | 'unknown'): Promise<void> { const { projectId, conversationId } = this.state.context; if (projectId && conversationId) await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.lastKnownActivity = activity },undefined,this.state.turn?.requestId??'dialogue-lifecycle') }
  private async stopSession(): Promise<'stopped' | 'unknown'> { const session = this.session; this.session = null; let outcome: 'stopped' | 'unknown' = this.blocked ? 'unknown' : 'stopped'; try { if (session) outcome = await session.stop() } catch { outcome = 'unknown' } if (outcome === 'unknown') this.blocked = true; return outcome }
  private async stop(): Promise<void> { const outcome = await this.stopSession(); await this.persistActivity(outcome === 'stopped' ? 'idle' : 'unknown'); this.update({ status: outcome, errorCode: outcome === 'unknown' ? 'STOP_UNCONFIRMED' : null,...(this.state.turn&&this.state.turn.phase!=='completed'?{turn:{...this.state.turn,phase:outcome==='unknown'?'unknown' as const:'interrupted' as const}}:{}) }); this.activity(outcome === 'stopped' ? 'Processus Codex arrêté' : 'Arrêt Codex non confirmé') }
  async settled(): Promise<void> { await this.active }
  async shutdown(): Promise<'stopped' | 'unknown'> { this.closing = true; this.controller?.abort(); await this.active; await this.stop(); return this.blocked ? 'unknown' : 'stopped' }
}
