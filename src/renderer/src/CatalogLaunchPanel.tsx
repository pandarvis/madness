import {presentProductText} from './product-copy.ts'
import {useLocale,useLocalText} from './Locale.tsx'
import {useEffect,useRef,useState} from 'react'
import type {ReactNode} from 'react'
import {initialCatalogLaunchState,isCatalogLaunchState} from '../../contracts/bmad-catalog-launch.ts'
import type {CatalogLaunchState,CatalogPreparation,CatalogLaunchRecord} from '../../contracts/bmad-catalog-launch.ts'
export function useCatalogLaunch():[CatalogLaunchState,(s:CatalogLaunchState)=>void]{
 const [state,setState]=useState(initialCatalogLaunchState),sequence=useRef(-1)
 const accept=(s:CatalogLaunchState):void=>{if(isCatalogLaunchState(s)&&s.sequence>=sequence.current){sequence.current=s.sequence;setState(s)}}
 useEffect(()=>{const b=window.madnessCatalogLaunch;if(!b)return;const off=b.onChanged(accept);void b.read().then(accept).catch(()=>{});return off},[])
 return [state,accept]
}
export function CatalogLaunchPanel({preparation,busy,stale,error,onLaunch,onCancel,metricChoice}:{preparation:CatalogPreparation;busy:boolean;stale:boolean;error:string|null;onLaunch:()=>void;onCancel:()=>void;metricChoice?:ReactNode}):ReactNode{
 const {ui,language}=useLocale()

 return <section className="catalog-launch-preparation" aria-labelledby="catalog-launch-heading"><h2 id="catalog-launch-heading" tabIndex={-1}>{ui.preparation} {preparation.itemId}</h2>
 <p>{ui.preparing_transmits_nothing_your_free_draft_stays_separate}</p><dl><dt>{ui.project}</dt><dd><code>{preparation.snapshot.rootPath}</code></dd><dt>{ui.captured_initiative_2}</dt><dd>{preparation.captured.initiativeId??ui.not_identified_2} · {preparation.captured.scope==='initiatives'?ui.matching_madness_selection:ui.configuration_context}</dd><dt>{ui.first_native_input}</dt><dd><pre>{preparation.firstInput}</pre></dd><dt>{ui.profile_permissions_and_effects}</dt><dd>{presentProductText('effects',preparation.effects,language)}{preparation.nativeContext.outputBase&&<p>{ui.authorized_output} <code>{preparation.nativeContext.outputBase}</code></p>}</dd><dt>{ui.documented_inputs_and_conditions}</dt><dd>{ui.unknown_if_absent_from_details_no_field_or_global_approval_added}</dd></dl>
 <details><summary>{ui.captured_descriptor_and_context}</summary><p>{ui.catalogue_revision} <code>{preparation.snapshot.revision}</code> {ui.generation} {preparation.generation}</p><p>{ui.context_2} <code>{preparation.captured.observation.revision}</code></p><p>{ui.winning_source} <code>{preparation.snapshot.sources.find(s=>s.id===preparation.snapshot.items.find(i=>i.id===preparation.itemId)?.sourceId)?.path}</code></p>{preparation.nativeContext.contextDigest&&<p>{ui.native_context} <code>{preparation.nativeContext.contextDigest}</code></p>}{preparation.nativeContext.bundleId&&<p>{ui.captured_help} <code>{preparation.nativeContext.bundleId}</code></p>}<p>{ui.native_profile} <code>{preparation.fingerprint}</code> · <code>{preparation.skillPath}</code></p></details>
 {stale&&<p role="status">{ui.preparation_stale_return_to_details_then_prepare_again}</p>}{error&&<p className="connection-error" role="alert">{presentProductText('diagnostic',error,language)}</p>}
 {metricChoice}<div className="dialogue-actions"><button type="button" className="primary" disabled={busy||stale} onClick={onLaunch}>{busy?ui.launching:ui.start_a_new_conversation}</button><button type="button" className="secondary" disabled={busy} onClick={onCancel}>{ui.cancel_launch}</button></div></section>
}
export function CatalogOrigin({record,onRetry}:{record:CatalogLaunchRecord|undefined;onRetry:(id:string)=>void}):ReactNode{
 const {ui,language}=useLocale()

 if(!record)return null
 const item=record.preparation.snapshot.items.find(i=>i.id===record.preparation.itemId),source=record.preparation.snapshot.sources.find(s=>s.id===item?.sourceId)
 return <details className="dialogue-proof catalog-origin"><summary>{ui.catalogue_origin} {record.preparation.itemId}</summary><p>{record.transmission==='sent'?ui.invocation_acknowledged_by_codex:record.transmission==='unknown'?ui.send_not_confirmed_no_automatic_resend:ui.origin_prepared_invocation_not_acknowledged} · {record.storage==='stored'?ui.origin_saved:ui.local_persistence_not_confirmed_2}.</p><p>{ui.turn_completion_effects_and_human_acceptance_remain_distinct_dial}</p><pre>{record.preparation.firstInput}</pre><p><code>{record.preparation.snapshot.rootPath}</code> · {record.context.initiativeId??ui.no_initiative_2}</p><p>{ui.catalogue} <code>{record.preparation.snapshot.revision}</code> {ui.context_3} <code>{record.preparation.captured.observation.revision}</code></p><p>{ui.request} <code>{record.requestId}</code> {ui.turn} <code>{record.turnId??ui.not_confirmed}</code></p>{source&&<><p>{ui.captured_winning_source} <code>{source.path}</code></p><p>SHA-256 <code>{source.sha256}</code></p><details><summary>{ui.captured_historical_descriptor}</summary><pre>{source.text}</pre></details></>}<p>{presentProductText('effects',record.preparation.effects,language)}</p>{record.preparation.nativeContext.outputBase&&<p>{ui.authorized_output} <code>{record.preparation.nativeContext.outputBase}</code></p>}{record.storage==='failed'&&<button type="button" className="secondary" onClick={()=>onRetry(record.conversationId)}>{ui.retry_save}</button>}</details>
}
