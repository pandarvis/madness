import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile, readdir, lstat, realpath } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const directory = dirname(fileURLToPath(import.meta.url)), root = resolve(directory, '../../../../..')
const hash = async path => { const h = createHash('sha256'); for await (const chunk of createReadStream(path)) h.update(chunk); return h.digest('hex') }
const readJson = async path => JSON.parse(await readFile(path, 'utf8'))
const buildFiles = ['package.json', 'package-lock.json', 'electron.vite.config.ts', 'electron-builder.yml', 'tsconfig.json', 'tsconfig.node.json', 'tsconfig.web.json', 'resources/THIRD-PARTY-NOTICES.md']
async function sourceFiles(path) {
  const files = []
  for (const entry of await readdir(join(root, path), { withFileTypes: true })) {
    assert.ok(!entry.isSymbolicLink(), 'SOURCE_SYMLINK')
    if (entry.isDirectory()) files.push(...await sourceFiles(path + '/' + entry.name)); else files.push(path + '/' + entry.name)
  }
  return files
}
try {
  assert.ok(process.argv.length <= 3 && (!process.argv[2] || process.argv[2].startsWith('--profile=')), 'ARGUMENTS')
  const profile = await readJson(process.argv[2]?.slice('--profile='.length) || join(directory, 'profile.json'))
  assert.equal(profile.schemaVersion, 1); assert.equal(profile.purpose, 'local-build-prerequisites')
  assert.equal(profile.conclusion.scope, 'implementation-only'); assert.equal(profile.conclusion.canStartStory13, true)
  assert.equal(profile.capabilities.documentaryInvocationAllowed, false); assert.equal(profile.capabilities.currentAccountValidated, false)
  assert.equal(profile.capabilities.distributionQualified, false); assert.equal(profile.capabilities.fullG0, false); assert.equal(profile.capabilities.fullG1, false)
  const nativeRoots = ['codex/node_modules/@openai/codex-win32-x64', 'codex-win32-x64'].map(path => resolve(process.env.APPDATA, 'npm/node_modules/@openai', path))
  assert.ok(nativeRoots.some(path => path.toLowerCase() === resolve(profile.fresh.codex.packageRoot).toLowerCase()), 'NATIVE_ROOT')
  const bases = { repository: root, codexPackage: profile.fresh.codex.packageRoot, codexWrapper: join(process.env.APPDATA, 'npm/node_modules/@openai/codex') }
  const recorded = new Set()
  for (const file of profile.files) {
    assert.ok(Object.hasOwn(bases, file.scope) && typeof file.path === 'string' && /^[a-f0-9]{64}$/.test(file.sha256), 'FILE_SCHEMA')
    assert.ok(!isAbsolute(file.path) && !file.path.includes('\\') && file.path.split('/').every(part => part && part !== '.' && part !== '..'), 'FILE_SCOPE')
    const target = resolve(bases[file.scope], file.path), distance = relative(bases[file.scope], target)
    assert.ok(distance && !isAbsolute(distance) && !distance.startsWith('..'), 'FILE_SCOPE')
    if (file.scope === 'repository') assert.ok(buildFiles.includes(file.path) || /^(src\/|dist\/(terracotta-pilot|navigation-cleanup|dialogue-pilot|win-unpacked)\/|\.agents\/skills\/bmad-agent-analyst\/|_bmad\/scripts\/|_bmad-output\/initiative-madness\/)/.test(file.path) || /^_bmad\/(config\.toml|custom\/config(\.user)?\.toml)$/.test(file.path), 'FILE_NOT_ALLOWED')
    else assert.ok(file.path === 'package.json' || file.scope === 'codexPackage' && file.path === 'vendor/x86_64-pc-windows-msvc/bin/codex.exe', 'NATIVE_FILE_NOT_ALLOWED')
    const key = file.scope + ':' + file.path; assert.ok(!recorded.has(key), 'DUPLICATE_FILE'); recorded.add(key)
    assert.ok(!(await lstat(target)).isSymbolicLink() && (await realpath(target)).toLowerCase() === target.toLowerCase(), 'FILE_LINK')
    assert.equal(await hash(target), file.sha256, 'FILE_CHANGED: ' + file.path)
  }
  const sources = [...await sourceFiles('src'), ...buildFiles].sort(), digest = createHash('sha256')
  for (const file of sources) { assert.ok(recorded.has('repository:' + file), 'SOURCE_MISSING'); digest.update(file + '\0').update(await readFile(join(root, file))).update('\0') }
  assert.equal(digest.digest('hex'), profile.fresh.buildInputs.digest); assert.equal(sources.length, profile.fresh.buildInputs.fileCount)
  for (const key of ['codexPackage:package.json', 'codexPackage:vendor/x86_64-pc-windows-msvc/bin/codex.exe', 'codexWrapper:package.json']) assert.ok(recorded.has(key), 'NATIVE_INPUT_MISSING')
  const { findNativeExecutable } = await import(pathToFileURL(join(root, 'src/adapters/codex/probe.ts')).href)
  assert.equal(await findNativeExecutable(process.env.APPDATA), profile.fresh.codex.path)
  const { qualifyBmadProfile } = await import(pathToFileURL(join(root, 'src/adapters/bmad/profile.ts')).href)
  const { bmadRuntime, runtimeTreeFingerprint } = await import(pathToFileURL(join(root, 'src/adapters/bmad/runtime.ts')).href)
  assert.equal((await qualifyBmadProfile(root)).fingerprint, profile.fresh.bmad.fingerprint)
  const runtime = await bmadRuntime(root)
  assert.equal(runtime.python, profile.fresh.runtime.python); assert.equal(runtime.uv, profile.fresh.runtime.uv)
  assert.equal(await runtimeTreeFingerprint(dirname(runtime.python)), profile.fresh.runtime.treeFingerprint)
  assert.equal((await readJson(join(bases.codexPackage, 'package.json'))).version, profile.fresh.codex.nativePackageVersion)
  assert.equal((await readJson(join(bases.codexWrapper, 'package.json'))).version, profile.fresh.codex.wrapperVersion)
  assert.equal(profile.fresh.codex.status, 'declared-version-coherent'); assert.equal(profile.fresh.resolvers.status, 'passed')
  assert.equal(profile.fresh.checks.types.exitCode, 0); assert.equal(profile.fresh.checks.targetedTests.passed, 24)
  assert.equal(profile.fresh.checks.targetedTests.failed, 0); assert.equal(profile.fresh.checks.packagedWindows.passed, 5)
  assert.equal(profile.fresh.checks.packagedWindows.cleanup, true)
  assert.equal(profile.fresh.checks.failurePaths.passed, 3); assert.equal(profile.fresh.checks.failurePaths.cleanup, true)
  for (const key of ['terracottaArchiveMatchesHistory', 'preparedArchiveMatchesHistory', 'preparedInstallerMatchesHistory']) assert.equal(profile.fresh.packages[key], true, 'PACKAGE_PROOF')
  assert.equal(profile.fresh.packages.preparedInstalled, false)
  assert.ok(Object.values(profile.executionBoundaries).every(value => value === false), 'EXECUTION_BOUNDARY')
  console.log(JSON.stringify({ status: 'local-profile-current', checkedFiles: profile.files.length, canStartStory13: 'implementation-only', canInvokeDocumentaryWorkflow: false, providerStarted: false }))
} catch (error) {
  console.error(JSON.stringify({ status: 'blocked', canStartStory13: false, reason: String(error.message).split('\n')[0], providerStarted: false }))
  process.exitCode = 1
}
