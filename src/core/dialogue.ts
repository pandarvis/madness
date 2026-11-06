import type {MetricOperation} from '../contracts/us-metrics.ts'
import type {UsMetricsCoordinator} from './us-metrics.ts'
import type {BmadCatalogLaunchCoordinator,ResolvedCatalogLaunch} from './bmad-catalog-launch.ts'
import type {BmadContextCoordinator} from './bmad-context.ts'
import type {CapturedBmadContext} from '../contracts/bmad-context.ts'
import type {BmadHelpCoordinator} from './bmad-help.ts'
import {isApprovalRecord,isApprovalFiles,isApprovalResult,MAX_APPROVALS} from '../contracts/approvals.ts'
import type {ApprovalRecord} from '../contracts/approvals.ts'
import type {ApprovalPort,ApprovalResponder,ApprovalObserver} from './ports.ts'
import { dialogueError, dialogueFailure, initialDialogueState, isDialogueCommand, isMessageIdentity, MAX_WORKFLOWS, MAX_TURN_MESSAGES, MAX_SESSION_MESSAGES, MAX_SESSION_TEXT } from '../contracts/dialogue.ts'
import type { DialogueCommand, DialogueMessage, DialogueState, WorkflowRecord } from '../contracts/dialogue.ts'
import { MAX_DRAFT_LENGTH } from '../contracts/index.ts'
import type { BmadProfile, DialogueMessageUpdate, DialogueSession, WorkflowPort } from './ports.ts'
import type { Application } from './application.ts'
import {randomUUID} from 'node:crypto'
import {isQuestionFields,isQuestionRecord,MAX_QUESTIONS,validQuestionValues} from '../contracts/questions.ts'
import type {QuestionRecord} from '../contracts/questions.ts'
import type {QuestionPort,QuestionResponder,QuestionObserver} from './ports.ts'
import type {RunRecoveryPort} from './ports.ts'
import type {ApprovalFile} from '../contracts/approvals.ts'
import {INSPECTION_MAX_AGE_MS} from '../contracts/recovery.ts'
import type {FileInspection} from '../contracts/recovery.ts'
type Dependencies = { metrics?:UsMetricsCoordinator;application: Application;catalogLaunch?:BmadCatalogLaunchCoordinator;contexts?:BmadContextCoordinator;help?:BmadHelpCoordinator;recovery?:RunRecoveryPort;inspectApproval?(rootPath:string,files:ApprovalFile[]):Promise<FileInspection>; workflows?: WorkflowPort;questions?:QuestionPort;approvals?:ApprovalPort; copyText?(value: string): Promise<void>; qualify(rootPath: string, signal: AbortSignal): Promise<BmadProfile>; qualifyForge?(rootPath: string, signal: AbortSignal): Promise<BmadProfile>; qualifyClaude?(rootPath: string, signal: AbortSignal): Promise<BmadProfile>; openClaude?(profile:BmadProfile, captured:CapturedBmadContext, signal:AbortSignal, assertContext:(submit?:()=>void)=>Promise<void>):Promise<DialogueSession>; open(profile: BmadProfile, signal: AbortSignal, activity: (text: string) => void, assertContext?:()=>Promise<void>): Promise<DialogueSession> }
/** Une seule session native possédée. Les travaux longs ne monopolisent jamais la queue disque. */
export class DialogueCoordinator {
  private state = initialDialogueState()
  private listeners = new Set<(state: DialogueState) => void>()
  private active: Promise<void> | null = null
  private controller: AbortController | null = null
  private session: DialogueSession | null = null
  private stopControl: Pick<DialogueSession,'stop'> | null = null
  private closing = false
  private blocked = false
  private restored = false
  private qualifiedForge: { projectId: string; profile: BmadProfile } | null = null
  private catalog:ResolvedCatalogLaunch|null=null
  private capturedContext:CapturedBmadContext|null=null
  private contextRefusal=false
  private async assertCaptured():Promise<void>{if(this.catalog)await this.catalog.assertFresh();if(this.capturedContext&&this.deps.contexts)try{await this.deps.contexts.assertFresh(this.capturedContext,this.controller!.signal)}catch(e){if((e as {code?:string}).code==='PROFILE_CHANGED')this.contextRefusal=true;throw e}}
  private turnSequence = 0
  private questionWrites:Promise<unknown>=Promise.resolve()
  private questionLocks=new Set<string>()
  private answerSettlements=new Map<string,Promise<void>>()
  private questionResponders=new Map<string,QuestionResponder>()
  private approvalWrites:Promise<unknown>=Promise.resolve()
  private approvalLocks=new Set<string>()
  private approvalSettlements=new Map<string,Promise<void>>()
  private approvalEffects=new Set<Promise<void>>()
  private approvalResponders=new Map<string,ApprovalResponder>()
  private restoration:Promise<void>|null=null
  private deps: Dependencies
  constructor(deps: Dependencies) { this.deps = deps;deps.application.subscribe(()=>{if(this.approvalResponders.size)void deps.application.execute({contractVersion:1,correlationId:'approval-context-check',type:'read-state'}).then(reply=>{if(reply.ok&&reply.value.state.activeProjectId!==this.state.context.projectId){this.invalidateApprovals('changed');this.controller?.abort()}})}) }
  markRecoveryUnknown():void{this.blocked=true;this.controller?.abort();this.update({status:'unknown',errorCode:'STOP_UNCONFIRMED',recovery:{...this.state.recovery,stop:'unconfirmed'}})}
  read(): DialogueState { return structuredClone(this.state) }
  private outputFull():boolean{return this.state.messages.length>MAX_SESSION_MESSAGES-MAX_TURN_MESSAGES||this.state.messages.reduce((n,m)=>n+m.text.length,0)>MAX_SESSION_TEXT-MAX_DRAFT_LENGTH}
  subscribe(listener: (state: DialogueState) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  private update(change: Partial<DialogueState>): void { this.state = { ...this.state, ...change, sequence: this.state.sequence + 1 }; for (const listener of this.listeners) { try { listener(this.read()) } catch { /* Observer sans posséder le travail. */ } } }
  private activity = (text: string): void => { this.update({ activities: [...this.state.activities, text.slice(0, 500)].slice(-80) }) }
  async execute(input: unknown): Promise<DialogueState> {
    if (!isDialogueCommand(input)) return { ...this.read(), errorCode: 'INVALID_COMMAND' }
    if(!this.restored){try{this.restoration??=(async()=>{const workflows=await this.deps.workflows?.read()??[],questions=await this.deps.questions?.read()??[],approvals=await this.deps.approvals?.read()??[];if(approvals.length>MAX_APPROVALS||!approvals.every(isApprovalRecord))throw dialogueFailure('STORAGE_READ_FAILED');if(workflows.length>MAX_WORKFLOWS||questions.length>MAX_QUESTIONS||!questions.every(isQuestionRecord))throw dialogueFailure('STORAGE_READ_FAILED');this.update({workflows,approvals:approvals.map(a=>({...a,status:a.effect==='unknown'||a.effect==='pending'&&a.decision!==null||a.status==='unknown'?'unknown' as const:'inactive' as const,reason:'reopened' as const,effect:a.effect==='pending'&&a.decision!==null?'unknown' as const:a.effect,adjustmentStatus:a.adjustmentStatus==='sending'?'unknown' as const:a.adjustmentStatus})),questions:questions.map(q=>q.status==='sent'?q:{...q,status:q.status==='sending'||q.status==='unknown'?'unknown':'inactive',reason:'reopened'})});this.update({recovery:{...this.state.recovery,capabilities:{...this.state.recovery.capabilities,inspectFiles:!!this.deps.inspectApproval}}});if(this.deps.recovery&&await this.deps.recovery.status()!=='stopped'){this.blocked=true;this.update({status:'unknown',errorCode:'STOP_UNCONFIRMED',recovery:{...this.state.recovery,stop:'unconfirmed'}})}this.restored=true})();await this.restoration}catch{this.restoration=null;this.blocked=true;this.update({status:'unknown',errorCode:'STORAGE_READ_FAILED',recovery:{...this.state.recovery,stop:'unconfirmed'}});return this.read()}}
    if (input.type === 'read') return this.read()
    if (this.closing) return { ...this.read(), errorCode: 'APP_CLOSING' }
    if(input.type==='save-approval'||input.type==='decide-approval'||input.type==='send-adjustment')return this.approvalCommand(input)
    if(input.type==='save-question'||input.type==='answer-question')return this.questionCommand(input)
    if(input.type==='copy-workflow'){
      const record=this.state.workflows.find(w=>w.conversationId===input.conversationId),text=input.target==='invocation'?record?.invocation:record?.workspace
      if(!text||!this.deps.copyText)return {...this.read(),errorCode:'INVALID_COMMAND'}
      try{await this.deps.copyText(text);this.update({errorCode:null});this.activity(input.target==='invocation'?'Invocation copiée.':'Chemin copié.');return this.read()}catch{return {...this.read(),errorCode:'OUTPUT_REFUSED'}}
    }
    if(input.type==='observe-stop'){if(this.active)return {...this.read(),errorCode:'BUSY'};this.invalidateQuestions('stopped');this.invalidateApprovals('stopped');this.controller?.abort();this.controller=new AbortController();this.update({status:'stopping'});this.schedule(()=>this.stop());return this.read()}
    if (input.type === 'stop') { if (!this.active && !this.session && !this.stopControl) return this.read();this.invalidateQuestions('stopped');this.invalidateApprovals('stopped'); this.controller?.abort(); this.update({ status: 'stopping' }); if (!this.active) this.schedule(() => this.stop()); return this.read() }
    if (this.blocked) return { ...this.read(), errorCode: 'STOP_UNCONFIRMED' }
    if (this.active) return { ...this.read(), errorCode: 'BUSY' }
    if(input.type==='inspect-approval'){if(this.session)return {...this.read(),errorCode:'BUSY'};this.controller=new AbortController();this.update({status:'inspecting'});this.schedule(()=>this.inspect(input.approvalId));return this.read()}
    if ((input.type==='send'||input.type==='launch'||input.type==='launch-forge'||input.type==='launch-help'||input.type==='launch-catalog'||input.type==='launch-claude')&&this.outputFull())return {...this.read(),errorCode:'OUTPUT_REFUSED'}
    if (input.type === 'send') {
      if (!this.session || input.projectId !== this.state.context.projectId || input.conversationId !== this.state.context.conversationId || this.state.status !== 'ready') return { ...this.read(), errorCode: 'CONTEXT_MISMATCH' }
      this.update({ status: 'running', acknowledged: false, errorCode: null })
      this.schedule(() => this.turn(input))
    } else if ('projectId' in input) {
      if (this.session) return { ...this.read(), errorCode: 'BUSY' }
      if(input.type!=='launch-forge')this.qualifiedForge=null
      this.catalog=null
      this.controller = new AbortController()
      this.update({ status: 'qualifying', context: { ...initialDialogueState().context, projectId: input.projectId, providerId:input.type==='launch-claude'?'claude-code':null }, mode:input.type==='launch'?(input.mode??'read-only'):'read-only',invocation:input.type==='launch-help'?'$bmad':input.type.endsWith('forge')?'$bmad-forge-idea':'$bmad-agent-analyst', acknowledged: false, errorCode: null, profile: input.type==='launch-forge'?this.state.profile:null, activities: [], turn:null })
      this.schedule(() => this.launch(input))
    }
    return this.read()
  }
  private approval(id:string):ApprovalRecord|undefined{return this.state.approvals.find(a=>a.id===id)}
  private uncertain(projectId:string):ApprovalRecord[]{return this.state.approvals.filter(a=>a.context.projectId===projectId&&a.decision==='accept'&&(['unknown','pending'].includes(a.effect)||a.storage!=='stored'))}
  private async currentProject(projectId:string):Promise<void>{const current=await this.deps.application.execute({contractVersion:1,correlationId:'recovery-context',type:'read-state'});if(!current.ok||current.value.state.activeProjectId!==projectId)throw dialogueFailure('CONTEXT_MISMATCH');this.controller?.signal.throwIfAborted()}
  private async inspect(id:string):Promise<void>{
    const record=this.approval(id)
    if(!record||!this.uncertain(record.context.projectId!).some(a=>a.id===id)||!this.deps.inspectApproval)throw dialogueFailure('INVALID_COMMAND')
    this.update({recovery:{...this.state.recovery,observations:this.state.recovery.observations.filter(o=>o.approvalId!==id)}})
    await this.currentProject(record.context.projectId!)
    const project=await this.deps.application.dialogueProject(record.context.projectId!),observation=await this.deps.inspectApproval(project.rootPath,record.files)
    await this.currentProject(project.id)
    this.update({status:'stopped',errorCode:null,recovery:{...this.state.recovery,observations:[...this.state.recovery.observations,{...observation,approvalId:id,observedAt:new Date().toISOString()}]}})
    this.activity('Inspection locale datée · résultat natif historique toujours inconnu')
  }
  private async freshInspections(projectId:string,effects:boolean):Promise<void>{
    await this.currentProject(projectId)
    if(!effects)return
    for(const record of this.uncertain(projectId)){
      const observation=this.state.recovery.observations.find(o=>o.approvalId===record.id)
      if(record.storage!=='stored'||!observation||!this.deps.inspectApproval)throw dialogueFailure('INSPECTION_REQUIRED')
      if(['mixed','diverged'].includes(observation.outcome))throw dialogueFailure('INSPECTION_CONFLICT')
      const age=Date.now()-Date.parse(observation.observedAt)
      if(age<0||age>INSPECTION_MAX_AGE_MS)throw dialogueFailure('INSPECTION_STALE')
      const project=await this.deps.application.dialogueProject(projectId),current=await this.deps.inspectApproval(project.rootPath,record.files)
      if(JSON.stringify(current)!==JSON.stringify({outcome:observation.outcome,files:observation.files}))throw dialogueFailure('INSPECTION_STALE')
    }
    await this.currentProject(projectId)
  }
  private projectApproval(record:ApprovalRecord):void{this.update({approvals:this.state.approvals.some(a=>a.id===record.id)?this.state.approvals.map(a=>a.id===record.id?record:a):[...this.state.approvals,record]})}
  private writeApproval(record:ApprovalRecord):Promise<void>{
    const candidate={...structuredClone(record),storage:'stored' as const}
    const result=this.approvalWrites.then(async()=>{if(!this.deps.approvals)throw dialogueFailure('STORAGE_WRITE_FAILED');await this.deps.approvals.write(candidate);const current=this.approval(record.id);if(current?.revision===candidate.revision)this.projectApproval({...current,storage:'stored'})})
    this.approvalWrites=result.catch(()=>{});return result
  }
  private invalidateApproval(id:string,reason:ApprovalRecord['reason']):void{
    this.approvalResponders.delete(id);const current=this.approval(id)
    if(!current||!['waiting','sending','decided'].includes(current.status)||!['pending','unknown'].includes(current.effect))return
    const next={...current,status:current.decision===null?'inactive' as const:'unknown' as const,reason,effect:'unknown' as const,revision:current.revision+1,storage:'pending' as const};this.projectApproval(next)
    void this.writeApproval(next).catch(()=>{const latest=this.approval(id);if(latest)this.projectApproval({...latest,storage:'failed'});this.update({errorCode:'STORAGE_WRITE_FAILED'})})
  }
  private invalidateApprovals(reason:ApprovalRecord['reason']):void{for(const id of this.approvalResponders.keys())this.invalidateApproval(id,reason)}
  private async approvalCommand(input:Extract<DialogueCommand,{approvalId:string}>):Promise<DialogueState>{
    const current=this.approval(input.approvalId);if(!current)return {...this.read(),errorCode:'INVALID_COMMAND'}
    if(this.approvalLocks.has(current.id))return {...this.read(),errorCode:'BUSY'}
    const responder=this.approvalResponders.get(current.id)
    if(input.type==='send-adjustment'&&this.outputFull())return {...this.read(),errorCode:'OUTPUT_REFUSED'}
    if(input.type==='save-approval'&&current.adjustmentStatus!=='draft')return {...this.read(),errorCode:'CONTEXT_MISMATCH'}
    if(input.type==='decide-approval'&&(!responder||current.status!=='waiting'||current.turnId!==this.state.turn?.id||JSON.stringify(current.context)!==JSON.stringify(this.state.context)||this.controller?.signal.aborted||Date.now()>=current.expiresAt))return {...this.read(),errorCode:'CONTEXT_MISMATCH'}
    if(input.type==='send-adjustment'&&(!this.session||this.active||this.state.status!=='ready'||current.decision!=='decline'||current.effect!=='declined'||current.transmission!=='sent'||!current.adjustment.trim()||current.adjustmentStatus!=='draft'||JSON.stringify(current.context)!==JSON.stringify(this.state.context)))return {...this.read(),errorCode:'CONTEXT_MISMATCH'}
    const controller=this.controller,context=JSON.stringify(this.state.context),ownsSession=():boolean=>this.controller===controller&&JSON.stringify(this.state.context)===context
    // Verrou et settlement installés avant le premier await (disque ou contexte).
    const previousAcknowledged=this.state.acknowledged
    this.approvalLocks.add(current.id);let settled=():void=>{};if(input.type==='decide-approval')this.approvalSettlements.set(current.id,new Promise<void>(r=>settled=r))
    if(input.type==='send-adjustment')this.update({status:'running',acknowledged:false,errorCode:null})
    const next:ApprovalRecord={...current,...(input.type==='save-approval'?{adjustment:input.adjustment}:input.type==='decide-approval'?{status:'sending',decision:input.decision,transmission:'pending'}:{adjustmentStatus:'sending'}),revision:current.revision+1,storage:'pending'};this.projectApproval(next)
    try{
      await this.writeApproval(next)
      if(input.type!=='save-approval'){
        const active=await this.deps.application.execute({contractVersion:1,correlationId:'approval-context-check',type:'read-state'})
        if(!ownsSession()||!active.ok||active.value.state.activeProjectId!==current.context.projectId||controller?.signal.aborted)throw dialogueFailure('CONTEXT_MISMATCH')
      }
      if(input.type==='decide-approval'){
        if(!ownsSession()||this.approvalResponders.get(current.id)!==responder||this.approval(current.id)?.status!=='sending'||Date.now()>=current.expiresAt)throw dialogueFailure('CONTEXT_MISMATCH')
        if(input.decision==='accept')await this.assertCaptured()
        await responder!.decide(input.decision)
        const latest=this.approval(current.id)!;if(!ownsSession()||latest.status!=='sending'||this.approvalResponders.get(current.id)!==responder||controller?.signal.aborted)throw dialogueFailure('CONTEXT_MISMATCH')
        const sent={...latest,status:'decided' as const,transmission:'sent' as const,revision:latest.revision+1,storage:'pending' as const};this.projectApproval(sent);await this.writeApproval(sent)
      }else if(input.type==='send-adjustment'){
        if(!ownsSession()||this.state.status!=='running'||this.active||!this.session||controller?.signal.aborted)throw dialogueFailure('CONTEXT_MISMATCH')
        this.schedule(async()=>{try{await this.turn({contractVersion:1,correlationId:input.correlationId,type:'send',projectId:current.context.projectId!,conversationId:current.context.conversationId!,text:current.adjustment,...(input.metricsChoice?{metricsChoice:input.metricsChoice}:{})},undefined,undefined,{type:'send-adjustment',approvalId:input.approvalId});const latest=this.approval(current.id)!;const sent={...latest,adjustmentStatus:'sent' as const,revision:latest.revision+1,storage:'pending' as const};this.projectApproval(sent);await this.writeApproval(sent)}catch(error){const latest=this.approval(current.id)!;const unknown={...latest,adjustmentStatus:'unknown' as const,revision:latest.revision+1,storage:'pending' as const};this.projectApproval(unknown);await this.writeApproval(unknown);throw error}})
      }
      if(ownsSession()&&this.state.errorCode==='STORAGE_WRITE_FAILED')this.update({errorCode:null})
      return this.read()
    }catch(error){
      const latest=this.approval(current.id)!,code=dialogueError(error,'STORAGE_WRITE_FAILED')
      if(input.type==='decide-approval'){this.approvalResponders.delete(current.id);const unknown={...latest,status:'unknown' as const,transmission:latest.transmission==='sent'?'sent' as const:'unknown' as const,effect:'unknown' as const,reason:'failed' as const,revision:latest.revision+1,storage:'pending' as const};this.projectApproval(unknown);try{await this.writeApproval(unknown)}catch{this.projectApproval({...unknown,storage:'failed'})}if(ownsSession())controller?.abort()}
      else if(input.type==='send-adjustment'){
        const draft={...latest,adjustmentStatus:'draft' as const,revision:latest.revision+1,storage:'pending' as const};this.projectApproval(draft)
        try{await this.writeApproval(draft)}catch{this.projectApproval({...draft,storage:'failed'})}
        if(ownsSession()&&this.state.status==='running'&&!controller?.signal.aborted&&this.session)this.update({status:'ready',acknowledged:previousAcknowledged})
      }else this.projectApproval({...latest,storage:'failed'})
      if(ownsSession())this.update({errorCode:code});return this.read()
    }finally{this.approvalLocks.delete(current.id);this.approvalSettlements.delete(current.id);settled()}
  }
  private question(id:string):QuestionRecord|undefined{return this.state.questions.find(q=>q.id===id)}
  private projectQuestion(record:QuestionRecord):void{this.update({questions:this.state.questions.some(q=>q.id===record.id)?this.state.questions.map(q=>q.id===record.id?record:q):[...this.state.questions,record]})}
  private writeQuestion(record:QuestionRecord):Promise<void>{
    const candidate={...structuredClone(record),storage:'stored' as const}
    const result=this.questionWrites.then(async()=>{if(!this.deps.questions)throw dialogueFailure('STORAGE_WRITE_FAILED');await this.deps.questions.write(candidate);const current=this.question(record.id);if(current?.revision===candidate.revision&&current.status===candidate.status)this.projectQuestion({...current,storage:'stored'})})
    this.questionWrites=result.catch(()=>{});return result
  }
  private invalidateQuestion(id:string,reason:QuestionRecord['reason']):void{
    this.questionResponders.delete(id);const current=this.question(id)
    if(!current||!['waiting','sending'].includes(current.status))return
    const next={...current,status:'inactive' as const,reason,revision:current.revision+1,storage:'pending' as const};this.projectQuestion(next)
    void this.writeQuestion(next).catch(()=>{const latest=this.question(id);if(latest)this.projectQuestion({...latest,storage:'failed'});this.update({errorCode:'STORAGE_WRITE_FAILED'})})
  }
  private invalidateQuestions(reason:QuestionRecord['reason']):void{for(const id of this.questionResponders.keys())this.invalidateQuestion(id,reason)}
  private async questionCommand(input:Extract<DialogueCommand,{questionId:string}>):Promise<DialogueState>{
    const current=this.question(input.questionId)
    if(!current||!validQuestionValues(current.fields,input.values,input.type==='answer-question'))return {...this.read(),errorCode:'INVALID_COMMAND'}
    if(this.questionLocks.has(current.id))return {...this.read(),errorCode:'BUSY'}
    const responder=this.questionResponders.get(current.id)
    if(input.type==='answer-question'&&(!responder||current.status!=='waiting'||current.turnId!==this.state.turn?.id||current.context.conversationId!==this.state.context.conversationId||this.controller?.signal.aborted))return {...this.read(),errorCode:'CONTEXT_MISMATCH'}
    if(current.status==='sent')return {...this.read(),errorCode:'CONTEXT_MISMATCH'}
    let settled=():void=>{}
    if(input.type==='answer-question'){this.questionLocks.add(current.id);this.answerSettlements.set(current.id,new Promise<void>(resolve=>settled=resolve))}
    const next={...current,values:structuredClone(input.values),status:input.type==='answer-question'?'sending' as const:current.status,revision:current.revision+1,storage:'pending' as const};this.projectQuestion(next)
    try{
      await this.writeQuestion(next)
      if(input.type==='answer-question'){
        if(this.questionResponders.get(current.id)!==responder||this.question(current.id)?.status!=='sending'||this.controller?.signal.aborted||current.expiresAt!==null&&Date.now()>=current.expiresAt){this.invalidateQuestion(current.id,current.expiresAt!==null&&Date.now()>=current.expiresAt?'expired':'resolved');return {...this.read(),errorCode:'CONTEXT_MISMATCH'}}
        await this.assertCaptured()
        if(this.questionResponders.get(current.id)!==responder||this.question(current.id)?.status!=='sending'||this.controller?.signal.aborted)throw dialogueFailure('CONTEXT_MISMATCH')
        await responder!.answer(structuredClone(input.values))
        // Le reçu natif atteste l’envoi ; l’UI attend encore l’écriture atomique.
        const latest=this.question(current.id)!
        if(latest.status!=='sending'||this.controller?.signal.aborted)return {...this.read(),errorCode:'CONTEXT_MISMATCH'}
        const sent={...latest,status:'sent' as const,reason:null,revision:latest.revision+1,storage:'pending' as const}
        await this.writeQuestion(sent)
        const afterWrite=this.question(current.id)
        if(afterWrite?.status!=='sending'||afterWrite.revision!==latest.revision||this.questionResponders.get(current.id)!==responder||this.controller?.signal.aborted){await this.questionWrites;return {...this.read(),errorCode:this.state.errorCode??'CONTEXT_MISMATCH'}}
        this.projectQuestion({...sent,storage:'stored'});this.questionResponders.delete(current.id)
        if(this.state.status==='waiting-question')this.update({status:'running',errorCode:null})
      }
      if(this.state.errorCode==='STORAGE_WRITE_FAILED'||this.state.errorCode==='OUTPUT_CONFLICT')this.update({errorCode:null})
      return this.read()
    }catch(error){
      const latest=this.question(current.id)!;let code=dialogueError(error,'STORAGE_WRITE_FAILED')
      if(input.type==='answer-question'){
        const unknown={...latest,status:'unknown' as const,reason:'failed' as const,revision:latest.revision+1,storage:'pending' as const}
        this.projectQuestion(unknown);this.questionResponders.delete(current.id);this.controller?.abort()
        try{await this.writeQuestion(unknown)}catch(storageError){code=dialogueError(storageError,'STORAGE_WRITE_FAILED');this.projectQuestion({...unknown,storage:'failed'})}
      }else this.projectQuestion({...latest,storage:'failed'})
      this.update({errorCode:code})
      return {...this.read(),errorCode:code}
    }finally{this.questionLocks.delete(current.id);this.answerSettlements.delete(current.id);settled()}
  }
  private schedule(work: () => Promise<void>): void { this.active = Promise.resolve().then(async () => { await work(); if (this.controller?.signal.aborted && this.session) await this.stop() }).catch(async error => {
    const reported = dialogueError(error, this.controller?.signal.aborted ? 'CANCELLED' : 'PROVIDER_FAILED')
    const code = this.contextRefusal&&reported!=='EFFECT_UNKNOWN'&&reported!=='STOP_UNCONFIRMED'?'PROFILE_CHANGED':reported
    let stopped = await this.stopSession()
    if (code === 'STOP_UNCONFIRMED') {stopped = 'unknown';this.update({recovery:{...this.state.recovery,stop:'unconfirmed'}})}
    if (stopped === 'unknown') this.blocked = true
    if(this.state.turn)this.update({turn:{...this.state.turn,phase:stopped==='unknown'?'unknown':'interrupted'}})
    this.update({ status: stopped === 'unknown' ? 'unknown' : code === 'CANCELLED' ? 'stopped' : 'error', errorCode: stopped === 'unknown' ? 'STOP_UNCONFIRMED' : code })
    if(this.catalog)await this.deps.catalogLaunch!.failed(this.state.context.conversationId)
    await this.persistActivity(stopped === 'unknown' ? 'unknown' : 'interrupted').catch(() => this.update({ status: 'unknown', errorCode: stopped==='unknown'?'STOP_UNCONFIRMED':'STORAGE_WRITE_FAILED' }))
  }).finally(() => { this.active = null }) }
  private async launch(input: Extract<DialogueCommand, { projectId: string }> & {type:'qualify'|'launch'|'qualify-forge'|'launch-forge'|'launch-help'|'launch-catalog'|'launch-claude'}): Promise<void> {
    this.contextRefusal=false
    const prepared=this.qualifiedForge
    if(input.type==='launch-forge'){
      if(!prepared||prepared.projectId!==input.projectId)throw dialogueFailure('PROFILE_UNRECOGNIZED')
      if(this.state.workflows.length>=MAX_WORKFLOWS)throw dialogueFailure('OUTPUT_REFUSED')
    }
    const claude = input.type === 'launch-claude'
    if(claude)await this.currentProject(input.projectId)
    const project = await this.deps.application.dialogueProject(input.projectId)
    const qualify=claude?this.deps.qualifyClaude:input.type.endsWith('forge')?this.deps.qualifyForge:this.deps.qualify
    if(!qualify)throw dialogueFailure('UNSUPPORTED_INTERACTION')
    if(input.type==='launch-catalog'){
      if(!this.deps.catalogLaunch)throw dialogueFailure('UNSUPPORTED_INTERACTION')
      this.catalog=await this.deps.catalogLaunch.consume(project.id,input.preparationId,this.controller!.signal)
      this.update({mode:this.catalog.preparation.mode,invocation:('$'+this.catalog.preparation.itemId) as DialogueState['invocation']})
    }
    const profile = this.catalog?this.catalog.profile:{...await (input.type==='launch-help'?this.deps.help!.profile(project.id,this.controller!.signal):qualify(project.rootPath, this.controller!.signal)),mode:this.state.mode}
    this.controller!.signal.throwIfAborted()
    if(this.catalog&&profile.kind==='forge'&&this.state.workflows.length>=MAX_WORKFLOWS)throw dialogueFailure('OUTPUT_REFUSED')
    if(input.type==='launch-forge'){
      const previous=prepared!.profile
      if(profile.kind!=='forge'||!profile.forge||profile.rootPath!==previous.rootPath||profile.fingerprint!==previous.fingerprint||profile.skillPath!==previous.skillPath||profile.forge.outputBase!==previous.forge!.outputBase||profile.forge.initiativeId!==previous.forge!.initiativeId||profile.forge.contextDigest!==previous.forge!.contextDigest)throw dialogueFailure('PROFILE_CHANGED')
    }
    if(input.type==='qualify-forge'){
      if(profile.kind!=='forge'||!profile.forge)throw dialogueFailure('PROFILE_UNRECOGNIZED')
      this.qualifiedForge={projectId:input.projectId,profile:structuredClone(profile)}
    }
    this.update({ status: 'qualified', profile: { fingerprint: profile.fingerprint, skillPath: profile.skillPath,...(profile.forge?{outputBase:profile.forge.outputBase}:{}) } })
    this.activity(profile.kind==='help'?'Aides BMad, contexte et sources vérifiés · lecture seule':profile.kind==='forge'?'Profil Forge, roster, hooks, sorties et dépendances vérifiés':'Profil Mary et dépendances vérifiés · lecture seule')
    if (input.type.startsWith('qualify')) return
    this.update({ status: 'starting' })
    await this.freshInspections(project.id,profile.kind==='forge'||profile.mode==='file-approval');
    this.capturedContext=this.catalog?this.catalog.preparation.captured:this.deps.contexts?await this.deps.contexts.capture(project.id,(profile.kind==='forge'&&profile.forge?.initiativeId!=null)||(profile.kind==='help'&&profile.help?.initiativeId!=null),this.controller!.signal):null
    await this.assertCaptured()
    if(this.capturedContext&&((profile.kind==='forge'&&profile.forge?.initiativeId!==this.capturedContext.initiativeId)||(profile.kind==='help'&&profile.help?.initiativeId!==this.capturedContext.initiativeId)))throw dialogueFailure('PROFILE_CHANGED')
    const captured=this.capturedContext,controller=this.controller!
    const catalog=this.catalog
    const assertContext=async():Promise<void>=>{if(catalog)await catalog.assertFresh();if(!captured||!this.deps.contexts)return;try{await this.deps.contexts.assertFresh(captured,controller.signal)}catch(e){if(this.capturedContext===captured&&this.controller===controller&&(e as {code?:string}).code==='PROFILE_CHANGED')this.contextRefusal=true;throw e}}
    if (claude) {
      if (!captured || !this.deps.openClaude) throw dialogueFailure('UNSUPPORTED_INTERACTION')
      if (!['valid','absent'].includes(captured.observation.activeStatus)) throw dialogueFailure('CONTEXT_MISMATCH')
      const assertClaudeContext=async(submit?:()=>void):Promise<void>=>{
        if(submit)return this.deps.application.dialogueSubmit(project.id,controller.signal,submit)
        await assertContext()
        await this.currentProject(project.id)
      }
      await assertClaudeContext()
      this.session=await this.deps.openClaude(profile,captured,controller.signal,assertClaudeContext)
    } else this.session = await this.deps.open(profile, controller.signal, this.activity,assertContext)
    this.stopControl=this.session
    if(this.catalog&&(!this.catalog.connectionId||this.session.context.connectionId!==this.catalog.connectionId))throw dialogueFailure('PROFILE_CHANGED')
    this.controller!.signal.throwIfAborted()
    await this.assertCaptured()
    if(this.capturedContext&&this.session.context.initiativeId!==this.capturedContext.initiativeId)throw dialogueFailure('PROFILE_CHANGED')
    const conversation = await this.deps.application.dialoguePersist(project.id, null, value => { value.lastKnownActivity = 'running' }, {...this.session.context,providerId:claude?'claude-code':'codex'},input.correlationId)
    this.update({ context: conversation.context })
    if(this.catalog){await this.catalog.assertFresh();await this.deps.catalogLaunch!.begin(this.catalog.preparation,conversation.context,input.correlationId);await this.catalog.assertFresh()}
    if(this.session.help){if(!this.deps.help)throw dialogueFailure('STORAGE_WRITE_FAILED');await this.deps.help.begin(this.session.help.bundle,conversation.context);this.session.help.bind(r=>this.deps.help!.tool(conversation.id,r))}
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
    if (claude) { await this.turn(null,input.correlationId); return }
    await this.turn(null,input.correlationId,input.metricsChoice,input.type==='launch'?{type:'launch',mode:input.mode??'read-only'}:input.type==='launch-catalog'?{type:'launch-catalog',preparationId:input.preparationId}:{type:input.type as 'launch-help'|'launch-forge'})
  }
  private async turn(input: Extract<DialogueCommand, { type: 'send' }> | null, launchRequest?:string,launchChoice?:string,operation:MetricOperation={type:'send'}): Promise<void> {
    const controller=this.controller,ownsTurn=():boolean=>this.controller===controller
    const context=structuredClone(this.state.context),{ projectId, conversationId } = context
    if (!projectId || !conversationId || !this.session) throw dialogueFailure('CONTEXT_MISMATCH')
    const claude=context.providerId==='claude-code'
    // Recontrôler aussi après l'ouverture (OAuth/préparation peuvent avoir pris du temps).
    await this.assertCaptured()
    await this.freshInspections(projectId,this.state.mode==='file-approval'||this.state.invocation==='$bmad-forge-idea')
    const requestId=input?.correlationId??launchRequest!,turnId='turn-'+ ++this.turnSequence,updates=new Map<string,DialogueMessage>(),dirty=new Set<string>()
    const sourceIds=new Map<string,string>()
    const onQuestion:QuestionObserver=async(question,responder)=>{
      await Promise.all(this.answerSettlements.values())
      if(closed||!acknowledged||this.controller?.signal.aborted||!isQuestionFields(question.fields)||!isMessageIdentity(question.identity)||this.state.questions.length>=MAX_QUESTIONS||this.questionResponders.size)throw dialogueFailure('UNSUPPORTED_INTERACTION')
      const record:QuestionRecord={schemaVersion:1,id:'question-'+randomUUID(),context,requestId,turnId,identity:structuredClone(question.identity),fields:structuredClone(question.fields),values:{},status:'waiting',reason:null,createdAt:new Date().toISOString(),expiresAt:question.expiresAt,revision:1,storage:'pending'}
      if(!isQuestionRecord(record))throw dialogueFailure('UNSUPPORTED_INTERACTION')
      this.questionResponders.set(record.id,responder);this.projectQuestion(record);this.update({status:'waiting-question'})
      void responder.invalidated.then(()=>this.invalidateQuestion(record.id,record.expiresAt!==null&&Date.now()>=record.expiresAt?'expired':'resolved'))
      try{await this.writeQuestion(record)}catch(error){this.invalidateQuestion(record.id,'failed');this.controller?.abort();throw error}
    }
    const onApproval:ApprovalObserver=async(approval,responder)=>{
      await Promise.all(this.approvalSettlements.values());await Promise.all(this.approvalEffects)
      if(closed||!acknowledged||this.state.mode!=='file-approval'||this.state.invocation!=='$bmad-agent-analyst'||this.controller?.signal.aborted||!isApprovalFiles(approval.files)||!isMessageIdentity(approval.identity)||this.state.approvals.length>=MAX_APPROVALS||this.approvalResponders.size||this.questionResponders.size)throw dialogueFailure('UNSUPPORTED_INTERACTION')
      const record:ApprovalRecord={schemaVersion:1,id:'approval-'+randomUUID(),context,requestId,turnId,identity:structuredClone(approval.identity),mode:'file-approval',files:structuredClone(approval.files),reason:null,adjustment:'',adjustmentStatus:'draft',status:'waiting',decision:null,transmission:'none',effect:'pending',result:null,createdAt:new Date().toISOString(),expiresAt:approval.expiresAt,revision:1,storage:'pending'}
      if(!isApprovalRecord(record))throw dialogueFailure('UNSUPPORTED_INTERACTION')
      this.approvalResponders.set(record.id,responder);this.projectApproval(record);this.update({status:'waiting-approval'})
      void responder.invalidated.then(()=>this.invalidateApproval(record.id,Date.now()>=record.expiresAt?'expired':'resolved'))
      const effects=responder.result.then(async result=>{
        await Promise.all(this.approvalSettlements.values())
        if(!isApprovalResult(result))throw dialogueFailure('PROVIDER_FAILED')
        const current=this.approval(record.id);if(!current||current.status!=='decided'||current.transmission!=='sent')return
        const effect=result.files.every(f=>f.matches)?current.decision==='accept'&&result.nativeStatus==='completed'?'succeeded':current.decision==='decline'&&result.nativeStatus==='declined'?'declined':'failed':'unknown'
        const next={...current,effect,result,revision:current.revision+1,storage:'pending' as const} satisfies ApprovalRecord
        this.projectApproval(next);await this.writeApproval(next);this.approvalResponders.delete(record.id)
        if(this.state.status==='waiting-approval')this.update({status:'running'})
      }).catch(async error=>{const latest=this.approval(record.id);if(latest){this.approvalResponders.delete(record.id);const unknown={...latest,status:'unknown' as const,effect:'unknown' as const,reason:'failed' as const,revision:latest.revision+1,storage:'pending' as const};this.projectApproval(unknown);try{await this.writeApproval(unknown)}catch{this.projectApproval({...unknown,storage:'failed'})}}if(ownsTurn()){this.update({errorCode:dialogueError(error,'EFFECT_UNKNOWN')});controller?.abort()}})
      this.approvalEffects.add(effects);void effects.finally(()=>this.approvalEffects.delete(effects))
      try{await this.writeApproval(record)}catch(error){this.invalidateApproval(record.id,'failed');this.controller?.abort();throw error}
    }
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
      if((input?.metricsChoice??launchChoice)&&!this.deps.metrics)throw dialogueFailure('UNSUPPORTED_INTERACTION')
      const instrumentation=claude?undefined:await this.deps.metrics?.capture(context,requestId,turnId,input?.text??null,input?.metricsChoice??launchChoice,operation,controller!.signal)
      const text = await this.session.turn(input?.text ?? null, async () => {
        if(acknowledged)throw dialogueFailure('CONTEXT_MISMATCH')
        if(!input&&this.catalog)await this.deps.catalogLaunch!.acknowledge(conversationId,requestId,turnId)
        await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.messages.push({ id:turnId+'-request', role: 'user', text: input?.text ?? (this.state.invocation==='$bmad'?'$bmad\nQue faire ensuite ?':this.state.invocation) }) },undefined,requestId)
        acknowledged=true;this.update({ status:this.controller?.signal.aborted?'stopping':'running', acknowledged: true,turn:{id:turnId,requestId,context,phase:this.controller?.signal.aborted?'interrupted':'streaming'} }); this.activity(claude?'Envoi local à Claude Code · conversation capturée':'Envoi acquitté par Codex · conversation capturée')
      },observe,onQuestion,onApproval,instrumentation)
      if(this.session.help)await this.deps.help!.response(conversationId,turnId,text,this.session.help.nativeTurn?.())
      await Promise.all(this.answerSettlements.values());await Promise.all(this.approvalSettlements.values());await Promise.all(this.approvalEffects)
      if(!acknowledged||!text.trim())throw dialogueFailure('PROVIDER_FAILED')
      // Compatibilité du port : un adaptateur sans flux peut fournir un unique item final.
      if(!updates.size)observe({id:'final',order:1,text,completed:true,identity:{kind:'unknown'}})
      if([...updates.values()].some(m=>m.phase!=='complete'))throw dialogueFailure('PROVIDER_FAILED')
      if([...updates.values()].map(m=>m.text).join('\n\n')!==text)throw dialogueFailure('PROVIDER_FAILED')
      closed=true;await flush()
      await this.deps.application.dialoguePersist(projectId,conversationId,value=>{value.lastKnownActivity='idle'},undefined,requestId)
      if (claude) {
        const outcome=await this.stopSession()
        if(outcome==='unknown')await this.persistActivity('unknown')
        this.update({status:outcome,errorCode:outcome==='unknown'?'STOP_UNCONFIRMED':null,turn:{id:turnId,requestId,context,phase:'completed'}})
        return
      }
      if (this.controller?.signal.aborted) return
      this.update({ status: 'ready', errorCode: null,turn:{id:turnId,requestId,context,phase:'completed'} }); this.activity('Tour terminé · réponse enregistrée · à vous de répondre')
    }catch(error){
      closed=true
      await flush().catch(()=>{})
      for(const message of updates.values())if(message.phase==='streaming')message.phase='interrupted'
      project();this.update({turn:{id:turnId,requestId,context,phase:'interrupted'}})
      throw storageError??error
    }finally{closed=true;this.invalidateQuestions('stopped');this.invalidateApprovals('stopped');clearTimeout(timer);clearTimeout(projectionTimer);await writing;await this.questionWrites;await this.approvalWrites}
  }
  private async persistActivity(activity: 'idle' | 'interrupted' | 'unknown'): Promise<void> { const { projectId, conversationId } = this.state.context; if (projectId && conversationId) await this.deps.application.dialoguePersist(projectId, conversationId, value => { value.lastKnownActivity = activity },undefined,this.state.turn?.requestId??'dialogue-lifecycle') }
  private async stopSession(recoverShared=false): Promise<'stopped' | 'unknown'> { const control=this.stopControl??this.session;this.session=null;let outcome:'stopped'|'unknown'=this.blocked?'unknown':'stopped';try{if(control)outcome=await control.stop();if(recoverShared&&this.deps.recovery){const aggregate=await this.deps.recovery.observeStop();outcome=control?(outcome==='stopped'&&aggregate==='stopped'?'stopped':'unknown'):aggregate}if(control&&!recoverShared&&this.deps.recovery&&await this.deps.recovery.status()!=='stopped')outcome='unknown'}catch{outcome='unknown'}this.blocked=outcome==='unknown';if(!this.blocked)this.stopControl=null;else if(control)this.stopControl=control;this.update({recovery:{...this.state.recovery,stop:this.blocked?'unconfirmed':'clear'}});return outcome }
  private async stop(): Promise<void> { const outcome = await this.stopSession(true); await this.persistActivity(outcome === 'stopped' ? 'idle' : 'unknown'); this.update({ status: outcome, errorCode: outcome === 'unknown' ? 'STOP_UNCONFIRMED' : null,...(this.state.turn&&this.state.turn.phase!=='completed'?{turn:{...this.state.turn,phase:outcome==='unknown'?'unknown' as const:'interrupted' as const}}:{}) }); this.activity(outcome === 'stopped' ? 'Ressources possédées arrêtées' : 'Arrêt du fournisseur ou de l’outil local non confirmé') }
  async settled(): Promise<void> { await this.active }
  async shutdown(): Promise<'stopped' | 'unknown'> { this.closing = true;this.invalidateQuestions('stopped');this.invalidateApprovals('stopped'); this.controller?.abort(); await this.active;await this.questionWrites;await this.approvalWrites; await this.stop();await this.deps.metrics?.shutdown(); return this.blocked ? 'unknown' : 'stopped' }
}
