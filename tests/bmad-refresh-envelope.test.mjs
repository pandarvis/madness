import {realpathSync} from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {mkdtemp,mkdir,rm,writeFile,readFile} from 'node:fs/promises'
import {join} from 'node:path'
import {tmpdir} from 'node:os'
import {createHash} from 'node:crypto'
import {BmadHelpAdapter} from '../src/adapters/bmad/help.ts'
import {BmadProgressAdapter} from '../src/adapters/bmad/progress.ts'
import {BmadCatalogAdapter} from '../src/adapters/bmad/catalog.ts'
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
async function fixture(run){
 const root=realpathSync.native(await mkdtemp(join(tmpdir(),'madness-refresh-envelope-')))
 try{const folder=join(root,'operation'),skills=join(root,'skills');await mkdir(folder);await mkdir(skills)
 await mkdir(join(root,'output/alpha'),{recursive:true});const source={id:'source-1',kind:'document',path:join(root,'output/alpha/source.md'),relativePath:'source.md',modifiedAt:new Date().toISOString(),sha256:sha('proof'),bytes:5};await writeFile(source.path,'proof')
 const receipt=JSON.stringify({synthetic:true,sources:[source]});await writeFile(join(folder,'files.json'),receipt)
 const hints={version:1,entries:[]},helper=new BmadHelpAdapter({root:join(root,'operations'),resources:root,owner:{},roots:()=>[skills]})
 const envelope=(result,producer)=>({result,hints,folder,fileGrant:{rootIdentity:result.rootIdentity,revision:result.revision,producer,sources:result.sources}})
 await run({root,folder,source,receipt,hints,helper,envelope})
 }finally{await rm(root,{recursive:true,force:true})}
}
async function verifyAuthority(helper,value,{source,receipt}){
 const authority=helper.filesAuthority(value);assert.ok(authority);assert.equal(helper.filesAuthority(structuredClone(value)),undefined)
 helper.run=async request=>{assert.equal(request.op,'files-verify');assert.equal(request.sourceId,source.id);assert.equal(request.receiptSha,sha(receipt));return {result:{status:'current'}}}
 assert.deepEqual(await authority.verify(source.id,new AbortController().signal),{status:'current'})
 await assert.rejects(authority.verify('foreign',new AbortController().signal),{code:'PROFILE_CHANGED'})
}
test('all native consultation envelopes retain their exact private dependencies through public adapter values',async()=>fixture(async f=>{
 const {root,hints,helper,envelope,source}=f,signal=new AbortController().signal
 helper.run=async()=>({result:{rootIdentity:'root',revision:'a'.repeat(64),status:'candidate-observed',activeInitiative:null,activeStatus:'absent',initiatives:[],sources:[],problems:[]},hints})
 const value=await helper.observeContext('project-a',root,signal,false);assert.equal(helper.dependencies(value),hints)
 helper.run=async()=>envelope({rootIdentity:'root',revision:'a'.repeat(64),initiativeId:'alpha',initiativePath:root+'/output/alpha',contextRevision:'b'.repeat(64),coverage:'complete',sources:[source],declarations:[],excerpts:[],problems:[]},'progress')
 const progress=await new BmadProgressAdapter(helper).collect('project-a',root,{initiativeId:'alpha'},{revision:'b'.repeat(64)},signal)
 assert.equal(helper.dependencies(progress),hints);assert.equal(helper.dependencies(structuredClone(progress)),undefined);assert.equal(helper.filesAuthority(progress).producer,'progress');await verifyAuthority(helper,progress,f)
}))
test('catalogue adapter retains exact capture object and its private dependencies',async()=>fixture(async f=>{
 const {root,hints,helper,envelope,source}=f
 helper.run=async()=>envelope({rootIdentity:'d'.repeat(64),revision:'a'.repeat(64),diagnostic:'absent',coverage:'complete',roots:[root],sources:[{id:source.id,path:source.path,sha256:source.sha256,bytes:source.bytes,text:'proof'}],modules:[],items:[],problems:[]},'catalog')
 const capture=helper.observeCatalog.bind(helper);let original;helper.observeCatalog=async(...args)=>original=await capture(...args)
 const value=await new BmadCatalogAdapter(helper).collect('project-a',root,new AbortController().signal)
 assert.equal(value,original);assert.equal(helper.dependencies(value),hints);assert.equal(helper.filesAuthority(value).producer,'catalog');await verifyAuthority(helper,value,f)
}))
test('missing or incoherent file grants remain refused',async()=>fixture(async f=>{
 const {root,helper,envelope,source}=f,result={rootIdentity:'d'.repeat(64),revision:'a'.repeat(64),sources:[source]}
 for(const fileGrant of [undefined,{...envelope(result,'catalog').fileGrant,rootIdentity:'foreign'},{...envelope(result,'catalog').fileGrant,sources:[{...source,bytes:999}]}]){
 helper.run=async()=>({...envelope(result,'catalog'),fileGrant});await assert.rejects(helper.observeCatalog('p',root,new AbortController().signal),{code:'PROFILE_CHANGED'})}
}))
