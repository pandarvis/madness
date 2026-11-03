import assert from 'node:assert/strict'
import {readFile,writeFile,realpath,lstat,rm} from 'node:fs/promises'
import {resolve,dirname,basename} from 'node:path'
import {tmpdir} from 'node:os'
import {closeWorkspaceSession} from '../../../../scripts/qualification/workspace-design.mjs'

// Only the two owned synthetic profiles retained by the disposed-wrapper bug.
const output=resolve('_bmad-output/initiative-madness/ux-madness/qualification-window-chrome')
const receipts=[]
for(const name of ['native-actions-dark','native-close-diagnostic']){
 const folder=resolve(output,name),report=JSON.parse(await readFile(resolve(folder,'profile.json'),'utf8'))
 assert.equal(report.status,'failed');assert.equal(report.cleanup,false)
 assert.equal(report.nativeCloseSource,'external-window-control')
 const launch=report.launches[0],events=JSON.parse(await readFile(resolve(folder,'native-events.json'),'utf8'))
 assert.equal(events.at(-1).event,'close')
 const owned={main:launch.main,observationPath:launch.observationPath,observationStartedAt:launch.observationStartedAt,child:{pid:launch.wrapperPid,exitCode:null},closeObserved:true,closeAttempted:true,observerAvailable:true}
 const close=await closeWorkspaceSession(owned)
 assert.equal(close.cleanupSafe,true)
 const actual=await realpath(report.retainedWorkspace),base=await realpath(tmpdir())
 assert.equal(dirname(actual),base);assert.match(basename(actual),/^madness-workspace-design-[A-Za-z0-9]+$/)
 assert.equal((await lstat(actual)).isSymbolicLink(),false)
 await rm(actual,{recursive:true,force:false,maxRetries:3})
 receipts.push({name,retainedWorkspace:actual,close,removed:true})
}
await writeFile(resolve(output,'retained-profiles-reconciliation.json'),JSON.stringify({status:'passed',receipts,finishedAt:new Date().toISOString()},null,2)+'\n')
console.log(JSON.stringify({status:'passed',profiles:receipts.length}))
