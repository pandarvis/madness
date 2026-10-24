import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, cp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
const profile = await import('../src/adapters/bmad/profile.ts').catch(() => null)
test('profil réel qualifie Mary, ses dépendances et les deux resolvers exécutables', async () => {
  assert.ok(profile, 'Le qualificateur du profil installé doit exister')
  const result = await profile.qualifyBmadProfile(resolve('.'))
  assert.match(result.fingerprint, /^[a-f0-9]{64}$/)
  assert.match(result.skillPath, /bmad-agent-analyst[\\/]SKILL.md$/)
  const value = await profile.resolveBmad(result, 'agent', new AbortController().signal)
  assert.equal(JSON.parse(value).agent?.name ?? JSON.parse(value)['agent'].name, 'Mary')
  const config = JSON.parse(await profile.resolveBmad(result, 'config', new AbortController().signal))
  assert.equal(typeof config['core.output_folder'], 'string')
})
test('agent absent, altéré et surcharge inconnue bloquent avant invocation', async () => {
  assert.ok(profile)
  const root = await mkdtemp(join(tmpdir(), 'madness-profile-'))
  try {
    await assert.rejects(profile.qualifyBmadProfile(root), { code: 'PROFILE_ABSENT' })
    await cp('.agents/skills/bmad-agent-analyst', join(root, '.agents/skills/bmad-agent-analyst'), { recursive: true })
    await mkdir(join(root, '_bmad/scripts'), { recursive: true })
    for (const path of profile.PROFILE_FILES.filter(v => v.startsWith('_bmad/scripts/'))) await cp(path, join(root, path))
    await cp('_bmad/config.toml', join(root, '_bmad/config.toml'))
    await writeFile(join(root, '.agents/skills/bmad-agent-analyst/SKILL.md'), '# Mary modifiée')
    await assert.rejects(profile.qualifyBmadProfile(root), { code: 'PROFILE_CHANGED' })
    await cp('.agents/skills/bmad-agent-analyst/SKILL.md', join(root, '.agents/skills/bmad-agent-analyst/SKILL.md'))
    await mkdir(join(root, '_bmad/custom'), { recursive: true }); await writeFile(join(root, '_bmad/custom/bmad-agent-analyst.toml'), '[agent]\nname="Other"')
    await assert.rejects(profile.qualifyBmadProfile(root), { code: 'PROFILE_UNRECOGNIZED' })
  } finally { await rm(root, { recursive: true, force: true }) }
})
test('un module Python et un interpréteur ajoutés au projet ne remplacent pas le runtime du resolver', async () => {
  const root=await mkdtemp(join(tmpdir(),'madness-import-'))
  try {
    await cp('.agents/skills/bmad-agent-analyst',join(root,'.agents/skills/bmad-agent-analyst'),{recursive:true})
    await mkdir(join(root,'_bmad/scripts'),{recursive:true})
    for(const path of profile.PROFILE_FILES.filter(v=>v.startsWith('_bmad/scripts/')))await cp(path,join(root,path))
    await cp('_bmad/config.toml',join(root,'_bmad/config.toml'))
    await writeFile(join(root,'_bmad/scripts/json.py'),'raise RuntimeError("PROJECT_MODULE_EXECUTED")')
    await mkdir(join(root,'.venv/Scripts'),{recursive:true});await writeFile(join(root,'.venv/Scripts/python.exe'),'FOREIGN_EXECUTABLE')
    const result=await profile.qualifyBmadProfile(root)
    assert.equal(JSON.parse(await profile.resolveBmad(result,'agent',new AbortController().signal)).agent.name,'Mary')
  } finally {await rm(root,{recursive:true,force:true})}
})
