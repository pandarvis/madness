import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { createRequire, syncBuiltinESMExports } from 'node:module'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, readFile, writeFile, rm, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { qualifyBmadProfile, resolveBmad } from '../src/adapters/bmad/profile.ts'
import { runForgeScript } from '../src/adapters/bmad/forge.ts'
const runtime = await import('../src/adapters/bmad/runtime.ts').catch(() => null)
test('le runtime vient de Madness et une copie binaire altérée ne peut pas être exécutée', async () => {
  assert.ok(runtime, 'Le runtime externe qualifié doit exister')
  const trusted = await runtime.bmadRuntime()
  assert.equal(trusted.python, join(await realpath(resolve('resources/graphify/assembly/runtime')), 'python.exe'))
  assert.equal(trusted.python.includes('.venv'), false)
  const root = await mkdtemp(join(tmpdir(), 'madness-runtime-'))
  try { await writeFile(join(root, 'uv.exe'), 'changed'); await assert.rejects(runtime.verifyRuntimeFile(join(root, 'uv.exe'), '0'.repeat(64)), { code: 'RESOLVER_FAILED' }) }
  finally { await rm(root, { recursive: true, force: true }) }
})


test('legacy runtime PEM guard rejects altered or missing copied CA data before Mary or Forge can start UV',async()=>{
 const fixture=await realpath(await mkdtemp(join(tmpdir(),'madness-runtime-pem-')))
 const python=join(fixture,'graphify/assembly/runtime')
 const uv=join(fixture,'runtime-tools/uv.exe')
 const manifest=JSON.parse(await readFile(resolve('resources/bmad-help/runtime.json'),'utf8'))
 const origin=resolve('resources/graphify/assembly/runtime')
 const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
 let interception,spawned=0
 try{
  assert.equal(manifest.files.length,735)
  let index=0
  await Promise.all(Array.from({length:16},async()=>{while(index<manifest.files.length){const entry=manifest.files[index++],raw=await readFile(join(origin,entry.name));assert.equal(sha(raw),entry.sha256,'source runtime changed: '+entry.name);const target=join(python,entry.name);await mkdir(dirname(target),{recursive:true});await writeFile(target,raw,{flag:'wx'})}}))
  const uvBytes=await readFile(resolve('resources/runtime-tools/uv.exe'));assert.equal(sha(uvBytes),'2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162');await mkdir(dirname(uv),{recursive:true});await writeFile(uv,uvBytes,{flag:'wx'})
  runtime.configureBundledRuntime(fixture)
  assert.equal(await runtime.runtimeTreeFingerprint(python),'819d83d34e77ad70a198d831e518fa9b398c3a244aa4af77fd8a8934c3821b92')
  assert.equal((await runtime.bmadRuntime(resolve('.'))).python,join(python,'python.exe'))
  const profile=await qualifyBmadProfile(resolve('.')),signal=new AbortController().signal
  const cp=createRequire(import.meta.url)('node:child_process')
  interception=mock.method(cp,'spawn',()=>{spawned++;throw Error('UNEXPECTED_UV_START')});syncBuiltinESMExports()
  const pem=join(python,'Lib/codex-rejected-cas.pem'),original=await readFile(pem)
  assert.equal(original.length,906);assert.equal(sha(original),'c916ce1b14ed8ca69e9b5c9fab22799a900dd610d6d4ec9b1347f4fd48e53718')
  for(const variant of ['altered','missing']){
   if(variant==='altered')await writeFile(pem,Buffer.concat([original,Buffer.from('changed')]))
   else await rm(pem)
   // The historical suffix policy intentionally omits .pem; the explicit guard must refuse it.
   assert.equal(await runtime.runtimeTreeFingerprint(python),'819d83d34e77ad70a198d831e518fa9b398c3a244aa4af77fd8a8934c3821b92')
   await assert.rejects(runtime.bmadRuntime(resolve('.')),{code:'RESOLVER_FAILED'},variant+' runtime guard')
   await assert.rejects(resolveBmad(profile,'config',signal),{code:'RESOLVER_FAILED'},variant+' Mary before UV')
   await assert.rejects(runForgeScript(profile,'config',['--project-root',profile.rootPath],signal),{code:'RESOLVER_FAILED'},variant+' Forge before UV')
   assert.equal(spawned,0)
  }
  await writeFile(pem,original,{flag:'wx'})
  assert.equal((await runtime.bmadRuntime(resolve('.'))).python,join(python,'python.exe'))
  assert.equal(spawned,0)
 }finally{
  interception?.mock.restore();syncBuiltinESMExports()
  runtime.configureBundledRuntime(resolve('resources'))
  await rm(fixture,{recursive:true,force:true,maxRetries:3})
 }
})
