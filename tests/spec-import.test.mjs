import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { importSpec, readJourney } from '../src/adapters/autopilot/project-plan.ts'

test('a pasted or picked spec lands in the active initiative and starts the journey', async t => {
  const root = await mkdtemp(join(tmpdir(), 'madness-spec-')); t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, '_bmad', 'custom'), { recursive: true })
  await writeFile(join(root, '_bmad', 'config.toml'), '[core]\noutput_folder = "{project-root}/_bmad-output"\n')
  assert.equal((await readJourney(root))[0].done, false)
  const pasted = await importSpec(root, 'demo', { name: 'spec.md', text: '# Spec\nUne liste de tâches.' })
  assert.match(pasted, /^_bmad-output\/initiative-[^/]+\/sources\/spec-spec\.md$/)
  assert.equal(await readFile(join(root, pasted), 'utf8'), '# Spec\nUne liste de tâches.')
  const journey = await readJourney(root)
  assert.equal(journey[0].done, true); assert.equal(journey[0].document, pasted)
  const source = join(root, 'Cahier des Charges v2.PDF'); await writeFile(source, 'pdf')
  assert.match(await importSpec(root, 'demo', { name: 'Cahier des Charges v2.PDF', source }), /sources\/spec-cahier-des-charges-v2\.pdf$/)
  const page = join(root, 'Spec App.htm'); await writeFile(page, '<!doctype html><h1>Spec</h1>')
  const html = await importSpec(root, 'demo', { name: 'Spec App.htm', source: page })
  assert.match(html, /sources\/spec-spec-app\.html$/); assert.equal(await readFile(join(root, html), 'utf8'), '<!doctype html><h1>Spec</h1>')
})
