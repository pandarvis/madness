// Run with node. The child runs installed Electron 45, without BrowserWindow.
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')
const resultPath = path.join(__dirname, 'electron-results.json')

if (!process.versions.electron) {
  const { spawn } = require('node:child_process')
  const root = path.resolve(__dirname)
  const owned = fs.mkdtempSync(path.join(root, '.electron-owned-'))
  const resolved = fs.realpathSync(owned)
  assert.equal(path.dirname(resolved).toLowerCase(), fs.realpathSync(root).toLowerCase())
  assert.ok(path.basename(resolved).startsWith('.electron-owned-'))
  // Isolate native startup too, before the child can execute app.setPath().
  const names = ['PATH', 'SYSTEMROOT', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'USERPROFILE', 'HOMEDRIVE', 'HOMEPATH']
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([name]) => names.includes(name.toUpperCase()))), MADNESS_CACHE_SPIKE_PROFILE: owned, APPDATA: path.join(owned, 'appdata'), LOCALAPPDATA: path.join(owned, 'localappdata') }
  const child = spawn(require('electron'), [__filename], { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let stdout = '', stderr = '', timedOut = false
  child.stdout.on('data', value => { stdout += value })
  child.stderr.on('data', value => { stderr += value })
  const timeout = setTimeout(() => { timedOut = true; child.kill() }, 45_000)
  child.on('exit', code => {
    clearTimeout(timeout)
    let result
    try { result = JSON.parse(fs.readFileSync(path.join(owned, 'result.json'), 'utf8')) }
    catch { result = { status: 'limited', reason: timedOut ? 'runtime-timeout' : 'runtime-no-result', childExitCode: code } }
    // Native diagnostics contain no personal requests: only the dedicated local runtime.
    fs.writeFileSync(path.join(__dirname, 'electron-command.log'), `command: node electron-http-cache.cjs\nexit: ${code}\nstdout:\n${stdout}\nstderr:\n${stderr}`)
    fs.rmSync(resolved, { recursive: true, force: true })
    result.profile = { ownership: 'mkdtemp-under-qualification-folder', cleaned: !fs.existsSync(resolved) }
    result.childExitCode = code
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2) + '\n')
    console.log(JSON.stringify(result, null, 2))
    process.exitCode = code === 0 && result.status === 'measured' && result.profile.cleaned ? 0 : 1
  })
} else {
  const { app, session, BrowserWindow } = require('electron')
  const { createServer } = require('node:http')
  const profile = process.env.MADNESS_CACHE_SPIKE_PROFILE
  if (!profile || path.dirname(path.resolve(profile)).toLowerCase() !== path.resolve(__dirname).toLowerCase() || !path.basename(profile).startsWith('.electron-owned-')) throw Error('UNOWNED_PROFILE')
  app.setPath('userData', profile)
  app.setPath('sessionData', profile)
  app.setPath('crashDumps', path.join(profile, 'crashes'))
  app.disableHardwareAcceleration()
  app.commandLine.appendSwitch('disable-background-networking')
  let server
  app.whenReady().then(async () => {
    const isolated = session.fromPartition('cache-spike-' + path.basename(profile), { cache: true })
    let denied = 0
    isolated.webRequest.onBeforeRequest((details, callback) => {
      const url = new URL(details.url)
      const allowed = url.protocol === 'http:' && url.hostname === '127.0.0.1'
      if (!allowed) denied++
      callback({ cancel: !allowed })
    })
    const counts = { default: 0, 'no-store': 0, reload: 0 }
    server = createServer((request, response) => {
      const mode = request.url.slice(1)
      assert.ok(Object.hasOwn(counts, mode))
      counts[mode]++
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600', 'Connection': 'close' })
      response.end(JSON.stringify({ marker: 'loopback-only', mode, originCount: counts[mode] }))
    })
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    const base = `http://127.0.0.1:${server.address().port}`
    const rows = []
    for (const mode of Object.keys(counts)) {
      const observations = []
      for (let i = 0; i < 2; i++) {
        const value = await isolated.fetch(base + '/' + mode, { method: 'GET', cache: mode, credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(5000) })
        assert.equal(value.status, 200)
        observations.push((await value.json()).originCount)
      }
      rows.push({ mode, freshOriginRequests: counts[mode], freshBodyOriginCounts: observations })
    }
    await new Promise(resolve => server.close(resolve))
    for (const row of rows) {
      try {
        const value = await isolated.fetch(base + '/' + row.mode, { method: 'GET', cache: row.mode, credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(5000) })
        row.serverStopped = { status: value.status, bodyOriginCount: (await value.json()).originCount }
      } catch { row.serverStopped = { status: 'network-error' } }
    }
    assert.deepEqual(rows.map(row => row.freshOriginRequests), [1, 2, 2])
    assert.deepEqual(rows.map(row => row.serverStopped.status), [200, 'network-error', 'network-error'])
    assert.equal(BrowserWindow.getAllWindows().length, 0)
    const result = { status: 'measured', versions: { electron: process.versions.electron, chromium: process.versions.chrome, node: process.versions.node }, fixture: { address: '127.0.0.1', responseCacheControl: 'public, max-age=600', externalEndpoints: 0 }, rows, blockedExternalRequests: denied, windowsCreated: BrowserWindow.getAllWindows().length, originClaimScope: 'loopback-runtime-only-no-live-OpenAI-claim' }
    fs.writeFileSync(path.join(profile, 'result.json'), JSON.stringify(result, null, 2))
    await isolated.clearCache(); await isolated.closeAllConnections()
    app.exit(0)
  }).catch(error => {
    server?.closeAllConnections(); server?.close()
    fs.writeFileSync(path.join(profile, 'result.json'), JSON.stringify({ status: 'limited', reason: error.code ?? error.name, message: error.message }))
    app.exit(1)
  })
}
