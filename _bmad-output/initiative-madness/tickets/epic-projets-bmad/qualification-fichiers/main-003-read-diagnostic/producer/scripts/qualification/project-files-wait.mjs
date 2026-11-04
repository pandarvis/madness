// Bench-only monotone bridge cache. Reading it never starts a helper.
export async function installFilesStateCache(){const cache={latest:null,stop:null};const accept=value=>{if(value?.contractVersion===1&&Number.isSafeInteger(value.sequence)&&(!cache.latest||value.sequence>=cache.latest.sequence))cache.latest=value};cache.stop=globalThis.projectFiles.onChanged(accept);globalThis.__filesBankState=cache;accept(await globalThis.projectFiles.read())}
// The installed poller treats Promises as truthy. This predicate is synchronous.
export function filesStateMatch({referenceId=null,previewStatus=null,resultAction=null,afterSequence=-1}){const state=globalThis.__filesBankState?.latest;if(!state||state.sequence<=afterSequence)return false;const preview=referenceId?state.previews.find(p=>p.referenceId===referenceId):null,result=referenceId?state.results.filter(r=>r.referenceId===referenceId&&(!resultAction||r.action===resultAction)).at(-1):null;if(previewStatus&&preview?.status!==previewStatus||resultAction&&(!result||result.status==='pending'))return false;return {state,preview,result}}

// A retained pre is historical while the new UI request reads. Require the exact live DOM and grant.
export function filesUiReadyMatch({referenceId,afterSequence=-1}){
 const state=globalThis.__filesBankState?.latest,reference=state?.references?.find(r=>r.id===referenceId),preview=state?.previews?.find(p=>p.referenceId===referenceId),panel=document.querySelector('.file-preview')
 if(!state||state.sequence<=afterSequence||!reference?.current||preview?.status!=='ready'||!panel||panel.getAttribute('data-reference-id')!==referenceId||panel.getAttribute('data-preview-status')!=='ready'||panel.getAttribute('data-reference-current')!=='true')return false
 const effects=[...panel.querySelectorAll('[data-file-action]')];if(effects.length!==2||effects.some(button=>button.disabled))return false
 return {sequence:state.sequence,reference,preview}
}
