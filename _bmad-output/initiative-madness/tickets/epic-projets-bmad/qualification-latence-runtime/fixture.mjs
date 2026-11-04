import {mkdtemp,writeFile,readFile,rm,lstat} from 'node:fs/promises'
import {realpathSync} from 'node:fs'
import {join,relative,isAbsolute,sep,basename} from 'node:path'
import {tmpdir} from 'node:os'
import {randomUUID} from 'node:crypto'
export async function ownedTemp(prefix='mg-'){
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),prefix))),id=randomUUID()
 await writeFile(join(root,'.latency-owner.json'),JSON.stringify({root,id}),{flag:'wx'})
 return {root,id,prefix}
}
export async function finishFixture(owner,proof){
 const temp=realpathSync.native(tmpdir()),rel=relative(temp,owner.root)
 if(!isAbsolute(owner.root)||!rel||isAbsolute(rel)||rel==='..'||rel.startsWith('..'+sep)||rel.includes(sep)||!basename(owner.root).startsWith(owner.prefix))throw Error('FIXTURE_SCOPE')
 const st=await lstat(owner.root),record=JSON.parse(await readFile(join(owner.root,'.latency-owner.json'),'utf8'))
 if(st.isSymbolicLink()||record.id!==owner.id||record.root!==owner.root||realpathSync.native(owner.root)!==owner.root)throw Error('FIXTURE_OWNER')
 const stopped=proof?.id===owner.id&&proof?.root===owner.root&&proof.controllerComplete===true&&Array.isArray(proof.states)&&proof.states.length>0&&proof.states.every(s=>s&&s.outcome!=='running'&&(s.started===false&&s.outcome==='start-failed'&&!s.start_observation||s.started===true&&s.job_assigned_before_resume===true&&s.job_active_after_stop===0))
 if(!stopped)return {removed:false,root:owner.root,id:owner.id,reason:'correlated controller completion and stop proof unavailable'}
 await rm(owner.root,{recursive:true,force:true});return {removed:true,root:owner.root,id:owner.id}
}
