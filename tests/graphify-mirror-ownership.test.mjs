import test from 'node:test'
import assert from 'node:assert/strict'
import {execFile} from 'node:child_process'
import {lstat, mkdir, mkdtemp, rm} from 'node:fs/promises'
import {realpathSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'
import {promisify} from 'node:util'

const exec = promisify(execFile)
const pwsh = join(process.env.USERPROFILE, '.dotnet/tools/.store/powershell/7.5.4/powershell/7.5.4/tools/net9.0/any/win/pwsh.exe')
const python = resolve('resources/graphify/assembly/runtime/python.exe')
const quote = value => "'" + value.replaceAll("'", "''") + "'"

function frame(entries) {
  const header = Buffer.alloc(12)
  header.write('MADMSRC1')
  header.writeUInt32LE(entries.length, 8)
  return Buffer.concat([header, ...entries.flatMap(([name, content]) => {
    const relative = Buffer.from(name)
    const data = Buffer.from(content)
    const sizes = Buffer.alloc(8)
    sizes.writeUInt32LE(relative.length, 0)
    sizes.writeUInt32LE(data.length, 4)
    return [sizes, relative, data]
  })])
}

async function witness(body, payload = frame([['src/é.py', 'alpha'], ['empty.js', '']])) {
  const root = realpathSync.native(await mkdtemp(join(tmpdir(), 'madness-mirror-')))
  try {
    const folder = join(root, 'task')
    await mkdir(folder)
    const allocated = await lstat(folder, {bigint: true})
    const script = [
      "$ErrorActionPreference = 'Stop'",
      '. ' + quote(resolve('resources/graphify/preflight.ps1')),
      '$folder = ' + quote(folder),
      '$python = ' + quote(python),
      '$payload = [Convert]::FromBase64String(' + quote(payload.toString('base64')) + ')',
      '$volume = [uint32]' + quote(BigInt.asUintN(32, allocated.dev).toString()),
      '$index = [uint64]' + quote(allocated.ino.toString()),
      '$creationTicks = [uint64]' + quote((allocated.birthtimeNs / 100n + 116444736000000000n).toString()),
      'function New-OwnedMirror { [GraphClosedRuntime]::CreateMirror($folder, $volume, $index, $creationTicks) }',
      body,
      'ConvertTo-Json -Compress $observation'
    ].join('\n')
    const {stdout} = await exec(pwsh, ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(script, 'utf16le').toString('base64')], {windowsHide: true, timeout: 20000})
    return JSON.parse(stdout)
  } catch (error) {
    throw new Error(error.stderr || error.message)
  } finally {
    await rm(root, {recursive: true, force: true})
  }
}

test('an ordinary Python reader opens owned bytes while native pins block replacement', async () => {
  const observation = await witness(String.raw`
$mirror = New-OwnedMirror
try {
  $mirror.Materialize($payload)
  $source = Join-Path $mirror.Path 'src/é.py'
  $read = & $python -I -S -B -X utf8 -c 'import sys; print(open(sys.argv[1], "rb").read().hex())' $source
  if ($LASTEXITCODE -ne 0) { throw 'reader failed' }
  $blocked = @()
  foreach ($target in @($folder, $mirror.Path, (Split-Path $source), $source)) {
    try {
      if ([IO.Directory]::Exists($target)) { [IO.Directory]::Move($target, $target + '-renamed') }
      else { [IO.File]::Move($target, $target + '-renamed') }
      $blocked += $false
    } catch [IO.IOException] { $blocked += $true }
  }
  $removed = $mirror.RemoveOwned()
  $observation = @{read = $read; blocked = $blocked; removed = $removed; absent = -not (Test-Path -LiteralPath $mirror.Path)}
} finally { $mirror.Dispose() }
`)
  assert.deepEqual(observation, {
    read: '616c706861',
    blocked: [true, true, true, true],
    removed: {RemovedBytes: 5, RemovedFiles: 2, Complete: true},
    absent: true
  })
})

test('exclusive root creation refuses a preexisting directory and junction', async () => {
  const observation = await witness(String.raw`
$outside = (New-Item -ItemType Directory -Path (Join-Path $folder 'outside')).FullName
[IO.File]::WriteAllText((Join-Path $outside 'witness.txt'), 'foreign')
$path = (New-Item -ItemType Directory -Path (Join-Path $folder 'mirror')).FullName
[IO.File]::WriteAllText((Join-Path $path 'witness.txt'), 'preexisting')
$refused = @()
try { $mirror = New-OwnedMirror; $mirror.Dispose(); $refused += $false } catch [IO.IOException] { $refused += $true }
$original = [IO.File]::ReadAllText((Join-Path $path 'witness.txt'))
[IO.File]::Delete((Join-Path $path 'witness.txt'))
[IO.Directory]::Delete($path)
$null = New-Item -ItemType Junction -Path $path -Target $outside
try { $mirror = New-OwnedMirror; $mirror.Dispose(); $refused += $false } catch [IO.IOException] { $refused += $true }
$observation = @{refused = $refused; original = $original; outside = [IO.File]::ReadAllText((Join-Path $outside 'witness.txt'))}
`)
  assert.deepEqual(observation, {refused: [true, true], original: 'preexisting', outside: 'foreign'})
})

test('a partial materialization removes owned bytes and keeps the colliding leaf', async () => {
  const observation = await witness(String.raw`
$mirror = New-OwnedMirror
try {
  $foreign = Join-Path $mirror.Path 'occupied.js'
  [IO.File]::WriteAllText($foreign, 'foreign')
  $refused = $false
  try { $mirror.Materialize($payload) } catch [IO.IOException] { $refused = $true }
  $removed = $mirror.RemoveOwned()
  $observation = @{refused = $refused; removed = $removed; ownedAbsent = -not (Test-Path (Join-Path $mirror.Path 'owned.js')); foreign = [IO.File]::ReadAllText($foreign)}
} finally { $mirror.Dispose() }
`, frame([['owned.js', 'owned'], ['occupied.js', 'new']]))
  assert.deepEqual(observation, {
    refused: true,
    removed: {RemovedBytes: 5, RemovedFiles: 1, Complete: false},
    ownedAbsent: true,
    foreign: 'foreign'
  })
})

test('disposing without stop proof keeps the entire owned copy', async () => {
  const observation = await witness(String.raw`
$mirror = New-OwnedMirror
try { $mirror.Materialize($payload) } finally { $mirror.Dispose() }
$observation = @{source = [IO.File]::ReadAllText((Join-Path $mirror.Path 'src/é.py')); empty = (Get-Item (Join-Path $mirror.Path 'empty.js')).Length}
`)
  assert.deepEqual(observation, {source: 'alpha', empty: 0})
})

test('malformed frames and ambiguous components are refused before any leaf is created', async () => {
  const invalid = [
    frame([['../outside.js', 'bad']]),
    frame([['C:/outside.js', 'bad']]),
    frame([['a\\b.js', 'bad']]),
    frame([['COM¹.js', 'bad']]),
    frame([['a./b.js', 'bad']]),
    frame([['a.js', 'one'], ['A.JS', 'two']]),
    Buffer.concat([frame([['a.js', 'one']]), Buffer.from([0])])
  ]
  for (const payload of invalid) {
    const observation = await witness(String.raw`
$mirror = New-OwnedMirror
try {
  $refused = $false
  try { $mirror.Materialize($payload) } catch [IO.IOException] { $refused = $true }
  $observation = @{refused = $refused; removed = $mirror.RemoveOwned()}
} finally { $mirror.Dispose() }
`, payload)
    assert.deepEqual(observation, {refused: true, removed: {RemovedBytes: 0, RemovedFiles: 0, Complete: true}})
  }
})


test('a sharing refusal preserves the open file and reports only other removed bytes', async () => {
  const observation = await witness(String.raw`
$mirror = New-OwnedMirror
try {
  $mirror.Materialize($payload)
  $source = Join-Path $mirror.Path 'src/é.py'
  $reader = [IO.File]::Open($source, 'Open', 'Read', 'Read')
  try { $removed = $mirror.RemoveOwned() } finally { $reader.Dispose() }
  $observation = @{removed = $removed; retained = [IO.File]::ReadAllText($source); emptyAbsent = -not (Test-Path (Join-Path $mirror.Path 'empty.js'))}
} finally { $mirror.Dispose() }
`)
  assert.deepEqual(observation, {
    removed: {RemovedBytes: 0, RemovedFiles: 1, Complete: false},
    retained: 'alpha',
    emptyAbsent: true
  })
})


test('a task directory swapped after allocation cannot receive a mirror', async () => {
  const observation = await witness(String.raw`
$native = Join-Path $folder 'graph-11111111-1111-1111-1111-111111111111'
$allocation = [GraphClosedRuntime]::AllocateGraphTask($native)
$collisionRefused = $false
try { $null = [GraphClosedRuntime]::AllocateGraphTask($native) } catch [IO.IOException] { $collisionRefused = $true }
$mirror = [GraphClosedRuntime]::CreateMirror($native, $allocation.Volume, $allocation.Index, $allocation.CreationTicks)
try { $nominal = $mirror.RemoveOwned().Complete } finally { $mirror.Dispose() }
$allocated = $native + '-allocated'
[IO.Directory]::Move($native, $allocated)
$null = [IO.Directory]::CreateDirectory($native)
$witness = Join-Path $native 'witness.txt'
[IO.File]::WriteAllText($witness, 'replacement')
$refused = $false
try {
  $mirror = [GraphClosedRuntime]::CreateMirror($native, $allocation.Volume, $allocation.Index, $allocation.CreationTicks)
  $mirror.Dispose()
} catch [IO.IOException] { $refused = $true }
$observation = @{
  collisionRefused = $collisionRefused
  nominal = $nominal
  refused = $refused
  replacement = [IO.File]::ReadAllText($witness)
  originalAbsent = -not (Test-Path -LiteralPath (Join-Path $allocated 'mirror'))
  replacementAbsent = -not (Test-Path -LiteralPath (Join-Path $native 'mirror'))
}
`)
  assert.deepEqual(observation, {
    refused: true,
    collisionRefused: true,
    nominal: true,
    replacement: 'replacement',
    originalAbsent: true,
    replacementAbsent: true
  })
})
