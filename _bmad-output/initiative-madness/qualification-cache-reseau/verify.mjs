import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { resolve, join } from 'node:path'
const folder = fileURLToPath(new URL('./', import.meta.url))
const repository = resolve(folder, '../../..')
const baseline = 'e2d9367176a93862b9a108fcef16715ff2675a66'
const result = JSON.parse(readFileSync(join(folder, 'results.json')))
const checks = []
const log = []
for (const entry of result.inputs) {
  const actual = createHash('sha256').update(readFileSync(join(repository, entry.path))).digest('hex')
  checks.push({ name: 'input-sha256', path: entry.path, passed: actual === entry.sha256 })
}
for (const args of [
  ['diff', '--name-only', baseline, '--', 'src', 'tests', 'scripts', 'package.json', 'package-lock.json', 'resources'],
  ['status', '--short', '--', 'src', 'tests', 'scripts', 'package.json', 'package-lock.json', 'resources']
]) {
  const run = spawnSync('git', args, { cwd: repository, encoding: 'utf8', windowsHide: true })
  checks.push({ name: 'protected-product-unchanged', command: ['git', ...args].join(' '), passed: run.status === 0 && run.stdout.trim() === '' })
  log.push(`$ git ${args.join(' ')}\nexit=${run.status}\n${run.stdout}${run.stderr}`)
}
const owned = readdirSync(folder, { withFileTypes: true }).filter(entry => entry.isDirectory() && entry.name.startsWith('.electron-owned-'))
checks.push({ name: 'owned-profiles-removed', passed: owned.length === 0 })
const electron = JSON.parse(readFileSync(join(folder, 'electron-results.json')))
checks.push({ name: 'electron-native-local-evidence', passed: electron.status === 'measured' && electron.childExitCode === 0 && electron.profile.cleaned && electron.windowsCreated === 0 && electron.fixture.externalEndpoints === 0 })
checks.push({ name: 'scenario-evidence', passed: result.total === 18 && result.passed === 18 && result.cases.every(entry => entry.status === 'passed') })
// The folder includes reviewer-owned reports; check only implementation artifacts.
const ownedFiles = ['prototype.mjs', 'scenarios.test.mjs', 'electron-http-cache.cjs', 'sources.md', 'rapport.md', 'matrix-audit.md', 'verify.mjs', 'results.json', 'electron-results.json']
for (const name of ownedFiles) {
  const run = spawnSync('git', ['-c', 'core.safecrlf=false', 'diff', '--no-index', '--check', '--', 'NUL', join(folder, name)], { cwd: repository, encoding: 'utf8', windowsHide: true })
  // --no-index returns 1 for the expected added-file difference; --check emits
  // diagnostics for whitespace errors. Do not mistake a nonempty new file for one.
  checks.push({ name: 'whitespace', path: name, passed: (run.status === 0 || run.status === 1) && run.stdout.trim() === '' && run.stderr.trim() === '' })
  log.push(`$ git diff --no-index --check NUL ${name}\nexit=${run.status}\n${run.stdout}${run.stderr}`)
}
const report = { baseline, scope: 'implementation-artifacts-and-tracked-product-no-personal-profile-inspection', checks, passed: checks.every(check => check.passed) }
writeFileSync(join(folder, 'verification.json'), JSON.stringify(report, null, 2) + '\n')
writeFileSync(join(folder, 'verification.log'), log.join('\n'))
console.log(JSON.stringify({ passed: report.passed, checks: checks.length, scenarioTests: 16, scenarioObservations: result.total, productDiff: 'see-verification.json' }))
if (!report.passed) process.exitCode = 1
