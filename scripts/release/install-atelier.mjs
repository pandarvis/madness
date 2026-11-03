import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir, readdir, lstat, realpath } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile), root = resolve(fileURLToPath(new URL('../../', import.meta.url)))
const installed = 'C:/Users/UP60066553/AppData/Local/Programs/Madness'
const profile = 'C:/Users/UP60066553/AppData/Roaming/Madness'
const output = join(root, '_bmad-output/initiative-madness/ux-madness/qualification-logo-installation')
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
await mkdir(output, { recursive: true })
async function closed() {
  const { stdout } = await run('tasklist.exe', ['/FO', 'CSV'], { timeout: 15000 })
  assert.equal(stdout.split(/\r?\n/).some(line => /^"Madness\.exe",/i.test(line)), false, 'MADNESS_MUST_BE_CLOSED')
}
async function entries(path, relative = '') {
  let stat
  try { stat = await lstat(path) } catch (error) { if (error.code === 'ENOENT') return [{ path: relative, absent: true }]; throw error }
  assert.equal(stat.isSymbolicLink(), false, 'PROFILE_LINK_REFUSED')
  if (stat.isFile()) return [{ path: relative, bytes: stat.size, sha256: sha(await readFile(path)) }]
  assert.equal(stat.isDirectory(), true)
  return (await Promise.all((await readdir(path)).sort().map(name => entries(join(path, name), relative ? relative + '/' + name : name)))).flat()
}
async function fingerprint() {
  const names = ['appearance-v1.json', 'madness-state-v1.json', 'codex-owned-run-v1.json', 'bmad-help-owned-v1.json', 'approvals-v1', 'questions-v1', 'workflows-v1', 'codex-connection-v1', 'bmad-help-v1', 'bmad-help-runs-v1', 'test-project-archives']
  return (await Promise.all(names.map(name => entries(join(profile, name), name)))).flat()
}
await closed()
assert.equal((await realpath(installed)).replaceAll('\\', '/').toLowerCase(), installed.toLowerCase())
const stage = process.argv[2]
if (stage === 'before') {
  const baseline = { installed, profile, createdAt: new Date().toISOString(), asarBefore: sha(await readFile(join(installed, 'resources/app.asar'))), entries: await fingerprint() }
  await writeFile(join(output, 'before.json'), JSON.stringify(baseline, null, 2) + '\n')
  console.log(JSON.stringify({ stage, entries: baseline.entries.length, asarBefore: baseline.asarBefore }))
} else if (stage === 'install') {
  const before = JSON.parse(await readFile(join(output, 'before.json'), 'utf8'))
  assert.deepEqual(await fingerprint(), before.entries, 'PROFILE_CHANGED_SINCE_BASELINE')
  const directory = resolve(root, process.argv.find(arg => arg.startsWith('--directory='))?.slice(12) ?? 'dist/atelier-logo-final')
  const manifest = JSON.parse(await readFile(join(directory, 'release-manifest.json'), 'utf8'))
  for (const item of manifest.artifacts) assert.equal(sha(await readFile(join(directory, item.path))), item.sha256, 'CANDIDATE_CHANGED')
  const installer = join(directory, 'Madness-0.2.1-x64-setup.exe')
  await run(installer, ['/S', '/currentuser', '/D=' + installed.replaceAll('/', '\\')], { timeout: 180000 })
  await closed()
  const asar = manifest.artifacts.find(item => item.path === 'win-unpacked/resources/app.asar')
  assert.equal(sha(await readFile(join(installed, 'resources/app.asar'))), asar.sha256, 'INSTALLED_ASAR_MISMATCH')
  assert.equal(sha(await readFile(join(installed, 'resources/madness.ico'))), sha(await readFile(join(root, 'resources/branding/madness.ico'))), 'INSTALLED_ICON_MISMATCH')
  assert.deepEqual(await fingerprint(), before.entries, 'PROFILE_CHANGED_DURING_INSTALL')
  const receipt = { status: 'passed', installed, profile, criticalEntriesIdentical: before.entries.length, asar: asar.sha256, installerSha256: sha(await readFile(installer)), iconSha256: sha(await readFile(join(installed, 'resources/madness.ico'))), installerExitCode: 0, appClosed: true, finishedAt: new Date().toISOString(), limits: ['Empreintes seulement : aucun coffre copié.', 'Réouverture personnelle et contrôle de lisibilité du compte séparés.'] }
  await writeFile(join(output, 'installation.json'), JSON.stringify(receipt, null, 2) + '\n')
  console.log(JSON.stringify(receipt))
} else if (stage === 'after-reopen') {
  const before = JSON.parse(await readFile(join(output, 'before.json'), 'utf8'))
  assert.deepEqual(await fingerprint(), before.entries, 'PROFILE_CHANGED_AFTER_REOPEN')
  console.log(JSON.stringify({ status: 'passed', criticalEntriesIdentical: before.entries.length, appClosed: true }))
} else throw Error('STAGE_REQUIRED')
