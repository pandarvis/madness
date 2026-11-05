import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,writeFile,rm,realpath} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {tmpdir} from 'node:os'
import {BmadHelpAdapter} from '../src/adapters/bmad/help.ts'
import {HelpOwnedRun} from '../src/adapters/bmad/help-owned-run.ts'
test('T1/T3 original private authority refuses a new duplicate outside the chosen unchanged source',async()=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'madness-metrics-authority-'))),owner=new HelpOwnedRun(join(root,'owner.json'));let helper
 try{
  const project=join(root,'project'),skills=join(project,'.agents/skills'),tickets=join(project,'_bmad-output/alpha/tickets')
  await mkdir(join(skills,'bmod-test'),{recursive:true});await mkdir(join(project,'_bmad'),{recursive:true});await mkdir(tickets,{recursive:true})
  await writeFile(join(skills,'bmod-test/bmod.toml'),'[bmod]\ncode="test"\nversion="6.13.0-next"\nskills=[]\n')
  await writeFile(join(project,'_bmad/config.toml'),'[core]\nactive_initiative="alpha"\n')
  await writeFile(join(project,'_bmad-output/alpha/alpha.md'),'# Alpha\n');await writeFile(join(tickets,'tickets.toml'),'[[entry]]\nid=1\ntype="story"\ntitle="No leaf"\n')
  helper=new BmadHelpAdapter({root:join(root,'runs'),resources:resolve('resources/bmad-help'),owner,roots:()=>[skills]})
  const signal=new AbortController().signal,context=await helper.observeContext('p',project,signal),selection={schemaVersion:1,projectId:'p',rootPath:project,rootIdentity:context.rootIdentity,revision:1,initiativeId:'alpha'}
  const snapshot=await helper.observeProgress('p',project,selection,context,signal),authority=helper.storyAuthority(snapshot)
  assert.ok(authority);assert.equal(helper.storyAuthority(structuredClone(snapshot)),undefined);assert.equal(Object.hasOwn(snapshot,'_storyEvidence'),false)
  const source=authority.evidence.rows.find(r=>r.ticketId==='1');await authority.verify(source.sourceId,signal)
  await writeFile(join(tickets,'first.md'),'---\ntype: story\nid: 1\n---\n');await writeFile(join(tickets,'duplicate.md'),'---\ntype: story\nid: 1\n---\n')
  await assert.rejects(authority.verify(source.sourceId,signal),{code:'PROFILE_CHANGED'})
 }finally{const closed=helper?await helper.shutdown():await owner.status();assert.equal(closed,'stopped');await rm(root,{recursive:true,force:true})}
})
