import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { emptySnapshot, isSnapshot } from '../src/contracts/index.ts'

const contracts = await import('../src/contracts/language.ts').catch(() => null)
const persistence = await import('../src/adapters/persistence/language-store.ts').catch(() => null)

test('le protocole de langue refuse les valeurs hors enum et les propriétés supplémentaires', () => {
  assert.ok(contracts, 'Le contrat de langue doit exister')
  const command = { contractVersion: 1, correlationId: 'language-001', language: 'en' }
  assert.equal(contracts.isLanguageCommand(command), true)
  const read = { contractVersion: 1, correlationId: 'language-read-001', type: 'read' }
  assert.equal(contracts.isLanguageCommand(read), true)
  for (const value of [{ ...read, type: 'restore' }, { ...read, language: 'fr' }, { ...read, path: 'C:/autre' }]) assert.equal(contracts.isLanguageCommand(value), false)
  for (const value of [null, {}, { ...command, language: 'system' }, { ...command, language: '#fff' }, { ...command, path: 'C:/autre' }, { ...command, correlationId: '../x' }]) assert.equal(contracts.isLanguageCommand(value), false)
  assert.equal(contracts.isLanguageReply({ contractVersion: 1, correlationId: 'language-001', ok: true, state: { language: 'en', warning: null } }), true)
  assert.equal(contracts.isLanguageReply({ contractVersion: 1, correlationId: 'language-001', ok: true, state: { language: 'en', warning: null, path: 'secret' } }), false)
})

test('l’amorçage accepte uniquement les arguments natifs enum et refuse les doublons', () => {
  assert.ok(contracts)
  assert.deepEqual(contracts.languageFromArguments(['electron', '--madness-language=en', '--madness-language-warning=none']), { language: 'en', warning: null })
  for (const args of [[], ['--madness-language=#fff'], ['--madness-language=en', '--madness-language=fr']]) assert.equal(contracts.languageFromArguments(args).language, 'fr')
})

test('un profil neuf reste français sans écrire et un choix explicite est restauré séparément du Snapshot', async () => {
  assert.ok(persistence)
  const root = await mkdtemp(join(tmpdir(), 'madness-language-test-'))
  try {
    const path = join(root, 'language-v1.json'), snapshotPath = join(root, 'madness-state-v1.json')
    const bytes = JSON.stringify(emptySnapshot())
    await writeFile(join(root, 'appearance-v1.json'), '{"schemaVersion":1,"theme":"light"}\n')
    await writeFile(snapshotPath, bytes)
    const store = new persistence.LanguageStore(path)
    assert.deepEqual(await store.restore(), { language: 'fr', warning: null })
    await assert.rejects(readFile(path), { code: 'ENOENT' })
    assert.deepEqual(await store.save('en'), { language: 'en', warning: null })
    assert.deepEqual(await new persistence.LanguageStore(path).restore(), { language: 'en', warning: null })
    assert.equal(await readFile(snapshotPath, 'utf8'), bytes)
    assert.equal(isSnapshot(JSON.parse(bytes)), true)
    assert.deepEqual((await readdir(root)).sort(), ['appearance-v1.json', 'language-v1.json', 'madness-state-v1.json']
    )
    assert.equal(await readFile(join(root, 'appearance-v1.json'), 'utf8'), '{"schemaVersion":1,"theme":"light"}\n')
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('un fichier invalide ou futur reste intact tandis que le choix de session fonctionne', async () => {
  assert.ok(persistence)
  const root = await mkdtemp(join(tmpdir(), 'madness-language-test-'))
  try {
    const path = join(root, 'language-v1.json')
    for (const bytes of ['{cassé', '{"schemaVersion":2,"language":"en"}', '{"schemaVersion":1,"language":"en","extra":true}']) {
      await writeFile(path, bytes)
      const store = new persistence.LanguageStore(path)
      assert.deepEqual(await store.restore(), { language: 'fr', warning: 'read-failed' })
      assert.deepEqual(await store.save('en'), { language: 'en', warning: 'save-failed' })
      assert.equal(await readFile(path, 'utf8'), bytes)
    }
    await writeFile(path, Buffer.from([0xff, 0xfe]))
    assert.deepEqual(await new persistence.LanguageStore(path).restore(), { language: 'fr', warning: 'read-failed' })
    assert.deepEqual(await readFile(path), Buffer.from([0xff, 0xfe]))
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('une écriture refusée conserve le choix de session et nettoie les fichiers atomiques', async () => {
  assert.ok(persistence)
  const root = await mkdtemp(join(tmpdir(), 'madness-language-test-'))
  try {
    const path = join(root, 'language-v1.json')
    await mkdir(path)
    const store = new persistence.LanguageStore(path)
    assert.deepEqual(await store.save('en'), { language: 'en', warning: 'save-failed' })
    assert.deepEqual(await readdir(root), ['language-v1.json'])
    await assert.rejects(store.save('invalid'), /INVALID_LANGUAGE/)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('les choix concurrents sont écrits dans l’ordre sans fichier temporaire restant', async () => {
  assert.ok(persistence)
  const root = await mkdtemp(join(tmpdir(), 'madness-language-test-'))
  try {
    const path = join(root, 'language-v1.json'), store = new persistence.LanguageStore(path)
    await Promise.all([store.save('en'), store.save('fr'), store.save('en')])
    assert.deepEqual(await new persistence.LanguageStore(path).restore(), { language: 'en', warning: null })
    assert.deepEqual(await readdir(root), ['language-v1.json'])
  } finally { await rm(root, { recursive: true, force: true }) }
})


test('les slots produit connus sont bilingues et une limite inconnue conserve son original technique', async () => {
 const presenter=await import('../src/renderer/src/product-copy.ts').catch(()=>null)
 assert.ok(presenter,'presenter produit requis')
 assert.equal(presenter.presentProductText('diagnostic','HELP_BRIDGE_READ_FAILED','fr'),'Lecture des aides conservées impossible.')
 assert.equal(presenter.presentProductText('diagnostic','HELP_BRIDGE_READ_FAILED','en'),'Saved help could not be read.')
 assert.equal(presenter.presentProductText('activity','Tour terminé · réponse enregistrée · à vous de répondre','en'),'Turn complete · response saved · your turn to respond')
 assert.equal(presenter.presentProductText('file','Format UTF-8 invalide — aperçu refusé.','en'),'Invalid UTF-8 format — preview refused.')
 assert.equal(presenter.presentProductText('library','Sélection Madness conservée','en'),'Saved Madness selection')
 assert.equal(presenter.presentProductText('activity','Forge natif · write-report','en'),'Native Forge · write-report')
 assert.equal(presenter.presentProductText('diagnostic','E_UNKNOWN C:/é/δ','en'),'Untranslated technical detail — E_UNKNOWN C:/é/δ')
 assert.equal(presenter.presentProductText('diagnostic','E_UNKNOWN C:/é/δ','fr'),'Détail technique non traduit — E_UNKNOWN C:/é/δ')
})


test('un refus reel de rename Windows preserve la langue durable et attend le retry explicite',async()=>{
 const {holdWindowsFile}=await import('./helpers/windows-file-lock.mjs')
 const root=await mkdtemp(join(tmpdir(),'madness-language-lock-')),path=join(root,'language-v1.json')
 try{await writeFile(path,'{"schemaVersion":1,"language":"fr"}\n');const bytes=await readFile(path),store=new persistence.LanguageStore(path),lock=await holdWindowsFile(path)
  try{assert.deepEqual(await store.save('en'),{language:'en',warning:'save-failed'});assert.deepEqual(await readFile(path),bytes);assert.deepEqual(await readdir(root),['language-v1.json'])}finally{await lock.release()}
  assert.deepEqual(await readFile(path),bytes);assert.deepEqual(await store.save('en'),{language:'en',warning:null});assert.equal((await new persistence.LanguageStore(path).restore()).language,'en')
 }finally{await rm(root,{recursive:true,force:true})}
})


test('les nombres et pluriels se formatent sans changer leur valeur',async()=>{
 const format=await import('../src/renderer/src/locale-format.ts').catch(()=>null);assert.ok(format)
 assert.equal(format.formatCount(1,'file','en'),'1 file');assert.equal(format.formatCount(2,'file','en'),'2 files')
 assert.equal(format.formatCount(0,'file','fr'),'0 fichier');assert.equal(format.formatNumber(1234.5,'en'),'1,234.5');assert.equal(format.formatNumber(1234.5,'fr'),'1 234,5')
})


test('les diagnostics etablis des coordinateurs et du runtime gardent les parametres techniques exacts',async()=>{
 const {presentProductText:p}=await import('../src/renderer/src/product-copy.ts')
 assert.equal(p('diagnostic','Sources modifiées pendant la lecture — nouvelle lecture requise.','en'),'Sources changed while reading — read again.')
 assert.equal(p('diagnostic','Reciprocal module membership not established','fr'),'Appartenance réciproque au module non établie')
 assert.equal(p('diagnostic','Aide indisponible (fichier non chargé): C:/é/δ.md: E_IO','en'),'Help unavailable (file not loaded): C:/é/δ.md: E_IO')
 assert.equal(p('diagnostic','Source non chargee: C:/é/δ.md: E_IO','en'),'Source not loaded: C:/é/δ.md: E_IO')
 assert.equal(p('diagnostic','Portee documentaire partielle: C:/é/δ.md: E_IO','en'),'Partial document scope: C:/é/δ.md: E_IO')
 assert.equal(p('diagnostic','core-tools: missing registered skill bmad-δ','fr'),'core-tools: compétence déclarée absente bmad-δ')
})


test('Q2 diagnostics graphe etablis et Q3 limites bibliotheque gardent les parametres',async()=>{
 const {presentProductText:p}=await import('../src/renderer/src/product-copy.ts')
 for(const [original,en] of [
 ['Conservation du graphe illisible — aucune analyse relancée.','Graph storage unreadable — no analysis restarted.'],
 ['Référence ancienne ou non vérifiée — sources modifiées ou accès refusé.','Stale or unverified reference — sources changed or access refused.'],
 ['Résultat étranger ou incompatible refusé — dernier complet conservé.','Foreign or incompatible result refused — last complete graph retained.'],
 ['Arrêt non confirmé — vérifiez l’arrêt dans la récupération commune.','Stop not confirmed — check the stop in shared recovery.'],
 ['Analyse interrompue avant publication.','Analysis interrupted before publication.'],
 ['Arrêt confirmé par la récupération commune. Aucun graphe relancé ; le résultat reste historique.','Stop confirmed by shared recovery. No graph restarted; the result remains historical.'],
 ['Analyse locale indisponible ou refusée : E_IO C:/é/δ · raw:400','Local analysis unavailable or refused: E_IO C:/é/δ · raw:400']
 ]){assert.equal(p('diagnostic',original,'en'),en);assert.equal(p('diagnostic',original,'fr'),original)}
 assert.equal(p('library','Sources modifiées pendant la lecture — nouvelle lecture requise.','en'),'Sources changed while reading — read again.')
 assert.equal(p('diagnostic','GRAPH_FUTURE C:/é/δ · raw','en'),'Untranslated technical detail — GRAPH_FUTURE C:/é/δ · raw')
})
test('Q4 compteurs d’aide graphe et tailles sont singuliers et localises',async()=>{
 const {formatCount:f}=await import('../src/renderer/src/locale-format.ts')
 for(const [noun,one,many] of [['loadedDocument','1 document loaded','1,234 documents loaded'],['reportedIssue','1 issue reported','1,234 issues reported'],['byte','1 byte','1,234 bytes'],['representedElement','1 element represented','1,234 elements represented'],['capturedResult','1 result in captured code','1,234 results in captured code']]){assert.equal(f(1,noun,'en'),one);assert.equal(f(1234,noun,'en'),many)}
 assert.equal(f(1,'reportedIssue','fr'),'1 problème signalé');assert.equal(f(1234,'byte','fr'),'1 234 octets')
})
