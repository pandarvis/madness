import {useId,useState} from 'react'
import type {ReactNode} from 'react'
import {PUBLIC_KEYS_URL} from '../../contracts/connection.ts'
import type {ConnectionState} from '../../contracts/connection.ts'
import {fr} from './strings.ts'
export function NetworkHelp({connection,onChanged}:{connection:ConnectionState;onChanged:(state:ConnectionState)=>void}):ReactNode{
 const id=useId(),[pending,setPending]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState('')
 const checking=connection.network.status==='checking'
 async function action(kind:'openPublicKeys'|'copyPublicKeys'|'checkPublicKeys'|'cancelPublicKeys'):Promise<void>{
  if(pending)return;setPending(true);setNotice('');setError('')
  try{const reply=await window.madnessConnection[kind]();onChanged(reply.state);if(kind==='copyPublicKeys')setNotice(fr.networkHelp.copied);else if(kind==='openPublicKeys')setNotice(fr.networkHelp.opened)}catch{setError(kind==='copyPublicKeys'?fr.networkHelp.copyFailed:kind==='openPublicKeys'?fr.networkHelp.openFailed:fr.networkHelp.checkFailed)}finally{setPending(false)}
 }
 const network=connection.network
 const status=checking?fr.networkHelp.checking:network.status==='accessible'?fr.networkHelp.accessible+' '+new Date(network.checkedAt!).toLocaleString('fr-FR'):network.status==='error'?fr.networkHelp.checkFailed:network.status==='cancelled'?fr.networkHelp.cancelled:notice
 return <section className="connection-network-help" aria-labelledby={id+'-title'}>
  <h3 id={id+'-title'}>{fr.networkHelp.title}</h3><p>{fr.networkHelp.description}</p>
  <div className="network-help-address"><code>{PUBLIC_KEYS_URL}</code><button className="copy-public-keys" type="button" aria-label={fr.networkHelp.copy} title={fr.networkHelp.copy} onClick={()=>void action('copyPublicKeys')} disabled={pending}><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 9h12v12H9V9ZM5 15H3V3h12v2"/></svg></button></div>
  <div className="network-help-actions"><button className="text-button network-help-open" type="button" onClick={()=>void action('openPublicKeys')} disabled={pending}>{fr.networkHelp.open}</button><button className="secondary" type="button" onClick={()=>void action(checking?'cancelPublicKeys':'checkPublicKeys')} disabled={pending}>{checking?fr.networkHelp.cancel:fr.networkHelp.check}</button></div>
  <p className="small">{fr.networkHelp.scope}</p>
  {status&&<p className="network-help-feedback" role="status">{status}</p>}
  {notice&&network.status!=='idle'&&<p role="status">{notice}</p>}{error&&<p className="network-help-feedback network-help-error" role="alert">{error}</p>}
 </section>
}
