import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { emptySnapshot, isSnapshot } from '../src/contracts/index.ts'

const contracts = await import('../src/contracts/appearance.ts').catch(() => null)
const persistence = await import('../src/adapters/persistence/appearance-store.ts').catch(() => null)

test('atelier : les couleurs Windows suivent le chrome des deux thèmes et les couples de lecture restent contrastés', async () => {
  const css = await readFile(new URL('../src/renderer/src/styles.css', import.meta.url), 'utf8')
  const main = await readFile(new URL('../src/main/index.ts', import.meta.url), 'utf8')
  const darkBlock = css.match(/:root\s*\{([^}]+)\}/)[1], lightBlock = css.match(/:root\[data-theme="light"\]\s*\{([^}]+)\}/)[1]
  const tokens = block => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-f]{6})(?=\s*;)/gi)].map(m => [m[1], m[2].toLowerCase()]))
  const palettes = [tokens(darkBlock), tokens(lightBlock)]
  const native = main.match(/const nativeColors[^\n]+/)[0]
  const color = [...native.matchAll(/'(#\w{6})'/g)].map(m => m[1].toLowerCase())
  assert.deepEqual(color, [palettes[0]['atelier-chrome'], palettes[1]['atelier-chrome'], palettes[0].text, palettes[1].text])
  assert.match(native, /height: 56/)
  const luminance = hex => {
    const rgb = hex.slice(1).match(/../g).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]
  }
  const contrast = (a,b) => { const l=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (l[0]+.05)/(l[1]+.05) }
  for(const palette of palettes) {
    for(const surface of ['surface','panel','navigation','atelier-chrome'])for(const foreground of ['text','muted','muted-lavender'])assert.ok(contrast(palette[surface],palette[foreground])>=4.5,foreground+' on '+surface)
    for(const [bg,fg] of [['accent','accent-text'],['selected','selected-text'],['error','error-text'],['success','success-text'],['waiting','waiting-text']])assert.ok(contrast(palette[bg],palette[fg])>=4.5,fg+' on '+bg)
  }
})

test('le protocole d’apparence refuse les valeurs hors enum et les propriétés supplémentaires', () => {
  assert.ok(contracts, 'Le contrat d’apparence doit exister')
  const command = { contractVersion: 1, correlationId: 'appearance-001', theme: 'light' }
  assert.equal(contracts.isAppearanceCommand(command), true)
  const read = { contractVersion: 1, correlationId: 'appearance-read-001', type: 'read' }
  assert.equal(contracts.isAppearanceCommand(read), true)
  for (const value of [{ ...read, type: 'restore' }, { ...read, theme: 'dark' }, { ...read, path: 'C:/autre' }]) assert.equal(contracts.isAppearanceCommand(value), false)
  for (const value of [null, {}, { ...command, theme: 'system' }, { ...command, theme: '#fff' }, { ...command, path: 'C:/autre' }, { ...command, correlationId: '../x' }]) assert.equal(contracts.isAppearanceCommand(value), false)
  assert.equal(contracts.isAppearanceReply({ contractVersion: 1, correlationId: 'appearance-001', ok: true, state: { theme: 'light', warning: null } }), true)
  assert.equal(contracts.isAppearanceReply({ contractVersion: 1, correlationId: 'appearance-001', ok: true, state: { theme: 'light', warning: null, path: 'secret' } }), false)
})

test('l’amorçage accepte uniquement les arguments natifs enum et refuse les doublons', () => {
  assert.ok(contracts)
  assert.deepEqual(contracts.appearanceFromArguments(['electron', '--madness-theme=light', '--madness-appearance-warning=none']), { theme: 'light', warning: null })
  for (const args of [[], ['--madness-theme=#fff'], ['--madness-theme=light', '--madness-theme=dark']]) assert.equal(contracts.appearanceFromArguments(args).theme, 'dark')
})

test('un profil neuf reste sombre sans écrire et un choix explicite est restauré séparément du Snapshot', async () => {
  assert.ok(persistence)
  const root = await mkdtemp(join(tmpdir(), 'madness-appearance-test-'))
  try {
    const path = join(root, 'appearance-v1.json'), snapshotPath = join(root, 'madness-state-v1.json')
    const bytes = JSON.stringify(emptySnapshot())
    await writeFile(snapshotPath, bytes)
    const store = new persistence.AppearanceStore(path)
    assert.deepEqual(await store.restore(), { theme: 'dark', warning: null })
    await assert.rejects(readFile(path), { code: 'ENOENT' })
    assert.deepEqual(await store.save('light'), { theme: 'light', warning: null })
    assert.deepEqual(await new persistence.AppearanceStore(path).restore(), { theme: 'light', warning: null })
    assert.equal(await readFile(snapshotPath, 'utf8'), bytes)
    assert.equal(isSnapshot(JSON.parse(bytes)), true)
    assert.deepEqual((await readdir(root)).sort(), ['appearance-v1.json', 'madness-state-v1.json'])
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('un fichier invalide ou futur reste intact tandis que le choix de session fonctionne', async () => {
  assert.ok(persistence)
  const root = await mkdtemp(join(tmpdir(), 'madness-appearance-test-'))
  try {
    const path = join(root, 'appearance-v1.json')
    for (const bytes of ['{cassé', '{"schemaVersion":2,"theme":"light"}', '{"schemaVersion":1,"theme":"light","extra":true}']) {
      await writeFile(path, bytes)
      const store = new persistence.AppearanceStore(path)
      assert.deepEqual(await store.restore(), { theme: 'dark', warning: 'read-failed' })
      assert.deepEqual(await store.save('light'), { theme: 'light', warning: 'save-failed' })
      assert.equal(await readFile(path, 'utf8'), bytes)
    }
    await writeFile(path, Buffer.from([0xff, 0xfe]))
    assert.deepEqual(await new persistence.AppearanceStore(path).restore(), { theme: 'dark', warning: 'read-failed' })
    assert.deepEqual(await readFile(path), Buffer.from([0xff, 0xfe]))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('une écriture refusée conserve le choix de session et nettoie les fichiers atomiques', async () => {
  assert.ok(persistence)
  const root = await mkdtemp(join(tmpdir(), 'madness-appearance-test-'))
  try {
    const path = join(root, 'appearance-v1.json')
    await mkdir(path)
    const store = new persistence.AppearanceStore(path)
    assert.deepEqual(await store.save('light'), { theme: 'light', warning: 'save-failed' })
    assert.deepEqual(await readdir(root), ['appearance-v1.json'])
    await assert.rejects(store.save('invalid'), /INVALID_THEME/)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('les choix concurrents sont écrits dans l’ordre sans fichier temporaire restant', async () => {
  assert.ok(persistence)
  const root = await mkdtemp(join(tmpdir(), 'madness-appearance-test-'))
  try {
    const path = join(root, 'appearance-v1.json'), store = new persistence.AppearanceStore(path)
    await Promise.all([store.save('light'), store.save('dark'), store.save('light')])
    assert.deepEqual(await new persistence.AppearanceStore(path).restore(), { theme: 'light', warning: null })
    assert.deepEqual(await readdir(root), ['appearance-v1.json'])
  } finally { await rm(root, { recursive: true, force: true }) }
})
