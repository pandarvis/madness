import assert from 'node:assert/strict'
import {test} from 'node:test'
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
const release=await import('../scripts/release/manifest.mjs').catch(()=>null)

test('le client Codex partage la version du manifeste de livraison',async()=>{
 const version=await import('../src/adapters/release-version.ts').catch(()=>null)
 assert.ok(version,'Le module de version partagé doit exister')
 assert.equal(version.releaseVersion,JSON.parse(await readFile(new URL('../package.json',import.meta.url))).version)
})

async function fixture(t){
 const root=await mkdtemp(join(tmpdir(),'madness-release-test-'));t.after(()=>rm(root,{recursive:true,force:true,maxRetries:3}))
 const pkg={name:'madness',version:'0.1.1',dependencies:{jose:'6.2.13'},devDependencies:{electron:'45.0.0','electron-builder':'26.18.0'}}
 await mkdir(join(root,'src'));await mkdir(join(root,'resources'));await mkdir(join(root,'dist/win-unpacked/resources'),{recursive:true});await mkdir(join(root,'payload'))
 await writeFile(join(root,'package.json'),JSON.stringify(pkg))
 await writeFile(join(root,'package-lock.json'),JSON.stringify({name:pkg.name,version:pkg.version,lockfileVersion:3,packages:{'':pkg,'node_modules/jose':{version:'6.2.13'},'node_modules/electron':{version:'45.0.0'},'node_modules/electron-builder':{version:'26.18.0'}}}))
 await writeFile(join(root,'electron-builder.yml'),'appId: fr.madness.desktop\nproductName: Madness\nwin:\n  executableName: Madness\nnsis:\n  deleteAppDataOnUninstall: false\n')
 await writeFile(join(root,'src/main.ts'),'// source\n');await writeFile(join(root,'resources/notice.md'),'// ressource\n')
 await writeFile(join(root,'resources/bmad-script-runner.py'),'# runner\n');await writeFile(join(root,'dist/win-unpacked/resources/bmad-script-runner.py'),'# runner\n')
 await writeFile(join(root,'payload/package.json'),JSON.stringify(pkg))
 await require('@electron/asar').createPackage(join(root,'payload'),join(root,'dist/win-unpacked/resources/app.asar'))
 await writeFile(join(root,'dist/Madness-0.1.1-x64-setup.exe'),'synthetic-installer')
 return root
}
test('le manifeste est déterministe et relie les entrées, versions, ASAR et installateur',async t=>{
 assert.ok(release,'Le générateur de manifeste doit exister');const root=await fixture(t)
 const first=await release.createManifest({repository:root,directory:join(root,'dist')})
 assert.deepEqual(await release.createManifest({repository:root,directory:join(root,'dist')}),first)
 assert.equal(first.version,'0.1.1');assert.equal(first.identity.appId,'fr.madness.desktop')
 assert.equal(first.versions.electron,'45.0.0');assert.equal(first.artifacts.length,3)
 assert.ok(first.inputs.some(v=>v.path==='package-lock.json'));assert.ok(first.inputs.some(v=>v.path==='resources/notice.md'))
 assert.ok(first.artifacts.every(v=>/^[a-f0-9]{64}$/.test(v.sha256)))
 assert.equal(JSON.stringify(first).includes(root),false)
 await writeFile(join(root,'src/main.ts'),'// source modifiée\n')
 assert.notDeepEqual((await release.createManifest({repository:root,directory:join(root,'dist')})).inputs,first.inputs)
})
test('la ressource externe du paquet doit correspondre à la source qualifiée',async t=>{
 assert.ok(release);const root=await fixture(t)
 await writeFile(join(root,'dist/win-unpacked/resources/bmad-script-runner.py'),'# ressource altérée\n')
 await assert.rejects(release.createManifest({repository:root,directory:join(root,'dist')}),/RESOURCE_MISMATCH/)
})
test('une incohérence du lock, du paquet ou de l’identité refuse le manifeste',async t=>{
 assert.ok(release);const root=await fixture(t),path=join(root,'package-lock.json'),bytes=await readFile(path)
 const lock=JSON.parse(bytes);lock.packages['node_modules/jose'].version='6.2.12';await writeFile(path,JSON.stringify(lock))
 await assert.rejects(release.createManifest({repository:root,directory:join(root,'dist')}),/LOCK_MISMATCH/)
 await writeFile(path,bytes);const pkg=JSON.parse(await readFile(join(root,'package.json')));pkg.version='0.1.2';await writeFile(join(root,'package.json'),JSON.stringify(pkg))
 await assert.rejects(release.createManifest({repository:root,directory:join(root,'dist')}),/LOCK_MISMATCH/)
 await writeFile(join(root,'electron-builder.yml'),'appId: changed\nproductName: Madness\n')
 await assert.rejects(release.createManifest({repository:root,directory:join(root,'dist')}),/IDENTITY_MISMATCH/)
})
