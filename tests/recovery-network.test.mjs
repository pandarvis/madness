import assert from 'node:assert/strict'
import {test} from 'node:test'
import {CodexConnection} from '../src/adapters/codex/connection.ts'
import {dialogueError} from '../src/contracts/dialogue.ts'
import {createTransport} from '../src/adapters/codex/oauth.ts'
const oauth=await import('../src/adapters/codex/oauth.ts')
test('NETWORK_UNAVAILABLE traverse le contrat dialogue sans devenir PROVIDER_FAILED',()=>assert.equal(dialogueError(Object.assign(Error(),{code:'NETWORK_UNAVAILABLE'}),'PROVIDER_FAILED'),'NETWORK_UNAVAILABLE'))
test('GET strict de clés publiques indépendant du coffre, OAuth, refresh, probe et modèle',async()=>{
 assert.equal(typeof oauth.checkPublicKeysAccess,'function')
 let requests=[];const transport=createTransport(async(url,options)=>{requests.push({url,...options});return new Response(JSON.stringify({keys:[]}),{status:200,headers:{'Content-Type':'application/json'}})})
 await oauth.checkPublicKeysAccess(transport,new AbortController().signal);assert.equal(requests.length,1);assert.equal(requests[0].method,'GET');assert.equal(requests[0].redirect,'error');assert.equal(requests[0].credentials,'omit');assert.equal(requests[0].body,undefined)
 await assert.rejects(oauth.checkPublicKeysAccess(createTransport(async()=>new Response('<html>avertissement</html>',{status:200})),new AbortController().signal),{code:'NETWORK_UNAVAILABLE'})
})
test('vérifier accès est annulable, garde erreur connexion et ne libère aucune lease',async()=>{
 let checked=0,finish;const done=new Promise(r=>finish=r)
 const connection=new CodexConnection({vault:{read:async()=>null},oauth:async()=>{throw Error()},refresh:async()=>{throw Error()},probe:async()=>{throw Error()},now:()=>new Date(),openUsage:async()=>{},openPublicKeys:async()=>{},copyPublicKeys:async()=>{},checkPublicKeys:async signal=>{checked++;await done;signal.throwIfAborted()}})
 await connection.read();await connection.command('check-public-keys');assert.equal(checked,1);assert.equal((await connection.read()).network.status,'checking');await connection.command('cancel-public-keys');finish();await new Promise(r=>setImmediate(r));assert.equal((await connection.read()).network.status,'cancelled');assert.equal((await connection.read()).status,'disconnected');assert.equal((await connection.read()).verifiedAt,null)
})
test('un ancien release ne libère ni ne bloque le bail suivant',async()=>{
 const credentials={version:1,clientId:'oaiapp_testclient',subject:'test',accessToken:'private',refreshToken:'private',idToken:'private',expiresAt:Date.now()+600000,scopes:[],planAcknowledged:true}
 const connection=new CodexConnection({vault:{read:async()=>credentials},now:()=>new Date(),openUsage:async()=>{},openPublicKeys:async()=>{},copyPublicKeys:async()=>{},oauth:async()=>{throw Error()},refresh:async()=>{throw Error()},probe:async()=>{throw Error()}}),signal=new AbortController().signal
 const old=await connection.acquireDialogue(signal);old.release(true);const fresh=await connection.acquireDialogue(signal);old.release(false);await assert.rejects(connection.acquireDialogue(signal),{code:'CONNECTION_BUSY'});fresh.release(true);const third=await connection.acquireDialogue(signal);third.release()
})
test('un propriétaire durable inconnu bloque également le témoin connexion avant OAuth ou probe',async()=>{
 let calls=0,status='unknown';const connection=new CodexConnection({vault:{read:async()=>null},now:()=>new Date(),openUsage:async()=>{},openPublicKeys:async()=>{},copyPublicKeys:async()=>{},recovery:{status:async()=>status,observeStop:async()=>status='stopped'},oauth:async()=>{calls++;throw Error()},refresh:async()=>{calls++;throw Error()},probe:async()=>{calls++;throw Error()}})
 await connection.read();await connection.command('connect');await new Promise(r=>setImmediate(r));assert.equal(calls,0);assert.equal((await connection.read()).errorCode,'STOP_UNCONFIRMED')
 status='stopped';connection.confirmRecoveryStop();assert.equal((await connection.read()).status,'disconnected')
})
test('la fermeture possédée confirmée ne masque pas un coffre illisible',async()=>{
 const connection=new CodexConnection({vault:{read:async()=>{throw Object.assign(Error(),{code:'VAULT_UNREADABLE'})}},recovery:{status:async()=>'unknown',observeStop:async()=>'stopped'},now:()=>new Date(),openUsage:async()=>{},openPublicKeys:async()=>{},copyPublicKeys:async()=>{},oauth:async()=>{throw Error('interdit')},refresh:async()=>{throw Error()},probe:async()=>{throw Error()}})
 await connection.read();connection.confirmRecoveryStop();assert.equal((await connection.read()).errorCode,'VAULT_UNREADABLE')
})
