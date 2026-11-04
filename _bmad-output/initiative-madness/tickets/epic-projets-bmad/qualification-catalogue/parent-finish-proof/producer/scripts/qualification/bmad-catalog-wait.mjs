// Bench-only state cache. No collection and no native owner is started here.
export async function installCatalogStateCache(){
 const cache={latest:null,stop:null}
 const accept=state=>{if(state&&state.contractVersion===1&&Number.isSafeInteger(state.sequence)&&state.sequence>=0&&(!cache.latest||state.sequence>=cache.latest.sequence))cache.latest=state}
 cache.stop=globalThis.madnessBmadCatalog.onChanged(accept)
 globalThis.__catalogBankState=cache
 accept(await globalThis.madnessBmadCatalog.read())
}
// Must stay synchronous: the installed poller considers a Promise truthy.
export function catalogReadyMatch({projectId,previousRevision=null,itemId=null,present=true}){
 const state=globalThis.__catalogBankState?.latest,p=state?.projects?.find(p=>p.projectId===projectId)
 if(!p||p.status!=='ready'||p.freshness!=='current'||p.queued||!p.snapshot||p.snapshot.projectId!==projectId)return false
 if(previousRevision!==null&&p.snapshot.revision===previousRevision)return false
 if(itemId!==null&&p.snapshot.items.some(i=>i.id===itemId)!==present)return false
 return {sequence:state.sequence,project:p}
}
