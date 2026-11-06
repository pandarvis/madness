import {
 sameGraphScope, selectGraphRevalidationTarget, validateGraphScope, validateGraphState, validateGraphSnapshot,
 validateExpectedGraphContext, validateGraphCommand, validateGraphAnalysisEvent
} from '../contracts/bmad-graph.ts'
import type {
 GraphScope, GraphIdentity, GraphSnapshot, GraphState, GraphFreshness,
 GraphIssueCode, GraphValidation, ExpectedGraphContext
} from '../contracts/bmad-graph.ts'

/** Aucun état global, dépendance d'effet ou propriétaire de processus/stockage. */
const rejected = <T>(code:GraphIssueCode,path='$'):GraphValidation<T> => ({ok:false,issues:[{code,path,messageKey:'graph.error.'+code.toLowerCase()}]})
const identityKeys = ['projectId','rootPath','rootIdentity','scopeId','scopeRevision','analysisId','sourceRevision'] as const
const sameIdentity = (a:GraphIdentity,b:GraphIdentity):boolean => identityKeys.every(key=>a[key]===b[key])
const equalSet = (a:string[],b:string[]):boolean => a.length===b.length&&a.every(value=>b.includes(value))
function freshness(expected:ExpectedGraphContext):GraphFreshness {
 return {status:expected.sourceState==='unchanged'?'observed':expected.sourceState==='changed'?'changed':'unverified',sourceRevision:expected.identity.sourceRevision,observedAt:expected.observedAt}
}
export function createGraphState(input:unknown):GraphValidation<GraphState> {
 const scope=validateGraphScope(input)
 if(!scope.ok)return scope
 return {ok:true,value:{
  contractVersion:1,scope:scope.value,lastEventOrder:0,
  activity:{phase:'idle',analysisId:null,sourceRevision:null,correlationId:null,generation:0,outcome:'none',stop:'not-observed'},
  result:{status:'absent',snapshot:null,error:null},lastComplete:null,
  freshness:{status:'unverified',sourceRevision:null,observedAt:null},
  preservation:{status:'unrecorded',durableAnalysisId:null}
 }}
}
export function admitGraphSnapshot(input:unknown,expectedInput:unknown):GraphValidation<{snapshot:GraphSnapshot;freshness:GraphFreshness}> {
 const candidate=validateGraphSnapshot(input)
 if(!candidate.ok)return candidate
 const expected=validateExpectedGraphContext(expectedInput)
 if(!expected.ok)return expected
 const s=candidate.value,e=expected.value
 if(!sameIdentity(s.identity,e.identity))return rejected('CONTEXT_MISMATCH','$.identity')
 const files=new Map(e.corpus.map(file=>[file.relativePath,file]))
 if(s.sources.length!==files.size||s.sources.some(file=>{
  const actual=files.get(file.relativePath)
  return !actual||actual.sha256!==file.sha256||actual.kind!==file.kind||actual.lineCount!==file.lineCount
 }))return rejected('CORPUS_MISMATCH','$.sources')
 if(!equalSet(s.coverage.included,e.coverage.included)||!equalSet(s.coverage.excluded,e.coverage.excluded))return rejected('CONTEXT_MISMATCH','$.coverage')
 return {ok:true,value:{snapshot:s,freshness:freshness(e)}}
}
export function observeGraphSourceRevision(state:GraphState,sourceRevision:string,observedAt:string|null):GraphState{
 const prior=state.result.snapshot??state.lastComplete
 if(!prior||prior.identity.sourceRevision===sourceRevision)return state
 return {...state,freshness:{status:'changed',sourceRevision:prior.identity.sourceRevision,observedAt}}
}
/** Décision seulement. Le propriétaire existant doit encore autoriser et exécuter l'effet. */
export function beginGraphAttempt(input:unknown,expectedInput:unknown,globalGuard:'clear'|'busy'|'stop-unconfirmed'):GraphValidation<GraphState> {
 const state=validateGraphState(input)
 if(!state.ok)return state
 const expected=validateExpectedGraphContext(expectedInput)
 if(!expected.ok)return expected
 const s=state.value,e=expected.value
 if(!['clear','busy','stop-unconfirmed'].includes(globalGuard))return rejected('INVALID_SHAPE','$.globalGuard')
 if(globalGuard==='stop-unconfirmed'||s.activity.stop==='unknown')return rejected('STOP_UNCONFIRMED','$.activity')
 if(globalGuard==='busy'||s.activity.phase==='running'||s.activity.phase==='stop-requested')return rejected('BUSY','$.activity')
 if(!sameGraphScope(s.scope,e.identity))return rejected('CONTEXT_MISMATCH','$.identity')
 if(e.generation<=s.activity.generation||e.identity.analysisId===s.activity.analysisId||e.identity.analysisId===s.lastComplete?.identity.analysisId||e.identity.analysisId===s.result.snapshot?.identity.analysisId)return rejected('SUPERSEDED','$.generation')
 if(e.lastEventOrder!==0)return rejected('EVENT_ORDER','$.lastEventOrder')
 // Starting again drops any prior candidate whose outcome was never established.
 if(s.result.snapshot&&selectGraphRevalidationTarget(s)!==s.result.snapshot){
  s.result={status:'absent',snapshot:null,error:null}
  const retainedRevision=s.lastComplete?.identity.sourceRevision??null
  if(s.freshness.status!=='changed'||s.freshness.sourceRevision!==retainedRevision){
   s.freshness={status:'unverified',sourceRevision:retainedRevision,observedAt:null}
  }
 }
 s.activity={phase:'running',analysisId:e.identity.analysisId,sourceRevision:e.identity.sourceRevision,correlationId:e.correlationId,generation:e.generation,outcome:'unknown',stop:'not-observed'}
 s.lastEventOrder=0
 return {ok:true,value:observeGraphSourceRevision(s,e.identity.sourceRevision,e.observedAt)}
}
export function requestGraphStop(input:unknown,commandInput:unknown):GraphValidation<GraphState> {
 const state=validateGraphState(input)
 if(!state.ok)return state
 const command=validateGraphCommand(commandInput)
 if(!command.ok)return command
 const s=state.value,c=command.value
 if(c.type!=='interrupt')return rejected('INVALID_TRANSITION','$.type')
 if(c.projectId!==s.scope.projectId||c.scopeId!==s.scope.scopeId||c.analysisId!==s.activity.analysisId)return rejected('CONTEXT_MISMATCH','$.analysisId')
 if(s.activity.phase!=='running'&&s.activity.phase!=='stop-requested')return rejected('INVALID_TRANSITION','$.activity.phase')
 s.activity.phase='stop-requested'
 return {ok:true,value:s}
}
export function publishGraphEvent(input:unknown,eventInput:unknown,expectedInput:unknown):GraphValidation<GraphState> {
 const state=validateGraphState(input)
 if(!state.ok)return state
 const event=validateGraphAnalysisEvent(eventInput)
 if(!event.ok)return event
 const expected=validateExpectedGraphContext(expectedInput)
 if(!expected.ok)return expected
 const s=state.value,e=event.value,c=expected.value
 if(!sameGraphScope(s.scope,c.identity)||!sameIdentity(e.identity,c.identity)||e.correlationId!==c.correlationId)return rejected('CONTEXT_MISMATCH','$.identity')
 if(e.generation!==c.generation||s.activity.generation!==c.generation||s.activity.analysisId!==c.identity.analysisId||s.activity.sourceRevision!==c.identity.sourceRevision||s.activity.correlationId!==c.correlationId)return rejected('SUPERSEDED','$.generation')
 if(c.lastEventOrder!==s.lastEventOrder||e.order<=s.lastEventOrder)return rejected('EVENT_ORDER','$.order')
 if(s.activity.phase!=='running'&&s.activity.phase!=='stop-requested')return rejected('INVALID_TRANSITION','$.activity.phase')
 if(e.type==='started'&&s.lastEventOrder!==0)return rejected('INVALID_TRANSITION','$.type')
 // Les faits invalidants concernent aussi le résultat déjà exposé, sans le revalider.
 const displayed=s.result.snapshot??s.lastComplete
 if(displayed&&c.sourceState!=='unchanged'&&(s.freshness.status!=='changed'||s.freshness.sourceRevision!==displayed.identity.sourceRevision)){
  s.freshness={status:c.sourceState==='changed'?'changed':'unverified',sourceRevision:displayed.identity.sourceRevision,observedAt:c.observedAt}
 }
 const currentMutation=s.result.snapshot?.identity.analysisId===c.identity.analysisId&&s.freshness.status==='changed'&&s.freshness.sourceRevision===c.identity.sourceRevision
 if(e.type==='result'){
  if(s.activity.phase==='stop-requested'||s.activity.outcome==='failed'||s.activity.outcome==='incompatible')return rejected('INVALID_TRANSITION','$.activity.phase')
  const admitted=admitGraphSnapshot(e.snapshot,c)
  if(!admitted.ok)return admitted
  s.result={status:admitted.value.snapshot.coverage.status,snapshot:admitted.value.snapshot,error:null}
  if(!currentMutation)s.freshness=admitted.value.freshness
  s.preservation={status:'unrecorded',durableAnalysisId:s.preservation.durableAnalysisId}
  // La réception de données n'atteste pas la fermeture de l'analyse.
 }else if(e.type==='failed'){
  s.result={status:e.error.code==='INCOMPATIBLE'?'incompatible':'failed',snapshot:null,error:e.error}
  const retainedRevision=s.lastComplete?.identity.sourceRevision??null
  const changed=retainedRevision!==null&&(retainedRevision!==c.identity.sourceRevision||c.sourceState==='changed'||currentMutation)
  if(!changed||s.freshness.status!=='changed'||s.freshness.sourceRevision!==retainedRevision){
   const comparedAt=displayed?.identity.sourceRevision!==retainedRevision?displayed?.collectedAt??null:null
   s.freshness={status:changed?'changed':'unverified',sourceRevision:retainedRevision,observedAt:changed?c.observedAt??comparedAt:null}
  }
  s.activity.outcome=e.error.code==='INCOMPATIBLE'?'incompatible':'failed'
  // L'issue logique échouée reste verrouillée sans attester l'arrêt physique.
  // Un échec d'analyse n'établit pas à lui seul l'arrêt physique.
  if(e.error.code==='STOP_UNCONFIRMED'){s.activity.phase='terminal';s.activity.stop='unknown';s.activity.outcome='unknown'}
 }else if(e.type==='stopped'){
  if(e.stop==='unknown'){
   s.activity={...s.activity,phase:'terminal',outcome:'unknown',stop:'unknown'}
  }else{
   if(e.reason==='complete'||e.reason==='partial'){
    if(s.activity.phase==='stop-requested'||s.activity.outcome==='failed'||s.activity.outcome==='incompatible'||s.result.status!==e.reason||s.result.snapshot?.identity.analysisId!==c.identity.analysisId)return rejected('INVALID_TRANSITION','$.reason')
    // Recontrôle des faits du corpus au point de publication terminale.
    const admitted=admitGraphSnapshot(s.result.snapshot,c)
    if(!admitted.ok)return admitted
    if(!currentMutation)s.freshness=admitted.value.freshness
    if(e.reason==='complete'&&s.freshness.status==='observed')s.lastComplete=admitted.value.snapshot
   }else if((e.reason==='failed'||e.reason==='incompatible')&&s.result.status!==e.reason)return rejected('INVALID_TRANSITION','$.reason')
   s.activity={...s.activity,phase:'terminal',outcome:e.reason,stop:'confirmed'}
  }
 }
 s.lastEventOrder=e.order
 // Recopie finale : lastComplete et result ne partagent jamais leurs objets.
 return validateGraphState(s)
}
/** Projection passive : aucun port n'est pris en dépendance et aucune commande n'est produite. */
export function restoreGraphState(input:unknown,scopeInput:unknown):GraphValidation<GraphState> {
 const state=validateGraphState(input)
 if(!state.ok)return state
 const scope=validateGraphScope(scopeInput)
 if(!scope.ok)return scope
 const s=state.value
 if(!sameGraphScope(s.scope,scope.value))return rejected('CONTEXT_MISMATCH','$.scope')
 if(s.activity.phase==='running'||s.activity.phase==='stop-requested'){
  s.activity={...s.activity,phase:'historical',stop:'unknown',outcome:'unknown'}
 }else if(s.activity.phase!=='idle')s.activity.phase='historical'
 if(s.freshness.status==='observed')s.freshness={...s.freshness,status:'unverified'}
 return {ok:true,value:s}
}

