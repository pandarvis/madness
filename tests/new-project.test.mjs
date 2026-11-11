import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, readdir, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createProjectFolder, projectFolderName, NewProjectPlace } from '../src/adapters/new-project.ts'

test('a project name becomes a safe folder name', () => {
  assert.equal(projectFolderName('Ma liste de tâches'), 'Ma-liste-de-taches')
  assert.equal(projectFolderName('a/b:c*?'), 'a-b-c')
  assert.equal(projectFolderName('   '), 'projet')
  assert.equal(projectFolderName('CON'), 'projet')
})

test('a new project folder gets git, and an existing non-empty folder is refused', async t => {
  const parent = await mkdtemp(join(tmpdir(), 'madness-new-')); t.after(() => rm(parent, { recursive: true, force: true }))
  const root = await createProjectFolder(parent, 'Démo')
  assert.equal(root, join(parent, 'Demo')); assert.ok((await readdir(root)).includes('.git'))
  await mkdir(join(parent, 'Plein')); await writeFile(join(parent, 'Plein', 'x.txt'), 'x')
  await assert.rejects(createProjectFolder(parent, 'Plein'), /PROJECT_EXISTS/)
  const place = new NewProjectPlace(join(parent, 'place.json'), 'C:/fallback')
  assert.equal(await place.read(), 'C:/fallback'); await place.write('D:/Projets'); assert.equal(await place.read(), 'D:/Projets')
})
